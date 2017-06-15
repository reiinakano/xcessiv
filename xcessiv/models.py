"""This module contains the SQLAlchemy ORM Models"""
from __future__ import absolute_import, print_function, division, unicode_literals
import random
import string
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Text, Integer, Boolean, TypeDecorator, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.ext import mutable
import numpy as np
import json
import os
from sklearn.model_selection import train_test_split
from xcessiv import constants
from xcessiv import exceptions
from xcessiv import functions
from xcessiv import app


Base = declarative_base()


class JsonEncodedDict(TypeDecorator):
    """Enables JSON storage by encoding and decoding on the fly."""
    impl = Text

    def process_bind_param(self, value, dialect):
        return json.dumps(value, sort_keys=True)

    def process_result_value(self, value, dialect):
        return json.loads(value)


mutable.MutableDict.associate_with(JsonEncodedDict)


class Extraction(Base):
    """This table's columns are text columns representing JSON data of how
    to extract the train and test datasets, base learner cross-validation method,
    and the stacked ensemble cross-validation method.
    It will contain only a single row.
    """
    __tablename__ = 'extraction'

    id = Column(Integer, primary_key=True)
    main_dataset = Column(JsonEncodedDict)
    test_dataset = Column(JsonEncodedDict)
    meta_feature_generation = Column(JsonEncodedDict)
    stacked_ensemble_cv = Column(JsonEncodedDict)
    data_statistics = Column(JsonEncodedDict)

    def __init__(self):
        self.main_dataset = constants.DEFAULT_EXTRACTION_MAIN_DATASET
        self.test_dataset = constants.DEFAULT_EXTRACTION_TEST_DATASET
        self.meta_feature_generation = constants.DEFAULT_EXTRACTION_META_FEATURE_GENERATION
        self.stacked_ensemble_cv = constants.DEFAULT_EXTRACTION_META_FEATURE_GENERATION
        self.data_statistics = None

    def return_main_dataset(self):
        """Returns main data set from self

        Returns:
            X (numpy.ndarray): Features

            y (numpy.ndarray): Labels
        """
        if not self.main_dataset['source']:
            raise exceptions.UserError('Source is empty')

        extraction_code = self.main_dataset["source"]

        extraction_function = functions.import_object_from_string_code(extraction_code,
                                                                       "extract_main_dataset")
        try:
            X, y = extraction_function()
        except Exception as e:
            raise exceptions.UserError('User code exception', exception_message=str(e))

        X, y = np.array(X), np.array(y)

        return X, y

    def return_train_dataset(self):
        """Returns train data set

        Returns:
            X (numpy.ndarray): Features

            y (numpy.ndarray): Labels
        """
        X, y = self.return_main_dataset()

        if self.test_dataset['method'] == 'split_from_main':
            X, X_test, y, y_test = train_test_split(
                X,
                y,
                test_size=self.test_dataset['split_ratio'],
                random_state=self.test_dataset['split_seed'],
                stratify=y
            )

        return X, y

    def return_test_dataset(self):
        """Returns test data set

        Returns:
            X (numpy.ndarray): Features

            y (numpy.ndarray): Labels
        """
        if self.test_dataset['method'] == 'split_from_main':
            X, y = self.return_main_dataset()
            X, X_test, y, y_test = train_test_split(
                X,
                y,
                test_size=self.test_dataset['split_ratio'],
                random_state=self.test_dataset['split_seed'],
                stratify=y
            )

            return X_test, y_test

        if self.test_dataset['method'] == 'source':
            if 'source' not in self.test_dataset or not self.test_dataset['source']:
                raise exceptions.UserError('Source is empty')

            extraction_code = self.test_dataset["source"]
            extraction_function = functions.\
                import_object_from_string_code(extraction_code, "extract_test_dataset")
            X_test, y_test = extraction_function()

            return np.array(X_test), np.array(y_test)


