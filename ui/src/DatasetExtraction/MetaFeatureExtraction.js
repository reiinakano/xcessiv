import React, { Component } from 'react';
import './MainDataExtraction.css';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';
import { isEqual } from 'lodash';
import $ from 'jquery';

class CVForm extends Component {
  render() {

    return (
      <div>
        <p>You have chosen to use cross-validation to generate meta-features</p>
        <div className='SplitFormLabel'>
          <label>
            Number of folds:
            <input name='foldsValue' type='number' min='2' value={this.props.folds} onChange={this.props.onCVFormChange}/>
          </label>
        </div>
        <div className='SplitFormLabel'>
          <label>
            Random Seed:
            <input name='seedValue' type='number' value={this.props.seed} onChange={this.props.onCVFormChange}/>
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
            Test Dataset Ratio:
            <input name='ratioValue' type='number' step='0.001' min='0' max='1' value={this.props.split_ratio} onChange={this.props.onSplitFormChange}/>
          </label>
        </div>
        <div className='SplitFormLabel'>
          <label>
            Random Seed:
            <input name='seedValue' type='number' value={this.props.split_seed} onChange={this.props.onSplitFormChange}/>
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
    this.state = {config: {
    	"method": 'cv',
      "split_ratio": 0.1,
      "seed": 8,
      "source": '',
      "folds": 5
      },
      same: true
	};
    this.handleOptionChange = this.handleOptionChange.bind(this);
    this.saveSetup = this.saveSetup.bind(this);
    this.onCVFormChange = this.onCVFormChange.bind(this);
    this.onSplitFormChange = this.onSplitFormChange.bind(this);
    this.onSourceFormChange = this.onSourceFormChange.bind(this);
  }

  // Get request from server to populate fields
  componentDidMount() {
    fetch('/ensemble/extraction/meta-feature-generation/?path=' + this.props.path)
    .then(response => response.json())
    .then(json => {
      console.log(json)
      this.savedConfig = $.extend({}, this.state.config, json)
      this.setState({
        config: this.savedConfig,
        same: true
      })
    });
  }

  // Handle change in extraction method
  handleOptionChange(event) {
    var new_option = event.target.value;

    var newConfig = JSON.parse(JSON.stringify(this.state.config));
    newConfig.method = new_option;
    console.log(event.target.value);
    console.log(isEqual(newConfig, this.savedConfig))
    this.setState({
      config: newConfig,
      same: isEqual(newConfig, this.savedConfig)
    })
  }

  // Handle change in CV form
  onCVFormChange(event) {
    const target = event.target;
    const name = target.name;

    var newConfig = JSON.parse(JSON.stringify(this.state.config));
    if (name === 'foldsValue') {
      newConfig.folds = parseInt(target.value, 10);
    }
    else {
      newConfig.seed = parseInt(target.value, 10);
    }

    this.setState({
      config: newConfig,
      same: isEqual(newConfig, this.savedConfig)
    })
  }

  // Handle change in split form
  onSplitFormChange(event) {
    const target = event.target;
    const name = target.name;

    var newConfig = JSON.parse(JSON.stringify(this.state.config));
    if (name === 'ratioValue') {
      newConfig.split_ratio = parseFloat(target.value);
    }
    else {
      newConfig.seed = parseInt(target.value, 10);
    }

    this.setState({
      config: newConfig,
      same: isEqual(newConfig, this.savedConfig)
    })
  }

  //Handle change in source code form
  onSourceFormChange(value) {
    var newConfig = JSON.parse(JSON.stringify(this.state.config));
    newConfig.source = value;
    this.setState({
      config: newConfig,
      same: isEqual(newConfig, this.savedConfig)
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
      })
      .then(response => response.json())
      .then(json => {
	  	console.log(json)
	  	this.savedConfig = json
	    this.setState({
	      config: json,
	      same: true
	    })
	  });
  }

  render() {
  	return <div className='MainDataExtraction'>
  	  <h2> MetaFeature Generation Setup {!this.state.same && '*'}</h2>
  	  <h3> MetaFeature Generation Method </h3>
      <div>
        <input type='radio' value="cv" 
        name="meta_feature_method"
        checked={this.state.config.method === 'cv'}
        onChange={this.handleOptionChange}/> Cross-Validation
        <input type='radio' value="holdout_split" 
        name="meta_feature_method" 
        checked={this.state.config.method === 'holdout_split'}
        onChange={this.handleOptionChange}/> Split holdout set from main dataset
        <input type='radio' value="holdout_source" 
        name="meta_feature_method"
        checked={this.state.config.method === 'holdout_source'}
        onChange={this.handleOptionChange}/> Extract holdout set with source code
      </div>
      {this.state.config.method === 'cv' && 
        <CVForm folds={this.state.config.folds} 
        seed={this.state.config.seed} 
        onCVFormChange={this.onCVFormChange}/>
      }
      {this.state.config.method === 'holdout_split' &&
        <SplitForm split_ratio={this.state.config.split_ratio} 
        split_seed={this.state.config.seed} 
        onSplitFormChange={this.onSplitFormChange} />
      }
      {this.state.config.method === 'holdout_source' &&
        <SourceForm value={this.state.config.source} 
        onChange={this.onSourceFormChange} />
      }
      <button disabled={this.state.same} onClick={this.saveSetup}> Save Test Dataset Extraction Setup </button>
  	</div>
  }
}

export default MetaFeatureExtraction;
