from .base_getvars import (trend, ordinalRegression,continuousRegression,
                    continuousOrdinalRegression, binaryMeanRank,
                     weightedMeanRank, w_avg)

from .categorical import rankTrend

from .regression import linearRegression

from .statistical import correlationTrend



__all__ = ['trend','ordinalRegression',
    'continuousOrdinalRegression',
    'continuousRegression', 'binaryMeanRank', 'weightedMeanRank', 'rankTrend',
    'linearRegression','correlationTrend']

baseTrendMixin_list = ['trend']

varTypeMixin_list = ['ordinalRegression',
    'continuousOrdinalRegression',
    'continuousRegression', 'binaryMeanRank', 'weightedMeanRank']


trendCommputeMixin_list = ['statRankTrend',
    'linearRegression','correlationTrend']
