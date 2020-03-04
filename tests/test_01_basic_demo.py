import pytest

import pandas as pd
import wiggum as wg
import numpy as np


def test_basic_load_df():
    hit_search_rate = pd.read_csv('data/state_hit_rate_min_cols_COCTFLILMDMAMOMTNENCOHRISCTXVTWAWI.csv',index_col='Unnamed: 0')

    # We can now use the LabeledDataFrame with that DataFrame to create the object
    labeled_df_setup = wg.LabeledDataFrame(hit_search_rate)
    labeled_df_setup.infer_var_types()

    # For this, we'll manually set these, but in the vizualization tool you can also set these with drop down menus

    roles = {'state':['trend','groupby'], 'year':'trend', 'driver_gender':['trend','groupby'],
             'driver_race':['trend','groupby'],
           'decriminalization':['groupby'], 'medical':['groupby'],
             'recreational':['groupby'], 'no_reforms':['groupby'],
           'search_conducted_false':'ignore', 'search_conducted_true':'ignore',
           'search_conducted_rate':'trend', 'contraband_found_false':'ignore',
           'contraband_found_true':'ignore', 'contraband_found_rate':'trend', 'hit_false':'ignore',
           'hit_true':'ignore', 'hit_rate':'trend', 'num_stops':'trend'}
    is_count = {'state':False, 'year':False, 'driver_gender':False, 'driver_race':False,
           'decriminalization':False, 'medical':False, 'recreational':False, 'no_reforms':False,
           'search_conducted_false':True, 'search_conducted_true':True,
           'search_conducted_rate':False, 'contraband_found_false':True,
           'contraband_found_true':True, 'contraband_found_rate':False, 'hit_false':True,
           'hit_true':True, 'hit_rate':False, 'num_stops':True}
    count_list = ['search_conducted_false', 'search_conducted_true','contraband_found_false',
           'contraband_found_true', 'hit_false',
           'hit_true', 'num_stops']
    var_types = {'driver_gender':'categorical','decriminalization':'categorical',
                 'medical':'categorical', 'recreational':'categorical', 'no_reforms':False,}
    weighting = {'hit_rate':'search_conducted_true','search_conducted_rate':'num_stops',
                 'contraband_found_rate':'num_stops'}


    # We'll set those next.  Above gives examples of two ways that we can specify the count values to pass them to the set_counts function, but we'll only call it once below.

    labeled_df_setup.set_counts(count_list)
    labeled_df_setup.set_roles(roles)
    labeled_df_setup.set_weighting_vars(weighting)
    labeled_df_setup.set_var_types(var_types)


    labeled_df_setup.to_csvs('data/ldf_state_hit_rate_min_cols_COCTFLILMDMAMOMTNENCOHRISCTXVTWAWI')

    # load saved data back
    labeled_df = wg.LabeledDataFrame('data/ldf_state_hit_rate_min_cols_COCTFLILMDMAMOMTNENCOHRISCTXVTWAWI')

    # test augmentatiton
    labeled_df.add_intersectional()
    labeled_df.df.head()
    labeled_df.add_all_dpgmm(qual_thresh =.2)
    labeled_df.add_quantile(['hit_rate','num_stops'])

    # # Using Trends
    #
    # Trend objects define their name, how to compute the trend and how to choose which variables,
    #
    # extension will allow that the var lists may be passed to reduce which ones are computed



    corrobj = wg.All_Pearson()
    corrobj.get_trend_vars(labeled_df)
    corrobj.is_computable()


    rankobj = wg.Mean_Rank_Trend()
    rankobj.is_computable(labeled_df)
    linreg_obj = wg.All_Linear_Trend()
    linreg_obj.is_computable(labeled_df)


    # # Computing Trends on a LabeledDataFrame

    # There are two ways, we can use default setting and pass the names of the trend type or a trend object

    # In[16]:


    labeled_df.get_subgroup_trends_1lev(['pearson_corr'])


    # Now we can use a list of objects and apply multiple trends
    labeled_df.get_subgroup_trends_1lev([rankobj,linreg_obj])
    labeled_df.get_pairwise_trends_1lev([rankobj,linreg_obj])

    # confirm that rankobj trends trend_precompute has the right columns
    sel_trend = '_'.join([rankobj.name,'agg_trend','search_conducted_rate',
                        'driver_gender'])

    for reqcol in ['stat','max','min','count']:
        assert reqcol in labeled_df.trend_list[1].trend_precompute[sel_trend].columns
    # These  two methods give the same, the string based version allows for simple access to default setting but passing a trend object would allow for overriding defaults and creating more custom subests of trends.



    # test saving all
    labeled_df.save_all('data/ldf_state_hit_rate_min_cols_COCTFLILMDMAMOMTNENCOHRISCTXVTWAWI_all')
    labeled_df = wg.LabeledDataFrame('data/ldf_state_hit_rate_min_cols_COCTFLILMDMAMOMTNENCOHRISCTXVTWAWI_all')

    # test metadata index is correct
    assert labeled_df.meta_df.index.name == 'variable'

    ## test filtering in place (also before add distance to accelerate test time)

    before_result_len = labeled_df.result_df.shape[0]


    labeled_df.get_trend_rows(comparison_type='aggregate-subgroup',inplace=True)

    after_result_len = labeled_df.result_df.shape[0]
    assert after_result_len < before_result_len

    comparisons_after_filter = list(set(labeled_df.result_df['comparison_type']))
    assert len(comparisons_after_filter) == 1
    assert 'subgroup-aggregate' in comparisons_after_filter

    # this is tested after reloading to confirm that types are correct
    labeled_df.add_distance(row_wise = True)

    # So, we can use that function to filter and look at subsets of the trends based on the features, groupby, or subgroups

    labeled_df.get_trend_rows(feat1='year',subgroup=['Black','Hispanic'])


    # In[24]:


    labeled_df.get_trend_rows(group_feat = 'driver_race',trend_type ='lin_reg' )


    # We can also filter based on SP detections with `

    # In[25]:


    labeled_df.get_SP_rows(thresh=.2)


    # ## Detection
    #
    # Detection via `get_SP_rows` happens in two steps:
    # 1. label the rows
    # 2. filter by that column to return
    #
    # Labeling the rows can happen in a number of ways too, the detection accepts a number of forms of input, custom detections can be built in many ways



    # when filter_thresh is a dictionary, the filtering happens by taking the intersection of each row by the treshold prvided.  Some defaults are also built in accessible by string.



    labeled_df.get_SP_rows('default_qual_sp')

    labeled_df.get_SP_rows('SP')



    lin_only_qual = {'name':'lin_only_qual_sp','distance':.2, 'agg_trend_strength':.05,
                    'subgroup_trend_strength':.15,'trend_type':'lin_reg'}
    labeled_df.get_SP_rows(lin_only_qual,replace=True)


    # # Ranking

    labeled_df.rank_occurences_by_view(ascending=False).head(20)

    labeled_df.add_view_score('SP_thresh0.2',agg_type='sum',colored=False).head(10)


    labeled_df.rank_occurences_by_view('sum_view_SP_thresh0.2','SP_thresh0.2').head()
