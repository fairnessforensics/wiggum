import pandas as pd
import numpy as np

class Trend():
    """
    baseclass for abstraction and building Trend objects. All Trend objects must
    inherit this class in order to have a constructor (__init__). This may be
    overloaded to define a different constructor.

    Parameters
    ----------
    self
    labeled_df : LabeledDataFrame or None
        if passed, get_Trend_vars is called on initialization using labeled_df
    as the target dataset to compute Trends on
    """

    def __init__(self,labeled_df = None):
        self.Trend_precompute = {}

        if not(labeled_df== None):
            self.get_Trend_vars(labeled_df)

            return self

    def is_SP(self,row,thresh):
        """
        default is if it's above a threshold

        """
        return row['distance'] > thresh

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
    def get_Trend_vars(self,labeled_df):
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
            variables list of all ordinal Trend variables
        """

        self.regression_vars = labeled_df.get_vars_per_roletype('Trend',
                                    'ordinal')
        self.var_weight_list = labeled_df.get_weightcol_per_var(self.regression_vars)
        return self.regression_vars


class ContinuousOrdinalRegression():
    """
    regression compatible varTypeMixin, sets list formatted regression_vars and
    symmetric_vars = True
    """
    symmetric_vars = True

    def get_Trend_vars(self,labeled_df):
        """
        set regression_vars for regression of pairs of ordinal and continuous
        Trend variables, by assigning regression_vars as an instance property

        Parameters
        -----------
        labeled_df : LabeledDataFrame
            object to parse for variable types

        Returns
        --------
        regression_vars : list of strings
            variables list of all Trend variables with type set to ordinal or
            continuous
        """

        self.regression_vars = labeled_df.get_vars_per_roletype('Trend',
                                    ['continuous','ordinal'])
        self.var_weight_list = labeled_df.get_weightcol_per_var(self.regression_vars)
        return self.regression_vars

class ContinuousRegression():
    """
    regression compatible varTypeMixin, for working with continuous variables
    sets list formatted regression_vars and symmetric_vars = True
    """

    symmetric_vars = True

    def get_Trend_vars(self,labeled_df):
        """
        set regression_vars for regression of pairs of  continuous
        Trend variables, by assigning regression_vars as an instance property

        Parameters
        -----------
        labeled_df : LabeledDataFrame
            object to parse for variable types

        Returns
        --------
        regression_vars : list of strings
            variables list of all Trend variables with type set to ordinal or
            continuous
        """

        self.regression_vars = labeled_df.get_vars_per_roletype('Trend',
                                    'continuous')

        self.var_weight_list = labeled_df.get_weightcol_per_var(self.regression_vars)
        return self.regression_vars


def w_median(df,mcol,wcol):
    """
    compute the median or median with replication according to weights, gives a
    confidence interval specified by the middle 50%

    Parameters
    ----------
    df : DataFrame or DataFrameGroupBy
        passed as the source of apply, the data to extract columns from for
        computing a weighted average
    mcol : string
        name of column in df to take the average of
    wcol : string
        name of column in df to use for weighting

    Returns
    -------
    wmed : float
        median of df[avcol] weighted row wise by df[wcol]

    """
    if pd.isna(wcol):
        wmed ,upper,lower = np.quantile(df[mcol],[.5,.25,.75])
    else:
        reps = [int(n) for n in df[wcol].values]
        reps_mcol = np.repeat(df[mcol].values,reps)
        wmed,upper,lower =np.quantile( reps_mcol,[.5,.25,.75])

    return pd.Series([wmed ,upper,lower],index=['stat','max','min'])


def w_avg(df,avcol,wcol):
    """
    commpute a weighted average through DataFrame.apply()

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
    wmean : float
        mean of df[avcol] weighted row wise by df[wcol]
    """
    n_df = df.dropna(axis=0,subset=[avcol])
    if len(n_df):
        if pd.isna(wcol):
            wmean = n_df[avcol].mean()
            std = n_df[avcol].std()
        else:
            wmean = np.average(n_df[avcol],weights =n_df[wcol])
            # np.sum(df[avcol]*df[wcol])/np.sum(df[wcol])
            var =  np.average((n_df[avcol]-wmean)**2, weights=n_df[wcol])
            std = np.sqrt(var)
    else:
        wmean =0.0
        std = 0.0

    return pd.Series([wmean ,wmean+std,wmean-std],index=['stat','max','min'])





class BinaryWeightedRank():
    """
    statRank compatible varTypeMixin, for computing means of only binary valued
    variables sets stat to wg.trend_components.w_avg
    """


    def get_Trend_vars(self,labeled_df):
        """
        set target, Trendgroup, and var_weight_list for computing rank Trends

        Parameters
        -----------
        labeled_df : LabeledDataFrame
            object to parse for variable types

        Returns
        --------
        regression_vars : list of strings
            variables list of all Trend variables with type set to ordinal or
            continuous
        """

        self.target = labeled_df.get_vars_per_roletype('Trend',['binary','continuous'])
        all_cat = labeled_df.get_vars_per_roletype('Trend','categorical')

        self.Trendgroup = [var for var in all_cat if
                                len(pd.unique(labeled_df.df[var])) == 2]
        self.var_weight_list = labeled_df.get_weightcol_per_var(self.target)
        return (self.target,self.Trendgroup)




class WeightedRank():
    """
    common parts for all continuous variable Trends
    """

    def get_Trend_vars(self,labeled_df):
        """
        """
        # maybe not counts

        self.target = labeled_df.get_vars_per_roletype('Trend',['binary','continuous'])
        self.Trendgroup = labeled_df.get_vars_per_roletype('Trend','categorical')
        self.var_weight_list = labeled_df.get_weightcol_per_var(self.target)
        return self.target, self.Trendgroup
