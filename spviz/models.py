import detect_simpsons_paradox as dsp
from itertools import combinations
import pandas as pd

# Your models here.

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

def auto_detect(df, threshold):
    print("===============auto======================")
    result = dsp.detect_simpsons_paradox_threshold(df, threshold)
    print(result)
    return result

def getRatioRateAll(data_df, target_var, grouping_vars):
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
    Returns
    --------
    result : array
        an array storing the ratio of overall rates
    """

    overall_dat_all = []
    overall_ratio_all = []
    protectedVars = []
    explanaryVars = []

    for protected_var in grouping_vars:
        for explanatory_var in grouping_vars:
            if protected_var != explanatory_var:
                overall_dat = data_df.groupby(protected_var)[target_var].mean()
                overall_dat_all.append(overall_dat)
                #print(overall_dat)
                comb = list(combinations(overall_dat, 2))
                overall_ratio = [element[0]/element[1] for element in comb]
                #print(overall_ratio)
                overall_ratio_all.append(overall_ratio)
                protectedVars.append(protected_var)               
                explanaryVars.append(explanatory_var)
                
    return overall_ratio_all, protectedVars, explanaryVars, overall_dat_all

def getRatioRateSub(data_df, target_var, grouping_vars):
    """
    Generate an array for the rates of the protected class after further partition
    Parameters
    -----------
    data_df : DataFrame
        data organized in a pandas dataframe containing both categorical
        and continuous attributes.
    target_var : str
        a variable that will have a rate where the ranking flips
    grouping_vars  : list
        list of grouping variables which is either protected class or explanatory class
    Returns
    --------
    result : array
        an array storing ratio of rates in each subgroup
    """

    partition_dat_all = []
    partition_ratio_all = []

    for protected_var in grouping_vars:
        for explanatory_var in grouping_vars:
            if protected_var != explanatory_var:
                partition_dat = data_df.groupby([explanatory_var, protected_var])[target_var].mean().unstack()

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
                #print(partion_ratio)
                partition_ratio_all.append(partion_ratio)
                
    return partition_ratio_all, partition_dat_all