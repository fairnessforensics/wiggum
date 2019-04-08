import pandas as pd

META_COLUMNS = ['dtype','var_type','role','isCount']

possible_roles = ['groupby','explanatory','trend']

var_types = ['binary', 'ordinal', 'categorical', 'continuous']

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

    def __init__(self,data=None,meta=None):
        if data == None:
            df = pd.DataFrame()
        elif type(data) is  pd.core.frame.DataFrame:
            df = data
        elif type(data) is str:
            df = pd.read_csv(data)

        if meta == None:
            info = pd.DataFrame(index = df.columns,
                               columns = META_COLUMNS)
            info['dtype'] = df.dtypes
        elif type(meta) is  pd.core.frame.DataFrame:
            info = meta
        elif type(data) is str:
            info = pd.read_csv(data)


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
