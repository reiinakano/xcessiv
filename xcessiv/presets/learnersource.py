"""This module contains preset source codes for base learners"""
from __future__ import absolute_import, print_function, division, unicode_literals

__all__ = [

    # Classifiers
    'sklearn_random_forest_classifier_source',
    'sklearn_extra_trees_classifier_source',
    'sklearn_logistic_regression_source',
    'sklearn_knn_classifier_source',
    'sklearn_svm_classifier_source',
    'sklearn_gaussian_nb_source',
    'sklearn_adaboost_classifier_source',
    'xgboost_classifier_source',

    # Regressors
    'sklearn_random_forest_regressor_source',
    'sklearn_extra_trees_regressor_source',
    'sklearn_bagging_regressor_source',
    'sklearn_GP_regressor_source',
    'sklearn_ridge_regressor_source',
    'sklearn_lasso_regressor_source',
    'sklearn_kernel_ridge_regressor_source',
    'sklearn_knn_regressor_source',
    'sklearn_svr_regressor_source',
    'sklearn_decision_tree_regressor_source',
    'sklearn_linear_regression_source',
    'sklearn_adaboost_regressor_source',
    'xgboost_regressor_source',

    # Transformers
    'identity_transformer_source'
]

sklearn_random_forest_classifier_source = \
    """from sklearn.ensemble import RandomForestClassifier

base_learner = RandomForestClassifier(random_state=8)
"""

sklearn_extra_trees_classifier_source = \
    """from sklearn.ensemble import ExtraTreesClassifier

base_learner = ExtraTreesClassifier(random_state=8)
"""

sklearn_logistic_regression_source = \
    """from sklearn.linear_model import LogisticRegression

base_learner = LogisticRegression()
"""

sklearn_knn_classifier_source = \
    """from sklearn.neighbors import KNeighborsClassifier

base_learner = KNeighborsClassifier()
"""

sklearn_svm_classifier_source = \
    """from sklearn.svm import SVC

base_learner = SVC(random_state=8)
"""

sklearn_gaussian_nb_source = \
    """from sklearn.naive_bayes import GaussianNB

base_learner = GaussianNB()
"""

sklearn_adaboost_classifier_source = \
    """from sklearn.ensemble import AdaBoostClassifier

base_learner = AdaBoostClassifier(random_state=8)
"""

xgboost_classifier_source = \
    """from xgboost import XGBClassifier

base_learner = XGBClassifier(seed=8)
"""

sklearn_random_forest_regressor_source = \
    """from sklearn.ensemble import RandomForestRegressor

base_learner = RandomForestRegressor(random_state=8)
"""

sklearn_extra_trees_regressor_source = \
    """from sklearn.ensemble import ExtraTreesRegressor

base_learner = ExtraTreesRegressor(random_state=8)
"""

sklearn_bagging_regressor_source = \
    """from sklearn.ensemble import BaggingRegressor

base_learner = BaggingRegressor(random_state=8)
"""

sklearn_GP_regressor_source = \
    """from sklearn.gaussian_process import GaussianProcessRegressor

base_learner = GaussianProcessRegressor(random_state=8)
"""

sklearn_ridge_regressor_source = \
    """from sklearn.linear_model import Ridge

base_learner = Ridge(random_state=8)
"""

sklearn_lasso_regressor_source = \
    """from sklearn.linear_model import Lasso

base_learner = Lasso(random_state=8)
"""

sklearn_kernel_ridge_regressor_source = \
    """from sklearn.kernel_ridge import KernelRidge

base_learner = KernelRidge()
"""

sklearn_knn_regressor_source = \
    """from sklearn.neighbors import KNeighborsRegressor

base_learner = KNeighborsRegressor()
"""

sklearn_svr_regressor_source = \
    """from sklearn.svm import SVR

base_learner = SVR()
"""

sklearn_decision_tree_regressor_source = \
    """from sklearn.tree import DecisionTreeRegressor

base_learner = DecisionTreeRegressor(random_state=8)
"""

sklearn_linear_regression_source = \
    """from sklearn.linear_model import LinearRegression

base_learner = LinearRegression()
"""

sklearn_adaboost_regressor_source = \
    """from sklearn.ensemble import AdaBoostRegressor

base_learner = AdaBoostRegressor(random_state=8)
"""

xgboost_regressor_source = \
    """from xgboost import XGBRegressor

base_learner = XGBRegressor(seed=8)
"""

identity_transformer_source = \
    """from sklearn.preprocessing import FunctionTransformer

base_learner = FunctionTransformer()
"""
