import pandas as pd
import numpy as np
import itertools
import scipy.stats as stats





class statRankTrend():

    def get_trends(self,data_df,trend_col_name):
        """
        assuming the data is counts and rates that need to be combined in
        weighted ways
        """
        # use all
        cur_trendgroup = self.trendgroup

        if type(data_df) is pd.core.groupby.DataFrameGroupBy:
            # remove the grouping var from trendgroup this roung
            rmv_var = data_df.count().index.name
            cur_trendgroup = [gv for gv in cur_trendgroup if not(gv==rmv_var)]
        else:

            # make it tupe-like so that the loop can work
            data_df = [('',data_df)]


        weight_col_lookup = {t:w for t,w in zip(self.target,self.var_weight_list)}
        rank_res =[]


        for groupby_lev,df in data_df:

            views = itertools.product(self.target,cur_trendgroup)

            for statfeat,rankfeat  in views:

                weightfeat = weight_col_lookup[statfeat]
                # sort values of view[1] by values of view[0]
                # if wcol is NaN, then set wegiths to 1

                # TODO: self.stat
                # if pd.isna(weightfeat):
                #     # if no weighting, take regular mean
                #     mean_df = df.groupby(rankfeat)[statfeat].mean()
                # else:
                #     # if weighting var is specified use that column to weight
                #     mean_df = df.groupby(rankfeat).apply(w_avg,statfeat,weightfeat)

                stat_df = df.groupby(rankfeat).apply(self.my_stat,statfeat,weightfeat)

                # save detailed precompute
                trend_name = '_'.join([self.name , trend_col_name,statfeat,rankfeat])
                self.trend_precompute[trend_name] = stat_df

                # extract for result_df
                ordered_rank_feat = stat_df.sort_values().index.values
                # create row
                rank_res.append([statfeat,rankfeat,ordered_rank_feat,groupby_lev])


        # if groupby add subgroup indicator columns
        if type(data_df) is pd.core.groupby.DataFrameGroupBy:
            reg_df = pd.DataFrame(data = rank_res, columns = ['feat1','feat2',
                                                    trend_col_name,'subgroup'])
            #same for all
            reg_df['group_feat'] = data_df.count().index.name
        else:
            reg_df = pd.DataFrame(data = rank_res, columns = ['feat1','feat2',trend_col_name,'empty'])
            reg_df.drop('empty',axis=1,inplace=True)


        reg_df['trend_type'] = self.name
        return reg_df

    def get_distance(self,row):
        """
        kendalltau distance can be used for permuation distance
        """

        trend_numeric_map = {val:i for i,val in enumerate(row['agg_trend'])}

        numeric_agg = [trend_numeric_map[val] for val in row['agg_trend']]
        numeric_subgroup = [trend_numeric_map[val] for val in row['subgroup_trend']]

        n_sg = len(numeric_subgroup)
        n_ag = len(numeric_agg)
        if n_sg < n_ag:
            append_nums = list(range(n_sg,n_ag))
            numeric_subgroup.extend(append_nums)

        tau,p = stats.kendalltau(numeric_agg,numeric_subgroup)
        tau_dist = np.round(1- tau,2)
        return tau_dist
