from __future__ import absolute_import, print_function, division, unicode_literals
import unittest
import numpy as np
from sklearn.datasets import load_iris, load_breast_cancer, load_boston
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.model_selection import cross_val_predict
from xcessiv import functions
from xcessiv.presets import metricsetting


clf = LogisticRegression(random_state=8)

multiclass_X, multiclass_y = load_iris(return_X_y=True)
multiclass_preds = cross_val_predict(clf, multiclass_X, multiclass_y, method='predict')
multiclass_probas = cross_val_predict(clf, multiclass_X, multiclass_y, method='predict_proba')

binary_X, binary_y = load_breast_cancer(return_X_y=True)
binary_preds = cross_val_predict(clf, binary_X, binary_y, method='predict')
binary_probas = cross_val_predict(clf, binary_X, binary_y, method='predict_proba')

regression_X, regression_y = load_boston(return_X_y=True)
reg = LinearRegression()
regression_preds = cross_val_predict(reg, regression_X, regression_y, method='predict')


class TestAccuracyFromScores(unittest.TestCase):
    def test_source(self):
        module = functions.import_string_code_as_module(metricsetting.accuracy_from_scores['source'])

        assert np.round(module.metric_generator(binary_y, binary_probas), 2) == 0.95
        assert np.round(module.metric_generator(multiclass_y, multiclass_probas), 2) == 0.95

        del module


class TestAccuracyFromPreds(unittest.TestCase):
    def test_source(self):
        module = functions.import_string_code_as_module(metricsetting.accuracy_from_preds['source'])

        assert np.round(module.metric_generator(binary_y, binary_preds), 2) == 0.95
        assert np.round(module.metric_generator(multiclass_y, multiclass_preds), 2) == 0.95

        del module


class TestRecallFromScores(unittest.TestCase):
    def test_source(self):
        module = functions.import_string_code_as_module(metricsetting.recall_from_scores['source'])

        assert np.round(module.metric_generator(binary_y, binary_probas), 2) == 0.97
        assert np.round(module.metric_generator(multiclass_y, multiclass_probas), 2) == 0.95

        del module


class TestRecallFromPreds(unittest.TestCase):
    def test_source(self):
        module = functions.import_string_code_as_module(metricsetting.recall_from_preds['source'])

        assert np.round(module.metric_generator(binary_y, binary_preds), 2) == 0.97
        assert np.round(module.metric_generator(multiclass_y, multiclass_preds), 2) == 0.95

        del module
