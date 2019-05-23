from .base_getvars import (trend, ordinalRegression,continuousRegression,
                    continuousOrdinalRegression, binaryWeightedRank,
                     weightedRank)

from .base_getvars import (w_median, w_avg)

from .categorical import statRankTrend,statBinRankTrend

from .regression import linearRegression

from .statistical import correlationTrend, correlationSignTrend



__all__ = ['trend','ordinalRegression','w_avg',
    'continuousOrdinalRegression',
    'continuousRegression', 'binaryWeightedRank', 'weightedRank', 'statRankTrend',
    'linearRegression','correlationTrend','statBinRankTrend','correlationSignTrend']

baseTrendMixin_list = ['trend']

varTypeMixin_list = ['ordinalRegression','continuousOrdinalRegression',
                'continuousRegression', 'binaryWeightedRank', 'weightedRank']


trendCommputeMixin_list = ['statRankTrend','statBinRankTrend',
                        'linearRegression',
                        'correlationTrend','correlationSignTrend']
