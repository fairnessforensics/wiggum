import pandas as pd
import numpy as np
import scipy.stats as stats
import itertools as itert

## constants

RESULTS_DF_HEADER = ['attr1','attr2','allCorr','subgroupCorr','groupbyAttr','subgroup']



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


def isReverse(a, b):
    """
    Reversal is the logical opposite of signs matching.

    Parameters
    -----------
    a : number(int or float)
    b : number(int or float)

    Returns
    --------
    boolean value : If True turns, a and b have the reverse sign.
                    If False returns, a and b have the same sign.
    """

    return not (np.sign(a) == np.sign(b))



def detect_simpsons_paradox(data_df,
                            regression_vars=None,
                            groupby_vars=None,type='linreg' ):
    """
    A detection function which can detect Simpson Paradox happened in the data's
    subgroup.

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
            index_list = [i for i, (a,b) in enumerate(zip(all_corr_element, subgroup_corr_elements)) if isReverse(a, b)]

            # Get reverse elements' correlation values
            reverse_list = [j for i, j in zip(all_corr_element, subgroup_corr_elements) if isReverse(i, j)]

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
    if type(data_df) is pd.core.groupby.groupby.DataFrameGroupBy:
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
    else:
        # if not a gropby then the original is correct, use that
        triu_indices = triu_indices_0

    # compute correlations, only store vlaues from upper right triangle
    corr_triu = data_df[regression_vars].corr().values[triu_indices]

    # create dataframe with rows, att1 label, attr2 label, correlation
    reg_df = pd.DataFrame(data=[[regression_vars[x],regression_vars[y],val]
                                for x,y,val in zip(*triu_indices,corr_triu)],
                columns = ['attr1','attr2',corr_name])

    # if groupby add subgroup vars
    if type(data_df) is pd.core.groupby.groupby.DataFrameGroupBy:
        #same for all
        reg_df['groupbyAttr'] = data_df.count().index.name
        # repeat the values each the number of time sfor the size of the triu
        reg_df['subgroup'] = list(data_df).groups.keys())*n_triu_values

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
        title for column of data frame tht will be created
    """
    # get locations of upper right triangle
    triu_indices = np.triu_indices(len(regression_vars))

    # compute correlations, only store vlaues from upper right triangle
    corr_triu = data_df[regression_vars].corr(), k=1)[triu_indices]

    # create dataframe with rows, att1 label, attr2 label, correlation
    reg_df = pd.DataFrame(data=[[regression_vars[x],regression_vars[y],val]
                                for x,y,val in zip(*triu_indices,triu_valuess)],
                columns = ['attr1','attr2',corr_name])

    return reg_df

def get_rate_trends(data_df,groupby_vars):
    """
    return a DataFrame of the linear corelations in a DataFrame

    Parameters
    -----------
    data_df : DataFrame
        tidy data
    """

    # groupby

    # compute means


    # cannot layer them, must et list of all combos?


def get_subgroup_trends(data_df,groupby_vars=None,
                            regression_vars=None,
                            rate_vars =None):
    """
    find subgroup and aggregate trends in the dataset, return a DataFrame that
    contains information necessary to filter for SP and relaxations

    Parameters
    -----------
    data_df : DataFrame
        data to find SP in, must be tidy
    groupby_vars : list of strings
        column names to use as grouping variables
    regression_vars : list of strings
        column names to use in regresison based trends
    rate_vars : list of strings
        column names to use in rate based trends
    """

    # if not specified, detect continous attributes and categorical attributes
    # from dataset
    if groupby_vars is None:
        groupby_data = data_df.select_dtypes(include=['object','int64'])
        groupby_vars = list(groupby_data)

    if regression_vars is None:
        regression_data = data_df.select_dtypes(include=['float64'])
        regression_vars = list(regression_data)

    # TODO: fix this to work
    # if rate_vars is None:
        # rate_data = data_df.select_dtypes(include=['Boolean'])

    # apply clustering and augment data with clusters

    results_df = pd.DataFrame(columns=RESULTS_DF_HEADER)

    # Tabulate aggregate statistics
    all_lin_trends = get_correlations(data_df,regression_vars,'allCorr')

    # iterate over groupby attributes
    for groupbyAttr in groupby_vars:
        #condition the data
        cur_grouping = data_df.groupby(groupbyAttr)

        # get subgoup trends
        curgroup_corr = get_correlations(cur_grouping,regression_vars,'subgroupCorr')

        # check rates

        # append

    # merge all trends with subgroup trends



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
