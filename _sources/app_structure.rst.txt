App Outline
-------------
We use Model-View-Controller (MVC) system architecture with a python-based,
Flask-powered backend and JavaScript D3 graphics frontend.

View
##########

.. make this more about what the view code does, than what the user does.
.. also include cross referencing.

In the view, the user uploads data file and our application sends data to
backend server through the Ajax.data.
User can uploads csv files from any local directory to our application.
D3 graphs on the front end are generated in different js files.
The JSON result from the controller is parsed to the js variable and the
result will be shown in the D3 graphs.

Controller
###########

.. ensure this is up to date and complete, also cross referencing

The controller reads the user uploading file as a dataframe and passes the
data to the model.
After the model returns the result, controller pass the result data to the view
through the JSON format.


Model
###########

.. ensure this is up to date and complete, also cross referencing

Model stores the algorithms for all operations performed on the data.
The algorithms in model return a data frame of the result to the controller.

- Detecting SP
- Ranking SP

.. update this?
.. image:: appstructure.png
