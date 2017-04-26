import React, { Component } from 'react';
import './App.css';
import MainDataExtraction from './DatasetExtraction/MainDataExtraction';
import TestDataExtraction from './DatasetExtraction/TestDataExtraction';
import MetaFeatureExtraction from './DatasetExtraction/MetaFeatureExtraction';
import DataVerificationResult from './DatasetExtraction/DataVerificationResult';
import ContainerBaseLearner from './containers/ContainerBaseLearner';
import NotificationSystem from 'react-notification-system';


class App extends Component {

  constructor(props) {
    super(props);
    this._notificationSystem = null;
  }

  componentDidMount() {
    this._notificationSystem = this.refs.notificationSystem;
  }

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
        <ContainerBaseLearner path='test' 
          addNotification={(notif) => this._notificationSystem.addNotification(notif)} 
        />
        <NotificationSystem ref='notificationSystem' />
      </div>
    )
  }
}

export default App;
