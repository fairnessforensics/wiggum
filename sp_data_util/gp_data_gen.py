import numpy as np

def kSE(x1,x2,theta):
    """
    Squared Exponential (SE) kernel function
    
    Inputs
    -------
    x1, x2: scalar
        inputs at two points
    theta: 2vector
        
    SE parameters:
        lengthscale determines the smoothness of the function
        
    
    Returns
    --------
    k(x1,x2; theta)
    """
    return theta[0]*np.exp(-theta[1]*np.square(x1-x2)) 

def kPER(x1,x2,theta):
    """
    Periodic (PER) Kernel
    Inputs
    -------
    x1, x2:scalar
        inputs at two points
    theta: vector of length 2 
         where 1.lengthscale and 2.period
    """
    return np.exp(-theta[0]*np.square(np.sin((x1-x2)/theta[1])))

def kLIN(x1,x2,theta):
    return theta[0] + theta[1]*(x1-theta[2])*(x2-theta[2])
    """
    Linear Kernel
    Inputs
    -------
    x1, x2:scalar
        inputs at two points
    theta:vector of length 3
        1. variance of y-intercept 2.slope variance 3.x that all samples go through
    """
def kRQ(x1,x2,theta):
    """
    Rational Quadratic Kernel
    Inputs
    -------
    x1, x2:scalar
        inputs at two points
    theta:vector of length 2
        1. lengthscale 2.alpha ()
    2 choices to fix, always pass parameters as numpy arrays (unreliable/ makes using scripts more complicated)
    # use a differnt way of squaring theta[2], like below
    # and a different way of raising to the power
    # note that it has to be 2.0
    """
    return theta[0]*(1 + ((np.square(x1 - x2))/(2 * theta[1] * theta[2]**2.0)))**(-theta[1])

def Kernel(x,f,theta):
    """
    build square kernel matrix for inputs x with kernel function f and 
    parameters theta
    
    Inputs
    -------
    x : vector
        values to evaluate the kenrel function at, pairwise
    f: kernel function
        function that accepts inputs as (x1,x2,theta)
    theta: vector
        vector of parameters of appropriate length for the kernel function
        
    
    Returns
    --------
    matrix of kernel values
    
    """
    K = np.asarray([[f(t,tp,theta) for tp in x] for t in x])
    return K
    
def Kernel2(x,x2,f,theta):
    """
    build kernel matrix for inputs x and x2 with kernel function f and 
    parameters theta
    
    Inputs
    -------
    x,x2 : vectors
        values to evaluate the kenrel function at, pairwise
    f: kernel function
        function that accepts inputs as (x1,x2,theta)
    theta: vector
        vector of parameters of appropriate length for the kernel function
        
    
    Returns
    --------
    matrix of kernel values
    
    """
    K = np.asarray([[f(t,tp,theta) for tp in x2] for t in x])
    return K
 
def diagstack(K1,K2):
    """
    combine two kernel matrices along the diagonal
    [[K1 0][0 K2]]
    """
    r1,c1 = K1.shape
    r2,c2 = K2.shape
    Kt = np.hstack((K1,np.zeros([r1,c2])))
    Kb = np.hstack((np.zeros([r2,c1]),K2))
    return np.vstack((Kt,Kb))
  
def ySample(x,k,theta,mu): 
    """
    sample from a GP at inputs x, for kernel function k with parameters 
    theta and mean function mu
    
    Inputs
    -------
    x,: vector
        values to evaluate the kernel function at
    k: kernel function
        function that accepts inputs as (x1,x2,theta)
    theta: vector
        vector of parameters of appropriate length for the kernel function
    mu: vector
        must match z in size, or be a scalar
        
    
    Returns
    --------
    y: vector
        y ~ GP(mu(x),k(x,x';theta))
    
    """
    return np.random.multivariate_normal(mu+np.zeros(np.size(x)),Kernel(x,k,theta))

def ySampleNoisy(x,k,theta,mu,eta): 
    """
    sample from a GP at inputs x, for kernel function k with parameters 
    theta and mean function mu
    
    Inputs
    -------
    x,: vector
        values to evaluate the kernel function at
    k: kernel function
        function that accepts inputs as (x1,x2,theta)
    theta: vector
        vector of parameters of appropriate length for the kernel function
    mu: vector
        must match z in size, or be a scalar
        
    
    Returns
    --------
    y: vector
        y ~ GP(mu(x),k(x,x';theta))
    
    """
    return np.random.multivariate_normal(mu+np.zeros(np.size(x)),Kernel(x,k,theta)) + np.random.randn(len(x))*eta
        
def ySE(x): 
    """
    sample from a a SE GP,
    * should be improved to take in parameters instead of defaults
    """
    return np.random.multivariate_normal(np.zeros(np.size(x)),Kernel(x,kSE,[1,.1]))
    
def y2PER(x,t,lp,lp2):
    return np.random.multivariate_normal(np.zeros(np.size(x)), diagstack(Kernel(x[:t],kPER,lp),Kernel(x[t:],kPER,lp2)))
    
    
def ySExPER(x,se,lp):
    return np.random.multivariate_normal(np.zeros(np.size(x)),Kernel(x,kSE,se)*Kernel(x,kPER,lp))
    