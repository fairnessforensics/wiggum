import wiggum as wg
from itertools import combinations
import pandas as pd
import sys
import logging
from sklearn import mixture
import numpy as np
import json

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
        LabeledDataFrame
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

def checkSameMetadata(labeled_df, meta):
    """
    Check if any metadata changes
    Parameters
    -----------
    labeled_df : DataFrame
        LabeledDataFrame
    meta : DataFrame
        user input metadata
    Returns
    --------
    checkResult : Boolean
        check result: if same returns True, different returns False
    """
    meta_list =json.loads(meta)

    meta_df_user = pd.DataFrame(meta_list)

    # initial check result
    checkResult = True

    # rename
    meta_df_user.rename(columns={'name': 'variable'}, inplace=True)
    # set as index
    meta_df_user.set_index('variable', inplace=True)

    # set roles from user input
    meta_df_user['isCount'] = meta_df_user['isCount'].replace({'Y': True, 'N': False})

    # set weighting_var from user input
    meta_df_user['weighting_var'] = meta_df_user['weighting_var'].replace('N/A', np.nan)
    
    # append dtype to user input metadata
    meta_df_user['dtype'] = labeled_df.meta_df['dtype']

    # check equal after sorting the columns
    if meta_df_user.sort_index(axis=1).equals(labeled_df.meta_df.sort_index(axis=1)):
        checkResult = True
    else:
        checkResult = False

    return checkResult

def getDistanceHeatmapDict(df):
    """
    Generate Distance Heatmap Dictitonary List for overview 
    by grouping the results and extracting distances from result table.

    Parameters
    -----------
    df : DataFrame
        LabeledDataFrame    
    Returns
    --------
    distance_heatmap_dict_list: Distance Heatmap Dictitonary List formatted for use in visualization
    """

    distance_heatmap_dict_list = []

    for trend_type, trend_df in df.groupby(['trend_type'], sort=False):

        # iterate over the GroupFeat variables
        for gby, gby_trend_df in trend_df.groupby('group_feat'):
            # groupby the subgroups
            cgby = gby_trend_df.groupby('subgroup')
            # iterate over the values of the subgroups
            for gby_lev,df in cgby:
                distance_heatmap_dict = {}

                heatmap = df.pivot(index='dependent', columns='independent', values='distance')

                # replace Nan to 99
                heatmap.fillna(99, inplace=True)

                distance_heatmap_dict = {'trend_type' : trend_type,
                            'group_feat': gby,
                            'subgroup': gby_lev,
                            'heatmap':heatmap.to_dict('index')}

                distance_heatmap_dict_list.append(distance_heatmap_dict)

    return distance_heatmap_dict_list

def getRankTrendDetail(labeled_df, dependent, independent, group_feat):
    """
    Extract stats for rank trend detail view.

    Parameters
    -----------
    labeled_df : DataFrame
        LabeledDataFrame    
    independent : str
        a variable that will have independent information    
    dependent : str
        a variable that will have dependent information    
    group_feat : str
        a variable that will have group_feat information                            
    Returns
    --------
    detail_df: dataframe
        detail stats
    count_df: dataframe
        detail counts
    """

    # trend dictionary
    trend_idx_dict = {cur_trend.name: i for i, cur_trend in enumerate(labeled_df.trend_list)} 
    # get index for rank trend
    rank_trend_idx = trend_idx_dict.get("rank_trend")

    trend_precompute = labeled_df.trend_list[rank_trend_idx].trend_precompute

    # aggregate' stats
    sel_agg_trend = '_'.join(['rank_trend', 'agg_trend', dependent, independent])

    # create a new DataFrame for detail view
    detail_df = pd.DataFrame()

    # create a new DataFrame for counts
    count_df = pd.DataFrame()

    # aggregate's stats
    detail_df['aggregate'] = trend_precompute[sel_agg_trend].stat
    # aggregate's count
    count_df['aggregate'] = trend_precompute[sel_agg_trend]['count']

    # subgroups' stats
    sel_subgroup_trend = '_'.join(['rank_trend', 'subgroup_trend', dependent, independent, group_feat])

    for key in trend_precompute:
        if key.startswith(sel_subgroup_trend):
            # get value of the last segment after '-'
            # subgroup' name can't have '_', otherwise partial subgroup name will be extracted
            subgroup = key.split('_')[-1]
            detail_df[subgroup] = trend_precompute[key].stat
            count_df[subgroup] = trend_precompute[key]['count']

    # transform count_df for bar charts
    count_df = count_df.stack().unstack(0)
    count_df.index.name = 'subgroup'
    
    detail_df.fillna(0, inplace=True)
    count_df.fillna(0, inplace=True)

    return detail_df, count_df

