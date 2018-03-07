import seaborn as sns
import pandas as pd


def sp_plot(df, x_col, y_col, color_col):
    """
    create SP vizualization plot from 2 columns of a df
    """
    all_markers = ['x', 'o', 's', '*', '^', '>', '<']
    n_markers = df[color_col].unique().shape[0] # number unique
    cur_markers = all_markers[:n_markers]


    sns.lmplot(x_col, y_col, data=df, hue=color_col, ci=None,
                   markers =cur_markers, palette="Set1")
    # adda whole data regression line, but don't cover the scatter data
    sns.regplot(x_col, y_col, data=df, color='black', scatter=False, ci=None)
