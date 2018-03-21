import seaborn as sns
import pandas as pd
import matplotlib.markers as mk
import matplotlib.pylab as plt


def sp_plot(df, x_col, y_col, color_col,ci = None,domain_range=[0, 20, 0 , 20]):
    """
    create SP vizualization plot from 2 columns of a df
    """

    # # create axes if not passed
    # if ax is None:
    #     fig = plt.figure()
    #     ax = fig.add_subplot(111)

    all_markers = list(mk.MarkerStyle.markers.keys())



    n_markers = df[color_col].unique().shape[0] # number unique
    cur_markers = all_markers[:n_markers]


    sns.lmplot(x_col, y_col, data=df, hue=color_col, ci=ci,
                   markers =cur_markers, palette="Set1")

    # adda whole data regression line, but don't cover the scatter data
    sns.regplot(x_col, y_col, data=df, color='black', scatter=False, ci=ci)

    plt.axis(domain_range)
