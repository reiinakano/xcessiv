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

Note that this could take a while. On my computer, it took around 30 minutes to an hour to run. If you want, you can just skip this part since the pipelines I found will be available in this documentation anyway.

.. admonition:: Note

   Note that the TPOT algorithm is stochastic, so different runs will probably result in different pipelines found. It might be best to set the ``random_state`` parameter in :class:`TPOTClassifier` for reproducibility. This randomness is a good thing, because stacking works best when very different base learners are used.

Once the algorithm is finished running, open up ``tpot_1.py`` and you should see something like the following code.::

   import numpy as np

   from sklearn.ensemble import ExtraTreesClassifier
   from sklearn.model_selection import train_test_split
   from sklearn.pipeline import make_pipeline
   from sklearn.preprocessing import Normalizer

   # NOTE: Make sure that the class is labeled 'class' in the data file
   tpot_data = np.recfromcsv('PATH/TO/DATA/FILE', delimiter='COLUMN_SEPARATOR', dtype=np.float64)
   features = np.delete(tpot_data.view(np.float64).reshape(tpot_data.size, -1), tpot_data.dtype.names.index('class'), axis=1)
   training_features, testing_features, training_classes, testing_classes = \
       train_test_split(features, tpot_data['class'], random_state=42)

   exported_pipeline = make_pipeline(
       Normalizer(norm="max"),
       ExtraTreesClassifier(bootstrap=False, criterion="entropy", max_features=0.15, min_samples_leaf=7, min_samples_split=13, n_estimators=100)
   )

   exported_pipeline.fit(training_features, training_classes)
   results = exported_pipeline.predict(testing_features)

You can see that our exported pipeline is in the variable ``exported_pipeline``. This is actually the only part of the code we need to add into Xcessiv.

Adding TPOT Pipelines to Xcessiv
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Create a new base learner setup and copy the following code into Xcessiv.::

   from sklearn.ensemble import ExtraTreesClassifier
   from sklearn.model_selection import train_test_split
   from sklearn.pipeline import make_pipeline
   from sklearn.preprocessing import Normalizer

   base_learner = make_pipeline(
       Normalizer(norm="max"),
       ExtraTreesClassifier(bootstrap=False, criterion="entropy", max_features=0.15, min_samples_leaf=7, min_samples_split=13, n_estimators=100, random_state=8)
   )

This is a stripped down version of the code in ``tpot_1.py``, with only the part we need. Notice two changes: we renamed ``exported_pipeline`` to ``base_learner`` to follow the Xcessiv format, and  set the ``random_state`` parameter in the :class:`sklearn.ensemble.ExtraTreesClassifier` object to 8 for determinism.

Name your base learner "TPOT 1", set ``predict_proba`` as the meta-feature generator, and add the following preset metrics: **Accuracy from Scores/Probabilities**, **Recall from Scores/Probabilities**, **Precision from Scores/Probabilities**, **F1 Score from Scores/Probabilities**, and **AUC from Scores/Probabilities**.

Since the hill-valley dataset is binary, verify and finalize your base learner on the breast cancer dataset.

Keep in mind that the pipeline returned by TPOT has already been tuned, so there isn't much need to tune it now. Feel free to do so, though. It's very easy to do this in Xcessiv. For this case, let's just create a single new base learner with default hyperparameters. You should get a pretty good accuracy of about 0.9868.

As mentioned earlier, different runs of TPOT will probably produce different results. I ran the script two more times, this time with different random seeds set. For a random state of 10, TPOT produced the following pipeline (stripped down to Xcessiv format).::

   from copy import copy
   from sklearn.ensemble import VotingClassifier
   from sklearn.model_selection import train_test_split
   from sklearn.pipeline import make_pipeline, make_union
   from sklearn.preprocessing import FunctionTransformer
   from sklearn.svm import LinearSVC

   base_learner = make_pipeline(
       make_union(VotingClassifier([("est", LinearSVC(C=5.0, loss="hinge", tol=0.0001, random_state=8))]), FunctionTransformer(copy)),
       LinearSVC(C=0.0001, random_state=8, loss="squared_hinge")
   )

This combination of Linear SVCs and a VotingClassifier gets an accuracy of about 0.9612.

For a random state of 242, the following stripped down pipeline is produced.::

   from sklearn.model_selection import train_test_split
   from sklearn.neighbors import KNeighborsClassifier
   from sklearn.pipeline import make_pipeline
   from sklearn.preprocessing import Normalizer

   base_learner = make_pipeline(
       Normalizer(norm="l1"),
       KNeighborsClassifier(n_neighbors=22, p=1)
   )

This pipeline gets an accuracy of 0.9876, our highest so far.

Stacking TPOT Pipelines together
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Once they're in Xcessiv, TPOT pipelines are just regular base learners you can tune or stack. For now, we've got three high-performing base learners with rather different decision models i.e. a tree-based model, a linear SVM, and a nearest neighbors classifier. These should be ideal to stack together.

Create and finalize a preset Logistic Regression base learner. We'll use this to stack the base learners together.

Let's begin by stacking together the two highest performers. the ExtraTreesClassifier and the KNeighborsClassifier without the original features. Right off the bat, cross-validating on the secondary meta-features yields an accuracy of 0.9975.

Going further, let's see if adding the less effective (on its own) Linear SVM will prove useful to our small ensemble. Running it, we get an even better 0.9992 accuracy.

It seems that seeing how the Linear SVM looks at the problem lets our Logistic Regression meta-learner further improve its own understanding of the data.

Quoting top Kaggler Marios Michailidis:

   Sometimes it is useful to allow XGBoost to see what a KNN-classifier sees.

And that's it for our TPOT guide. There's loads more you can try if you want to push up model performance even more. For instance, why not see if a TPOT pipeline as your secondary learner will work better? Or try experimenting with adding the original features appended to the meta-features. Xcessiv is built for this kind of crazy exploration. Go get those accuracies up as high as you can!
