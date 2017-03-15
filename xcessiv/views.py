from __future__ import absolute_import, print_function, division, unicode_literals
import os
from flask import request, jsonify, abort
from xcessiv import app, constants, functions
import six


def my_message(message, code=200):
    resp = jsonify(message=message)
    resp.status_code = code
    return resp


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


@app.route('/ensemble/extraction/main-dataset/<path:path>/', methods=['GET', 'PATCH'])
def extraction_main_dataset(path):
    try:
        xcnb = functions.read_xcnb(path)
    except IOError:
        abort(404)

    if request.method == 'GET':
        return jsonify(xcnb["extraction"]["main_dataset"])

    if request.method == 'PATCH':
        req_body = request.get_json()
        for key, value in six.iteritems(req_body):
            xcnb['extraction']['main_dataset'][key] = value
        functions.write_xcnb(path, xcnb)
        return my_message("Updated main dataset extraction")


@app.route('/ensemble/extraction/test-dataset/<path:path>/', methods=['GET', 'PATCH'])
def extraction_test_dataset(path):
    try:
        xcnb = functions.read_xcnb(path)
    except IOError:
        abort(404)

    if request.method == 'GET':
        return jsonify(xcnb['extraction']['test_dataset'])

    if request.method == 'PATCH':
        req_body = request.get_json()
        for key, value in six.iteritems(req_body):
            xcnb['extraction']['test_dataset'][key] = value
        functions.write_xcnb(path, xcnb)
        return my_message("Updated test dataset extraction")


@app.route('/ensemble/extraction/meta-feature-generation/<path:path>/',
           methods=['GET', 'PATCH'])
def extraction_meta_feature_generation(path):
    try:
        xcnb = functions.read_xcnb(path)
    except IOError:
        abort(404)

    if request.method == 'GET':
        return jsonify(xcnb['extraction']['meta_feature_generation'])

    if request.method == 'PATCH':
        req_body = request.get_json()
        for key, value in six.iteritems(req_body):
            xcnb['extraction']['meta_feature_generation'][key] = value
        functions.write_xcnb(path, xcnb)
        return my_message("Updated meta-feature generation")
