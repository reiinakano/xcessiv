import React, { Component } from 'react';
import './MainDataExtraction.css';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import MainDataExtraction from './MainDataExtraction';
import TestDataExtraction from './TestDataExtraction';
import MetaFeatureExtraction from './MetaFeatureExtraction';
import DataVerificationResult from './DataVerificationResult';

class DataExtractionTabs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      "selectedIndex": 0,
      "sameMde": true,
      "sameTde": true,
      "sameMfe": true
    };
  }

  render() {
    return(
      <div className='MainDataExtraction'>
        <h2>Extract your dataset into Xcessiv</h2>
        <Tabs 
          forceRenderTabPanel={true}
          selectedIndex={this.state.selectedIndex}
          onSelect={(idx) => this.setState({selectedIndex: idx})}
          >
          <TabList>
            <Tab>Main Dataset Extraction{!this.state.sameMde && '*'}</Tab>
            <Tab>Test Dataset Extraction{!this.state.sameTde && '*'}</Tab>
            <Tab>Meta-feature Generation{!this.state.sameMfe && '*'}</Tab>
          </TabList>
          <TabPanel>
            <MainDataExtraction 
              path={this.props.path}
              addNotification={(notif) => this.props.addNotification(notif)}
              same={this.state.sameMde}
              setSame={(x) => this.setState({sameMde: x})}
            />
          </TabPanel>
          <TabPanel>
            <TestDataExtraction 
              path={this.props.path}
              addNotification={(notif) => this.props.addNotification(notif)}
              same={this.state.sameTde}
              setSame={(x) => this.setState({sameTde: x})}
            />
          </TabPanel>
          <TabPanel>
            <MetaFeatureExtraction 
              path={this.props.path}
              addNotification={(notif) => this.props.addNotification(notif)}
              same={this.state.sameMfe}
              setSame={(x) => this.setState({sameMfe: x})}
            />
          </TabPanel>
        </Tabs>
        <DataVerificationResult 
          path={this.props.path}
          same={this.state.sameMde && this.state.sameTde && this.state.sameMfe}
        />
      </div>
    )
  }
}

export default DataExtractionTabs;
