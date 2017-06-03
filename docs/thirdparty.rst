Xcessiv and Third Party Libraries
=================================

Xcessiv provides an extremely flexible framework for experimentation with your own algorithms. Anything you can dream of can be used, as long as they conform to the **scikit-learn** interface.

Here are a few example workflows using third party libraries that work well with Xcessiv.

Xcessiv with TPOT
-----------------

Xcessiv is a great tool for tuning different models and pipelines and stacking them into one big ensemble, but with all the possible combinations of pipelines, where would you even begin?

Enter TPOT.

TPOT is `a Python tool that automatically creates and optimizes machine learning pipelines using genetic programming <http://rhiever.github.io/tpot/>`_.

TPOT will automatically try out hundreds of different machine learning pipelines and pick out the best one it finds. You can then export it as source code that contains a :class:`sklearn.pipeline.Pipeline` object. From there, you can just add your curated and tuned pipeline as a new base learner type, ready for even further improvement from stacking.

In this example, we'll be using the `Hill-Valley dataset with noise <https://archive.ics.uci.edu/ml/datasets/Hill-Valley>`_ from the UCI Machine Learning Repository. To load it into Xcessiv, we'll use a neat little Python wrapper called `pmlb <https://github.com/EpistasisLab/penn-ml-benchmarks>`. Start by installing pmlb::

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

