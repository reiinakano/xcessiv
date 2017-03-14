from __future__ import absolute_import, print_function, division, unicode_literals
import unittest
import json
import os
from xcessiv import app, constants


class TestCreateNewEnsemble(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.test_location = 'test_folder'
        self.test_notebook = 'test_xcessiv'

    def tearDown(self):
        if os.path.exists(os.path.join(self.test_location,
                                       self.test_notebook+".xcnb")):
            os.remove(os.path.join(self.test_location,
                                   self.test_notebook+".xcnb"))
            os.rmdir(self.test_location)

    def test_creation(self):
        rv = self.app.post(
            '/ensemble/',
            data=json.dumps(
                {
                    'location': self.test_location,
                    'ensemble_name': self.test_notebook
                }
            ),
            content_type='application/json'
        )
        assert rv.status_code == 200
        assert os.path.exists(os.path.join(self.test_location,
                                           self.test_notebook+".xcnb"))
        with open(os.path.join(self.test_location, self.test_notebook+".xcnb")) as f:
            lines = f.read()
            assert lines == constants.DEFAULT_NOTEBOOK

    def test_duplicate(self):
        rv = self.app.post(
            '/ensemble/',
            data=json.dumps(
                {
                    'location': self.test_location,
                    'ensemble_name': self.test_notebook
                }
            ),
            content_type='application/json'
        )

        rv = self.app.post(
            '/ensemble/',
            data=json.dumps(
                {
                    'location': self.test_location,
                    'ensemble_name': self.test_notebook
                }
            ),
            content_type='application/json'
        )

        assert rv.status_code == 400
