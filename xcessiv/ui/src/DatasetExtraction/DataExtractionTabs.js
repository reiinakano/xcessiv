import React, { Component } from 'react';
import './MainDataExtraction.css';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import MainDataExtraction from './MainDataExtraction';
//import TestDataExtraction from './TestDataExtraction';
import MetaFeatureExtraction from './MetaFeatureExtraction';
import DataVerificationResult from './DataVerificationResult';

class DataExtractionTabs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      "selectedIndex": 0,
      "sameMde": true,
      "sameTde": true,
      "sameMfe": true,
      "mfeConfig": ""
    };
  }

  componentDidMount() {
    this.fetchMfe(this.props.path);
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
        message: 'Saved meta-feature extraction method',
        level: 'success'
      });
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.path !== nextProps.path) {
      this.setState({
        'sameMde': true,
        'sameTde': true
      });
      this.fetchMfe(nextProps.path);
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
            <Tab>Meta-feature Generation{!this.state.sameMfe && '*'}</Tab>
          </TabList>
          <TabPanel className='TabPanel'>
            <MainDataExtraction 
              path={this.props.path}
              addNotification={(notif) => this.props.addNotification(notif)}
              same={this.state.sameMde}
              setSame={(x) => this.setState({sameMde: x})}
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
              same={this.state.sameMfe}
              setSame={(x) => this.setState({sameMfe: x})}
              config={this.state.mfeConfig}
              saveConfig={(x) => this.saveMfe(x)}
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
