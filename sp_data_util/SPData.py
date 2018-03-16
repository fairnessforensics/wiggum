import numpy as np
import pandas as pd
from random import randint
import random
from random import gauss
import math
import scipy.stats as stats
import string

def linear_sp(N):
    """
    generatate synthetic data for SP in linear trends by generating
    linear data with offsets that induce SP
    """


def simple_regression_sp(N, mu,cov):
    """
    generate synthetic data for simplest case of group-wise SP of the
       regression type, generates data from $k$k clusters with centers
       mu each with covariance cov
    mu and cov must induce SP, this does not make SP happen
    adds 1 noisy dimensions

    Parameters
    -----------
    N : scalar integer
        number of samples total to draw
    mu : k cluster centers in d dimensions
        locations of the clusters
    cov : d_1 xd_1 covariance
        shared covariance of all subgroup clusters
    """

    # number rof clusters
    k = len(mu)
    # dimensions
    d = len(mu[0])

    #generate var names
    var_names = ['x'+str(i+1) for i in range(d)]

    # sample from clusters (should accept wights and allow this to vary ie class imbalance)
    z = np.random.randint(0,k,N)
    x = np.asarray([np.random.multivariate_normal(mu[z_i],cov) for z_i in z])

    # make a dataframe
    latent_df = pd.DataFrame(data=x,
                           columns = var_names)

    # add a noise column
    x3 = np.random.normal(0, 10, N)
    latent_df['x_n'] = x3

    # code z as color and add that as a column to the dataframe
    color_z = {0:'r', 1:'b'}
    latent_df['color'] = [color_z[z_i] for z_i in z]

    return latent_df

def noise_regression_sp(N, mu,cov,d_noise):
    """
    generate synthetic data for simplest case of group-wise SP of the
       regression type, generates data from $k$k clusters with centers
       mu each with covariance cov
    mu and cov must induce SP, this does not make SP happen
    adds d_noise noisy dimensions

    Parameters
    -----------
    N : scalar integer
        number of samples total to draw
    mu : k cluster centers in d dimensions
        locations of the clusters
    cov : d_1 xd_1 covariance
        shared covariance of all subgroup clusters
    """

    # number rof clusters
    k = len(mu)
    # dimensions
    d = len(mu[0]) + d_noise

    #generate var names
    var_names = ['x'+str(i+1) for i in range(d)]

    # add noise dimensions to mu and cov
    mu = np.append(mu,np.zeros([k,d_noise]),axis = 1)
    cov = np.vstack([np.hstack([cov,np.zeros([d_noise,d_noise])]),
           np.hstack([np.zeros([d_noise,d_noise]),np.eye(d_noise)])])

    # sample from clusters (should accept wights and allow this to vary ie class imbalance)
    z = np.random.randint(0,k,N)
    x = np.asarray([np.random.multivariate_normal(mu[z_i],cov) for z_i in z])

    # make a dataframe
    latent_df = pd.DataFrame(data=x,
                           columns = var_names)

    # add a noise column
    x3 = np.random.normal(0, 10, N)
    latent_df['x_n'] = x3

    # code z as color and add that as a column to the dataframe
    color_z = {0:'r', 1:'b'}
    latent_df['color'] = [color_z[z_i] for z_i in z]

    return latent_df

def mixed_regression_sp_extra(N, mu,cov,extra,p=None):
    """
    generate synthetic data for simplest case of group-wise SP of the regression type
    mu and cov must induce SP, this does not make SP happen
    adds 1 noisy dimensions and an interacting char attribute

    Parameters
    -----------
    N : scalar integer
        number of samples total to draw
    mu : k cluster centers in d dimensions
        locations of the clusters
    cov : d_1 xd_1 covariance
        shared covariance of all subgroup clusters
    extra : scalar
        number of extra variables ot add.
    p : vector length k
        probability of each cluster

    """

    k = len(mu)

    # sample from clusters
    z = np.random.choice(k,N,replace=True,p=p)

    x = np.asarray([np.random.multivariate_normal(mu[z_i],cov) for z_i in z])

    # make a dataframe
    latent_df = pd.DataFrame(data=x,
                           columns = ['x1', 'x2'])

    # add in the cluster id
    latent_df['cluster'] = [z_i for z_i in z]

    # add extra continuous column
    for i in range(extra):
        attrName = "con_" + str(i)
        y = pd.DataFrame(data=np.random.normal(0, 100, N),columns=[attrName])
        latent_df = pd.concat([latent_df, y], axis=1)


    # add extra categorical column
    for i in range(extra):
        attrName = "cat_" + str(i)
        y = pd.DataFrame(data=np.random.choice(100,N),columns=[attrName])
        latent_df = pd.concat([latent_df, y], axis=1)

    return latent_df


