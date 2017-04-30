import React, { Component } from 'react';
import './MainDataExtraction.css';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';
import { isEqual } from 'lodash';
import $ from 'jquery';

class MainDataExtraction extends Component {

  constructor(props) {
    super(props);
    this.state = {
      unsavedData: {
        source: ''
      }, 
      same: true
    };
  }

  componentDidMount() {
  	fetch('/ensemble/extraction/main-dataset/?path=' + this.props.path)
	  .then(response => response.json())
	  .then(json => {
	  	console.log(json);
	    this.setState({unsavedData: json});
      this.serverData = json;
	  });
  }

  saveSetup() {
    var payload = this.state.unsavedData;

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
	  	this.serverData = json;
	    this.setState({
	      unsavedData: json,
	      same: true
	    });
      this.props.addNotification({
        title: 'Success',
        message: 'Saved main dataset extraction method',
        level: 'success'
      });
	  });
  }

  newSource(newCode) {
  	console.log('change newCode to ' + newCode);
  	console.log(newCode === this.oldCode);
  	this.setState((prevState) => {
      var unsavedData = $.extend({}, prevState.unsavedData); // Make copy
      unsavedData.source = newCode;
      return {
        unsavedData,
        same: isEqual(unsavedData, this.serverData)
      };
    })
  }

  render() {
    var options = {
      lineNumbers: true,
      indentUnit: 4
    };
  	return (
      <div className='MainDataExtraction'>
    	  <h2> Main Dataset Extraction Setup{!this.state.same && '*'}</h2>
    	  <h3> Main Dataset Extraction Source Code</h3>
    	  <CodeMirror value={this.state.unsavedData.source} 
        onChange={(src) => this.newSource(src)} options={options}/>
    	  <button 
        disabled={this.state.same} 
        onClick={() => this.saveSetup()}>
          Save Main Dataset Extraction Setup
        </button>
    	</div>
    );
  }
}

export default MainDataExtraction;
