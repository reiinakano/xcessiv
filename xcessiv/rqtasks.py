"""This module contains RQ jobs"""
from rq.decorators import job
from rq import get_current_job
from xcessiv import redis_conn
from xcessiv import functions
from xcessiv import exceptions
from xcessiv import models
from xcessiv import app
import numpy as np
import os
import sys
import traceback
from sklearn.metrics import accuracy_score


@job('default', connection=redis_conn, timeout=86400)
def generate_meta_features(path, base_learner_id):
    """Generates meta-features for specified base learner

    After generation of meta-features, the file is saved into the meta-features folder

    Args:
        path (str): Path to Xcessiv notebook

        base_learner_id (str): Base learner ID
    """
    with functions.DBContextManager(path) as session:
        base_learner = session.query(models.BaseLearner).filter_by(id=base_learner_id).first()
        if not base_learner:
            raise exceptions.UserError('Base learner {} '
                                       'does not exist'.format(base_learner_id))

        base_learner.job_status['job_id'] = get_current_job().id
        base_learner.job_status['status'] = 'started'

        session.add(base_learner)
        session.commit()

        try:
            est = base_learner.return_estimator()
            extraction = session.query(models.Extraction).first()
            X_train, y_train = extraction.return_train_dataset()

            if extraction.meta_feature_generation['method'] == 'cv':
                raise Exception('not yet!')

            else:
                X_holdout, y_holdout = extraction.return_holdout_dataset()
                est = est.fit(X_train, y_train)
                meta_features = getattr(est, base_learner.base_learner_origin.
                                        meta_feature_generator)(X_holdout)
                preds = est.predict(X_holdout)
                acc = accuracy_score(y_holdout, preds)

            meta_features_path = os.path.join(
                os.path.dirname(path),
                app.config['XCESSIV_META_FEATURES_FOLDER'],
                str(base_learner.id)
            )

            if not os.path.exists(os.path.dirname(meta_features_path)):
                os.makedirs(os.path.dirname(meta_features_path))

            np.savetxt(meta_features_path, meta_features)
            base_learner.job_status['status'] = 'finished'
            base_learner.individual_score = dict(accuracy=acc)
            base_learner.meta_features_location = meta_features_path
            session.add(base_learner)
            session.commit()

        except:
            session.rollback()
            base_learner.job_status['status'] = 'errored'
            base_learner.job_status['error_type'] = repr(sys.exc_info()[0])
            base_learner.job_status['error_value'] = repr(sys.exc_info()[1])
            base_learner.job_status['error_traceback'] = \
                traceback.format_exception(*sys.exc_info())
            session.add(base_learner)
            session.commit()
            raise
