Wiggum App
============

Once wiggum is installed via pip, the Flask app is a command line tool. To
launch the Flask app from the command line, type :

.. bash
  wiggum-app


This will start the server on http://127.0.0.1:5000/ from the current working directory.
Currently, launching from any location can create issues with loading files, so
the app should be launched from the code directory.


Developing Wiggum-app
-----------------------

A directory layout:

.. bash
    ├── wiggum_app
        ├── static
        │   ├── css             # style
        │   ├── data            # csv data files
        │   └── js              # javascript files
        ├── templates
        │   └── index.html
        ├── __init__.py
        ├── controller.py
        ├── models.py
        ├── config.py
        ├── README.md
        └── ...
