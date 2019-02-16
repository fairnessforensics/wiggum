from spviz import app, render_template
from spviz import models
from flask import request, flash, redirect,jsonify
import pandas as pd
import json

@app.route("/")
def index():
    return render_template("index.html") 
    
@app.route("/", methods = ['POST'])
def main():
    if request.method == 'POST':
        action = request.form['action']
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

        # Upload File
        if action == 'upload':
            file = request.files.get('file')

            global df
            df = pd.read_csv(file)

            # initial result
            global initial_result_df
            
            # Construct the csv data fitting d3.csv format
            csv_data = df.to_dict(orient='records')
            csv_data = json.dumps(csv_data, indent=2)

            if spType =='Regression':
                continuousVars = models.getContinuousVariableName(df)
                regression_vars = list(continuousVars)

                categoricalVars = models.getCategoricalVariableName(df)

                # get correlation for all continuous variables
                corrAll = df[continuousVars].corr()

                # subgroup correlation matrix
                correlationMatrixSubgroups = []
                correlationMatrixSubgroups, groupby_info = models.getSubCorrelationMatrix(df, regression_vars, categoricalVars)

                # generate table
                initial_result_df, rankViewResult = models.getInfoTable(df, std_weights, std_weights_view, view_score_param)

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
                                'ratioRateAll':ratioRateAll,
                                'rateAll':[eachRateAll.to_json() for eachRateAll in rateAll],
                                'ratioSubs': [ratioSub.to_json() for ratioSub in ratioRateSub],
                                'rateSubs': [eachRateSub.to_json() for eachRateSub in rateSub]})
        # Auto Detect
        elif action == 'autodetect':      
            # threshold = float(request.form['threshold'])

            result, ranking_view_df = models.auto_detect(df, initial_result_df, std_weights, std_weights_view, view_score_param)

            return jsonify({'result': result.to_json(),
                            'table': result.to_json(orient='records'),
                            'rankViewResult': ranking_view_df.to_json(orient='records')})