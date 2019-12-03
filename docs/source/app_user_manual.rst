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

The data preparation page of Wiggum app is the place to load the data, set metadata
and to augment the data.

Loading data
^^^^^^^^^^^^^

The first step to using Wiggum is to load a dataset. You may load data as a .csv file or from a
folder that was created by Wiggum that contains the data, metadata, and results
from a prior analysis.

#. Click “Choose File”: select a data file from your local disk.
#. Select upload
#. accept.



Setting Meta data
^^^^^^^^^^^^^^^^^^

Wiggum requires that you set meta data

Data Augmentation
^^^^^^^^^^^^^^^^^^

Choosing Trends
^^^^^^^^^^^^^^^^^


Saving
^^^^^^^

You can save the meta data and the data together by entering a project name and clicking save.
For more information on saving see the :ref:`feature_save` page.







Data Visualization
-------------------

Using heatmaps to explore details
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^


Filtering
^^^^^^^^^^^^


Ranking
^^^^^^^^^


#. Choosde columns
#. Press rank button

Detecting
^^^^^^^^^^^
