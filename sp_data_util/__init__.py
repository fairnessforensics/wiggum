from .SPData import simple_regression_sp, noise_regression_sp

from .gp_data_gen import kSE, kPER, kLIN, kRQ
from .gp-data-gen import Kernel, Kernel2, ySample, ySampleNoisy
from .gp-data-gen import diagstack

__all__ = ['simple_regression_sp', 'noise_regression_sp',
           'kSE', 'kPER', 'kLIN', 'kRQ', 'Kernel', 'Kernel2', 'ySample']
