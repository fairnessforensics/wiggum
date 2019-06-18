import pandas as pd
import numpy as np
import itertools
import scipy.stats as stats


class CorrelationSignTrend():


    ############################################################################
    # Trend computation functions
    ############################################################################

    def get_Trends(self,data_df,Trend_col_name):
        """
        Compute a Trend, its quality and return a partial result_df

        Parameters
        ----------
        data_df : DataFrame or DataFrameGroupBy
            data to compute Trends on, may be a whole, unmodified DataFrame or
        a grouped DataFrame as passed by LabeledDataFrame get Trend functions
        Trend_col_name : {'subgroup_Trend','agg_Trend'}
            which type of Trend is to be computed

        Required properties
        --------------------
        name : string
            used in the Trend_type column of result_df and by viz
        regression_vars : list of strings
            variables to compute correlations of
        corrtype : string {'pearson','spearman','kendall'}
            correlation type to be passed to DataFrame.corr(method=corrtype)


        Returns
        -------
        reg_df : DataFrame
            partial result_df, multiple can be merged together to form
            a complete result_df
        """

        # get locations of upper right triangle of a correlation matrix for this
        # many values
        num_vars = len(self.regression_vars)
        triu_indices_0 = np.triu_indices(num_vars,k=1)

        if num_vars > 0:

            if type(data_df) is pd.core.groupby.DataFrameGroupBy:

                # append for all groups if groupby instead of single DataFrame
                # construct a list of the upper triangle of the submatrices per group
                num_groups = len(data_df.groups)
                # need to increment this many values
                n_triu_values = len(triu_indices_0[0])
                # the incides are stored, row, colum, only the rows get incremented
                # increment by [0, num_vars, numvars*2, ...]
                increments_r = [i*num_vars for i in range(num_groups)]*(n_triu_values)
                # ad the increment amounts to the row values, keep the col values
                triu_indices = (increments_r + triu_indices_0[0].repeat(num_groups),
                                                triu_indices_0[1].repeat(num_groups))
                triu_feat_indices = (triu_indices_0[0].repeat(num_groups),
                                                triu_indices_0[1].repeat(num_groups))
            else:
                # if not a groupby then the original is correct, use that
                triu_indices = triu_indices_0
                triu_feat_indices = triu_indices

            # compute correlations, only store vlaues from upper right triangle
            Trend_name = '_'.join([self.name , Trend_col_name])
            corr_mat = data_df[self.regression_vars].corr(method=self.corrtype)
            corr_triu = corr_mat.values[triu_indices]

            # get sign and convert to label
            sign_map = {1:'positive', -1:'negative'}
            sign_labels = [sign_map[np.sign(corr)] for corr in corr_triu]

            self.Trend_precompute[Trend_name] = corr_mat


            # create dataframe with rows, att1 label, attr2 label, correlation
            reg_df = pd.DataFrame(data=[[self.regression_vars[x],
                                        self.regression_vars[y],sign,np.abs(val)]
                                        for x,y,sign,val in zip(*triu_feat_indices,
                                                    sign_labels,corr_triu)],
                        columns = ['feat1','feat2',Trend_col_name,
                                                    Trend_col_name+'_strength'])
                                                # Trend is sign, qual is corr

        else:
            n_triu_values = 0
            reg_df = pd.DataFrame(columns = ['feat1','feat2',Trend_col_name])

        # if groupby add subgroup indicator columns
        if type(data_df) is pd.core.groupby.DataFrameGroupBy:
            #same for all
            reg_df['group_feat'] = data_df.count().index.name
            # repeat the values each the number of time sfor the size of the triu
            reg_df['subgroup'] = list(data_df.groups.keys())*n_triu_values

        reg_df['Trend_type'] = self.name

        return reg_df

    def get_distance(self,row):
        """
        distance between the subgroup and aggregate Trends for a row of a
        result_df  binary 0 for same sign, 1 for opposite sign

        Parameters
        ----------
        row : pd.Series
            row of a result_df DataFrame

        Returns
        -------
        <>_dist : float
            distance between the subgroup_Trend and agg_Trend, compatible with
            assignment to a cell of a result_df
        """
        sg_Trend = row['subgroup_Trend']
        ag_Trend = row['agg_Trend']

        # if they're the same set to False
        binary_distance  = int(not(sg_Trend == ag_Trend))
        return binary_distance




