from __future__ import absolute_import, print_function, division, unicode_literals
import unittest
import os
import numpy as np
from xcessiv import functions, exceptions
from sklearn.datasets import load_digits
from sklearn.ensemble import RandomForestClassifier
from sklearn.decomposition import PCA
from sklearn.pipeline import Pipeline
import pickle


filepath = os.path.join(os.path.dirname(__file__),
                        'extractmaindataset.py')


class TestHashFile(unittest.TestCase):
    def test_hash_file(self):
        assert functions.hash_file(filepath) == "1c67f8f573b69a9da2f986e1006ff63a" \
                                                "10fbb70298af45d0293e490b65b34edc"

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


class TestImportStringCodeAsModule(unittest.TestCase):
    def test_import_string_code_as_module(self):
        with open(filepath) as f:
            module = functions.\
                import_string_code_as_module(f.read())

        assert callable(module.extract_main_dataset)
        assert module.dummy_variable == 2

        pickle.loads(pickle.dumps(module.extract_main_dataset))  # make sure pickle works


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


class TestIsValidJSON(unittest.TestCase):
    def test_is_valid_json(self):
        assert functions.is_valid_json({'x': ['i am serializable', 0.1]})
        assert not functions.is_valid_json({'x': RandomForestClassifier()})


class TestMakeSerializable(unittest.TestCase):
    def test_make_serializable(self):
        assert functions.is_valid_json({'x': ['i am serializable', 0.1]})
        assert not functions.is_valid_json({'x': RandomForestClassifier()})
        assert functions.make_serializable(
            {
                'x': ['i am serializable', 0.1],
                'y': RandomForestClassifier()
            }
        ) == {'x': ['i am serializable', 0.1]}


class GetSampleDataset(unittest.TestCase):
    def setUp(self):
        self.dataset_properties = {
            'type': 'multiclass',
        }

    def test_classification_dataset(self):
        X, y, split = functions.get_sample_dataset(self.dataset_properties)
        assert X.shape == (100, 20)
        assert y.shape == (100,)
        assert len(np.unique(y)) == 2

        self.dataset_properties['n_classes'] = 4
        self.dataset_properties['n_informative'] = 18
        X, y, split = functions.get_sample_dataset(self.dataset_properties)
        assert X.shape == (100, 20)
        assert y.shape == (100,)
        assert len(np.unique(y)) == 4

        self.dataset_properties['n_features'] = 100
        X, y, split = functions.get_sample_dataset(self.dataset_properties)
        assert X.shape == (100, 100)
        assert y.shape == (100,)
        assert len(np.unique(y)) == 4

        self.dataset_properties['n_samples'] = 24
        X, y, split = functions.get_sample_dataset(self.dataset_properties)
        assert X.shape == (24, 100)
        assert y.shape == (24,)
        assert len(np.unique(y)) == 4

    def test_iris_dataset(self):
        X, y, split = functions.get_sample_dataset({'type': 'iris'})
        assert X.shape == (150, 4)
        assert y.shape == (150,)

    def test_mnist_dataset(self):
        X, y, split = functions.get_sample_dataset({'type': 'mnist'})
        assert X.shape == (1797, 64)
        assert y.shape == (1797,)

    def test_breast_cancer_dataset(self):
        X, y, split = functions.get_sample_dataset({'type': 'breast_cancer'})
        assert X.shape == (569, 30)
        assert y.shape == (569,)

    def test_boston_housing(self):
        X, y, split = functions.get_sample_dataset({'type': 'boston'})
        assert X.shape == (506, 13)
        assert y.shape == (506,)

    def test_diabetes(self):
        X, y, split = functions.get_sample_dataset({'type': 'diabetes'})
        assert X.shape == (442, 10)
        assert y.shape == (442,)


class TestVerifyEstimatorClass(unittest.TestCase):
    def setUp(self):
        self.source = ''.join([
            "from sklearn.metrics import accuracy_score\n",
            "import numpy as np\n",
            "def metric_generator(y_true, y_probas):\n",
            "    argmax = np.argmax(y_probas, axis=1)\n",
            "    return accuracy_score(y_true, argmax)"
        ])
        self.wrong_source = "metric_generator = ''"
        self.dataset_properties = {
            'type': 'multiclass',
        }

    def test_verify_estimator_class(self):
        np.random.seed(8)
        performance_dict, hyperparameters = functions.verify_estimator_class(
            RandomForestClassifier(),
            'predict_proba',
            dict(Accuracy=self.source),
            self.dataset_properties
        )
        assert round(performance_dict['Accuracy'], 3) == 0.8
        assert hyperparameters == {
            'warm_start': False,
            'oob_score': False,
            'n_jobs': 1,
            'verbose': 0,
            'max_leaf_nodes': None,
            'bootstrap': True,
            'min_samples_leaf': 1,
            'n_estimators': 10,
            'min_samples_split': 2,
            'min_weight_fraction_leaf': 0.0,
            'criterion': 'gini',
            'random_state': None,
            'min_impurity_split': 1e-07,
            'max_features': 'auto',
            'max_depth': None,
            'class_weight': None
        }

    def test_non_serializable_parameters(self):
        pipeline = Pipeline((('pca', PCA()), ('rf', RandomForestClassifier())))
        performance_dict, hyperparameters = functions.verify_estimator_class(
            pipeline,
            'predict_proba',
            dict(Accuracy=self.source),
            self.dataset_properties
        )
        assert functions.is_valid_json(hyperparameters)

    def test_assertion_of_invalid_metric_generator(self):
        np.random.seed(8)
        self.assertRaises(
            exceptions.UserError,
            functions.verify_estimator_class,
            RandomForestClassifier(),
            'predict_proba',
            dict(Accuracy=self.wrong_source),
            self.dataset_properties
        )

    def test_assertion_meta_feature_generator(self):
        np.random.seed(8)
        self.assertRaises(
            exceptions.UserError,
            functions.verify_estimator_class,
            RandomForestClassifier(),
            'decision_function',
            dict(Accuracy=self.source),
            self.dataset_properties
        )
