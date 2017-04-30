import React, { Component } from 'react';
import './MainDataExtraction.css';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import MainDataExtraction from './MainDataExtraction';
import TestDataExtraction from './TestDataExtraction';
import MetaFeatureExtraction from './MetaFeatureExtraction';

class DataExtractionTabs extends Component {
  constructor(props) {
    super(props);
    this.state = {"selectedIndex": 0};
  }

  render() {
    return(
      <div className='MainDataExtraction'>
        <h2>Extract your dataset into Xcessiv</h2>
        <Tabs 
          selectedIndex={this.state.selectedIndex}
          onSelect={(idx) => this.setState({selectedIndex: idx})}
          >
          <TabList>
            <Tab>Main Dataset Extraction</Tab>
            <Tab>Test Dataset Extraction</Tab>
            <Tab>Meta-feature generation method</Tab>
          </TabList>
          <TabPanel>
            <MainDataExtraction 
              path={this.props.path}
              addNotification={(notif) => this.props.addNotification(notif)}
            />
          </TabPanel>
          <TabPanel>
            <TestDataExtraction 
              path={this.props.path}
              addNotification={(notif) => this.props.addNotification(notif)}
            />
          </TabPanel>
          <TabPanel>
            <MetaFeatureExtraction 
              path={this.props.path}
              addNotification={(notif) => this.props.addNotification(notif)}
            />
          </TabPanel>
        </Tabs>
      </div>
    )
  }
}

export default DataExtractionTabs;
