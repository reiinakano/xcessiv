import React, { Component } from 'react';
import './MainDataExtraction.css';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';

class MainDataExtraction extends Component {

  constructor(props) {
    super(props);
    this.state = {newCode: '', same: true};
    this.newSource = this.newSource.bind(this);
    this.saveSetup = this.saveSetup.bind(this);
  }

  componentDidMount() {
  	fetch('/ensemble/extraction/main-dataset/?path=' + this.props.path)
	  .then(response => response.json())
	  .then(json => {
	  	console.log(json)
	  	this.oldCode = json.source
	    this.setState({
	      newCode: this.oldCode,
	      same: true
	    })
	  });
  }

  saveSetup() {
    var payload = {
    	"source": this.state.newCode
    };

    fetch(
      '/ensemble/extraction/main-dataset/?path=' + this.props.path,
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
	  	this.oldCode = json.source
	    this.setState({
	      newCode: this.oldCode,
	      same: true
	    })
	  });
  }

  newSource(newCode) {
  	console.log('change newCode to ' + newCode);
  	console.log(newCode === this.oldCode);
  	this.setState({
  		newCode: newCode,
  	  	same: newCode === this.oldCode
  	  })
  }

  render() {
    var options = {
      lineNumbers: true,
      indentUnit: 4
    };
  	return <div className='MainDataExtraction'>
  	  <h2> Main Dataset Extraction Setup {!this.state.same && '*'}</h2>
  	  <h3> Main Dataset Extraction Source </h3>
  	  <CodeMirror value={this.state.newCode} onChange={this.newSource} options={options}/>
  	  <button disabled={this.state.same} onClick={this.saveSetup}> Save Main Dataset Extraction Setup </button>
  	</div>
  }
}

export default MainDataExtraction;
