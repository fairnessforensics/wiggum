
*Simpson's Paradox Inspired Fairness Forensics*


Getting Started
================

Simpson's Paradox Inspired Fairness Forensics

Prior version published in:
 - `FLAIRS 31 <http://www.flairs-31.info/program>`_  `paper <../dsp_paper.pdf>`_
 - `Docs available separately <https://fairnessforensics.github.io/detect_simpsons_paradox/>`_




To use the Wiggum, download (or clone) from the
`GitHub Repo <https://github.com/fairnessforensics/wiggum>`_ and:

.. code-block:: bash

  cd wiggum/
  pip install .

See the documentation site for examples and to reproduce the paper results.

To use the package in python, after installed:

.. code-block:: Python

  import wiggum as wg

Installing makes the flask app for interactive visualization
in browser available as a command line tool. To run the app:

.. code-block:: bash

  wiggum-app



Development
============

We also provide a docker file.

FIXME


To run in the same environment as developed or to compile docs, sphinx and
some extensions are required, all are included in `requirements.txt` and can be
 installed with:

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
