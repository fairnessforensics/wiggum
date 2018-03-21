
Getting Started
================

Toward scalable, interactive detection of Simpson's Paradox.

Published in:
 - `FLAIRS 31 <http://www.flairs-31.info/program>`_  `paper <../dsp_paper.pdf>`_ to appear

To use the package, download (or clone) and:

.. code-block:: bash

  cd DetectSimpsonParadox/
  pip install .

To use the package, after installed::

  import detect_simpsons_paradox as dsp


To use the data generation utilities, after installed::

  import sp_data_utils as sp_data


Development
============

To compile docs, sphinx and some extensions are required, all are included in
`requirements.txt` and can be installed with

.. code-block:: bash

  pip install -r requirements.txt

then

.. code-block:: bash

  cd docs/
  make html


To reinstall after changes

.. code-block:: bash

  pip install --upgrade .

When updating the package and working in a notebook, the notebook's kernel will
need to be restarted to get the updates, if they're done outside of the notebook.

(only needed in development or after upgrade)
