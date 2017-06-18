"""This module contains functions for the automated runs"""
from __future__ import absolute_import, print_function, division, unicode_literals
from rq import get_current_job
from xcessiv import functions
from xcessiv import models
from xcessiv import constants
import numpy as np
import os
import sys
import traceback
from six import iteritems
import numbers
from bayes_opt import BayesianOptimization


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


def start_naive_bayes(automated_run, session, path):
    """Starts naive bayes automated run

    Args:
        automated_run (xcessiv.models.AutomatedRun): Automated run object

        session: Valid SQLAlchemy session

        path (str, unicode): Path to project folder
    """
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


def start_tpot(automated_run, session, path):
    """Starts a TPOT automated run that exports directly to base learner setup

    Args:
        automated_run (xcessiv.models.AutomatedRun): Automated run object

        session: Valid SQLAlchemy session

        path (str, unicode): Path to project folder
    """
    module = functions.import_string_code_as_module(automated_run.source)
    extraction = session.query(models.Extraction).first()
    X, y = extraction.return_train_dataset()

    tpot_learner =  module.tpot_learner

    tpot_learner.fit(X, y)

    temp_filename = os.path.join(path, 'tpot-temp-export-{}'.format(os.getpid()))
    tpot_learner.export(temp_filename)

    with open(temp_filename) as f:
        base_learner_source = f.read()

    base_learner_source = constants.tpot_learner_docstring + base_learner_source

    try:
        os.remove(temp_filename)
    except OSError:
        pass

    blo = models.BaseLearnerOrigin(
        source=base_learner_source,
        name='TPOT Learner',
        meta_feature_generator='predict'
    )

    session.add(blo)
    session.commit()


def eval_stacked_ensemble(stacked_ensemble, session, path):
    """Evaluate stacked ensemble

    Args:
        stacked_ensemble (xcessiv.models.StackedEnsemble)

        session: Valid SQLAlchemy session

        path (str, unicode): Path to project folder

    Returns:
        stacked_ensemble (xcessiv.models.StackedEnsemble)
    """
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
        return stacked_ensemble

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


def start_greedy_ensemble_search(automated_run, session, path):
    """Starts an automated ensemble search using greedy forward model selection.

    The steps for this search are adapted from "Ensemble Selection from Libraries of Models" by
    Caruana.

    1. Start with the empty ensemble

    2. Add to the ensemble the model in the library that maximizes the ensemmble's
    performance on the error metric.

    3. Repeat step 2 for a fixed number of iterations or until all models have been used.

    Args:
        automated_run (xcessiv.models.AutomatedRun): Automated run object

        session: Valid SQLAlchemy session

        path (str, unicode): Path to project folder
    """
    module = functions.import_string_code_as_module(automated_run.source)
    assert module.metric_to_optimize in automated_run.base_learner_origin.metric_generators

    best_ensemble = []  # List containing IDs of best performing ensemble for the last round

    secondary_learner = automated_run.base_learner_origin.return_estimator()
    secondary_learner.set_params(**module.secondary_learner_hyperparameters)

    for i in range(module.max_num_base_learners):
        best_score = -float('inf')  # Best metric for this round (not in total!)
        current_ensemble = best_ensemble[:]  # Shallow copy of best ensemble
        for base_learner in session.query(models.BaseLearner).filter_by(job_status='finished').all():
            if base_learner in current_ensemble:  # Don't append when learner is already in
                continue
            current_ensemble.append(base_learner)

            # Check if our "best ensemble" already exists
            existing_ensemble = session.query(models.StackedEnsemble).\
                filter_by(base_learner_origin_id=automated_run.base_learner_origin.id,
                          secondary_learner_hyperparameters=secondary_learner.get_params(),
                          base_learner_ids=sorted([bl.id for bl in current_ensemble])).first()

            if existing_ensemble and existing_ensemble.job_status == 'finished':
                score = existing_ensemble.individual_score[module.metric_to_optimize]

            elif existing_ensemble and existing_ensemble.job_status != 'finished':
                eval_stacked_ensemble(existing_ensemble, session, path)
                score = existing_ensemble.individual_score[module.metric_to_optimize]

            else:
                stacked_ensemble = models.StackedEnsemble(
                    secondary_learner_hyperparameters=secondary_learner.get_params(),
                    base_learners=current_ensemble,
                    base_learner_origin=automated_run.base_learner_origin,
                    job_status='started'
                )
                session.add(stacked_ensemble)
                session.commit()
                eval_stacked_ensemble(stacked_ensemble, session, path)
                score = stacked_ensemble.individual_score[module.metric_to_optimize]

            score = -score if module.invert_metric else score

            if best_score < score:
                best_score = score
                best_ensemble = current_ensemble[:]

            current_ensemble.pop()