class BaseLearnerOrigin(Base):
    """This table contains the base learner origins of the Xcessiv notebook"""
    __tablename__ = 'baselearnerorigin'

    id = Column(Integer, primary_key=True)
    source = Column(Text)
    validation_results = Column(JsonEncodedDict)
    hyperparameters = Column(JsonEncodedDict)
    name = Column(Text)
    final = Column(Boolean)
    meta_feature_generator = Column(Text)
    metric_generators = Column(JsonEncodedDict)
    description = Column(JsonEncodedDict)
    base_learners = relationship('BaseLearner', back_populates='base_learner_origin',
                                 cascade='all, delete-orphan', single_parent=True)
    automated_runs = relationship('AutomatedRun', back_populates='base_learner_origin',
                                  cascade='all, delete-orphan', single_parent=True)
    stacked_ensembles = relationship('StackedEnsemble', back_populates='base_learner_origin',
                                     cascade='all, delete-orphan', single_parent=True)

    def __init__(self, source='', name='Base Learner Setup',
                 meta_feature_generator='predict_proba', metric_generators=None):
        self.source = source
        self.name = name
        self.validation_results = dict()
        self.hyperparameters = dict()
        self.final = False
        self.meta_feature_generator = meta_feature_generator
        self.description = dict()
        self.metric_generators = dict() if metric_generators is None else metric_generators

    @property
    def serialize(self):
        return dict(
            id=self.id,
            source=self.source,
            name=self.name,
            validation_results=self.validation_results,
            final=self.final,
            meta_feature_generator=self.meta_feature_generator,
            metric_generators=self.metric_generators,
            hyperparameters=self.hyperparameters,
            description=self.description
        )

    def return_estimator(self):
        """Returns estimator from base learner origin

        Returns:
            est (estimator): Estimator object
        """
        extraction_code = self.source
        estimator = functions.import_object_from_string_code(extraction_code, "base_learner")

        return estimator

    def cleanup(self, path):
        """This function should be called before database deletion to do any pre-delete work

        Args:
            path (str, unicode): Absolute/local path of xcessiv folder
        """
        for learner in self.base_learners:
            learner.cleanup(path)

    def export_as_file(self, filepath, hyperparameters):
        """Generates a Python file with the importable base learner set to ``hyperparameters``

         This function generates a Python file in the specified file path that contains
         the base learner as an importable variable stored in ``base_learner``. The base
         learner will be set to the appropriate  hyperparameters through ``set_params``.

        Args:
            filepath (str, unicode): File path to save file in

            hyperparameters (dict): Dictionary to use for ``set_params``
        """
        if not filepath.endswith('.py'):
            filepath += '.py'

        file_contents = ''
        file_contents += self.source
        file_contents += '\n\nbase_learner.set_params(**{})\n'.format(hyperparameters)
        file_contents += '\nmeta_feature_generator = "{}"\n'.format(self.meta_feature_generator)
        with open(filepath, 'wb') as f:
            f.write(file_contents.encode('utf8'))


class AutomatedRun(Base):
    """This table contains initialized/completed automated hyperparameter searches"""
    __tablename__ = 'automatedrun'

    id = Column(Integer, primary_key=True)
    source = Column(Text)
    job_status = Column(Text)
    job_id = Column(Text)
    category = Column(Text)
    description = Column(JsonEncodedDict)
    base_learner_origin_id = Column(Integer, ForeignKey('baselearnerorigin.id'))
    base_learner_origin = relationship('BaseLearnerOrigin', back_populates='automated_runs')

    def __init__(self, source, job_status, category, base_learner_origin=None):
        self.source = source
        self.job_status = job_status
        self.job_id = None
        self.category = category
        self.description = dict()
        self.base_learner_origin = base_learner_origin

    @property
    def serialize(self):
        return dict(
            id=self.id,
            category=self.category,
            source=self.source,
            job_status=self.job_status,
            job_id=self.job_id,
            description=self.description,
            base_learner_origin_id=self.base_learner_origin_id
        )


association_table = Table(
    'association', Base.metadata,
    Column('baselearner_id', Integer, ForeignKey('baselearner.id')),
    Column('stackedensemble_id', Integer, ForeignKey('stackedensemble.id'))
)


