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

        if action == 'folder_open':

            folder = request.form['folder']

            folder = 'data/' + folder
            labeled_df_setup = wg.LabeledDataFrame(folder)

            result_dict = {}
            result_dict = models.getMetaDict(labeled_df_setup)

            result_dict['possible_roles'] = wg.possible_roles
            result_dict['trend_types'] = list(wg.all_trend_types.keys())

            trend_type_list = pd.unique(labeled_df_setup.result_df['trend_type'])
            result_dict['trend_type_list'] = list(trend_type_list)

            return jsonify(result_dict)

        # index.html 'Open' button clicked for data file
        if action == 'open':
            file = request.files.get('file')
            #global df
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

            return jsonify({'var_types': var_types,
                            'samples': sample_list,
                            'possible_roles': wg.possible_roles, 
                            'trend_types': list(wg.all_trend_types.keys())})

        if action == 'save':
            meta = request.form['metaList']

            labeled_df_setup = models.updateMetaData(labeled_df_setup, meta)

            # store meta data into csv
            project_name = request.form['projectName']
            directory = 'data/' + project_name
            labeled_df_setup.to_csvs(directory)
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
            labeled_df_setup.to_csvs(directory)          
            return 'Saved'      

        # index.html 'Visualize' button clicked
        if action == 'visualize':

            meta = request.form['metaList']
            labeled_df_setup = models.updateMetaData(labeled_df_setup, meta)

            global trend_list
            user_trends = request.form['trend_types']
            user_trends = user_trends.split(",")

            trend_list = [wg.all_trend_types[trend]() for trend in user_trends]

            # check trends computable
            trend_computability = [t.is_computable(labeled_df_setup) for t in trend_list]

            # no trends can compute
            if sum(trend_computability) == 0:
                return 'no_computable_trend'

            # drop any specific trends that cannot compute
            if sum(trend_computability) < len(user_trends):
                trend_list = [t for t,c in zip(user_trends, trend_computability) if c]

            return redirect(url_for("visualize"))

        # initial for visualize.html page
        if action == 'page_load':
            if labeled_df_setup.result_df.empty:

                labeled_df_setup.get_subgroup_trends_1lev(trend_list)

                if labeled_df_setup.result_df.empty:
                    return 'no_result'

                # add distances
                labeled_df_setup.add_distance()

            result_dict_dict = {}
            result_dict_dict = models.getResultDict(labeled_df_setup, labeled_df_setup.result_df)
            
            distance_heatmap_dict = {}
            distance_heatmap_dict = models.getDistanceHeatmapDict(labeled_df_setup)

            #return jsonify(result_dict_dict)
            return jsonify(distance_heatmap_dict = distance_heatmap_dict, 
                            result_df = labeled_df_setup.result_df.to_json(orient='records'))

        # visualize.html 'Filter' button clicked
        if action == 'filter':
            filter_object = request.form['filter_object']
            filter_object = json.loads(filter_object, cls=Decoder)

            filter_result = labeled_df_setup.get_trend_rows(feat1=filter_object['feat1'],feat2=filter_object['feat2'],
                                group_feat=filter_object['group_feat'],subgroup=filter_object['subgroup'],
                                trend_type =filter_object['trend_type'])

            result_dict_dict = {}
            result_dict_dict = models.getResultDict(labeled_df_setup, filter_result, filter_object['subgroup'])

            return jsonify(result_dict_dict)

        # visualize.html 'Reset' button clicked
        if action == 'reset':
            result_dict_dict = {}
            result_dict_dict = models.getResultDict(labeled_df_setup, labeled_df_setup.result_df)

            return jsonify(result_dict_dict)

        # visualize.html 'Detect' button clicked
        if action == 'detect':
            threshold = float(request.form['threshold'])
            sg_strength_threshold = float(request.form['sg_strength_threshold'])
            agg_strength_threshold = float(request.form['agg_strength_threshold'])

            filter_object = request.form['filter_object']
            filter_object = json.loads(filter_object, cls=Decoder)
            trend_filter = filter_object['trend_type']

            if not trend_filter:
                # Default to detect all trend types from result_df
                trend_filter = list(pd.unique(labeled_df_setup.result_df['trend_type']))

            sp_filter = {'name':'SP', 'distance':threshold, 'agg_trend_strength':agg_strength_threshold,
                'subgroup_trend_strength':sg_strength_threshold,'trend_type':trend_filter}

            detect_result = labeled_df_setup.get_SP_rows(sp_filter,replace=True)

            result_dict_dict = {}
            result_dict_dict = models.getResultDict(labeled_df_setup, detect_result)

            return jsonify(result_dict_dict)

        # visualize.html 'Detect' button clicked
        if action == 'rank':

            agg_type = request.form['agg_type']
            view_score = request.form['view_score']

            if view_score == 'distance':
                rank_result = labeled_df_setup.rank_occurences_by_view(ascending=False)
            else:
                labeled_df_setup.add_view_score(view_score,agg_type=agg_type,colored=False)

                rank_param = agg_type + '_view_' + view_score
                rank_result = labeled_df_setup.rank_occurences_by_view(rank_param,view_score)

            result_dict_dict = {}
            result_dict_dict = models.getResultDict(labeled_df_setup, rank_result)

            return jsonify(result_dict_dict)

        spType = request.form['sptype']

        # weight for individual
        weight_param = request.form['weight_param']
        std_weights =json.loads(weight_param)

        # weight for the view
        weight_param_view = request.form['weight_param_view']
        std_weights_view =json.loads(weight_param_view)

        #view score parameter
        view_score_param = request.form['view_score_param']
        view_score_param =json.loads(view_score_param)

        # weighting name
        individual_weight_name = request.form['individual_weight_name']
        view_weight_name = request.form['view_weight_name']

        # Upload File
        if action == 'upload':
            # initial result
            global initial_result_df

            # Construct the csv data fitting d3.csv format
            #csv_data = df.to_dict(orient='records')
            #csv_data = json.dumps(csv_data, indent=2)

            #isCountList = labeled_df.loc[labeled_df['isCount'] == 'Y']['name'].tolist()
            # The logic may change
            #if len(isCountList) > 0:
            #    isCountAttr = isCountList[0]
            #    spType = 'Rate2'

            if spType =='Regression':

                continuousVars = models.getContinuousVariableName(df)
                regression_vars = list(continuousVars)

                clusteringFlg = request.form['clustering']

                # FIXME
                #if clusteringFlg == 'true':
                #    df = models.getClustering(df, regression_vars)
                #    csv_data = df.to_dict(orient='records')
                #    csv_data = json.dumps(csv_data, indent=2)

                categoricalVars = models.getCategoricalVariableName(df)

                # get correlation for all continuous variables
                corrAll = labeled_df_setup.df[continuousVars].corr()

                # subgroup correlation matrix
                correlationMatrixSubgroups = []
                correlationMatrixSubgroups, groupby_info = models.getSubCorrelationMatrix(labeled_df_setup.df, regression_vars, categoricalVars)

                # generate table
                initial_result_df, rankViewResult = models.getInfoTable(labeled_df_setup.df, std_weights, std_weights_view, view_score_param,
                                                    individual_weight_name, view_weight_name)

                return jsonify({'csv_data':csv_data,
                                'table': initial_result_df.to_json(orient='records'),
                                'rankViewResult': rankViewResult.to_json(orient='records'),
                                'categoricalVars': categoricalVars,
                                'continousVars': continuousVars,
                                'corrAll': corrAll.to_json(),
                                'groupby_info': groupby_info,
                                'corrSubs': [corrSub.to_json() for corrSub in correlationMatrixSubgroups]})
            elif spType == 'Rate':
                targetAttr = models.getBinaryVariableName(labeled_df_setup.df)[0]

                groupingAttrs =  models.getCategoricalVariableName(labeled_df_setup.df)
                groupingAttrs.remove(targetAttr)

                ratioRateAll, protectedVars, explanaryVars, rateAll = models.getRatioRateAll(labeled_df_setup.df, targetAttr, groupingAttrs)

                ratioRateSub, rateSub = models.getRatioRateSub(labeled_df_setup.df, targetAttr, groupingAttrs)

                return jsonify({'csv_data':csv_data,
                                'protectedVars': protectedVars,
                                'explanaryVars': explanaryVars,
                                'targetAttr': targetAttr,
                                'ratioRateAll':ratioRateAll,
                                'rateAll':[eachRateAll.to_json() for eachRateAll in rateAll],
                                'ratioSubs': [ratioSub.to_json() for ratioSub in ratioRateSub],
                                'rateSubs': [eachRateSub.to_json() for eachRateSub in rateSub]})
            elif spType == 'Rate2':
                targetAttrList = labeled_df.loc[labeled_df['role'] == 'trend']['name'].tolist()
                targetAttr = targetAttrList[0]

                groupingAttrs =  labeled_df.loc[labeled_df['role'] == 'groupby']['name'].tolist()

                ratioStatAll, protectedVars, explanaryVars, statAll = models.getRatioStatAll(labeled_df_setup.df, targetAttr, groupingAttrs, isCountAttr)

                ratioRateSub, rateSub = models.getRatioRateSub(labeled_df_setup.df, targetAttr, groupingAttrs)

                return jsonify({'csv_data':csv_data,
                                'protectedVars': protectedVars,
                                'explanaryVars': explanaryVars,
                                'targetAttr': targetAttr,
                                'ratioRateAll':ratioStatAll,
                                'rateAll':[eachRateAll.to_json() for eachRateAll in statAll],
                                'ratioSubs': [ratioSub.to_json() for ratioSub in ratioRateSub],
                                'rateSubs': [eachRateSub.to_json() for eachRateSub in rateSub]})

        # Auto Detect
        elif action == 'autodetect':
            threshold = float(request.form['threshold'])

            initial_result_df, ranking_view_df = models.auto_detect(labeled_df_setup.df, initial_result_df, std_weights, std_weights_view, view_score_param, threshold,
                                                        individual_weight_name, view_weight_name)

            return jsonify({'result': initial_result_df.to_json(),
                            'table': initial_result_df.to_json(orient='records'),
                            'rankViewResult': ranking_view_df.to_json(orient='records')})
