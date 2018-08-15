import pandas as pd
import numpy as np
import scipy.stats as stats
import itertools as itert


def add_slope_sp(data_df, result_df):
    """
    compute the slope for each entry of an sp result using the data

    Parameters
    -----------
    data_df : pandas dataframe
        data to be used for computing the slopes
    result_df : pandas dataframe (optional)
        results generated by detect_simpsons_paradox applied to data_df

    Returns
    --------
    a copy of result_df with subgroup_slope and all_slop columns adeed

    """
    #compute whole data slopes
    # iterate rows of result df
    new_res = result_df
    slope_list = []
    for i,row in result_df.iterrows():
        # extract data for that row
        data_rows = data_df.loc[data_df[row['groupbyAttr']]==row['subgroup']]
        attr1data = data_rows[row['attr1']]
        attr2data = data_rows[row['attr2']]
        # comput lin regress for data according to that row
        slope, intercept, r_value, p_value, std_err = stats.linregress(attr1data,attr2data)
        slope_list.append(slope)

    new_res['subgroup_slope'] = slope_list
    return new_res

def compute_slope_all(data_df,data_cols):
    """
    compute the slope of all of the overall (no conditioning) for each pair of
    of columns listed in data_cols

    Parameters
    -----------
    data_df : pandas DataFrame
        dataset to compute the slope of the trend of eac pair
    data_cols : list of strings
        names of columns to compute slope of (ie the continuous vars)

    Returns
    --------
    all_slopes_df : pandas DataFrame
        a dataframe with columns 'attr1', 'attr2' and 'all_slope' and one row
        per pair of variables in data_cols
    """
    all_slopes = []
    for a,b in itert.combinations(data_cols,2):
    # compute each slope
        slope, intercept, r_value, p_value, std_err = stats.linregress(data_df[a],data_df[b])
        all_slopes.append([a,b,slope])

    #save as df
    all_slopes_df = pd.DataFrame(data = all_slopes, columns = ['attr1','attr2','all_slope'])
    return all_slopes_df

def add_slope_cols(data_df, result_df):
    """
    compute the slope for each SP occurence for the data and for all pairs
    of variables that have an associated SP occurrence and add the subgroup and
    all sample slope columns to the result_df

    Parameters
    -----------
    data_df : DataFrame
        data organized in a pandas dataframe containing both categorical
        and continuous attributes that was used to generate the results df
    results_df : DataFrame
        results generated by detect_simpsons_paradox

    """
    # find sp variables from result_df
    all_sp_vars = set(np.append(result_df.attr1.values,
                                result_df.attr2.values))

    result_df = add_slope_sp(data_df,result_df)

    all_slopes_df = compute_slope_all(data_df,all_sp_vars)

    results_df_slopes = result_df.merge(all_slopes_df,
                        left_on=['attr1','attr2'], right_on=['attr1','attr2'])

    return results_df_slopes

def compute_angle(row):
    """
    compute angle between the overall ('all_slope') and subgroup
    ('subgroup_slope') slopes for a row of a dataframe.

    Parameters
    ----------
    row : row of DataFrame
        row of results generated by detect_simpsons_paradox
    """
    theta_sub = np.arctan(row['subgroup_slope'])
    theta_all = np.arctan(row['all_slope'])
    return np.rad2deg(theta_all - theta_sub)

def add_angle_col(results_df_slopes):
    """
    add a column that  includes the angle between two slope columns, slopes must
    already have been added to the datafrape in columns named 'subgroup_slope'
    and 'all_slope'

    Parameters
    -----------
    results_df_slopes : DataFrame
        results dataframe iht slopes added as per

    Returns
    results_df_slopes : DataFrame
        DataFrame input with added 'angle' column
    """

    # compute and add angles
    results_df_slopes['angle'] = results_df_slopes.apply(compute_angle,axis=1)
    return results_df_slopes

def add_weighted(df,cols_weight_dict,name=None):
    """
    add a column that is the weighted sum of normalized values other columns for
    ranking

    Parameters
    ------------
    df : DataFrame
        DataFrame to work with
    cols_list : list of strings
        names of columns to add together
    weights : nparray or list of decimal numbers
        weights to add columns with

    Returns
    --------
    df : DataFrame
        DataFrame with an additional column

    """
    if name is None:
        # create name
        sum_name = '_'.join([str(w) + c for c,w, in cols_weight_dict.items()])
    else:
        sum_name =name

    # normalize data so that columns add together better
    col_names = list(cols_weight_dict.keys())
    df_normalized = np.abs((df[col_names]-df[col_names].min())/(df[col_names].max()-df[col_names].min()))

    #aggreate
    wsum = lambda r: np.average(r,weights=list(cols_weight_dict.values()))
    df[sum_name] = df_normalized.agg(wsum,axis="columns")
    return df

