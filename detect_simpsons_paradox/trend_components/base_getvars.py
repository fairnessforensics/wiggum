
class trend():
    """
    baseclass for abstraction

    TODO: use this?
    """

    def __init__(self,labeled_df = None):
        self.trend_precompute = {}

        if not(labeled_df== None):
            self.get_trend_vars(labeled_df)

################################################################################
#              Components
################################################################################
# these parts can be mixed together to create full final classes that are used
# for importing and only those are revealed in

class ordinalRegression():
    """
    common parts for all continuous variable trends
    """
    def get_trend_vars(self,labeled_df):
        """
        """
        # maybe not counts

        self.regression_vars = labeled_df.get_vars_per_roletype('trend',
                                    'ordinal')
        return self.regression_vars


class continuousOrdinalRegression():
    """
    common parts for all continuous variable trends
    """
    def get_trend_vars(self,labeled_df):
        """
        """
        # maybe not counts

        self.regression_vars = labeled_df.get_vars_per_roletype('trend',
                                    ['continuous','ordinal'])
        return self.regression_vars

class continuousRegression():
    """
    common parts for all continuous variable trends
    """
    def get_trend_vars(self,labeled_df):
        """
        """
        # maybe not counts

        self.regression_vars = labeled_df.get_vars_per_roletype('trend',
                                    'continuous')
        return self.regression_vars


class binaryMeanRank():
    """
    common parts for all continuous variable trends
    """
    def get_trend_vars(self,labeled_df):
        """
        """
        # maybe not counts

        self.target = labeled_df.get_vars_per_roletype('trend','binary')
        self.trendgroup = labeled_df.get_vars_per_roletype('trend','categorical')
        return

class weightedMeanRank():
    """
    common parts for all continuous variable trends
    """
    def get_trend_vars(self,labeled_df):
        """
        """
        # maybe not counts

        self.target = labeled_df.get_vars_per_roletype('trend',['binary','continuous'])
        self.trendgroup = labeled_df.get_vars_per_roletype(['trend','explanatory'],'categorical')
        self.var_weight_list = labeled_df.get_weightcol_per_var(self.target)
        return self.target, self.trendgroup