class BaseLearner(Base):
    """This table contains base learners of the Xcessiv notebook"""
    __tablename__ = 'baselearner'

    id = Column(Integer, primary_key=True)
    hyperparameters = Column(JsonEncodedDict)
    individual_score = Column(JsonEncodedDict)
    meta_features_exists = Column(Boolean)
    job_status = Column(Text)
    job_id = Column(Text)
    description = Column(JsonEncodedDict)
    base_learner_origin_id = Column(Integer, ForeignKey('baselearnerorigin.id'))
    base_learner_origin = relationship('BaseLearnerOrigin', back_populates='base_learners')
    stacked_ensembles = relationship(
        'StackedEnsemble',
        secondary=association_table,
        back_populates='base_learners',
        cascade='all, delete-orphan',
        single_parent=True
    )

    def __init__(self, hyperparameters, job_status, base_learner_origin):
        self.hyperparameters = hyperparameters
        self.individual_score = dict()
        self.meta_features_exists = False
        self.job_status = job_status
        self.job_id = None
        self.description = dict()
        self.base_learner_origin = base_learner_origin

    def return_estimator(self):
        """Returns base learner using its origin and the given hyperparameters

        Returns:
            est (estimator): Estimator object
        """
        estimator = self.base_learner_origin.return_estimator()
        estimator = estimator.set_params(**self.hyperparameters)
        return estimator

    def meta_features_path(self, path):
        """Returns path for meta-features

        Args:
            path (str): Absolute/local path of xcessiv folder
        """
        return os.path.join(
                path,
                app.config['XCESSIV_META_FEATURES_FOLDER'],
                str(self.id)
            ) + '.npy'

    @property
    def serialize(self):
        return dict(
            id=self.id,
            hyperparameters=self.hyperparameters,
            individual_score=self.individual_score,
            job_status=self.job_status,
            job_id=self.job_id,
            description=self.description,
            meta_features_exists=self.meta_features_exists,
            base_learner_origin_id=self.base_learner_origin_id
        )

    def delete_meta_features(self, path):
        """Deletes meta-features of base learner if it exists

        Args:
            path (str): Absolute/local path of xcessiv folder
        """
        if os.path.exists(self.meta_features_path(path)):
            os.remove(self.meta_features_path(path))

    def cleanup(self, path):
        """This function should be called before database deletion to do any pre-delete work

        Args:
            path (str, unicode): Absolute/local path of xcessiv folder
        """
        self.delete_meta_features(path)

    def export_as_file(self, filepath):
        """Generates a Python file with the importable base learner

         This function generates a Python file in the specified file path that contains
         the base learner as an importable variable stored in ``base_learner``. The base
         learner will be set to the appropriate  hyperparameters through ``set_params``.

        Args:
            filepath (str, unicode): File path to save file in
        """
        self.base_learner_origin.export_as_file(filepath, self.hyperparameters)