class CorrelationTrend():


    ############################################################################
    # Trend computation functions
    ############################################################################

    def get_Trends(self,data_df,Trend_col_name):
        """
        Compute a Trend, its quality and return a partial result_df

        Parameters
        ----------
        data_df : DataFrame or DataFrameGroupBy
            data to compute Trends on, may be a whole, unmodified DataFrame or
        a grouped DataFrame as passed by LabeledDataFrame get Trend functions
        Trend_col_name : {'subgroup_Trend','agg_Trend'}
            which type of Trend is to be computed

        Required properties
        --------------------
        name : string
            used in the Trend_type column of result_df and by viz
        regression_vars : list of strings
            variables to compute correlations of
        corrtype : string {'pearson','spearman','kendall'}
            correlation type to be passed to DataFrame.corr(method=corrtype)


        Returns
        -------
        reg_df : DataFrame
            partial result_df, multiple can be merged together to form
            a complete result_df
        """

        # get locations of upper right triangle of a correlation matrix for this
        # many values
        num_vars = len(self.regression_vars)
        triu_indices_0 = np.triu_indices(num_vars,k=1)

        if num_vars > 0:

            if type(data_df) is pd.core.groupby.DataFrameGroupBy:

                # append for all groups if groupby instead of single DataFrame
                # construct a list of the upper triangle of the submatrices per group
                num_groups = len(data_df.groups)
                # need to increment this many values
                n_triu_values = len(triu_indices_0[0])
                # the incides are stored, row, colum, only the rows get incremented
                # increment by [0, num_vars, numvars*2, ...]
                increments_r = [i*num_vars for i in range(num_groups)]*(n_triu_values)
                # ad the increment amounts to the row values, keep the col values
                triu_indices = (increments_r + triu_indices_0[0].repeat(num_groups),
                                                triu_indices_0[1].repeat(num_groups))
                triu_feat_indices = (triu_indices_0[0].repeat(num_groups),
                                                triu_indices_0[1].repeat(num_groups))
            else:
                # if not a groupby then the original is correct, use that
                triu_indices = triu_indices_0
                triu_feat_indices = triu_indices

            # compute correlations, only store vlaues from upper right triangle
            Trend_name = '_'.join([self.name , Trend_col_name])
            corr_mat = data_df[self.regression_vars].corr(method=self.corrtype)
            corr_triu = corr_mat.values[triu_indices]

            self.Trend_precompute[Trend_name] = corr_mat


            # create dataframe with rows, att1 label, attr2 label, correlation
            reg_df = pd.DataFrame(data=[[self.regression_vars[x],
                                    self.regression_vars[y],val,np.abs(val)]
                                        for x,y,val in zip(*triu_feat_indices,corr_triu)],
                        columns = ['feat1','feat2',Trend_col_name,Trend_col_name+'_strength'])

            # quality here is the absolute value of the Trend value

        else:
            n_triu_values = 0
            reg_df = pd.DataFrame(columns = ['feat1','feat2',Trend_col_name])

        # if groupby add subgroup indicator columns
        if type(data_df) is pd.core.groupby.DataFrameGroupBy:
            #same for all
            reg_df['group_feat'] = data_df.count().index.name
            # repeat the values each the number of time sfor the size of the triu
            reg_df['subgroup'] = list(data_df.groups.keys())*n_triu_values

        reg_df['Trend_type'] = self.name

        return reg_df

    def get_distance(self,row):
        """
        distance between the subgroup and aggregate Trends for a row of a
        result_df  binary 0 for same sign, 1 for opposite sign

        Parameters
        ----------
        row : pd.Series
            row of a result_df DataFrame

        Returns
        -------
        <>_dist : float
            distance between the subgroup_Trend and agg_Trend, compatible with
            assignment to a cell of a result_df
        """
        sg_Trend = row['subgroup_Trend']
        ag_Trend = row['agg_Trend']

        # if they're the same set to False
        binary_distance  = int(not(np.sign(sg_Trend) == np.sign(ag_Trend)))
        return binary_distance
