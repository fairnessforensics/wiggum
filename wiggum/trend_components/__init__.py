from .base_getvars import (Trend, OrdinalRegression,ContinuousRegression,
                    ContinuousOrdinalRegression, BinaryWeightedRank,
                     WeightedRank, PredictionClass, PercentageRank)

from .base_getvars import (w_median, w_avg, sum)

from .categorical import StatRankTrend,StatBinRankTrend,PercentageRankTrend,SumRankTrend

from .regression import LinearRegression

from .statistical import CorrelationTrend, CorrelationSignTrend

from .classification import BinClassStats, stat_comp



__all__ = ['Trend','OrdinalRegression','w_avg','sum',
    'ContinuousOrdinalRegression',
    'ContinuousRegression', 'BinaryWeightedRank', 'WeightedRank', 'PercentageRank',
     'StatRankTrend', 'PercentageRankTrend', 'SumRankTrend', 'BinClassStats', 'PredictionClass',
    'LinearRegression','CorrelationTrend','StatBinRankTrend','CorrelationSignTrend']

baseTrendMixin_list = ['Trend']

varTypeMixin_list = ['OrdinalRegression','ContinuousOrdinalRegression',
                'ContinuousRegression', 'BinaryWeightedRank', 'WeightedRank',
                'PredictionClass', 'PercentageRank']


trendCommputeMixin_list = ['StatRankTrend','StatBinRankTrend', 'PercentageRankTrend', 
                        'SumRankTrend','LinearRegression','BinClassStats'
                        'CorrelationTrend','CorrelationSignTrend']
