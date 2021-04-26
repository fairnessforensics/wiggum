#!/usr/bin/env python
# coding: utf-8

# In[1]:


import pandas as pd
import os
import wiggum as wg
import numpy as np


# In[2]:


labeled_df = wg.LabeledDataFrame('../data/iristest')
labeled_df.meta_df


# In[3]:


rankobj = wg.Mean_Rank_Trend()
linreg_obj = wg.All_Linear_Trend()

labeled_df.get_subgroup_trends_1lev([rankobj,linreg_obj])
labeled_df.result_df.sample(10)


# In[4]:


labeled_df.result_df.iloc[13]


# In[5]:


labeled_df.annotate(13,'Comment','Reverse')


# In[6]:


labeled_df.result_df.iloc[13]


# In[7]:


labeled_df.result_df


# In[8]:


labeled_df.annotate(9,'Comment','Test')


# In[9]:


labeled_df.result_df


# In[10]:


labeled_df.filter_annotate(feat1='petal length',subgroup=['Iris-setosa'],annotate_col='Test', comment = 1)


# In[11]:


labeled_df.result_df


# In[12]:


labeled_df.delete_annotate(13,"Comment")


# In[13]:


#report_df = labeled_df.result_df.iloc[[0,1,2,3,4,5,6],[0,1,2,3,4,5]]
#results_df.iloc[[0,1,2,3,4,5,6],[0,1,2,3,4,5]]
#report_df


# In[14]:


report_df = labeled_df.get_report_table([0,1,2,3,4,5,6],[0,1,2,3,4,5,6])
report_df


# In[15]:


labeled_df.save_report_table([0,1,2,3,4,5,6],[0,1,2,3,4,5,6],"iris_report.csv")


# In[16]:


labeled_df.result_df['trend_type'].value_counts()


# In[17]:


#labeled_df.result_df_stat_summary("Test")


# In[18]:


new_df = labeled_df.result_df[((labeled_df.result_df["agg_trend"] < 0) == (labeled_df.result_df["subgroup_trend"] < 0)) == False]
new_df
 


# In[19]:


total_rows = len(new_df.index)
print(total_rows)


# In[20]:


len(new_df[new_df["subgroup_trend_strength"] > .5])


# In[21]:


distance = [0.6438666996,0.6256534913 ,0.4857791439,0.2121011069,0.0105583417,0.0948039601,0.148629899,0.0660374135,0.1931507183,0.2514102163,0.2121011069,0.2935684781,0.3011883759,0.1814805029,0.6256534913]
labeled_df.result_df['distance'] = distance


# In[22]:


labeled_df.result_df


# In[23]:


labeled_df.result_df_stat_summary("Test")


# In[ ]:




