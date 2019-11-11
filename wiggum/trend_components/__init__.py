from .base_getvars import (Trend, OrdinalRegression,ContinuousRegression,
                    ContinuousOrdinalRegression, BinaryWeightedRank,
                     WeightedRank, PredictionClass)

from .base_getvars import (w_median, w_avg)

from .categorical import StatRankTrend,StatBinRankTrend

from .regression import LinearRegression

from .statistical import CorrelationTrend, CorrelationSignTrend

from .classification import BinClassStats, stat_comp



__all__ = ['Trend','OrdinalRegression','w_avg',
    'ContinuousOrdinalRegression',
    'ContinuousRegression', 'BinaryWeightedRank', 'WeightedRank',
     'StatRankTrend', 'BinClassStats', 'PredictionClass',
    'LinearRegression','CorrelationTrend','StatBinRankTrend','CorrelationSignTrend']

baseTrendMixin_list = ['Trend']

varTypeMixin_list = ['OrdinalRegression','ContinuousOrdinalRegression',
                'ContinuousRegression', 'BinaryWeightedRank', 'WeightedRank',
                'PredictionClass']


trendCommputeMixin_list = ['StatRankTrend','StatBinRankTrend',
                        'LinearRegression','BinClassStats'
                        'CorrelationTrend','CorrelationSignTrend']
