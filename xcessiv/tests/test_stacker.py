from __future__ import absolute_import, print_function, division, unicode_literals
import unittest
import numpy as np
from xcessiv import stacker
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, train_test_split
from sklearn.datasets import load_iris
from sklearn.metrics import accuracy_score


class TestStacker(unittest.TestCase):
    def setUp(self):
        bl1 = RandomForestClassifier(random_state=8)
        bl2 = LogisticRegression()
        bl3 = RandomForestClassifier(max_depth=10, random_state=10)

        meta_est = LogisticRegression()

        skf = StratifiedKFold(random_state=8).split

        self.stacked_ensemble = stacker.XcessivStackedEnsemble(
            [bl1, bl2, bl3],
            ['predict', 'predict_proba', 'predict_proba'],
            meta_est,
            skf
        )

    def test_fit_and_process_using_meta_feature_generator(self):
        X, y = load_iris(return_X_y=True)
        X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=8)

        self.stacked_ensemble.fit(X_train, y_train)

        preds = self.stacked_ensemble._process_using_meta_feature_generator(X_test, 'predict')
        assert np.round(accuracy_score(y_test, preds), 3) == 0.868

        probas = self.stacked_ensemble._process_using_meta_feature_generator(X_test, 'predict_proba')
        preds = np.argmax(probas, axis=1)
        assert np.round(accuracy_score(y_test, preds), 3) == 0.868

    def test_get_params(self):
        self.stacked_ensemble.get_params()

    def test_set_params(self):
        self.stacked_ensemble.set_params(bl0__random_state=20)
        assert self.stacked_ensemble.get_params()['bl0__random_state'] == 20
        assert self.stacked_ensemble.get_params()['bl0'].get_params()['random_state'] == 20

        self.stacked_ensemble.set_params(**{'secondary-learner__C': 1.5})
        assert self.stacked_ensemble.get_params()['secondary-learner__C'] == 1.5
        assert self.stacked_ensemble.get_params()['secondary-learner'].get_params()['C'] == 1.5
