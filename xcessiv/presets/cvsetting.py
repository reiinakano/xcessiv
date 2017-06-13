"""This module contains preset settings for defining cross-validation iterators"""
from __future__ import absolute_import, print_function, division, unicode_literals


__all__ = [
    'k_fold',
    'stratified_k_fold',
    'shuffle_split',
    'stratified_shuffle_split',
    'leave_one_out',
    'leave_p_out',
    'group_k_fold',
    'time_series_split'
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


leave_one_out = {
    'name': 'Leave One Out',
    'source':
    """from sklearn.model_selection import LeaveOneOut

def return_splits_iterable(X, y):
    \"\"\" This function returns an iterable that splits the dataset, where
    train dataset is n-1, leaving only one out to test. 
    \"\"\"

    return LeaveOneOut().split(X, y)
"""
}

leave_p_out = {
    'name': 'Leave P Out',
    'source':
    """from sklearn.model_selection import LeavePOut
    
def return_splits_iterable(X, y):
    \"\"\" This function returns an iterable that splits the dataset, where
    train dataset is n-p, leaving p out to test. 
    \"\"\"
    P=2

    return LeavePOut(p=P).split(X, y)
"""
}

group_k_fold = {
    'name': 'Group K-fold',
    'source':
    """from sklearn.model_selection import GroupKFold

def return_splits_iterable(X, y):
    \"\"\" This function returns a K-fold iterator variant
    with non-overlapping groups. The number of distict groups has to be at least 
    equal to the number of folds
    \"\"\"

    N_SPLITS = 3
    
    GROUPS = None  # You must fill this with your own group labels

    return GroupKFold(n_splits=N_SPLITS).split(X, y, groups=GROUPS)
"""
}

time_series_split = {
    'name': 'Time Series Split',
    'source':
    """from sklearn.model_selection import TimeSeriesSplit

def return_splits_iterable(X, y):
    \"\"\" This function is a variation of Kfold where it splits
    time-series dataset at fixed time intervals.
    \"\"\"

    N_SPLITS = 3

    return TimeSeriesSplit(n_splits=N_SPLITS).split(X, y)
"""
}

