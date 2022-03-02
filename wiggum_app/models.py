import wiggum as wg
from itertools import combinations
import pandas as pd
import sys
import logging
from sklearn import mixture
import numpy as np
import json

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

def getDistanceHeatmapDict(labeled_df, cur_result_df):
    """
    Generate Distance Heatmap Dictitonary List for overview 
    by grouping the results and extracting distances from result table.

    Parameters
    -----------
    labeled_df : LabeledDataFrame
        object from which the cur_result_df was computed, used for meta information
    cur_result_df : DataFrame
        A result_df or derivative of it after filtering, detecting or ranking. 
    Returns
    --------
    distance_heatmap_dict_list: Distance Heatmap Dictitonary List formatted for use in visualization
    """

    distance_heatmap_dict_list = []

    for trend_type, trend_df in cur_result_df.groupby(['trend_type'], sort=False):

        # iterate over the GroupFeat variables
        for gby, gby_trend_df in trend_df.groupby('splitby'):
            # groupby the subgroups
            cgby = gby_trend_df.groupby('subgroup')
            # iterate over the values of the subgroups
            for gby_lev,df in cgby:
                distance_heatmap_dict = {}

                heatmap = df.pivot(index='dependent', columns='independent', values='distance')

                # replace Nan to 99
                heatmap.fillna(99, inplace=True)

                # trend display name
                trend_display_name = labeled_df.get_trend_display_name(trend_type)

                # detail view type
                detail_view_type = labeled_df.get_detail_view_type(trend_type)

                # overview legend type
                overview_legend_type = labeled_df.get_overview_legend_type(trend_type)

                distance_heatmap_dict = {'trend_type' : trend_type,
                            'trend_display_name': trend_display_name,
                            'detail_view_type': detail_view_type,
                            'overview_legend_type': overview_legend_type,
                            'splitby': gby,
                            'subgroup': gby_lev,
                            'heatmap':heatmap.to_dict('index')}

                distance_heatmap_dict_list.append(distance_heatmap_dict)

    return distance_heatmap_dict_list

def getDistanceHeatmapDict2D(labeled_df, cur_result_df):
    """
    Generate 2D Distance Heatmap Dictitonary List for overview 
    by grouping the results and extracting distances from result table.

    Parameters
    -----------
    labeled_df : LabeledDataFrame
        object from which the cur_result_df was computed, used for meta information
    cur_result_df : DataFrame
        A result_df or derivative of it after filtering, detecting or ranking. 
    Returns
    --------
    distance_heatmap_dict_list: Distance Heatmap Dictitonary List formatted for use in visualization
    """

    distance_heatmap_dict_list = []

    for trend_type, trend_df in cur_result_df.groupby(['trend_type'], sort=False):
        grouped_df = trend_df.groupby(['dependent','independent','splitby']).agg(
                                        {'distance': ['mean']}).reset_index()
        grouped_df.columns = ['dependent', 'independent', 'splitby', 'mean_distance']
        grouped_df["dep_indep"] = grouped_df['dependent'] + ' : ' + grouped_df['independent']
        heatmap = grouped_df.pivot(index='dep_indep', columns='splitby', values='mean_distance')

        # replace Nan to 99
        heatmap.fillna(99, inplace=True)

        distance_heatmap_dict = {}

        # trend display name
        trend_display_name = labeled_df.get_trend_display_name(trend_type)

        # detail view type
        detail_view_type = labeled_df.get_detail_view_type(trend_type)

        # overview legend type
        overview_legend_type = labeled_df.get_overview_legend_type(trend_type)

        distance_heatmap_dict = {'trend_type' : trend_type,
                    'trend_display_name': trend_display_name,
                    'detail_view_type': detail_view_type,
                    'overview_legend_type': overview_legend_type,
                    'heatmap':heatmap.to_dict('index')}

        distance_heatmap_dict_list.append(distance_heatmap_dict)

    return distance_heatmap_dict_list

def getAggregateDistanceHeatmapDict(labeled_df, cur_result_df):
    """
    Generate Aggregated Distance Heatmap Dictitonary List for overview 
    by grouping the results and extracting distances from result table.

    Parameters
    -----------
    labeled_df : LabeledDataFrame
        object from which the cur_result_df was computed, used for meta information
    cur_result_df : DataFrame
        A result_df or derivative of it after filtering, detecting or ranking. 
    Returns
    --------
    distance_heatmap_dict_list: Distance Heatmap Dictitonary List formatted for use in visualization
    """

    distance_heatmap_dict_list = []

    for trend_type, trend_df in cur_result_df.groupby(['trend_type'], sort=False):

        grouped_df = trend_df.groupby(['dependent','independent']).agg(
                                        {'distance': ['mean']}).reset_index()

        grouped_df.columns = ['dependent', 'independent', 'mean_distance']
        heatmap = grouped_df.pivot(index='dependent', columns='independent', values='mean_distance')
        
        # replace Nan to 99
        heatmap.fillna(99, inplace=True)
        
        distance_heatmap_dict = {}

        # trend display name
        trend_display_name = labeled_df.get_trend_display_name(trend_type)

        # detail view type
        detail_view_type = labeled_df.get_detail_view_type(trend_type)

        # overview legend type
        overview_legend_type = labeled_df.get_overview_legend_type(trend_type)

        distance_heatmap_dict = {'trend_type' : trend_type,
                    'trend_display_name': trend_display_name,
                    'detail_view_type': detail_view_type,
                    'overview_legend_type': overview_legend_type,
                    'heatmap':heatmap.to_dict('index')}

        distance_heatmap_dict_list.append(distance_heatmap_dict)

    return distance_heatmap_dict_list

