from __future__ import absolute_import, print_function, division, unicode_literals
import unittest
from sklearn.datasets import load_iris, load_boston
from xcessiv import functions
from xcessiv.presets import learnersetting


class TestClassifiers(unittest.TestCase):
    def setUp(self):
        self.X, self.y = load_iris(return_X_y=True)
        self.classifier_settings = [
            'sklearn_random_forest_classifier',
            'sklearn_extra_trees_classifier',
            'sklearn_logistic_regression',
            'sklearn_knn_classifier',
            'sklearn_svm_classifier',
            'sklearn_gaussian_nb',
            'sklearn_adaboost_classifier',
            'xgboost_classifier',
        ]

    def test_learner_settings(self):
        for key in self.classifier_settings:
            setting = getattr(learnersetting, key)
            module = functions.import_string_code_as_module(
                setting['source']
            )

            assert hasattr(module.base_learner, 'get_params')
            assert hasattr(module.base_learner, 'set_params')
            assert hasattr(module.base_learner, 'fit')
            assert hasattr(module.base_learner, setting['meta_feature_generator'])

            module.base_learner.fit(self.X, self.y)

            del module


class TestRegressors(unittest.TestCase):
    def setUp(self):
        self.X, self.y = load_boston(return_X_y=True)
        self.regressor_settings = [
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
        ]

    def test_learner_settings(self):
        for key in self.regressor_settings:
            setting = getattr(learnersetting, key)
            module = functions.import_string_code_as_module(
                setting['source']
            )

            assert hasattr(module.base_learner, 'get_params')
            assert hasattr(module.base_learner, 'set_params')
            assert hasattr(module.base_learner, 'fit')
            assert hasattr(module.base_learner, setting['meta_feature_generator'])

            module.base_learner.fit(self.X, self.y)

            del module


class TestTransformers(unittest.TestCase):
    def setUp(self):
        self.X, self.y = load_boston(return_X_y=True)
        self.transformer_settings = [
            'identity_transformer'
        ]

    def test_learner_settings(self):
        for key in self.transformer_settings:
            setting = getattr(learnersetting, key)
            module = functions.import_string_code_as_module(
                setting['source']
            )

            assert hasattr(module.base_learner, 'get_params')
            assert hasattr(module.base_learner, 'set_params')
            assert hasattr(module.base_learner, 'fit')
            assert hasattr(module.base_learner, setting['meta_feature_generator'])

            module.base_learner.fit(self.X, self.y)

            del module
