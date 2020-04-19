from wiggum_app import app
import wiggum as wg
import pytest
from wiggum_app import models
from wiggum_app import controller
from flask import request
import flask

def test_controller():
    tester = app.test_client()

    # test pearson_corr
    # action: folder_open
    response = tester.post('/', data = dict(action="folder_open", folder = "iristest"))
    meta = ""
    meta += "[{\"name\":\"sepal length\",\"var_type\":\"continuous\",\"role\":[\"independent\",\"dependent\"],\"isCount\":\"N\",\"weighting_var\":\"N/A\"},"
    meta += "{\"name\":\"sepal width\",\"var_type\":\"continuous\",\"role\":[\"dependent\"],\"isCount\":\"N\",\"weighting_var\":\"N/A\"},"
    meta += "{\"name\":\"petal length\",\"var_type\":\"continuous\",\"role\":[\"independent\"],\"isCount\":\"N\",\"weighting_var\":\"N/A\"},"
    meta += "{\"name\":\"petal width\",\"var_type\":\"continuous\",\"role\":[\"independent\"],\"isCount\":\"N\",\"weighting_var\":\"N/A\"},"
    meta += "{\"name\":\"class\",\"var_type\":\"categorical\",\"role\":[\"splitby\"],\"isCount\":\"N\",\"weighting_var\":\"N/A\"}]"

    trend_types = "pearson_corr"
    # action: visualize
    response = tester.post('/', data = dict(action="visualize", metaList = meta, trend_types = trend_types))   
    # action: page_load
    response = tester.post('/', data = dict(action="page_load"))       

    assert controller.labeled_df_setup.result_df.empty == False
    assert response.status_code == 200

    # test lin_reg
    # action: folder_open
    response = tester.post('/', data = dict(action="folder_open", folder = "iristest"))
    meta = ""
    meta += "[{\"name\":\"sepal length\",\"var_type\":\"continuous\",\"role\":[\"independent\",\"dependent\"],\"isCount\":\"N\",\"weighting_var\":\"N/A\"},"
    meta += "{\"name\":\"sepal width\",\"var_type\":\"continuous\",\"role\":[\"dependent\"],\"isCount\":\"N\",\"weighting_var\":\"N/A\"},"
    meta += "{\"name\":\"petal length\",\"var_type\":\"continuous\",\"role\":[\"independent\"],\"isCount\":\"N\",\"weighting_var\":\"N/A\"},"
    meta += "{\"name\":\"petal width\",\"var_type\":\"continuous\",\"role\":[\"independent\"],\"isCount\":\"N\",\"weighting_var\":\"N/A\"},"
    meta += "{\"name\":\"class\",\"var_type\":\"categorical\",\"role\":[\"splitby\"],\"isCount\":\"N\",\"weighting_var\":\"N/A\"}]"

    trend_types = "lin_reg"
    # action: visualize
    response = tester.post('/', data = dict(action="visualize", metaList = meta, trend_types = trend_types))   
    # action: page_load
    response = tester.post('/', data = dict(action="page_load"))       

    assert controller.labeled_df_setup.result_df.empty == False
    assert response.status_code == 200
    
    # test rank_trend
    # action: folder_open
    response = tester.post('/', data = dict(action="folder_open", folder = "wages_gender_rank_time_regression2"))
    meta = ""
    meta += "[{\"name\":\"pay\",\"var_type\":\"continuous\",\"role\":[\"dependent\"],\"isCount\":\"N\",\"weighting_var\":\"N/A\"},"
    meta += "{\"name\":\"year\",\"var_type\":\"continuous\",\"role\":[\"independent\"],\"isCount\":\"N\",\"weighting_var\":\"N/A\"},"
    meta += "{\"name\":\"department\",\"var_type\":\"categorical\",\"role\":[\"independent\",\"splitby\"],\"isCount\":\"N\",\"weighting_var\":\"N/A\"},"
    meta += "{\"name\":\"gender\",\"var_type\":\"categorical\",\"role\":[\"independent\",\"splitby\"],\"isCount\":\"N\",\"weighting_var\":\"N/A\"}]"

    trend_types = "rank_trend"
    # action: visualize
    response = tester.post('/', data = dict(action="visualize", metaList = meta, trend_types = trend_types))   
    # action: page_load
    response = tester.post('/', data = dict(action="page_load"))       

    assert controller.labeled_df_setup.result_df.empty == False
    assert response.status_code == 200

    # test compute quantiles
    response = tester.post('/', data = dict(action="folder_open", folder = "iristest"))
    meta = ""
    meta += "[{\"name\":\"sepal length\",\"var_type\":\"continuous\",\"role\":[\"independent\",\"dependent\"],\"isCount\":\"N\",\"weighting_var\":\"N/A\"},"
    meta += "{\"name\":\"sepal width\",\"var_type\":\"continuous\",\"role\":[\"dependent\"],\"isCount\":\"N\",\"weighting_var\":\"N/A\"},"
    meta += "{\"name\":\"petal length\",\"var_type\":\"continuous\",\"role\":[\"independent\"],\"isCount\":\"N\",\"weighting_var\":\"N/A\"},"
    meta += "{\"name\":\"petal width\",\"var_type\":\"continuous\",\"role\":[\"independent\"],\"isCount\":\"N\",\"weighting_var\":\"N/A\"},"
    meta += "{\"name\":\"class\",\"var_type\":\"categorical\",\"role\":[\"splitby\"],\"isCount\":\"N\",\"weighting_var\":\"N/A\"}]"

    # action: quantiles
    checked_vars = "sepal length"
    user_cutoffs = 0.25
    response = tester.post('/', data = dict(action="quantiles", metaList = meta, checked_vars = checked_vars, user_cutoffs = user_cutoffs))   
    assert response.status_code == 200

    # test clustering
    response = tester.post('/', data = dict(action="folder_open", folder = "iristest"))
    meta = ""
    meta += "[{\"name\":\"sepal length\",\"var_type\":\"continuous\",\"role\":[\"independent\",\"dependent\"],\"isCount\":\"N\",\"weighting_var\":\"N/A\"},"
    meta += "{\"name\":\"sepal width\",\"var_type\":\"continuous\",\"role\":[\"dependent\"],\"isCount\":\"N\",\"weighting_var\":\"N/A\"},"
    meta += "{\"name\":\"petal length\",\"var_type\":\"continuous\",\"role\":[\"independent\"],\"isCount\":\"N\",\"weighting_var\":\"N/A\"},"
    meta += "{\"name\":\"petal width\",\"var_type\":\"continuous\",\"role\":[\"independent\"],\"isCount\":\"N\",\"weighting_var\":\"N/A\"},"
    meta += "{\"name\":\"class\",\"var_type\":\"categorical\",\"role\":[\"splitby\"],\"isCount\":\"N\",\"weighting_var\":\"N/A\"}]"

    # action: clustering
    qual_thresh = 0.2
    response = tester.post('/', data = dict(action="clustering", metaList = meta, qual_thresh = qual_thresh))   
    assert response.status_code == 200

    # test intersection
    response = tester.post('/', data = dict(action="folder_open", folder = "wages_gender_rank_time_regression2"))
    meta = ""
    meta += "[{\"name\":\"pay\",\"var_type\":\"continuous\",\"role\":[\"dependent\"],\"isCount\":\"N\",\"weighting_var\":\"N/A\"},"
    meta += "{\"name\":\"year\",\"var_type\":\"continuous\",\"role\":[\"independent\"],\"isCount\":\"N\",\"weighting_var\":\"N/A\"},"
    meta += "{\"name\":\"department\",\"var_type\":\"categorical\",\"role\":[\"independent\",\"splitby\"],\"isCount\":\"N\",\"weighting_var\":\"N/A\"},"
    meta += "{\"name\":\"gender\",\"var_type\":\"categorical\",\"role\":[\"independent\",\"splitby\"],\"isCount\":\"N\",\"weighting_var\":\"N/A\"}]"

    # action: intersection
    intersection_vars = "department,gender"
    tuple_lens = "2"
    response = tester.post('/', data = dict(action="intersection", metaList = meta, intersection_vars = intersection_vars, tuple_lens = tuple_lens))   
    assert response.status_code == 200

    # test file open
    # action: open
    response = tester.post('/', data = dict(action="open", file=open("data/iris.csv", "rb")))
    meta = ""
    meta += "[{\"name\":\"sepal length\",\"var_type\":\"continuous\",\"role\":[\"independent\",\"dependent\"],\"isCount\":\"N\",\"weighting_var\":\"N/A\"},"
    meta += "{\"name\":\"sepal width\",\"var_type\":\"continuous\",\"role\":[\"dependent\"],\"isCount\":\"N\",\"weighting_var\":\"N/A\"},"
    meta += "{\"name\":\"petal length\",\"var_type\":\"continuous\",\"role\":[\"independent\"],\"isCount\":\"N\",\"weighting_var\":\"N/A\"},"
    meta += "{\"name\":\"petal width\",\"var_type\":\"continuous\",\"role\":[\"independent\"],\"isCount\":\"N\",\"weighting_var\":\"N/A\"},"
    meta += "{\"name\":\"class\",\"var_type\":\"categorical\",\"role\":[\"splitby\"],\"isCount\":\"N\",\"weighting_var\":\"N/A\"}]"

    trend_types = "pearson_corr"
    # action: visualize
    response = tester.post('/', data = dict(action="visualize", metaList = meta, trend_types = trend_types))   
    # action: page_load
    response = tester.post('/', data = dict(action="page_load"))       

    assert controller.labeled_df_setup.result_df.empty == False
    assert response.status_code == 200    

    # test filter, detect, ranking, reset
    response = tester.post('/', data = dict(action="folder_open", folder = "iristest"))
    meta = ""
    meta += "[{\"name\":\"sepal length\",\"var_type\":\"continuous\",\"role\":[\"independent\",\"dependent\"],\"isCount\":\"N\",\"weighting_var\":\"N/A\"},"
    meta += "{\"name\":\"sepal width\",\"var_type\":\"continuous\",\"role\":[\"dependent\"],\"isCount\":\"N\",\"weighting_var\":\"N/A\"},"
    meta += "{\"name\":\"petal length\",\"var_type\":\"continuous\",\"role\":[\"independent\"],\"isCount\":\"N\",\"weighting_var\":\"N/A\"},"
    meta += "{\"name\":\"petal width\",\"var_type\":\"continuous\",\"role\":[\"independent\"],\"isCount\":\"N\",\"weighting_var\":\"N/A\"},"
    meta += "{\"name\":\"class\",\"var_type\":\"categorical\",\"role\":[\"splitby\"],\"isCount\":\"N\",\"weighting_var\":\"N/A\"}]"

    trend_types = "pearson_corr"
    response = tester.post('/', data = dict(action="visualize", metaList = meta, trend_types = trend_types))   
    response = tester.post('/', data = dict(action="page_load"))       

    # action: filter
    filter_object = "{\"independent\":[],\"dependent\":[],\"group_feat\":[],\"subgroup\":[\"Iris-setosa\"],\"trend_type\":[]}"
    response = tester.post('/', data = dict(action="filter", filter_object = filter_object))   

    assert controller.labeled_df_setup.result_df.empty == False
    assert response.status_code == 200

    # action: reset
    response = tester.post('/', data = dict(action="reset"))   

    assert controller.labeled_df_setup.result_df.empty == False
    assert response.status_code == 200

    # action: detect
    filter_object = "{\"independent\":[],\"dependent\":[],\"group_feat\":[],\"subgroup\":[\"Iris-setosa\"],\"trend_type\":[]}"
    distance_threshold = 0.2
    sg_strength_threshold = 0.2
    agg_strength_threshold = 0.2
    trend_types = "pearson_corr"
    response = tester.post('/', data = dict(action="detect", filter_object = filter_object, 
                    trend_types = trend_types, distance_threshold = distance_threshold, 
                    sg_strength_threshold = sg_strength_threshold, agg_strength_threshold = agg_strength_threshold))   
    
    assert controller.labeled_df_setup.result_df.empty == False
    assert response.status_code == 200

    # action: ranking
    filter_object = "{\"independent\":[],\"dependent\":[],\"group_feat\":[],\"subgroup\":[\"Iris-setosa\"],\"trend_type\":[]}"
    agg_type = 'mean'
    score_col = 'distance'
    response = tester.post('/', data = dict(action="rank", filter_object = filter_object, 
                    agg_type = agg_type, score_col = score_col))   
    
    assert controller.labeled_df_setup.result_df.empty == False
    assert response.status_code == 200

