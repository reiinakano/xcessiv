from __future__ import absolute_import, print_function, division, unicode_literals
import imp
import sys
import os
import hashlib
import json
import numpy as np
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from six import exec_, iteritems
from sklearn import datasets
from sklearn import model_selection
from xcessiv import app, exceptions


def hash_file(path, block_size=65536):
    """Returns SHA256 checksum of a file

    Args:
        path (string): Absolute file path of file to hash

        block_size (int, optional): Number of bytes to read per block
    """
    sha256 = hashlib.sha256()
    with open(path, 'rb') as f:
        for block in iter(lambda: f.read(block_size), b''):
            sha256.update(block)
    return sha256.hexdigest()


def hash_string(string):
    """Hashes an input string using SHA256"""
    return hashlib.sha256(string).hexdigest()


def import_object_from_path(path, object):
    """Used to import an object from an absolute path.

    This function takes an absolute path and imports it as a Python module.
    It then returns the object with name `object` from the imported module.

    Args:
        path (string): Absolute file path of .py file to import

        object (string): Name of object to extract from imported module
    """
    with open(path) as f:
        return import_object_from_string_code(f.read(), object)


def import_object_from_string_code(code, object):
    """Used to import an object from arbitrary passed code.

    Passed in code is treated as a module and is imported and added
    to `sys.modules` with its SHA256 hash as key.

    Args:
        code (string): Python code to import as module

        object (string): Name of object to extract from imported module
    """
    sha256 = hashlib.sha256(code.encode('UTF-8')).hexdigest()
    module = imp.new_module(sha256)
    try:
        exec_(code, module.__dict__)
    except Exception as e:
        raise exceptions.UserError('User code exception', exception_message=str(e))
    sys.modules[sha256] = module
    try:
        return getattr(module, object)
    except AttributeError:
        raise exceptions.UserError("{} not found in code".format(object))


def import_string_code_as_module(code):
    """Used to run arbitrary passed code as a module

    Args:
        code (string): Python code to import as module

    Returns:
        module: Python module
    """
    sha256 = hashlib.sha256(code.encode('UTF-8')).hexdigest()
    module = imp.new_module(sha256)
    try:
        exec_(code, module.__dict__)
    except Exception as e:
        raise exceptions.UserError('User code exception', exception_message=str(e))
    sys.modules[sha256] = module
    return module


def verify_dataset(X, y):
    """Verifies if a dataset is valid for use i.e. scikit-learn format

    Used to verify a dataset by returning shape and basic statistics of
    returned data. This will also provide quick and dirty check on
    capability of host machine to process the data.

    Args:
        X (array-like): Features array

        y (array-like): Label array

    Returns:
        X_shape (2-tuple of int): Shape of X returned

        y_shape (1-tuple of int): Shape of y returned

    Raises:
        AssertionError: `X_shape` must be of length 2 and `y_shape` must be of
            length 1. `X` must have the same number of elements as `y`
            i.e. X_shape[0] == y_shape[0]. If any of these conditions are not met,
            an AssertionError is raised.
    """
    X_shape, y_shape = np.array(X).shape, np.array(y).shape
    if len(X_shape) != 2:
        raise exceptions.UserError("X must be 2-dimensional array")
    if len(y_shape) != 1:
        raise exceptions.UserError("y must be 1-dimensional array")
    if X_shape[0] != y_shape[0]:
        raise exceptions.UserError("X must have same number of elements as y")
    return dict(
        features_shape=X_shape,
        labels_shape=y_shape
    )


def is_valid_json(x):
    """Returns true if x can be JSON serialized

    Args:
        x: Object to test
    """
    try:
        json.dumps(x)
        return True
    except TypeError:
        return False


def make_serializable(json):
    """This function ensures that the dictionary is JSON serializable. If not,
    keys with non-serializable values are removed from the return value.

    Args:
        json (dict): Dictionary to convert to serializable

    Returns:
        new_dict (dict): New dictionary with non JSON serializable values removed
    """
    new_dict = dict()
    for key, value in iteritems(json):
        if is_valid_json(value):
            new_dict[key] = value

    return new_dict


