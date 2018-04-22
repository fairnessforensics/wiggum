from .SPData import simple_regression_sp, noise_regression_sp, generateDataset
from .SPData import mixed_regression_sp_extra, geometric_2d_gmm_sp
from .SPData import geometric_indep_views_gmm_sp
from .spplots import sp_plot, plot_clustermat


__all__ = ['simple_regression_sp', 'noise_regression_sp', 'generateDataset',
           'mixed_regression_sp_extra','sp_plot', 'geometric_2d_gmm_sp',
           'geometric_indep_views_gmm_sp', 'plot_clustermat']
