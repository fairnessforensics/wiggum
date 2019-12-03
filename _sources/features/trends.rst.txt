.. _trends:

Built in Trends
=================


Wiggum comes with a number of built in trends.


+----------------+--------------------------------------------------------+--------------------------------------+-----------------------------------------------------------+----------------------------------------------------------+
| Trend          | Trend Expression                                       | Trend format ($t_x$)                 | Strength                                                  |                  Distance                                |
+================+========================================================+======================================+===========================================================+==========================================================+
| Stat Rank      | :math:`t_x = \rank_{l_i \in|x_2|}(\stat(x_1|x_2=l_i))` | :math:`t = [l_1,l_2, \ldots]`        | :math:`|\tau(\rank_{x_2}(x_1),t_x)|`                      | :math:`1- \frac{(\tau(t_a,t_s)+1)}{2}`                   |
+----------------+--------------------------------------------------------+--------------------------------------+-----------------------------------------------------------+----------------------------------------------------------+
| Stat BinRank   | :math:`\stat(x_1|x_2=a) t_x \stat(x_1|x_2=b)`          | :math:`<$ or $>`                     | :math:`\|1- \frac{\stat(x_1|x_2=a)}{ \stat(x_1|x_2=b)}\|` | :math:`\castint(\logicalnot(t_a==t_s))`                  |
+----------------+--------------------------------------------------------+--------------------------------------+-----------------------------------------------------------+----------------------------------------------------------+
| Lin Regression | :math:`x_2 = t_x*x_1 +b`                               | :math:`m`                            | :math:`|r|`                                               | :math:`\normangle(t_a,t_s) `                             |
+----------------+--------------------------------------------------------+--------------------------------------+-----------------------------------------------------------+----------------------------------------------------------+
| Correlation    | :math:`t_x = \corr(x_1,x_2)`                           | :math:`t_x$`                         | :math:`|t_x|`                                             | :math:`\castint(\logicalnot(\sign(t_a) == \sign(t_s)))`  |
+----------------+--------------------------------------------------------+--------------------------------------+-----------------------------------------------------------+----------------------------------------------------------+
| Binary Sign    | :math:`t_x = \sign(\corr(x_1,x_2))`                    | {*pos*, *neg* }                      | :math:` \corr(x_1,x_2)|`                                  | :math:`\castint(\logicalnot(t_a==t_s))`                  |
+----------------+--------------------------------------------------------+--------------------------------------+-----------------------------------------------------------+----------------------------------------------------------+
| Accuracy       | :math:`t_x = \frac{TP + TN}{N}`                        | :math:`t_x`                          | :math:`1-\frac{1}{\log_{10}(\max(N,10))}`                 | :math:`|t_s - t_a|`                                      |
+----------------+--------------------------------------------------------+--------------------------------------+-----------------------------------------------------------+----------------------------------------------------------+



Trend Expression, Representation in the result table, Strength of trend calculation and Distance calculation for each provided trend. The trends are $t_x$ for $x \in (a,s)$ where $t_a$ is the aggregate trend and $t_s$ is a subgroup trend, the same calculation computed for a single level of the categorical variable $x_3$. Here, $\castint$ refers to casting the logical outcome of the comparison to an integer, that is 1 for True and 0 for False; $\normangle$ is defined in Equation \ref{eq:normangle}; $\logicalnot$ is the logical operator to negate;  $\stat$ refers to any statistic of the data; $N$ is the number of samples, TP and TN are true positives and true negatives counts}
