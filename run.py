
from wiggum_app import app

if __name__ == "__main__":
    # tell app to run on port 5001, then the app will run on http://127.0.0.1:5001//
    app.run(debug=True, host='0.0.0.0', port=5001)
