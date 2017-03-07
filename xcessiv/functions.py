from __future__ import absolute_import, print_function,\
    nested_scopes, generators, division, with_statement, unicode_literals
import imp
import os


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


if __name__ == '__main__':
    filepath = os.path.join(os.path.dirname(os.path.dirname(__file__)),
                            '_experimental/extractmaindataset.py')
    my_func = import_object_from_path(
        filepath,
        "extract_main_dataset"
    )
    print(my_func())
