"""This module contains preset source codes for base learners"""
from __future__ import absolute_import, print_function, division, unicode_literals
___all__ = [
    'sklearn_random_forest_source'
]

sklearn_random_forest_source = \
    """from sklearn.ensemble import RandomForestClassifier

base_learner = RandomForestClassifier(random_state=8)
"""

sklearn_extra_trees_source = \
    """from sklearn.ensemble import ExtraTreesClassifier

base_learner = ExtraTreesClassifier(random_state=8)
"""

sklearn_logistic_regression_source = \
    """from sklearn.linear_model import LogisticRegression

base_learner = LogisticRegression()
"""
