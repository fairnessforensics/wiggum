import pandas as pd
import numpy as np
import itertools
import scipy.stats as stats


class statBinRankTrend():
    """
    Compute a trend that determines between alphabetically ordered values of a
    two-valued categorical variable are > or < when ordered by a statistic of
    another variable
    quality based on the ratio and the distance is 0/1 loss

    """
    def get_trends(self,data_df,trend_col_name):
        """
        Compute a trend between a binary ranking variable


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

                stat_df = df.groupby(rankfeat).apply(self.my_stat,statfeat,weightfeat)
                stat_df.sort_values(inplace=True)

                # stat_order = stat_df.index.values
                alpha1 = stat_df.sort_index().index.values[0]
                alpha2 = stat_df.sort_index().index.values[1]

                sign_map = {True:'<',False:'>'}

                comparison_sign = sign_map[stat_df[alpha1] < stat_df[alpha2]]

                # save detailed precompute
                trend_name = '_'.join([self.name , trend_col_name,statfeat,rankfeat])
                self.trend_precompute[trend_name] = stat_df



                # quality is ratio
                ratio_qual = stat_df[0]/stat_df[1]
                # create row
                rank_res.append([statfeat,rankfeat,comparison_sign,ratio_qual,
                                        groupby_lev])


        # if groupby add subgroup indicator columns
        if type(data_df) is pd.core.groupby.DataFrameGroupBy:
            reg_df = pd.DataFrame(data = rank_res, columns = ['feat1','feat2',
                                                    trend_col_name,
                                                    trend_col_name +'_quality',
                                                    'subgroup'])
            #same for all
            reg_df['group_feat'] = data_df.count().index.name
        else:
            reg_df = pd.DataFrame(data = rank_res, columns = ['feat1','feat2',
                                                    trend_col_name,
                                                    trend_col_name +'_quality',
                                                    'empty'])
            reg_df.drop('empty',axis=1,inplace=True)


        reg_df['trend_type'] = self.name
        return reg_df

    def get_distance(self,row):
        """
        0/1 loss on ><

        Parameters
        ----------
        row : pd.Series
            row of a result_df DataFrame. the `agg_trend` and `subgroup_trend`
            columns must contain lists

        Returns
        -------
        0_1_loss : float
            0/1 loss distance between the subgroup_trend and agg_trend
            compatible with assignment to a cell of a result_df
        """

        # if they're the same, int(True) =1, but dist =0
        # if they're not, int(False) = 0 bust dist =1
        return 1- int(row['agg_trend'] == row['subgroup_trend'])



class statRankTrend():
    """
    Compute a trend that is the ascending ranking of categorical variables,
    quality based on the trend vs actual kendall tau distance and the distance
    in subgroup vs aggregtae is 1-tau

    """

    def get_trends(self,data_df,trend_col_name):
        """
        Compute a trend that is the ascending ranking of categorical variables


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

                stat_df = df.groupby(rankfeat).apply(self.my_stat,statfeat,weightfeat)
                stat_df.sort_values(inplace=True)

                # save detailed precompute
                trend_name = '_'.join([self.name , trend_col_name,statfeat,rankfeat])
                self.trend_precompute[trend_name] = stat_df

                # extract for result_df
                ordered_rank_feat = stat_df.index.values

                # quality is kendall tau distance between the data and a list
                # of that length sorted accordingn to the trend
                # this calculation is VERY slow for large weights, need to fix

                # sort the whole data by statfeat, extract rankfeat
                actual_order = df.sort_values(statfeat)[rankfeat]

                # get counts/weight total statfeat per rankfeat level
                # print(statfeat,rankfeat,weightfeat)
                if pd.isna(weightfeat):
                    # TODO: make this case faster for large datasets later
                    counts = df.groupby([rankfeat])[statfeat].count()
                else:
                    counts = df.groupby([rankfeat])[weightfeat].sum()
                    act_reps = [int(w) for w in df[weightfeat]]

                    # TODO: fix if num samples is above 10k
                    if np.sum(counts)> 10000:
                        tot = np.sum(counts)
                        n_min = len(actual_order)
                        # cut down to speed up
                        # TODO: try a different scaling and scale act as well
                        scaled =  [np.int(np.round(w/tot*n_min)) for w in counts]

                        # check if rounding error and increase last if nonzero
                        round_error_n = n_min-sum(scaled)

                        if round_error_n > 0:
                            scaled[-1] = scaled[-1] + round_error_n
                        elif round_error_n < 0 :
                            # cannot make scaled <0
                            i = -1
                            while round_error_n < 0:
                                cur_adjust = min(np.abs(round_error_n),scaled[i])
                                scaled[i] = scaled[i] - cur_adjust
                                round_error_n += cur_adjust
                                i -=1

                        # make series for compatibility
                        counts = pd.Series(scaled,index = counts.index)
                        act_reps = [1]*n_min

                    # also rep the actual_order
                    actual_order = np.repeat(actual_order,act_reps)

                # TODO: make weights not required to be integers
                #repeat the trend sorted rankfeats by the number that were used
                # in the stat
                rep_counts = [int(counts[ov]) for ov in ordered_rank_feat]
                trend_order = np.repeat(ordered_rank_feat,rep_counts)

                # map the possibly string order lists into numbers
                numeric_map = {a:i for i,a in enumerate(actual_order)}
                num_acutal = [numeric_map[a] for a in actual_order]
                num_trend = [numeric_map[b] for b in trend_order]
                # compute and round
                tau,p = stats.kendalltau(num_trend,num_acutal)
                tau_qual = np.abs(np.round(tau,4))
                # create row
                rank_res.append([statfeat,rankfeat,ordered_rank_feat,tau_qual,
                                        groupby_lev])


        # if groupby add subgroup indicator columns
        if type(data_df) is pd.core.groupby.DataFrameGroupBy:
            reg_df = pd.DataFrame(data = rank_res, columns = ['feat1','feat2',
                                                    trend_col_name,
                                                    trend_col_name +'_quality',
                                                    'subgroup'])
            #same for all
            reg_df['group_feat'] = data_df.count().index.name
        else:
            reg_df = pd.DataFrame(data = rank_res, columns = ['feat1','feat2',
                                                    trend_col_name,
                                                    trend_col_name +'_quality',
                                                    'empty'])
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
