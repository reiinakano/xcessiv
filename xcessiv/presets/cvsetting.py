"""This module contains preset settings for defining cross-validation iterators"""
from __future__ import absolute_import, print_function, division, unicode_literals


__all__ = [
    'k_fold',
    'stratified_k_fold',
    'shuffle_split',
    'stratified_shuffle_split'
]

k_fold = {
    'name': 'K-fold Cross Validation',
    'source':
    """from sklearn.model_selection import KFold

def return_splits_iterable(X, y):
    \"\"\"This function returns an iterable that splits the given dataset
    K times into different train-test splits.
    \"\"\"
    RANDOM_STATE = 8
    N_SPLITS = 5
    SHUFFLE = True

    return KFold(n_splits=N_SPLITS, random_state=RANDOM_STATE, shuffle=SHUFFLE).split(X, y)
"""
}

stratified_k_fold = {
    'name': 'Stratified K-fold Cross Validation',
    'source':
    """from sklearn.model_selection import StratifiedKFold

def return_splits_iterable(X, y):
    \"\"\"This function returns an iterable that splits the given dataset
    K times into different stratified train-test splits.
    \"\"\"
    RANDOM_STATE = 8
    N_SPLITS = 5
    SHUFFLE = True

    return StratifiedKFold(n_splits=N_SPLITS, random_state=RANDOM_STATE, shuffle=SHUFFLE).split(X, y)
"""
}

shuffle_split = {
    'name': 'Shuffle Split',
    'source':
    """from sklearn.model_selection import ShuffleSplit

def return_splits_iterable(X, y):
    \"\"\"This function returns an iterable that splits the given dataset
    randomly into different train-test splits. For applications where you
    only need a single train-test split (large datasets), you can do this
    by setting `n_splits` to 1.
    \"\"\"
    RANDOM_STATE = 8
    N_SPLITS = 1
    TEST_SIZE = 0.25
    TRAIN_SIZE = None

    return ShuffleSplit(n_splits=N_SPLITS, random_state=RANDOM_STATE,
                        test_size=TEST_SIZE, train_size=TRAIN_SIZE).split(X, y)
"""
}

stratified_shuffle_split = {
    'name': 'Stratified Shuffle Split',
    'source':
    """from sklearn.model_selection import StratifiedShuffleSplit

def return_splits_iterable(X, y):
    \"\"\"This function returns an iterable that splits the given dataset
    randomly into different stratified train-test splits. For applications where you
    only need a single train-test split (large datasets), you can do this
    by setting `n_splits` to 1.
    \"\"\"
    RANDOM_STATE = 8
    N_SPLITS = 1
    TEST_SIZE = 0.25
    TRAIN_SIZE = None

    return StratifiedShuffleSplit(n_splits=N_SPLITS, random_state=RANDOM_STATE,
                                  test_size=TEST_SIZE, train_size=TRAIN_SIZE).split(X, y)
"""
}
