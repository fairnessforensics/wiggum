import os
import pandas as pd
from .detect_sp import RESULTS_DF_HEADER, _trendDetectors
from .data_augmentation import _augmentedData
from .ranking_processing import _resultDataFrame


META_COLUMNS = ['dtype','var_type','role','isCount', 'count_of']

possible_roles = ['groupby','explanatory','trend']

var_types = ['binary', 'ordinal', 'categorical', 'continuous']

meta_csv = 'meta.csv'
result_csv = 'result_df.csv'
data_csv = 'df.csv'


def check_meta(row,meta_val,meta_type):
    """
    check if the current role/type is equal to or contains role
    """
    role_tests = {str: lambda cur,target: cur == target,
                  list: lambda cur,target: target in cur}
    return role_tests[type(row[meta_type])](row[meta_type],meta_val)



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


    def infer_var_types(self,dtype_var_func = simple_type_mapper):
        '''
        infer variable (meaningful) types based on a mapper function that takes the data as
        a Parameters

        Parameters
        dtype_var_func : functionhandle
            a functiont that takes a self.df and returns a list of the lenght of the number
            of columns of values from var_types
        '''
        self.meta_df['var_type'] = dtype_var_func(self.df)


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
            if count_info[0] in [True,False]:
                self.meta_df['role'] = role_info
            else:
                # list of true or none
                self.meta_df['isCount'] = False
                for var in count_info:
                    self.meta_df.loc[var,'isCount'] = True

    def get_data(self):
        return self.df

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

        return all_vars[is_target_role]

    def get_vars_per_type(self, vartype):
        """
        return the variables of one role
        """
        # use a lambda to pass extra var, make it func of only the row
        check_cur_type = lambda r_l: check_meta(r_l,vartype,'var_type')

        # check every row of the meda_df
        is_target_type = self.meta_df.apply(check_cur_type,axis=1)

        all_vars = self.meta_df.index

        return all_vars[is_target_type]

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

        return all_vars[target_rows]



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