def random_with_N_digits(n):
    range_start = 10**(n-1)
    range_end = (10**n)-1
    return randint(range_start, range_end)

def generateDataset(N, numClu, numExtra):
    """
    generate synthetic dataset for time experiments

    Parameters
    --------------
    N : scalar
        total samples to draw
    numClu: number of clusters
    numberOfExtraColumn: number of extra categorical columns and continuous columns
    """


    # generate numClu mu_x and mu_y for sampling data from numClu clusters
    # create first two mu
    mu = np.asarray([[1,1],[5,5]])

    # generate rest of the mu
    for i in range(numClu - 2):
        mu_x = random_with_N_digits(2);
        variance = 1000
        mu_y = gauss(mu_x, math.sqrt(variance))
        mu_new = np.asarray([mu_x,mu_y])
        mu = np.append(mu,[mu_new],axis=0)

    cov = [[.6,-1],[0,.6]]

    # generate the data set
    latent_df = mixed_regression_sp_extra(N,mu,cov,[.7,.3], numExtra)

    return latent_df

def mixed_regression_sp(N, mu,cov,p):
    """
    generate synthetic data for simplest case of group-wise SP of the regression type
    mu and cov must induce SP, this does not make SP happen
    adds 1 noisy dimensions and an interacting char attribute

    Parameters
    -----------
    N : scalar integer
        number of samples total to draw
    mu : k cluster centers in d dimensions
        locations of the clusters
    cov : d_1 xd_1 covariance
        shared covariance of all subgroup clusters

    """

    k = len(mu)

    # sample from clusters (should accept wights and allow this to vary ie class imbalance)
    z = np.random.randint(0,k,N)
    x = np.asarray([np.random.multivariate_normal(mu[z_i],cov) for z_i in z])

    # make a dataframe
    latent_df = pd.DataFrame(data=x,
                           columns = ['x1', 'x2'])

    # add a noise column
    x3 = np.random.normal(0, 10, N)
    latent_df['x3'] = x3

    # code z as color and add that as a column to the dataframe
    color_z = {0:'r', 1:'b'}
    latent_df['color'] = [color_z[z_i] for z_i in z]

    # add a sub group, character that interacts with color based on p
    char_zy = {0: {0:'x', 1:'o'}, 1:{0:'o', 1:'x'}}

    y = np.random.choice([0,1],N,p=p)
    latent_df['y'] = y
    latent_df['char'] = [char_zy[zi][yi] for zi,yi in zip(z,y)]

    return latent_df


"""
# for making more complex interactions, should be its own generator  will use abo

"""


def regression_corr(N, mu,cov):
    """
    generate synthetic data for simplest case of group-wise SP of the regression type
    mu and cov must induce SP, this does not make SP happen
    adds 1 noisy dimensions

    Parameters
    -----------
    N : scalar integer
        number of samples total to draw
    mu : k cluster centers in d dimensions
        locations of the clusters
    cov : d_1 xd_1 covariance
        shared covariance of all subgroup clusters
    """

    k = len(mu)

    # sample from clusters (should accept wights and allow this to vary ie class imbalance)
    z = np.random.randint(0,k,N)
    x = np.asarray([np.random.multivariate_normal(mu[z_i],cov) for z_i in z])

    # make a dataframe
    latent_df = pd.DataFrame(data=x,
                           columns = ['x1', 'x2'])

    # add a noise column
    x3 = np.random.normal(0, 10, N)
    latent_df['x3'] = x3

    # code z as color and add that as a column to the dataframe
    color_z = {0:'r', 1:'b'}
    latent_df['color'] = [color_z[z_i] for z_i in z]

    return latent_df

