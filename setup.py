from setuptools import setup

setup(name='detect_simpsons_paradox',
      version='0.2',
      description='utilities to detect simpson\'s paradox',
      url='http://github.com/brownsarahm/DetectSimpsonParadox',
      author='Sarah M Brown',
      author_email='smb@sarahmbrown.org',
      license='MIT',
      packages=['detect_simpsons_paradox', 'spviz'],
      zip_safe=False,
      include_package_data = True,
      install_requires=['matplotlib', 'Numpy', 'Scipy', 'seaborn', 'pandas',
      'mlsim @ https://github.com/brownsarahm/ml-sim/archive/master.zip','flask'],
      entry_points = {
        'console_scripts': ['spviz-app=spviz.command_line:main'],
    })
