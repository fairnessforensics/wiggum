from setuptools import setup

setup(name='wiggum',
      version='0.2',
      description='utilities to detect simpson\'s paradox',
      url='http://github.com/brownsarahm/DetectSimpsonParadox',
      author='Sarah M Brown, Christan Grant, Chenguang Xu',
      author_email='smb@sarahmbrown.org',
      license='MIT',
      packages=['wiggum', 'wiggum_app','wiggum.trend_components'],
      zip_safe=False,
      include_package_data = True,
      install_requires=['matplotlib', 'Numpy', 'Scipy', 'seaborn', 'pandas','flask'],
      entry_points = {
        'console_scripts': ['wiggum-app=wiggum_app.command_line:main'],
    })
