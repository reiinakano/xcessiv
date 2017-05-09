"""This module contains preset source codes for base learners"""
from __future__ import absolute_import, print_function, division, unicode_literals
___all__ = [
    'sklearn_random_forest_source'
]

sklearn_random_forest_source = \
    """from sklearn.ensemble import RandomForestClassifier

base_learner = RandomForestClassifier(random_state=8)
"""
