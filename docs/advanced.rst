Automated Tuning
================

Bayesian Hyperparameter Search
------------------------------

Aside from grid search and random search that were covered in the previous chapter, Xcessiv offers another popular hyperparameter optimization method - `Bayesian optimization <https://en.wikipedia.org/wiki/Hyperparameter_optimization#Bayesian_optimization>`_.

Unlike grid search and random search, where hyperparameters are explored independent of each other, Bayesian optimization records the results of previously explored hyperparameter combinations and uses them to figure out which hyperparameters to try next. Theoretically, this should allow for faster convergence to a local maximum and less time wasted on exploring hyperparameters that are not likely to produce good results.

Keep in mind that there are a few limitations to this method. First, since the hyperparameter combinations to explore are based on previously explored hyperparameters, the Bayesian hyperparameter search cannot take advantage of multiple Xcessiv workers in the same way as Grid Search and Random Search. All hyperparameter combinations are explored by a single worker.

Second, Bayesian optimization can only explore numerical hyperparameters. A hyperparameter that takes only strings (e.g. ``criterion`` in :class:`sklearn.ensemble.RandomForestClassifier`), cannot be tuned with Bayesian optimization. Instead, you must set the value or leave it at default before the search begins.

The Bayesian optimization method used by Xcessiv is implemented through the open-source `BayesianOptimization <https://github.com/fmfn/BayesianOptimization>`_ Python package.

Let's begin.

Suppose you're exploring the hyperparameter space of a scikit-learn Random Forest classifier on some classification data. Your base learner setup will have this code.::

   from sklearn.ensemble import RandomForestClassifier

   base_learner = RandomForestClassifier(random_state=8)

Make sure you also use "Accuracy" as a metric.

You want to use Bayesian optimization to tune the hyperparameters ``max_depth``, ``min_samples_split``, and ``min_samples_leaf``. After verifying and finalizing the base learner, click the **Bayesian Optimization** button and enter the following configuration into the code block and hit Go.::

   random_state = 8  # Random seed

   # Default parameters of base learner
   default_params = {
     'n_estimators': 200,
     'criterion': 'entropy'
   }

   # Min-max bounds of parameters to be searched
   pbounds = {
     'max_depth': (10, 300),
     'min_samples_split': (0.001, 0.5),
     'min_samples_leaf': (0.001, 0.5)
   }

   # List of hyperparameters that should be rounded off to integers
   integers = [
     'max_depth'
   ]

   metric_to_optimize = 'Accuracy'  # metric to optimize

   invert_metric = False  # Whether or not to invert metric e.g. optimizing a loss

   # Configuration to pass to maximize()
   maximize_config = {
     'init_points': 2,
     'n_iter': 10,
     'acq': 'ucb',
     'kappa': 5
   }

If everything goes well, you should see that an "Automated Run" has started. From here, you can just watch as the Base Learners list updates with a new entry every time the Bayesian search explores a new hyperparameter combination.

Let's review the code we used to configure the Bayesian search.

All variables shown need to be defined for Bayesian search.

First, the ``random_state`` parameter is used to seed the Numpy random generator that is used internally by the Bayesian search. You can set this to any integer you like.

Next, define the default parameters of your base learner in the ``default_params`` dictionary. In our case, we don't really want to search ``n_estimators`` or ``criterion`` but we don't want to leave them at their default values either. This dictionary will set ``n_estimators`` to 200 and ``criterion`` to "entropy" for base learners produced by the Bayesian search.

The `pbounds` variable