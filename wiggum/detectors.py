import pandas as pd
import numpy as np
import scipy.stats as stats
import itertools as itert

## constants

RESULT_DF_HEADER_old = ['attr1','attr2','allCorr','subgroupCorr','groupbyAttr','subgroup']

RESULT_DF_HEADER = ['feat1','feat2','trend_type','group_feat', 'agg_trend',
                    'subgroup','subgroup_trend']

RESULT_DF_HEADER_PAIRWISE = ['feat1','feat2','trend_type','group_feat',
                    'subgroup','subgroup_trend','subgroup2','subgroup_trend2']

RESULT_DF_HEADER_ALL = ['feat1','feat2','trend_type','group_feat', 'agg_trend',
                    'subgroup','subgroup_trend','subgroup2','subgroup_trend2']

#also in ranking_processing
result_df_type_col_name = 'comparison_type'



from .trends import all_trend_types


def get_views(result_df,colored=False):
    """
    return a list of tuples of the views of the dataset that have at least one
    trend. Assumes no views are listed in in opposite orders

    Parameters
    -----------
    result_df : DataFrame
        reustls generated by detect_simpsons_paradox
    colored : Boolean
        use 'colored' views or not if True, a view is defined by 2 features and
        a grouping variable, if False a view is defined by 2 features only


    Returns
    ---------
    sp_views_unique : list of tuples
        list of the view pairs

    """
    # get all the views in a zip iterator
    if colored:
        views_per_occurence = zip(result_df.feat1.values,
                                    result_df.feat2.values,
                                    result_df.group_feat.values)
        views_unique = set([(a,b,c) for a,b,c in views_per_occurence])
    else:
        # uncolored (no grouping var)
        views_per_occurence = zip(result_df.feat1.values,
                                 result_df.feat2.values)
        # iterate over pairs to make list, get unique by type casting to a set
        views_unique = set([(a,b) for a,b in views_per_occurence])

    # type cast back to list to return
    return list(views_unique)

