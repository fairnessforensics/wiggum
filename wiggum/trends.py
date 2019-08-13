import pandas as pd
import numpy as np
import itertools
import scipy.stats as stats

from .trend_components import *
# from . import trend_components
 # import *


## set all list at bottom
class Binary_Accuracy_Trend(BinClassStats,PredictionClass,Trend):
    my_stat = 'acc'
    name = 'binary_acc'

class Binary_TPR_Trend(BinClassStats,PredictionClass,Trend):
    my_stat = 'tpr'
    name = 'binary_tpr'

class Binary_PPV_Trend(BinClassStats,PredictionClass,Trend):
    my_stat = 'ppv'
    name = 'binary_ppv'

class Binary_TNR_Trend(BinClassStats,PredictionClass,Trend):
    my_stat = 'tnr'
    name = 'binary_tnr'

class Binary_FDR_Trend(BinClassStats,PredictionClass,Trend):
    my_stat = 'fdr'
    name = 'binary_fdr'

class Binary_F1_Trend(BinClassStats,PredictionClass,Trend):
    my_stat = 'f1'
    name = 'binary_f1'

class Mean_Rank_Trend(StatRankTrend,WeightedRank,Trend):
    my_stat = lambda self, d,m,w : w_avg(d,m,w )
    name = 'rank_trend'


class Median_Rank_Trend(StatRankTrend,WeightedRank,Trend):
    my_stat = lambda self, d,m,w :w_avg(d,m,w )
    name = 'Median_Rank_Trend'

class Continuous_Pearson(CorrelationTrend,ContinuousRegression,Trend):
    name = 'pearson_corr'
    corrtype = 'pearson'


class All_Pearson(CorrelationTrend,ContinuousOrdinalRegression,Trend):
    name = 'pearson_corr'
    corrtype = 'pearson'

class Spearman_Correlation(CorrelationTrend,OrdinalRegression,Trend):
    name ='spearman_corr'
    corrtype = 'spearman'

class Kendall_Correlation(CorrelationTrend,ContinuousRegression,Trend):
    name ='kendall_corr'
    corrtype = 'kendall'

class Linear_Trend(LinearRegression,ContinuousRegression,Trend):
    symmetric_vars = True
    name = 'lin_reg'

class All_Linear_Trend(LinearRegression,ContinuousOrdinalRegression,Trend):
    symmetric_vars = True
    name = 'lin_reg'

class Binary_Pearson_Trend(CorrelationSignTrend,ContinuousRegression,Trend):
    corrtype = 'pearson'
    name = 'binary_sign'

class Binary_Mean_Rank_Trend(StatBinRankTrend,BinaryWeightedRank,Trend):
    my_stat = lambda self, d,m,w :w_avg(d,m,w )
    name = 'binary_rank'

class Binary_Median_Rank_Trend(StatBinRankTrend,BinaryWeightedRank,Trend):
    my_stat = lambda self, d,m,w :w_median(d,m,w )
    name = 'binary_median_rank'




all_trend_types = {'pearson_corr':All_Pearson,
                    'spearman_corr': Spearman_Correlation,
                    'rank_trend':Mean_Rank_Trend,
                    'lin_reg':Linear_Trend,
                    'binary_rank':Binary_Mean_Rank_Trend,
                    'binary_sign':Binary_Pearson_Trend,
                    'median_rank':Mean_Rank_Trend,
                    'binary_median_rank':Binary_Median_Rank_Trend}

default_binary_trends = {'binary_rank':Binary_Mean_Rank_Trend,
                'binary_sign':Binary_Pearson_Trend}

default_distance_trends = {'rank_trend':Mean_Rank_Trend,
                    'lin_reg':Linear_Trend}
