import numpy as np
import pandas as pd
from .gp_data_gen import kLIN, ySampleNoisy

def Hello():
    return "Hello2"

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