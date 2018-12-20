import pandas as pd
import numpy as np
import scipy.stats as stats
import itertools as itert

## constants

RESULTS_DF_HEADER_old = ['attr1','attr2','allCorr','subgroupCorr','groupbyAttr','subgroup']

RESULTS_DF_HEADER = ['feat1','feat2','trend_type','agg_trend','group_feat',
                    'subgroup','subgroup_trend']


# Function s
def upper_triangle_element(matrix):
    """
    extract upper triangle elements without diagonal element

    Parameters
    -----------
    matrix : 2d numpy array

    Returns
    --------
    elements : numpy array
               A array has all the values in the upper half of the input matrix

    """
    #upper triangle construction
    tri_upper = np.triu(matrix, k=1)
    num_rows = tri_upper.shape[0]

    #upper triangle element extract
    elements = tri_upper[np.triu_indices(num_rows,k=1)]

    return elements


def upper_triangle_df(matrix):
    """
    extract upper triangle elements without diagonal element and store the element's
    corresponding rows and columns' index information into a dataframe

    Parameters
    -----------
    matrix : 2d numpy array

    Returns
    --------
    result_df : dataframe
        A dataframe stores all the values in the upper half of the input matrix and
    their corresponding rows and columns' index information into a dataframe
    """
    #upper triangle construction
    tri_upper = np.triu(matrix, k=1)
    num_rows = tri_upper.shape[0]

    #upper triangle element extract
    elements = tri_upper[np.triu_indices(num_rows,k=1)]
    location_tuple = np.triu_indices(num_rows,k=1)
    result_df = pd.DataFrame({'value':elements})
    result_df['attr1'] = location_tuple[0]
    result_df['attr2'] = location_tuple[1]

    return result_df


def isReverse(a, b, threshold):
    """
    Reversal is the logical opposite of signs matching.

    Parameters
    -----------
    a : number(int or float)
    b : number(int or float)
    threshold: float

    Returns
    --------
    boolean value : If True turns, a and b have the reverse sign.
                    If False returns, a and b have the same sign.
    """

    if ((abs(a) > threshold) and (abs(b) > threshold)):
        result = not (np.sign(a) == np.sign(b))
    else:
        result = False

    return result




def detect_simpsons_paradox(data_df,
                            regression_vars=None,
                            groupby_vars=None,type='linreg' ):

    """
    A detection function which can detect Simpson Paradox happened in the data's
    subgroup. (legacy)

    Parameters
    -----------
    data_df : DataFrame
        data organized in a pandas dataframe containing both categorical
        and continuous attributes.
    regression_vars : list [None]
        list of continuous attributes by name in dataframe, if None will be
        detected by all float64 type columns in dataframe
    groupby_vars  : list [None]
        list of group by attributes by name in dataframe, if None will be
        detected by all object and int64 type columns in dataframe
    type : {'linreg',} ['linreg']
        default is linreg for backward compatibility


    Returns
    --------
    result_df : dataframe
        a dataframe with columns ['attr1','attr2',...]
                TODO: Clarify the return information

    """
    # if not specified, detect continous attributes and categorical attributes
    # from dataset
    if groupby_vars is None:
        groupbyAttrs = data_df.select_dtypes(include=['object','int64'])
        groupby_vars = list(groupbyAttrs)

    if regression_vars is None:
        continuousAttrs = data_df.select_dtypes(include=['float64'])
        regression_vars = list(continuousAttrs)


    # Compute correaltion matrix for all of the data, then extract the upper
    # triangle of the matrix.
    # Generate the correaltion dataframe by correlation values.
    all_corr = data_df[regression_vars].corr()
    all_corr_df = upper_triangle_df(all_corr)
    all_corr_element = all_corr_df['value'].values

    # Define an empty dataframe for result
    results_df = pd.DataFrame(columns=RESULTS_DF_HEADER)

    # Loop by group-by attributes
    for groupbyAttr in groupby_vars:
        grouped_df_corr = data_df.groupby(groupbyAttr)[regression_vars].corr()
        groupby_value = grouped_df_corr.index.get_level_values(groupbyAttr).unique()

        # Get subgroup correlation
        for subgroup in groupby_value:
            subgroup_corr = grouped_df_corr.loc[subgroup]

            # Extract subgroup
            subgroup_corr_elements = upper_triangle_element(subgroup_corr)

            # Compare the signs of each element in subgroup to the correlation for all of the data
            # Get the index for reverse element
            index_list = [i for i, (a,b) in enumerate(zip(all_corr_element, subgroup_corr_elements)) if isReverse(a, b, threshold)]

            # Get reverse elements' correlation values
            reverse_list = [j for i, j in zip(all_corr_element, subgroup_corr_elements) if isReverse(i, j, threshold)]

            if reverse_list:
                # Retrieve attribute information from all_corr_df
                all_corr_info = [all_corr_df.loc[i].values for i in index_list]
                temp_df = pd.DataFrame(data=all_corr_info,columns=['allCorr','attr1','attr2'])

                # # Convert index from float to int
                temp_df.attr1 = temp_df.attr1.astype(int)
                temp_df.attr2 = temp_df.attr2.astype(int)
                # Convert indices to attribute names for readabiity
                temp_df.attr1 = temp_df.attr1.replace({i:a for i, a in
                                            enumerate(regression_vars)})
                temp_df.attr2 = temp_df.attr2.replace({i:a for i, a in
                                            enumerate(regression_vars)})

                temp_df['subgroupCorr'] = reverse_list
                len_list = len(reverse_list)
                # Store group attributes' information
                temp_df['groupbyAttr'] = [groupbyAttr for i in range(len_list)]
                temp_df['subgroup'] = [subgroup for i in range(len_list)]
                result_df = result_df.append(temp_df, ignore_index=True)

    return result_df


