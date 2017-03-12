from __future__ import absolute_import, print_function, division, unicode_literals
import unittest
from xcessiv import parsers


class TestReturnTrainDataFromJSON(unittest.TestCase):
    def setUp(self):
        self.extraction_input = {
            "main_dataset": {
                "source":
                    [
                        "from sklearn.datasets import load_digits\n",
                        "\n",
                        "\n",
                        "def extract_main_dataset():\n",
                        "    X, y = load_digits(return_X_y=True)\n",
                        "    return X, y"
                    ]
            },
            "test_dataset": {
                "method": None
            },
            "meta_feature_generation": {
                "method": "cv",
                "seed": 8,
                "folds": 5
            }
        }

    def test_main_is_train(self):
        X, y = parsers.return_train_data_from_json(self.extraction_input)
        assert X.shape == (1797, 64)
        assert y.shape == (1797,)

    def test_split_main_for_test(self):
        self.extraction_input['test_dataset']['method'] = 'split_from_main'
        self.extraction_input['test_dataset']['split_ratio'] = 0.1
        self.extraction_input['test_dataset']['split_seed'] = 8
        X, y = parsers.return_train_data_from_json(self.extraction_input)
        assert X.shape == (1617, 64)
        assert y.shape == (1617,)

    def test_split_main_for_holdout(self):
        self.extraction_input['meta_feature_generation']['method'] = 'holdout_split'
        self.extraction_input['meta_feature_generation']['split_ratio'] = 0.1
        X, y = parsers.return_train_data_from_json(self.extraction_input)
        assert X.shape == (1617, 64)
        assert y.shape == (1617,)

    def test_split_main_for_test_and_holdout(self):
        self.extraction_input['test_dataset']['method'] = 'split_from_main'
        self.extraction_input['test_dataset']['split_ratio'] = 0.1
        self.extraction_input['test_dataset']['split_seed'] = 8
        self.extraction_input['meta_feature_generation']['method'] = 'holdout_split'
        self.extraction_input['meta_feature_generation']['split_ratio'] = 0.1
        X, y = parsers.return_train_data_from_json(self.extraction_input)
        assert X.shape == (1455, 64)
        assert y.shape == (1455,)


class TestReturnTestDataFromJSON(unittest.TestCase):
    def setUp(self):
        self.extraction_input = {
            "main_dataset": {
                "source":
                    [
                        "from sklearn.datasets import load_digits\n",
                        "\n",
                        "\n",
                        "def extract_main_dataset():\n",
                        "    X, y = load_digits(return_X_y=True)\n",
                        "    return X, y"
                    ]
            },
            "test_dataset": {
                "method": "split_from_main",
                "split_ratio": 0.1,
                "split_seed": 8
            },
            "meta_feature_generation": {
                "method": "cv",
                "seed": 8,
                "folds": 5
            }
        }

    def test_split_main_for_test(self):
        X, y = parsers.return_test_data_from_json(self.extraction_input)
        assert X.shape == (180, 64)
        assert y.shape == (180,)

    def test_test_dataset_from_source(self):
        self.extraction_input["test_dataset"]["method"] = "source"
        self.extraction_input["test_dataset"]["source"] = [
            "from sklearn.datasets import load_digits\n",
            "def extract_test_dataset():\n",
            "    X, y = load_digits(return_X_y=True)\n",
            "    return X, y"
        ]
        X, y = parsers.return_test_data_from_json(self.extraction_input)
        assert X.shape == (1797, 64)
        assert y.shape == (1797,)


class TestReturnHoldoutDataFromJSON(unittest.TestCase):
    def setUp(self):
        self.extraction_input = {
            "main_dataset": {
                "source":
                    [
                        "from sklearn.datasets import load_digits\n",
                        "\n",
                        "\n",
                        "def extract_main_dataset():\n",
                        "    X, y = load_digits(return_X_y=True)\n",
                        "    return X, y"
                    ]
            },
            "test_dataset": {
                "method": None
            },
            "meta_feature_generation": {
                "method": "holdout_split",
                "seed": 8,
                "split_ratio": 0.1
            }
        }

    def test_split_train_for_holdout(self):
        X, y = parsers.return_holdout_data_from_json(self.extraction_input)
        assert X.shape == (180, 64)
        assert y.shape == (180,)

    def test_split_train_for_holdout_with_split_test(self):
        self.extraction_input['test_dataset']['method'] = 'split_from_main'
        self.extraction_input['test_dataset']['split_ratio'] = 0.1
        self.extraction_input['test_dataset']['split_seed'] = 8
        X, y = parsers.return_holdout_data_from_json(self.extraction_input)
        assert X.shape == (162, 64)
        assert y.shape == (162,)

    def test_holdout_dataset_from_source(self):
        self.extraction_input["meta_feature_generation"]["method"] = "holdout_source"
        self.extraction_input["meta_feature_generation"]["source"] = [
            "from sklearn.datasets import load_digits\n",
            "def extract_holdout_dataset():\n",
            "    X, y = load_digits(return_X_y=True)\n",
            "    return X, y"
        ]
        X, y = parsers.return_holdout_data_from_json(self.extraction_input)
        assert X.shape == (1797, 64)
        assert y.shape == (1797,)
