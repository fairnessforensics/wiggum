import numpy as np
import pandas as import pd
import sklearn as skl


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
