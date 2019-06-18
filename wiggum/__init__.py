import pandas as pd
import numpy as np
import scipy.stats as stats
import itertools as itert

#from .detect import upper_triangle_df, upper_triangle_element, isReverse,
from .detect import detect_simpsons_paradox


from .ranking_processing import DEFAULT_SP_DEF, Trend_quality_sp

# from .ranking_processing import (mark_designed_rows, compute_angle,
#     compute_slope_all, add_slope_sp, add_angle_col, get_SP_views,
#     count_sp_views, add_slope_cols, add_view_count,
#     add_weighted, add_view_score,get_Trend_row,label_SP_rows,get_views,
#     get_SP_rows)


# from .data_augmentation import add_quantile, add_all_dpgmm


from .labeled_dataframe import (LabeledDataFrame, possible_roles, var_types,
                            simple_type_mapper)

# Trend types
from .Trends import (AllPearson, ContinuousPearson, SpearmanCorrelation,
                    KendallCorrelation, MeanRankTrend,LinearTrend,
                    AllLinearTrend,BinaryPearsonTrend,BinaryMeanRankTrend,
                    MedianRankTrend,BinaryMedianRankTrend)

#tren lists
from .Trends import (all_Trend_types,default_binary_Trends,default_distance_Trends)

# __all__ = ['detect_simpsons_paradox','mark_designed_rows', 'compute_angle',
#             'add_slope_sp','compute_slope_all','add_angle_col','count_sp_views',
#             'add_slope_cols','add_view_count',
#             'add_weighted','get_subgroup_Trends_1lev','add_all_dpgmm',
#             'get_subgroup_Trends_2lev','add_quantile','get_correlations',
#             'add_view_score','get_Trend_row','label_SP_rows','get_views',
#             'get_SP_rows']
