import React, { Component } from 'react';
import './MainDataExtraction.css';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import MainDataExtraction from './MainDataExtraction';
//import TestDataExtraction from './TestDataExtraction';
import MetaFeatureExtraction from './MetaFeatureExtraction';
import StackedEnsembleCV from './StackedEnsembleCV'
import DataVerificationResult from './DataVerificationResult';

class DataExtractionTabs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      "selectedIndex": 0,
      "sameMde": true,
      "sameTde": true,
      "sameMfe": true,
      "sameSecv": true,
      "mfeConfig": "",
      "mdeConfig": "",
      "secvConfig": ""
    };
  }

  componentDidMount() {
    this.fetchMfe(this.props.path);
    this.fetchMde(this.props.path);
    this.fetchSecv(this.props.path);
  }

  fetchMfe(path) {
    fetch('/ensemble/extraction/meta-feature-generation/?path=' + path)
    .then(response => response.json())
    .then(json => {
      console.log(json);
      this.setState({
        mfeConfig: json,
        sameMfe: true
      })
    });
  }

  // Save all changes to server
  saveMfe(config) {
    var payload = config;

    fetch(
      '/ensemble/extraction/meta-feature-generation/?path=' + this.props.path,
      {
        method: "PATCH",
        body: JSON.stringify( payload ),
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      }
    )
    .then(response => response.json())
    .then(json => {
      console.log(json);
      this.setState({
        mfeConfig: json,
        sameMfe: true
      });
      this.props.addNotification({
        title: 'Success',
        message: 'Saved base learner cross-validation method',
        level: 'success'
      });
    });
  }

  fetchMde(path) {
    fetch('/ensemble/extraction/main-dataset/?path=' + path)
    .then(response => response.json())
    .then(json => {
      console.log(json);
      this.setState({
        mdeConfig: json,
        sameMde: true
      })
    });
  }

  // Save all changes to server
  saveMde(config) {
    var payload = config;

    fetch(
      '/ensemble/extraction/main-dataset/?path=' + this.props.path,
      {
        method: "PATCH",
        body: JSON.stringify( payload ),
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      }
    )
    .then(response => response.json())
    .then(json => {
      console.log(json);
      this.setState({
        mdeConfig: json,
        sameMde: true
      });
      this.props.addNotification({
        title: 'Success',
        message: 'Saved main dataset extraction method',
        level: 'success'
      });
    });
  }

  fetchSecv(path) {
    fetch('/ensemble/extraction/stacked-ensemble-cv/?path=' + path)
    .then(response => response.json())
    .then(json => {
      console.log(json);
      this.setState({
        secvConfig: json,
        sameSecv: true
      })
    });
  }

  // Save all changes to server
  saveSecv(config) {
    var payload = config;

    fetch(
      '/ensemble/extraction/stacked-ensemble-cv/?path=' + this.props.path,
      {
        method: "PATCH",
        body: JSON.stringify( payload ),
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      }
    )
    .then(response => response.json())
    .then(json => {
      console.log(json);
      this.setState({
        secvConfig: json,
        sameSecv: true
      });
      this.props.addNotification({
        title: 'Success',
        message: 'Saved stacked ensemble cross-validation method',
        level: 'success'
      });
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.path !== nextProps.path) {
      this.setState({
        'sameTde': true
      });
      this.fetchMfe(nextProps.path);
      this.fetchMde(nextProps.path);
    }
  }

  render() {
    return(
      <div className='MainDataExtraction'>
        <h2>Extract your dataset into Xcessiv</h2>
        <Tabs 
          forceRenderTabPanel={false}
          selectedIndex={this.state.selectedIndex}
          onSelect={(idx) => this.setState({selectedIndex: idx})}
          >
          <TabList>
            <Tab>Main Dataset Extraction{!this.state.sameMde && '*'}</Tab>
            {/*<Tab>Test Dataset Extraction{!this.state.sameTde && '*'}</Tab>*/}
            <Tab>Base learner Cross-validation{!this.state.sameMfe && '*'}</Tab>
            <Tab>Stacked Ensemble Cross-validation{!this.state.sameSecv && '*'}</Tab>
          </TabList>
          <TabPanel className='TabPanel'>
            <MainDataExtraction 
              addNotification={(notif) => this.props.addNotification(notif)}
              same={this.state.sameMde}
              setSame={(x) => this.setState({sameMde: x})}
              config={this.state.mdeConfig}
              saveConfig={(x) => this.saveMde(x)}
            />
          </TabPanel>
          {/*
          <TabPanel className='TabPanel'>
            <TestDataExtraction 
              path={this.props.path}
              addNotification={(notif) => this.props.addNotification(notif)}
              same={this.state.sameTde}
              setSame={(x) => this.setState({sameTde: x})}
            />
          </TabPanel>
          */}
          <TabPanel className='TabPanel'>
            <MetaFeatureExtraction 
              addNotification={(notif) => this.props.addNotification(notif)}
              same={this.state.sameMfe}
              setSame={(x) => this.setState({sameMfe: x})}
              config={this.state.mfeConfig}
              saveConfig={(x) => this.saveMfe(x)}
              presetCVs={this.props.presetCVs}
            />
          </TabPanel>
          <TabPanel className='TabPanel'>
            <StackedEnsembleCV 
              addNotification={(notif) => this.props.addNotification(notif)}
              same={this.state.sameSecv}
              setSame={(x) => this.setState({sameSecv: x})}
              config={this.state.secvConfig}
              saveConfig={(x) => this.saveSecv(x)}
              presetCVs={this.props.presetCVs}
            />
          </TabPanel>
        </Tabs>
        <DataVerificationResult 
          path={this.props.path}
          same={this.state.sameMde && this.state.sameTde && this.state.sameMfe}
          addNotification={(notif) => this.props.addNotification(notif)}
        />
      </div>
    )
  }
}

export default DataExtractionTabs;
