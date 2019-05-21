import pandas as pd
import numpy as np
import itertools
import scipy.stats as stats


class linearRegression():

    def get_trends(self,data_df,trend_col_name):
        """
        Compute a linear regressions and return a partial result_df

        Parameters
        ----------
        data_df : DataFrame or DataFrameGroupBy
            data to compute trends on, may be a whole, unmodified DataFrame or
        a grouped DataFrame as passed by labeledDataFrame get trend functions
        trend_col_name : {'subgroup_trend','agg_trend'}
            which type of trend is to be computed

        Required properties
        --------------------
        name : string
            used in the trend_type column of result_df and by viz
        regression_vars : list of strings or list of tuples
            variables to compute correlations of
        symmetric_vars : Boolean
            if True, pairs of variables will be computed with
            itertools.combinations, taking all unique pairs of variables in the
            regression_vars list of strings, if False, regression_vars must be a
            list of tuples and only those pairs will be computed

        Returns
        -------
        reg_df : DataFrame
            partial result_df, multiple can be merged together to form
            a complete result_df
        """
        slopes = []

        # if not empty // empty lists are False
        if self.regression_vars:

            if not(type(data_df) is pd.core.groupby.DataFrameGroupBy):

                # make it tupe-like so that the loop can work
                data_df = [('',data_df)]



            slopes = []

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
                    # quality is absolute value of r_val (corelation coefficient)
                    slopes.append([a,b,slope,groupby_lev,np.abs(r_val)])

        #save as df
        if type(data_df) is pd.core.groupby.DataFrameGroupBy:
            reg_df = pd.DataFrame(data = slopes, columns = ['feat1','feat2',
                                                trend_col_name,'subgroup',
                                                trend_col_name+'_quality'])
            #same for all
            reg_df['group_feat'] = data_df.count().index.name
        else:
            reg_df = pd.DataFrame(data = slopes, columns = ['feat1','feat2',
                                                    trend_col_name,'empty',
                                                    trend_col_name+'_quality'])
            reg_df.drop('empty',axis=1,inplace=True)

        reg_df['trend_type'] = self.name


        return reg_df


    def get_distance(self,row):
        """
        compute angle between the overall and subgroup slopes for a row of a dataframe. This is the angle
        closest to the positive x axis and is always positive valued, to be used as
        a distance.

        Parameters
        ----------
        row : pd.Series
            row of a result_df DataFrame

        Returns
        -------
        angle : float
            angle in degrees between the subgroup_trend and agg_trend, compatible with
            assignment to a cell of a result_df

        """
        # take absolute value, because the two will be in opposite directions
        # relative to the angle of interest
        abs_angle = self.get_distance_unnormalized(row)

        # take difference them and convert to degrees
        return abs_angle/180.0

    def get_distance_unnormalized(self,row):
        """
        compute angle between the overall and subgroup slopes for a row of a dataframe. This is the angle
        closest to the positive x axis and is always positive valued, to be used as
        a distance.

        Parameters
        ----------
        row : pd.Series
            row of a result_df DataFrame

        Returns
        -------
        angle : float
            angle in degrees between the subgroup_trend and agg_trend, compatible with
            assignment to a cell of a result_df

        """
        # take absolute value, because the two will be in opposite directions
        # relative to the angle of interest
        theta_sub = np.arctan(row['subgroup_trend'])
        theta_all = np.arctan(row['agg_trend'])

        # take difference them and convert to degrees
        return np.rad2deg(np.abs(theta_all - theta_sub))
