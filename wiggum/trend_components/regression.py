import pandas as pd
import numpy as np
import itertools
import scipy.stats as stats
from .base_getvars import  w_avg
import warnings

class LinearRegression():
    '''
    '''
    overview_legend = 'continuous'

    def is_computable(self,labeled_df=None):
        """
        check if this trend can be computed based on data and metadata available

        Parameters
        ----------
        self : Trend
            a trend object with a set_vars Parameters
        labeled_df : LabeledDataFrame {None} (optional)
            data to use if trend is not already configured


        Returns
        -------
        computable : bool
            True if requirements of get_trends are filled

        See also:
        get_trends() for description of how this trend computes and
        """
        if not( self.set_vars):
            self.get_trend_vars(labeled_df)

        vart_test_list = [len(self.regression_vars)>=2,
                        bool(self.symmetric_vars),
                    len(self.var_weight_list)==len(self.regression_vars)]

        return np.product([vartest for vartest in vart_test_list])

    def get_trends(self,data_df,trend_col_name):
        """
        Compute a linear regressions and return a partial result_df

        Parameters
        ----------
        data_df : DataFrame or DataFrameGroupBy
            data to compute trends on, may be a whole, unmodified DataFrame or
        a grouped DataFrame as passed by LabeledDataFrame get trend functions
        trend_col_name : {'subgroup_trend','agg_trend'}
            which type of trend is to be computed

        Required properties
        --------------------
        name : string
            used in the trend_type column of result_df and by viz
        regression_vars : list of strings or list of tuples
            variables to compute correlations of
        var_weight_list : list of strings
            variables to use to weight each regression_vars
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


            # zip vars and weights together
            w_reg_vars = list( zip(self.regression_vars,  self.var_weight_list))

            # sort so that vars with no weight are first then after combinations
            #  all with aw not nan will be the ones with two weights
            nasort = {True: lambda v:'000000000',False: lambda v: str(v)}
            w_reg_vars.sort(key=lambda x: nasort[pd.isna(x[1])](x[1]))

            for groupby_lev,df in data_df:
                # expand into all combinations if symmetric
                if self.symmetric_vars:
                    var_pairs = itertools.combinations(w_reg_vars,2)
                else:
                    # else assume list of tuples was passed
                    var_pairs = w_reg_vars

                # var_pairs must be list of tuples or iterator
                for (a,aw),(b,bw) in var_pairs:
                    # compute each slope

                    if np.sum(pd.isna([aw,bw])) == 2:
                        # both weights are NaNs
                        slope, i, r_val, p_val, e = stats.linregress(df[a],df[b])
                    elif aw==bw or (not(pd.isna(bw)) and pd.isna(aw)):
                        # weights are the same or only bw has a weights
                        weights =  np.sqrt(df[bw])
                        i, slope = np.polyfit(df[a],df[b],1, w = df[bw])
                        # compute weighted correlation coefficient
                        r_val = np.average((df[a]-np.average(df[a]))*
                                  (df[b]- np.average(df[b], weights = df[bw])),
                                weights = df[bw])
                    elif np.sum(pd.isna([aw,bw])) == 0:
                        # don't know what to do i this case
                        # both have weights, throw error
                        slope = np.NaN
                        r_val = np.NaN
                        warnings.warn('cannot compute with two different weights')

                    # quality is absolute value of r_val (corelation coefficient)
                    slopes.append([a,b,slope,groupby_lev,np.abs(r_val)])

        #save as df
        if type(data_df) is pd.core.groupby.DataFrameGroupBy:
            reg_df = pd.DataFrame(data = slopes, columns = ['independent','dependent',
                                                trend_col_name,'subgroup',
                                                trend_col_name+'_strength'])
            #same for all
            reg_df['group_feat'] = data_df.count().index.name
        else:
            reg_df = pd.DataFrame(data = slopes, columns = ['independent','dependent',
                                                    trend_col_name,'empty',
                                                    trend_col_name+'_strength'])
            reg_df.drop('empty',axis=1,inplace=True)

        reg_df['trend_type'] = self.name


        return reg_df


    def get_distance(self,row,col_a='subgroup_trend',col_b='agg_trend'):
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
        abs_angle = self.get_distance_unnormalized(row,col_a,col_b)


        # normalize so that right angle is 1 and parallel is 0
        # TODO: fix error if angle is exactly np.pi/2
        right_angle = np.pi/2
        return (abs_angle%right_angle)/right_angle

    def get_distance_unnormalized(self,row,col_a='subgroup_trend',col_b='agg_trend'):
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
        theta_sub = np.arctan(row[col_a])
        theta_all = np.arctan(row[col_b])

        # take difference them and convert to degrees
        return np.abs(theta_all - theta_sub)
