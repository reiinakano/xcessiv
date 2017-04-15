import React, { Component } from 'react';
import './App.css';
import MainDataExtraction from './DatasetExtraction/MainDataExtraction';
import TestDataExtraction from './DatasetExtraction/TestDataExtraction';
import MetaFeatureExtraction from './DatasetExtraction/MetaFeatureExtraction';
import DataVerificationResult from './DatasetExtraction/DataVerificationResult';
import ListBaseLearnerOrigin from './BaseLearnerOrigin/ListBaseLearnerOrigin';
import BaseLearnerOrigin from './components/BaseLearnerOrigin'

function justLog() {
  console.log(arguments);
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Xcessiv</h2>
        </div>
        <MainDataExtraction path='test'/>
        <TestDataExtraction path='test'/>
        <MetaFeatureExtraction path='test'/>
        <DataVerificationResult path='test'/>
        <ListBaseLearnerOrigin path='test' />
        <BaseLearnerOrigin 
        data={{final: false, id: 1, name: 'uh', meta_feature_generator: 'predict_proba'}} 
        same={false}
        active={true}
        showModal={null}
        onActiveChange={justLog} 
        handleDataChange={justLog}
        handleOpenModal={justLog}
        handleCloseModal={justLog}
        clearDataChanges={justLog}
        saveSetup={justLog}
        verifyLearner={justLog}
        confirmLearner={justLog}
        deleteLearner={justLog} />
      </div>
    )
  }
}

export default App;
