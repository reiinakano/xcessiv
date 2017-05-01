import React, { Component } from 'react';
import './MainDataExtraction.css';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';
import { isEqual } from 'lodash';
import $ from 'jquery';
import { ClearModal } from './Modals';
import { Button, ButtonToolbar } from 'react-bootstrap';

class MainDataExtraction extends Component {

  constructor(props) {
    super(props);
    this.state = {
      config: {
        source: ''
      },
      showClearModal: false
    };
  }

  componentDidMount() {
  	fetch('/ensemble/extraction/main-dataset/?path=' + this.props.path)
	  .then(response => response.json())
	  .then(json => {
	  	console.log(json);
	    this.setState({config: json});
      this.savedConfig = json;
	  });
  }

  saveSetup() {
    var payload = this.state.config;

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
	  	this.savedConfig = json;
	    this.setState({
	      config: json
	    });
      this.props.setSame(true);
      this.props.addNotification({
        title: 'Success',
        message: 'Saved main dataset extraction method',
        level: 'success'
      });
	  });
  }

  newSource(newCode) {
  	console.log('change newCode to ' + newCode);
  	this.setState((prevState) => {
      var config = $.extend({}, prevState.config); // Make copy
      config.source = newCode;
      this.props.setSame(isEqual(config, this.savedConfig));
      return {
        config
      };
    })
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

  render() {
    var options = {
      lineNumbers: true,
      indentUnit: 4
    };
  	return (
      <div className='MainDataExtraction'>
    	  <h5> Main Dataset Extraction Source Code</h5>
    	  <CodeMirror value={this.state.config.source} 
        onChange={(src) => this.newSource(src)} options={options}/>
        <ButtonToolbar>
      	  <Button 
          bsStyle="primary"
          disabled={this.props.same} 
          onClick={() => this.saveSetup()}>
            Save Main Dataset Extraction Setup
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
    );
  }
}

export default MainDataExtraction;
