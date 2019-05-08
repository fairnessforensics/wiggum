from spviz import app, render_template
from spviz import models
from flask import request, flash, redirect,jsonify, url_for
import pandas as pd
import json
import detect_simpsons_paradox as dsp

@app.route("/")
def index():
    return render_template("index.html") 

@app.route("/visualize", methods=['GET', 'POST'])
def visualize():
    print("====@????===========")
    return render_template("visualize.html")

@app.route("/", methods = ['POST'])
def main():
    if request.method == 'POST':

        action = request.form['action']

        if action == 'open':
            file = request.files.get('file')
            global df
            df = pd.read_csv(file)

            dtypes = []
            dtypes = dsp.simple_type_map(df)
            sample_list = []
            sample_list = dsp.get_data_sample(df)

            return jsonify({'dtypes': dtypes,
                            'samples': sample_list})

        if action == 'visualize':
            print("====@vvvv===========")
            roles = request.form['roleList']
            role_list =json.loads(roles)
            global labeled_df
            labeled_df = pd.DataFrame(role_list)
            print(labeled_df)
            return redirect(url_for("visualize"))

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
            print("====@upload===========")
            print(labeled_df)
            print("====@upload2===========")
            #file = request.files.get('file')

            #global df
            #df = pd.read_csv(file)

            # initial result
            global initial_result_df
            
            # Construct the csv data fitting d3.csv format
            csv_data = df.to_dict(orient='records')
            csv_data = json.dumps(csv_data, indent=2)

            isCountList = labeled_df.loc[labeled_df['isCount'] == 'Y']['name'].tolist()
            # The logic may change
            if len(isCountList) > 0:
                isCountAttr = isCountList[0]
                spType = 'Rate2'

            if spType =='Regression':

                continuousVars = models.getContinuousVariableName(df)
                regression_vars = list(continuousVars)

                clusteringFlg = request.form['clustering']
                print(type(clusteringFlg))

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
                print(statAll)
                print(ratioStatAll)
                ratioRateSub, rateSub = models.getRatioRateSub(df, targetAttr, groupingAttrs)
                print(ratioRateSub)
                print(rateSub)
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