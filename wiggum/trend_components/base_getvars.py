import pandas as pd
import numpy as np
import itertools
from io import StringIO

class Trend():
    """
    baseclass for abstraction and building trend objects. All trend objects must
    inherit this class in order to have a constructor (__init__). This may be
    overloaded to define a different constructor.

    Parameters
    ----------
    self
    labeled_df : LabeledDataFrame or None
        if passed, get_trend_vars is called on initialization using labeled_df
    as the target dataset to compute trends on
    """

    def __init__(self,labeled_df = None):
        self.trend_precompute = {}
        self.preaugment = None
        # initialize this to False, it's changed by the the get_trend_vars
        # functions and then used to avoid reconstructing var lists
        self.set_vars = False

        if not(labeled_df== None):
            self.get_trend_vars(labeled_df)

    def get_trend_value_type(self):
        '''
        return the type that the trend values for this trend type should be
        '''
        return self.trend_value_type

    def is_SP(self,row,thresh):
        """
        default is if it's above a threshold, operates rowwise and can be
        applied to a DataFrame with the apply method

        Parameters
        -----------
        row : pd.series
            row of a result df to apply the threshold to
        thresh : float scalar
            threshold to compare the distance to

        Returns
        -------
        boolean value if the distance is over the threshold


        """
        return row['distance'] > thresh

    def load(self,content_dict):
        '''
        load a trend  from a dictionary of the content

        Parameters
        ----------
        content_dict : Dictionary
            the dictionary that results from saving a trend object via the
        trend.__dict__ output

        Returns
        -------
        self : a trend object
            with all of the parameters set according to the dictionary
        '''
        # take the dictionary and load it to the properties of the object
        self.__dict__.update(content_dict)

        # reformat csv-ified tables to dataframes
        #   iterate over the key, value pairs in the precompute Dictionary
        #   keep the keys and convert the strings to a buffer then read them
        #   into a dataframe
        self.trend_precompute = {st:pd.read_csv(StringIO(pc))
                                    for st,pc in self.trend_precompute.items()}

        return self


################################################################################
#              Components
################################################################################
# these parts can be mixed together to create full final classes that are used
# for importing and only those are revealed in
class Regression():
    '''
    common functions for all regression,
    '''

    symmetric_vars = False
    trend_value_type = float
    detail_view = 'scatter'

    def set_weights_regression(self,labeled_df,i_type,d_type):
        '''
        '''
        indep_vars = labeled_df.get_vars_per_roletype('independent', i_type)
        dep_vars = labeled_df.get_vars_per_roletype('dependent', d_type)
        # if the lists are the same, then symmetric
        dep_indep = [d in indep_vars for d in dep_vars]
        # product of bools is true iff all are true
        if np.product(dep_indep):
            self.symmetric_vars = True
        # use iterator to compute pairs
        reg_var_iterator = itertools.product(indep_vars,dep_vars)
        # transform to list of tuples so that is computable works
        self.regression_vars = [(i,d) for i,d in reg_var_iterator if not(i==d)]

        # get the weights for the final set of regression vars & cast to tuple
        weights = lambda vars: tuple(labeled_df.get_weightcol_per_var(vars))

        self.var_weight_list = [weights([i,d]) for i,d in self.regression_vars]

        return True



class OrdinalRegression(Regression):
    """
    regression compatible varTypeMixin, sets list formatted regression_vars and
    symmetric_vars = True
    """


    def get_trend_vars(self,labeled_df):
        """
        set regression_vars for regression of pairs of ordinal variables, by
        assigning regression_vars as an instance property

        Parameters
        -----------
        labeled_df : LabeledDataFrame
            object to parse for variable types

        Returns
        --------
        regression_vars : list of strings
            variables list of all ordinal trend variables

        var_weight_list : list of strings
            list of variables to be used as weights for each regression_vars
        """

        self.set_vars = self.set_weights_regression(labeled_df,'ordinal','ordinal')
        return self.regression_vars


class ContinuousOrdinalRegression(Regression):
    """
    regression compatible varTypeMixin, sets list formatted regression_vars and
    uses continuous dependent vars and ordinal independent
    """


    def get_trend_vars(self,labeled_df):
        """
        set regression_vars for regression of pairs of ordinal and continuous
        trend variables, by assigning regression_vars as an instance property

        Parameters
        -----------
        labeled_df : LabeledDataFrame
            object to parse for variable types

        Returns
        --------
        regression_vars : list of strings
            variables list of all trend variables with type set to ordinal or
            continuous
        var_weight_list : list of strings
            list of variables to be used as weights for each regression_vars
        """

        # use common regression function to set, returns true if it works
        self.set_vars = self.set_weights_regression(labeled_df,
                            ['ordinal','continuous'],['ordinal','continuous'])
        return self.regression_vars

class ContinuousRegression(Regression):
    """
    regression compatible varTypeMixin, for working with continuous variables
    sets list formatted regression_vars and symmetric_vars = True
    """


    def get_trend_vars(self,labeled_df):
        """
        set regression_vars for regression of pairs of  continuous
        trend variables, by assigning regression_vars as an instance property

        Parameters
        -----------
        labeled_df : LabeledDataFrame
            object to parse for variable types

        Returns
        --------
        regression_vars : list of strings
            variables list of all trend variables with type set to ordinal or
            continuous
        var_weight_list : list of strings
            list of variables to be used as weights for each regression_vars


        """
        # use common regression function to set, returns true if it works
        self.set_vars = self.set_weights_regression(labeled_df,
                                                'continuous','continuous')
        return self.regression_vars


