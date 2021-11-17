---
jupytext:
  formats: ipynb,md:myst
  text_representation:
    extension: .md
    format_name: myst
    format_version: 0.12
    jupytext_version: 1.6.0
kernelspec:
  display_name: Python 3
  language: python
  name: python3
---

# Create saved LabeledDataFrames for synthetic datasets

```{code-cell} ipython3
import mlsim
import wiggum as wg
import numpy as np
import string
from mlsim import sp_plot

np.random.seed(20210618)
```

## Cluster Shape parameters
The magnitude correlation coefficient of clusters controls the shape of the clusters. This is unlikely to be a parameter that we need to vary much for this particular study. This will matter when/if we filter by weak trends.


The pearson correlation of means controls the spread of the clusters. This will almost directly control filtering by weak aggregate trends, but in coordination with the above. 

Portion of clusters with SP  #1 if r neg 0 if rpos controls how many clusters exhibit reversal. Should not matter in the current studies. 

The cluster size dicates the overall spread of each cluster. 

domain_range controls the view in which the data are visible. 

```{code-cell} ipython3
r_clusters =     [-.8, .5, .4, .7, -.6, .5, .4,-.9]  # magnitude correlation coefficient of clusters
cluster_spread = [ .3,-.2, .1,-.4, .2, -.1, .2,.4] # pearson correlation of means
p_sp_clusters =  [  1,  0,  0,  0,  1,   0,  0,  1] # portion of clusters with SP  #1 if r neg 0 if rpos
cluster_size =   [2,  3]#
domain_range = [0, 20, 0, 20] # of all data
```

## Data size and complexity Parameters

The number of views is the number of independent views (of two variables each). The total number of continuous variables will be `n_views` *2.  

The number of group by variables will be equal to `n_views` and the number of levels of each is specified in the `k` list. 

```{code-cell} ipython3

k = [2]*8 + [4]*8 + [8]*8 + [16]*8 + [32]*8 # number of clusters
n_view = len(k)
N = 10000 # number of points total
```

The clusters can be variable in size or as close to equal as possible by toggling the following line

```{code-cell} ipython3
p_clusters = [[1/k_i]*k_i for k_i in k]

# p_clusters = [np.random.dirichlet([k_i*2]*k_i) for k_i in k]
```

## Sample the data and check the cluster sizes

```{code-cell} ipython3
many_sp_df = mlsim.geometric_indep_views_gmm_sp(n_view,r_clusters,cluster_size,cluster_spread,p_sp_clusters,
                domain_range,k,N,p_clusters)
# print largest and smallest cluster sizes
print([many_sp_df[c].value_counts().min() for c in list(string.ascii_uppercase[:n_view])])
print([many_sp_df[c].value_counts().max() for c in list(string.ascii_uppercase[:n_view])])
```

Plot all of the views to check that the data looks okay

```{code-cell} ipython3
view_list = [('x'+str(i+1),'x'+str(i+2),c) for i,c in zip(range(0,n_view*2,2),list(string.ascii_uppercase[:n_view]))]

for view in view_list:
    sp_plot(many_sp_df,*view)
    
# sp_plot(many_sp_df,'x3','x4','B')

# many_sp_df.head()
```

Create the labeled dataframe ojbect

```{code-cell} ipython3
labeled_df = wg.LabeledDataFrame(many_sp_df)
```

Add meta data.  Here is where you could automate creating versions with different configurations of independent and depdendent variables and saving each one with a descriptive name, or keep what's there and modify elsewhere.

```{code-cell} ipython3
# all the xi are independent and dependent for now
roles = {'x'+str(i+1):['independent','dependent'] for i in range(n_view*2)}
# vars without 'x' in them are splitbys
splitby_var_list = [cn for cn in many_sp_df.columns if not('x' in cn)]
roles.update( {c:['splitby'] for c in splitby_var_list})
count_list = []

var_types = {'x'+str(i+1):'continuous' for i in range(n_view*2)}
var_types.update( {c:'categorical' for c in list(string.ascii_uppercase[:n_view])})
weighting = {}

# labeled_df.set_weighting_vars(weighting)


labeled_df.set_counts(count_list)
labeled_df.set_roles(roles)
labeled_df.set_var_types(var_types)
labeled_df.meta_df
```

```{code-cell} ipython3
labeled_df.to_csvs('../data/synthetic_scalability_base')
```

```{code-cell} ipython3

```
