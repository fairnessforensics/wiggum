import pandas as pd
import numpy as np
import itertools
import scipy.stats as stats

from .trend_components import *
# from . import trend_components
 # import *


## set all list at bottom


class MeanRankTrend(StatRankTrend,WeightedRank,Trend):
    my_stat = lambda self, d,m,w : w_avg(d,m,w )
    name = 'rank_Trend'


class MedianRankTrend(StatRankTrend,WeightedRank,Trend):
    my_stat = lambda self, d,m,w :w_avg(d,m,w )
    name = 'MedianRankTrend'

class ContinuousPearson(CorrelationTrend,ContinuousRegression,Trend):
    name = 'pearson_corr'
    corrtype = 'pearson'


class AllPearson(CorrelationTrend,ContinuousOrdinalRegression,Trend):
    name = 'pearson_corr'
    corrtype = 'pearson'

class SpearmanCorrelation(CorrelationTrend,OrdinalRegression,Trend):
    name ='spearman_corr'
    corrtype = 'spearman'

class KendallCorrelation(CorrelationTrend,ContinuousRegression,Trend):
    name ='kendall_corr'
    corrtype = 'kendall'

class LinearTrend(LinearRegression,ContinuousRegression,Trend):
    symmetric_vars = True
    name = 'lin_reg'

class AllLinearTrend(LinearRegression,ContinuousOrdinalRegression,Trend):
    symmetric_vars = True
    name = 'lin_reg'

class BinaryPearsonTrend(CorrelationSignTrend,ContinuousRegression,Trend):
    corrtype = 'pearson'
    name = 'binary_sign'

class BinaryMeanRankTrend(StatBinRankTrend,BinaryWeightedRank,Trend):
    my_stat = lambda self, d,m,w :w_avg(d,m,w )
    name = 'binary_rank'

class BinaryMedianRankTrend(StatBinRankTrend,BinaryWeightedRank,Trend):
    my_stat = lambda self, d,m,w :w_median(d,m,w )
    name = 'binary_median_rank'




all_Trend_types = {'pearson_corr':AllPearson,
                    'spearman_corr': SpearmanCorrelation,
                    'rank_Trend':MeanRankTrend,
                    'lin_reg':LinearTrend,
                    'binary_rank':BinaryMeanRankTrend,
                    'binary_sign':BinaryPearsonTrend,
                    'median_rank':MeanRankTrend,
                    'binary_median_rank':BinaryMedianRankTrend}

default_binary_Trends = {'binary_rank':BinaryMeanRankTrend,
                'binary_sign':BinaryPearsonTrend}

default_distance_Trends = {'rank_Trend':MeanRankTrend,
                    'lin_reg':LinearTrend}
