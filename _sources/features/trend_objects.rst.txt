Trend objects
==============


Trend objects are passed to `LabeledDataFrame.get_subgroup_trends_1lev` or another trend
computation method of `LabeledDataFrame`.  These functions store them in the
data structure in a property `trend_list`.

The design of the trend objects is to make mixing and matching of trends
components easy.

In `trends.py` we define complete trend objects that are available as
`wg.<trend_name>`. In the `trend_components` subpackage, we define the
component parts that are used to compose complete trend objects through
inheritence. We use Mixins in python to build complete trends. A complete,
usable trend object should be organized as follows.

There are three types of mixins and available Mixin classes are acessible in
`wg.trend_components.baseTrendMixin_list`,
`wg.trend_components.varTypeMixin_list`, and
`wg.trend_components.trendCommputeMixin_list`


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
          a grouped DataFrame as passed by LabeledDataFrame get trend functions
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
          labeled_df : LabeledDataFrame
              object to parse by variable types and roles, may be set to None as
              default or unused in custom overrides, but must be accepted for
              compatibility

          Returns
          --------
          Parameters that were set
          """







We present the underlying framework for detecting general trend changes such as Simpson's paradox for exploratory analysis by a practitioner data scientist.

We generalize from the above framework of looking at binary trends of statistics of the data to considering more detailed trends between pairs of variables and trend-specific distances. We can capture the original cases in this framework by introducing a new $\operatorname{trend}$ operator that is equivalent to the composition of the statistic of the data and the collapse to a binary value($\operatorname{trend}_b$) in the prior formulation.


.. math::

   S = \operatorname{dist}(\operatorname{trend}(X_1,X_2), \operatorname{trend}(X_1,X_2|X_3))

We consider two categories of trends: model-based and ranking. Ranking is the same as rankSP above and model-based is a generalization of the regression type classically studied.
For the model-based trends, we fit a model to the data ($x_1 = f(x_2; \theta) $) and the trend is characterized by the model parameters ($ \theta$).
We use some type model-fit to capture the strength of the trend and a distance based on the representation of the model.
% In linear trends we define the distance between the aggregate and partitions by the angle, normalized to [0,1].
For ranking trends, we compute a groupwise-statistic (partitioned by $x_2$) of the data ($x_1)$ and use it to order the groups.
The trend is characterized by the ordered list, strength is related to the separation of the groups and the distance to the similarity of lists.

We define modular trend objects that are passed to the batch trend computation methods of the LabeledDataFrame class that Wiggum provides for interacting with the data, metadata, and results.
The design of the trend objects is to make mixing and matching of trends components easy.
We provide a default set of complete trend objects and an interface to use the components to develop custom trends directly in addition to via overloading.
We use Python Mixins,  classes that define methods but no properties, to build complete trends.
This allows us to define subclasses that contain methods and mix and match them to create more flexible inheritance patterns.
A batch computation function computes the trend for all possible occurrences given the meta data provided by the user.

.. code-block:: python
  class TrendExample(trendComputeMixin,
                      varTypeMixin,
                      baseTrend):
                      name = 'my name'
                      required_class_vars_if_relevent = choice
                      \end{lstlisting}}


Wiggum has two basic kinds of trend Mixin classes that allow for separating the computation of the trend (trendComputeMixin) and the manipulation of the data into the various roles that the trend calculation requires (varTypeMixin).
% The two mixin types provide methods to compute the trend and its properties (trendComputeMixins)
% and how to determine the how to use variables in the trend computation from metadata.
This distinction provides several advantages.  First, it allows similar trends to use the same variables (for example linear regression and linear correlation) and share functions for determining columns from the metadata but different computations.
Second, it allows for a given trend computation may use different types of variables in ways that make it meaningfully different though the computation is shared, for example computing regression for continuous versus ordinal variables.
Third, the use of additional class properties enables further modification of the computation, for example ranking by mean or median or computing Pearson versus Spearman correlation.
We provide a single baseTrend that defines a constructor shared across all trend objects.


\begin{minipage}[c]{0.95\columnwidth}
\begin{lstlisting}[language=Python,
                   label={fig:exmapleTrend},
                   columns={fullflexible},
                   frame = single,
                   caption={Example of a trend class definition using the base class, \texttt{trend}; trendComputeMixin, \texttt{statRankTrend}; and varTypeMixin, \texttt{weightedRank}. The class property \texttt{my\_stat} allows further customization of the \texttt{statRankTrend}, for example we also have a median\_rank\_trend.}]
class mean_rank_trend(statRankTrend,
                      weightedRank,
                      trend):
    name = 'rank_trend' # required class property
    # trend specific class variable
    my_stat = lambda self,d,m,w : weighted_avg(d,m,w)

\end{lstlisting}
\end{minipage}




% TODO: make two column
\input{tab_trendComputeMixin.tex}


The trendComputeMixins pair the trend calculation and the distance calculations, we provide 5, described in Table~\ref{tab:trendcomputemixin}.
For the distance between linear trends, Wiggum uses a normalization of the angle between the lines fit the whole data set and the current partition.
The normalization step creates a distance in $[0,1]$ that is always positive valued.
This normalization makes the distance comparable to the 0/1 loss distance used in the binary detection setting.
We choose to make $d=1$ for a right angle  and $d=0$ for parallel lines, whether vertical or horizontal.


\begin{align}
   d = \normangle(t_a,t_s) = \frac{2}{\pi} \left(\left|\tan^{-1}(t_a) - \tan^{-1}(t_s)\right|\% \frac{\pi}{2}\right) \label{eq:normangle}
\end{align}
% \[\]

where $\%$ is the modulo operator and $t_a,t_s$ are slopes.
For multi-valued ranking trends, we rely on Kendall's $\tau$ based permutation distance for distance and strength.
The distance is the Kendall's Tau distance between the aggregate and subgroup trend lists.
The strength is the Kendall's tau similarity between the element-wise sorted list and the trend-sorted list.

\begin{align}
    \tau(a,b) &= \frac{P - Q}{\sqrt{(P + Q + T)(P+Q + U)}}
\end{align}

where $P$ is the number of concordant pairs, $Q$ is the number of discordant pairs, $T$ is the number of ties only in $a$  and U is the number of pairs only in $b$.
For example, in the case of two groups if $t_a = [M,F]$ and $t_s = [F,M]$, we get $P=0$, $Q=2$, $T=0$, $U=0$ and find $\tau = - 1$ and the distance is $1$, so it's the same as the 0/1 loss on the comparison.
In the case of three levels of $x_2$, however is the advantage, for $t_a = [B,H,W]$ and $t_s = [B,W,H]$, we get a distance of .333, matching lists are always 0 and complete reversal is always 1.
To extend this to compute trend strength, we sort the $x_2$ column of the dataset(or partition) by $x_1$ to create $\ell_a$ and repeat each element of $t_x$ in accordance with its representation in the data so that $\ell_b$ is the same length as $\ell_a$, then the strength is $|\tau(\ell_a,\ell_b)|$.
This is analogous to the use of the magnitude of Pearson correlation coefficient for strength of linear regression trends.

The `varTypeMixin`s define how to select variables for each required parameter of the trend calculation functions, that is which variables form the data set take on the roles of $x_1$, $x_2$, and $w$.
These functions use the meta data from the user that defines a variable type(binary, categorical, continuous, ordinal) and a role (trend or group-by). Variable usage under default settings for the two categories of trends(ranking and continuous) are defined in Table~\ref{tab:variableuse}.


\input{tab_variable_role.tex}




\subsection{Ranking and Detection}

In order to present the results, we need to order them, for sequential assessment by the analyst.
The trend computation step returns a result table as shown in Figure~\ref{fig:exp_resulttable} .
Wiggum ranks each occurrence, represented by a row in the table, based on both occurrence-specific scores and view aggregate scores.
In Wiggum-app, a user can rank by choosing the column to aggregate and the aggregation method(sum, mean, max, min) to compute a view score.
We consider both view aggregate scores and occurrence specific methods of ranking and produce combination statistics that allow for integrated ranking.
Using the Wiggum package in a scientific computing environment, weighted sums of view or occurrence or combinations of the two can also be added to the result table for ranking or filtering.




We compare ranking by count of subgroups for variable pairs; count of subgroup levels, and the severity of the trend change, though the detection is anything that is a reversal, we consider that it can be minor (small distance and/or weak trend).
% We also explore how weighting of these impacts the ordering.

% TODO: maybe not in this paper
% We compare the rankings with a correlation matrix; since the ranks are all integers, this is a suitable way to compare how the variables compare.
