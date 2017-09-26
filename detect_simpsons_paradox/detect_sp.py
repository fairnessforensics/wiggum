import numpy as np
import pandas as pd

# Function s
def upper_triangle_element(matrix):
    """
    extract upper triangle elements without diagonal element
    
    Parameters
    -----------
    matrix : 2d numpy array
        <tbd, more detailed description
       
    
    Returns
    --------
    elements : <type, shape info>
        <description>
    
    
    """
    
    #upper triangle construction
    tri_upper = np.triu(matrix, k=1)
    num_rows = tri_upper.shape[0]

    #upper triangle element extract
    elements = tri_upper[np.triu_indices(num_rows,k=1)]
    
    return elements

# Function return a dataframe for upper triangle elements without diagonal elements
def upper_triangle_df(matrix):
    """
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

# Compare the signs of a and b
def isReverse(a, b):
    """
    """
    
    if a > 0 and b < 0:
       return True
    elif a < 0 and b > 0:
       return True
    else:
       return False