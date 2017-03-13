from __future__ import absolute_import, print_function, division, unicode_literals
import os
from flask import request, jsonify
from xcessiv import app


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
        f.write('Hello world')

    return my_message("Xcessiv notebook created")
