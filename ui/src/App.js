import React, { Component } from 'react';
import './App.css';
import MainDataExtraction from './DatasetExtraction/MainDataExtraction';
import TestDataExtraction from './DatasetExtraction/TestDataExtraction';
import MetaFeatureExtraction from './DatasetExtraction/MetaFeatureExtraction';
import DataVerificationResult from './DatasetExtraction/DataVerificationResult';
import BaseLearnerOrigin from './BaseLearnerOrigin/BaseLearnerOrigin';


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
        <BaseLearnerOrigin path='test' id={5}/>
      </div>
    )
  }
}

export default App;
