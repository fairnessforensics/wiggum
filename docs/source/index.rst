.. Detecting Simpson's Paradox documentation master file, created by
   sphinx-quickstart on Thu Aug 31 11:21:36 2017.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

Welcome to Detecting Simpson's Paradox's documentation!
=======================================================

.. toctree::
   :maxdepth: 2
   :caption: Contents:

   organization.rst

Getting Started
================

Toward scalable, interactive detection of Simpson's Paradox.

Published in:
 - [FLAIRS 31] (http://www.flairs-31.info/program) paper to appear

To use the package, download (or clone) and:

.. code-block:: bash

  cd DetectSimpsonParadox/
  pip install .


To compile docs, sphinx is required. then

.. code-block:: bash

  cd docs/
  make html


To use the package, after installed::

  import detect_simpsons_paradox as dsp


To use the data generation utilities, after installed::

  import sp_data_utils as sp_data


To reinstall after changes:

.. code-block::bash

  pip install --upgrade .



Indices and tables
==================

* :ref:`genindex`
* :ref:`modindex`
* :ref:`search`
