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
        this requires that the regression vars be a list of tuple or list of
        length at least 2.

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

        regssion_vars_tuple = type(self.regression_vars[0]) ==tuple
        regression_vars_len = len(self.regression_vars)>=2
        vart_test_list = [regssion_vars_tuple or regression_vars_len,
                    len(self.var_weight_list)==len(self.regression_vars)]

        return np.product([vartest for vartest in vart_test_list])

    def get_trends(self,data_df,trend_col_name, version='None'):
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



            # expand into all combinations if symmetric
            if not(type(self.regression_vars[0])== tuple):
                # zip vars and weights together before pairing
                w_reg_vars = list( zip(self.regression_vars,  self.var_weight_list))
                # sort so that vars with no weight are first then after combinations
                #  all with aw not nan will be the ones with two weights
                nasort = {True: lambda v:'000000000',False: lambda v: str(v)}
                w_reg_vars.sort(key=lambda x: nasort[pd.isna(x[1])](x[1]))
                # convert iterator into list of tuples so that it can be reused
                # within the loop below
                var_pairs = [(a,b) for a,b in itertools.combinations(w_reg_vars,2)]

            else:
                # else assume lists of tuples were passed and reshuffle
                var_pairs =  [((i,iw),(d,dw)) for (i,d),(iw,dw) in
                            zip(self.regression_vars,  self.var_weight_list)]




            for groupby_lev,df in data_df:


                # var_pairs must be list of tuples or iterator
                for (i,iw),(d,dw) in var_pairs:
                    # compute each slope


                    if np.sum(pd.isna([iw,dw])) == 2:
                        # both weights are NaNs
                        slope, b, r_val, p_val, e = stats.linregress(df[i],df[d])
                    elif iw==dw or (not(pd.isna(dw)) and pd.isna(iw)):
                        # weights are the same or only dependent has weights
                        weights =  np.sqrt(df[dw])
                        b, slope = np.polyfit(df[i],df[d],1, w = df[dw])
                        # compute weighted correlation coefficient
                        r_val = np.average((df[i]-np.average(df[i]))*
                                  (df[d]- np.average(df[d], weights = df[dw])),
                                weights = df[dw])
                    elif np.sum(pd.isna([iw,dw])) == 0:
                        # don't know what to do i this case
                        # both have weights, throw error
                        b = np.NaN
                        slope = np.NaN
                        r_val = np.NaN
                        warnings.warn('cannot compute with two different weights')
                    else:
                        # don't know what to do i this case
                        # both have weights, throw error
                        b = np.NaN
                        slope = np.NaN
                        r_val = np.NaN
                        warnings.warn('cannot compute')

                    # quality is absolute value of r_val (corelation coefficient)
                    slopes.append([i,d,slope,groupby_lev,np.abs(r_val)])
                    # save
                    trend_name = '_'.join([self.name , trend_col_name,
                                                        str(groupby_lev),i,d])
                    pc_df = pd.DataFrame(data = [[b,slope,r_val]],
                                    columns = ['intercept','slop','r^2'])
                    self.trend_precompute[trend_name] = pc_df

        #save as df
        if type(data_df) is pd.core.groupby.DataFrameGroupBy:
            reg_df = pd.DataFrame(data = slopes, columns = ['independent','dependent',
                                                trend_col_name,'subgroup',
                                                trend_col_name+'_strength'])
            #same for all
            reg_df['splitby'] = data_df.count().index.name
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
