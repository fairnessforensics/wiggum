import pandas as pd
import numpy as np
import scipy.stats as stats
import itertools as itert

#from .detectors import upper_triangle_df, upper_triangle_element, isReverse,
# from .detectors import detect_simpsons_paradox


from .ranking_processing import DEFAULT_SP_DEF, trend_quality_sp

# from .ranking_processing import (mark_designed_rows, compute_angle,
#     compute_slope_all, add_slope_sp, add_angle_col, get_SP_views,
#     count_sp_views, add_slope_cols, add_view_count,
#     add_weighted, add_view_score,get_trend_row,label_SP_rows,get_views,
#     get_SP_rows)


# from .data_augmentation import add_quantile, add_all_dpgmm


from .labeled_dataframe import (LabeledDataFrame, possible_roles, var_types,
                            simple_type_mapper)

# trend types
from .trends import (All_Pearson, Continuous_Pearson, Spearman_Correlation,
                    Kendall_Correlation, Mean_Rank_Trend,Linear_Trend,
                    All_Linear_Trend,Binary_Pearson_Trend,Binary_Mean_Rank_Trend,
                    Median_Rank_Trend,Binary_Median_Rank_Trend,
                    Binary_Accuracy_Trend, Binary_TPR_Trend,Binary_PPV_Trend,
                    Binary_TNR_Trend, Binary_FDR_Trend, Binary_F1_Trend,
                    Binary_Error_Trend,Binary_FNR_Trend)

#tren lists
from .trends import (all_trend_types,default_binary_trends,default_distance_trends)

# __all__ = ['detect_simpsons_paradox','mark_designed_rows', 'compute_angle',
#             'add_slope_sp','compute_slope_all','add_angle_col','count_sp_views',
#             'add_slope_cols','add_view_count',
#             'add_weighted','get_subgroup_trends_1lev','add_all_dpgmm',
#             'get_subgroup_trends_2lev','add_quantile','get_correlations',
#             'add_view_score','get_trend_row','label_SP_rows','get_views',
#             'get_SP_rows']
