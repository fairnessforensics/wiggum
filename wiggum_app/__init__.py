from flask import Flask, render_template

app = Flask(__name__)
app.config.from_pyfile("config.py")


from wiggum_app import controller
