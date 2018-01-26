from .SPData import simple_regression_sp, noise_regression_sp

from .gp_data_gen import kSE, kPER, kLIN, kRQ
from .gp_data_gen import ySample, ySampleNoisy
from .gp_data_gen import diagstack

__all__ = ['simple_regression_sp', 'noise_regression_sp',
           'kSE', 'kPER', 'kLIN', 'kRQ', 'ySample', 'ySampleNoisy']
