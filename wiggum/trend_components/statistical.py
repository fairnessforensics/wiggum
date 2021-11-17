import pandas as pd
import numpy as np
import itertools
import scipy.stats as stats

groupby_name_by_type = {pd.core.groupby.DataFrameGroupBy:lambda df: df.keys,
                                pd.core.frame.DataFrame:lambda df: None}

class CorrelationBase():
    overview_legend = 'binary'

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

        regssion_vars_tuple = type(self.regression_vars[0]) ==tuple
        regression_vars_len = len(self.regression_vars)>2
        vart_test_list = [regssion_vars_tuple or regression_vars_len,
                        bool(self.corrtype)]

        return np.product([vartest for vartest in vart_test_list])

    def compute_correlation_table(self,data_df,trend_col_name):
        '''
        common code for computing correlations for any correlation based trend


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
        regression_vars : list of strings
            variables to compute correlations of
        corrtype : string {'pearson','spearman','kendall'}
            correlation type to be passed to DataFrame.corr(method=corrtype)


        Returns
        -------
        corr_data : list of tuples
            the tuples are of (independednt variable name, dependent variable name,
            correlation, grouping variable)
        '''
        # recover a single list from the independent and dependent vars
        indep, dep = zip(*self.regression_vars)
        corr_var_list = list(set(indep))
        corr_var_list.extend(list(set(dep)))

        corr_var_list = list(set(corr_var_list))

        # get locations of upper right triangle of a correlation matrix for this
        # many values
        num_vars = len(corr_var_list)
        triu_indices_0 = np.triu_indices(num_vars,k=1)


        if num_vars > 0:
            # name of the current trend
            trend_name = '_'.join([self.name , trend_col_name])
            # compute correlations
            corr_mat = data_df[corr_var_list].corr(method=self.corrtype)
            # store the correlation matrix for later use
            self.trend_precompute[trend_name] = corr_mat

            # unpack into a list of tuples
            if type(data_df) is pd.core.groupby.DataFrameGroupBy:
                corr_target_vals = []
                groupby_vars = list(data_df.groups.keys())

                corr_data = [(i,d, corr_mat[i][g][d],g) for (i,d),g in
                                    itertools.product(self.regression_vars,groupby_vars)]

            else:
                # not symmtetric, not groupby
                corr_data = [(i,d, corr_mat[i][d],'') for i,d in self.regression_vars]
        else:
            # no data to computes
            corr_data = [[]]

        # always return this
        return corr_data

    def compute_correlation_table_V2(self,data_df):
        
        # recover a single list from the independent and dependent vars
        indep, dep = zip(*self.regression_vars)
        corr_var_list = list(set(indep))
        corr_var_list.extend(list(set(dep)))

        corr_var_list = list(set(corr_var_list))

        # get locations of upper right triangle of a correlation matrix for this
        # many values
        num_vars = len(corr_var_list)
        triu_indices_0 = np.triu_indices(num_vars,k=1)


        if len(self.regression_vars) > 0:

            # unpack into a list of tuples
            if type(data_df) is pd.core.groupby.DataFrameGroupBy:
                corr_target_vals = []
                groupby_vars = list(data_df.groups.keys())

                corr_data = [(i,d, data_df.get_group(g)[d].corr(data_df.get_group(g)[i], method = self.corrtype),g)
                             for (i,d),g in
                             itertools.product(self.regression_vars,groupby_vars)]

            else:
                # not symmtetric, not groupby
                corr_data = [(i,d, data_df[d].corr(data_df[i], method=self.corrtype),'')
                             for i,d in self.regression_vars]
        else:
            # no data to computes
            corr_data = [[]]

        # always return this
        return corr_data

    def wrap_reg_df(self, reg_df,groupby_name):
        '''
        add the groupby varaible or drop the subgroup coloumn

        Parameters
        ----------
        reg_df : DataFrame
            dataframe created by wrapping the output of compute_correlation_table
        groupby_name : string or None
            name for the groupby column or None if not a subgroup


        Returns
        -------
        reg_df : DataFrame
            data frame with added splitby column or removed subgroup column
        as applicable and added trend_type column
        '''

        # if groupby add subgroup indicator columns
        if groupby_name:
            #same for all
            reg_df['splitby'] = groupby_name
        else:
            # if not, remove subgoup
            reg_df.drop(columns = 'subgroup',inplace=True)

        # add the trend name everywhere
        reg_df['trend_type'] = self.name

        return reg_df


