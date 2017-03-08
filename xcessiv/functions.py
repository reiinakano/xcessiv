from __future__ import absolute_import, print_function,\
    nested_scopes, generators, division, with_statement, unicode_literals
import imp
import os
import hashlib
import numpy as np


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
    module = imp.load_source('', path)
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
    filepath = os.path.join(os.path.dirname(os.path.dirname(__file__)),
                            '_experimental/extractmaindataset.py')
    print(verify_main_dataset_extraction_function(
        import_object_from_path(filepath,'extract_main_dataset')
    ))
    print(hash_file(filepath))
