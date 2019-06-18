Trend objects
==============


Trend objects are passed to `LabeledDataFrame.get_subgroup_Trends_1lev` or another Trend
computation method of `LabeledDataFrame`.  These functions store them in the
data structure in a property `Trend_list`.

The design of the Trend objects is to make mixing and matching of Trends
components easy.

In `Trends.py` we define complete Trend objects that are available as
`wg.<Trend_name>`. In the `trend_components` subpackage, we define the
component parts that are used to compose complete Trend objects through
inheritence. We use Mixins in python to build complete Trends. A complete,
usable Trend object should be organized as follows.

There are three types of mixins and available Mixin classes are acessible in
`wg.trend_components.baseTrendMixin_list`,
`wg.trend_components.varTypeMixin_list`, and
`wg.trend_components.TrendCommputeMixin_list`


.. code-block:: python
   :emphasize-lines: 1

   class Trend_example(TrendCommputeMixin,varTypeMixin, baseTrendMixin):
      name = 'my name' # used in the Trend_type column of result_df and by viz
      # other class variables as required by the Mixins or to overload


This is how most of the code in `Trends.py` is structured.  We include Mixins of
two basic types that allow for separating the computation of the Trend and the
manipulation of the data into the various roles that the Trend calculation
requires.  Currently there is only one `baseTrendMixin` class, that all must inherit:
`Trend`

.. code-block:: python
   :emphasize-lines: 2

   class Trend():
       def __init__(self,labeled_df = None):
          # set Trend_precompute to empty as an insntance property
          # if labeled_df is passed, call get_Trend_vars
          return self


This could be overloaded to have a new initialization or a Trend object with
additional instance properties.

The two mixin types are for setting how to compute the Trend and its properties
and how to choose the variables.  These are separated because similar Trends may
use the same variables (for example linear regression and linear correlation)
and a given Trend computation may use different types of variables in ways that
make it meaningfully different though the computation is shared.

Get Trends Mixins
------------------

The TrendCommputeMixin are found in `trend_components/` and have the following
signature. These pair the Trend calcuation and the distance calculations, each
get Trend Mixin is compatible with only certain `var_type_mixins` based on the
required properties.

.. code-block:: python
   :emphasize-lines: 2,26

   class TrendCommputeMixin():
      def get_Trends(self, data_df,Trend_col_name):
          """
          Compute a Trend, its quality and return a partial result_df

          Parameters
          ----------
          data_df : DataFrame or DataFrameGroupBy
              data to compute Trends on, may be a whole, unmodified DataFrame or
          a grouped DataFrame as passed by LabeledDataFrame get Trend functions
          Trend_col_name : {'subgroup_Trend','agg_Trend'}
              which type of Trend is to be computed

          Required properties
          --------------------
          name : string
                  used in the Trend_type column of result_df and by viz
          additional class or insntance properties that must be set in order to compmute this type
          of Trend, these will be set by calling get_Trend_vars

          Returns
          -------
          reg_df : DataFrame
              partial result_df, multiple can be merged together to form
              a complete result_df
          """

      def get_distance(self,row):
          """
          distance between the subgroup and aggregate Trends for a row of a
          result_df that was computed by the same class's get_Trends

          Parameters
          ----------
          row : pd.Series
              row of a result_df DataFrame

          Returns
          -------
          <>_dist : float
              distance between the subgroup_Trend and agg_Trend, compatible with
              assignment to a cell of a result_df
          """

Variable Type Mixins
---------------------

The `varTypeMixin`s define how to select variables for each required parameter
of the `get_Trends` functions. These are defined in
`trend_components/base_getvars.py`


.. code-block:: python
   :emphasize-lines: 2

   class varTypeMixin():
      """
      mixin compatible with <> Trends
      """
      class_property = value # set required parameters fro <> Trends as
                             # class properties if appropriate
      def get_Trend_vars(self,labeled_df):
          """
          set required parameters for <> Trends

          Parameters
          -----------
          labeled_df : LabeledDataFrame
              object to parse by variable types and roles, may be set to None as
              default or unused in custom overrides, but must be accepted for
              compatibility

          Returns
          --------
          Parameters that were set
          """
