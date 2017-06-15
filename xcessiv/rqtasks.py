"""This module contains RQ jobs"""
from __future__ import absolute_import, print_function, division, unicode_literals
from rq.decorators import job
from rq import get_current_job
from xcessiv import functions
from xcessiv import exceptions
from xcessiv import models
from xcessiv import automatedruns
import numpy as np
import os
import sys
import traceback
from sklearn.model_selection import train_test_split
from six import iteritems


def extraction_data_statistics(path):
    """ Generates data statistics for the given data extraction setup stored
    in Xcessiv notebook.

    This is in rqtasks.py but not as a job yet. Temporarily call this directly
    while I'm figuring out Javascript lel.

    Args:
        path (str, unicode): Path to xcessiv notebook
    """
    with functions.DBContextManager(path) as session:
        extraction = session.query(models.Extraction).first()
        X, y = extraction.return_main_dataset()
        functions.verify_dataset(X, y)

        if extraction.test_dataset['method'] == 'split_from_main':
            X, X_test, y, y_test = train_test_split(
                X,
                y,
                test_size=extraction.test_dataset['split_ratio'],
                random_state=extraction.test_dataset['split_seed'],
                stratify=y
            )
        elif extraction.test_dataset['method'] == 'source':
            if 'source' not in extraction.test_dataset or not extraction.test_dataset['source']:
                raise exceptions.UserError('Source is empty')

            extraction_code = extraction.test_dataset["source"]
            extraction_function = functions.\
                import_object_from_string_code(extraction_code, "extract_test_dataset")
            X_test, y_test = extraction_function()
        else:
            X_test, y_test = None, None

        # test base learner cross-validation
        extraction_code = extraction.meta_feature_generation['source']
        return_splits_iterable = functions.import_object_from_string_code(
            extraction_code,
            'return_splits_iterable'
        )
        number_of_splits = 0
        test_indices = []
        try:
            for train_idx, test_idx in return_splits_iterable(X, y):
                number_of_splits += 1
                test_indices.append(test_idx)
        except Exception as e:
            raise exceptions.UserError('User code exception', exception_message=str(e))

        # preparation before testing stacked ensemble cross-validation
        test_indices = np.concatenate(test_indices)
        X, y = X[test_indices], y[test_indices]

        # test stacked ensemble cross-validation
        extraction_code = extraction.stacked_ensemble_cv['source']
        return_splits_iterable = functions.import_object_from_string_code(
            extraction_code,
            'return_splits_iterable'
        )
        number_of_splits_stacked_cv = 0
        try:
            for train_idx, test_idx in return_splits_iterable(X, y):
                number_of_splits_stacked_cv += 1
        except Exception as e:
            raise exceptions.UserError('User code exception', exception_message=str(e))

        data_stats = dict()
        data_stats['train_data_stats'] = functions.verify_dataset(X, y)
        if X_test is not None:
            data_stats['test_data_stats'] = functions.verify_dataset(X_test, y_test)
        else:
            data_stats['test_data_stats'] = None
        data_stats['holdout_data_stats'] = {'number_of_splits': number_of_splits}
        data_stats['stacked_ensemble_cv_stats'] = {'number_of_splits': number_of_splits_stacked_cv}

        extraction.data_statistics = data_stats

        session.add(extraction)
        session.commit()


@job('default', timeout=86400)
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
            return_splits_iterable = functions.import_object_from_string_code(
                extraction.meta_feature_generation['source'],
                'return_splits_iterable'
            )

            meta_features_list = []
            trues_list = []
            for train_index, test_index in return_splits_iterable(X, y):
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

            for key in base_learner.base_learner_origin.metric_generators:
                metric_generator = functions.import_object_from_string_code(
                    base_learner.base_learner_origin.metric_generators[key],
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


@job('default', timeout=86400)
def start_automated_run(path, automated_run_id):
    """Starts automated run. This will automatically create
    base learners until the run finishes or errors out.

    Args:
        path (str): Path to Xcessiv notebook

        automated_run_id (str): Automated Run ID
    """
    with functions.DBContextManager(path) as session:
        automated_run = session.query(models.AutomatedRun).filter_by(id=automated_run_id).first()
        if not automated_run:
            raise exceptions.UserError('Automated run {} '
                                       'does not exist'.format(automated_run_id))
        automated_run.job_id = get_current_job().id
        automated_run.job_status = 'started'

        session.add(automated_run)
        session.commit()

        try:
            if automated_run.category == 'bayes':
                automatedruns.start_naive_bayes(automated_run, session, path)

            elif automated_run.category == 'tpot':
                automatedruns.start_tpot(automated_run, session, path)

            else:
                raise Exception('Something went wrong. Invalid category for automated run')

        except:
            session.rollback()
            automated_run.job_status = 'errored'
            automated_run.description['error_type'] = repr(sys.exc_info()[0])
            automated_run.description['error_value'] = repr(sys.exc_info()[1])
            automated_run.description['error_traceback'] = \
                traceback.format_exception(*sys.exc_info())
            session.add(automated_run)
            session.commit()
            raise


@job('default', timeout=86400)
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

        try:
            meta_features_list = []
            for base_learner in stacked_ensemble.base_learners:
                mf = np.load(base_learner.meta_features_path(path))
                if len(mf.shape) == 1:
                    mf = mf.reshape(-1, 1)
                meta_features_list.append(mf)

            secondary_features = np.concatenate(meta_features_list, axis=1)

            # Get data
            extraction = session.query(models.Extraction).first()
            return_splits_iterable = functions.import_object_from_string_code(
                extraction.meta_feature_generation['source'],
                'return_splits_iterable'
            )
            X, y = extraction.return_train_dataset()

            #  We need to retrieve original order of meta-features
            indices_list = [test_index for train_index, test_index in return_splits_iterable(X, y)]
            indices = np.concatenate(indices_list)
            X, y = X[indices], y[indices]

            est = stacked_ensemble.return_secondary_learner()

            return_splits_iterable_stacked_ensemble = functions.import_object_from_string_code(
                extraction.stacked_ensemble_cv['source'],
                'return_splits_iterable'
            )
            preds = []
            trues_list = []
            for train_index, test_index in return_splits_iterable_stacked_ensemble(secondary_features, y):
                X_train, X_test = secondary_features[train_index], secondary_features[test_index]
                y_train, y_test = y[train_index], y[test_index]
                est = est.fit(X_train, y_train)
                preds.append(
                    getattr(est, stacked_ensemble.base_learner_origin.
                            meta_feature_generator)(X_test)
                )
                trues_list.append(y_test)
            preds = np.concatenate(preds, axis=0)
            y_true = np.concatenate(trues_list)

            for key in stacked_ensemble.base_learner_origin.metric_generators:
                metric_generator = functions.import_object_from_string_code(
                    stacked_ensemble.base_learner_origin.metric_generators[key],
                    'metric_generator'
                )
                stacked_ensemble.individual_score[key] = metric_generator(y_true, preds)

            stacked_ensemble.job_status = 'finished'
            session.add(stacked_ensemble)
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
