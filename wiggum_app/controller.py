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
            result_dict['Trend_types'] = list(wg.all_Trend_types.keys())

            Trend_type_list = pd.unique(labeled_df_setup.result_df['Trend_type'])
            result_dict['Trend_type_list'] = list(Trend_type_list)

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
                            'Trend_types': list(wg.all_Trend_types.keys())})

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

        # visualize.html 'Save' button clicked
        if action == 'save_Trends':
            # store meta data into csv
            project_name = request.form['projectName']
            directory = 'data/' + project_name
            labeled_df_setup.to_csvs(directory)
            return 'Saved'

        # index.html 'Visualize' button clicked
        if action == 'visualize':

            meta = request.form['metaList']
            labeled_df_setup = models.updateMetaData(labeled_df_setup, meta)

            global user_Trends
            user_Trends = request.form['Trend_types']
            user_Trends = user_Trends.split(",")

            return redirect(url_for("visualize"))

        # initial for visualize.html page
        if action == 'page_load':
            if labeled_df_setup.result_df.empty:
                Trend_list = [wg.all_Trend_types[Trend]() for Trend in user_Trends]

                labeled_df_setup.get_subgroup_Trends_1lev(Trend_list)

                # add distances
                labeled_df_setup.add_distance()

            result_dict_dict = {}
            result_dict_dict = models.getResultDict(labeled_df_setup, labeled_df_setup.result_df)

            return jsonify(result_dict_dict)

        # visualize.html 'Filter' button clicked
        if action == 'filter':
            filter_object = request.form['filter_object']
            filter_object = json.loads(filter_object, cls=Decoder)

            filter_result = labeled_df_setup.get_Trend_rows(feat1=filter_object['feat1'],feat2=filter_object['feat2'],
                                group_feat=filter_object['group_feat'],subgroup=filter_object['subgroup'],
                                Trend_type =filter_object['Trend_type'])

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
            Trend_filter = filter_object['Trend_type']

            if not Trend_filter:
                # Default to detect all Trend types from result_df
                Trend_filter = list(pd.unique(labeled_df_setup.result_df['Trend_type']))

            sp_filter = {'name':'SP', 'distance':threshold, 'agg_Trend_strength':agg_strength_threshold,
                'subgroup_Trend_strength':sg_strength_threshold,'Trend_type':Trend_filter}

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
                targetAttrList = labeled_df.loc[labeled_df['role'] == 'Trend']['name'].tolist()
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
