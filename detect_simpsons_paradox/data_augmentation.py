import numpy as np
import pandas as import pd
import sklearn as skl

clustering_techniques = {'dpgmm': lambda df,var_list : skl.mixture.BayesianGaussianMixture(n_components=20,
                                covariance_type='full').fit(df[var_list]).predict(df[var_list])}


def add_cluster(data_df,view,name):
    """
    add a column to a DataFrame gernated by a clustering solution

    Parameters
    -----------
    data_df : DataFrame
        tidy data to cluster and augment
    view : list of strings
        list of column names that defines a view of the data to perform
    clustering in
    name : string
        name of clustering method to apply
    """

    #cluster the data_df



    #create column_name
    col_name = '_'.join(['_'.join(view),name])
    data_df[col_name] = clust_assignments

    return data_df


def add_quantile(data_df,vars_in,q,q_names=None):
    """
    add a column to a DataFrame generated from quantiles specified by `q` of
    variable `var`


    Parameters
    -----------
    data_df : DataFrame
        must be tidy
    var : string or list of strings
        column name(s) to compute quantile values of
    q : float or list
        if scalar then the new column will be {top, bottom, middle} using the
        bottom [0,q) [q,1-q), [1-q,1]. If q is a list it specifies the splits.
        Should be compatible with pandas.quantile
    q_names : list
        list of names for quantiles assumed to be in order otherwise numerical
        names will be assigned unles there q is a float or len(q) ==2
    """

    # make sure var is a list
    if type(var) == list:
        var_list = vars_in
    else:
        var_list = [vars_in]

    # transform q and generate names if necessary
    if type(q) == float:
        q_str = str(q)
        q_m_str = str(1-2*q)
        q_names = ['bottom'+q_str,'middle'+q_m_str,'top'+q_str]
        q = [q,1-q]

    # get quantile cutoffs for the columns of interest
    quantile_df = data_df[var_list].quantile(q)

    # create names

    # transform to labels for merging
    q_l = q.copy()
    q_u = q.copy()
    q_l.insert(0,0)
    q_u.append(1)

    min_names = {col:col+'_min' for col in var_list}
    max_names = {col:col+'_max' for col in var_list}


    # TODO: for large data, this should be done with copy instead of recompute

    # get quantile bottoms and rename to _min
    ql_df = data_df[var_list].quantile(q_l).rename(columns=min_names)
    # get quantile tops and rename to _max
    qu_df = data_df[var_list].quantile(q_u).rename(columns= max_names)
    # round up the last interval's upper limit for <=, < ranges
    q_u.iloc[-1] = np.ceil(q_u.iloc[-1])
    # rename index of uppers for concat to work properly
    qu_df = qu_df.rename(index={u:l for l,u in zip(q_l,q_u)})

    if q_names is None:
        q_df['quantile_name'] = [' - '.join([str(l),str(u)]) for l,u in zip(q_l,q_u)]
    else:
        q_df['quantile_name'] = q_names

    # concatenate uppers and lwoers
    q_intervals = pd.concat([ql_df,qu_df],axis=1)

    # iterate over vars
    for var in var_list:
        interval_column_key = {'start':var+'_min',
                                'end': var + '_max',
                                'label': 'quantile_name',
                                'source':var}
        data_df = interval_merge(data_df,q_intervals,interval_column_key)

    return data_df


def interval_merge(data_df, interval_df,interval_column_key):
    """
    add a column to an dataframes according to intervals specified in another
    DataFrame

    Parameters
    ----------
    data_df : DataFrame
        tidy df of data, will be augmented and returned
    interval_df : DataFrame
        df with columns to be used as start, stop, and label must be non
    overlapping and include a region for all values of data_df's source column
    interval_column_key : dict
        dictionary with keys: `start` `end` `label` with values as column names
        in interval_df and `source` with a value of a column name in data_df

    Returns
    --------
    data_df : DataFrame
        original DataFrame with new column named `interval_column_key['label']`
        that has valued from interval_df[interval_column_key['label']] assigned
        basedon the value in data_df[interval_column_key['source']] and the
        intervals defined in interval_df
    """

    # parse column names for easier usage
    source_col = interval_column_key['source']
    start_col = interval_column_key['start']
    end_col = interval_column_key['end']
    label_col = interval_column_key['label']

    # create piecewise function
    input_domain = np.linspace(np.min(interval_df[start_col]),np.max)
    assign_interval_label = np.piecewise()

    # evaluate a row and return true if val in [start,end)
    row_eval = lambda row,val: (val >=row[start_col])&(val<row[end_col])
    # evalutea all rows of a table, return true or false for each
    table_eval = lambda val: interval_df.apply(row_eval,args=(val,),axis=1)
    # return the label value for the true one
    get_label = lambda val: interval_df[label_col][table_eval(val)].item()

    # add the column
    data_df[label_col] = data_df[source_col].apply(get_label)

    return data_df




def cluster_augment_data_dpgmm(df,regression_vars):
    """
    brute force cluster in every pair of

    Parameters
    -----------
    df : DataFrame
        data organized in a pandas dataframe containing continuous attributes
        and potentially also categorical variables but those are not necessary
    regression_vars : list
        list of continuous attributes by name in dataframe

    Returns
    --------
    df : DataFrame
        input DataFrame with column added with label `clust_<var1>_<var2>`
    """
    for x1,x2 in itert.combinations(regression_vars,2):
        # run clustering
        dpgmm = skl.mixture.BayesianGaussianMixture(n_components=20,
                                        covariance_type='full').fit(df[[x1,x2]])

    # check if clusters are good separation or nonsense
    # maybe not?

        # agument data with clusters
        df['clust_'+ x1+ '_' + x2] = dpgmm.predict(df[[x1,x2]])

    return df
