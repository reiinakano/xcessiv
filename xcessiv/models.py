"""This module contains the SQLAlchemy ORM Models"""
from __future__ import absolute_import, print_function, division, unicode_literals
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


class JsonEncodedList(TypeDecorator):
    """Enables JSON storage by encoding and decoding on the fly (list)"""
    impl = Text

    def process_bind_param(self, value, dialect):
        return json.dumps(value, sort_keys=True)

    def process_result_value(self, value, dialect):
        return json.loads(value)


mutable.MutableDict.associate_with(JsonEncodedDict)
mutable.MutableList.associate_with(JsonEncodedList)


class Extraction(Base):
    """This table's columns are text columns representing JSON data of how
    to extract the train, test, and holdout datasets. It will contain only a
    single row.
    """
    __tablename__ = 'extraction'

    id = Column(Integer, primary_key=True)
    main_dataset = Column(JsonEncodedDict)
    test_dataset = Column(JsonEncodedDict)
    meta_feature_generation = Column(JsonEncodedDict)

    def __init__(self):
        self.main_dataset = constants.DEFAULT_EXTRACTION_MAIN_DATASET
        self.test_dataset = constants.DEFAULT_EXTRACTION_TEST_DATASET
        self.meta_feature_generation = constants.DEFAULT_EXTRACTION_META_FEATURE_GENERATION

    def return_main_dataset(self):
        """Returns main data set from self

        Returns:
            X (numpy.ndarray): Features

            y (numpy.ndarray): Labels
        """
        if not self.main_dataset['source']:
            raise exceptions.UserError('Source is empty')

        extraction_code = "".join(self.main_dataset["source"])
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

        if self.meta_feature_generation['method'] == 'holdout_split':
            X, X_test, y, y_test = train_test_split(
                X,
                y,
                test_size=self.meta_feature_generation['split_ratio'],
                random_state=self.meta_feature_generation['seed'],
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

            extraction_code = "".join(self.test_dataset["source"])
            extraction_function = functions.\
                import_object_from_string_code(extraction_code, "extract_test_dataset")
            X_test, y_test = extraction_function()

            return np.array(X_test), np.array(y_test)

    def return_holdout_dataset(self):
        """Returns holdout data set

        Returns:
            X (numpy.ndarray): Features

            y (numpy.ndarray): Labels
        """
        if self.meta_feature_generation['method'] == 'holdout_split':
            X, y = self.return_main_dataset()

            if self.test_dataset['method'] == 'split_from_main':
                X, X_test, y, y_test = train_test_split(
                    X,
                    y,
                    test_size=self.test_dataset['split_ratio'],
                    random_state=self.test_dataset['split_seed'],
                    stratify=y
                )

            X, X_holdout, y, y_holdout = train_test_split(
                X,
                y,
                test_size=self.meta_feature_generation['split_ratio'],
                random_state=self.meta_feature_generation['seed'],
                stratify=y
            )

            return X_holdout, y_holdout

        if self.meta_feature_generation['method'] == 'holdout_source':
            if 'source' not in self.meta_feature_generation or \
                    not self.meta_feature_generation['source']:
                raise exceptions.UserError('Source is empty')

            extraction_code = "".join(self.meta_feature_generation["source"])
            extraction_function = functions.\
                import_object_from_string_code(extraction_code,
                                               "extract_holdout_dataset")
            X_holdout, y_holdout = extraction_function()

            return np.array(X_holdout), np.array(y_holdout)


class BaseLearnerOrigin(Base):
    """This table contains the base learner origins of the Xcessiv notebook"""
    __tablename__ = 'baselearnerorigin'

    id = Column(Integer, primary_key=True)
    source = Column(JsonEncodedList)
    validation_results = Column(JsonEncodedDict)
    name = Column(Text)
    final = Column(Boolean)
    meta_feature_generator = Column(Text)
    metric_generators = Column(JsonEncodedDict)
    base_learners = relationship('BaseLearner', back_populates='base_learner_origin')
    stacked_ensembles = relationship('StackedEnsemble', back_populates='base_learner_origin')

    def __init__(self, source=None, name='',
                 meta_feature_generator='predict_proba', metric_generators=None):
        self.source = list() if source is None else source
        self.name = name
        self.validation_results = dict()
        self.final = False
        self.meta_feature_generator = meta_feature_generator
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
            metric_generators=self.metric_generators
        )

    def return_estimator(self):
        """Returns estimator from base learner origin

        Returns:
            est (estimator): Estimator object
        """
        extraction_code = "".join(self.source)
        estimator = functions.import_object_from_string_code(extraction_code, "base_learner")
        return estimator


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
        back_populates='base_learners'
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
            path (str): Absolute/local path of xcessiv notebook
        """
        return os.path.join(
                os.path.dirname(path),
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
    append_original = Column(Boolean)
    job_status = Column(Text)
    job_id = Column(Text)
    description = Column(JsonEncodedDict)

    def __init__(self, secondary_learner_hyperparameters, base_learners,
                 base_learner_origin, append_original, job_status):
        self.base_learner_origin = base_learner_origin
        self.secondary_learner_hyperparameters = secondary_learner_hyperparameters
        self.base_learners = base_learners
        self.append_original = append_original
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
            base_learner_ids=map(lambda x: x.id, self.base_learners),
            append_original=self.append_original
        )
