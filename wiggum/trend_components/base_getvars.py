import pandas as pd
import numpy as np
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

            return self

    def is_SP(self,row,thresh):
        """
        default is if it's above a threshold

        """
        return row['distance'] > thresh

    def load(self,content_dict):
        self.__dict__.update(content_dict)

        # reformat csv-d tables to dataframes
        self.trend_precompute = {st:pd.read_csv(StringIO(pc))
                                    for st,pc in self.trend_precompute.items()}


################################################################################
#              Components
################################################################################
# these parts can be mixed together to create full final classes that are used
# for importing and only those are revealed in

class OrdinalRegression():
    """
    regression compatible varTypeMixin, sets list formatted regression_vars and
    symmetric_vars = True
    """
    symmetric_vars = True
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

        self.regression_vars = labeled_df.get_vars_per_roletype('trend', 'ordinal')
        self.var_weight_list = labeled_df.get_weightcol_per_var(self.regression_vars)

        self.set_vars = True
        return self.regression_vars


class ContinuousOrdinalRegression():
    """
    regression compatible varTypeMixin, sets list formatted regression_vars and
    symmetric_vars = True
    """
    symmetric_vars = True

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

        self.regression_vars = labeled_df.get_vars_per_roletype('trend',
                                                                    ['continuous','ordinal'])
        self.var_weight_list = labeled_df.get_weightcol_per_var(self.regression_vars)

        self.set_vars = True
        return self.regression_vars

class ContinuousRegression():
    """
    regression compatible varTypeMixin, for working with continuous variables
    sets list formatted regression_vars and symmetric_vars = True
    """

    symmetric_vars = True

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

        self.regression_vars = labeled_df.get_vars_per_roletype('trend',
                                    'continuous')

        self.var_weight_list = labeled_df.get_weightcol_per_var(self.regression_vars)

        self.set_vars = True
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





class BinaryWeightedRank():
    """
    statRank compatible varTypeMixin, for computing means of only binary valued
    variables sets stat to wg.trend_components.w_avg
    """


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

        self.target = labeled_df.get_vars_per_roletype('trend','binary')
        all_cat = labeled_df.get_vars_per_roletype('trend','categorical')

        self.trendgroup = [var for var in all_cat if
                                len(pd.unique(labeled_df.df[var])) == 2]
        self.var_weight_list = labeled_df.get_weightcol_per_var(self.target)

        self.set_vars = True
        return (self.target,self.trendgroup)




class WeightedRank():
    """
    common parts for all continuous variable trends
    """

    def get_trend_vars(self,labeled_df):
        """
        """
        # maybe not counts

        self.target = labeled_df.get_vars_per_roletype('trend',['binary','continuous'])
        self.trendgroup = labeled_df.get_vars_per_roletype('trend','categorical')
        self.var_weight_list = labeled_df.get_weightcol_per_var(self.target)
        self.set_vars = True
        return self.target, self.trendgroup

class PredictionClass():
    """
    for binary classification performance stats
    """

    def get_trend_vars(self,labeled_df):
        self.groundtruth = labeled_df.get_vars_per_role('groundtruth')
        self.prediction = labeled_df.get_vars_per_role('prediction')

        self.preaugment = 'confusion'

        self.set_vars = True
        return self.groundtruth, self.prediction
