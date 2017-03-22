from __future__ import absolute_import, print_function, division, unicode_literals
import imp
import sys
import json
import os
import hashlib
import numpy as np
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from six import exec_
from sklearn.datasets import load_iris
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import accuracy_score
from xcessiv import exceptions


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
    sha256 = hashlib.sha256(code).hexdigest()
    module = imp.new_module(sha256)
    exec_(code, module.__dict__)
    sys.modules[sha256] = module
    try:
        return getattr(module, object)
    except AttributeError:
        raise exceptions.UserError("{} not found in code".format(object))


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


def verify_estimator_class(est):
    """Verify if estimator object is valid for use i.e. scikit-learn format

    Verifies if an estimator is fit for use by testing for existence of methods
    such as `get_params` and `set_params`. Must also be able to properly fit on
    and predict a sample iris dataset.

    Args:
        est: Estimator object with `fit`, `predict`/`predict_proba`,
            `get_params`, and `set_params` methods.

    Returns:
        performance_dict (mapping): Mapping from performance metric
            name to performance metric value e.g. "Accuracy": 0.963
    """
    X, y = load_iris(return_X_y=True)

    if not hasattr(est, "get_params"):
        raise exceptions.UserError('Estimator does not have get_params method')
    if not hasattr(est, "set_params"):
        raise exceptions.UserError('Estimator does not have set_params method')

    performance_dict = dict()
    performance_dict['has_predict_proba'] = hasattr(est, 'predict_proba')
    performance_dict['has_decision_function'] = hasattr(est, 'decision_function')

    true_labels = []
    preds = []
    for train_index, test_index in StratifiedKFold().split(X, y):
        X_train, X_test = X[train_index], X[test_index]
        y_train, y_test = y[train_index], y[test_index]
        est.fit(X_train, y_train)
        true_labels.append(y_test)
        preds.append(est.predict(X_test))
    true_labels = np.concatenate(true_labels)
    preds = np.concatenate(preds)
    performance_dict['Accuracy'] = accuracy_score(true_labels, preds)

    return performance_dict


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
        >>> with DBContextManager('myproject.xcnb') as session:
        >>>     # Do stuff with session
    """
    def __init__(self, path):
        """Initialize context manager

        Args:
            path (str): Path to sqlite xcnb notebook
        """
        self.path = path

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
