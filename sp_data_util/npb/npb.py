import numpy as np

def sample_DP(alpha,N):
    """
    Sample from Dirichlet Process via chinese restaraunt process representation

    Parameters
    ----------
    alpha : scalar
        concentration parameter
    N : scalar
        number of samples to draw

    Returns
    --------
    z : list of ints
        assignments of customers to tables
    """
    pi = [1]

    z = []

    for n in range(N):
        # sample from pi
        z.append(np.random.choice(len(pi),p=pi))
        K = max(z) +1
        # update counts
        counts,e = np.histogram(z,bins = np.arange(K+1)-.5)
        # append alpha and normalize to a distribution
        pi = np.append(counts,alpha)/(alpha + n +1.0)

    return z

def sample_PY(alpha,d,N):
    """
    Sample from Pitman-Yor Process via chinese restaraunt process representation

    Parameters
    ----------
    alpha : scalar > -d
        concentration parameter
    d : scalar \in [0,1)
        discount parameter
    N : scalar
        number of samples to draw

    Returns
    --------
    z : list of ints
        assignments of customers to tables
    """

    pi = [1]

    z = []
    for n in range(N):
        # sample from pi
        z.append(np.random.choice(len(pi),p=pi))
        K = max(z) +1
        # update counts
        counts,e = np.histogram(z,bins = np.arange(K+1)-.5)
        # append alpha and normalize to a distribution
    #     denoms = np.append()
        pi = np.append(counts - d,alpha + d*K)/(alpha + n +1)

    return z

def p_row(p):
    return np.asarray([np.random.choice([1,0],p=[p_i, 1-p_i]) for p_i in p])

def sample_BP(gamma,N):
    """
    IBP
    """
    gamma = 2
    z = []

    z_tmp = np.ones(np.random.poisson(gamma))
    m = np.zeros(z_tmp.shape)
    z.append(z_tmp)

    for n in range(1,N):
        m += z_tmp
    #     print(m)
        p = m/(n+1)
    #     print(p)
        new = np.random.poisson(gamma/n)
        z_tmp = np.concatenate((p_row(p),np.ones(new)))
        m = np.concatenate((m,np.zeros(new)))
        z.append(z_tmp)

    return z

def sample_3IBP(gamma,theta,alpha, N):
    """
    Sample 3ibp

    [Broderick, Pitman, Jordan 201x](https://arxiv.org/pdf/1301.6647.pdf)
    """
    gamma = 3
    theta = 5 # >0, set to 1 to recover above
    alpha = .5 #  in [0,1), set to 0 to revover above

    z = []


    z_tmp = np.ones(np.random.poisson(gamma))
    m = np.zeros(z_tmp.shape)
    z.append(z_tmp)

    for n in range(2,N):
        m += z_tmp
    #     print(m)
        p = [(m_k- alpha)/(n + theta - 1) for m_k in m]
    #     print(p)
        G1 = scisp.gamma(theta+1) /scisp.gamma(theta + n )
        G2 = scisp.gamma(theta+ alpha - 1 + n) /scisp.gamma(theta+ alpha)
        new = np.random.poisson(gamma*G1*G2)
        z_tmp = np.concatenate((p_row(p),np.ones(new)))
        m = np.concatenate((m,np.zeros(new)))
        z.append(z_tmp)

    return z
