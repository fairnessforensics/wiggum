import detect_simpsons_paradox as dsp
from itertools import combinations
import pandas as pd
import sys
import logging
from sklearn import mixture
import numpy as np
import json

def getContinuousVariableName(data_df):
    """
    extract continuous variables' name

    Parameters
    -------------------
    data_df: DataFrame

    Returns
    -------------------
    continuousAttrs_labels: list
            A list has all the names for continuous variables

    """
    continuousAttrs = data_df.select_dtypes(include=['float64'])
    continuousAttrs_labels = list(continuousAttrs)
    
    return continuousAttrs_labels


def getCategoricalVariableName(data_df):
    """
    extract categorical variables' name

    Parameters
    -------------------
    data_df: DataFrame

    Returns
    -------------------
    list: list
            A list has all the names for categorical variables

    """
    groupbyAttrs = data_df.select_dtypes(include=['object','int64'])
    groupbyAttrs_labels = list(groupbyAttrs)    
    return groupbyAttrs_labels

def getBinaryVariableName(data_df):
    """
    extract binary variables' name

    Parameters
    -------------------
    data_df: DataFrame

    Returns
    -------------------
    list: list
            A list has all the names for binary variables

    """
    binaryAttrs = [col for col in data_df 
             if data_df[[col]].dropna().isin([0, 1]).all().values]

    binaryAttrs_labels = list(binaryAttrs)    
    return binaryAttrs_labels

def getSubCorrelationMatrix(data_df, regression_vars, groupby_vars):
    """
    Generate an array for subgroups' correlational matrix
    Parameters
    -----------
    data_df : DataFrame
        data organized in a pandas dataframe containing both categorical
        and continuous attributes.
    regression_vars : list
        list of continuous attributes by name in dataframe, if None will be
        detected by all float64 type columns in dataframe
    groupby_vars  : list
        list of group by attributes by name in dataframe, if None will be
        detected by all object and int64 type columns in dataframe
    Returns
    --------
    correlationMatrixSubgroup : array
        an array storing all subgroups' correlational matrix
    """

    correlationMatrixSubgroup = []
    groupby_info = []
    for groupbyAttr in groupby_vars:
        grouped_df_corr = data_df.groupby(groupbyAttr)[regression_vars].corr()
        groupby_value = grouped_df_corr.index.get_level_values(groupbyAttr).unique()

        for subgroup in groupby_value:
            subgroup_corr = grouped_df_corr.loc[subgroup]
            correlationMatrixSubgroup.append(subgroup_corr)
            
            groupInfo = {'groupby': groupbyAttr, 'value':subgroup}
            groupby_info.append(groupInfo)

    return correlationMatrixSubgroup, groupby_info

def auto_detect(data_df, initial_result_df, std_weights, std_weights_view, view_score_param, threshold, individual_weight_name, view_weight_name):
    """
    Auto detect SP
    Parameters
    -----------
    data_df : DataFrame
        data organized in a pandas dataframe containing both categorical
        and continuous attributes.
    initial_result_df : DataFrame
        a DataFrame that contains initial trend information. 
    std_weights: nparray or list of decimal numbers
        weights to add columns with
    std_weights_view: nparray or list of decimal numbers
        weights for the view to add columns with      
    view_score_param: dict of the parameter for add_view_score function
    threshold: an argument for SP detector          
    Returns
    --------
    result_df : dataframe
        a dataframe with SP info
    """
    # get SP rows
    result_df = dsp.get_SP_rows(initial_result_df, sp_type='SP_thresh', 
                    cols_pair = ['agg_trend','subgroup_trend'], colored=True, sp_args = threshold)

    # ranking
    result_df, ranking_view_df = getSPRankInfo(result_df, data_df, std_weights, std_weights_view, 
                                                view_score_param, individual_weight_name, view_weight_name)

    return result_df, ranking_view_df

def getInfoTable(data_df, std_weights, std_weights_view, view_score_param, individual_weight_name, view_weight_name):
    """
    Get trends infomation
    Parameters
    -----------
    data_df : DataFrame
        data organized in a pandas dataframe containing both categorical
        and continuous attributes.
    std_weights: nparray or list of decimal numbers
        weights to add columns with
    std_weights_view: nparray or list of decimal numbers
        weights for the view to add columns with      
    view_score_param: dict of the parameter for add_view_score function   
    Returns
    --------
    initial_result_df : dataframe
        a DataFrame that contains initial trend information
    ranking_view_df : dataframe
        a DataFrame that contains ranking information        
    """
    # get subgroup trends' info
    initial_result_df = dsp.get_subgroup_trends_1lev(data_df,['pearson_corr'])

    # add slope
    initial_result_df = dsp.add_slope_cols(data_df,initial_result_df)
    
    # add angle
    initial_result_df = dsp.add_angle_col(initial_result_df)

    # get ranking info
    initial_result_df, ranking_view_df = getInitialRankInfo(initial_result_df, 
                                                data_df, std_weights, std_weights_view, view_score_param,
                                                individual_weight_name, view_weight_name)

    return initial_result_df, ranking_view_df 