def test_model():
    labeled_df_setup = wg.LabeledDataFrame('data/iris.csv')
    meta = ""
    meta += "[{\"name\":\"sepal length\",\"var_type\":\"continuous\",\"role\":[\"independent\",\"dependent\"],\"isCount\":\"N\",\"weighting_var\":\"N/A\"},"
    meta += "{\"name\":\"sepal width\",\"var_type\":\"continuous\",\"role\":[\"dependent\"],\"isCount\":\"N\",\"weighting_var\":\"N/A\"},"
    meta += "{\"name\":\"petal length\",\"var_type\":\"continuous\",\"role\":[\"independent\"],\"isCount\":\"N\",\"weighting_var\":\"N/A\"},"
    meta += "{\"name\":\"petal width\",\"var_type\":\"continuous\",\"role\":[\"independent\"],\"isCount\":\"N\",\"weighting_var\":\"N/A\"},"
    meta += "{\"name\":\"class\",\"var_type\":\"categorical\",\"role\":[\"splitby\"],\"isCount\":\"N\",\"weighting_var\":\"N/A\"}]"

    # test updateMetaData
    labeled_df_setup = models.updateMetaData(labeled_df_setup, meta)
    assert len(labeled_df_setup.meta_df) == 5

    # test checkSameMetadata
    checkResult = models.checkSameMetadata(labeled_df_setup, meta)
    assert checkResult == True

    # test getDistanceHeatmapDict
    corr_obj = wg.All_Pearson()
    assert corr_obj.is_computable(labeled_df_setup)
    labeled_df_setup.get_subgroup_trends_1lev([corr_obj])
    labeled_df_setup.add_distance()
    distance_heatmap_dict = models.getDistanceHeatmapDict(labeled_df_setup, labeled_df_setup.result_df)
    assert len(distance_heatmap_dict) == 3

    # test getRankTrendDetail
    labeled_df_wage2 = wg.LabeledDataFrame('data/wages_gender_rank_time_regression2')
    rankobj = wg.Mean_Rank_Trend()
    labeled_df_wage2.get_subgroup_trends_1lev([rankobj])
    dependent = 'pay'
    independent = 'gender'
    group_feat = 'department'
    rank_trend_detail, rank_trend_count = models.getRankTrendDetail(labeled_df_wage2, 
                                                dependent, independent, group_feat)
    assert rank_trend_detail.empty == False
    assert rank_trend_count.empty == False

    # test getMetaDict
    result_dict = {}
    result_dict = models.getMetaDict(labeled_df_wage2)
    assert len(result_dict) == 6
