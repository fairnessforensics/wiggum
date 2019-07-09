from .base_getvars import (Trend, OrdinalRegression,ContinuousRegression,
                    ContinuousOrdinalRegression, BinaryWeightedRank,
                     WeightedRank)

from .base_getvars import (w_median, w_avg)

from .categorical import StatRankTrend,StatBinRankTrend

from .regression import LinearRegression

from .statistical import CorrelationTrend, CorrelationSignTrend



__all__ = ['Trend','OrdinalRegression','w_avg',
    'ContinuousOrdinalRegression',
    'ContinuousRegression', 'BinaryWeightedRank', 'WeightedRank', 'StatRankTrend',
    'LinearRegression','CorrelationTrend','StatBinRankTrend','CorrelationSignTrend']

baseTrendMixin_list = ['Trend']

varTypeMixin_list = ['OrdinalRegression','ContinuousOrdinalRegression',
                'ContinuousRegression', 'BinaryWeightedRank', 'WeightedRank']


trendCommputeMixin_list = ['StatRankTrend','StatBinRankTrend',
                        'LinearRegression',
                        'CorrelationTrend','CorrelationSignTrend']
