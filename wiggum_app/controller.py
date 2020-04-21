from wiggum_app import app, render_template
from wiggum_app import models
from flask import request, flash, redirect,jsonify, url_for
import pandas as pd
import json
import wiggum as wg
import numpy as np
from .models import Decoder

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/visualize", methods=['GET', 'POST'])
def visualize():
    return render_template("visualize.html")

@app.route("/", methods = ['POST'])
def main():
    if request.method == 'POST':

        action = request.form['action']

        global labeled_df_setup
        
        # store filter parameters
        global filter_flag
        global filter_object

        # store project name
        global project_name
        
        if action == 'folder_open':

            # initial filter flag and filter object
            filter_flag = False
            filter_object = {}

            folder = request.form['folder']

            # set folder name to project name
            project_name = folder

            folder = 'data/' + folder
            labeled_df_setup = wg.LabeledDataFrame(folder)

            result_dict = {}
            result_dict = models.getMetaDict(labeled_df_setup)

            result_dict['possible_roles'] = wg.possible_roles
            result_dict['trend_types'] = list(wg.all_trend_types.keys())

            trend_type_list = pd.unique(labeled_df_setup.result_df['trend_type'])
            result_dict['trend_type_list'] = list(trend_type_list)

            # get trend display names
            result_dict['trend_display_names'] = [v().display_name for k, v in wg.all_trend_types.items()]

            return jsonify(result_dict)

        # index.html 'Open' button clicked for data file
        if action == 'open':

            # initial filter flag and filter object
            filter_flag = False
            filter_object = {}

            # initial project name
            project_name = ""

            file = request.files.get('file')
            df = pd.read_csv(file)

            # Construct the csv data fitting d3.csv format
            global csv_data
            csv_data = df.to_dict(orient='records')
            csv_data = json.dumps(csv_data, indent=2)

            labeled_df_setup = wg.LabeledDataFrame(df)

            labeled_df_setup.infer_var_types()

            # get var_types for dropbox
            var_types = []
            var_types = labeled_df_setup.meta_df['var_type'].tolist()

            # get sample for data
            sample_list = []
            sample_list = labeled_df_setup.get_data_sample()

            # get trend display names
            trend_display_names = [v().display_name for k, v in wg.all_trend_types.items()]

            return jsonify({'var_types': var_types,
                            'samples': sample_list,
                            'possible_roles': wg.possible_roles, 
                            'trend_types': list(wg.all_trend_types.keys()),
                            'trend_display_names': trend_display_names})

        if action == 'save':
            meta = request.form['metaList']

            labeled_df_setup = models.updateMetaData(labeled_df_setup, meta)

            # store meta data into csv
            project_name = request.form['projectName']
            directory = 'data/' + project_name
            labeled_df_setup.save_all(directory)
            return 'Saved'

        # index.html 'Compute Quantiles' button clicked
        if action == 'quantiles':

            meta = request.form['metaList']
            labeled_df_setup = models.updateMetaData(labeled_df_setup, meta)

            checked_vars = request.form['checked_vars']
            checked_vars = checked_vars.split(",")
            
            if checked_vars:
                user_cutoffs = request.form['user_cutoffs']
                if user_cutoffs != '':
                    # extract quantiles from user input
                    cutoffs = [float(s) for s in user_cutoffs.split(',')]
                    cutoffs.extend([1])
                    cutoffs.insert(0,0)

                    labels = [str(np.round(a*100,2))+'to'+str(np.round(b*100,2))+'%' for a,b in zip(cutoffs[:-1],cutoffs[1:])]

                    quantiles_dict = dict(zip(labels, cutoffs[1:]))

                    labeled_df_setup.add_quantile(checked_vars, quantiles_dict)
                else:
                    labeled_df_setup.add_quantile(checked_vars)

            result_dict = {}
            result_dict = models.getMetaDict(labeled_df_setup)

            result_dict['possible_roles'] = wg.possible_roles

            return jsonify(result_dict)

        # index.html 'Clustering' button clicked
        if action == 'clustering':

            meta = request.form['metaList']
            labeled_df_setup = models.updateMetaData(labeled_df_setup, meta)

            qual_thresh = float(request.form['qual_thresh'])

            labeled_df_setup.add_all_dpgmm(qual_thresh = qual_thresh)

            result_dict = {}
            result_dict = models.getMetaDict(labeled_df_setup)

            result_dict['possible_roles'] = wg.possible_roles

            return jsonify(result_dict)            

        # index.html 'Add Intersection' button clicked
        if action == 'intersection':

            meta = request.form['metaList']
            labeled_df_setup = models.updateMetaData(labeled_df_setup, meta)

            checked_vars = request.form['intersection_vars']
            checked_vars = checked_vars.split(",")
            
            if checked_vars:
                tuple_lens = request.form['tuple_lens'].strip()
                if tuple_lens != '':
                    tuple_lens = [int(t) for t in tuple_lens.split(',')]
                    labeled_df_setup.add_intersectional(checked_vars, tuple_lens)
                else:
                    labeled_df_setup.add_intersectional(checked_vars)

            result_dict = {}
            result_dict = models.getMetaDict(labeled_df_setup)

            result_dict['possible_roles'] = wg.possible_roles

            return jsonify(result_dict)

        # visualize.html 'Save' button clicked
        if action == 'save_trends':
            # store meta data into csv
            project_name = request.form['projectName']
            directory = 'data/' + project_name
            labeled_df_setup.save_all(directory)          
            return 'Saved'      

        # index.html 'Visualize' button clicked
        if action == 'visualize':

            meta = request.form['metaList']
            checkResult = models.checkSameMetadata(labeled_df_setup, meta)

            # check if user input metadata is same as saved metadata
            if not(labeled_df_setup.result_df.empty) and checkResult == False: 
                # delete result_df
                labeled_df_setup.result_df = pd.DataFrame()

            labeled_df_setup = models.updateMetaData(labeled_df_setup, meta)

            global trend_list
            # initial trend list
            trend_list = []
            miss_trends_flg = False
            global filter_trend_list
            filter_trend_list = []

            # redirect flag for checking if page is relaod or redirect
            # if redirect, flas sets to True; if reload, flag sets to False
            global redirect_flag
            redirect_flag = True 

            user_trends = request.form['trend_types']
            user_trends = user_trends.split(",")

            # check if the selected trend types are different from result_df
            if not(labeled_df_setup.result_df.empty):
                # result table is not empty, extract trend types from result table
                trend_list_result_df = [trend.name for trend 
                                            in labeled_df_setup.trend_list]

                # delete the trend types existing in result table
                new_user_trends = list(set(user_trends)- set(trend_list_result_df))
                
                # check if trend types missing from result table
                miss_trends = list(set(trend_list_result_df)- set(user_trends))

                if len(miss_trends) > 0:
                    filter_trend_list = list(set(trend_list_result_df)- set(miss_trends))
                    miss_trends_flg = True
            else:
                new_user_trends = user_trends

            # check user trend list
            if len(new_user_trends) > 0:
                trend_list = [wg.all_trend_types[trend]() for trend in new_user_trends]

                # check trends computable
                trend_computability = [t.is_computable(labeled_df_setup) for t in trend_list]

                # no trends can compute
                if sum(trend_computability) == 0:
                    return 'no_computable_trend'

                # drop any specific trends that cannot compute
                if sum(trend_computability) < len(new_user_trends):
                    trend_list = [t for t,c in zip(new_user_trends, trend_computability) if c]

            if miss_trends_flg:
                return 'miss_old_trend_type'

            return redirect(url_for("visualize"))

        # initial for visualize.html page
        if action == 'page_load':
            # check if page is reload or not
            # if page is reload, skip trend computation
            if redirect_flag:
                # if redirect, set redirct_flag to False
                redirect_flag = False

                # if filter trends exist, do filtering
                if len(filter_trend_list) > 0:
                    labeled_df_setup.get_trend_rows(trend_type=filter_trend_list,inplace=True)

                # check trend list
                if len(trend_list) > 0:
                    labeled_df_setup.get_subgroup_trends_1lev(trend_list)

                    if labeled_df_setup.result_df.empty:
                        return 'no_result'

                    # add distances
                    labeled_df_setup.add_distance()

            # Generate distance heatmaps
            distance_heatmap_dict = models.getDistanceHeatmapDict(labeled_df_setup, labeled_df_setup.result_df)

            df = labeled_df_setup.df.to_dict(orient='records')
            df = json.dumps(df, indent=2)

            default_threshold = wg.trend_quality_sp

            return jsonify(distance_heatmap_dict = distance_heatmap_dict, 
                            result_df = labeled_df_setup.result_df.to_json(orient='records'),
                            df = df, default_threshold = default_threshold, project_name = project_name)

        # visualize.html rank trend's cells clicked
        if action == 'detail_ranktrend':
            independent = request.form['independent']
            dependent = request.form['dependent']
            group_feat = request.form['group_feat']

            rank_trend_detail, rank_trend_count = models.getRankTrendDetail(labeled_df_setup, 
                                                            dependent, independent, group_feat)

            # covert row label to string to avoid jsonify error, e.g., department: 1
            rank_trend_count = rank_trend_count.rename(columns=lambda x: str(x))

            return jsonify(rank_trend_detail = rank_trend_detail.reset_index().to_dict(orient='records'), 
                            rank_trend_count = rank_trend_count.reset_index().to_dict(orient='records'))

        # visualize.html 'Filter' button clicked
        if action == 'filter':
            filter_object = request.form['filter_object']
            filter_object = json.loads(filter_object, cls=Decoder)

            filter_result = labeled_df_setup.get_trend_rows(independent=filter_object['independent'],
                                dependent=filter_object['dependent'],
                                group_feat=filter_object['group_feat'],subgroup=filter_object['subgroup'],
                                trend_type =filter_object['trend_type'])
            
            # Generate distance heatmaps
            distance_heatmap_dict = models.getDistanceHeatmapDict(labeled_df_setup, filter_result)

            df = labeled_df_setup.df.to_dict(orient='records')
            df = json.dumps(df, indent=2)

            # set filter flag
            filter_flag = True

            return jsonify(distance_heatmap_dict = distance_heatmap_dict, 
                            result_df = filter_result.to_json(orient='records'),
                            df = df)


        # visualize.html 'Reset' button clicked
        if action == 'reset':
            # Generate distance heatmaps
            distance_heatmap_dict = models.getDistanceHeatmapDict(labeled_df_setup, labeled_df_setup.result_df)

            df = labeled_df_setup.df.to_dict(orient='records')
            df = json.dumps(df, indent=2)

            # set filter flag to False
            filter_flag = False

            # clean filter object
            filter_object.clear()

            return jsonify(distance_heatmap_dict = distance_heatmap_dict, 
                            result_df = labeled_df_setup.result_df.to_json(orient='records'),
                            df = df)

        # visualize.html 'Detect' button clicked
        if action == 'detect':
            distance_threshold = float(request.form['distance_threshold'])
            sg_strength_threshold = float(request.form['sg_strength_threshold'])
            agg_strength_threshold = float(request.form['agg_strength_threshold'])

            filter_object = request.form['filter_object']
            filter_object = json.loads(filter_object, cls=Decoder)
            trend_filter = filter_object['trend_type']

            if not trend_filter:
                # Default to detect all trend types from result_df
                trend_filter = list(pd.unique(labeled_df_setup.result_df['trend_type']))

            sp_filter = {'name':'SP', 'distance':distance_threshold, 'agg_trend_strength':agg_strength_threshold,
                'subgroup_trend_strength':sg_strength_threshold,'trend_type':trend_filter}

            # check if filter flag is True
            if filter_flag:
                # filtered, pass filter parameter
                detect_result = labeled_df_setup.get_SP_rows(sp_filter,
                                    independent=filter_object['independent'],
                                    dependent=filter_object['dependent'],
                                    group_feat=filter_object['group_feat'],subgroup=filter_object['subgroup'],
                                    trend_type =filter_object['trend_type'],
                                    replace=True)
            else:
                # not filter
                detect_result = labeled_df_setup.get_SP_rows(sp_filter,replace=True)            

            # Generate distance heatmaps
            distance_heatmap_dict = models.getDistanceHeatmapDict(labeled_df_setup, detect_result)

            df = labeled_df_setup.df.to_dict(orient='records')
            df = json.dumps(df, indent=2)

            return jsonify(distance_heatmap_dict = distance_heatmap_dict, 
                            result_df = detect_result.to_json(orient='records'),
                            df = df)

        # visualize.html 'Rank' button clicked
        if action == 'rank':

            agg_type = request.form['agg_type']
            score_col = request.form['score_col']

            view_score = agg_type + '_view_' + score_col

            # check if view score exists
            if not(view_score in labeled_df_setup.result_df.columns):
                # not exist, then add view score
                labeled_df_setup.add_view_score(score_col,agg_type=agg_type,colored=False)

            rank_result = labeled_df_setup.rank_occurences_by_view(view_score,score_col)

            # if filter_flag is True, filtering the rank result
            if filter_flag:

                rank_result = labeled_df_setup.get_trend_rows(
                                    independent=filter_object['independent'],
                                    dependent=filter_object['dependent'],
                                    group_feat=filter_object['group_feat'],subgroup=filter_object['subgroup'],
                                    trend_type =filter_object['trend_type'])

            # Generate distance heatmaps
            distance_heatmap_dict = models.getDistanceHeatmapDict(labeled_df_setup, rank_result)

            df = labeled_df_setup.df.to_dict(orient='records')
            df = json.dumps(df, indent=2)

            return jsonify(distance_heatmap_dict = distance_heatmap_dict, 
                            result_df = rank_result.to_json(orient='records'),
                            df = df)
