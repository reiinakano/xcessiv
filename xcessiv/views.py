from __future__ import absolute_import, print_function, division, unicode_literals
import os
from flask import request, jsonify
from xcessiv import app, constants, functions, parsers, exceptions
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
    with open(xcessiv_notebook_path, mode='w') as f:
        f.write(constants.DEFAULT_NOTEBOOK)

    return my_message("Xcessiv notebook created")


@app.route('/ensemble/extraction/main-dataset/', methods=['GET', 'PATCH'])
def extraction_main_dataset():
    path = functions.get_path_from_query_string(request)
    xcnb = functions.read_xcnb(path)

    if request.method == 'GET':
        return jsonify(xcnb["extraction"]["main_dataset"])

    if request.method == 'PATCH':
        req_body = request.get_json()
        for key, value in six.iteritems(req_body):
            xcnb['extraction']['main_dataset'][key] = value
        functions.write_xcnb(path, xcnb)
        return my_message("Updated main dataset extraction")


@app.route('/ensemble/extraction/test-dataset/', methods=['GET', 'PATCH'])
def extraction_test_dataset():
    path = functions.get_path_from_query_string(request)
    xcnb = functions.read_xcnb(path)

    if request.method == 'GET':
        return jsonify(xcnb['extraction']['test_dataset'])

    if request.method == 'PATCH':
        req_body = request.get_json()
        for key, value in six.iteritems(req_body):
            xcnb['extraction']['test_dataset'][key] = value
        functions.write_xcnb(path, xcnb)
        return my_message("Updated test dataset extraction")


@app.route('/ensemble/extraction/meta-feature-generation/', methods=['GET', 'PATCH'])
def extraction_meta_feature_generation():
    path = functions.get_path_from_query_string(request)
    xcnb = functions.read_xcnb(path)

    if request.method == 'GET':
        return jsonify(xcnb['extraction']['meta_feature_generation'])

    if request.method == 'PATCH':
        req_body = request.get_json()
        for key, value in six.iteritems(req_body):
            xcnb['extraction']['meta_feature_generation'][key] = value
        functions.write_xcnb(path, xcnb)
        return my_message("Updated meta-feature generation")


@app.route('/ensemble/extraction/main-dataset/verify/', methods=['GET'])
def verify_extraction_main_dataset():
    path = functions.get_path_from_query_string(request)
    xcnb = functions.read_xcnb(path)

    X, y = parsers.return_train_data_from_json(xcnb['extraction'])

    return jsonify(functions.verify_dataset(X, y))


@app.route('/ensemble/extraction/test-dataset/verify/', methods=['GET'])
def verify_extraction_test_dataset():
    path = functions.get_path_from_query_string(request)
    xcnb = functions.read_xcnb(path)

    if xcnb['extraction']['test_dataset']['method'] is None:
        raise exceptions.UserError('Xcessiv is not configured to use a test dataset')

    X_test, y_test = parsers.return_test_data_from_json(xcnb['extraction'])

    return jsonify(functions.verify_dataset(X_test, y_test))


@app.route('/ensemble/extraction/meta-feature-generation/verify/', methods=['GET'])
def verify_extraction_meta_feature_generation():
    path = functions.get_path_from_query_string(request)
    xcnb = functions.read_xcnb(path)

    if xcnb['extraction']['meta_feature_generation']['method'] == 'cv':
        raise exceptions.UserError('Xcessiv will use cross-validation to'
                                   ' generate meta-features')

    X_holdout, y_holdout = parsers.return_holdout_data_from_json(xcnb['extraction'])

    return jsonify(functions.verify_dataset(X_holdout, y_holdout))


@app.route('/ensemble/base-learner-origins/', methods=['GET', 'POST'])
def base_learner_origins():
    path = functions.get_path_from_query_string(request)
    xcnb = functions.read_xcnb(path)

    if request.method == 'GET':
        return jsonify(xcnb['base_learner_origins'])

    if request.method == 'POST':  # Create new base learner origin
        req_body = request.get_json()
        new_base_learner_origin = constants.DEFAULT_BASE_LEARNER_ORIGIN
        for key, value in six.iteritems(req_body):
            new_base_learner_origin[key] = value
        # Populate must-be-default values for a newly created base learner origin
        xcnb['base_learner_origins_latest_id'] += 1
        new_base_learner_origin['id'] = xcnb['base_learner_origins_latest_id']
        new_base_learner_origin['final'] = False
        new_base_learner_origin['validation_results'] = dict()
        xcnb['base_learner_origins'].append(new_base_learner_origin)
        functions.write_xcnb(path, xcnb)
        return jsonify(new_base_learner_origin)


@app.route('/ensemble/base-learner-origins/<int:id>/', methods=['GET'])
def specific_base_learner_origin(id):
    path = functions.get_path_from_query_string(request)
    xcnb = functions.read_xcnb(path)

    base_learner_origin = None
    for blo in xcnb['base_learner_origins']:
        print(blo)
        if blo['id'] == id:
            base_learner_origin = blo
            break
    if base_learner_origin is None:
        raise exceptions.UserError('Base learner origin {} not found'.format(id), 404)

    if request.method == 'GET':
        return jsonify(base_learner_origin)
