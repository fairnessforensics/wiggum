.. _app_user_manual:



User Manual for Wiggum App
==========================================

Once wiggum is installed via pip, the Flask app is a command line tool. To
launch the Flask app from the command line, type :

.. bash
  wiggum-app


This will start the server on http://127.0.0.1:5000/ from the current working directory.
Currently, launching from any location can create issues with loading files, so
the app should be launched from the code directory.


Data Preparation
------------------

The data preparation page of Wiggum app is the place to load the data, set metadata,
and to augment the data.

Loading data
^^^^^^^^^^^^^

The first step to using Wiggum is to load a dataset. You may load data as a .csv file or load from a
folder that was created by Wiggum that contains the data, metadata, and results
from a prior analysis.

Data was saved before

Uploading a .csv
*****************

#. Click “Choose File” in the upper left corner of the page, then select a data file from your local disk.
#. Select "Upload". The data will now appear in a metadata table below.

Load from a prior analysis
***************************

#. Click "Choose Files" in the upper left corner of page, then select a folder created by Wiggum from a prior analysis.
#. Select "Upload". The data will appear in a metadata table below with your previous metadata selections.

Setting Metadata
^^^^^^^^^^^^^^^^^

Wiggum requires that you set labels for each column or variable in your data. This will be done once data has been loaded. The user must set the variable type, the variable role, and if applicable, whether to use the variable as a weighting variable.

Setting Variable Type
**********************
There are four different possible variable types. Wiggum will provide its initial suggestion for variable types based on certain characteristics, but the user is free to change them. 

#. Binary
	- Binary variables for Wiggum are for values that are only true/false, so use them for boolean variables. For other variables that may only have two values, but are not true/false, label them as categorical.
#. Ordinal
	- Ordinal variables are those that require an order, like years.
#. Categorical
	- Categorical variables are those that have qualitative values based on some characteristic, such as eye color, gender, or type.
#. Continuous
	- Continuous variables are values that are doubles, floats, or integers. These are usually numeric values.

Setting Variable Roles
***********************
There are five different possible roles for a variable.

#. Splitby
	- Splitby variables are generally categories that you want to split by and analyze, such as categorical or ordinal variables.
	- Common examples are gender, race, or age group. 
#. Independent
	- Independent variables are those that do not depend on another variable, or one that you wish to visualize on the y-axis.
#. Dependent
	- Dependent variables are the variables that you wish to measure based on the independent variables.
	- Common examples are time or other continuous variables.
#. Prediction
#. Groundtruth
#. Ignore
	- Ignore variables are those that the user does not want to consider for calculations or visualization. These can be variables that are irrelevant in consideration of the mix effect, or variables that the user wants to use as a weighting variable.

Other Metadata Settings
************************
#. isCount
	- isCount can be used for ignore variables. It is most useful whenever you have a population variable, or a 'count' variable, that you want
	to use as a weight for certain categories or trend variables. In order to use a variable as isCount, mark the variable role as 'ignore' then select 'Y' for isCount.
#. weighting_var
	- In order to utilize an ignore, isCount variable properly, it must be set as the weighting_var, or weighting variable, for at least one other variable in the metadata table.
	The weighting_var can be set to any variable in the table, but is best utilized if it is an ignore, isCount variable.
#. Example

Data Augmentation
^^^^^^^^^^^^^^^^^^

Data augmentation is useful for you if you want to combine certain categorical variables to analyze. In the metadata entry screen, there is a checkbox for quantiles and intersection for each variable.
Intersection is used for categorical variables. 

Checking the intersection checkbox for more than one categorical variable creates a new column in your data representing the intersection of the two variables.
For example, if you wanted to discover trends related to a categorical combination like 'White Female', check the intersection box for the variables race and gender.


Check the quantile box for continuous variables that you want to discretize.

Choosing Trends
^^^^^^^^^^^^^^^^^
There are multiple trends that you can choose from to analyze your data. 

Pearson Correlation
********************
Pearson Correlation is measure of linear correlation between two variables. It includes a numerical co-efficient ranging form -1.0 to +1.0. The co-efficient is used to determine how positively or negatively the association between the two variables are.
Rank Trend
***********

Linear Regression
******************


Saving
^^^^^^^
You can save the meta data and the data together by entering a project name and clicking save.
For more information on saving see the :ref:`feature_save` page.



Data Visualization
-------------------

Using heatmaps to explore details
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
You can click on specific squares in the heatmaps to visualize trends. A detail view will appear in the window that highlights the trend of the square you clicked.
Use these detailed views to explore your data. 

Filtering
^^^^^^^^^^^^


Ranking
^^^^^^^^^


#. Choose columns
#. Press rank button

Detecting
^^^^^^^^^^^
