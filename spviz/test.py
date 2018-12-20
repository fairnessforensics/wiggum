from spviz import app, render_template
from spviz import models
from flask import request, flash, redirect,jsonify
import pandas as pd
import json

@app.route("/test/")
def index():
    return render_template("index.html") 
    
@app.route("/test/", methods = ['POST'])
def test():
    if request.method == 'POST':
        print("**********************************here10")
        test1 = request.form['name']

        print(test1)

