Trend objects
==============


Trend objects are passed to `labeledDataFrame.get_subgroup_trends_1lev` or another trend
computation method of `labeledDataFrame`.  These functions store them in the
data structure in a property `trend_list`.

The design of the trend objects is to make mixing and matching of trends
components easy.

In `trends.py` we define complete trend objects that are available as
`dsp.<trend_name>`. In the `trend_components` subpackage, we define the
component parts that are used to compose complete trend objects through
inheritence. We use Mixins in python to build complete trends. A complete,
usable trend object should be organized as follows.

There are three types of mixins and available Mixin classes are acessible in
`dsp.trend_components.baseTrendMixin_list`,
`dsp.trend_components.varTypeMixin_list`, and
`dsp.trend_components.trendCommputeMixin_list`


.. code-block:: python
   :emphasize-lines: 1

   class trend_example(trendCommputeMixin,varTypeMixin, baseTrendMixin):
      name = 'my name' # used in the trend_type column of result_df and by viz
      # other class variables as required by the Mixins or to overload


This is how most of the code in `trends.py` is structured.  We include Mixins of
two basic types that allow for separating the computation of the trend and the
manipulation of the data into the various roles that the trend calculation
requires.  Currently there is only one `baseTrendMixin` class, that all must inherit:
`trend`

.. code-block:: python
   :emphasize-lines: 2

   class trend():
       def __init__(self,labeled_df = None):
          # set trend_precompute to empty as an insntance property
          # if labeled_df is passed, call get_trend_vars
          return self


This could be overloaded to have a new initialization or a trend object with
additional instance properties.

The two mixin types are for setting how to compute the trend and its properties
and how to choose the variables.  These are separated because similar trends may
use the same variables (for example linear regression and linear correlation)
and a given trend computation may use different types of variables in ways that
make it meaningfully different though the computation is shared.

Get Trends Mixins
------------------

The trendCommputeMixin are found in `trend_components/` and have the following
signature. These pair the trend calcuation and the distance calculations, each
get Trend Mixin is compatible with only certain `var_type_mixins` based on the
required properties.

.. code-block:: python
   :emphasize-lines: 2,26

   class trendCommputeMixin():
      def get_trends(self, data_df,trend_col_name):
          """
          Compute a trend, its quality and return a partial result_df

          Parameters
          ----------
          data_df : DataFrame or DataFrameGroupBy
              data to compute trends on, may be a whole, unmodified DataFrame or
          a grouped DataFrame as passed by labeledDataFrame get trend functions
          trend_col_name : {'subgroup_trend','agg_trend'}
              which type of trend is to be computed

          Required properties
          --------------------
          name : string
                  used in the trend_type column of result_df and by viz
          additional class or insntance properties that must be set in order to compmute this type
          of trend, these will be set by calling get_trend_vars

          Returns
          -------
          reg_df : DataFrame
              partial result_df, multiple can be merged together to form
              a complete result_df
          """

      def get_distance(self,row):
          """
          distance between the subgroup and aggregate trends for a row of a
          result_df that was computed by the same class's get_trends

          Parameters
          ----------
          row : pd.Series
              row of a result_df DataFrame

          Returns
          -------
          <>_dist : float
              distance between the subgroup_trend and agg_trend, compatible with
              assignment to a cell of a result_df
          """

Variable Type Mixins
---------------------

The `varTypeMixin`s define how to select variables for each required parameter
of the `get_trends` functions. These are defined in
`trend_components/base_getvars.py`


.. code-block:: python
   :emphasize-lines: 2

   class varTypeMixin():
      """
      mixin compatible with <> trends
      """
      class_property = value # set required parameters fro <> trends as
                             # class properties if appropriate
      def get_trend_vars(self,labeled_df):
          """
          set required parameters for <> trends

          Parameters
          -----------
          labeled_df : labeledDataFrame
              object to parse by variable types and roles, may be set to None as
              default or unused in custom overrides, but must be accepted for
              compatibility

          Returns
          --------
          Parameters that were set
          """
