import numpy as np
import pandas as pd

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
    Compare the signs of a and b

    Parameters
    -----------
    a : number(int or float)
    b : number(int or float)

    Returns
    --------
    boolean value : If True turns, a and b have the reverse sign.
                    If False returns, a and b have the same sign.
    """

    if a > 0 and b < 0:
       return True
    elif a < 0 and b > 0:
       return True
    else:
       return False

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

def detect_simpsons_paradox(latent_df,
                            continuousAttrs_labels=None,
                            groupbyAttrs_labels=None ):
    """
    A detection function which can detect Simpson Paradox happened in the data's
    subgroup.

    Parameters
    -----------
    latent_df : dataframe
        data organized in a pandas dataframe containing both categorical
        and continuous attributes.
    continuousAttrs_labels : list [None]
        list of continuous attributes by name in dataframe, if None will be
        detected by all float64 type columns in dataframe
    groupbyAttrs_labels  : list [None]
        list of group by attributes by name in dataframe, if None will be
        detected by all object and int64 type columns in dataframe

    Returns
    --------
    result_df : dataframe
                In the result dataframe, it stores the information of the subgroup
                which is detected having Simpson Paradox.
                TODO: Clarify the return information

    """
    # if not specified, detect continous attributes and categorical attributes
    # from dataset
    if groupbyAttrs_labels is None:
        groupbyAttrs = latent_df.select_dtypes(include=['object','int64'])
        groupbyAttrs_labels = list(groupbyAttrs)

    if continuousAttrs_labels is None:
        continuousAttrs = latent_df.select_dtypes(include=['float64'])
        continuousAttrs_labels = list(continuousAttrs)


    # Compute correaltion matrix for all of the data, then extract the upper
    # triangle of the matrix.
    # Generate the correaltion dataframe by correlation values.
    all_corr = latent_df[continuousAttrs_labels].corr()
    all_corr_df = upper_triangle_df(all_corr)
    all_corr_element = all_corr_df['value'].values

    # Define an empty dataframe for result
    result_df = pd.DataFrame()

    # Loop by group-by attributes
    for groupbyAttr in groupbyAttrs_labels:
        grouped_df_corr = latent_df.groupby(groupbyAttr)[continuousAttrs_labels].corr()
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
                temp_df = pd.DataFrame(data=all_corr_info,columns=['allCorr','attr1','attr2'])

                # Convert index from float to int
                temp_df.attr1 = temp_df.attr1.astype(int)
                temp_df.attr2 = temp_df.attr2.astype(int)

                temp_df["reverseCorr"] = reverse_list
                len_list = len(reverse_list)
                # Store group attributes' information
                temp_df['groupbyAttr'] = [groupbyAttr for i in range(len_list)]
                temp_df['subgroup'] = [subgroup for i in range(len_list)]
                result_df = result_df.append(temp_df, ignore_index=True)

    return result_df
