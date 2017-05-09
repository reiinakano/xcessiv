"""This module contains preset settings for defining base learners"""
from __future__ import absolute_import, print_function, division, unicode_literals
from xcessiv.presets import learnersource


sklearn_random_forest = {
    'name': 'scikit-learn Random Forest',
    'source': learnersource.sklearn_random_forest_source,
    'meta_feature_generator': 'predict_proba'
}