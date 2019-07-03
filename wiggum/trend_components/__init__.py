from .base_getvars import (trend, OrdinalRegression,ContinuousRegression,
                    continuousOrdinalRegression, BinaryWeightedRank,
                     WeightedRank)

from .base_getvars import (w_median, w_avg)

from .categorical import StatRankTrend,StatBinRankTrend

from .regression import LinearRegression

from .statistical import CorrelationTrend, CorrelationSignTrend



__all__ = ['trend','OrdinalRegression','w_avg',
    'continuousOrdinalRegression',
    'ContinuousRegression', 'BinaryWeightedRank', 'WeightedRank', 'StatRankTrend',
    'LinearRegression','CorrelationTrend','StatBinRankTrend','CorrelationSignTrend']

baseTrendMixin_list = ['trend']

varTypeMixin_list = ['OrdinalRegression','continuousOrdinalRegression',
                'ContinuousRegression', 'BinaryWeightedRank', 'WeightedRank']


trendCommputeMixin_list = ['StatRankTrend','StatBinRankTrend',
                        'LinearRegression',
                        'CorrelationTrend','CorrelationSignTrend']
