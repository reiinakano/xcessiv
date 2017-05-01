import React, { Component } from 'react';
import './MainDataExtraction.css';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';
import { isEqual } from 'lodash';
import $ from 'jquery';
import { ClearModal } from './Modals';

class CVForm extends Component {
  render() {

    return (
      <div>
        <p>You have chosen to use cross-validation to generate meta-features</p>
        <div className='SplitFormLabel'>
          <label>
            Number of folds:
            <input 
              name='foldsValue' 
              type='number' 
              min='2' 
              value={this.props.folds} 
              onChange={(evt) => this.props.handleConfigChange('folds', parseInt(
                evt.target.value, 10))}
            />
          </label>
        </div>
        <div className='SplitFormLabel'>
          <label>
            Random Seed:
            <input 
              name='seedValue' 
              type='number' 
              value={this.props.seed} 
              onChange={(evt) => this.props.handleConfigChange('seed', parseInt(
                evt.target.value, 10))}/>
          </label>
        </div>
      </div>
    )
  }
}

class SplitForm extends Component {
  render() {

    return (
      <div>
        <p>You have chosen to split a holdout set from the main dataset.</p>
        <div className='SplitFormLabel'>
          <label>
            Holdout Dataset Ratio:
            <input 
              name='ratioValue' 
              type='number' 
              step='0.001' 
              min='0' 
              max='1' 
              value={this.props.split_ratio} 
              onChange={(evt) => this.props.handleConfigChange('split_ratio',
                parseFloat(evt.target.value))}/>
          </label>
        </div>
        <div className='SplitFormLabel'>
          <label>
            Random Seed:
            <input 
              name='seedValue' 
              type='number' 
              value={this.props.split_seed} 
              onChange={(evt) => this.props.handleConfigChange('seed',
                parseInt(evt.target.value, 10))}/>
          </label>
        </div>
      </div>
    )
  }
}


class SourceForm extends Component {
  render() {
    var options = {
      lineNumbers: true,
      indentUnit: 4
    };
    return (
      <div>
        <p>You have chosen to write your own code to retrieve a holdout dataset for meta-feature generation</p>
        <CodeMirror value={this.props.value} 
        onChange={this.props.onChange} options={options}/>
      </div>
    )
  }
}

class MetaFeatureExtraction extends Component {
  constructor(props) {
    super(props);
    this.state = {
      config: {
        "method": 'cv',
        "split_ratio": 0.1,
        "seed": 8,
        "source": '',
        "folds": 5
      },
      showClearModal: false
    };
  }

  // Get request from server to populate fields
  componentDidMount() {
    fetch('/ensemble/extraction/meta-feature-generation/?path=' + this.props.path)
    .then(response => response.json())
    .then(json => {
      console.log(json);
      this.savedConfig = $.extend({}, this.state.config, json);
      this.setState({
        config: this.savedConfig
      })
    });
  }

  handleConfigChange(option, val) {
    console.log(option);
    console.log(val);
    var config = JSON.parse(JSON.stringify(this.state.config));
    config[option] = val;
    this.props.setSame(isEqual(config, this.savedConfig));
    this.setState({config});
  }

  clearChanges() {
    this.setState({config: this.savedConfig});
    this.props.setSame(true);
    this.props.addNotification({
      title: 'Success',
      message: 'Cleared all unsaved changes',
      level: 'success'
    });
  }

  // Save all changes to server
  saveSetup() {
    var payload = this.state.config;

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
      this.savedConfig = json;
      this.props.setSame(true);
      this.setState({
        config: json
      });
      this.props.addNotification({
        title: 'Success',
        message: 'Saved meta-feature extraction method',
        level: 'success'
      });
    });
  }

  render() {
    return <div className='MainDataExtraction'>
      <h3> MetaFeature Generation Method </h3>
      <div>
        <input type='radio' value="cv" 
        name="meta_feature_method"
        checked={this.state.config.method === 'cv'}
        onChange={() => this.handleConfigChange('method', 'cv')}/> 
        Cross-Validation
        <input type='radio' value="holdout_split" 
        name="meta_feature_method" 
        checked={this.state.config.method === 'holdout_split'}
        onChange={() => this.handleConfigChange('method', 'holdout_split')}/> 
        Split holdout set from main dataset
        <input type='radio' value="holdout_source" 
        name="meta_feature_method"
        checked={this.state.config.method === 'holdout_source'}
        onChange={() => this.handleConfigChange('method', 'holdout_source')}/> 
        Extract holdout set with source code
      </div>
      {this.state.config.method === 'cv' && 
        <CVForm folds={this.state.config.folds} 
        seed={this.state.config.seed} 
        onCVFormChange={this.onCVFormChange}
        handleConfigChange={(option, val) => this.handleConfigChange(option, val)}/>
      }
      {this.state.config.method === 'holdout_split' &&
        <SplitForm split_ratio={this.state.config.split_ratio} 
        split_seed={this.state.config.seed} 
        handleConfigChange={(option, val) => this.handleConfigChange(option, val)}/>
      }
      {this.state.config.method === 'holdout_source' &&
        <SourceForm value={this.state.config.source} 
        onChange={(src) => this.handleConfigChange('source', src)} />
      }
      <button 
        disabled={this.props.same} 
        onClick={() => this.saveSetup()}
      > 
        Save Meta-Feature Generation Setup 
      </button>
      <button 
        disabled={this.props.same} 
        onClick={() => this.setState({showClearModal: true})}>
          Clear unsaved changes
      </button>
      <ClearModal
        isOpen={this.state.showClearModal}
        onRequestClose={() => this.setState({showClearModal: false})}
        handleYes={() => this.clearChanges()}
      />
    </div>
  }
}

export default MetaFeatureExtraction;
