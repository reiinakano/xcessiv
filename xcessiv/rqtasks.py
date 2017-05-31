"""This module contains RQ jobs"""
from rq.decorators import job
from rq import get_current_job
from xcessiv import functions
from xcessiv import exceptions
from xcessiv import models
import numpy as np
import os
import sys
import traceback
from sklearn.model_selection import train_test_split
from six import iteritems
import numbers
from bayes_opt import BayesianOptimization


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


def return_func_to_optimize(path, session, base_learner_origin, default_params,
                            metric_to_optimize, invert_metric, integers):
    """Creates the function to be optimized by Bayes Optimization.

    The function automatically handles the case of already existing base learners, and if
    no base learner for the hyperparameters exists yet, creates one and updates it in the
    usual way.

    Args:
        path (str): Path to Xcessiv notebook

        session: Database session passed down

        base_learner_origin: BaseLearnerOrigin object

        default_params (dict): Dictionary containing default params of estimator

        metric_to_optimize (str, unicode): String containing name of metric to optimize

        invert_metric (bool): Specifies whether metric should be inverted e.g. losses

        integers (set): Set of strings that specify which hyperparameters are integers

    Returns:
        func_to_optimize (function): Function to be optimized
    """
    def func_to_optimize(**params):
        base_estimator = base_learner_origin.return_estimator()
        base_estimator.set_params(**default_params)
        # For integer hyperparameters, make sure they are rounded off
        params = dict((key, val) if key not in integers else (key, int(val))
                      for key, val in iteritems(params))
        base_estimator.set_params(**params)
        hyperparameters = functions.make_serializable(base_estimator.get_params())

        # Look if base learner already exists
        base_learner = session.query(models.BaseLearner).\
            filter_by(base_learner_origin_id=base_learner_origin.id,
                      hyperparameters=hyperparameters).first()

        calculate_only = False

        # If base learner exists and has finished, just return its result
        if base_learner and base_learner.job_status == 'finished':
            if invert_metric:
                return -base_learner.individual_score[metric_to_optimize]
            else:
                return base_learner.individual_score[metric_to_optimize]

        # else if base learner exists but is unfinished, just calculate the result without storing
        elif base_learner and base_learner.job_status != 'finished':
            calculate_only = True

        # else if base learner does not exist, create it
        else:
            base_learner = models.BaseLearner(hyperparameters,
                                              'started',
                                              base_learner_origin)
            base_learner.job_id = get_current_job().id
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

            # Only do this if you want to save things
            if not calculate_only:
                meta_features_path = base_learner.meta_features_path(path)

                if not os.path.exists(os.path.dirname(meta_features_path)):
                    os.makedirs(os.path.dirname(meta_features_path))

                np.save(meta_features_path, meta_features, allow_pickle=False)
                base_learner.job_status = 'finished'
                base_learner.meta_features_exists = True
                session.add(base_learner)
                session.commit()

            if invert_metric:
                return -base_learner.individual_score[metric_to_optimize]
            else:
                return base_learner.individual_score[metric_to_optimize]

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
    return func_to_optimize


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
            module = functions.import_string_code_as_module(automated_run.source)
            random_state = 8 if not hasattr(module, 'random_state') else module.random_state
            assert module.metric_to_optimize in automated_run.base_learner_origin.metric_generators

            # get non-searchable parameters
            base_estimator = automated_run.base_learner_origin.return_estimator()
            base_estimator.set_params(**module.default_params)
            default_params = functions.make_serializable(base_estimator.get_params())
            non_searchable_params = dict((key, val) for key, val in iteritems(default_params)
                                         if key not in module.pbounds)

            # get already calculated base learners in search space
            existing_base_learners = []
            for base_learner in automated_run.base_learner_origin.base_learners:
                if not base_learner.job_status == 'finished':
                    continue
                in_search_space = True
                for key, val in iteritems(non_searchable_params):
                    if base_learner.hyperparameters[key] != val:
                        in_search_space = False
                        break  # If no match, move on to the next base learner
                if in_search_space:
                    existing_base_learners.append(base_learner)

            # build initialize dictionary
            target = []
            initialization_dict = dict((key, list()) for key in module.pbounds.keys())
            for base_learner in existing_base_learners:
                # check if base learner's searchable hyperparameters are all numerical
                all_numerical = True
                for key in module.pbounds.keys():
                    if not isinstance(base_learner.hyperparameters[key], numbers.Number):
                        all_numerical = False
                        break
                if not all_numerical:
                    continue  # if there is a non-numerical hyperparameter, skip this.

                for key in module.pbounds.keys():
                    initialization_dict[key].append(base_learner.hyperparameters[key])
                target.append(base_learner.individual_score[module.metric_to_optimize])
            initialization_dict['target'] = target if not module.invert_metric \
                else list(map(lambda x: -x, target))
            print('{} existing in initialization dictionary'.
                  format(len(initialization_dict['target'])))

            # Create function to be optimized
            func_to_optimize = return_func_to_optimize(
                path, session, automated_run.base_learner_origin, module.default_params,
                module.metric_to_optimize, module.invert_metric, set(module.integers)
            )

            # Create Bayes object
            bo = BayesianOptimization(func_to_optimize, module.pbounds)

            bo.initialize(initialization_dict)

            np.random.seed(random_state)

            bo.maximize(**module.maximize_config)

            automated_run.job_status = 'finished'
            session.add(automated_run)
            session.commit()

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

            if stacked_ensemble.append_original:
                secondary_features = np.concatenate((secondary_features, X), axis=1)

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