def means_with_spread(mu_mu,cov,k):
    """
    sample k means from a gaussian distribution and downsample with a SE kernel
    for a point process-like effect

    Parameters
    -----------
    mu_mu : 2vector
        center of means
    cov : 2x2
        covariance matrix for means
    k : scalar
        number of means to return

    Returns
    -------
    mu_sort : vector [2,k]
        means sorted by distance

    """
    # define a sampling function so that we can sample jointly instead of
    next_sample = lambda: np.random.multivariate_normal(mu_mu, cov)

    # we'll use a gaussian kernel around each to filter
    # only the closest point matters
    # scale here probably should be set to help provide guarantees
    dist = lambda mu_c,x: stats.norm.pdf(min(np.sum(np.square(mu_c -x),axis=1)))


    # keep the first one
    mu = [next_sample()]
    p_dist = [1]

    while len(mu) <= k:
        m = next_sample()
        p_keep = 1- dist(mu,m)
        if p_keep > .99:
            mu.append(m)
            p_dist.append(p_keep)

    mu = np.asarray(mu)

    # sort by distance
    mu_sort, p_sort = zip(*sorted(zip(mu,p_dist),
                key = lambda x: x[1], reverse =True))

    return mu_sort

def geometric_2d_gmm_sp(r_clusters,cluster_size,cluster_spread,p_sp_clusters,
                domain_range,k,N,p_clusters=None):
    """
    Sample from a gaussian mixture model with Simpson's Paradox and spread means
    return data in a data fram

    r_clusters : scalar [0,1]
        correlation coefficient of clusters
    cluster_size : 2 vector
        variance in each direction of each cluster
    cluster_spread : scalar [0,1]
        pearson correlation of means
    p_sp_clusters : scalar in [0,1]
        portion of clusters with SP
    p_clusters : vector in [0,1)^k, optional
        probabilty of membership of a sample in each cluster (controls relative
        size of clusters) default is [1.0/k]*k for uniform
    domain_range : [xmin, xmax, ymin, ymax]
        planned region for points to be in, means will be in middle 80%
    k : integer
        number of clusters
    N : scalar
        number of points
    """

    # if not defined, set uniform cluster probaiblity
    if p_clusters is None:
        p_clusters = [1.0/k]*k

    # sample the data
    x, z = data_only_geometric_2d_gmm(r_clusters,cluster_size,cluster_spread,
                                      p_sp_clusters,
                                      domain_range,k,N,p_clusters)

    # make a dataframe
    latent_df = pd.DataFrame(data=x,
                           columns = ['x1', 'x2'])

    # code cluster as color and add it a column to the dataframe
    latent_df['color'] = z


    return latent_df

def geometric_indep_views_gmm_sp(d,r_clusters,cluster_size,cluster_spread,p_sp_clusters,
                domain_range,k,N,p_clusters=None):
    """
    Sample from a gaussian mixture model with Simpson's Paradox and spread means
    return data in a data fram

    d : integer
        number of independent views, groups of 3 columns with sp
    r_clusters : scalar [0,1] or list of d
        correlation coefficient of clusters
    cluster_size : 2 vector or list of d
        variance in each direction of each cluster
    cluster_spread : scalar [0,1] list of d
        pearson correlation of means
    p_sp_clusters : scalar in [0,1] list of d
        portion of clusters with SP
    p_clusters : vector in [0,1)^k, optional or list of d vectors
        probabilty of membership of a sample in each cluster (controls relative
        size of clusters) default is [1.0/k]*k for uniform
    domain_range : [xmin, xmax, ymin, ymax] list of d
        planned region for points to be in, means will be in middle 80%
    k : integer or list of d
        number of clusters
    N : scalar
        number of points, shared across all views
    """

    # if not defined, set uniform cluster probaiblity
    if p_clusters is None:
        p_clusters = [1.0/k]*k


    # make inputs lists if not
    sclar_to_list = lambda x: [x]*d # if float, make d list by repeats

    if type(r_clusters) in [float, int]:
        r_clusters = sclar_to_list(r_clusters)

    if type(cluster_spread) in [float, int]:
        cluster_spread = sclar_to_list(cluster_spread)

    if type(p_sp_clusters) in [float, int]:
        p_sp_clusters = sclar_to_list(p_sp_clusters)

    if type(k) is int:
        k = sclar_to_list(k)

    if type(p_clusters[0]) in [float, int]:
        p_clusters = sclar_to_list(p_clusters)

    if type(cluster_size[0]) in [float, int]:
        cluster_size = sclar_to_list(cluster_size)

    if type(domain_range[0]) in [float, int]:
        domain_range = sclar_to_list(domain_range)


    # set x to none for logic below to add stuff
    x = None
    z = []

    for r,c_std,c_sp,p_sp, d_r,k,rho in zip(r_clusters,cluster_size,cluster_spread,p_sp_clusters,
                            domain_range,k,p_clusters):
        # sample the data
        x_tmp, z_tmp = data_only_geometric_2d_gmm(r,c_std,c_sp,p_sp, d_r,k,N,rho)
        # x.append(x_tmp)
        if x is None:
            x = x_tmp
        else:
            x = np.append(x,x_tmp,axis=1)
        z.append(z_tmp)

    col_names = ['x'+ str(i+1) for i in range(d*2)]

    # make a dataframe
    print(len(x))
    print(len(x[0]))

    latent_df = pd.DataFrame(data=x,
                           columns = col_names )

    #cluster naming will be name the columns: A, B, ...
    # valuses will be A1, A2, ..., Ak...
    z_names = list(string.ascii_uppercase[:d])
    # code cluster as and add it a column to the dataframe
    for z_i,name in zip(z,z_names):
        latent_df[name] = [name + str(z_ii) for z_ii in z_i]


    return latent_df

