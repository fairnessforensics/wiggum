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
    display_name = 'Classification Accuracy'

class Binary_Error_Trend(BinClassStats,PredictionClass,Trend):
    my_stat = 'err'
    name = 'binary_err'
    display_name = 'Classification Error'

class Binary_TPR_Trend(BinClassStats,PredictionClass,Trend):
    my_stat = 'tpr'
    name = 'binary_tpr'
    display_name = 'Classification True Positive Rate'

class Binary_PPV_Trend(BinClassStats,PredictionClass,Trend):
    my_stat = 'ppv'
    name = 'binary_ppv'
    display_name = 'Classification Positive Predictive Value'

class Binary_TNR_Trend(BinClassStats,PredictionClass,Trend):
    my_stat = 'tnr'
    name = 'binary_tnr'
    display_name = 'Classification True Negative Rate'

class Binary_FDR_Trend(BinClassStats,PredictionClass,Trend):
    my_stat = 'fdr'
    name = 'binary_fdr'
    display_name = 'Classification False Discovery Rate'

class Binary_FNR_Trend(BinClassStats,PredictionClass,Trend):
    my_stat = 'fnr'
    name = 'binary_fnr'
    display_name = 'Classification False Negative Rate'

class Binary_F1_Trend(BinClassStats,PredictionClass,Trend):
    my_stat = 'f1'
    name = 'binary_f1'
    display_name = 'Classification F_1'

class Mean_Rank_Trend(StatRankTrend,WeightedRank,Trend):
    my_stat = lambda self, d,m,w : w_avg(d,m,w )
    name = 'rank_trend'
    display_name = 'Rank by Mean'


class Median_Rank_Trend(StatRankTrend,WeightedRank,Trend):
    my_stat = lambda self, d,m,w :w_avg(d,m,w )
    name = 'Median_Rank_Trend'
    display_name = 'Rank by Median'

class Percentage_Rank_Trend(PercentageRankTrend,PercentageRank,Trend):
    my_stat = lambda self, d,m: sum(d,m)
    name = 'percentage_rank'
    display_name = 'Rank by Percentage'    

class Sum_Rank_Trend(SumRankTrend,WeightedRank,Trend):
    my_stat = lambda self, d,m: sum(d,m)
    name = 'sum_rank'
    display_name = 'Rank by Sum' 

class Continuous_Pearson(CorrelationTrend,ContinuousRegression,Trend):
    name = 'pearson_corr'
    corrtype = 'pearson'
    display_name = 'Pearson Correlation'


class All_Pearson(CorrelationTrend,ContinuousOrdinalRegression,Trend):
    name = 'pearson_corr'
    corrtype = 'pearson'
    display_name = 'Pearson Correlation'

class Spearman_Correlation(CorrelationTrend,OrdinalRegression,Trend):
    name ='spearman_corr'
    corrtype = 'spearman'
    display_name = 'Spearman Correlation'

class Kendall_Correlation(CorrelationTrend,ContinuousRegression,Trend):
    name ='kendall_corr'
    corrtype = 'kendall'
    display_name = "Kendall's Tau Correlation"

class Linear_Trend(LinearRegression,ContinuousRegression,Trend):
    name = 'lin_reg'
    display_name = 'Linear Regression'

class All_Linear_Trend(LinearRegression,ContinuousOrdinalRegression,Trend):
    name = 'lin_reg'
    display_name = 'Linear Regression'

class Binary_Pearson_Trend(CorrelationSignTrend,ContinuousRegression,Trend):
    corrtype = 'pearson'
    name = 'binary_sign'
    display_name = 'Pearson Correlation Sign'

class Binary_Mean_Rank_Trend(StatBinRankTrend,BinaryWeightedRank,Trend):
    my_stat = lambda self, d,m,w :w_avg(d,m,w )
    name = 'binary_rank'
    display_name = 'Comparison by Mean'

class Binary_Median_Rank_Trend(StatBinRankTrend,BinaryWeightedRank,Trend):
    my_stat = lambda self, d,m,w :w_median(d,m,w )
    name = 'binary_median_rank'
    display_name = 'Comparison by Median'




all_trend_types = {'pearson_corr':All_Pearson,
                    'spearman_corr': Spearman_Correlation,
                    'sum_rank':Sum_Rank_Trend,   
                    'rank_trend':Mean_Rank_Trend,
                    'percentage_rank':Percentage_Rank_Trend,   
                    'lin_reg':Linear_Trend,
                    'binary_rank':Binary_Mean_Rank_Trend,
                    'binary_sign':Binary_Pearson_Trend,
                    'median_rank':Mean_Rank_Trend,
                    'binary_median_rank':Binary_Median_Rank_Trend,
                    'binary_acc':Binary_Accuracy_Trend,
                    'binary_tpr':Binary_TPR_Trend,
                  'binary_ppv':Binary_PPV_Trend,
                  'binary_tnr':Binary_TNR_Trend,
                   'binary_fdr':Binary_FDR_Trend,
                   'binary_f1':Binary_F1_Trend
                  }

default_binary_trends = {'binary_rank':Binary_Mean_Rank_Trend,
                'binary_sign':Binary_Pearson_Trend}

default_distance_trends = {'rank_trend':Mean_Rank_Trend,
                    'lin_reg':Linear_Trend}
