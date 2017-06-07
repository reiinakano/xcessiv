from sklearn.pipeline import _BasePipeline
import numpy as np


class XcessivStackedEnsemble(_BasePipeline):
    """Contains the class for the Xcessiv stacked ensemble"""
    def __init__(self, base_learners, meta_feature_generators,
                 secondary_learner, cv_function):
        super(XcessivStackedEnsemble, self).__init__()

        self.base_learners = base_learners
        self.meta_feature_generators = meta_feature_generators
        self.secondary_learner = secondary_learner
        self.cv_function = cv_function
        self._named_learners = [('bl{}'.format(idx), base_learner) for idx, base_learner
                               in enumerate(base_learners)]
        self._named_learners.append(('secondary-learner', secondary_learner))

    def get_params(self, deep=True):
        """Get parameters for this estimator.

        Args:

        deep (boolean, optional): If True, will return the parameters for this estimator and
            contained subobjects that are estimators.

        Returns
        params: mapping of string to any Parameter names mapped to their values.
        """
        return self._get_params('_named_learners', deep=deep)

    def set_params(self, **params):
        """Set the parameters of this estimator."""
        self._set_params('_named_learners', **params)
        return self

    def fit(self, X, y):
        print('Fitting {} base learners'.format(len(self.base_learners)))

        all_learner_meta_features = []
        for idx, base_learner in enumerate(self.base_learners):

            single_learner_meta_features = []
            test_indices = []
            for num, (train_idx, test_idx) in enumerate(self.cv_function(X, y)):
                print('Fold {} of base learner {}'.format(num+1, idx+1))

                base_learner.fit(X[train_idx], y[train_idx])

                preds = getattr(base_learner, self.meta_feature_generators[idx])(X[test_idx])

                if len(preds.shape) == 1:
                    preds = preds.reshape(-1, 1)

                single_learner_meta_features.append(
                    preds
                )

                test_indices.append(test_idx)

            single_learner_meta_features = np.concatenate(single_learner_meta_features)
            all_learner_meta_features.append(single_learner_meta_features)

        all_learner_meta_features = np.concatenate(all_learner_meta_features, axis=1)
        test_indices = np.concatenate(test_indices)  # reorganized order due to CV

        print('Fitting meta-learner')

        self.secondary_learner.fit(all_learner_meta_features, y[test_indices])

        return self

    def _process_using_meta_feature_generator(self, X, meta_feature_generator):
        """Process using secondary learner meta-feature generator

        Since secondary learner meta-feature generator can be anything e.g. predict, predict_proba,
        this internal method gives the ability to use any string. Just make sure secondary learner
        has the method.

        Args:
            X (array-like): Features array

            meta_feature_generator (str, unicode): Method for use by secondary learner
        """

        all_learner_meta_features = []
        for idx, base_learner in enumerate(self.base_learners):
            single_learner_meta_features = getattr(base_learner,
                                                   self.meta_feature_generators[idx])(X)

            if len(single_learner_meta_features.shape) == 1:
                single_learner_meta_features = single_learner_meta_features.reshape(-1, 1)
            all_learner_meta_features.append(single_learner_meta_features)

        all_learner_meta_features = np.concatenate(all_learner_meta_features, axis=1)

        out = getattr(self.secondary_learner, meta_feature_generator)(all_learner_meta_features)

        return out
