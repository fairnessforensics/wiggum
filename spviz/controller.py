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

        # Upload File
        if action == 'upload':
            file = request.files.get('file')
            #flash(file.content_type)

            global df
            df = pd.read_csv(file)
            #import pdb; pdb.set_trace()
            
            # Construct the csv data fitting d3.csv format
            csv_data = df.to_dict(orient='records')
            csv_data = json.dumps(csv_data, indent=2)
            #data = {'chart_data': chart_data}

            if spType =='Regression':
                continuousVars = models.getContinuousVariableName(df)
                regression_vars = list(continuousVars)

                categoricalVars = models.getCategoricalVariableName(df)

                corrAll = df.corr()
                print(corrAll)

                # subgroup correlation matrix
                correlationMatrixSubgroups = []
                correlationMatrixSubgroups, groupby_info = models.getSubCorrelationMatrix(df, regression_vars, categoricalVars)
                #jsonStr = json.dumps(correlationMatrixSubgroup)
                print(groupby_info)

                # generate table
                tableResult = models.getInfoTable(df)

                #return jsonify({'categoricalVars': categoricalVars, 'continousVars': continuousVars, 
                #                'corrAll': corrAll.to_json(), 'corrSub': json.dumps(correlationMatrixSubgroup)})
                return jsonify({'csv_data':csv_data,
                                'table': tableResult.to_json(orient='records'),
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

            result = models.auto_detect(df)

            return jsonify({'result': result.to_json(),
                            'table': result.to_json(orient='records')})