class StackedEnsemble(Base):
    """This table contains StackedEnsembles created in the xcessiv notebook"""
    __tablename__ = 'stackedensemble'

    id = Column(Integer, primary_key=True)
    base_learners = relationship(
        "BaseLearner",
        secondary=association_table,
        back_populates='stacked_ensembles'
    )
    base_learner_origin_id = Column(Integer, ForeignKey('baselearnerorigin.id'))
    base_learner_origin = relationship('BaseLearnerOrigin', back_populates='stacked_ensembles')
    secondary_learner_hyperparameters = Column(JsonEncodedDict)
    individual_score = Column(JsonEncodedDict)
    job_status = Column(Text)
    job_id = Column(Text)
    description = Column(JsonEncodedDict)

    def __init__(self, secondary_learner_hyperparameters, base_learners,
                 base_learner_origin, job_status):
        self.base_learner_origin = base_learner_origin
        self.secondary_learner_hyperparameters = secondary_learner_hyperparameters
        self.base_learners = base_learners
        self.individual_score = dict()
        self.job_status = job_status
        self.job_id = None
        self.description = dict()

    def return_secondary_learner(self):
        """Returns secondary learner using its origin and the given hyperparameters

        Returns:
            est (estimator): Estimator object
        """
        estimator = self.base_learner_origin.return_estimator()
        estimator = estimator.set_params(**self.secondary_learner_hyperparameters)
        return estimator

    def export_as_code(self, cv_source):
        """Returns a string value that contains the Python code for the ensemble

        Args:
            cv_source (str, unicode): String containing actual code for base learner
                cross-validation used to generate secondary meta-features.

        Returns:
            base_learner_code (str, unicode): String that can be used as Python code
        """

        rand_value = ''.join(random.choice(string.ascii_uppercase + string.digits)
                             for _ in range(25))

        base_learner_code = ''
        base_learner_code += 'base_learner_list_{} = []\n'.format(rand_value)
        base_learner_code += 'meta_feature_generators_list_{} = []\n\n'.format(rand_value)
        for idx, base_learner in enumerate(self.base_learners):
            base_learner_code += '################################################\n'
            base_learner_code += '###### Code for building base learner {} ########\n'.format(idx+1)
            base_learner_code += '################################################\n'
            base_learner_code += base_learner.base_learner_origin.source
            base_learner_code += '\n\n'
            base_learner_code += 'base_learner' \
                                 '.set_params(**{})\n'.format(base_learner.hyperparameters)
            base_learner_code += 'base_learner_list_{}.append(base_learner)\n'.format(rand_value)
            base_learner_code += 'meta_feature_generators_list_{}.append("{}")\n'.format(
                rand_value,
                base_learner.base_learner_origin.meta_feature_generator
            )
            base_learner_code += '\n\n'

        base_learner_code += '################################################\n'
        base_learner_code += '##### Code for building secondary learner ######\n'
        base_learner_code += '################################################\n'
        base_learner_code += self.base_learner_origin.source
        base_learner_code += '\n\n'
        base_learner_code += 'base_learner' \
                             '.set_params(**{})\n'.format(self.secondary_learner_hyperparameters)
        base_learner_code += 'secondary_learner_{} = base_learner\n'.format(rand_value)
        base_learner_code += '\n\n'

        base_learner_code += '################################################\n'
        base_learner_code += '############## Code for CV method ##############\n'
        base_learner_code += '################################################\n'
        base_learner_code += cv_source
        base_learner_code += '\n\n'

        base_learner_code += '################################################\n'
        base_learner_code += '######## Code for Xcessiv stacker class ########\n'
        base_learner_code += '################################################\n'
        stacker_file_loc = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'stacker.py')
        with open(stacker_file_loc) as f2:
            base_learner_code += f2.read()

        base_learner_code += '\n\n' \
                             '    def {}(self, X):\n' \
                             '        return self._process_using_' \
                             'meta_feature_generator(X, "{}")\n\n'\
            .format(self.base_learner_origin.meta_feature_generator,
                    self.base_learner_origin.meta_feature_generator)

        base_learner_code += '\n\n'

        base_learner_code += 'base_learner = XcessivStackedEnsemble' \
                             '(base_learners=base_learner_list_{},' \
                             ' meta_feature_generators=meta_feature_generators_list_{},' \
                             ' secondary_learner=secondary_learner_{},' \
                             ' cv_function=return_splits_iterable)\n'.format(
            rand_value,
            rand_value,
            rand_value
        )

        return base_learner_code

    def export_as_file(self, file_path, cv_source):
        """Export the ensemble as a single Python file and saves it to `file_path`.

        This is EXPERIMENTAL as putting different modules together would probably wreak havoc
        especially on modules that make heavy use of global variables.

        Args:
            file_path (str, unicode): Absolute/local path of place to save file in

            cv_source (str, unicode): String containing actual code for base learner
                cross-validation used to generate secondary meta-features.
        """
        if os.path.exists(file_path):
            raise exceptions.UserError('{} already exists'.format(file_path))

        with open(file_path, 'wb') as f:
            f.write(self.export_as_code(cv_source).encode('utf8'))

    def export_as_package(self, package_path, cv_source):
        """Exports the ensemble as a Python package and saves it to `package_path`.

        Args:
            package_path (str, unicode): Absolute/local path of place to save package in

            cv_source (str, unicode): String containing actual code for base learner
                cross-validation used to generate secondary meta-features.

        Raises:
            exceptions.UserError: If os.path.join(path, name) already exists.
        """
        if os.path.exists(package_path):
            raise exceptions.UserError('{} already exists'.format(package_path))

        package_name = os.path.basename(os.path.normpath(package_path))

        os.makedirs(package_path)

        # Write __init__.py
        with open(os.path.join(package_path, '__init__.py'), 'wb') as f:
            f.write('from {}.builder import xcessiv_ensemble'.format(package_name).encode('utf8'))

        # Create package baselearners with each base learner having its own module
        os.makedirs(os.path.join(package_path, 'baselearners'))
        open(os.path.join(package_path, 'baselearners', '__init__.py'), 'a').close()
        for idx, base_learner in enumerate(self.base_learners):
            base_learner.export_as_file(os.path.join(package_path,
                                                     'baselearners',
                                                     'baselearner' + str(idx)))

        # Create metalearner.py containing secondary learner
        self.base_learner_origin.export_as_file(
            os.path.join(package_path, 'metalearner'),
            self.secondary_learner_hyperparameters
        )

        # Create cv.py containing CV method for getting meta-features
        with open(os.path.join(package_path, 'cv.py'), 'wb') as f:
            f.write(cv_source.encode('utf8'))

        # Create stacker.py containing class for Xcessiv ensemble
        ensemble_source = ''
        stacker_file_loc = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'stacker.py')
        with open(stacker_file_loc) as f:
            ensemble_source += f.read()

        ensemble_source += '\n\n' \
                           '    def {}(self, X):\n' \
                           '        return self._process_using_' \
                           'meta_feature_generator(X, "{}")\n\n'\
            .format(self.base_learner_origin.meta_feature_generator,
                    self.base_learner_origin.meta_feature_generator)

        with open(os.path.join(package_path, 'stacker.py'), 'wb') as f:
            f.write(ensemble_source.encode('utf8'))

        # Create builder.py containing file where `xcessiv_ensemble` is instantiated for import
        builder_source = ''

        for idx, base_learner in enumerate(self.base_learners):
            builder_source += 'from {}.baselearners import baselearner{}\n'.format(package_name, idx)

        builder_source += 'from {}.cv import return_splits_iterable\n'.format(package_name)

        builder_source += 'from {} import metalearner\n'.format(package_name)

        builder_source += 'from {}.stacker import XcessivStackedEnsemble\n'.format(package_name)

        builder_source += '\nbase_learners = [\n'
        for idx, base_learner in enumerate(self.base_learners):
            builder_source += '    baselearner{}.base_learner,\n'.format(idx)
        builder_source += ']\n'

        builder_source += '\nmeta_feature_generators = [\n'
        for idx, base_learner in enumerate(self.base_learners):
            builder_source += '    baselearner{}.meta_feature_generator,\n'.format(idx)
        builder_source += ']\n'

        builder_source += '\nxcessiv_ensemble = XcessivStackedEnsemble(base_learners=base_learners,' \
                          ' meta_feature_generators=meta_feature_generators,' \
                          ' secondary_learner=metalearner.base_learner,' \
                          ' cv_function=return_splits_iterable)\n'

        with open(os.path.join(package_path, 'builder.py'), 'wb') as f:
            f.write(builder_source.encode('utf8'))

    @property
    def serialize(self):
        return dict(
            id=self.id,
            secondary_learner_hyperparameters=self.secondary_learner_hyperparameters,
            individual_score=self.individual_score,
            job_status=self.job_status,
            job_id=self.job_id,
            description=self.description,
            base_learner_origin_id=self.base_learner_origin_id,
            base_learner_ids=list(map(lambda x: x.id, self.base_learners)),
            number_of_base_learners=len(self.base_learners)
        )
