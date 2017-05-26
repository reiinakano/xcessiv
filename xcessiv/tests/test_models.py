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
