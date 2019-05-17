
import os
import pandas as pd
import itertools

META_COLUMNS = ['dtype','var_type','role','isCount', 'weighting_var']
possible_roles = ['groupby','trend','ignore']

var_types = ['binary', 'ordinal', 'categorical', 'continuous']



from .detect_sp import RESULTS_DF_HEADER, _trendDetectors
from .data_augmentation import _augmentedData
from .ranking_processing import _resultDataFrame





meta_csv = 'meta.csv'
result_csv = 'result_df.csv'
data_csv = 'df.csv'


def check_meta(row,meta_val,meta_type):
    """
    check if the current role/type is equal to or contains role
    """

    # set target as list
    if type(meta_val)==str:
        target = [meta_val]
    else:
        target = meta_val

    # set current value to list
    if type(row[meta_type]) ==str:
        current = [row[meta_type]]
    else:
        current = row[meta_type]

    # check if at least one of the target types is in the current row
    return True in [t in current for t in target]



def simple_type_mapper(df):
    """
    get varialbe types using the data types and counts


    Parameters
    -----------
    df : DataFrame
        source data
    """
    var_type_list = []

    for col in df.columns:
        num_values = len(pd.unique(df[col]))
        col_dtype = df[col].dtype


        if col_dtype == bool or num_values == 2:
            var_type_list.append('binary')
        elif 'int' in str(col_dtype):
            var_type_list.append('ordinal')
        elif 'object' in str(col_dtype):
            var_type_list.append('categorical')
        elif 'float' in str(col_dtype):
            var_type_list.append('continuous')
        else:
            var_type_list.append('unknown')

    return var_type_list

def column_rate(df, rate_column):
    """
    compute the True rate of a column of a data frame that ha boolean values
    """

    compute_rate = lambda row: row[True]/(row[False]+row[True])

    df_ct  = df[rate_column].value_counts().unstack().reset_index()
    df_ct.rename(columns={rate_column:'index'},inplace=True)


    df_ct[rate_column + '_rate'] = df_ct.apply(compute_rate,axis=1)
    #     df_ct.drop([True,False],axis=1,inplace=True)
    tf_to_counts = {True:rate_column+'_true',False:rate_column+'_false'}
    df_ct.rename(columns=tf_to_counts,inplace=True)

    return df_ct



