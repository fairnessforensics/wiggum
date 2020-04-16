
# coding: utf-8

# In[1]:


import pandas as pd
import os
import wiggum as wg
import numpy as np


import pytest


def test_basic_load_df_wages():
    # We'll first load in some data, this has both regression and rate type trends. We will load it two ways and check that the structure is the same

    # In[2]:


    labeled_df_file = wg.LabeledDataFrame('data/wages_gender_rank_time_regression2/df.csv')


    # In[3]:


    labeled_df_dir = wg.LabeledDataFrame('data/wages_gender_rank_time_regression2')


    # In[4]:


    assert np.product(labeled_df_file.df.columns == labeled_df_dir.df.columns)


    # In[5]:


    assert labeled_df_file.df.shape == labeled_df_dir.df.shape


    # In[6]:


    compare_df = labeled_df_file.df == labeled_df_dir.df
    assert np.product(compare_df.sum() == len(labeled_df_file.df))


    # Next, we can infer the variable types and assign the roles then check that those match what was read from the saved copy

    # In[7]:


    labeled_df_file.infer_var_types()


    roles = {'department':['independent','splitby'], 'year':['independent'],
             'pay':['dependent'], 'gender':['independent','splitby']}

    var_types = {'gender':'categorical'}
    labeled_df_file.set_counts({var:False for var in labeled_df_file.df.columns})
    labeled_df_file.set_roles(roles)
    labeled_df_file.set_var_types(var_types)


    assert np.product(labeled_df_file.meta_df.columns == labeled_df_dir.meta_df.columns)

    assert labeled_df_file.meta_df.shape == labeled_df_dir.meta_df.shape

    compare_meta_df = labeled_df_file.meta_df.dropna(axis=1) == labeled_df_dir.meta_df.dropna(axis=1)
    assert np.product(compare_meta_df.sum() == len(labeled_df_dir.meta_df))
    # compare_meta_df
    # labeled_df_dir.meta_df.dropna(axis=1)


    # Now, we've set this up, we can also save these configurations to load them in directly in the future


    assert labeled_df_file.to_csvs('data/wages_test')


    # Now confirm that all the files were written correctly.

    assert sorted(os.listdir('data/wages_test/')) == ['df.csv', 'meta.csv', 'result_df.csv']


    # it write the three DataFrames each out to their own .csv file in that directory. If that directory exists it will overwrite without warning, if not, also creates the directory.
    #
    # Now, we can can also load the data back


    labeled_df = wg.LabeledDataFrame('data/wages_test')
    labeled_df.meta_df


    # And confirm that thiss is the same as what was written. First confirm the column headings are the same

    assert np.product(labeled_df.meta_df.columns == labeled_df_dir.meta_df.columns)


    # Then confirm the shape is the same

    assert labeled_df.meta_df.shape == labeled_df_dir.meta_df.shape


    # Then that non NaN values are all the same, combined with above the NaNs must be in the same location, but np.NaN == np.Nan asserts to false

    # In[18]:


    compare_meta_df = labeled_df.meta_df.dropna(axis=1) == labeled_df_dir.meta_df.dropna(axis=1)
    assert np.product(compare_meta_df.sum() == len(labeled_df_dir.meta_df))
    # compare_meta_df
    # labeled_df_dir.meta_df.dropna(axis=1)


    # In[19]:


    assert np.product(labeled_df.df.columns == labeled_df_dir.df.columns)


    # In[20]:


    assert labeled_df.df.shape == labeled_df_dir.df.shape


    # In[21]:


    compare_df = labeled_df.df.dropna(axis=1) == labeled_df_dir.df.dropna(axis=1)
    assert np.product(compare_df.sum() == len(labeled_df_dir.df))
    # compare_meta_df
    # labeled_df_dir.meta_df.dropna(axis=1)


    # In[22]:


    intersect_cols= ['gender','department']
    labeled_df.add_intersectional(intersect_cols)

    # Now check that that worked correctly
    # In[23]:


    intersectional_col_name = '_'.join(intersect_cols)
    intersectional_correct = lambda row: row[intersectional_col_name] == '_'.join([row[icol] for icol in intersect_cols])
    icol_correct = labeled_df.df.apply(intersectional_correct,axis=1)
    assert np.product(icol_correct)


    # In[24]:


    labeled_df.add_quantile(['pay'])

    q_limits = np.quantile(labeled_df.df['pay'],[.25,.75,1],)
    limits = {n:q for n,q in zip(['low','mid','high'],q_limits)}
    for q,df in labeled_df.df.groupby('payquantiles'):
        a = df['pay'] <= limits[q]
        assert np.product(a)


    # In[26]:


    assert labeled_df.get_vars_per_type('categorical') == ['department', 'gender', 'gender_department', 'payquantiles']

    assert labeled_df.meta_df.loc['gender_department','dtype'] == 'object'
    assert labeled_df.meta_df.loc['gender_department','var_type']  ==  'categorical'
    assert labeled_df.meta_df.loc['gender_department','role']  == 'splitby'
    assert labeled_df.meta_df.loc['gender_department','isCount']  ==  False


    # Check the utility fucntions

    # In[29]:


    assert labeled_df.get_vars_per_role('splitby') == ['department', 'gender', 'gender_department', 'payquantiles']
    assert labeled_df.get_vars_per_role('independent') == ['year','department', 'gender']
    assert labeled_df.get_vars_per_role('dependent') == ['pay']


    # In[30]:


    assert labeled_df.get_data_sample() == ['Max: 51.04 Min: 13.52',
     'Max: 50.0 Min: 0.0',
     'Support, Sales, Management, R&D',
     'F, M',
     'F_Support, M_Support, M_Sales, F_Sales, M_Management',
     'mid, low, high']


    # In[31]:


    assert labeled_df.get_vars_per_type('categorical') == ['department', 'gender', 'gender_department', 'payquantiles']
    assert labeled_df.get_vars_per_type('continuous') == ['pay','year']


    # In[32]:


    assert labeled_df.get_vars_per_roletype('independent','continuous') == ['year']
    assert labeled_df.get_vars_per_roletype('independent','categorical') ==['department', 'gender']


    # # Using Trends
    #
    # Trend objects define their name, how to compute the trend and how to choose which variables,
    #
    # extension will allow that the var lists may be passed to reduce which ones are computed

    # In[33]:


    corrobj = wg.All_Pearson()
    corrobj.get_trend_vars(labeled_df)
    assert corrobj.regression_vars == [('year', 'pay')]
    assert len(corrobj.var_weight_list) == len(corrobj.regression_vars)
    assert corrobj.set_vars== True


    # In[34]:


    rankobj = wg.Mean_Rank_Trend()
    assert rankobj.get_trend_vars(labeled_df)
    assert rankobj.target ==['pay']
    assert rankobj.trendgroup == ['department', 'gender']
    assert rankobj.set_vars== True
    assert len(rankobj.var_weight_list) == len(rankobj.target)


    # In[35]:


    linreg_obj = wg.All_Linear_Trend()
    linreg_obj.get_trend_vars(labeled_df)
    assert linreg_obj.regression_vars == [('year', 'pay')]
    assert len(linreg_obj.var_weight_list) == len(linreg_obj.regression_vars)
    assert linreg_obj.set_vars== True


    # # Computing Trends on a LabeledDataFrame

    # There are two ways, we can use default setting and pass the names of the trend type or a trend object

    # In[36]:


    labeled_df.get_subgroup_trends_1lev(['pearson_corr'])

    assert np.product(labeled_df.result_df.columns == ['independent', 'dependent', 'group_feat', 'subgroup', 'agg_trend',
           'agg_trend_strength', 'subgroup_trend', 'subgroup_trend_strength',
           'trend_type', 'comparison_type'])


    # In[38]:


    # there are 10 fixed columns and the number of rows for this trend is below
    num_reg_pairs = 1
    num_depts = 4
    num_genders = 2
    num_quantiles = 3
    num_dept_genders = num_genders*num_depts
    num_pearson = num_reg_pairs*(num_depts+num_genders + num_dept_genders+ num_quantiles )
    assert labeled_df.result_df.shape == (num_pearson,10)


    # Now we can use a list of objects and apply multiple trends

    # In[39]:


    labeled_df.get_subgroup_trends_1lev([rankobj,linreg_obj])

    num_lin = num_pearson
    num_gender_idep = num_depts + num_dept_genders+ num_quantiles
    num_dept_indep = num_genders + num_dept_genders+ num_quantiles
    num_rank = num_gender_idep + num_dept_indep
    total_rows_agg_sg = num_pearson + num_lin + num_rank
    assert labeled_df.result_df.shape == (total_rows_agg_sg,10)


    # We can see what types of trends were computed from `result_df`

    # In[41]:


    assert np.product(pd.unique(labeled_df.result_df['trend_type']) ==['pearson_corr', 'rank_trend', 'lin_reg'])


    # In[42]:


    assert pd.unique(labeled_df.result_df['comparison_type']) ==['aggregate-subgroup']


    # We can also add trends that are structured for pairwise comparisons

    # In[43]:


    labeled_df.get_pairwise_trends_1lev([rankobj,linreg_obj])

    # Again, check that the infrastructure of this by checking that the number of rows is correct

    # In[44]:


    num_dept_pairs = np.sum(list(range(num_depts)))
    num_gender_pairs = np.sum(list(range(num_genders)))
    num_dept_genders_pairs = np.sum(list(range(num_dept_genders)))
    num_quantile_pairs = np.sum(list(range(num_quantiles)))
    gender_indep_pairwise_rows = num_dept_pairs  + num_dept_genders_pairs + num_quantile_pairs
    dept_indep_pairwise_rows = num_gender_pairs + num_dept_genders_pairs + num_quantile_pairs
    lin_reg_pairwise_rows = num_dept_pairs +num_gender_pairs + num_dept_genders_pairs + num_quantile_pairs
    rank_pairwise_rows = gender_indep_pairwise_rows + dept_indep_pairwise_rows
    total_rows = total_rows_agg_sg + lin_reg_pairwise_rows + rank_pairwise_rows
    assert labeled_df.result_df.shape == (total_rows,13)


    # In[45]:


    assert list(pd.unique(labeled_df.result_df['comparison_type'])) ==['aggregate-subgroup', 'pairwise']


    # The object also stores the trend objects that have been applied, they can be used for mapping to get the distance functions that are appropriate for each trend

    # In[46]:


    labeled_df.trend_list


    # In[47]:


    # labeled_df.result_df['distance'] = labeled_df.result_df.apply(dist_helper,axis=1)
    labeled_df.add_distance(row_wise=True) #('subgroup_trend','subgroup_trend2')
    assert labeled_df.result_df.shape == (total_rows,14)


    # Each trend object has a trend_precompute dictionary as a property that stores the intermediate values (tables of the weighted rates for ranks and correlation matrices for pearson correlation, TODO: what do we need for linreg). These can be used in vizualization.

    # # Saving with trends

    # In[48]:


    assert labeled_df.save_all('data/wages_test_all')


    # In[49]:


    assert sorted(os.listdir('data/wages_test_all/')) == ['df.csv', 'meta.csv', 'result_df.csv', 'trends.json']


    # In[50]:


    labeled_df_tl = wg.LabeledDataFrame('data/wages_test_all')


    # That save function calls the save function tested above, we only need to test that the trend list loaded correctly

    # In[51]:


    labeled_df.trend_list[0].trend_precompute


    # In[52]:


    labeled_df_tl.trend_list[0].trend_precompute


    # # Filtering

    # Test for each filter variable, one at a time and several pairs

    # In[53]:


    year_df = labeled_df.get_trend_rows(independent='year')
    pay_df = labeled_df.get_trend_rows(dependent='pay')
    dept_df = labeled_df.get_trend_rows(group_feat='department')
    mgmt_df = labeled_df.get_trend_rows(subgroup='Management')
    sales_df = labeled_df.get_trend_rows(subgroup2='Sales')
    linreg_df = labeled_df.get_trend_rows(trend_type ='lin_reg' )
    pair_df = labeled_df.get_trend_rows(comparison_type='pairwise')


    # TODO: manually verify these counts

    # In[54]:


    assert len(year_df)  == 72
    assert len(pay_df)  == 169
    assert len(dept_df)  == 24
    assert len(mgmt_df)  == 12
    assert len(sales_df)  == 4
    assert len(linreg_df) == 55

    assert len(pair_df) == lin_reg_pairwise_rows + rank_pairwise_rows


    # Now test two conditions and passing a list to a condition

    # In[55]:


    y_sm_df = labeled_df.get_trend_rows(independent='year',subgroup=['Management','Sales'])
    pay_rank = labeled_df.get_trend_rows(dependent='pay',trend_type='rank_trend')


    # We can also filter based on SP detections with `

    # In[56]:


    labeled_df.get_SP_rows(thresh=.2)


    # In[57]:


    assert labeled_df.result_df.shape == (total_rows,15)


    # ## Detection
    #
    # Detection via `get_SP_rows` happens in two steps:
    # 1. label the rows
    # 2. filter by that column to return
    #
    # Labeling the rows can happen in a number of ways too, the detection accepts a number of forms of input, custom detections can be built in many ways

    # when filter_thresh is a dictionary, the filtering happens by taking the intersection of each row by the treshold prvided.  Some defaults are also built in accessible by string.

    # In[58]:


    labeled_df.get_SP_rows('default_qual_sp')
    assert labeled_df.result_df.shape == (total_rows,16)


    # Basic type checks on detections, TODO: accuracy on detections

    # In[59]:


    assert labeled_df.result_df['SP_thresh0.2'].dtype ==bool
    assert labeled_df.result_df['default_qual_sp'].dtype ==bool


    # In[60]:


    labeled_df.get_SP_rows('SP')
    assert labeled_df.result_df.shape == (total_rows,17)
    assert labeled_df.result_df['SP'].dtype ==bool


    # We can also define our own detection filters, using any available column

    # In[61]:


    rank_only_qual = {'name':'rank_only_qual_sp','distance':.2,'agg_trend_strength':.05,
                    'subgroup_trend_strength':.05, 'trend_type':'rank_trend'}
    labeled_df.get_SP_rows(rank_only_qual,replace=True)
    assert labeled_df.result_df.shape == (total_rows,18)

    # # Ranking

    # In[62]:


    labeled_df.rank_occurences_by_view(ascending=False)
    assert labeled_df.result_df.shape == (total_rows,19)


    labeled_df.add_view_score('SP_thresh0.2',agg_type='sum',colored=False)
    assert labeled_df.result_df.shape == (total_rows,20)

    labeled_df.rank_occurences_by_view('sum_view_SP_thresh0.2','SP_thresh0.2')
