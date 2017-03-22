from __future__ import absolute_import, print_function, division, unicode_literals
import os
from flask import request, jsonify
from sqlalchemy import create_engine
from xcessiv import app, functions, exceptions, models
import six


def my_message(message, code=200):
    resp = jsonify(message=message)
    resp.status_code = code
    return resp


@app.errorhandler(exceptions.UserError)
def handle_user_error(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response


@app.route('/ensemble/', methods=['POST'])
def create_new_ensemble():
    req_body = request.get_json()
    location = req_body['location']
    ensemble_name = req_body['ensemble_name']

    if os.path.exists(location):
        return my_message("File/folder already exists", 400)

    os.makedirs(location)
    xcessiv_notebook_path = os.path.join(location, ensemble_name + ".xcnb")
    sqlite_url = 'sqlite:///{}'.format(xcessiv_notebook_path)
    engine = create_engine(sqlite_url)

    models.Base.metadata.create_all(engine)

    # Initialize
    extraction = models.Extraction()
    with functions.DBContextManager(xcessiv_notebook_path) as session:
        session.add(extraction)
        session.commit()

    return my_message("Xcessiv notebook created")


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

            modifiable_attr = ('meta_feature_generator', 'name', 'source')
            for attr in modifiable_attr:
                if attr in req_body:
                    setattr(base_learner_origin, attr, req_body[attr])

            session.add(base_learner_origin)
            session.commit()
            return jsonify(base_learner_origin.serialize)

        if request.method == 'DELETE':
            session.delete(base_learner_origin)
            session.commit()
            return my_message('Deleted base learner origin')


@app.route('/ensemble/base-learner-origins/<int:id>/verify/', methods=['GET'])
def verify_base_learner_origin(id):
    path = functions.get_path_from_query_string(request)

    with functions.DBContextManager(path) as session:
        base_learner_origin = session.query(models.BaseLearnerOrigin).filter_by(id=id).first()
        if base_learner_origin is None:
            raise exceptions.UserError('Base learner origin {} not found'.format(id), 404)

        if request.method == 'GET':
            if base_learner_origin.final:
                raise exceptions.UserError('Base learner origin {} is already final'.format(id))
            base_learner = base_learner_origin.return_estimator()
            validation_results = functions.verify_estimator_class(base_learner)
            base_learner_origin.validation_results = validation_results
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
                raise exceptions.UserError('Base learner origin {} is already final'.format(id))
            base_learner = base_learner_origin.return_estimator()
            validation_results = functions.verify_estimator_class(base_learner)
            base_learner_origin.validation_results = validation_results
            base_learner_origin.final = True
            session.add(base_learner_origin)
            session.commit()
            return jsonify(base_learner_origin.serialize)
