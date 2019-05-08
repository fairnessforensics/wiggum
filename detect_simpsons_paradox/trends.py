import pandas as pd:


class trend():

    def __init__():
        feat1_types = []
        feat2_types = []
        name = []


class correlation_trend():
    feat1_types = []
    feat2_types = []
    name = 'pearson_corr'

    def __init__(correlation_vars = None):
        self.regression_vars = correlation_vars

    ################################################################################
    # trend computation functions
    ################################################################################
    def get_trend_vars(labeled_df):
        """
        """
        self.regression_vars
        return labeled_df.get_vars_per_roletype('trend','continuous')

    def get_trends(data_df,corr_name):
        """
        return a DataFrame of the linear corelations in a DataFrame or groupby

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

        # append for all groups if groupby instead of single DataFrame

        if type(data_df) is pd.core.groupby.DataFrameGroupBy:
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
            # if not a gropby then the original is correct, use that
            triu_indices = triu_indices_0
            triu_feat_indices = triu_indices

        # compute correlations, only store vlaues from upper right triangle
        corr_triu = data_df[regression_vars].corr().values[triu_indices]


        # create dataframe with rows, att1 label, attr2 label, correlation
        reg_df = pd.DataFrame(data=[[regression_vars[x],regression_vars[y],val]
                                    for x,y,val in zip(*triu_feat_indices,corr_triu)],
                    columns = ['feat1','feat2',corr_name])

        # if groupby add subgroup indicator columns
        if type(data_df) is pd.core.groupby.DataFrameGroupBy:
            #same for all
            reg_df['group_feat'] = data_df.count().index.name
            # repeat the values each the number of time sfor the size of the triu
            reg_df['subgroup'] = list(data_df.groups.keys())*n_triu_values

        reg_df['trend_type'] = self.name

        return reg_df





class linear_trend():
    def get_lin_trends(data_df,regression_vars,corr_name):
        """
        return a DataFrame of the linear trends in a DataFrame or groupby

        Parameters
        -----------
        data_df : DataFrame
            tidy data
        regression_vars : list of strings
            column names to use for slope computations
        corr_name : string
            title for column of data frame tht will be created (group or all)
        """
        # get locations of upper right triangle
        triu_indices = np.triu_indices(len(regression_vars), k=1)

        # compute slopes, only store vlaues from upper right triangle
        corr_triu = data_df[regression_vars].corr()[triu_indices] #

        # create dataframe with rows, att1 label, attr2 label, correlation
        reg_df = pd.DataFrame(data=[[regression_vars[x],regression_vars[y],val]
                                    for x,y,val in zip(*triu_indices,triu_valuess)],
                    columns = ['feat1','feat2',corr_name])

        return reg_df