def w_median(df,mcol,wcol):
    """
    compute the median or median with replication according to weights, gives a
    confidence interval specified by the middle 50%
     compatible with DataFrame.apply() and get_trends functions in
     wiggum.trend_components.categorical

    Parameters
    ----------
    df : DataFrame or DataFrameGroupBy
        passed as the source of apply, the data to extract columns from for
        computing a weighted average
    mcol : string
        name of column in df to take the median of
    wcol : string
        name of column in df to use for weighting

    Returns
    -------
    stat_data : pandas Series
        with 'stat', 'max', 'min' values defining the statistic and a
        confidence interval
    stat : float
        median of df[avcol] weighted row wise by df[wcol]
    max : float
        mean + std to be used for upper limit of confidence interval
    min : float
        mean - std

    """
    if pd.isna(wcol):
        wmed ,upper,lower = np.quantile(df[mcol],[.5,.25,.75])

        count = n_df[avcol].count()
    else:
        reps = [int(n) for n in df[wcol].values]
        reps_mcol = np.repeat(df[mcol].values,reps)
        wmed,upper,lower =np.quantile( reps_mcol,[.5,.25,.75])
        count = n_df[wcol].sum()

    return pd.Series([wmed ,upper,lower,count],
                index=['stat','max','min','count'])


def w_avg(df,avcol,wcol):
    """
    commpute a weighted average and use the std to define confidence interval
     compatible with DataFrame.apply() and get_trends functions in
     wiggum.trend_components.categorical

    Parameters
    ----------
    df : DataFrame or DataFrameGroupBy
        passed as the source of apply, the data to extract columns from for
        computing a weighted average
    avcol : string
        name of column in df to take the average of
    wcol : string
        name of column in df to use for weighting

    Returns
    -------
    stat_data : pandas Series
        with 'stat', 'max', 'min' values defining the statistic and a
        confidence interval and 'count' defining the power of the computation
    stat : float
        mean of df[avcol] weighted row wise by df[wcol]
    max : float
        mean + std to be used for upper limit of confidence interval
    min : float
        mean - std
    count : int
        sum wcol
    """
    n_df = df.dropna(axis=0,subset=[avcol])
    if len(n_df):
        if pd.isna(wcol):
            wmean = n_df[avcol].mean()
            std = n_df[avcol].std()
            count = n_df[avcol].count()
        else:
            wmean = np.average(n_df[avcol],weights =n_df[wcol])
            # np.sum(df[avcol]*df[wcol])/np.sum(df[wcol])
            var =  np.average((n_df[avcol]-wmean)**2, weights=n_df[wcol])
            std = np.sqrt(var)
            count = n_df[wcol].sum()
    else:
        wmean =0.0
        std = 0.0
        count =0

    return pd.Series([wmean ,wmean+std,wmean-std,count],
            index=['stat','max','min','count'])

def sum(df,avcol):
    """
    commpute a sum and use the std to define confidence interval
     compatible with DataFrame.apply() and get_trends functions in
     wiggum.trend_components.categorical

    Parameters
    ----------
    df : DataFrame or DataFrameGroupBy
        passed as the source of apply, the data to extract columns from for
        computing a sum
    avcol : string
        name of column in df to take the average of

    Returns
    -------
    stat_data : pandas Series
        with 'stat' value defining the statistic
        and 'count' defining the power of the computation
    stat : float
        sum of df[avcol] 
    count : int
        sum of df[avcol] 
    """
    n_df = df.dropna(axis=0,subset=[avcol])
    if len(n_df):
        sum = n_df[avcol].sum()
    else:
        sum =0

    return pd.Series([sum, sum],
            index=['stat','count'])



class BinaryWeightedRank():
    """
    statRank compatible varTypeMixin, for computing means of only binary valued
    variables sets stat to wg.trend_components.w_avg
    """
    trend_value_type = str
    detail_view = 'rank'

    def get_trend_vars(self,labeled_df):
        """
        set target, trendgroup, and var_weight_list for computing rank trends

        Parameters
        -----------
        labeled_df : LabeledDataFrame
            object to parse for variable types

        Returns
        --------
        regression_vars : list of strings
            variables list of all trend variables with type set to ordinal or
            continuous
        """

        self.target = labeled_df.get_vars_per_roletype('dependent','binary')
        all_cat = labeled_df.get_vars_per_roletype('independent','categorical')

        self.trendgroup = [var for var in all_cat if
                                len(pd.unique(labeled_df.df[var])) == 2]
        self.var_weight_list = labeled_df.get_weightcol_per_var(self.target)

        self.set_vars = True
        return (self.target,self.trendgroup)




class WeightedRank():
    """
    common parts for all continuous variable trends
    """
    trend_value_type = str
    detail_view = 'rank'

    def get_trend_vars(self,labeled_df):
        """
        """
        # maybe not counts

        self.target = labeled_df.get_vars_per_roletype('dependent',['binary','continuous'])
        self.trendgroup = labeled_df.get_vars_per_roletype('independent','categorical')
        self.var_weight_list = labeled_df.get_weightcol_per_var(self.target)
        self.set_vars = True
        return self.target, self.trendgroup

class PredictionClass():
    """
    for binary classification performance stats
    """
    trend_value_type = float

    def get_trend_vars(self,labeled_df):
        self.groundtruth = labeled_df.get_vars_per_role('groundtruth')
        self.prediction = labeled_df.get_vars_per_role('prediction')

        self.preaugment = 'confusion'

        self.set_vars = True
        return self.groundtruth, self.prediction

class PercentageRank():
    """
    common parts for percentage trends
    """
    trend_value_type = str
    detail_view = 'rank'

    def get_trend_vars(self,labeled_df):
        """
        """
        # maybe not counts

        self.target = labeled_df.get_vars_per_roletype('dependent','continuous')
        self.trendgroup = labeled_df.get_vars_per_roletype('independent','categorical')

        self.set_vars = True
        return self.target, self.trendgroup