import pandas as pd
import numpy as np
import scipy.stats as stats
import itertools as itert

#from .detect_sp import upper_triangle_df, upper_triangle_element, isReverse,
from .detect_sp import detect_simpsons_paradox
from .ranking_processing import (mark_designed_rows, compute_angle,
    compute_slope_all, add_slope_sp, add_angle_col, get_SP_views,
    count_sp_views, add_slope_cols, get_SP_colored_views,add_view_count,
    add_weighted)

__all__ = ['detect_simpsons_paradox','mark_designed_rows', 'compute_angle',
            'add_slope_sp','compute_slope_all','add_angle_col','count_sp_views',
            'add_slope_cols','get_SP_colored_views','add_view_count',
            'add_weighted']
