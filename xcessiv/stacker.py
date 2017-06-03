from __future__ import absolute_import, print_function, division, unicode_literals
from sklearn.pipeline import _BasePipeline


class XcessivStackedEnsemble(_BasePipeline):
    """Contains the class for the Xcessiv stacked ensemble"""
    def __init__(self, base_learners, secondary_learner, cv_function, append_original):
        super(XcessivStackedEnsemble, self).__init__()

        self.base_learners = base_learners
        self.secondary_learner = secondary_learner
        self.cv_function = cv_function
        self.append_original = append_original
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