def getInitialRankInfo(result_df,data_df, std_weights, std_weights_view, view_score_param, individual_weight_name, view_weight_name):
    """
    return a DataFrame of trends with the views ranked
    Parameters
    -----------
    results_df : DataFrame
        results generated by detect_simpsons_paradox or get_subgroup_trends_1lev
    data_df : DataFrame
        data organized in a pandas dataframe containing both categorical
        and continuous attributes.
    std_weights: nparray or list of decimal numbers
        weights to add columns with   
    std_weights_view: nparray or list of decimal numbers
        weights for the view to add columns with 
    view_score_param: dict of the parameter for add_view_score function                           
    Returns
    --------
    result_df : dataframe
        a DataFrame that contains ranked information
    ranking_view_df : dataframe
        a DataFrame that contains ranking information          
    """ 
    # weight
    result_df = dsp.add_weighted(result_df,std_weights,name=individual_weight_name).sort_values(by=individual_weight_name,ascending=False)

    # rank by view
    # add view score
    for key,val in view_score_param.items():    
        result_df = dsp.add_view_score(result_df, key, val, True)

    # weight for view
    result_df = dsp.add_weighted(result_df,std_weights_view,name=view_weight_name)

    ranking_view_df = result_df[['feat1', 'feat2', 'group_feat', view_weight_name]].drop_duplicates()
    ranking_view_df = ranking_view_df.sort_values(by=view_weight_name,ascending=False)

    return result_df, ranking_view_df

def getSPRankInfo(result_df,data_df, std_weights, std_weights_view, view_score_param, individual_weight_name, view_weight_name):
    """
    return a DataFrame of trends with the views ranked for SP records
    Parameters
    -----------
    results_df : DataFrame
        results contain SP rows
    data_df : DataFrame
        data organized in a pandas dataframe containing both categorical
        and continuous attributes.
    std_weights: nparray or list of decimal numbers
        weights to add columns with   
    std_weights_view: nparray or list of decimal numbers
        weights for the view to add columns with 
    view_score_param: dict of the parameter for add_view_score function          
    Returns
    --------
    result_df : dataframe
        a DataFrame that contains SP ranked information
    """ 
    # weight
    result_df = dsp.add_weighted(result_df,std_weights,name=individual_weight_name).sort_values(by=individual_weight_name,ascending=False)    

    # check if the column already exists
    if 'SP_subgroups' in result_df.columns:   
        result_df = result_df.drop(columns=['SP_subgroups', 'gby_counts', 'portions'])
    
    # view counts 
    colored_view_df = dsp.count_sp_views(result_df, colored=True, portions=True, 
                                data_df = data_df, groupby_count=True)       
                                      
    result_df = dsp.add_view_count(result_df, colored_view_df,colored=True)                                

    # rank by view
    # add view score
    for key,val in view_score_param.items():   
        # remove the same column 
        column_name = key + "_" + val
        result_df = result_df.drop(columns=column_name)
        result_df = dsp.add_view_score(result_df, key, val, True)

    # weight for view
    result_df = dsp.add_weighted(result_df,std_weights_view,name=view_weight_name)

    ranking_view_df = result_df[['feat1', 'feat2', 'group_feat', view_weight_name]].drop_duplicates()
    ranking_view_df = ranking_view_df.sort_values(by=view_weight_name,ascending=False)

    return result_df, ranking_view_df    

def getRatioRateAll(data_df, target_var, protected_vars, weighting_var):
    """
    Generate an array for the rates of the protected class before further partition
    Parameters
    -----------
    data_df : DataFrame
        data organized in a pandas dataframe containing both categorical
        and continuous attributes.
    target_var : str
        a variable that will have a rate where the ranking flips
    protected_vars  : list
        list of protected variables     
    weighting_var : str
        a variable that have weight        
    Returns
    --------
    result : array
        an array storing the ratio of overall rates
    """

    overall_dat_all = []
    overall_ratio_all = []
    protectedVars = []

    for protected_var in protected_vars:
        data_df = data_df.dropna(axis=0,subset=[target_var])
        if weighting_var == '':
            overall_dat = data_df.groupby(protected_var)[target_var].mean()
        else:
            grouped = data_df.groupby(protected_var)
            get_wavg = lambda g: np.average(g[target_var], weights=g[weighting_var])
            overall_dat = grouped.apply(get_wavg)
              
        overall_dat_all.append(overall_dat)

        comb = list(combinations(overall_dat, 2))
        overall_ratio = [element[0]/element[1] for element in comb]

        overall_ratio_all.append(overall_ratio)
        protectedVars.append(protected_var)               
                
    return overall_ratio_all, protectedVars, overall_dat_all

