from spviz import app, render_template
from spviz import models
from flask import request, flash, redirect,jsonify, url_for
import pandas as pd
import json
import detect_simpsons_paradox as dsp
import numpy as np

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
            print("open folder")
            folder = request.form['folder']
            print(folder)
            labeled_df_setup = dsp.labeledDataFrame(folder)
            print(labeled_df_setup.meta_df)
            return "ttt"

        # index.html 'Open' button clicked for data file
        if action == 'open':
            file = request.files.get('file')
            global df
            df = pd.read_csv(file)

            # Construct the csv data fitting d3.csv format
            global csv_data
            csv_data = df.to_dict(orient='records')
            csv_data = json.dumps(csv_data, indent=2)

            labeled_df_setup = dsp.labeledDataFrame(df)

            labeled_df_setup.infer_var_types()

            # get var_types for dropbox
            var_types = []
            var_types = labeled_df_setup.meta_df['var_type'].tolist()

            # get sample for data
            sample_list = []
            sample_list = labeled_df_setup.get_data_sample()

            return jsonify({'var_types': var_types,
                            'samples': sample_list})

        # index.html 'Go Visualization' button clicked
        if action == 'visualize':
            meta = request.form['metaList']
            meta_list =json.loads(meta)

            meta_df_user = pd.DataFrame(meta_list)

            # set var_type from user input
            var_types = meta_df_user['var_type'].tolist()
            # Fix ME if there is a function from labeled_dataframe.py
            labeled_df_setup.meta_df['var_type'] = var_types

            # set isCount from user input
            roles = meta_df_user['role'].tolist()
            labeled_df_setup.set_roles(roles)

            # set roles from user input
            meta_df_user['isCount'] = meta_df_user['isCount'].replace({'Y': True, 'N': False})
            counts = meta_df_user['isCount'].tolist()
            labeled_df_setup.set_counts(counts)

            clusteringFlg = request.form['clustering']

            #if clusteringFlg == 'true':
                # FIX ME
                # df = labeled_df_setup.df
                # df = models.getClustering(df, regression_vars)
                # csv_data = df.to_dict(orient='records')
                # csv_data = json.dumps(csv_data, indent=2)

            return redirect(url_for("visualize"))

        # initial for visualize.html page
        if action == 'page_load':
            corrobj = dsp.all_pearson()
            print(labeled_df_setup.meta_df)
            corrobj.get_trend_vars(labeled_df_setup)

            rankobj = dsp.mean_rank_trend()
            linreg_obj = dsp.linear_trend()

            #labeled_df_setup.get_subgroup_trends_1lev([rankobj])
            #labeled_df_setup.get_subgroup_trends_1lev([corrobj])
            
            labeled_df_setup.get_subgroup_trends_1lev([corrobj,rankobj,linreg_obj])
            print("------------start-----------")
            print(labeled_df_setup.result_df)
            print("------------end-----------")     

            trend_type_list = pd.unique(labeled_df_setup.result_df['trend_type'])

            result_dict_dict = {}
                     
            # set the result table in result dict
            index = 0
            result_dict_dict[index] = labeled_df_setup.result_df.to_json(orient='records')
            index = index + 1
            for trend_type in trend_type_list:
                result_dict = {}

                if trend_type == 'pearson_corr':
                    # Constructing the data for visualization
                    # Regression
                    regression_vars = corrobj.regression_vars.tolist()
                    categoricalVars = labeled_df_setup.get_vars_per_role('groupby').tolist()

                    # get correlation for all continuous variables
                    corrAll = df[regression_vars].corr()

                    # subgroup correlation matrix
                    correlationMatrixSubgroups = []
                    correlationMatrixSubgroups, groupby_info = models.getSubCorrelationMatrix(df, regression_vars, categoricalVars)

                    all_attrs = np.append(regression_vars, categoricalVars)

                    csv_data_each = df[all_attrs].to_dict(orient='records')
                    csv_data_each = json.dumps(csv_data_each, indent=2)

                    result_dict = {'trend_type' : 'pearson_corr',
                                    'csv_data':csv_data_each,
                                    'categoricalVars': categoricalVars, 
                                    'continousVars': regression_vars, 
                                    'corrAll': corrAll.to_json(),
                                    'groupby_info': groupby_info,
                                    'corrSubs': [corrSub.to_json() for corrSub in correlationMatrixSubgroups]}

                    result_dict_dict[index] = result_dict
                    index =  index + 1

                    #return jsonify({'trend_type' : 'pearson_corr',
                    #                'csv_data':csv_data,
                    #                'table': labeled_df_setup.result_df.to_json(orient='records'),
                    #                'categoricalVars': categoricalVars, 
                    #                'continousVars': regression_vars, 
                    #                'corrAll': corrAll.to_json(),
                    #                'groupby_info': groupby_info,
                    #                'corrSubs': [corrSub.to_json() for corrSub in correlationMatrixSubgroups]})
                elif trend_type == 'rank_trend':
                    targetAttr_list = pd.unique(labeled_df_setup.result_df['feat1'])
                    
                    for targetAttr in targetAttr_list:
                        current_df =  labeled_df_setup.result_df
                        current_df = current_df.loc[(current_df['feat1'] == targetAttr) & (current_df['trend_type'] == 'rank_trend')]

                        protectedAttrs = pd.unique(current_df['feat2'])
                        groupbyAttrs = pd.unique(current_df['group_feat'])
                        
                        ratioRateAll, protectedVars, explanaryVars, rateAll = models.getRatioRateAll(df, targetAttr, protectedAttrs, groupbyAttrs)

                        ratioRateSub, rateSub = models.getRatioRateSub(df, targetAttr, protectedAttrs, groupbyAttrs)

                        protected_groupby_attrs = np.append(protectedAttrs, groupbyAttrs)
                        protected_groupby_attrs = pd.unique(protected_groupby_attrs)
                        all_attrs = np.append(protected_groupby_attrs, [targetAttr])

                        csv_data_each = df[all_attrs].to_dict(orient='records')
                        csv_data_each = json.dumps(csv_data_each, indent=2)

                        result_dict = {'trend_type' : 'rank_trend',
                                    'csv_data':csv_data_each,
                                    'protectedVars': protectedVars,
                                    'explanaryVars': explanaryVars, 
                                    'targetAttr': targetAttr,
                                    'ratioRateAll':ratioRateAll,
                                    'rateAll':[eachRateAll.to_json() for eachRateAll in rateAll],
                                    'ratioSubs': [ratioSub.to_json() for ratioSub in ratioRateSub],
                                    'rateSubs': [eachRateSub.to_json() for eachRateSub in rateSub]}
                        result_dict_dict[index] = result_dict
                        index =  index + 1
                        #return jsonify({'trend_type' : 'rank_trend',
                        #            'csv_data':csv_data,
                        #            'table': labeled_df_setup.result_df.to_json(orient='records'),
                        #            'protectedVars': protectedVars,
                        #            'explanaryVars': explanaryVars, 
                        #            'targetAttr': targetAttr,
                        #            'ratioRateAll':ratioRateAll,
                        #            'rateAll':[eachRateAll.to_json() for eachRateAll in rateAll],
                        #            'ratioSubs': [ratioSub.to_json() for ratioSub in ratioRateSub],
                        #            'rateSubs': [eachRateSub.to_json() for eachRateSub in rateSub]})

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

                if clusteringFlg == 'true':
                    df = models.getClustering(df, regression_vars)
                    csv_data = df.to_dict(orient='records')
                    csv_data = json.dumps(csv_data, indent=2)

                categoricalVars = models.getCategoricalVariableName(df)

                # get correlation for all continuous variables
                corrAll = df[continuousVars].corr()

                # subgroup correlation matrix
                correlationMatrixSubgroups = []
                correlationMatrixSubgroups, groupby_info = models.getSubCorrelationMatrix(df, regression_vars, categoricalVars)

                # generate table
                initial_result_df, rankViewResult = models.getInfoTable(df, std_weights, std_weights_view, view_score_param,
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
                targetAttr = models.getBinaryVariableName(df)[0]
                
                groupingAttrs =  models.getCategoricalVariableName(df)
                groupingAttrs.remove(targetAttr)
                
                ratioRateAll, protectedVars, explanaryVars, rateAll = models.getRatioRateAll(df, targetAttr, groupingAttrs)

                ratioRateSub, rateSub = models.getRatioRateSub(df, targetAttr, groupingAttrs)

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

                ratioStatAll, protectedVars, explanaryVars, statAll = models.getRatioStatAll(df, targetAttr, groupingAttrs, isCountAttr)

                ratioRateSub, rateSub = models.getRatioRateSub(df, targetAttr, groupingAttrs)

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

            initial_result_df, ranking_view_df = models.auto_detect(df, initial_result_df, std_weights, std_weights_view, view_score_param, threshold,
                                                        individual_weight_name, view_weight_name)

            return jsonify({'result': initial_result_df.to_json(),
                            'table': initial_result_df.to_json(orient='records'),
                            'rankViewResult': ranking_view_df.to_json(orient='records')})