from wiggum_app import app
import logging
from logging.handlers import RotatingFileHandler

if __name__ == "__main__":

   # initialize the log handler
    logHandler = RotatingFileHandler('info.log', maxBytes=100000, backupCount=1)

    # set the log handler level
    logHandler.setLevel(logging.INFO)

    # set the app logger level
    app.logger.setLevel(logging.INFO)

    #logger_formatter = logging.Formatter('%(name)s - %(levelname)s - %(message)s')
    logger_formatter = logging.Formatter('%(asctime)s - %(remote_addr)s - %(levelname)s in %(module)s - %(funcName)s: %(message)s')
 
    # Add the Formatter to the Handler
    logHandler.setFormatter(logger_formatter)

    app.logger.addHandler(logHandler) 

    # tell app to run on port 5000, then the app will run on http://127.0.0.1:5000//
    app.run(debug=True, threaded=True, port=5000)
