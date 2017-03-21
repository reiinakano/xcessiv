"""This module contains the SQLAlchemy ORM Models"""
from __future__ import absolute_import, print_function, division, unicode_literals
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Text, Integer, Boolean, TypeDecorator, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext import mutable
import numpy as np
import json
from sklearn.model_selection import train_test_split
from xcessiv import constants
from xcessiv import exceptions
from xcessiv import functions


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
    source = Column(JsonEncodedDict)
    validation_results = Column(JsonEncodedDict)
    name = Column(Text)
    final = Column(Boolean)
    meta_feature_generator = Column(Text)
    base_learners = relationship('BaseLearner', back_populates='base_learner_origin')

    def __init__(self, source, name):
        self.source = source
        self.name = name
        self.validation_results = dict()
        self.final = False
        self.meta_feature_generator = "predict_proba"


class BaseLearner(Base):
    """This table contains base learners of the Xcessiv notebook"""
    __tablename__ = 'baselearner'

    id = Column(Integer, primary_key=True)
    hyperparameters = Column(JsonEncodedDict)
    individual_score = Column(JsonEncodedDict)
    meta_features_location = Column(Text)
    status = Column(Text)
    job_id = Column(Text)
    base_learner_origin_id = Column(Integer, ForeignKey('baselearnerorigin.id'))
    base_learner_origin = relationship('BaseLearnerOrigin', back_populates='base_learners')

    def __init__(self, hyperparameters, individual_score, meta_features_location,
                 status, job_id, base_learner_origin):
        self.hyperparameters = hyperparameters
        self.individual_score = individual_score
        self.meta_features_location = meta_features_location
        self.status = status
        self.job_id = job_id
        self.base_learner_origin = base_learner_origin