def getResultDict(labeled_df, result_df, filter_subgroup= None):
    """
    Get Result Dictitonary
    Parameters
    -----------
    labeled_df : DataFrame
        LabeledDataFrame
    result_df : DataFrame
        result_df from LabeledDataFrame
    filter_subgroup : list, or  None
            value of groupby_feat or or None to include all
    Returns
    --------
    result_dict_dict
    """
    trend_type_list = pd.unique(result_df['trend_type'])

    result_dict_dict = {}
    # set the result table in result dict
    index = 0
    result_dict_dict[index] = result_df.to_json(orient='records')

    # set the csv
    index = 1
    csv_data_out = labeled_df.df.to_dict(orient='records')
    csv_data_out = json.dumps(csv_data_out, indent=2)
    result_dict_dict[index] = csv_data_out
    index = index + 1
    for trend_type in trend_type_list:
        result_dict = {}

        if trend_type == 'pearson_corr':
            # Constructing the data for visualization
            # Regression
            pearson_corr_df = result_df.loc[result_df['trend_type'] == 'pearson_corr']
            independent_vars = list(pd.unique(pearson_corr_df['independent']))
            dependent_vars = list(pd.unique(pearson_corr_df['dependent']))
            regression_vars = independent_vars + dependent_vars

            regression_vars = list(dict.fromkeys(regression_vars))
            categoricalVars = list(pd.unique(pearson_corr_df['group_feat']))

            # get correlation for all continuous variables
            corrAll = labeled_df.df[regression_vars].corr()

            # subgroup correlation matrix
            correlationMatrixSubgroups = []
            correlationMatrixSubgroups, groupby_info = getSubCorrelationMatrix(labeled_df.df, regression_vars, categoricalVars, filter_subgroup)

            all_attrs = np.append(regression_vars, categoricalVars)

            result_dict = {'trend_type' : 'pearson_corr',
                            'categoricalVars': categoricalVars,
                            'continousVars': regression_vars,
                            'corrAll': corrAll.to_json(),
                            'groupby_info': groupby_info,
                            'corrSubs': [corrSub.to_json() for corrSub in correlationMatrixSubgroups]}

            result_dict_dict[index] = result_dict
            index =  index + 1

        elif trend_type == 'rank_trend':
            rank_trend_df = result_df.loc[result_df['trend_type'] == 'rank_trend']
            targetAttr_list = pd.unique(rank_trend_df['independent'])

            for targetAttr in targetAttr_list:
                current_df =  result_df
                current_df = current_df.loc[(current_df['independent'] == targetAttr) & (current_df['trend_type'] == 'rank_trend')]

                protectedAttrs = pd.unique(current_df['dependent'])
                groupbyAttrs = pd.unique(current_df['group_feat'])

                if pd.notna(labeled_df.meta_df['weighting_var'][targetAttr]):
                    weighting_var = labeled_df.meta_df['weighting_var'][targetAttr]
                else:
                    weighting_var = ''

                ratioRateAll, protectedVars, rateAll = getRatioRateAll(labeled_df.df,
                                                                        targetAttr, protectedAttrs, weighting_var)

                ratioRateSub, rateSub = getRatioRateSub(labeled_df.df, targetAttr, protectedAttrs, groupbyAttrs, weighting_var)

                protected_groupby_attrs = np.append(protectedAttrs, groupbyAttrs)
                protected_groupby_attrs = pd.unique(protected_groupby_attrs)
                all_attrs = np.append(protected_groupby_attrs, [targetAttr])

                # adding weighting_var
                if weighting_var != '':
                    all_attrs = np.append(all_attrs, [weighting_var])

                target_var_type = labeled_df.meta_df['var_type'][targetAttr]

                result_dict = {'trend_type' : 'rank_trend',
                            'protectedVars': protectedVars,
                            'explanaryVars': groupbyAttrs.tolist(),
                            'targetAttr': targetAttr,
                            'target_var_type': target_var_type,
                            'weighting_var': weighting_var,
                            'ratioRateAll': ratioRateAll,
                            'rateAll':[eachRateAll.to_json() for eachRateAll in rateAll],
                            'ratioSubs': [ratioSub.to_json() for ratioSub in ratioRateSub],
                            'rateSubs': [eachRateSub.to_json() for eachRateSub in rateSub]}

                result_dict_dict[index] = result_dict
                index =  index + 1

    return result_dict_dict

def getMetaDict(labeled_df):
    """
    Get Display Dictitonary for index.html
    Parameters
    -----------
    labeled_df : DataFrame
        LabeledDataFrame
    Returns
    --------
    result_dict : Dictionary for meta data
    """
    result_dict = {}

    # get variable names
    var_names = labeled_df.meta_df.index.tolist()

    # get var_types for dropbox
    var_types = []
    var_types = labeled_df.meta_df['var_type'].tolist()

    # get isCounts for dropbox
    isCounts = []
    isCounts = labeled_df.meta_df['isCount'].replace({True: 'Y', False: 'N'}).tolist()

    # get isCounts for dropbox
    roles = []
    roles = labeled_df.meta_df['role'].tolist()

    # get weighting_vars for dropbox
    weighting_vars = []
    weighting_vars = labeled_df.meta_df['weighting_var'].fillna('N/A').tolist()

    # get sample for data
    sample_list = []
    sample_list = labeled_df.get_data_sample()

    result_dict = {'var_names': var_names,
                    'var_types': var_types,
                    'isCounts': isCounts,
                    'roles': roles,
                    'weighting_vars': weighting_vars,
                    'samples': sample_list}

    return result_dict

class Decoder(json.JSONDecoder):
    def decode(self, s):
        result = super().decode(s)  # result = super(Decoder, self).decode(s) for Python 2.x
        return self._decode(result)

    def _decode(self, o):
        if isinstance(o, str):
            try:
                return int(o)
            except ValueError:
                return o
        elif isinstance(o, dict):
            return {k: self._decode(v) for k, v in o.items()}
        elif isinstance(o, list):
            return [self._decode(v) for v in o]
        else:
            return o
