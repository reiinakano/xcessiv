"""The functions in this module parse JSON inputs from an Xcessiv notebook"""
from __future__ import absolute_import, print_function,\
    nested_scopes, generators, division, with_statement, unicode_literals
from sklearn.model_selection import train_test_split
from xcessiv.functions import import_object_from_string_code


def return_train_data_from_json(input_json):
    """Returns train data set from input JSON

    Args:
        input_json (dict): "Extraction" dictionary

    Returns:
        X (numpy.ndarray): Features

        y (numpy.ndarray): Labels
    """
    extraction_code = "".join(input_json['main_dataset']["source"])
    extraction_function = import_object_from_string_code(extraction_code,
                                                         "extract_main_dataset")

    X, y = extraction_function()

    if input_json['test_dataset']['method'] == 'split_from_main':
        X, X_test, y, y_test = train_test_split(
            X,
            y,
            test_size=input_json['test_dataset']['split_ratio'],
            random_state=input_json['test_dataset']['split_seed'],
            stratify=y
        )

    if input_json['meta_feature_generation']['method'] == 'holdout_split':
        X, X_test, y, y_test = train_test_split(
            X,
            y,
            test_size=input_json['meta_feature_generation']['split_ratio'],
            random_state=input_json['meta_feature_generation']['seed'],
            stratify=y
        )

    return X, y


def return_test_data_from_json(input_json):
    """Returns test data set from input JSON

    Args:
        input_json (dict): "Extraction" dictionary

    Returns:
        X (numpy.ndarray): Features

        y (numpy.ndarray): Labels
    """
    if input_json['test_dataset']['method'] == 'split_from_main':
        extraction_code = "".join(input_json['main_dataset']["source"])
        extraction_function = import_object_from_string_code(extraction_code,
                                                             "extract_main_dataset")
        X, y = extraction_function()
        X, X_test, y, y_test = train_test_split(
            X,
            y,
            test_size=input_json['test_dataset']['split_ratio'],
            random_state=input_json['test_dataset']['split_seed'],
            stratify=y
        )

        return X_test, y_test

    if input_json['test_dataset']['method'] == 'source':
        extraction_code = "".join(input_json['test_dataset']["source"])
        extraction_function = import_object_from_string_code(extraction_code,
                                                             "extract_test_dataset")
        X_test, y_test = extraction_function()

        return X_test, y_test


def return_holdout_data_from_json(input_json):
    """Returns holdout data set from input JSON

    Args:
        input_json (dict): "Extraction" dictionary

    Returns:
        X (numpy.ndarray): Features

        y (numpy.ndarray): Labels
    """
    if input_json['meta_feature_generation']['method'] == 'holdout_split':
        extraction_code = "".join(input_json['main_dataset']["source"])
        extraction_function = import_object_from_string_code(extraction_code,
                                                             "extract_main_dataset")

        X, y = extraction_function()

        if input_json['test_dataset']['method'] == 'split_from_main':
            X, X_test, y, y_test = train_test_split(
                X,
                y,
                test_size=input_json['test_dataset']['split_ratio'],
                random_state=input_json['test_dataset']['split_seed'],
                stratify=y
            )

        X, X_holdout, y, y_holdout = train_test_split(
            X,
            y,
            test_size=input_json['meta_feature_generation']['split_ratio'],
            random_state=input_json['meta_feature_generation']['seed'],
            stratify=y
        )

        return X_holdout, y_holdout

    if input_json['meta_feature_generation']['method'] == 'holdout_source':
        extraction_code = "".join(input_json['meta_feature_generation']["source"])
        extraction_function = import_object_from_string_code(extraction_code,
                                                             "extract_holdout_dataset")
        X_holdout, y_holdout = extraction_function()

        return X_holdout, y_holdout
