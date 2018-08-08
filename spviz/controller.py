from spviz import app, render_template
from spviz import models


@app.route("/")
def index():
    return render_template("index.html") # this is the view
