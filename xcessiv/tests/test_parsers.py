from __future__ import absolute_import, print_function,\
    nested_scopes, generators, division, with_statement, unicode_literals
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

    def test_split_main_for_blend(self):
        self.extraction_input['meta_feature_generation']['method'] = 'blend_split'
        self.extraction_input['meta_feature_generation']['split_ratio'] = 0.1
        X, y = parsers.return_train_data_from_json(self.extraction_input)
        assert X.shape == (1617, 64)
        assert y.shape == (1617,)

    def test_split_main_for_test_and_blend(self):
        self.extraction_input['test_dataset']['method'] = 'split_from_main'
        self.extraction_input['test_dataset']['split_ratio'] = 0.1
        self.extraction_input['test_dataset']['split_seed'] = 8
        self.extraction_input['meta_feature_generation']['method'] = 'blend_split'
        self.extraction_input['meta_feature_generation']['split_ratio'] = 0.1
        X, y = parsers.return_train_data_from_json(self.extraction_input)
        assert X.shape == (1455, 64)
        assert y.shape == (1455,)
