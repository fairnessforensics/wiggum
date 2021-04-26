import pandas as pd
import os
import wiggum as wg
import numpy as np

import pytest

def test_annotation_reporting():
    
    # read some data into a labeled dataframe so we have something to work with
    labeled_df = wg.LabeledDataFrame('data/iristest')
    
    # get some trend objects so we can populate our results table
    rankobj = wg.Mean_Rank_Trend()
    linreg_obj = wg.All_Linear_Trend()
    
    # get a sample from the data 
    labeled_df.get_subgroup_trends_1lev([rankobj,linreg_obj])
    labeled_df.result_df.sample(10)
    
    # try to annotate a column of the results dataframe 
    labeled_df.annotate(13,'Comment','Reverse')
     # first test to see if the new column was created
    assert('Comment' in labeled_df.result_df)
    # now test to see if our comment was added at the correct spot and matches what we expect
    assert((labeled_df.result_df.iloc[13]["Comment"]) == "Reverse")
    
    # Try to add a comment to a different row 
    labeled_df.annotate(9,'testCol','Test')
    # check to make sure the new column exists
    assert('testCol' in labeled_df.result_df)
    # test to make sure the new comment was added and is correct
    assert((labeled_df.result_df.iloc[9]["testCol"]) == "Test")
    
    # Try and change an existing comment 
    labeled_df.annotate(13,'Comment','Positive')
    assert((labeled_df.result_df.iloc[13]["Comment"]) == "Positive")
    
    # Test our filtered annotations

    labeled_df.filter_annotate(feat1='petal length',subgroup=['Iris-setosa'],annotate_col='Test', comment = "1")
    assert(labeled_df.result_df.iloc[3]["Test"] == "1" and labeled_df.result_df.iloc[6]["Test"] == "1")
    
    # delete a comment       
    labeled_df.delete_annotate(13,"Comment")
    
    # test to make sure the comment was deleted 
    assert(labeled_df.result_df.iloc[13]["Comment"] == '')  
           
    ''' Start testing the reports '''
    
    # Create a data frame representing the columns we want to pull for the report
    report_df = labeled_df.result_df.iloc[[0,1,2,3,4,5,6],[0,1,2,3,4,5,6]]
           
    # Create a data frame using our create report table function
    report_df2 = labeled_df.get_report_table([0,1,2,3,4,5,6],[0,1,2,3,4,5,6])
           
    assert(report_df == report_df2)
    

    # add some simulated distance values to the table
    distance =[0.6438666996,0.6256534913,0.4857791439,0.2121011069,0.0105583417,0.0948039601,0.148629899,0.0660374135,0.1931507183,0.2514102163,0.2121011069,0.2935684781,0.3011883759,0.1814805029,0.6256534913]
    labeled_df.result_df['distance'] = distance
    # test the threshold function
    assert(len(labeled_df.result_df[labeled_df.result_df["distance"] > .5]) == labeled_df.count_values_above_thres("distance",.5))




