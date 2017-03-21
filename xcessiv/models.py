"""This module contains the SQLAlchemy ORM Models"""
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Text, Integer, Boolean, TypeDecorator, ForeignKey
from sqlalchemy.orm import relationship
import json
from xcessiv import constants


Base = declarative_base()


class JsonEncodedDict(TypeDecorator):
    """Enables JSON storage by encoding and decoding on the fly."""
    impl = Text

    def process_bind_param(self, value, dialect):
        return json.dumps(value, sort_keys=True)

    def process_result_value(self, value, dialect):
        return json.loads(value)


class Extraction(Base):
    """This table's columns are text columns representing JSON data of how
    to extract the train, test, and holdout datasets. It will contain only a
    single row.
    """
    ___tablename___ = 'extraction'

    id = Column(Integer, primary_key=True)
    main_dataset = Column(JsonEncodedDict)
    test_dataset = Column(JsonEncodedDict)
    meta_feature_generation = Column(JsonEncodedDict)

    def __init__(self):
        self.main_dataset = constants.DEFAULT_EXTRACTION_MAIN_DATASET
        self.test_dataset = constants.DEFAULT_EXTRACTION_TEST_DATASET
        self.meta_feature_generation = constants.DEFAULT_EXTRACTION_META_FEATURE_GENERATION


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
