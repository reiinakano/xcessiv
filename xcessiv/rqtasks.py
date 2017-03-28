"""This module contains RQ jobs"""
from rq.decorators import job
from rq import get_current_job
from xcessiv import redis_conn
from xcessiv import functions
from xcessiv import exceptions
from xcessiv import models
import numpy as np
import os
import sys
import traceback
from sklearn.metrics import accuracy_score
from sklearn.model_selection import StratifiedKFold


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

        base_learner.job_id = get_current_job().id
        base_learner.job_status = 'started'

        session.add(base_learner)
        session.commit()

        try:
            est = base_learner.return_estimator()
            extraction = session.query(models.Extraction).first()
            X, y = extraction.return_train_dataset()

            if extraction.meta_feature_generation['method'] == 'cv':
                cv = StratifiedKFold(
                    n_splits=extraction.meta_feature_generation['folds'],
                    shuffle=True,
                    random_state=extraction.meta_feature_generation['seed']
                )
                meta_features_list = []
                trues_list = []
                for train_index, test_index in cv.split(X, y):
                    X_train, X_test = X[train_index], X[test_index]
                    y_train, y_test = y[train_index], y[test_index]
                    est = est.fit(X_train, y_train)
                    meta_features_list.append(
                        getattr(est, base_learner.base_learner_origin.
                                meta_feature_generator)(X_test)
                    )
                    trues_list.append(y_test)
                meta_features = np.concatenate(meta_features_list, axis=0)
                y_true = np.concatenate(trues_list)

            else:
                X_holdout, y_holdout = extraction.return_holdout_dataset()
                est = est.fit(X, y)
                meta_features = getattr(est, base_learner.base_learner_origin.
                                        meta_feature_generator)(X_holdout)
                y_true = y_holdout

            for key in base_learner.base_learner_origin.metric_generators:
                metric_generator = functions.import_object_from_string_code(
                    ''.join(base_learner.base_learner_origin.metric_generators[key]),
                    'metric_generator'
                )
                base_learner.individual_score[key] = metric_generator(y_true, meta_features)

            meta_features_path = base_learner.meta_features_path(path)

            if not os.path.exists(os.path.dirname(meta_features_path)):
                os.makedirs(os.path.dirname(meta_features_path))

            np.save(meta_features_path, meta_features, allow_pickle=False)
            base_learner.job_status = 'finished'
            base_learner.meta_features_exists = True
            session.add(base_learner)
            session.commit()

        except:
            session.rollback()
            base_learner.job_status = 'errored'
            base_learner.description['error_type'] = repr(sys.exc_info()[0])
            base_learner.description['error_value'] = repr(sys.exc_info()[1])
            base_learner.description['error_traceback'] = \
                traceback.format_exception(*sys.exc_info())
            session.add(base_learner)
            session.commit()
            raise


@job('default', connection=redis_conn, timeout=86400)
def evaluate_stacked_ensemble(path, ensemble_id):
    """Evaluates the ensemble and updates the database when finished/

    Args:
        path (str): Path to Xcessiv notebook

        ensemble_id (str): Ensemble ID
    """
    with functions.DBContextManager(path) as session:
        stacked_ensemble = session.query(models.StackedEnsemble).filter_by(
            id=ensemble_id).first()
        if not stacked_ensemble:
            raise exceptions.UserError('Stacked ensemble {} '
                                       'does not exist'.format(ensemble_id))

        stacked_ensemble.job_id = get_current_job().id
        stacked_ensemble.job_status = 'started'

        session.add(stacked_ensemble)
        session.commit()

        for base_learner in stacked_ensemble.base_learners:
            base_learner.meta_features_location

        try:
            est = stacked_ensemble.return_secondary_learner()
            extraction = session.query(models.Extraction).first()
            X, y = extraction.return_train_dataset()

            if extraction.meta_feature_generation['method'] == 'cv':
                cv = StratifiedKFold(
                    n_splits=extraction.meta_feature_generation['folds'],
                    shuffle=True,
                    random_state=extraction.meta_feature_generation['seed']
                )
                meta_features_list = []
                trues_list = []
                for train_index, test_index in cv.split(X, y):
                    X_train, X_test = X[train_index], X[test_index]
                    y_train, y_test = y[train_index], y[test_index]
                    est = est.fit(X_train, y_train)
                    meta_features_list.append(
                        getattr(est, base_learner.base_learner_origin.
                                meta_feature_generator)(X_test)
                    )
                    trues_list.append(y_test)
                meta_features = np.concatenate(meta_features_list, axis=0)
                y_true = np.concatenate(trues_list)

            else:
                X_holdout, y_holdout = extraction.return_holdout_dataset()
                est = est.fit(X, y)
                meta_features = getattr(est, base_learner.base_learner_origin.
                                        meta_feature_generator)(X_holdout)
                y_true = y_holdout

            for key in base_learner.base_learner_origin.metric_generators:
                metric_generator = functions.import_object_from_string_code(
                    ''.join(base_learner.base_learner_origin.metric_generators[key]),
                    'metric_generator'
                )
                base_learner.individual_score[key] = metric_generator(y_true, meta_features)

            meta_features_path = base_learner.meta_features_path(path)

            if not os.path.exists(os.path.dirname(meta_features_path)):
                os.makedirs(os.path.dirname(meta_features_path))

            np.save(meta_features_path, meta_features, allow_pickle=False)
            base_learner.job_status = 'finished'
            base_learner.meta_features_location = meta_features_path
            session.add(base_learner)
            session.commit()

        except:
            session.rollback()
            stacked_ensemble.job_status = 'errored'
            stacked_ensemble.description['error_type'] = repr(sys.exc_info()[0])
            stacked_ensemble.description['error_value'] = repr(sys.exc_info()[1])
            stacked_ensemble.description['error_traceback'] = \
                traceback.format_exception(*sys.exc_info())
            session.add(stacked_ensemble)
            session.commit()
            raise
