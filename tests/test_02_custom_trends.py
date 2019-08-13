
# coding: utf-8

# In[1]:

import pytest
import pandas as pd
import os
import wiggum as wg
import numpy as np
import itertools


# In[2]:
from wiggum import trend_components as tcomp


# In[9]:


def w_median(df,mcol,wcol):
    """
    """
    if pd.isna(wcol):
        wmed ,upper,lower = np.quantile(df[mcol],[.5,.25,.75])
    else:
        reps = [int(n) for n in df[wcol].values]
        reps_mcol = np.repeat(df[mcol].values,reps)
        wmed,upper,lower =np.quantile( reps_mcol,[.5,.25,.75])

    return pd.Series([wmed ,upper,lower],index=['stat','max','min'])


class WeightedMedianRank(tcomp.WeightedRank):
    """
    common parts for all continuous variable trends
    """
    # remove self
    my_stat = lambda self, d,m,w :w_median(d,m,w )

#     def get_trend_vars(self,labeled_df):
#         """
#         """
#         # maybe not counts

#         self.target = labeled_df.get_vars_per_roletype('trend',['binary','continuous'])
#         self.trendgroup = labeled_df.get_vars_per_roletype(['trend','explanatory'],'categorical')
#         self.var_weight_list = labeled_df.get_weightcol_per_var(self.target)
#         return self.target, self.trendgroup

class custom_Median_Rank_Trend(tcomp.StatRankTrend,WeightedMedianRank,
            tcomp.Trend):
    name = 'Median_Rank_Trend'


class min_lin_reg(wg.Linear_Trend):
    symmetric_vars = False # tell it not to do combinations

    def get_trend_vars(self,labeled_df=None):
        """
        """
        x_vars = ['year']
        y_vars = ['search_conducted_rate','contraband_found_rate','hit_rate','num_stops','search_conducted_true']

        self.regression_vars = list(itertools.product(x_vars,y_vars))
        return self.regression_vars

def test_custom_trends():
    labeled_df = wg.LabeledDataFrame('data/ldf_state_hit_rate_min_cols_COCTFLILMDMAMOMTNENCOHRISCTXVTWAWI')

    rankobj = wg.Mean_Rank_Trend()
    linregobj = wg.Linear_Trend()
    linregobj.get_trend_vars(labeled_df)


# The tren objects above will compute all pairs of given types, but what if we want to define custom trends?  We can do that by overloading existing types.  We'll overload only the get_trend_vars() function for now, but the other functions can also be overloaded or a totally new trend can be added as long as it is compatible.

    min_lin_reg_obj = min_lin_reg()
    min_lin_reg_obj.get_trend_vars()



# # Component-wise
#
# We can also use the components of trends to construct custom trends

    medianrankobj = custom_Median_Rank_Trend()
    labeled_df.get_subgroup_trends_1lev([medianrankobj,rankobj])
