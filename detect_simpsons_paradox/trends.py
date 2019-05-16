import pandas as pd
import numpy as np
import itertools
import scipy.stats as stats

from .trend_components import *
# from . import trend_components
 # import *


## set all list at bottom


class mean_rank_trend(rankTrend,weightedMeanRank,trend):
    name = 'rank_trend'

class continuous_pearson(correlationTrend,continuousRegression,trend):
    name = 'pearson_corr'
    corrtype = 'pearson'


class all_pearson(correlationTrend,continuousOrdinalRegression,trend):
    name = 'pearson_corr'
    corrtype = 'pearson'

class spearman_correlation(correlationTrend,ordinalRegression,trend):
    name ='spearman_corr'
    corrtype = 'spearman'

class kendall_correlation(correlationTrend,continuousRegression,trend):
    name ='kendall_corr'
    corrtype = 'kendall'

class linear_trend(linearRegression,continuousRegression,trend):
    symmetric_vars = True
    name = 'lin_reg'

class all_linear_trend(linearRegression,continuousOrdinalRegression,trend):
    symmetric_vars = True
    name = 'lin_reg'


all_trend_types = {'pearson_corr':all_pearson,
                    'rank_trend':mean_rank_trend,
                    'lin_reg':linear_trend}
