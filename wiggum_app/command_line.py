from wiggum_app import app

def main():
    # tell app to run on port 5000, then the app will run on http://127.0.0.1:5000//
    app.run(debug=True, port=5001)
