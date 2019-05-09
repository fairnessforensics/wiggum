import pandas as pd
import numpy as np
import itertools
import scipy.stats as stats

## set all list at bottom

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

class correlationTrend():


    ############################################################################
    # trend computation functions
    ############################################################################

    def get_trends(self,data_df,corr_name):
        """
        return a DataFrame of the linear corelations in a DataFrame or pandas
            groupby

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



        if type(data_df) is pd.core.groupby.DataFrameGroupBy:

            # append for all groups if groupby instead of single DataFrame
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
            # if not a groupby then the original is correct, use that
            triu_indices = triu_indices_0
            triu_feat_indices = triu_indices

        # compute correlations, only store vlaues from upper right triangle
        trend_name = '_'.join([self.name , corr_name])
        corr_mat = data_df[self.regression_vars].corr(method=self.corrtype)
        corr_triu = corr_mat.values[triu_indices]

        self.trend_precompute[trend_name] = corr_mat


        # create dataframe with rows, att1 label, attr2 label, correlation
        reg_df = pd.DataFrame(data=[[self.regression_vars[x],self.regression_vars[y],val]
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

    def get_distance(row):
        row['distance'] = 'undef'
        return row['distance']


class linearRegression():

    def get_trends(self,data_df,corr_name):
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

        if not(type(data_df) is pd.core.groupby.DataFrameGroupBy):

            # make it tupe-like so that the loop can work
            data_df = [('',data_df)]


        data_cols = self.regression_vars
        slopes = []

        for groupby_lev,df in data_df:

            for a,b in itertools.combinations(data_cols,2):
                print(a,b)
            # compute each slope
                slope, i, r_val, p_val, e = stats.linregress(df[a],df[b])
                slopes.append([a,b,slope,groupby_lev])

        #save as df
        if type(data_df) is pd.core.groupby.DataFrameGroupBy:
            reg_df = pd.DataFrame(data = slopes, columns = ['feat1','feat2',
                                                    corr_name,'subgroup'])
            #same for all
            reg_df['group_feat'] = data_df.count().index.name
        else:
            reg_df = pd.DataFrame(data = slopes, columns = ['feat1','feat2',corr_name,'empty'])
            reg_df.drop('empty',axis=1,inplace=True)

        reg_df['trend_type'] = self.name
        return reg_df


    def get_distance(row):
        """
        compute angle between the overall ('all_slope') and subgroup
        ('subgroup_slope') slopes for a row of a dataframe. This is the angle
        closest to the positive x axis and is always positive valued, to be used as
        a distance.

        Parameters
        ----------
        row : row of DataFrame
            row of results generated by detect_simpsons_paradox
        """
        # take absolute value, because the two will be in opposite directions
        # relative to the angle of interest
        theta_sub = np.arctan(row['subgroup_trend'])
        theta_all = np.arctan(row['agg_trend'])
        # theta_sub = np.abs(np.arctan(row['subgroup_slope']))
        # theta_all = np.abs(np.arctan(row['all_slope']))

        # add them and convert to degrees
        row['distance'] = np.rad2deg(np.abs(theta_all - theta_sub))
        return row['distance']


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

def w_avg(df,avcol,wcol):
    df.dropna(axis=0,subset=[avcol])
    return np.sum(df[avcol]*df[wcol])/np.sum(df[wcol])

class rankTrend():

    def get_trends(self,data_df,corr_name):
        """
        assuming the data is counts and rates that need to be combined in
        weighted ways
        """
        # use all
        cur_trendgroup = self.trendgroup

        if type(data_df) is pd.core.groupby.DataFrameGroupBy:
            # remove the grouping var from trendgroup this roung
            rmv_var = data_df.count().index.name
            cur_trendgroup = [gv for gv in cur_trendgroup if not(gv==rmv_var)]
        else:

            # make it tupe-like so that the loop can work
            data_df = [('',data_df)]





        weight_col_lookup = {t:w for t,w in zip(self.target,self.var_weight_list)}
        rank_res =[]


        for groupby_lev,df in data_df:

            views = itertools.product(self.target,cur_trendgroup)

            for meanfeat,rankfeat  in views:

                weightfeat = weight_col_lookup[meanfeat]
                # sort values of view[1] by values of view[0]
                # if wcol is NaN, then set wegiths to 1
                if pd.isna(weightfeat):
                    # if no weighting, take regular mean
                    mean_df = df.groupby(rankfeat)[meanfeat].mean()
                else:
                    # if weighting var is specified use that column to weight
                    mean_df = df.groupby(rankfeat).apply(w_avg,meanfeat,weightfeat)

                # save detailed precompute
                trend_name = '_'.join([self.name , corr_name,meanfeat,rankfeat])
                self.trend_precompute[trend_name] = mean_df

                # extract for result_df
                ordered_rank_feat = mean_df.sort_values().index.values
                # create row
                rank_res.append([meanfeat,rankfeat,ordered_rank_feat,groupby_lev])


        # if groupby add subgroup indicator columns
        if type(data_df) is pd.core.groupby.DataFrameGroupBy:
            reg_df = pd.DataFrame(data = rank_res, columns = ['feat1','feat2',
                                                    corr_name,'subgroup'])
            #same for all
            reg_df['group_feat'] = data_df.count().index.name
        else:
            reg_df = pd.DataFrame(data = rank_res, columns = ['feat1','feat2',corr_name,'empty'])
            reg_df.drop('empty',axis=1,inplace=True)


        reg_df['trend_type'] = self.name
        return reg_df

    def get_distance(row):
        """
        kendalltau distance can be used for permuation distance
        """
        trend_numeric_map = {val:i for i,val in enumerate(target_row['agg_trend'].values[0])}

        numeric_agg = [trend_numeric_map[val] for val in target_row['agg_trend'].values[0]]
        numeric_subgroup = [trend_numeric_map[val] for val in target_row['subgroup_trend'].values[0]]
        tau,p = stat.kendalltau(numeric_agg,numeric_subgroup)
        row['distance'] = 1-tau
        return 1- tau

class mean_rank_trend(rankTrend,weightedMeanRank,trend):
    name = 'rank_trend'

class continuous_pearson(correlationTrend,continuousRegression,trend):
    name = 'pearson_corr'
    corrtype = 'pearson'


class all_pearson(correlationTrend,continuousOrdinalRegression,trend):
    name = 'pearson_corr'
    corrtype = 'pearson'

class spearman_correlation(correlationTrend,ordinalRegression,trend):
    name ='spearman_corr'
    corrtype = 'spearman'

class kendall_correlation(correlationTrend,continuousRegression,trend):
    name ='kendall_corr'
    corrtype = 'kendall'

class linear_trend(linearRegression,continuousRegression,trend):
    name = 'lin_reg'


all_trend_types = {'pearson_corr':all_pearson,
                    'rank_trend':rankTrend,
                    'lin_reg':linear_trend}
