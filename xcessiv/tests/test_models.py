from __future__ import absolute_import, print_function, division, unicode_literals
import unittest
from xcessiv import models
from sklearn.ensemble import RandomForestClassifier


class TestReturnTrainDataFromJSON(unittest.TestCase):
    def setUp(self):
        self.extraction = models.Extraction()
        self.extraction.main_dataset['source'] = ''.join([
            "from sklearn.datasets import load_digits\n",
            "\n",
            "\n",
            "def extract_main_dataset():\n",
            "    X, y = load_digits(return_X_y=True)\n",
            "    return X, y"
        ])

    def test_main_is_train(self):
        X, y = self.extraction.return_train_dataset()
        assert X.shape == (1797, 64)
        assert y.shape == (1797,)

    def test_split_main_for_test(self):
        self.extraction.test_dataset['method'] = 'split_from_main'
        self.extraction.test_dataset['split_ratio'] = 0.1
        self.extraction.test_dataset['split_seed'] = 8
        X, y = self.extraction.return_train_dataset()
        assert X.shape == (1617, 64)
        assert y.shape == (1617,)

    def test_split_main_for_holdout(self):
        self.extraction.meta_feature_generation['method'] = 'holdout_split'
        self.extraction.meta_feature_generation['split_ratio'] = 0.1
        X, y = self.extraction.return_train_dataset()
        assert X.shape == (1617, 64)
        assert y.shape == (1617,)

    def test_split_main_for_test_and_holdout(self):
        self.extraction.test_dataset['method'] = 'split_from_main'
        self.extraction.test_dataset['split_ratio'] = 0.1
        self.extraction.test_dataset['split_seed'] = 8
        self.extraction.meta_feature_generation['method'] = 'holdout_split'
        self.extraction.meta_feature_generation['split_ratio'] = 0.1
        X, y = self.extraction.return_train_dataset()
        assert X.shape == (1455, 64)
        assert y.shape == (1455,)


class TestReturnTestDataFromJSON(unittest.TestCase):
    def setUp(self):
        self.extraction = models.Extraction()
        self.extraction.main_dataset['source'] = ''.join([
            "from sklearn.datasets import load_digits\n",
            "\n",
            "\n",
            "def extract_main_dataset():\n",
            "    X, y = load_digits(return_X_y=True)\n",
            "    return X, y"
        ])
        self.extraction.test_dataset['method'] = 'split_from_main'
        self.extraction.test_dataset['split_ratio'] = 0.1
        self.extraction.test_dataset['split_seed'] = 8

    def test_split_main_for_test(self):
        X, y = self.extraction.return_test_dataset()
        assert X.shape == (180, 64)
        assert y.shape == (180,)

    def test_test_dataset_from_source(self):
        self.extraction.test_dataset["method"] = "source"
        self.extraction.test_dataset["source"] = ''.join([
            "from sklearn.datasets import load_digits\n",
            "def extract_test_dataset():\n",
            "    X, y = load_digits(return_X_y=True)\n",
            "    return X, y"
        ])
        X, y = self.extraction.return_test_dataset()
        assert X.shape == (1797, 64)
        assert y.shape == (1797,)


class TestReturnHoldoutDataFromJSON(unittest.TestCase):
    def setUp(self):
        self.extraction = models.Extraction()
        self.extraction.main_dataset['source'] = ''.join([
            "from sklearn.datasets import load_digits\n",
            "\n",
            "\n",
            "def extract_main_dataset():\n",
            "    X, y = load_digits(return_X_y=True)\n",
            "    return X, y"
        ])
        self.extraction.meta_feature_generation['method'] = 'holdout_split'
        self.extraction.meta_feature_generation['seed'] = 8
        self.extraction.meta_feature_generation['split_ratio'] = 0.1

    def test_split_train_for_holdout(self):
        X, y = self.extraction.return_holdout_dataset()
        assert X.shape == (180, 64)
        assert y.shape == (180,)

    def test_split_train_for_holdout_with_split_test(self):
        self.extraction.test_dataset['method'] = 'split_from_main'
        self.extraction.test_dataset['split_ratio'] = 0.1
        self.extraction.test_dataset['split_seed'] = 8
        X, y = self.extraction.return_holdout_dataset()
        assert X.shape == (162, 64)
        assert y.shape == (162,)

    def test_holdout_dataset_from_source(self):
        self.extraction.meta_feature_generation["method"] = "holdout_source"
        self.extraction.meta_feature_generation["source"] = ''.join([
            "from sklearn.datasets import load_digits\n",
            "def extract_holdout_dataset():\n",
            "    X, y = load_digits(return_X_y=True)\n",
            "    return X, y"
        ])
        X, y = self.extraction.return_holdout_dataset()
        assert X.shape == (1797, 64)
        assert y.shape == (1797,)


class TestReturnEstimator(unittest.TestCase):
    def setUp(self):
        self.base_learner_origin = models.BaseLearnerOrigin(
            source=''.join([
                "from sklearn.ensemble import RandomForestClassifier\n",
                "base_learner = RandomForestClassifier(random_state=8)"
            ])
        )

    def test_return_estimator_from_json(self):
        est = self.base_learner_origin.return_estimator()
        assert isinstance(est, RandomForestClassifier)
