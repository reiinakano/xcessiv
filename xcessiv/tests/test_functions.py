from __future__ import absolute_import, print_function, division, unicode_literals
import unittest
import os
import numpy as np
from xcessiv import functions, exceptions
from sklearn.datasets import load_digits
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
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


class TestVerifyDataset(unittest.TestCase):
    def test_correct_dataset(self):
        X, y = load_digits(return_X_y=True)
        verification_dict = functions.verify_dataset(X, y)
        assert verification_dict['features_shape'] == (1797,64)
        assert verification_dict['labels_shape'] == (1797,)

    def test_invalid_assertions(self):
        self.assertRaises(exceptions.UserError,
                          functions.verify_dataset,
                          [[1, 2, 2], [2, 3, 5]],
                          [1, 2, 3])

        self.assertRaises(exceptions.UserError,
                          functions.verify_dataset,
                          [[1, 2, 2], [2, 3, 5]],
                          [[1, 2, 3]])

        self.assertRaises(exceptions.UserError,
                          functions.verify_dataset,
                          [[[1, 2, 2]], [[2, 3, 5]]],
                          [1, 2, 3])


class TestVerifyEstimatorClass(unittest.TestCase):
    def setUp(self):
        self.source = [
            "from sklearn.metrics import accuracy_score\n",
            "import numpy as np\n",
            "def metric_generator(y_true, y_probas):\n",
            "    argmax = np.argmax(y_probas, axis=1)\n",
            "    return accuracy_score(y_true, argmax)"
        ]
        self.wrong_source = [
            "metric_generator = ''"
        ]

    def test_verify_estimator_class(self):
        np.random.seed(8)
        performance_dict = functions.verify_estimator_class(RandomForestClassifier(),
                                                            'predict_proba',
                                                            dict(Accuracy=self.source))
        assert round(performance_dict['Accuracy'], 3) == 0.953

    def test_estimator_with_decision_function(self):
        np.random.seed(8)
        performance_dict = functions.verify_estimator_class(SVC(decision_function_shape='ovr'),
                                                            'decision_function',
                                                            dict(Accuracy=self.source))
        assert round(performance_dict['Accuracy'], 3) == 0.973

    def test_assertion_of_invalid_metric_generator(self):
        np.random.seed(8)
        self.assertRaises(
            exceptions.UserError,
            functions.verify_estimator_class,
            RandomForestClassifier(),
            'predict_proba',
            dict(Accuracy=self.wrong_source)
        )

    def test_assertion_meta_feature_generator(self):
        np.random.seed(8)
        self.assertRaises(
            exceptions.UserError,
            functions.verify_estimator_class,
            RandomForestClassifier(),
            'decision_function',
            dict(Accuracy=self.source)
        )
