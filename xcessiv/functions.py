from __future__ import absolute_import, print_function,\
    nested_scopes, generators, division, with_statement, unicode_literals
import imp
import sys
import os
import hashlib
import numpy as np
from six import exec_


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
    return getattr(module, object)


def verify_main_dataset_extraction_function(function):
    """Verify main dataset extraction function

    Used to verify main dataset extraction function by returning shape and basic
    statistics of returned data. This will also provide quick and dirty check
    on capability of host machine to process the data

    Args:
        function (callable): Main dataset extraction function to test

    Returns:
        X_shape (2-tuple of int): Shape of X returned

        y_shape (1-tuple of int): Shape of y returned

    Raises:
        AssertionError: `X_shape` must be of length 2 and `y_shape` must be of
            length 1. `X` must have the same number of elements as `y`
            i.e. X_shape[0] == y_shape[0]. If any of these conditions are not met,
            an AssertionError is raised.
    """
    X, y = function()
    X_shape, y_shape = np.array(X).shape, np.array(y).shape
    assert len(X_shape) == 2
    assert len(y_shape) == 1
    assert X_shape[0] == y_shape[0]
    return X_shape, y_shape


if __name__ == '__main__':
    filepath = os.path.join(os.path.dirname(__file__),
                            'tests/extractmaindataset.py')
    rf_filepath = os.path.join(os.path.dirname(__file__),
                               'tests/myrf.py')
    print(verify_main_dataset_extraction_function(
        import_object_from_path(filepath,'extract_main_dataset')
    ))
    print(hash_file(filepath))

    extraction_func = import_object_from_path(filepath,'extract_main_dataset')
    rf_class = import_object_from_path(rf_filepath, 'MyClassifier')
    X, y = extraction_func()
    a = rf_class().fit(X, y)
    print(a.score(X, y))
    print(rf_class, extraction_func)

    my_code = """from sklearn.datasets import load_digits
def extract_main_dataset():
    X, y = load_digits(return_X_y=True)
    return X, y"""
    func = import_object_from_string_code(my_code, 'extract_main_dataset')
    print(func)
    import pickle
    pickle.loads(pickle.dumps(func))