class labeledDataFrame(_resultDataFrame,_trendDetectors,_augmentedData):
    """
    this is the object

    a labeledDataFrame object contains 3 DataFrames of information: the actual data(df),
    meta data(meta_df) about it and the trends (result_df) in it.


    in this file we define the basic operations, the inherited Mixins have more
    methods in them, spread across files for space and organization
    """

    def __init__(self,data=None,meta=None,results=None):
        """
        initialize

        Parameters
        ----------
        data : DataFrame, string, or None
            if DataFrame sets this to .df, string must be a file name of a csv
            to load or a directory that contains 3 csvs written by to_csvs
        meta : DataFrame, string or None
            if DataFrame sets this to .meta_df string must be a file name of a csv
            to load
        results : None, callable, or string
            none initializes empty, callable initializes with that function,
            string must be a filename of a csv to load
        """
        # check if re-opening a saved labeled_df

        if type(data) == str and os.path.isdir(data) and meta ==None and results ==None:
            # if so, make all strings of filepaths
            meta = os.path.join(data,meta_csv)
            results = os.path.join(data,result_csv)
            data = os.path.join(data,data_csv)

        # set data
        if type(data) is  pd.core.frame.DataFrame:
            self.df = data
        elif type(data) is str:
            self.df = pd.read_csv(data)
        elif data == None:
            self.df = pd.DataFrame()

        # initialize metadata
        if meta == None:
            self.meta_df = pd.DataFrame(index = self.df.columns,
                               columns = META_COLUMNS)
            self.meta_df.index.name = 'variable'
            self.meta_df['dtype'] = self.df.dtypes
        elif type(meta) is  pd.core.frame.DataFrame:
            self.meta_df = meta
        elif type(meta) is str:
            self.meta_df = pd.read_csv(meta,index_col='variable')
            # handle lists
            self.meta_df['role'] = [var.replace("'",'').replace("[",'').replace("]",'').replace(",",'').split()
                      for var in self.meta_df['role']]

        # initialize results_df
        if results == None:
            # call function
            self.result_df = pd.DataFrame(columns= RESULTS_DF_HEADER)
        elif callable(results):
            self.result_df = results(self)
        else:
            self.result_df = pd.read_csv(results)

    def count_compress_binary(self,retain_var_list, compress_var_list):
        """
        TODO: FIXME
        """
        # iterate over compress_var_list instead o naming the vars
        search_rate = column_rate(self.df.groupby(retain_var_list),'search_conducted')
        contraband_rate = column_rate(stops_mj.groupby(grouping_list),'contraband_found')
        hit_rate = column_rate(stops_mj.groupby(grouping_list),'hit')
        # a.index.rename('index',inplace=True)
        # a.drop([True,False],axis=1,inplace=True)
        # TODO: can this be appended or applied direct without merge
        self.counts_rate_df = pd.merge( pd.merge(search_rate,contraband_rate),hit_rate)

    def set_data_counts_rate(self):
        self.counts_rate_df = self.df


    def infer_var_types(self,dtype_var_func = simple_type_mapper):
        '''
        infer variable (meaningful) types based on a mapper function that takes the data as
        a Parameters

        Parameters
        dtype_var_func : functionhandle
            a functiont that takes a self.df and returns a list of the lenght of the number
            of columns of values from var_types
        '''
        var_type_list = dtype_var_func(self.df)
        self.meta_df['var_type'] = var_type_list

    def set_var_types(self,var_type_list):
        '''
        infer variable (meaningful) types based on a mapper function that takes the data as
        a Parameters

        Parameters
        var_type_list : list or dict
            dict must be {variable:role,...}, list must be length of variables
        '''

        if type(var_type_list) == dict:
            for k,v in var_type_list.items():
                self.meta_df['var_type'][k] = v
        elif type(var_type_list) == list:
            self.meta_df['var_type'] = var_type_list

    def set_roles(self,role_info):
        """
        set info column role

        Parameters
        -----------
        role_list : list of roles or dict of mappings
            dict must be {variable:role,...}
        """

        if type(role_info) == dict:
            for k,v in role_info.items():
                self.meta_df['role'][k] = v
        elif type(role_info) == list:
            self.meta_df['role'] = role_info



        # TODO: throw error

    def set_counts(self,count_info=None):
        """
        set the isCount column of the meta_df

        Parameters
        ----------
        count_info: dict, list, or None
            a dictionary with var:{True,False} mappings, a list of True/False in
            length of the number of variables, or a list of the True variables
        """

        if type(count_info) == dict:
            # dict of mappings
            for k,v in count_info.items():
                self.meta_df.loc[k,'isCount'] = v
        elif type(count_info) == list or count_info == None:
            # list of true/false
            if len(count_info)==0:
                self.meta_df['isCount'] = False
            elif count_info[0] in [True,False]:
                self.meta_df['isCount'] = count_info
            else:
                # list of true or none:
                # set all false
                self.meta_df['isCount'] = False
                # set specified to True
                for var in count_info:
                    self.meta_df.loc[var,'isCount'] = True

    def set_weighting_vars(self,weight_vars=None):
        """

        Parameters
        ----------
        count_info: dict, list, or None
            a dictionary with <data var>: weighting_var mappings, all keys and
            values must be column names in the dataset at self.df
        """

        if type(weight_vars) == dict:
            for k,v in weight_vars.items():
                self.meta_df.loc[k,'weighting_var'] = v
        elif type(weight_vars) == list:
            self.meta_df['weighting_var'] = weight_vars


    def get_data(self):
        return self.df

    def get_data_sample(self):
        """
        return a list of strings that describe the data from each column of the
    data, can be added as a column to meta_df

        Parameters
        -----------
        df : DataFrame
            source data
        """
        sample_list = []

        for col in self.df.columns:
            num_values = len(pd.unique(self.df[col]))
            values = pd.unique(self.df[col])
            col_dtype = self.df[col].dtype

            if col_dtype == bool or num_values == 2:
                sample = ', '.join(str(v) for v in values.tolist())
            elif 'int' in str(col_dtype):
                sample = "Max: " + str(self.df[col].max()) + " Min: " + str(self.df[col].min())
            elif 'object' in str(col_dtype):
                if num_values <= 5:
                    sample = ', '.join(str(v) for v in values.tolist())
                else:
                    sample = ', '.join(str(v) for v in values[:5].tolist())
            elif 'float' in str(col_dtype):
                sample = "Max: " + str(round(self.df[col].max(),3)) + " Min: " + str(round(self.df[col].min(),3))
            else:
                sample = "unknown"

            sample_list.append(sample)

        return sample_list

    def get_data_per_role(self, role):
        """
        return the data of one role
        """

        cols_to_return = self.meta_df.apply(check_role,args=(role))

    def get_vars_per_role(self, role):
        """
        return the variables of one role
        """
        # use a lambda to pass extra var, make it func of only the row
        check_cur_role = lambda r_l: check_meta(r_l,role,'role')

        # check every row of the meda_df
        is_target_role = self.meta_df.apply(check_cur_role,axis=1)

        all_vars = self.meta_df.index

        return list(all_vars[is_target_role])

    def get_vars_per_type(self, vartype):
        """
        return the variables of one role
        """
        # use a lambda to pass extra var, make it func of only the row
        check_cur_type = lambda r_l: check_meta(r_l,vartype,'var_type')

        # check every row of the meda_df
        is_target_type = self.meta_df.apply(check_cur_type,axis=1)

        all_vars = self.meta_df.index

        return list(all_vars[is_target_type])

    def get_vars_per_roletype(self,role,vartype):
        """
        return variable for a (role,type) pair
        """
        # use a lambda to pass extra vars, make it func of only the row
        check_cur_role = lambda r_l: check_meta(r_l,role,'role')
        check_cur_type = lambda r_l: check_meta(r_l,vartype,'var_type')

        # check every row of the meda_df
        is_target_role = self.meta_df.apply(check_cur_role,axis=1)
        is_target_type = self.meta_df.apply(check_cur_type,axis=1)

        # combine
        target_rows = [r & t for r,t in zip(is_target_role,is_target_type)]

        all_vars = self.meta_df.index

        return list(all_vars[target_rows])

    def get_weightcol_per_var(self,var_list):
        """
        return the corresponding weight variables given a list of variables
        """
        var_weight_list = [self.meta_df['weighting_var'][var] for var in var_list]

        return var_weight_list




    def to_csvs(self,dirname):
        """
        write out info as csvs to the same directory
        """
        if not(os.path.isdir(dirname)):
            os.mkdir(dirname)
        # save metadata
        meta_file = os.path.join(dirname,meta_csv)
        self.meta_df.to_csv(meta_file)

        results_file = os.path.join(dirname,result_csv)
        self.result_df.to_csv(results_file,index=False)

        data_file = os.path.join(dirname,data_csv)
        self.df.to_csv(data_file,index=False)


    def __repr__(self):
        return self.df.head().__repr__() + self.meta_df.head().__repr__() + self.result_df.head().__repr__()

    def view(self):
        print(self.df.head())
        print(self.meta_df.head())
        print(self.result_df.head())

        return True
