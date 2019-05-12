import pandas as pd
import numpy as np
import itertools
import scipy.stats as stats

class correlationTrend():


    ############################################################################
    # trend computation functions
    ############################################################################

    def get_trends(self,data_df,corr_name):
        """
        return a DataFrame of the linear corelations in a DataFrame or pandas
            groupby

        Parameters
        -----------
        data_df : DataFrame
            tidy data
        regression_vars : list of strings
            column names to use for correlation compuations
        corr_name : string
            title for column of data frame tht will be created
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
            trend_name = '_'.join([self.name , corr_name])
            corr_mat = data_df[self.regression_vars].corr(method=self.corrtype)
            corr_triu = corr_mat.values[triu_indices]

            self.trend_precompute[trend_name] = corr_mat


            # create dataframe with rows, att1 label, attr2 label, correlation
            reg_df = pd.DataFrame(data=[[self.regression_vars[x],self.regression_vars[y],val]
                                        for x,y,val in zip(*triu_feat_indices,corr_triu)],
                        columns = ['feat1','feat2',corr_name])
        else:
            reg_df = pd.DataFrame(columns = ['feat1','feat2',corr_name])

        # if groupby add subgroup indicator columns
        if type(data_df) is pd.core.groupby.DataFrameGroupBy:
            #same for all
            reg_df['group_feat'] = data_df.count().index.name
            # repeat the values each the number of time sfor the size of the triu
            reg_df['subgroup'] = list(data_df.groups.keys())*n_triu_values

        reg_df['trend_type'] = self.name

        return reg_df

    def get_distance(self,row):

        # row['distance'] = 'undef'
        return 'undef'
