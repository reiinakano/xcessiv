from __future__ import absolute_import, print_function, division, unicode_literals
import os
from flask import request, jsonify, send_from_directory, g
from redis import Redis
from rq import Connection
from sqlalchemy import create_engine
from sklearn.model_selection import ParameterGrid
from sklearn.model_selection import ParameterSampler
from xcessiv import app, functions, exceptions, models, rqtasks
from xcessiv.presets import learnersetting, metricsetting
import six


@app.errorhandler(exceptions.UserError)
def handle_user_error(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response


def get_redis_connection():
    redis_conn = getattr(g, '_redis_connection', None)
    if redis_conn is None:
        redis_conn = (Redis(app.config['REDIS_HOST'],
                            app.config['REDIS_PORT'],
                            app.config['REDIS_DB']))
        g._redis_connection = redis_conn
    return redis_conn


@app.route('/', defaults={'path': 'index.html'})
@app.route('/<path:path>')
def home(path):
    return send_from_directory(
        os.path.join(
            os.path.dirname(os.path.abspath(__file__)),
            'ui/build',
            os.path.split(path)[0]
        ),
        os.path.split(path)[1]
    )


@app.route('/folders/', methods=['GET'])
def get_current_files():
    cwd = os.getcwd()
    return jsonify([os.path.join(cwd, d) for d in os.listdir(cwd)
                    if os.path.isdir(os.path.join(cwd, d))])


@app.route('/ensemble/', methods=['POST'])
def create_new_ensemble():
    req_body = request.get_json()
    ensemble_name = req_body['ensemble_name']

    if os.path.exists(ensemble_name):
        return jsonify(message="File/folder already exists"), 400

    os.makedirs(ensemble_name)
    xcessiv_notebook_path = os.path.join(ensemble_name, app.config['XCESSIV_NOTEBOOK_NAME'])
    sqlite_url = 'sqlite:///{}'.format(xcessiv_notebook_path)
    engine = create_engine(sqlite_url)

    models.Base.metadata.create_all(engine)

    # Initialize
    extraction = models.Extraction()
    with functions.DBContextManager(ensemble_name) as session:
        session.add(extraction)
        session.commit()

    return jsonify(message="Xcessiv notebook created")


@app.route('/ensemble/extraction/main-dataset/', methods=['GET', 'PATCH'])
def extraction_main_dataset():
    path = functions.get_path_from_query_string(request)

    if request.method == 'GET':
        with functions.DBContextManager(path) as session:
            extraction = session.query(models.Extraction).first()
            return jsonify(extraction.main_dataset)

    if request.method == 'PATCH':
        req_body = request.get_json()
        with functions.DBContextManager(path) as session:
            extraction = session.query(models.Extraction).first()
            for key, value in six.iteritems(req_body):
                extraction.main_dataset[key] = value
            session.add(extraction)
            session.commit()
            return jsonify(extraction.main_dataset)


@app.route('/ensemble/extraction/test-dataset/', methods=['GET', 'PATCH'])
def extraction_test_dataset():
    path = functions.get_path_from_query_string(request)

    if request.method == 'GET':
        with functions.DBContextManager(path) as session:
            extraction = session.query(models.Extraction).first()
            return jsonify(extraction.test_dataset)

    if request.method == 'PATCH':
        req_body = request.get_json()
        with functions.DBContextManager(path) as session:
            extraction = session.query(models.Extraction).first()
            for key, value in six.iteritems(req_body):
                extraction.test_dataset[key] = value
            session.add(extraction)
            session.commit()
            return jsonify(extraction.test_dataset)


@app.route('/ensemble/extraction/meta-feature-generation/', methods=['GET', 'PATCH'])
def extraction_meta_feature_generation():
    path = functions.get_path_from_query_string(request)

    if request.method == 'GET':
        with functions.DBContextManager(path) as session:
            extraction = session.query(models.Extraction).first()
            return jsonify(extraction.meta_feature_generation)

    if request.method == 'PATCH':
        req_body = request.get_json()
        with functions.DBContextManager(path) as session:
            extraction = session.query(models.Extraction).first()
            for key, value in six.iteritems(req_body):
                extraction.meta_feature_generation[key] = value
            session.add(extraction)
            session.commit()
            return jsonify(extraction.meta_feature_generation)


@app.route('/ensemble/extraction/train-dataset/verify/', methods=['GET'])
def verify_extraction_train_dataset():
    path = functions.get_path_from_query_string(request)

    with functions.DBContextManager(path) as session:
        extraction = session.query(models.Extraction).first()

    X, y = extraction.return_train_dataset()

    return jsonify(functions.verify_dataset(X, y))


@app.route('/ensemble/extraction/test-dataset/verify/', methods=['GET'])
def verify_extraction_test_dataset():
    path = functions.get_path_from_query_string(request)

    with functions.DBContextManager(path) as session:
        extraction = session.query(models.Extraction).first()

    X, y = extraction.return_test_dataset()

    return jsonify(functions.verify_dataset(X, y))


@app.route('/ensemble/extraction/meta-feature-generation/verify/', methods=['GET'])
def verify_extraction_meta_feature_generation():
    path = functions.get_path_from_query_string(request)

    with functions.DBContextManager(path) as session:
        extraction = session.query(models.Extraction).first()

    if extraction.meta_feature_generation['method'] == 'cv':
        raise exceptions.UserError('Xcessiv will use cross-validation to'
                                   ' generate meta-features')

    X_holdout, y_holdout = extraction.return_holdout_dataset()

    return jsonify(functions.verify_dataset(X_holdout, y_holdout))


@app.route('/ensemble/extraction/verification/', methods=['GET', 'POST'])
def verify_full_extraction():
    """This is an experimental endpoint to simultaneously verify data
    statistics and extraction for training, test, and holdout datasets.
    With this, the other three verification methods will no longer be
    necessary.
    """
    path = functions.get_path_from_query_string(request)

    if request.method == 'POST':
        rqtasks.extraction_data_statistics(path)

    with functions.DBContextManager(path) as session:
        extraction = session.query(models.Extraction).first()
        return jsonify(extraction.data_statistics)


@app.route('/ensemble/base-learner-origins-settings/', methods=['GET'])
def base_learner_origins_settings():
    return jsonify([getattr(learnersetting, x) for x in learnersetting.__all__])


@app.route('/ensemble/metric-generators-settings/', methods=['GET'])
def metric_generators_settings():
    return jsonify([getattr(metricsetting, x) for x in metricsetting.__all__])


@app.route('/ensemble/base-learner-origins/', methods=['GET', 'POST'])
def base_learner_origins_view():
    path = functions.get_path_from_query_string(request)

    if request.method == 'GET':
        with functions.DBContextManager(path) as session:
            base_learner_origins = session.query(models.BaseLearnerOrigin).all()
            return jsonify(map(lambda x: x.serialize, base_learner_origins))

    if request.method == 'POST':  # Create new base learner origin
        req_body = request.get_json()
        new_base_learner_origin = models.BaseLearnerOrigin(**req_body)

        with functions.DBContextManager(path) as session:
            session.add(new_base_learner_origin)
            session.commit()
            return jsonify(new_base_learner_origin.serialize)


@app.route('/ensemble/base-learner-origins/<int:id>/', methods=['GET', 'PATCH', 'DELETE'])
def specific_base_learner_origin(id):
    path = functions.get_path_from_query_string(request)

    with functions.DBContextManager(path) as session:
        base_learner_origin = session.query(models.BaseLearnerOrigin).filter_by(id=id).first()
        if base_learner_origin is None:
            raise exceptions.UserError('Base learner origin {} not found'.format(id), 404)

        if request.method == 'GET':
            return jsonify(base_learner_origin.serialize)

        if request.method == 'PATCH':
            if base_learner_origin.final:
                raise exceptions.UserError('Cannot modify a final base learner origin')
            req_body = request.get_json()

            modifiable_attr = ('meta_feature_generator', 'name', 'source',
                               'metric_generators')
            for attr in modifiable_attr:
                if attr in req_body:
                    setattr(base_learner_origin, attr, req_body[attr])

            session.add(base_learner_origin)
            session.commit()
            return jsonify(base_learner_origin.serialize)

        if request.method == 'DELETE':
            base_learner_origin.cleanup(path)
            session.delete(base_learner_origin)
            session.commit()
            return jsonify(message='Deleted base learner origin')


@app.route('/ensemble/base-learner-origins/<int:id>/verify/', methods=['POST'])
def verify_base_learner_origin(id):
    path = functions.get_path_from_query_string(request)

    with functions.DBContextManager(path) as session:
        base_learner_origin = session.query(models.BaseLearnerOrigin).filter_by(id=id).first()
        if base_learner_origin is None:
            raise exceptions.UserError('Base learner origin {} not found'.format(id), 404)

        if request.method == 'POST':
            req_body = request.get_json()
            if base_learner_origin.final:
                raise exceptions.UserError('Base learner origin {} '
                                           'is already final'.format(id))
            base_learner = base_learner_origin.return_estimator()
            validation_results, hyperparameters = functions.verify_estimator_class(
                base_learner,
                base_learner_origin.meta_feature_generator,
                base_learner_origin.metric_generators,
                req_body['dataset_properties']
            )
            base_learner_origin.validation_results = {
                'dataset': req_body['dataset_properties'],
                'metrics': validation_results
            }
            base_learner_origin.hyperparameters = hyperparameters
            session.add(base_learner_origin)
            session.commit()
            return jsonify(base_learner_origin.serialize)


@app.route('/ensemble/base-learner-origins/<int:id>/confirm/', methods=['GET'])
def confirm_base_learner_origin(id):
    path = functions.get_path_from_query_string(request)

    with functions.DBContextManager(path) as session:
        base_learner_origin = session.query(models.BaseLearnerOrigin).filter_by(id=id).first()
        if base_learner_origin is None:
            raise exceptions.UserError('Base learner origin {} not found'.format(id), 404)

        if request.method == 'GET':
            if base_learner_origin.final:
                raise exceptions.UserError('Base learner origin {} '
                                           'is already final'.format(id))
            if not base_learner_origin.validation_results:
                raise exceptions.UserError('Base learner origin {} has not yet been '
                                           'verified on a dataset'.format(id))
            base_learner = base_learner_origin.return_estimator()
            validation_results, hyperparameters = functions.verify_estimator_class(
                base_learner,
                base_learner_origin.meta_feature_generator,
                base_learner_origin.metric_generators,
                base_learner_origin.validation_results['dataset']
            )
            base_learner_origin.validation_results = {
                'dataset': base_learner_origin.validation_results['dataset'],
                'metrics': validation_results
            }
            base_learner_origin.hyperparameters = hyperparameters
            base_learner_origin.final = True
            session.add(base_learner_origin)
            session.commit()
            return jsonify(base_learner_origin.serialize)


@app.route('/ensemble/base-learner-origins/<int:id>/create-base-learner/', methods=['POST'])
def create_base_learner(id):
    """This creates a single base learner from a base learner origin and queues it up"""
    path = functions.get_path_from_query_string(request)

    with functions.DBContextManager(path) as session:
        base_learner_origin = session.query(models.BaseLearnerOrigin).filter_by(id=id).first()
        if base_learner_origin is None:
            raise exceptions.UserError('Base learner origin {} not found'.format(id), 404)

        if not base_learner_origin.final:
            raise exceptions.UserError('Base learner origin {} is not final'.format(id))

        req_body = request.get_json()

        # Retrieve full hyperparameters
        est = base_learner_origin.return_estimator()
        hyperparameters = functions.import_object_from_string_code(req_body['source'],
                                                                   'params')
        est.set_params(**hyperparameters)
        hyperparameters = functions.make_serializable(est.get_params())

        base_learners = session.query(models.BaseLearner).\
            filter_by(base_learner_origin_id=id,
                      hyperparameters=hyperparameters).all()
        if base_learners:
            raise exceptions.UserError('Base learner exists with given hyperparameters')

        base_learner = models.BaseLearner(hyperparameters,
                                          'queued',
                                          base_learner_origin)

        session.add(base_learner)
        session.commit()

        with Connection(get_redis_connection()):
            rqtasks.generate_meta_features.delay(path, base_learner.id)

        return jsonify(base_learner.serialize)


@app.route('/ensemble/base-learner-origins/<int:id>/search/', methods=['POST'])
def search_base_learner(id):
    """Creates a set of base learners from base learner origin using grid search
    and queues them up
    """
    path = functions.get_path_from_query_string(request)
    req_body = request.get_json()
    if req_body['method'] == 'grid':
        param_grid = functions.import_object_from_string_code(
            req_body['source'],
            'param_grid'
        )
        iterator = ParameterGrid(param_grid)
    elif req_body['method'] == 'random':
        param_distributions = functions.import_object_from_string_code(
            req_body['source'],
            'param_distributions'
        )
        iterator = ParameterSampler(param_distributions, n_iter=req_body['n_iter'])

    else:
        raise exceptions.UserError('{} not a valid search method'.format(req_body['method']))

    with functions.DBContextManager(path) as session:
        base_learner_origin = session.query(models.BaseLearnerOrigin).filter_by(id=id).first()
        if base_learner_origin is None:
            raise exceptions.UserError('Base learner origin {} not found'.format(id), 404)

        if not base_learner_origin.final:
            raise exceptions.UserError('Base learner origin {} is not final'.format(id))

        learners = []
        for params in iterator:
            est = base_learner_origin.return_estimator()
            try:
                est.set_params(**params)
            except Exception as e:
                print(repr(e))
                continue

            hyperparameters = functions.make_serializable(est.get_params())

            base_learners = session.query(models.BaseLearner).\
                filter_by(base_learner_origin_id=id,
                          hyperparameters=hyperparameters).all()
            if base_learners:  # already exists
                continue

            base_learner = models.BaseLearner(hyperparameters,
                                              'queued',
                                              base_learner_origin)

            session.add(base_learner)
            session.commit()
            with Connection(get_redis_connection()):
                rqtasks.generate_meta_features.delay(path, base_learner.id)
            learners.append(base_learner)
        return jsonify(map(lambda x: x.serialize, learners))


@app.route('/ensemble/base-learners/', methods=['GET', 'DELETE'])
def get_base_learners():
    path = functions.get_path_from_query_string(request)

    with functions.DBContextManager(path) as session:
        base_learners = session.query(models.BaseLearner).all()

        if request.method == 'GET':
            return jsonify(map(lambda x: x.serialize, base_learners))

        if request.method == 'DELETE':  # Go crazy and delete everything
            for base_learner in base_learners:
                base_learner.delete_meta_features(path)
                session.delete(base_learner)
            session.commit()
            return jsonify(message='Deleted all base learners')


@app.route('/ensemble/base-learners/<int:id>/', methods=['GET', 'DELETE'])
def specific_base_learner(id):
    path = functions.get_path_from_query_string(request)

    with functions.DBContextManager(path) as session:
        base_learner = session.query(models.BaseLearner).filter_by(id=id).first()
        if base_learner is None:
            raise exceptions.UserError('Base learner {} not found'.format(id), 404)

        if request.method == 'GET':
            return jsonify(base_learner.serialize)

        if request.method == 'DELETE':
            base_learner.cleanup(path)
            session.delete(base_learner)
            session.commit()
            return jsonify(message='Deleted base learner')


@app.route('/ensemble/stacked/', methods=['GET', 'POST'])
def create_new_stacked_ensemble():
    path = functions.get_path_from_query_string(request)
    req_body = request.get_json()

    with functions.DBContextManager(path) as session:
        if request.method == 'GET':
                return jsonify(
                    map(lambda x: x.serialize, session.query(models.StackedEnsemble).all())
                )

        if request.method == 'POST':
            base_learners = session.query(models.BaseLearner).\
                filter(models.BaseLearner.id.in_(req_body['base_learner_ids'])).all()
            if len(base_learners) != len(req_body['base_learner_ids']):
                raise exceptions.UserError('Not all base learners found')
            for learner in base_learners:
                if learner.job_status != 'finished':
                    raise exceptions.UserError('Not all base learners have finished')

            base_learner_origin = session.query(models.BaseLearnerOrigin).\
                filter_by(id=req_body['base_learner_origin_id']).first()
            if base_learner_origin is None:
                raise exceptions.UserError('Base learner origin {} not found'.format(id), 404)

            # Retrieve full hyperparameters
            est = base_learner_origin.return_estimator()
            params = functions.import_object_from_string_code\
                (req_body['secondary_learner_hyperparameters_source'], 'params')
            est.set_params(**params)
            hyperparameters = functions.make_serializable(est.get_params())

            stacked_ensemble = models.StackedEnsemble(
                secondary_learner_hyperparameters=hyperparameters,
                base_learners=base_learners,
                base_learner_origin=base_learner_origin,
                append_original=req_body['append_original'],
                job_status='queued'
            )

            session.add(stacked_ensemble)
            session.commit()

            with Connection(get_redis_connection()):
                rqtasks.evaluate_stacked_ensemble.delay(path, stacked_ensemble.id)

            return jsonify(stacked_ensemble.serialize)


@app.route('/ensemble/stacked/<int:id>/', methods=['GET', 'DELETE'])
def specific_stacked_ensemble(id):
    path = functions.get_path_from_query_string(request)

    with functions.DBContextManager(path) as session:
        stacked_ensemble = session.query(models.StackedEnsemble).filter_by(id=id).first()
        if stacked_ensemble is None:
            raise exceptions.UserError('Stacked ensemble {} not found'.format(id), 404)

        if request.method == 'GET':
            return jsonify(stacked_ensemble.serialize)

        if request.method == 'DELETE':
            session.delete(stacked_ensemble)
            session.commit()
            return jsonify(message='Deleted stacked ensemble')
