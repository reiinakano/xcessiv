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


class TestPrecisionFromScores(unittest.TestCase):
    def test_source(self):
        module = functions.import_string_code_as_module(metricsetting.precision_from_scores['source'])

        assert np.round(module.metric_generator(binary_y, binary_probas), 2) == 0.95
        assert np.round(module.metric_generator(multiclass_y, multiclass_probas), 2) == 0.95

        del module


class TestPrecisionFromPreds(unittest.TestCase):
    def test_source(self):
        module = functions.import_string_code_as_module(metricsetting.precision_from_preds['source'])

        assert np.round(module.metric_generator(binary_y, binary_preds), 2) == 0.95
        assert np.round(module.metric_generator(multiclass_y, multiclass_preds), 2) == 0.95

        del module


class TestF1ScoreFromScores(unittest.TestCase):
    def test_source(self):
        module = functions.import_string_code_as_module(metricsetting.f1_score_from_scores['source'])

        assert np.round(module.metric_generator(binary_y, binary_probas), 2) == 0.96
        assert np.round(module.metric_generator(multiclass_y, multiclass_probas), 2) == 0.95

        del module


class TestF1ScoreFromPreds(unittest.TestCase):
    def test_source(self):
        module = functions.import_string_code_as_module(metricsetting.f1_score_from_preds['source'])

        assert np.round(module.metric_generator(binary_y, binary_preds), 2) == 0.96
        assert np.round(module.metric_generator(multiclass_y, multiclass_preds), 2) == 0.95

        del module


class TestROCAUCFromScores(unittest.TestCase):
    def test_source(self):
        module = functions.import_string_code_as_module(
            metricsetting.roc_auc_score_from_scores['source']
        )

        assert np.round(module.metric_generator(binary_y, binary_probas), 2) == 0.99
        assert np.round(module.metric_generator(multiclass_y, multiclass_probas), 2) == 0.99

        del module


class TestMAE(unittest.TestCase):
    def test_source(self):
        module = functions.import_string_code_as_module(metricsetting.mae['source'])

        assert np.round(module.metric_generator(regression_y, regression_preds), 2) == 6.99

        del module


class TestMSE(unittest.TestCase):
    def test_source(self):
        module = functions.import_string_code_as_module(metricsetting.mse['source'])

        assert np.round(module.metric_generator(regression_y, regression_preds), 2) == 168.09

        del module


class TestMedianAbsoluteError(unittest.TestCase):
    def test_source(self):
        module = functions.import_string_code_as_module(metricsetting.median_absolute_error['source'])

        assert np.round(module.metric_generator(regression_y, regression_preds), 2) == 3.72

        del module


class TestR2Score(unittest.TestCase):
    def test_source(self):
        module = functions.import_string_code_as_module(metricsetting.r2_score['source'])

        assert np.round(module.metric_generator(regression_y, regression_preds), 2) == -0.99

        del module


class TestExplainedVarianceScore(unittest.TestCase):
    def test_source(self):
        module = functions.import_string_code_as_module(metricsetting.explained_variance_score['source'])

        assert np.round(module.metric_generator(regression_y, regression_preds), 2) == -0.89

        del module
