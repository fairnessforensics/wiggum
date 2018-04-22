import seaborn as sns
import pandas as pd
import numpy as np
import matplotlib.markers as mk
import matplotlib.pylab as plt


def sp_plot(df, x_col, y_col, color_col,ci = None,domain_range=[0, 20, 0 , 20],ax=None):
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

def plot_clustermat(z,fmt=None):
    """

    black and white matshow for clustering and feat allocation matrices

    Parameters
    -----------
    z : nparray, square to be plotted
    fmt : if z is not a square, then str of what it is


    fmt options:
    'crplist' : a list of values from zero to k
    'ibplist' : a list of lists of varying lengths
    'list' : a list, but not nparray otherwise ready to plot
    """



    processing = {'crplist': lambda x: list_to_mat(x),
                  'ibplist': lambda x: make_square(x),
                  'list': lambda x: np.asarray(x),
                  None: lambda x: x}

    z_mat = processing[fmt](z)
    # print(z_mat)
    N,K = z_mat.shape

    # no white grid
    sns.set_style("whitegrid", {'axes.grid' : False})

    # plot the data
    plt.matshow(z_mat,cmap=plt.cm.gray_r)


    # make the tick marks at the ints
    ax = plt.gca()
    ax.set_xticks(np.arange(0, K, 1))
    ax.set_yticks(np.arange(0, N, 1))

    # Labels for major ticks
    ax.set_xticklabels(np.arange(0, K, 1))
    ax.set_yticklabels(np.arange(0, N, 1))

    # Minor ticks at 1/2 marks
    ax.set_xticks(np.arange(-.5, K, 1), minor=True)
    ax.set_yticks(np.arange(-.5, N, 1), minor=True)

    # Gridlines based on minor ticks
    plt.grid(which='minor', color='k', linestyle='-', linewidth=3)

def make_square(z):
    """
    convert a list of lists of varying sizes to a square matrix
    """
    D = len(z[-1])
    return np.asarray([np.concatenate((z_i,np.zeros([D-len(z_i)]))) for z_i in z])

def list_to_mat(z):
    """
    make a list of length N with values 1 to K into an NxK binanry matrix
    """
    K = np.max(z)
    tmp = np.eye(K+1)
    return np.asarray([tmp[z_i] for z_i in z])
