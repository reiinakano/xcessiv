import React, { Component } from 'react';
import './MainDataExtraction.css';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';
import { isEqual } from 'lodash';


class TestDataExtraction extends Component {
  constructor(props) {
    super(props);
    this.state = {config: {
    	"method": null
      },
      same: true
	};
    this.handleOptionChange = this.handleOptionChange.bind(this);
    this.saveSetup = this.saveSetup.bind(this);
  }

  handleOptionChange(event) {
    var new_option = event.target.value;

    // special case since radiobutton value can't be null
    if (new_option === 'NONE') {
      new_option = null;
    }

    var newConfig = JSON.parse(JSON.stringify(this.state.config));
    newConfig.method = new_option;
    console.log(event.target.value);
    console.log(isEqual(newConfig, this.oldConfig))
    this.setState({
      config: newConfig,
      same: isEqual(newConfig, this.oldConfig)
    })
  }

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
      })
      .then(response => response.json())
      .then(json => {
	  	console.log(json)
	  	this.oldConfig = json
	    this.setState({
	      config: json,
	      same: true
	    })
	  });
  }

  componentDidMount() {
  	fetch('/ensemble/extraction/test-dataset/?path=' + this.props.path)
	  .then(response => response.json())
	  .then(json => {
	  	console.log(json)
	  	this.oldConfig = json
	    this.setState({
	      config: json,
	      same: true
	    })
	  });
  }

  render() {

  	return <div className='MainDataExtraction'>
  	  <h2> Test Dataset Extraction Setup </h2>
  	  <h3> Test Dataset Extraction Method </h3>
      <div onChange={this.setMethod}>
        <input type='radio' value="NONE" 
        name="method"
        checked={this.state.config.method === null}
        onChange={this.handleOptionChange}/> No test dataset
        <input type='radio' value="split_from_main" 
        name="method" 
        checked={this.state.config.method === 'split_from_main'}
        onChange={this.handleOptionChange}/> Split from main dataset
        <input type='radio' value="source" 
        name="method"
        checked={this.state.config.method === 'source'}
        onChange={this.handleOptionChange}/> Extract with source code
      </div>
      <button disabled={this.state.same} onClick={this.saveSetup}> Save Test Dataset Extraction Setup </button>
  	</div>
  }
}

export default TestDataExtraction;
