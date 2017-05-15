import React, { Component } from 'react';
import './MainDataExtraction.css';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';
import { isEqual } from 'lodash';
import $ from 'jquery';
import { ClearModal } from './Modals';
import { Button, ButtonToolbar, DropdownButton, MenuItem, Glyphicon,
  Form, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';

function NoTestMessage(props) {
  return <p></p>
}

class SplitForm extends Component {
  render() {

    return (
      <div>
        <Form>
          <FormGroup
            controlId='formRatio'
          >
            <ControlLabel>Test Dataset Ratio</ControlLabel>
            <FormControl
              type='number'
              value={this.props.split_ratio}
              step='0.001' 
              min='0' 
              max='1' 
              onChange={(evt) => this.props.handleConfigChange('split_ratio', parseFloat(evt.target.value))}
            />
          </FormGroup>
          <FormGroup
            controlId='formRatio'
          >
            <ControlLabel>Random Seed</ControlLabel>
            <FormControl
              type='number'
              value={this.props.split_seed}
              onChange={(evt) => this.props.handleConfigChange('split_seed', parseInt(evt.target.value, 10))}
            />
          </FormGroup>
        </Form>
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

  fetchTde(path) {
    fetch('/ensemble/extraction/test-dataset/?path=' + path)
    .then(response => response.json())
    .then(json => {
      console.log(json);
      this.savedConfig = $.extend({}, this.state.config, json);
      this.setState({
        config: this.savedConfig
      });
    });
  }

  componentDidMount() {
    this.fetchTde(this.props.path);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.path !== nextProps.path) {
      this.fetchTde(nextProps.path);
    }
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
    const options = {
      null: 'No test dataset',
      split_from_main: 'Split from main dataset',
      source: 'Extract with source code'
    }

  	return <div className='MainDataExtraction'>
  	  <h5> Choose how to extract your test dataset </h5>
      <DropdownButton 
        title={options[this.state.config.method]} 
        id={'testdropdown'}
        onSelect={(x) => this.handleConfigChange('method', x)}>
        <MenuItem eventKey={null}>{options[null]}</MenuItem>
        <MenuItem eventKey={'split_from_main'}>{options['split_from_main']}</MenuItem>
        <MenuItem eventKey={'source'}>{options['source']}</MenuItem>
      </DropdownButton>
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
          <Glyphicon glyph="save" />
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
