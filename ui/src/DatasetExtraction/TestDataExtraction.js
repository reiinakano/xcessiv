import React, { Component } from 'react';
import './MainDataExtraction.css';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';
import { isEqual } from 'lodash';
import $ from 'jquery';
import { ClearModal } from './Modals';
import { Button, ButtonToolbar } from 'react-bootstrap';

function NoTestMessage(props) {
  return <p>You have chosen not to use a test dataset.</p>
}

class SplitForm extends Component {
  render() {

    return (
      <div>
        <p>You have chosen to split off a test dataset from the main dataset</p>
        <div className='SplitFormLabel'>
          <label>
            Test Dataset Ratio:
            <input 
              name='ratioValue' 
              type='number' 
              step='0.001' 
              min='0' 
              max='1' 
              value={this.props.split_ratio} 
              onChange={(evt) => this.props.handleConfigChange('split_ratio', parseFloat(evt.target.value))}/>
          </label>
        </div>
        <div className='SplitFormLabel'>
          <label>
            Random Seed:
            <input 
              name='seedValue' 
              type='number' 
              value={this.props.split_seed} 
              onChange={(evt) => this.props.handleConfigChange('split_seed', parseInt(evt.target.value, 10))}/>
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
        <p>You have chosen to write your own code to retrieve a test dataset</p>
        <CodeMirror value={this.props.value} 
        onChange={this.props.onChange} options={options}/>
      </div>
    )
  }
}

class TestDataExtraction extends Component {
  constructor(props) {
    super(props);
    this.state = {
      config: {
      	"method": null,
        "split_ratio": 0.1,
        "split_seed": 8,
        "source": ''
      },
      showClearModal: false
  	};
  }

  // Get request from server to populate fields
  componentDidMount() {
    fetch('/ensemble/extraction/test-dataset/?path=' + this.props.path)
    .then(response => response.json())
    .then(json => {
      console.log(json);
      this.savedConfig = $.extend({}, this.state.config, json);
      this.setState({
        config: this.savedConfig
      });
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
      '/ensemble/extraction/test-dataset/?path=' + this.props.path,
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
        message: 'Saved test dataset extraction method',
        level: 'success'
      });
	  });
  }

  render() {

  	return <div className='MainDataExtraction'>
  	  <h3> Test Dataset Extraction Method </h3>
      <div>
        <input type='radio' value="NONE" 
        name="test_extraction_method"
        checked={this.state.config.method === null}
        onChange={() => this.handleConfigChange('method', null)}/> 
        No test dataset
        <input type='radio' value="split_from_main" 
        name="test_extraction_method" 
        checked={this.state.config.method === 'split_from_main'}
        onChange={() => this.handleConfigChange('method', 'split_from_main')}/> 
        Split from main dataset
        <input type='radio' value="source" 
        name="test_extraction_method"
        checked={this.state.config.method === 'source'}
        onChange={() => this.handleConfigChange('method', 'source')}/> 
        Extract with source code
      </div>
      {this.state.config.method === 'split_from_main' && 
        <SplitForm split_ratio={this.state.config.split_ratio} 
        split_seed={this.state.config.split_seed} 
        handleConfigChange={(option, val) => this.handleConfigChange(option, val)}/>
      }
      {this.state.config.method === null && <NoTestMessage />}
      {this.state.config.method === 'source' &&
        <SourceForm value={this.state.config.source} 
        onChange={(x) => this.handleConfigChange('source', x)} />
      }
      <ButtonToolbar>
        <Button 
          bsStyle="primary"
          disabled={this.props.same} 
          onClick={() => this.saveSetup()}
        > 
          Save Test Dataset Extraction Setup 
        </Button>
        <Button 
          disabled={this.props.same} 
          onClick={() => this.setState({showClearModal: true})}>
            Clear unsaved changes
        </Button>
      </ButtonToolbar>
      <ClearModal
        isOpen={this.state.showClearModal}
        onRequestClose={() => this.setState({showClearModal: false})}
        handleYes={() => this.clearChanges()}
      />
  	</div>
  }
}

export default TestDataExtraction;