def getRatioRateSub(data_df, target_var, protected_vars, groupby_vars, weighting_var):
    """
    Generate an array for the rates of the protected class after further partition
    Parameters
    -----------
    data_df : DataFrame
        data organized in a pandas dataframe containing both categorical
        and continuous attributes.
    target_var : str
        a variable that will have a rate where the ranking flips
    protected_vars  : list
        list of protected variables
    grouping_vars  : list
        list of grouping variables
    weighting_var : str
        a variable that have weight            
    Returns
    --------
    result : array
        an array storing ratio of rates in each subgroup
    """

    partition_dat_all = []
    partition_ratio_all = []

    for protected_var in protected_vars:
        for explanatory_var in groupby_vars:
            if protected_var != explanatory_var:
                data_df = data_df.dropna(axis=0,subset=[target_var])
                if weighting_var == '':
                    #overall_dat = data_df.groupby(protected_var)[target_var].mean()
                    partition_dat = data_df.groupby([explanatory_var, protected_var])[target_var].mean().unstack()
                else:
                    grouped = data_df.groupby([explanatory_var, protected_var])
                    get_wavg = lambda g: np.average(g[target_var], weights=g[weighting_var])
                    partition_dat = grouped.apply(get_wavg)
                    partition_dat = partition_dat.unstack()
        
                partition_dat_all.append(partition_dat)

                comb = list(combinations(partition_dat, 2))

                partion_ratio = pd.concat([partition_dat[col[0]]/partition_dat[col[1]] for col in comb], 
                                            axis=1, keys=comb)

                #partion_ratio.columns = partion_ratio.columns.map('/'.join)
                partion_ratio.columns.levels[0].astype(str)
                partion_ratio.columns.levels[1].astype(str)
                idx = partion_ratio.columns
                partion_ratio.columns = partion_ratio.columns.set_levels(
                                            [idx.levels[0].astype(str), idx.levels[1].astype(str)])
 
                partion_ratio.columns = partion_ratio.columns.map('/'.join)

                partition_ratio_all.append(partion_ratio)
                
    return partition_ratio_all, partition_dat_all

def getRatioStatAll(data_df, target_var, grouping_vars, isCount_var):
    """
    Generate an array for the rates of the protected class before further partition
    Parameters
    -----------
    data_df : DataFrame
        data organized in a pandas dataframe containing both categorical
        and continuous attributes.
    target_var : str
        a variable that will have a rate where the ranking flips
    grouping_vars  : list
        list of grouping variables which is either protected class or explanatory class
    isCount_var : str
        a variable that will have counting information        
    Returns
    --------
    result : array
        an array storing the ratio of overall stat
    """

    overall_dat_all = []
    overall_ratio_all = []
    protectedVars = []
    explanaryVars = []

    for protected_var in grouping_vars:
        for explanatory_var in grouping_vars:
            if protected_var != explanatory_var:

                grouped = data_df.groupby(protected_var)
                get_wavg = lambda g: np.average(g[target_var], weights=g[isCount_var])

                overall_dat = grouped.apply(get_wavg)
                overall_dat_all.append(overall_dat)

                comb = list(combinations(overall_dat, 2))
                overall_ratio = [element[0]/element[1] for element in comb]

                overall_ratio_all.append(overall_ratio)
                protectedVars.append(protected_var)               
                explanaryVars.append(explanatory_var)
                
    return overall_ratio_all, protectedVars, explanaryVars, overall_dat_all

def getClustering(data_df, regression_vars):
    """
    Generate a dataframe after clustering
    Parameters
    -----------
    data_df : DataFrame
        data organized in a pandas dataframe containing both categorical
        and continuous attributes.
    regression_vars : list
        list of continuous attributes by name in dataframe, if None will be
        detected by all float64 type columns in dataframe        
    Returns
    --------
    result : DataFrame
        a df with clustering infomation
    """
    for x1,x2 in combinations(data_df[regression_vars].columns,2):
        # run clustering
        dpgmm = mixture.BayesianGaussianMixture(n_components=20,
                                        covariance_type='full').fit(data_df[[x1,x2]])
    
        # agument data with clusters
        data_df['clust_'+ x1+ '_' + x2] = dpgmm.predict(data_df[[x1,x2]])
                
    return data_df  

def updateMetaData(labeled_df, meta):
    """
    Update Meta Data
    Parameters
    -----------
    labeled_df : DataFrame
        labeledDataFrame
    meta : DataFrame
        data organized in a pandas dataframe
    Returns
    --------
    None
    """
    meta_list =json.loads(meta)

    meta_df_user = pd.DataFrame(meta_list)

    # set var_type from user input
    var_types = meta_df_user['var_type'].tolist()
    labeled_df.set_var_types(var_types)

    # set isCount from user input
    roles = meta_df_user['role'].tolist()
    labeled_df.set_roles(roles)

    # set roles from user input
    meta_df_user['isCount'] = meta_df_user['isCount'].replace({'Y': True, 'N': False})
    counts = meta_df_user['isCount'].tolist()
    labeled_df.set_counts(counts)

    # set weighting_var from user input
    meta_df_user['weighting_var'] = meta_df_user['weighting_var'].replace('N/A', np.nan)
    weighting_vars = meta_df_user['weighting_var'].tolist()
    labeled_df.set_weighting_vars(weighting_vars)                

    return labeled_df  