class CorrelationTrend(CorrelationBase):

    ############################################################################
    # trend computation functions
    ############################################################################

    def get_trends(self,data_df,trend_col_name):
        """
        Compute a trend, its quality and return a partial result_df

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

        # get correlations
        corr_data = self.compute_correlation_table(data_df,trend_col_name)

        # expand to trend and strength
        # strength here is the absolute value of the trend value
        reg_df = pd.DataFrame(data=[[i,d,v,np.abs(v),g] for i,d,v,g in corr_data],
                columns = ['independent','dependent',trend_col_name,
                            trend_col_name+'_strength','subgroup'])


        # this will either be None or the string that is the name, depending
        # on if data_df is a groupby object or not
        groupby_name = groupby_name_by_type[type(data_df)](data_df)
        # finalize the table
        reg_df = self.wrap_reg_df(reg_df,groupby_name)



        return reg_df

    def get_distance(self,row,col_a='subgroup_trend',col_b='agg_trend'):
        """
        distance between the subgroup and aggregate trends for a row of a
        result_df  binary 0 for same sign, 1 for opposite sign

        Parameters
        ----------
        row : pd.Series
            row of a result_df DataFrame

        Returns
        -------
        <>_dist : float
            distance between the subgroup_trend and agg_trend, compatible with
            assignment to a cell of a result_df
        """
        sg_trend = row[col_a]
        ag_trend = row[col_b]

        # if they're the same set to False
        binary_distance  = int(not(np.sign(sg_trend) == np.sign(ag_trend)))
        return binary_distance

class CorrelationTrend_V2(CorrelationBase):
    ############################################################################
    # trend computation functions
    ############################################################################

    def get_trends(self,data_df,trend_col_name):
        """
        Compute a trend, its quality and return a partial result_df

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

        # get correlations
        corr_data = self.compute_correlation_table_V2(data_df)

        # expand to trend and strength
        # strength here is the absolute value of the trend value
        reg_df = pd.DataFrame(data=[[i,d,v,np.abs(v),g] for i,d,v,g in corr_data],
                              columns = ['independent','dependent',trend_col_name,
                                         trend_col_name+'_strength','subgroup'])


        # this will either be None or the string that is the name, depending
        # on if data_df is a groupby object or not
        groupby_name = groupby_name_by_type[type(data_df)](data_df)
        # finalize the table
        reg_df = self.wrap_reg_df(reg_df,groupby_name)



        return reg_df

    def get_distance(self,row,col_a='subgroup_trend',col_b='agg_trend'):
        """
        distance between the subgroup and aggregate trends for a row of a
        result_df  binary 0 for same sign, 1 for opposite sign

        Parameters
        ----------
        row : pd.Series
            row of a result_df DataFrame

        Returns
        -------
        <>_dist : float
            distance between the subgroup_trend and agg_trend, compatible with
            assignment to a cell of a result_df
        """
        sg_trend = row[col_a]
        ag_trend = row[col_b]

        # if they're the same set to False
        binary_distance  = int(not(np.sign(sg_trend) == np.sign(ag_trend)))
        return binary_distance
    
class CorrelationSignTrend(CorrelationBase):
    '''
    trends that are based on a correlation of type that is specified as a
    property and computes a binary comparison of the signs as a distance
    '''

    def get_trends(self,data_df,trend_col_name):
        """
        Compute a trend, its quality and return a partial result_df

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

        # compute the correlations
        corr_data = self.compute_correlation_table(data_df,trend_col_name)

        # expand to trend and strength
        sign_label = {1:'+',-1:'-'}
        # strength here is the absolute value of the trend value
        reg_df = pd.DataFrame(data=[[i,d,sign_label[np.sign(v)],np.abs(v),g]
                                                for i,d,v,g in corr_data],
                columns = ['independent','dependent',trend_col_name,
                            trend_col_name+'_strength','subgroup'])

        # this will either be None or the string that is the name, depending
        # on if data_df is a groupby object or not
        groupby_name = groupby_name_by_type[type(data_df)](data_df)
        # finalize the table
        reg_df = self.wrap_reg_df(reg_df,groupby_name)


        return reg_df

    def get_distance(self,row,col_a='subgroup_trend',col_b='agg_trend'):
        """
        distance between the subgroup and aggregate trends for a row of a
        result_df  binary 0 for same sign, 1 for opposite sign

        Parameters
        ----------
        row : pd.Series
            row of a result_df DataFrame

        Returns
        -------
        <>_dist : float
            distance between the subgroup_trend and agg_trend, compatible with
            assignment to a cell of a result_df
        """
        sg_trend = row[col_a]
        ag_trend = row[col_b]

        # if they're the same set to False
        binary_distance  = int(not(sg_trend == ag_trend))
        return binary_distance
