from __future__ import absolute_import, print_function,\
    nested_scopes, generators, division, with_statement, unicode_literals
import unittest
import os
from xcessiv import functions
from sklearn.datasets import load_digits
import pickle


filepath = os.path.join(os.path.dirname(__file__),
                        'extractmaindataset.py')


class TestHashFile(unittest.TestCase):
    def test_hash_file(self):
        assert functions.hash_file(filepath) == "8f562f857f8b13d7e2b1f2ac59d2fc" \
                                                "7603ba47db1cacef1d16ed7730102af5a7"

        assert functions.hash_file(filepath) == functions.hash_file(filepath, 2)


class TestImportObjectFromPath(unittest.TestCase):
    def test_import_object_from_path(self):
        returned_object = functions.import_object_from_path(filepath,
                                                            "extract_main_dataset")
        assert callable(returned_object)

        pickle.loads(pickle.dumps(returned_object))  # make sure pickle works


class TestImportObjectFromStringCode(unittest.TestCase):
    def test_import_object_from_string_code(self):
        with open(filepath) as f:
            returned_object = functions.\
                import_object_from_string_code(f.read(), "extract_main_dataset")

        assert callable(returned_object)

        pickle.loads(pickle.dumps(returned_object))  # make sure pickle works


class TestVerifyMainDatasetExtraction(unittest.TestCase):
    def test_correct_dataset(self):
        def extract_main_dataset():
            X, y = load_digits(return_X_y=True)
            return X, y
        X_shape, y_shape = functions.verify_dataset_extraction_function(
            extract_main_dataset
        )
        assert X_shape == (1797,64)
        assert y_shape == (1797,)

    def test_invalid_assertions(self):
        def extract_wrong_dataset():
            return [[1, 2, 2], [2, 3, 5]], [1, 2, 3]
        self.assertRaises(AssertionError,
                          functions.verify_dataset_extraction_function,
                          extract_wrong_dataset)

        def extract_wrong_dataset():
            return [[1, 2, 2], [2, 3, 5]], [[1, 2, 3]]
        self.assertRaises(AssertionError,
                          functions.verify_dataset_extraction_function,
                          extract_wrong_dataset)

        def extract_wrong_dataset():
            return [[[1, 2, 2]], [[2, 3, 5]]], [1, 2, 3]
        self.assertRaises(AssertionError,
                          functions.verify_dataset_extraction_function,
                          extract_wrong_dataset)
