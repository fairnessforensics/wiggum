.. _feature_save:

Saving Wiggum Results
======================

Wiggum allows for saving the metadata and data alone or with the result table for future use.
To make the saved files compatible with other uses and future proof, they are saved as three separate .csv files within a folder.
Saving may be done from within the Wiggum-app or with the provided LabeledDataFrame method ``to_csvs``.
This will produce the following:

.. code-block:: bash

    project_name/
        df.csv
        meta.csv
        result_df.csv



As an example, saving in code might look like:

::

    # read data in as a data frame with custom calls
    partial_data = pd.read_csv('data/simpledata.csv',index_col='Unnamed: 0')

    # pass formatted data to LabeledDataFrame
    labeled_df_setup = wg.LabeledDataFrame(partial_data)
    labeled_df_setup.infer_var_types()

    # save formatted with meta data
    labeled_df_setup.to_csvs('data/simple_project')

    # load saved data back
    labeled_df = wg.LabeledDataFrame('data/simple_project')
