"""This module contains preset settings for defining metric generators"""
from __future__ import absolute_import, print_function, division, unicode_literals


__all__ = [
    'accuracy_from_scores',
    'accuracy_from_preds',
    'recall_from_scores',
    'recall_from_preds',
    'precision_from_scores',
    'precision_from_preds',
    'f1_score_from_scores',
    'f1_score_from_preds'
]


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
""",
    'selection_name': 'Accuracy from Scores/Probabilities'
}

accuracy_from_preds = {
    'name': 'Accuracy',
    'source':
    """from sklearn.metrics import accuracy_score

def metric_generator(y_true, y_preds):
    \"\"\"This function computes the accuracy given the true labels array (y_true)
    and the predicted labels array (y_preds).
    \"\"\"
    return accuracy_score(y_true, y_preds)
""",
    'selection_name': 'Accuracy from Predictions'
}

recall_from_scores = {
    'name': 'Recall',
    'source':
    """from sklearn.metrics import recall_score
import numpy as np

def metric_generator(y_true, y_probas):
    \"\"\"This function computes the recall given the true labels array (y_true)
    and the scores/probabilities array (y_probas) with shape (num_samples, num_classes).
    For the function to work correctly, the columns of the probabilities array must
    correspond to a sorted set of the unique values present in y_true. If there are more than
    two classes, micro-averaging is used by default.
    \"\"\"
    classes_ = np.unique(y_true)
    if len(classes_) != np.array(y_probas).shape[1]:
        raise ValueError('The shape of y_probas does not correspond to the number of unique values in y_true')
    argmax = np.argmax(y_probas, axis=1)
    y_preds = classes_[argmax]
    if np.array(y_probas).shape[1] > 2:
        score = recall_score(y_true, y_preds, average='micro')
    else:
        score = recall_score(y_true, y_preds)
    return score
""",
    'selection_name': 'Recall from Scores/Probabilities'
}


recall_from_preds = {
    'name': 'Recall',
    'source':
    """from sklearn.metrics import recall_score
import numpy as np

def metric_generator(y_true, y_preds):
    \"\"\"This function computes the recall given the true labels array (y_true)
    and the predicted labels array (y_preds).
    \"\"\"
    classes_ = np.unique(y_true)
    if len(classes_) > 2:
        score = recall_score(y_true, y_preds, average='micro')
    else:
        score = recall_score(y_true, y_preds)
    return score
""",
    'selection_name': 'Recall from Predictions'
}

precision_from_scores = {
    'name': 'Precision',
    'source':
    """from sklearn.metrics import precision_score
import numpy as np

def metric_generator(y_true, y_probas):
    \"\"\"This function computes the precision given the true labels array (y_true)
    and the scores/probabilities array (y_probas) with shape (num_samples, num_classes).
    For the function to work correctly, the columns of the probabilities array must
    correspond to a sorted set of the unique values present in y_true. If there are more than
    two classes, micro-averaging is used by default.
    \"\"\"
    classes_ = np.unique(y_true)
    if len(classes_) != np.array(y_probas).shape[1]:
        raise ValueError('The shape of y_probas does not correspond to the number of unique values in y_true')
    argmax = np.argmax(y_probas, axis=1)
    y_preds = classes_[argmax]
    if np.array(y_probas).shape[1] > 2:
        score = precision_score(y_true, y_preds, average='micro')
    else:
        score = precision_score(y_true, y_preds)
    return score
""",
    'selection_name': 'Precision from Scores/Probabilities'
}


precision_from_preds = {
    'name': 'Precision',
    'source':
    """from sklearn.metrics import precision_score
import numpy as np

def metric_generator(y_true, y_preds):
    \"\"\"This function computes the precision given the true labels array (y_true)
    and the predicted labels array (y_preds).
    \"\"\"
    classes_ = np.unique(y_true)
    if len(classes_) > 2:
        score = precision_score(y_true, y_preds, average='micro')
    else:
        score = precision_score(y_true, y_preds)
    return score
""",
    'selection_name': 'Precision from Predictions'
}

f1_score_from_scores = {
    'name': 'F1 Score',
    'source':
    """from sklearn.metrics import f1_score
import numpy as np

def metric_generator(y_true, y_probas):
    \"\"\"This function computes the F1 score given the true labels array (y_true)
    and the scores/probabilities array (y_probas) with shape (num_samples, num_classes).
    For the function to work correctly, the columns of the probabilities array must
    correspond to a sorted set of the unique values present in y_true. If there are more than
    two classes, micro-averaging is used by default.
    \"\"\"
    classes_ = np.unique(y_true)
    if len(classes_) != np.array(y_probas).shape[1]:
        raise ValueError('The shape of y_probas does not correspond to the number of unique values in y_true')
    argmax = np.argmax(y_probas, axis=1)
    y_preds = classes_[argmax]
    if np.array(y_probas).shape[1] > 2:
        score = f1_score(y_true, y_preds, average='micro')
    else:
        score = f1_score(y_true, y_preds)
    return score
""",
    'selection_name': 'F1 Score from Scores/Probabilities'
}


f1_score_from_preds = {
    'name': 'F1 Score',
    'source':
    """from sklearn.metrics import f1_score
import numpy as np

def metric_generator(y_true, y_preds):
    \"\"\"This function computes the F1 score given the true labels array (y_true)
    and the predicted labels array (y_preds).
    \"\"\"
    classes_ = np.unique(y_true)
    if len(classes_) > 2:
        score = f1_score(y_true, y_preds, average='micro')
    else:
        score = f1_score(y_true, y_preds)
    return score
""",
    'selection_name': 'F1 Score from Predictions'
}
