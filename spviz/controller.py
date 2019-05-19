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

            folder = request.form['folder']

            folder = 'data/' + folder
            labeled_df_setup = dsp.labeledDataFrame(folder)

            # get variable names
            var_names = labeled_df_setup.meta_df.index.tolist()

            # get var_types for dropbox
            var_types = []
            var_types = labeled_df_setup.meta_df['var_type'].tolist()

            # get isCounts for dropbox
            isCounts = []
            isCounts = labeled_df_setup.meta_df['isCount'].replace({True: 'Y', False: 'N'}).tolist()

            # get isCounts for dropbox
            roles = []
            roles = labeled_df_setup.meta_df['role'].tolist()

            # get weighting_vars for dropbox
            weighting_vars = []
            weighting_vars = labeled_df_setup.meta_df['weighting_var'].fillna('N/A').tolist()            

            # get sample for data
            sample_list = []
            sample_list = labeled_df_setup.get_data_sample()

            return jsonify({'var_names': var_names,
                            'var_types': var_types,
                            'isCounts': isCounts,      
                            'roles': roles,                  
                            'weighting_vars': weighting_vars,                                              
                            'samples': sample_list,
                            'possible_roles': dsp.possible_roles})

        # index.html 'Open' button clicked for data file
        if action == 'open':
            file = request.files.get('file')
            #global df
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
                            'samples': sample_list,
                            'possible_roles': dsp.possible_roles})

        if action == 'save':
            meta = request.form['metaList']

            labeled_df_setup = models.updateMetaData(labeled_df_setup, meta)

            # clusteringFlg = request.form['clustering']

            # store meta data into csv
            project_name = request.form['projectName']
            directory = 'data/' + project_name
            labeled_df_setup.to_csvs(directory)          
            return 'Saved'

        # index.html 'Visualize' button clicked
        if action == 'visualize':

            meta = request.form['metaList']
            labeled_df_setup = models.updateMetaData(labeled_df_setup, meta)

            global clusteringFlg
            clusteringFlg = request.form['clustering']

            return redirect(url_for("visualize"))

        # initial for visualize.html page
        if action == 'page_load':
            if clusteringFlg == 'true':
                labeled_df_setup.add_all_dpgmm()

            corrobj = dsp.all_pearson()
            corrobj.get_trend_vars(labeled_df_setup)

            rankobj = dsp.mean_rank_trend()
            linreg_obj = dsp.linear_trend()
           
            #labeled_df_setup.get_subgroup_trends_1lev([rankobj])
            labeled_df_setup.get_subgroup_trends_1lev([corrobj,rankobj,linreg_obj])

            trend_type_list = pd.unique(labeled_df_setup.result_df['trend_type'])

            result_dict_dict = {}
                     
            # set the result table in result dict
            index = 0
            result_dict_dict[index] = labeled_df_setup.result_df.to_json(orient='records')

            # set the csv
            index = 1
            csv_data_out = labeled_df_setup.df.to_dict(orient='records')
            csv_data_out = json.dumps(csv_data_out, indent=2)
            result_dict_dict[index] = csv_data_out            
            index = index + 1
            for trend_type in trend_type_list:
                result_dict = {}

                if trend_type == 'pearson_corr':
                    # Constructing the data for visualization
                    # Regression
                    regression_vars = corrobj.regression_vars
                    categoricalVars = labeled_df_setup.get_vars_per_role('groupby')

                    # get correlation for all continuous variables
                    corrAll = labeled_df_setup.df[regression_vars].corr()

                    # subgroup correlation matrix
                    correlationMatrixSubgroups = []
                    correlationMatrixSubgroups, groupby_info = models.getSubCorrelationMatrix(labeled_df_setup.df, regression_vars, categoricalVars)

                    all_attrs = np.append(regression_vars, categoricalVars)

                    #csv_data_each = labeled_df_setup.df[all_attrs].to_dict(orient='records')
                    #csv_data_each = json.dumps(csv_data_each, indent=2)

                    result_dict = {'trend_type' : 'pearson_corr',
                                    #'csv_data':csv_data_each,
                                    'categoricalVars': categoricalVars, 
                                    'continousVars': regression_vars, 
                                    'corrAll': corrAll.to_json(),
                                    'groupby_info': groupby_info,
                                    'corrSubs': [corrSub.to_json() for corrSub in correlationMatrixSubgroups]}

                    result_dict_dict[index] = result_dict
                    index =  index + 1

                elif trend_type == 'rank_trend':
                    rank_trend_df = labeled_df_setup.result_df.loc[labeled_df_setup.result_df['trend_type'] == 'rank_trend']
                    targetAttr_list = pd.unique(rank_trend_df['feat1'])

                    for targetAttr in targetAttr_list:
                        current_df =  labeled_df_setup.result_df
                        current_df = current_df.loc[(current_df['feat1'] == targetAttr) & (current_df['trend_type'] == 'rank_trend')]

                        protectedAttrs = pd.unique(current_df['feat2'])
                        groupbyAttrs = pd.unique(current_df['group_feat'])
                        
                        if pd.notna(labeled_df_setup.meta_df['weighting_var'][targetAttr]):
                            weighting_var = labeled_df_setup.meta_df['weighting_var'][targetAttr]
                        else:
                            weighting_var = ''

                        ratioRateAll, protectedVars, rateAll = models.getRatioRateAll(labeled_df_setup.df, 
                                                                                targetAttr, protectedAttrs, weighting_var)

                        ratioRateSub, rateSub = models.getRatioRateSub(labeled_df_setup.df, targetAttr, protectedAttrs, groupbyAttrs, weighting_var)

                        protected_groupby_attrs = np.append(protectedAttrs, groupbyAttrs)
                        protected_groupby_attrs = pd.unique(protected_groupby_attrs)
                        all_attrs = np.append(protected_groupby_attrs, [targetAttr])

                        # adding weighting_var
                        if weighting_var != '':
                            all_attrs = np.append(all_attrs, [weighting_var])
                        
                        #csv_data_each = labeled_df_setup.df[all_attrs].to_dict(orient='records')
                        #csv_data_each = json.dumps(csv_data_each, indent=2)

                        result_dict = {'trend_type' : 'rank_trend',
                                    #'csv_data':csv_data_each,
                                    'protectedVars': protectedVars,
                                    'explanaryVars': groupbyAttrs.tolist(), 
                                    'targetAttr': targetAttr,
                                    'weighting_var': weighting_var,
                                    'ratioRateAll': ratioRateAll,
                                    'rateAll':[eachRateAll.to_json() for eachRateAll in rateAll],
                                    'ratioSubs': [ratioSub.to_json() for ratioSub in ratioRateSub],
                                    'rateSubs': [eachRateSub.to_json() for eachRateSub in rateSub]}

                        result_dict_dict[index] = result_dict
                        index =  index + 1

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