def getAggregateSplitbyTableDict(labeled_df, cur_result_df):
    """
    Generate Dictitonary List for splitby level 
    by grouping the results and extracting distances from result table.

    Parameters
    -----------
    labeled_df : LabeledDataFrame
        object from which the cur_result_df was computed, used for meta information
    cur_result_df : DataFrame
        A result_df or derivative of it after filtering, detecting or ranking. 
    Returns
    --------
    splitby_table_dict_list: Distance Heatmap Dictitonary List formatted for use in visualization
    """

    splitby_table_dict_list = []

    for trend_type, trend_df in cur_result_df.groupby(['trend_type'], sort=False):
        grouped_df = trend_df.groupby(
                        ['dependent','independent','splitby']).agg(
                        {'distance': ['mean'], 'subgroup_trend_strength': ['mean']}).reset_index()

        grouped_df.columns = ['dependent', 'independent', 'splitby', 
                                'mean_distance', 'mean_subgroup_trend_strength']

        splitby_table_dict = {}

        # trend display name
        trend_display_name = labeled_df.get_trend_display_name(trend_type)

        # detail view type
        detail_view_type = labeled_df.get_detail_view_type(trend_type)

        # overview legend type
        overview_legend_type = labeled_df.get_overview_legend_type(trend_type)

        splitby_table_dict = {'trend_type' : trend_type,
                    'trend_display_name': trend_display_name,
                    'detail_view_type': detail_view_type,
                    'overview_legend_type': overview_legend_type,
                    'splitby_table':grouped_df.to_json(orient='records')}

        splitby_table_dict_list.append(splitby_table_dict)

    return splitby_table_dict_list

def getOverviewLegendType(distance_heatmap_dict):
    """
    Get overview legend types.

    Parameters
    -----------
    distance_heatmap_dict : Dictionary
        Distance Heatmap Dictitonary List formatted for use in visualization. 
    Returns
    --------
    overview_legend_types: List
       Legend types for overview distance matrices
    """
    overview_legend_types = [hd['overview_legend_type'] for hd in distance_heatmap_dict]

    # get unique values in overview_legend_types
    legend_types_unique = set(overview_legend_types)
    overview_legend_types = list(legend_types_unique)

    return overview_legend_types

def replaceTrendDisplayName(cur_result_df):
    """
    Add trend display name column to df.

    Parameters
    -----------
    cur_result_df : DataFrame
        A result_df or derivative of it after filtering, detecting or ranking. 
     
    Returns
    --------
    cur_result_df: DataFrame
       input with trend_type moved to the trend_name column and the display name in the trend_type column
    """

    # compute mapping dictionary to update tend names to diplay names
    name_mapper =  {k:v().display_name for k,v in wg.all_trend_types.items()}

    # preserve trend_type short names in the trend_name column
    cur_result_df['trend_name'] =  cur_result_df['trend_type']
    # replace the trend_types with the display names
    cur_result_df.replace({'trend_type': name_mapper}, inplace=True)    

    return cur_result_df

def getRankTrendDetail(labeled_df, dependent, independent, splitby):
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
    splitby : str
        a variable that will have splitby information                            
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
    sel_subgroup_trend = '_'.join(['rank_trend', 'subgroup_trend', dependent, independent, splitby])

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

def getAllRankTrendDetail(labeled_df):
    """
    Extract all stats for rank trend detail view.

    Parameters
    -----------
    labeled_df : DataFrame
        LabeledDataFrame                          
    Returns
    --------
    detail_df_dict_list: dict
        detail stats
    """

    # trend dictionary
    trend_idx_dict = {cur_trend.name: i for i, cur_trend in enumerate(labeled_df.trend_list)} 
    # get index for rank trend
    rank_trend_idx = trend_idx_dict.get("rank_trend")

    trend_precompute = labeled_df.trend_list[rank_trend_idx].trend_precompute

    detail_df_dict_list = []

    sel_agg_trend = '_'.join(['rank_trend', 'agg_trend'])

    for key1 in trend_precompute:
        if key1.startswith(sel_agg_trend):
            # subgroups' stats
            sel_subgroup_trend_all = key1.replace("agg_trend", "subgroup_trend")
            
            temp_key = []

            for key2 in trend_precompute:
                # remove the last subgroup string
                removed_string = key2.rsplit('_', 1)[0]
                if key2.startswith(sel_subgroup_trend_all) and not(removed_string in temp_key):
                    temp_key.append(removed_string)

                    # create a new DataFrame for detail view
                    detail_df = pd.DataFrame()

                    # aggregate's stats
                    detail_df['aggregate'] = trend_precompute[key1].stat

                    dependent = key2.split('_')[-4]
                    independent = key2.split('_')[-3]
                    splitby = key2.split('_')[-2]

                    sel_subgroup_trend = '_'.join([sel_subgroup_trend_all, splitby])
                    for key3 in trend_precompute:
                        if key3.startswith(sel_subgroup_trend):
                            # get value of the last segment after '-'
                            # subgroup' name can't have '_', otherwise partial subgroup name will be extracted
                            subgroup = key3.split('_')[-1]
                            detail_df[subgroup] = trend_precompute[key3].stat

                    detail_df.fillna(0, inplace=True)

                    detail_df_dict = {}
                    detail_df_dict = {'trend_type' : 'rank_trend',
                                'dependent' : dependent,
                                'independent' : independent,                                
                                'splitby' : splitby,
                                'detail_df':detail_df.to_json(orient='index')}

                    detail_df_dict_list.append(detail_df_dict)

    return detail_df_dict_list

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
