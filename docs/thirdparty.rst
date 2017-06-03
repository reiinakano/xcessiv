Xcessiv and Third Party Libraries
=================================

Xcessiv provides an extremely flexible framework for experimentation with your own algorithms. Anything you can dream of can be used, as long as they conform to the **scikit-learn** interface.

Here are a few example workflows using third party libraries that work well with Xcessiv.

---------------------------

Xcessiv with TPOT
-----------------

Xcessiv is a great tool for tuning different models and pipelines and stacking them into one big ensemble, but with all the possible combinations of pipelines, where would you even begin?

Enter TPOT.

TPOT is `a Python tool that automatically creates and optimizes machine learning pipelines using genetic programming <http://rhiever.github.io/tpot/>`_.

TPOT will automatically try out hundreds of different machine learning pipelines and pick out the best one it finds. You can then export it as source code that contains a :class:`sklearn.pipeline.Pipeline` object. From there, you can just add your curated and tuned pipeline as a new base learner type, ready for even further improvement from stacking.

In this example, we'll be using the `Hill-Valley dataset with noise <https://archive.ics.uci.edu/ml/datasets/Hill-Valley>`_ from the UCI Machine Learning Repository. To load it into Xcessiv, we'll use a neat little Python wrapper called `pmlb <https://github.com/EpistasisLab/penn-ml-benchmarks>`_. Start by installing pmlb::

   pip install pmlb

Now, start a new Xcessiv project and let's dive in.

Set up data entry and cross-validation into Xcessiv
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Copy the following code into the **Main Dataset Extraction** code block.::

   from pmlb import fetch_data

   def extract_main_dataset():
       return fetch_data('Hill_Valley_with_noise', local_cache_dir='./', return_X_y=True)

pmlb has a nice interface that lets you extract datasets in a **scikit-learn** format very easily. You can change the argument to ``local_cache_dir`` above to any directory where you want to store the dataset. This way, the dataset is only downloaded the first time :func:`extract_main_dataset` is run.

Since the dataset is rather small, we'll use cross-validation. For both **Base learner Cross-validation** and **Stacked Ensemble Cross-validation**, copy the following code.::

   from sklearn.model_selection import KFold

   def return_splits_iterable(X, y):
       """This function returns an iterable that splits the given dataset
       K times into different train-test splits.
       """
       RANDOM_STATE = 8
       N_SPLITS = 5
       SHUFFLE = True

       return KFold(n_splits=N_SPLITS, random_state=RANDOM_STATE, shuffle=SHUFFLE).split(X, y)

Run TPOT to get an optimized pipeline
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Open up your favorite place to run Python code (I used Jupyter notebook) and run the following TPOT code.::

   from pmlb import fetch_data
   from tpot import TPOTClassifier
   X, y = fetch_data('Hill_Valley_with_noise', local_cache_dir='./', return_X_y=True)
   tpot = TPOTClassifier(generations=5, population_size=50, verbosity=2, n_jobs=-1)
   tpot.fit(X, y)
   tpot.export('tpot_1.py')

This snippet will run the TPOT algorithm on the Hill valley with noise dataset and automatically find an optimal pipeline. Then, it will export the found pipeline as Python code in ``tpot_1.py``.

.. admonition:: Note

   Note that the TPOT algorithm is stochastic, so different runs will probably result in different pipelines found. It might be best to set the ``random_state`` parameter in :class:`TPOTClassifier` for reproducibility. This randomness is a good thing, because stacking works best when very different base learners are used.