################################################################################
# helper Mixin class
################################################################################
class _TrendDetectors():
    """
    a mixin class of detectors and trend computations
    """


    def get_SP_views(self,thresh=0, colored=False):
        """
        return a list of tuples of the views of the dataset that have at least one
        occurence of SP. Assumes no views are listed in in opposite orders

        Parameters
        -----------
        result_df : DataFrame
            reustls generated by get_subgroup_trends_*
        filter_thresh : dict or string
            dictionary of column label, threshold pairs or string name of a
            prespecified dictionary if dict, must include 'name' field (which
            will be used as the column name for storing the detections)

        Returns
        ---------
        sp_views_unique : list of tuples
            list of the view pairs

        """

        # filter
        sp_df = self.get_SP_rows(thresh)


        return get_views(sp_df,colored)

    def get_SP_rows(self,thresh=None,inplace=False,replace=False):
        """
        return a list of tuples of the rows of the dataset that have at least one
        occurence of SP.

        Parameters
        -----------
        filter_thresh : dict or string
            dictionary of column label, threshold pairs or string name of a
            prespecified dictionary if dict, must include 'name' field (which
            will be used as the column name for storing the detections)
        inplace : Boolean
            replace the result_df with what is found
        replace : Boolean
            replace the column with the given name by a new computation

        Returns
        ---------
        sp_views_unique : list of tuples
            list of the view pairs

        """
        # col_name
        if thresh:

            if type(thresh) == dict:
                col_name = thresh['name']
            elif type(thresh) == str:
                col_name = thresh
            else:
                # for compatibility with old passing a distance threshold
                col_name = 'SP_thresh' +str(thresh)
                thresh = {'distance':thresh,'name':col_name}

        else:
            thresh = 'SP'
            col_name = 'SP'

        # label if not
        if not(col_name in self.result_df.columns ) or replace:
            # add dist if not
            if not('distance' in self.result_df.columns):
                self.add_distance()

            col_name = self.label_SP_rows(thresh)



        # always filter result and return
        sp_df = self.result_df[self.result_df[col_name]]

        # overwrite if inplace
        if inplace:
            self.result_df = sp_df

        return sp_df




    def get_subgroup_trends_1lev(self,trend_types, replace=False):
        """
        find subgroup and aggregate trends in the dataset, return a DataFrame that
        contains information necessary to filter for SP and relaxations
        computes for 1 level grouby (eg correlation and linear trends)

        Parameters
        -----------
        labeled_df : LabeledDataFrame
            data to find SP in, must be tidy
        trend_types: list of strings or list trend objects
            info on what trends to compute and the variables to use, dict is of form
        {'name':<str>,'vars':['varname1','varname1'],'func':functionhandle}

        """
        data_df = self.df
        groupby_vars = self.get_vars_per_role('groupby')


        if type(trend_types[0]) is str:
            # instantiate objects
            self.trend_list.extend([all_trend_types[trend]()
                                                    for trend in trend_types])
        else:
            # use provided, must be instantiated
            self.trend_list.extend(trend_types)

        # prep the result df to add data to later
        if self.result_df.empty:
            self.result_df = pd.DataFrame(columns=RESULT_DF_HEADER)

        # create empty lists
        all_trends = []
        subgroup_trends = []

        for cur_trend in self.trend_list:
            cur_trend.get_trend_vars(self)

            # augment the data with precomputed parts if needed


            if cur_trend.preaugment == 'confusion':
                acc_pairs = itert.product(cur_trend.groundtruth,
                                            cur_trend.prediction)

                for var_pair in acc_pairs:
                    # TODO: only if col not there already
                    self.add_acc(*var_pair)


            # Tabulate aggregate statistics
            agg_trends = cur_trend.get_trends(self.df,'agg_trend')

            all_trends.append(agg_trends)

            # iterate over groupby attributes
            for groupbyAttr in groupby_vars:

                #condition the data
                cur_grouping = self.df.groupby(groupbyAttr)

                # get subgoup trends
                curgroup_corr = cur_trend.get_trends(cur_grouping,'subgroup_trend')

                # append
                subgroup_trends.append(curgroup_corr)




        # condense and merge all trends with subgroup trends
        subgroup_trends = pd.concat(subgroup_trends, sort=False)
        all_trends = pd.concat(all_trends)
        new_res = pd.merge(subgroup_trends,all_trends)

        # remove rows where a trend is undefined
        new_res.dropna(subset=['subgroup_trend','agg_trend'],axis=0,inplace=True)

        new_res[result_df_type_col_name] = 'aggregate-subgroup'

        if self.result_df.empty or replace:
            # print('replacing',self.result_df.empty,replace)
            self.result_df = new_res
        else:

            # print('appending ',len(new_res), ' to ',len(self.result_df))
            self.result_df = pd.concat([self.result_df,new_res])
        # ,on=['feat1','feat2'], how='left



        return self.result_df


    def get_pairwise_trends_1lev(self,trend_types, replace=False):
        """
        find subgroup and aggregate trends in the dataset, return a DataFrame that
        contains information necessary to filter for SP and relaxations
        computes for 1 level grouby (eg correlation and linear trends)

        Parameters
        -----------
        labeled_df : LabeledDataFrame
            data to find SP in, must be tidy
        trend_types: list of strings or list trend objects
            info on what trends to compute and the variables to use, dict is of form
        {'name':<str>,'vars':['varname1','varname1'],'func':functionhandle}

        """
        data_df = self.df
        groupby_vars = self.get_vars_per_role('groupby')


        if type(trend_types[0]) is str:
            # instantiate objects
            self.trend_list.extend([all_trend_types[trend]()
                                                    for trend in trend_types])
        else:
            # use provided, must be instantiated
            self.trend_list.extend(trend_types)


        # create empty lists
        all_trends = []
        subgroup_trends = []
        pairwise = []

        for cur_trend in self.trend_list:
            cur_trend.get_trend_vars(self)

            # augment the data with precomputed parts if needed


            if cur_trend.preaugment == 'confusion':
                acc_pairs = itert.product(cur_trend.groundtruth,
                                            cur_trend.prediction)

                for var_pair in acc_pairs:
                    # TODO: only if col not there already
                    self.add_acc(*var_pair)


            # # Tabulate aggregate statistics
            # agg_trends = cur_trend.get_trends(self.df,'agg_trend')
            #
            # all_trends.append(agg_trends)

            # iterate over groupby attributes
            for groupbyAttr in groupby_vars:

                #condition the data
                cur_grouping = self.df.groupby(groupbyAttr)

                # get subgoup trends
                curgroup_corr = cur_trend.get_trends(cur_grouping,'subgroup_trend')

                # append
                subgroup_trends.append(curgroup_corr)

        # merge together
        lgroup = pd.concat(subgroup_trends,axis=0,sort=False).reset_index()
        # make a copy and rename them to 2
        rgroup = lgroup.copy()
        # TODO: unhardcode this
        rgroup.rename(columns={'subgroup_trend':'subgroup_trend2',
                            'subgroup_trend_strength':'subgroup_trend_strength2',
                            'subgroup':'subgroup2'}, inplace=True)
        # merge back together
        pairwise_df = pd.merge(lgroup,rgroup)
        # TODO remove when subgroup is the same

        # remove rows where a trend is undefined
        pairwise_df.dropna(subset=['subgroup_trend','subgroup_trend2'],
                                axis=0,inplace=True)

        pairwise_df[result_df_type_col_name] = 'pairwise'

        if self.result_df.empty or replace:
            print('replaceing')
            self.result_df = pairwise_df
        else:
            print('appending')
            self.result_df = pd.concat([self.result_df,pairwise_df],axis = 0,
                                    sort=True)
        # ,on=['feat1','feat2'], how='left


        return self.result_df



                # make pairwise rows

                # Probalby too brute force
                # for view, view_df, in curgroup_corr.groupby(['feat1','feat2']):
                #
                #     sg_vars = pd.unique(view_df['subgroup'])
                #
                #     merge_subsets = {sg:df for sg,df in view_df.groupby('subgroup')}
                #     for lsel,rsel in itert.combinations(sg_vars,2):
                #         # TODO: unhardcode this
                #         r_sub = merge_subsets[rsel].rename(columns={'subgroup_trend':'subgroup_trend2',
                #                                                     'subgroup_trend_strength':'subgroup_trend_strength2',
                #                                                    'subgroup':'subgroup2'})
                #
                #         r_sub = r_sub[['subgroup_trend2','subgroup_trend_strength2','trend_type','subgroup2']]
                #         pairwise.append(pd.merge(merge_subsets[lsel],r_sub,on=['trend_type'],sort=False))



        # merge and condense all
        #  Probalby too brute force
        # pairwise_df = pd.concat(pairwise,axis=0,sort=False).reset_index()
        # pairwise_df.drop('index',axis=1,inplace=True)




    def get_subgroup_trends_2lev(self,trend_types):
        """
        find subgroup and aggregate trends in the dataset,

        Parameters
        -----------

        """

        data_df = self.df
        groupby_vars = self.get_vars_per_role('groupby')


        if type(trend_types[0]) is str:
            # instantiate objects
            self.trend_list = [all_trend_types[trend]() for trend in trend_types]
        else:
            # use provided
            self.trend_list = trend_types

        # prep the result df to add data to later
        self.result_df = pd.DataFrame(columns=RESULT_DF_HEADER)

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
        result_df = pd.merge(subgroup_trends,all_trends)
        # ,on=['feat1','feat2'], how='left

        return result_df









################################################################################
# helper functions
################################################################################


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
    LEGACY
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
    result_df = pd.DataFrame(columns=RESULT_DF_HEADER)

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
                temp_df = pd.DataFrame(data=all_corr_info,columns=['agg_trend','feat1','feat2'])

                # # Convert index from float to int
                temp_df.feat1 = temp_df.feat1.astype(int)
                temp_df.feat2 = temp_df.feat2.astype(int)
                # Convert indices to attribute names for readabiity
                temp_df.feat1 = temp_df.feat1.replace({i:a for i, a in
                                            enumerate(regression_vars)})
                temp_df.feat2 = temp_df.feat2.replace({i:a for i, a in
                                            enumerate(regression_vars)})

                temp_df['subgroup_trend'] = reverse_list
                len_list = len(reverse_list)
                # Store group attributes' information
                temp_df['group_feat'] = [groupbyAttr for i in range(len_list)]
                temp_df['subgroup'] = [subgroup for i in range(len_list)]
                result_df = result_df.append(temp_df, ignore_index=True)

    return result_df




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