def rank_weighted(df,cols_list,weights):
    """
    rank by a new column that is the weighted sum of other columns
    """
    name = '_'.join([str(w) + c for c,w, in zip(cols_list,weights)])
    df_with_weighted = add_weighted(df,cols_list,weights)
    return df_with_weighted.sort_values(name,ascending=False)

def get_SP_views(results_df):
    """
    return a list of tuples of the views of the dataset that have at least one
    occurence of SP. Assumes no views are listed in in opposite orders

    Parameters
    -----------
    results_df : DataFrame
        reustls generated by detect_simpsons_paradox

    Returns
    ---------
    sp_views_unique : list of tuples
        list of the view pairs

    """
    # get all the views in a zip iterator
    views_per_occurence = zip(results_df.attr1.values,results_df.attr2.values)
    # iterate over pairs to make list, get unique by type casting to a set
    sp_views_unique = set([(a,b) for a,b in views_per_occurence])

    # type cast back to list to return
    return list(sp_views_unique)

def get_SP_colored_views(results_df):
    """
    return a list of tuples of the colored views (2 vars, 1 groupbyAttrs) of the
    dataset that have at least one occurence of SP. Assumes no views are listed
    in in opposite orders

    Parameters
    -----------
    results_df : DataFrame
        results generated by detect_simpsons_paradox

    Returns
    ---------
    sp_colored_views_unique : list of tuples
        list of the colored view triplets


    """
    # get all the views in a zip iterator
    colored_views_per_occurence = zip(results_df.attr1.values,
                                      results_df.attr2.values,
                                      results_df.groupbyAttr.values)
    # iterate over pairs to make list, get unique by type casting to a set
    sp_colored_views_unique = set([(a,b,c) for a,b,c in colored_views_per_occurence])

    # type cast back to list to return
    return list(sp_colored_views_unique)

def count_sp_views(results_df, colored= False, portions =False,data_df= None):
    """
    return the count of SP occurences for a given view or colored view,
    optionally also count the share of possible sp occurences that were found


    Parameters
    ------------
    results_df : DataFrame
        results generated by detect_simpsons_paradox
    colored : Boolean [default=False]
        colored (including a groupbyAttr) views or not
    portion : Boolean [default=False]
        count possible values as well


    Returns
    ----------
    count_df : DataFrame
        counts per view
    """
    # determine which vars to groupby
    if colored or portions:
        view_vars = ['attr1','attr2','groupbyAttr']
    else:
        view_vars = ['attr1','attr2']


    # group by variables that define a colored view
    # count the subgroup column (or any other column, since no missing values)
    # reset the index to make it a tidy DataFrame instead of multilevel
    count_df = results_df.groupby(view_vars)['subgroup'].count().reset_index()

    count_df = count_df.rename(columns={'subgroup':'SP_subgroups'})


    # prep for portions
    if portions and data_df is None:
        portions = False
        #add error message here
    if portions :
        # count possible values for groupby attributes
        # cast to set to get unique values of grouby vars that have SP
        groupbyAttr_list = set(results_df.groupbyAttr.values)
        # for each one make a dict with keys of variables and vlaues of the
        #   number of levels in the dataset
        levels_by_attr = {gby:len(set(data_df[gby].values)) for
                                                        gby in groupbyAttr_list}

        levels_per_sp_view = [levels_by_attr[a] for a in count_df['groupbyAttr']]
        count_df['portions'] =  count_df['SP_subgroups']/levels_per_sp_view


    return count_df

def add_view_count(result_df,count_df,colored=False):
    """
    add the view counts to a result df for occurence ranking based on view rank

    Parameters
    ------------
    results_df : DataFrame
        results generated by detect_simpsons_paradox
    colored : Boolean [default=False]
        colored (including a groupbyAttr) views or not
    count_df : DataFrame
        produced by above
    """
    # determine which vars to merge on
    if colored:
        view_vars = ['attr1','attr2','groupbyAttr']
    else:
        view_vars = ['attr1','attr2']

    return result_df.merge(count_df, left_on = view_vars, right_on=view_vars)

def mark_designed_rows(result_df,design_list_tuples):
    """
    add a column to a result_df that marks which are designed

    Parameters
    -----------
    result_df : DataFrame
        generaed from detect_simpsons_paradox
    design_list_tuples : list of tuples
        a list of the attributes with designed in SP. in the form
        [(attr1,attr2,groupbyAttr),...]

    Returns
    --------
    result_df : DataFrame
    with added column 'designed' with boolean values
    """
#
    des = []

    # create a list of the rows with the designed in cases
    for i,r in enumerate(result_df[['attr1','attr2','groupbyAttr']].values):
        if tuple(r) in design_list_tuples:
            des.append(i)

    # add a column of all False values
    result_df['designed'] = False
    # change the designed ones to true
    result_df.loc[des,'designed'] = True

    return result_df
