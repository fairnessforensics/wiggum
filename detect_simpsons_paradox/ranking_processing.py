import pandas as pd
import numpy as np
import scipy.stats as stats
import itertools as itert
from sklearn import preprocessing


class _resultDataFrame():
    """
    this is a mixin class to separate groups of methods across separate files
    """

    def label_SP_rows(self,thresh=0):
        """
        update the result_df with an additional colulmn indicateing rows with SP
        (or SP-like) as defined by sp_type

        Parameters
        -----------

        result_df : DataFrame
            generated by get_subgroup_trends_*
        sp_type: string or [TODO] function handle
            the type of SP that determines what function to apply fo rthe test. this
            may be a string for one of the defined types of SP for the package or a
            function handle of a new type, all tests must take as input two values
            of the columns designated and return True or False
        cols_pair : list of strings
            pair of column names to use for the test
        sp_args : any
            additional arguments needed by the SP detector indicated by sp_type
        """

        if thresh:
            col_name = 'SP_thresh_' + str(thresh)
        else:
            col_name = 'SP'

        is_SP = lambda row: row['distance'] > thresh

        self.result_df[col_name] = self.result_df.apply(is_SP,axis=1)

        return self.result_df




    def add_view_score(self,score_col,agg_type='mean',colored=False):
        """
        add the view counts to a result df for occurence ranking based on view rank

        Parameters
        ------------
        score_col : string
            variable to aggregate to make the view score
        agg_type : {'mean','sum','max','min'}
        colored : Boolean [default=False]
            colored (including a group_feat) views or not



        Returns
        -------
        result_df : DataFrame
            results generated by detect_simpsons_paradox
        """
        # determine which vars to merge on
        if colored:
            view_name = 'coloredview'
            view_vars = ['feat1','feat2','group_feat']
        else:
            view_name = 'view'
            view_vars = ['feat1','feat2']

        # aggregation type: sum or mean of the scores, how to combine the
        view_score = {'sum': lambda df: df.groupby(by=view_vars)[score_col].sum(),
                 'mean': lambda df: df.groupby(by=view_vars)[score_col].mean(),
                'max': lambda df: df.groupby(by=view_vars)[score_col].max(),
                'min': lambda df: df.groupby(by=view_vars)[score_col].min()}

        # create df with score for each view
        view_df = view_score[agg_type](self.result_df).reset_index()


        # rename the column
        view_score_name = '_'.join([agg_type,view_name,score_col])
        view_df.rename(columns={score_col:view_score_name}, inplace=True)

        print(view_df)

        # merge with result and return

        self.result_df = pd.merge(self.result_df,view_df, left_on = view_vars,
                                                            right_on=view_vars)
        print(self.result_df.columns)
        # ,suffixes=['', suffix])

        return self.result_df

    def mark_designed_rows(self,design_list_tuples):
        """
        add a column to a result_df that marks which are designed

        Parameters
        -----------
        result_df : DataFrame
            generaed from detect_simpsons_paradox
        design_list_tuples : list of tuples
            a list of the attributes with designed in SP. in the form
            [(feat1,feat2,group_feat),...]

        Returns
        --------
        result_df : DataFrame
        with added column 'designed' with boolean values
        """
    #
        des = []

        # create a list of the rows with the designed in cases
        for i,r in enumerate(self.result_df[['feat1','feat2','group_feat']].values):
            if tuple(r) in design_list_tuples:
                des.append(i)

        # add a column of all False values
        self.result_df['designed'] = False
        # change the designed ones to true
        self.result_df.loc[des,'designed'] = True

        return self.result_df

    def get_trend_rows(self,feat1 = None,feat2 = None,group_feat= None,
                            subgroup= None):
        """
        return a row of result_df based on the specified values

        Parameters
        -----------
        feat1 : str or  None
            trend variable name or None to include all
        feat2 : str or  None
            trend variable name or None to include all
        group_feat : str or  None
            groupoby variable name or None to include all
        subgroup : str or  None
            value of groupby_feat or or None to include all
        """
        # get the rows for each specified value,
        #  or set to True to include all values for each None

        if feat1:
            f1_rows = pd.Series([f1 in feat1 for f1 in self.result_df.feat1])
            # self.result_df.feat1 ==feat1
        else:
            f1_rows = True

        if feat2:
            f2_rows = pd.Series([f2 in feat2 for f2 in self.result_df.feat2])
        else:
            f2_rows = True

        if group_feat:
            gf_rows = pd.Series([gf in group_feat for gf in self.result_df.group_feat])
        else:
            gf_rows = True

        if subgroup:
            sg_rows = pd.Series([sg in subgroup for sg in self.result_df.subgroup])
        else:
            sg_rows = True


        # take the intersection
        target_row = f1_rows & f2_rows & gf_rows & sg_rows
        # return that row
        return self.result_df[target_row]


    def rank_weighted(self,cols_list,weights,name =None):
        """
        rank by a new column that is the weighted sum of other columns

        Parameters
        ----------
        cols_list : list of strings
            columns of result_df to use for ranking
        weights : list of floats
            weights in order of above list to use when combining columns for
            ranking

        Returns
        --------
        result_df : DataFrame
            with a new column
        """
        # create a name for the ranking column
        if name is None:
            # create name
            name = '_'.join([str(w) + c for c,w, in cols_weight_dict.items()])

        # add the weighting column
        self.result_df = self.add_weighted(cols_list,weights,name)
        self.result_df.sort_values(name,ascending=False,inplace=True)

        return self.result_df



    def count_sp_views(self, sp_col = 'SP',colored= False, portions =False,
                        groupby_count =False, append_counts=False):
        """
        return the count of SP occurences for a given view or colored view,
        optionally also count the share of possible sp occurences that were found


        Parameters
        ------------
        result_df : DataFrame
            results generated by detect_simpsons_paradox
        colored : Boolean [default=False]
            colored (including a group_feat) views or not
        portions : Boolean [default=False]
            count possible values as well
        groubpy_count : Boolean
            count the number of groupby attriutes that have SP in this (not colored)
        view
        data_df : DataFrame
            needed to count possible


        Returns
        ----------
        count_df : DataFrame
            counts per view
        """
        # TODO: should these be constants available module wide?
        uncolored_view_vars = ['feat1','feat2']
        colored_view_vars = ['feat1','feat2', 'group_feat']

        # determine which vars to groupby
        if colored or portions:
            view_vars = colored_view_vars
        else:
            view_vars = uncolored_view_vars


        # group by variables that define a colored view
        # count the subgroup column (or any other column, since no missing values)
        # reset the index to make it a tidy DataFrame instead of multilevel
        count_df = self.result_df.groupby(by=view_vars)[sp_col].sum().reset_index()

        count_df = count_df.rename(columns={'subgroup':'SP_subgroups'})

        if groupby_count :
            # how to make groupby counts
            # groupby uncolored views
            gby_df = self.result_df.groupby(uncolored_view_vars)[color_var]
            # count unique coloringn vars
            gby_counts = gby_df.nunique().reset_index()
            # rename to allow merge
            gby_counts = gby_counts.rename(columns={color_var:'gby_counts'})
            #merge to append to desired count vars
            #    not must be done separately and merged to accomodate colored
            count_df = count_df.merge(gby_counts, left_on=uncolored_view_vars,
                                    right_on=uncolored_view_vars)


        # prep for portions

        if portions :
            # count possible values for groupby attributes
            # cast to set to get unique values of grouby vars that have SP
            group_feat_list = set(self.result_df.group_feat.values)
            # for each one make a dict with keys of variables and vlaues of the
            #   number of levels in the dataset
            levels_by_attr = {gby:len(set(self.df[gby].values)) for
                                                            gby in group_feat_list}

            levels_per_sp_view = [levels_by_attr[a] for a in count_df['group_feat']]
            count_df['portions'] =  count_df['SP_subgroups']/levels_per_sp_view

        if append_counts:
            return_df = self.result_df.merge(count_df, left_on = view_vars,
                                                        right_on=view_vars)
        else:
            return_df = count_df

        return return_df


    def rank_occurences_by_view(self,view_score=None,occurence_score=None,
                                colored=False,ascending=False):
        """
        return a DataFrame of trends with the views ranked and within in view the
        occurences ranked as well

        Parameters
        ----------
        view_score : string [None]
            column for view score, if none, mean view distance
        occurence_score : string [None]
            column for occurence_score, if none, distance
        colored : Boolean [False]
            views defined by feat1, feat2, and group_feat if True, otherwise
            views defined by feat1 and feat2
        ascending : Boolean [False]
            sort order passed to sort_values
        """


        if occurence_score is None:
            occurence_score = 'distance'
            if not(occurence_score in self.result_df.columns):
                self.add_distance()

        if view_score is None:
            # add slope
            if colored:
                view_name = 'coloredview'
            else:
                view_name = 'view'

            # rename the column
            view_score = '_'.join(['mean',view_name,occurence_score])

            if not(view_score in self.result_df.columns):
                self.add_view_score(occurence_score,'mean',colored)


        print(self.result_df.columns)
        # sort by rank_col
        self.result_df.sort_values(by=[view_score,occurence_score],inplace=True,
                                    ascending=False)

        return self.result_df


    def add_weighted(self,cols_weight_dict,name=None):
        """
        add a column that is the weighted sum of normalized values other columns for
        ranking

        Parameters
        ------------
        df : DataFrame
            DataFrame to work with
        cols_weight_dict : dict
            dictionary in the form of {'var':weight} where var is a column in df and
        weight is a float

        Returns
        --------
        df : DataFrame
            DataFrame with an additional column

        """
        if name is None:
            # create name
            sum_name = '_'.join([str(w) + c for c,w, in cols_weight_dict.items()])
        else:
            sum_name = name

        # normalize data so that columns add together better
        col_names = list(cols_weight_dict.keys())

        # get absolute value before normalize
        df_temp = self.result_df[col_names].abs()

        #df_normalized = np.abs((df_temp[col_names]-df_temp[col_names].min())/(df_temp[col_names].max()-df_temp[col_names].min()))

        # use sklearn MinMaxScaler to normalize
        min_max_scaler = preprocessing.MinMaxScaler()
        df_temp_scaled = min_max_scaler.fit_transform(df_temp)

        df_temp[col_names] = pd.DataFrame(df_temp_scaled)
        df_normalized = df_temp

        #aggreate
        wsum = lambda r: np.average(r,weights=list(cols_weight_dict.values()))
        self.result_df[sum_name] = df_normalized.agg(wsum,axis="columns")
        return self.result_df

    # def dist_helper(self,row):
    #     """
    #     """
    #     trend_dist = {t.name:t.get_distance for t in self.trend_list}
    #
    #     return trend_dist[row['trend_type']](row)

    def add_distance(self):
        """
        add a column with the trend-appropriate distance
        """
        trend_dist = {t.name:t.get_distance for t in self.trend_list}

        dist_helper = lambda row: trend_dist[row['trend_type']](row)

        self.result_df['distance'] = self.result_df.apply(dist_helper,axis=1)


################################################################################
# helper functions
################################################################################





def compute_angle(row):
    """
    compute angle between the overall ('all_slope') and subgroup
    ('subgroup_slope') slopes for a row of a dataframe. This is the angle
    closest to the positive x axis and is always positive valued, to be used as
    a distance.

    Parameters
    ----------
    row : row of DataFrame
        row of results generated by detect_simpsons_paradox
    """
    # take absolute value, because the two will be in opposite directions
    # relative to the angle of interest
    theta_sub = np.arctan(row['subgroup_slope'])
    theta_all = np.arctan(row['all_slope'])
    # theta_sub = np.abs(np.arctan(row['subgroup_slope']))
    # theta_all = np.abs(np.arctan(row['all_slope']))

    # add them and convert to degrees
    return np.rad2deg(np.abs(theta_all - theta_sub))
