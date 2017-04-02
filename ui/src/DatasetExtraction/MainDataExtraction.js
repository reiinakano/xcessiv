import React, { Component } from 'react';
import CodeBox from '../CodeBox';
import './MainDataExtraction.css';

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
	  	this.oldCode = json.source.join('')
	    this.setState({
	      newCode: this.oldCode,
	      same: true
	    })
	  });
  }

  saveSetup() {
    var payload = {
    	"source": [this.state.newCode]
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
	  	this.oldCode = json.source.join('')
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
  	return <div className='MainDataExtraction'>
  	  <h2> Main Dataset Extraction Setup </h2>
  	  <h3> Main Dataset Extraction Source </h3>
  	  <CodeBox defaultText={this.state.newCode} onChange={this.newSource}/>
  	  <button disabled={this.state.same} onClick={this.saveSetup}> Save Main Dataset Extraction Setup </button>
  	</div>
  }
}

export default MainDataExtraction;