def get_correlations(data_df,regression_vars,corr_name):
    """
    return a DataFrame of the linear corelations in a DataFrame or groupby

    Parameters
    -----------
    data_df : DataFrame
        tidy data
    regression_vars : list of strings
        column names to use for correlatio compuations
    corr_name : string
        title for column of data frame tht will be created
    """

    # get locations of upper right triangle of a correlation matrix for this
    # many values
    num_vars = len(regression_vars)
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

    reg_df['trend_type'] = 'pearson_corr'

    return reg_df


def get_lin_trends(data_df,regression_vars,corr_name):
    """
    return a DataFrame of the linear trends in a DataFrame or groupby

    Parameters
    -----------
    data_df : DataFrame
        tidy data
    regression_vars : list of strings
        column names to use for correlatio compuations
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

def get_rate_rank_trends(data_df,rate_vars,corr_name):
    """
    return a DataFrame of the rate rankings in a DataFrame

    Parameters
    -----------
    data_df : DataFrame
        tidy data
    rate_vars : list of tuples
        list of (outcome, protected) pairs for computing rates
    """

    # groupby
    result_tab = []
    # compute means
    for cur_rate in rate_vars:
        cur_outcome = cur_rate[0]
        cur_protected_explanatory = cur_rate[1:]
        outcome_df = data_df.groupby(cur_protected_explanatory)[cur_outcome].mean()

        if len(cur_protected_explanatory) ==1:
            # aggregate trend
            # sort by the outcome return the protected
            rank_list = outcome_df.reset_index().sort_values(by=cur_outcome,ascending=False)[cur_protected_explanatory].values
            # result_row['feat1'] = cur_outcome
            # result_row['feat2'] = cur_protected_explanatory
            # result_row['trend_type'] = 'rate'
            # result_row['agg_trend'] = rank_list
            result_row = [cur_outcome,cur_protected_explanatory,'rate',rank_list]
        else:
            #subgroup trend
            # split vars
            pro = cur_protected_explanatory[0]
            exp = cur_protected_explanatory[1]
            # get the vars for the split
            exp_groups = list(set(data_df[exp]))

            # rearrange to have one column per, then retrun list of ranked lists
            rank_list = [outcome_df.unstack().reset_index().sort_values(by=exp_lev,ascending=False)[pro]
                        for exp_lev in exp_groups]

            # create one row per
            result_row = [[cur_outcome,cur_protected_explanatory,'rate',exp,exp_l,r_l]
                            for exp_l,r_l in zip(exp_groups, rank_list)]
        # per_group = df_rate.groupby(['protected','explanatory']).mean().unstack()

        result_tab.extend(result_row)

    # make DF from lists
    if len(cur_protected_explanatory) ==1:
        col_header = ['feat1','feat2','trend_type','agg_trend']
    else:
        col_header = ['feat1','feat2','trend_type','group_feat',
                            'subgroup','subgroup_trend']

    results_df = pd.DataFrame(data = result_tab,columns = col_header)

    return result_df

    # cannot layer them, must et list of all combos?

    return results_df


get_trend_vars = {'pearson_corr':lambda df: list(df.select_dtypes(include=['float64'])),
              'rate': lambda df: list(data_df.select_dtypes(include=['bool'])) }
get_trend_funcs = {'pearson_corr':get_correlations,
                'rate':get_rate_rank_trends}

def get_subgroup_trends_1lev(data_df,trend_types,groupby_vars=None):
    """
    find subgroup and aggregate trends in the dataset, return a DataFrame that
    contains information necessary to filter for SP and relaxations
    computes for 1 level grouby (eg correlation and linear trends)

    Parameters
    -----------
    data_df : DataFrame
        data to find SP in, must be tidy
    trend_types: list of strings or list of dicts
        info on what trends to compute and the variables to use, dict is of form
    {'name':<str>,'vars':['varname1','varname1'],'func':functionhandle}
    groupby_vars : list of strings
        column names to use as grouping variables
    trend_vars : list of strings
        column names to use in regresison based trends
    rate_vars : list of strings
        column names to use in rate based trends
    trend_func : function handle
        to compute the trend
    """

    # if not specified, detect continous attributes and categorical attributes
    # from dataset
    if groupby_vars is None:
        groupby_data = data_df.select_dtypes(include=['object','int64'])
        groupby_vars = list(groupby_data)

    if type(trend_types[0]) is str:
        # create dict
        trend_dict_list = [{'name':trend,
                        'vars':get_trend_vars[trend](data_df),
                        'func':get_trend_funcs[trend]} for trend in trend_types]
    else:
        # use provided
        trend_dict_list = trend_types

    # prep the result df to add data to later
    results_df = pd.DataFrame(columns=RESULTS_DF_HEADER)

    # create empty lists
    all_trends = []
    subgroup_trends = []

    for td in trend_dict_list:
        trend_func = td['func']
        trend_vars = td['vars']
        # Tabulate aggregate statistics
        agg_trends = trend_func(data_df,trend_vars,'agg_trend')

        all_trends.append(agg_trends)

        # iterate over groupby attributes
        for groupbyAttr in groupby_vars:
            #condition the data
            cur_grouping = data_df.groupby(groupbyAttr)

            # get subgoup trends
            curgroup_corr = trend_func(cur_grouping,trend_vars,'subgroup_trend')

            # append
            subgroup_trends.append(curgroup_corr)




    # condense and merge all trends with subgroup trends
    all_trends = pd.concat(all_trends)
    subgroup_trends = pd.concat(subgroup_trends)
    results_df = pd.merge(subgroup_trends,all_trends)
    # ,on=['feat1','feat2'], how='left

    return results_df

def get_subgroup_trends_2lev(data_df,trend_types,groupby_vars=None):
    """
    find subgroup and aggregate trends in the dataset, return a DataFrame that
    contains information necessary to filter for SP and relaxations
    for 2 levels og groupby (eg rate trends)

    Parameters
    -----------
    data_df : DataFrame
        data to find SP in, must be tidy
    trend_types: list of strings or list of dicts
        info on what trends to compute and the variables to use, dict is of form
    {'name':<str>,'vars':['varname1','varname1'],'func':functionhandle}
    groupby_vars : list of strings
        column names to use as grouping variables
    trend_vars : list of strings
        column names to use in regresison based trends
    rate_vars : list of strings
        column names to use in rate based trends
    trend_func : function handle
        to compute the trend
    """

    # if not specified, detect continous attributes and categorical attributes
    # from dataset
    if groupby_vars is None:
        groupby_data = data_df.select_dtypes(include=['object','int64'])
        groupby_vars = list(groupby_data)

    if type(trend_types[0]) is str:
        # create dict
        trend_dict_list = [{'name':trend,
                        'vars':get_trend_vars[trend](data_df),
                        'func':get_trend_funcs[trend]} for trend in trend_types]
    else:
        # use provided
        trend_dict_list = trend_types

    # prep the result df to add data to later
    results_df = pd.DataFrame(columns=RESULTS_DF_HEADER)

    # create empty lists
    all_trends = []
    subgroup_trends = []

    for td in trend_dict_list:
        trend_func = td['func']
        trend_vars = td['vars']
        # Tabulate aggregate statistics
        agg_trends = trend_func(data_df,trend_vars,'agg_trend')

        all_trends.append(agg_trends)

        # iterate over groupby attributes
        for groupbyAttr in groupby_vars:
            # add groupbyAttr to list of splits
            trend_vars_gb = [tv.append(groupbyAttr) for tv in trend_vars]

            # get subgoup trends
            curgroup_corr = trend_func(cur_grouping,trend_vars_gb,'subgroup_trend')

            # append
            subgroup_trends.append(curgroup_corr)




    # condense and merge all trends with subgroup trends
    all_trends = pd.concat(all_trends)
    subgroup_trends = pd.concat(subgroup_trends)
    results_df = pd.merge(subgroup_trends,all_trends)
    # ,on=['feat1','feat2'], how='left

    return results_df





# def detect_sp_pandas():
#     total_data = np.asarray([np.sign(many_sp_df_diff.corr().values)]*3).reshape(18,6)
#     A_data = np.sign(many_sp_df_diff.groupby('A').corr().values)
#     sp_mask = total_data*A_data
# sp_idx = np.argwhere(sp_mask<0)
# #     Comput corr, take sign
# # conditionn and compute suc corrs, take sign
# # mutliply two together, all negative arer SP
# # get locations to dtermine laels
#     labels_levels = many_sp_df_diff.groupby('A').corr().index
#     groupByAttr_list = [labels_levels.levels[0][ll] for ll in labels_levels.labels[0]]
#     var_list_dn  = [labels_levels.levels[1][li] for li in labels_levels.labels[1]]
#     var_list_ac = many_sp_df_diff.groupby('A').corr().columns
#     # labels_levels.levels
#     SP_cases = [(groupByAttr_list[r],var_list_dn[r],var_list_ac[c]) for r,c in sp_idx ]
