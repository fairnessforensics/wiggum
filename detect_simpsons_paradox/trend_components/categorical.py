import pandas as pd
import numpy as np
import itertools
import scipy.stats as stats





class statRankTrend():

    def get_trends(self,data_df,trend_col_name):
        """
        Compute a trend that is the ranking of categorical variables


        Parameters
        ----------
        data_df : DataFrame or DataFrameGroupBy
            data to compute trends on, may be a whole, unmodified DataFrame or
        a grouped DataFrame as passed by labeledDataFrame get trend functions
        trend_col_name : {'subgroup_trend','agg_trend'}
            which type of trend is to be computed
            TODO: could infer this by type of above?


        Required properties
        --------------------
        name : string
            used in the trend_type column of result_df and by viz
        my_stat : function handle
            statistic to compute, must be compatible with DataFrame.apply and
            have the interface (self,df,statfeat,weightfeat)
        trendgroup : list of strings
            list of variable names to be ranked (and used for grouping in this
            method)
        target : list of strings
            list of variable names to compute a statistic of in order to rank
            the above
        var_weight_list : list of strings or NaNs
            list of variables to weight each variable in target, must be same
            length as above or all NaNs

        Returns
        -------
        reg_df : DataFrame
            partial result_df, multiple can be merged together to form
            a complete result_df


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
        kendalltau distance as a permuation distance

        Parameters
        ----------
        row : pd.Series
            row of a result_df DataFrame. the `agg_trend` and `subgroup_trend`
            columns must contain lists

        Returns
        -------
        tau_dist : float
            perumation distance between the subgroup_trend and agg_trend
            compatible with assignment to a cell of a result_df
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
