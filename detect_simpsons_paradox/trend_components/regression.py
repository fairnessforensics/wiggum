import pandas as pd
import numpy as np
import itertools
import scipy.stats as stats


class linearRegression():

    def get_trends(self,data_df,trend_col_name):
        """
        return a DataFrame of the linear trends in a DataFrame or groupby

        Parameters
        -----------
        data_df : DataFrame
            tidy data
        regression_vars : list of strings
            column names to use for slope computations
        trend_col_name : string
            title for column of data frame tht will be created (group or all)
        """
        slopes = []

        # if not empty // empty lists are False
        if self.regression_vars:

            if not(type(data_df) is pd.core.groupby.DataFrameGroupBy):

                # make it tupe-like so that the loop can work
                data_df = [('',data_df)]



            slopes = []
            quality = []

            for groupby_lev,df in data_df:
                # expand into all combinations if symmetric
                if self.symmetric_vars:
                    var_pairs = itertools.combinations(self.regression_vars,2)
                else:
                    # else assume list of tuples was passed
                    var_pairs = self.regression_vars

                # var_pairs must be list of tuples or iterator
                for a,b in var_pairs:
                    # compute each slope
                    slope, i, r_val, p_val, e = stats.linregress(df[a],df[b])
                    slopes.append([a,b,slope,groupby_lev,r_val])

        #save as df
        if type(data_df) is pd.core.groupby.DataFrameGroupBy:
            reg_df = pd.DataFrame(data = slopes, columns = ['feat1','feat2',
                                    trend_col_name,'subgroup',trend_col_name+'quality'])
            #same for all
            reg_df['group_feat'] = data_df.count().index.name
        else:
            reg_df = pd.DataFrame(data = slopes, columns = ['feat1','feat2',
                                        trend_col_name,'empty',trend_col_name+'quality'])
            reg_df.drop('empty',axis=1,inplace=True)

        reg_df['trend_type'] = self.name


        return reg_df


    def get_distance(self,row):
        """
        compute angle between the overall ('all_slope') and subgroup
        ('subgroup_slope') slopes for a row of a dataframe. This is the angle
        closest to the positive x axis and is always positive valued, to be used as
        a distance.

        Parameters
        ----------
        row : row of DataFrame
            row of result_df
        """
        # take absolute value, because the two will be in opposite directions
        # relative to the angle of interest
        theta_sub = np.arctan(row['subgroup_trend'])
        theta_all = np.arctan(row['agg_trend'])
        # theta_sub = np.abs(np.arctan(row['subgroup_slope']))
        # theta_all = np.abs(np.arctan(row['all_slope']))

        # add them and convert to degrees
        # row['distance'] = np.rad2deg(np.abs(theta_all - theta_sub))
        # return row['distance']
        return np.rad2deg(np.abs(theta_all - theta_sub))
