.. Xcessiv documentation master file, created by
   sphinx-quickstart on Sat May 20 16:04:29 2017.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

Welcome to Xcessiv's documentation!
===================================

Xcessiv is a web-based application for quick and scalable hyperparameter tuning and stacked ensembling in Python.

----------------

Features
--------

* Fully define your data source, cross-validation process, relevant metrics, and base learners with Python code
* Any model following the Scikit-learn API can be used as a base learner
* Task queue based architecture lets you take full advantage of multiple cores and embarrassingly parallel hyperparameter searches
* Direct integration with `TPOT <https://github.com/rhiever/tpot>`_ for automated pipeline construction
* Automated hyperparameter search through Bayesian optimization
* Easy management and comparison of hundreds of different model-hyperparameter combinations
* Automatic saving of generated secondary meta-features
* Stacked ensemble creation in a few clicks
* Automated ensemble construction through greedy forward model selection
* Export your stacked ensemble as a standalone Python file to support multiple levels of stacking

----------------

Define your base learners and performance metrics
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. image:: _static/baselearner.gif
   :align: center
   :alt: Base learner gif

----------------

Keep track of hundreds of different model-hyperparameter combinations
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. image:: _static/listbaselearner.gif
   :align: center
   :alt: List base learner gif

----------------

Effortlessly choose your base learners and create stacked ensembles
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. image:: _static/ensemble.gif
   :align: center
   :alt: Ensemble gif

----------------

Contents
--------

.. toctree::
   :maxdepth: 2
   :name: mastertoc

   installation
   walkthrough
   advanced
   thirdparty


Indices and tables
==================

* :ref:`genindex`
* :ref:`modindex`
* :ref:`search`
