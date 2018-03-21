import pandas as pd
import numpy as np
import scipy.stats as stats
import itertools as itert

#from .detect_sp import upper_triangle_df, upper_triangle_element, isReverse,
from .detect_sp import detect_simpsons_paradox
from .ranking_processing import mark_designed_rows, compute_angle
from .ranking_processing import compute_slope_all, add_slope_sp

__all__ = ['detect_simpsons_paradox','mark_designed_rows', 'compute_angle',
            'add_slope_sp','compute_slope_all']
