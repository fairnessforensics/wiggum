from wiggum_app import app
import wiggum as wg
import pytest
from wiggum_app import models

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
    distance_heatmap_dict = models.getDistanceHeatmapDict(labeled_df_setup.result_df)
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