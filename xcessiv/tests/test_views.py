from __future__ import absolute_import, print_function, division, unicode_literals
import unittest
import json
import os
from xcessiv import app, functions, models, constants


class TestCreateNewEnsemble(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.test_location = 'test_folder'

    def tearDown(self):
        if os.path.exists(os.path.join(self.test_location,
                                       app.config['XCESSIV_NOTEBOOK_NAME'])):
            os.remove(os.path.join(self.test_location,
                                   app.config['XCESSIV_NOTEBOOK_NAME']))
            os.rmdir(self.test_location)

    def test_creation(self):
        rv = self.app.post(
            '/ensemble/',
            data=json.dumps(
                {
                    'ensemble_name': self.test_location
                }
            ),
            content_type='application/json'
        )
        assert rv.status_code == 200
        assert os.path.exists(os.path.join(self.test_location,
                                           app.config['XCESSIV_NOTEBOOK_NAME']))
        with functions.DBContextManager(self.test_location) as session:
            extraction = session.query(models.Extraction).all()
            assert len(extraction) == 1
            assert extraction[0].main_dataset == constants.DEFAULT_EXTRACTION_MAIN_DATASET
            assert extraction[0].test_dataset == constants.DEFAULT_EXTRACTION_TEST_DATASET
            assert extraction[0].meta_feature_generation == \
                constants.DEFAULT_EXTRACTION_META_FEATURE_GENERATION

    def test_duplicate(self):
        rv = self.app.post(
            '/ensemble/',
            data=json.dumps(
                {
                    'ensemble_name': self.test_location
                }
            ),
            content_type='application/json'
        )

        rv = self.app.post(
            '/ensemble/',
            data=json.dumps(
                {
                    'ensemble_name': self.test_location
                }
            ),
            content_type='application/json'
        )

        assert rv.status_code == 400
