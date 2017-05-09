"""This module contains preset settings for defining metric generators"""
from __future__ import absolute_import, print_function, division, unicode_literals


accuracy_from_scores = {
    'name': 'Accuracy',
    'source':
    """from sklearn.metrics import accuracy_score
import numpy as np

def metric_generator(y_true, y_probas):
    \"\"\"This function computes the accuracy given the true labels array (y_true)
    and the scores/probabilities array (y_probas) with shape (num_samples, num_classes).
    For the function to work correctly, the columns of the probabilities array must
    correspond to a sorted set of the unique values present in y_true.
    \"\"\"
    classes_ = np.unique(y_true)
    if len(classes_) != y_probas.shape[1]:
        raise ValueError('The shape of y_probas does not correspond to the number of unique values in y_true')
    argmax = np.argmax(y_probas, axis=1)
    y_preds = classes_[argmax]
    return accuracy_score(y_true, y_preds)
"""
}
