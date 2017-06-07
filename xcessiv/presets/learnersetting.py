"""This module contains preset settings for defining base learners"""
from __future__ import absolute_import, print_function, division, unicode_literals
from xcessiv.presets import learnersource

__all__ = [

    # Classifiers
    'sklearn_random_forest_classifier',
    'sklearn_extra_trees_classifier',
    'sklearn_logistic_regression',
    'sklearn_knn_classifier',
    'sklearn_svm_classifier',
    'sklearn_gaussian_nb',
    'sklearn_adaboost_classifier',
    'xgboost_classifier',

    # Regressors
    'sklearn_random_forest_regressor',
    'sklearn_extra_trees_regressor',
    'sklearn_bagging_regressor',
    'sklearn_GP_regressor',
    'sklearn_ridge_regressor',
    'sklearn_lasso_regressor',
    'sklearn_kernel_ridge_regressor',
    'sklearn_knn_regressor',
    'sklearn_svr_regressor',
    'sklearn_decision_tree_regressor',
    'sklearn_linear_regression',
    'sklearn_adaboost_regressor',
    'xgboost_regressor',

    # Transformers
    'identity_transformer'
]

# Classifiers
sklearn_random_forest_classifier = {
    'name': 'scikit-learn Random Forest Classifier',
    'source': learnersource.sklearn_random_forest_classifier_source,
    'meta_feature_generator': 'predict_proba'
}

sklearn_extra_trees_classifier = {
    'name': 'scikit-learn Extra Trees Classifier',
    'source': learnersource.sklearn_extra_trees_classifier_source,
    'meta_feature_generator': 'predict_proba'
}

sklearn_logistic_regression = {
    'name': 'scikit-learn Logistic Regression',
    'source': learnersource.sklearn_logistic_regression_source,
    'meta_feature_generator': 'predict_proba'
}

sklearn_knn_classifier = {
    'name': 'scikit-learn KNN Classifier',
    'source': learnersource.sklearn_knn_classifier_source,
    'meta_feature_generator': 'predict_proba'
}

sklearn_svm_classifier = {
    'name': 'scikit-learn SVM Classifier',
    'source': learnersource.sklearn_svm_classifier_source,
    'meta_feature_generator': 'decision_function'
}

sklearn_gaussian_nb = {
    'name': 'scikit-learn Gaussian Naive Bayes',
    'source': learnersource.sklearn_gaussian_nb_source,
    'meta_feature_generator': 'predict_proba'
}

sklearn_adaboost_classifier = {
    'name': 'scikit-learn AdaBoost Classifier',
    'source': learnersource.sklearn_adaboost_classifier_source,
    'meta_feature_generator': 'predict_proba'
}

xgboost_classifier = {
    'name': 'XGBoost Classifier',
    'source': learnersource.xgboost_classifier_source,
    'meta_feature_generator': 'predict_proba'
}

# Regressors
sklearn_random_forest_regressor = {
    'name': 'scikit-learn Random Forest Regressor',
    'source': learnersource.sklearn_random_forest_regressor_source,
    'meta_feature_generator': 'predict'
}

sklearn_extra_trees_regressor = {
    'name': 'scikit-learn Extra Trees Regressor',
    'source': learnersource.sklearn_extra_trees_regressor_source,
    'meta_feature_generator': 'predict'
}

sklearn_bagging_regressor = {
    'name': 'scikit-learn Bagging Regressor',
    'source': learnersource.sklearn_bagging_regressor_source,
    'meta_feature_generator': 'predict'
}

sklearn_GP_regressor = {
    'name': 'scikit-learn Gaussian Process Regressor',
    'source': learnersource.sklearn_GP_regressor_source,
    'meta_feature_generator': 'predict'
}

sklearn_ridge_regressor = {
    'name': 'scikit-learn Ridge Regressor',
    'source': learnersource.sklearn_ridge_regressor_source,
    'meta_feature_generator': 'predict'
}

sklearn_lasso_regressor = {
    'name': 'scikit-learn Lasso Regressor',
    'source': learnersource.sklearn_lasso_regressor_source,
    'meta_feature_generator': 'predict'
}

sklearn_kernel_ridge_regressor = {
    'name': 'scikit-learn Kernel Ridge Regressor',
    'source': learnersource.sklearn_kernel_ridge_regressor_source,
    'meta_feature_generator': 'predict'
}

sklearn_knn_regressor = {
    'name': 'scikit-learn K-NN Regressor',
    'source': learnersource.sklearn_knn_regressor_source,
    'meta_feature_generator': 'predict'
}

sklearn_svr_regressor = {
    'name': 'scikit-learn Support Vector Regressor',
    'source': learnersource.sklearn_svr_regressor_source,
    'meta_feature_generator': 'predict'
}

sklearn_decision_tree_regressor = {
    'name': 'scikit-learn Decision Tree Regressor',
    'source': learnersource.sklearn_decision_tree_regressor_source,
    'meta_feature_generator': 'predict'
}

sklearn_linear_regression = {
    'name': 'scikit-learn Linear Regression',
    'source': learnersource.sklearn_linear_regression_source,
    'meta_feature_generator': 'predict'
}

sklearn_adaboost_regressor = {
    'name': 'scikit-learn AdaBoost Regressor',
    'source': learnersource.sklearn_adaboost_regressor_source,
    'meta_feature_generator': 'predict'
}

xgboost_regressor = {
    'name': 'XGBoost Regressor',
    'source': learnersource.xgboost_regressor_source,
    'meta_feature_generator': 'predict'
}


identity_transformer = {
    'name': 'Identity Transformer',
    'source': learnersource.identity_transformer_source,
    'meta_feature_generator': 'transform'
}