def get_sample_dataset(dataset_properties):
    """Returns sample dataset

    Args:
        dataset_properties (dict): Dictionary corresponding to the properties of the dataset
            used to verify the estimator and metric generators.

    Returns:
        X (array-like): Features array

        y (array-like): Labels array

        splits (iterator): This is an iterator that returns train test splits for
            cross-validation purposes on ``X`` and ``y``.
    """
    kwargs = dataset_properties.copy()
    data_type = kwargs.pop('type')
    if data_type == 'multiclass':
        try:
            X, y = datasets.make_classification(random_state=8, **kwargs)
            splits = model_selection.StratifiedKFold(n_splits=2, random_state=8).split(X, y)
        except Exception as e:
            raise exceptions.UserError(repr(e))
    elif data_type == 'iris':
        X, y = datasets.load_iris(return_X_y=True)
        splits = model_selection.StratifiedKFold(n_splits=2, random_state=8).split(X, y)
    elif data_type == 'mnist':
        X, y = datasets.load_digits(return_X_y=True)
        splits = model_selection.StratifiedKFold(n_splits=2, random_state=8).split(X, y)
    elif data_type == 'breast_cancer':
        X, y = datasets.load_breast_cancer(return_X_y=True)
        splits = model_selection.StratifiedKFold(n_splits=2, random_state=8).split(X, y)
    elif data_type == 'boston':
        X, y = datasets.load_boston(return_X_y=True)
        splits = model_selection.KFold(n_splits=2, random_state=8).split(X)
    elif data_type == 'diabetes':
        X, y = datasets.load_diabetes(return_X_y=True)
        splits = model_selection.KFold(n_splits=2, random_state=8).split(X)
    else:
        raise exceptions.UserError('Unknown dataset type {}'.format(dataset_properties['type']))
    return X, y, splits


def verify_estimator_class(est, meta_feature_generator, metric_generators, dataset_properties):
    """Verify if estimator object is valid for use i.e. scikit-learn format

    Verifies if an estimator is fit for use by testing for existence of methods
    such as `get_params` and `set_params`. Must also be able to properly fit on
    and predict a sample iris dataset.

    Args:
        est: Estimator object with `fit`, `predict`/`predict_proba`,
            `get_params`, and `set_params` methods.

        meta_feature_generator (str, unicode): Name of the method used by the estimator
            to generate meta-features on a set of data.

        metric_generators (dict): Dictionary of key value pairs where the key
            signifies the name of the metric calculated and the value is a list
            of strings, when concatenated, form Python code containing the
            function used to calculate the metric from true values and the
            meta-features generated.

        dataset_properties (dict): Dictionary corresponding to the properties of the dataset
            used to verify the estimator and metric generators.

    Returns:
        performance_dict (mapping): Mapping from performance metric
            name to performance metric value e.g. "Accuracy": 0.963

        hyperparameters (mapping): Mapping from the estimator's hyperparameters to
            their default values e.g. "n_estimators": 10
    """
    X, y, splits = get_sample_dataset(dataset_properties)

    if not hasattr(est, "get_params"):
        raise exceptions.UserError('Estimator does not have get_params method')
    if not hasattr(est, "set_params"):
        raise exceptions.UserError('Estimator does not have set_params method')
    if not hasattr(est, meta_feature_generator):
        raise exceptions.UserError('Estimator does not have meta-feature generator'
                                   ' {}'.format(meta_feature_generator))

    performance_dict = dict()

    true_labels = []
    preds = []

    try:
        for train_index, test_index in splits:
            X_train, X_test = X[train_index], X[test_index]
            y_train, y_test = y[train_index], y[test_index]
            est.fit(X_train, y_train)
            true_labels.append(y_test)
            preds.append(getattr(est, meta_feature_generator)(X_test))
        true_labels = np.concatenate(true_labels)
        preds = np.concatenate(preds, axis=0)
    except Exception as e:
        raise exceptions.UserError(repr(e))

    if preds.shape[0] != true_labels.shape[0]:
        raise exceptions.UserError('Estimator\'s meta-feature generator '
                                   'does not produce valid shape')

    for key in metric_generators:
        metric_generator = import_object_from_string_code(
            metric_generators[key],
            'metric_generator'
        )
        try:
            performance_dict[key] = metric_generator(true_labels, preds)
        except Exception as e:
            raise exceptions.UserError(repr(e))

    return performance_dict, make_serializable(est.get_params())


def get_path_from_query_string(req):
    """Gets path from query string

    Args:
        req (flask.request): Request object from Flask

    Returns:
        path (str): Value of "path" parameter from query string

    Raises:
        exceptions.UserError: If "path" is not found in query string
    """
    if req.args.get('path') is None:
        raise exceptions.UserError('Path not found in query string')
    return req.args.get('path')


class DBContextManager():
    """Use this context manager to automatically start and close a database session

    Examples:
        >>> with DBContextManager('ProjectFolder') as session:
        >>>     # Do stuff with session
    """
    def __init__(self, path):
        """Initialize context manager

        Args:
            path (str, unicode): Path to project folder
        """
        self.path = os.path.join(path, app.config['XCESSIV_NOTEBOOK_NAME'])

    def __enter__(self):
        if not os.path.exists(self.path):
            raise exceptions.UserError('{} does not exist'.format(self.path))
        sqlite_url = 'sqlite:///{}'.format(self.path)
        engine = create_engine(sqlite_url)

        self.session = Session(bind=engine)

        return self.session

    def __exit__(self, exc_type, exc_val, exc_tb):
        if hasattr(self, 'session'):
            if exc_type is not None:
                self.session.rollback()
            self.session.close()
        return False  # re-raise any exception