def data_only_geometric_2d_gmm(r_clusters,cluster_size,cluster_spread,p_sp_clusters,
                domain_range,k,N,p_clusters):
    """
    private, sampler only, returns raw variables, utily for sharing in other
    samplers
    Sample from a gaussian mixture model with Simpson's Paradox and spread means

    r_clusters : scalar [0,1]
        correlation coefficient of clusters
    cluster_size : 2 vector
        variance in each direction of each cluster
    cluster_spread : scalar [0,1]
        pearson correlation of means
    p_sp_clusters : scalar in [0,1]
        portion of clusters with SP
    p_clusters : vector in [0,1)^k, optional
        probabilty of membership of a sample in each cluster (controls relative
        size of clusters) default is [1.0/k]*k for uniform
    domain_range : [xmin, xmax, ymin, ymax]
        planned region for points to be in, means will be in middle 80%
    k : integer
        number of clusters
    N : scalar
        number of points
    """
    # define distribution for means, using the range provided
    mu_mu = [np.mean(domain_range[:2]),np.mean(domain_range[2:])]
    # first set correlation mat for means
    mu_sign = - np.sign(r_clusters)
    corr = [[1, mu_sign*cluster_spread],[mu_sign*cluster_spread,1]]
    # use a trimmed range to comput std
    mu_trim = .2
    mu_transform = np.repeat(np.diff(domain_range)[[0,2]]*(mu_trim),2)
    mu_transform[[1,3]] = mu_transform[[1,3]]*-1 # sign flip every other
    mu_domain = [d + m_t for d, m_t in zip(domain_range,mu_transform)]
    d = np.sqrt(np.diag(np.diff(mu_domain)[[0,2]]))
    # construct covariance from correlation
    mu_cov = np.dot(d,corr).dot(d)

    # sample means
    mu = means_with_spread(mu_mu,mu_cov,k)

    # create cluster covariances for SP and not SP
    cluster_std = np.diag(np.sqrt(cluster_size))
    cluster_corr_sp = np.asarray([[1,r_clusters],[r_clusters,1]]) # correlation with sp
    cluster_cov_sp = np.dot(cluster_std,cluster_corr_sp).dot(cluster_std) #cov with sp
    cluster_corr = np.asarray([[1,-r_clusters],[-r_clusters,1]]) #correlation without sp
    cluster_cov = np.dot(cluster_std,cluster_corr).dot(cluster_std) #cov wihtout sp
    cluster_covs = [cluster_corr_sp, cluster_corr]


    # sample the[0,1] k times to assign each cluster to SP or not
    c_sp = np.random.choice(2,k,p=[p_sp_clusters,1-p_sp_clusters])


    # sample from a GMM
    z = np.random.choice(k,N,p_clusters)
    # sample data using the cluster assignments z, means and cluster covariances
    x = np.asarray([np.random.multivariate_normal(mu[z_i],
                                        cluster_covs[c_sp[z_i]]) for z_i in z])

    return x,z
