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
      install_requires=['matplotlib', 'Numpy', 'Scipy', 'seaborn', 'pandas','fairsim','flask'],
      dependency_links=[
        'git+http://github.com/brownsarahm/fair-sim/.git@master#egg=fair-sim'
    ])
