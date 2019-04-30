import os
import pandas as pd
from detect_sp import RESULTS_DF_HEADER


META_COLUMNS = ['dtype','var_type','role','isCount']

possible_roles = ['groupby','explanatory','trend']

var_types = ['binary', 'ordinal', 'categorical', 'continuous']

meta_csv = 'meta.csv'
result_csv = 'result_df.csv'
data_csv = 'df.csv'


def simple_type_map(df):
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


        if col_dtype == Boolean or num_values == 2:
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


class labeled_df():

    def __init__(self,data=None,meta=None,results=None):
        """
        initialize

        Parameters
        ----------
        data :
        meta :
        results : None, callable, or string
            none initializes empty, callable initializes with that function,
            string must be a filename
        """
        # check if re-opening a saved labeled_df
        if os.path.isdir(data) and meta ==None and results ==None:
            # if so, make all strings of filepaths
            meta = os.path.join(data,meta_csv)
            results = os.path.join(data,result_csv)
            data = os.path.join(data,data_csv)

        # set data
        if data == None:
            df = pd.DataFrame()
        elif type(data) is  pd.core.frame.DataFrame:
            df = data
        elif type(data) is str:
            df = pd.read_csv(data)

        # initialize metadata
        if meta == None:
            meta_df = pd.DataFrame(index = df.columns,
                               columns = META_COLUMNS)
            meta_df['dtype'] = df.dtypes
        elif type(meta) is  pd.core.frame.DataFrame:
            meta_df = meta
        elif type(data) is str:
            meta_df = pd.read_csv(data)


        # initialize results_df
        if results == None:
            # call function
            result_df = pd.DataFrame(columns= RESULTS_DF_HEADER)
        elif callable(results):
            result_df = results(self)
        else:
            result_df = pd.read_csv(results)


    def infer_var_types(self,dtype_var_func = simple_type_mapper):
        '''
        '''
        self.info['var_type'] = dtype_var_func(sel.df)


    def set_roles(self,role_list):
        '''
        set info column role

        Parameters
        -----------
        role_list : list of strings
        '''

        self.info['role'] = role_list


    def get_data(self):
        return self.df

    def get_data_per_role(self, role):
        """
        return the data of one role
        """
        cols_to_return = self.info['role'] == role

    def to_csvs(self,dirname):
        """
        write out info as csvs to the same directory
        """
        # make file names
        meta_file = os.path.join(dirname,meta_csv)
        results_file = os.path.join(dirname,result_csv)
        data_file = os.path.join(dirname,data_csv)

        self.df.to_csv(data_file)
        self.meta_df.to_csv(meta_file)
        self.result_df.to_csv(results_file)
