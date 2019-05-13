from .base_getvars import (trend, ordinalRegression,
                    continuousOrdinalRegression,
                    continuousRegression, binaryMeanRank, weightedMeanRank)

from .categorical import rankTrend

from .regression import linearRegression

from .statistical import correlationTrend



__all__ = ['trend','ordinalRegression',
    'continuousOrdinalRegression',
    'continuousRegression', 'binaryMeanRank', 'weightedMeanRank', 'rankTrend',
    'linearRegression','correlationTrend']
