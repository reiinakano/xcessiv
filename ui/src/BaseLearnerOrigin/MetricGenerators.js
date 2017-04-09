import React, { Component } from 'react';
import './BaseLearnerOrigin.css';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';
import Collapse, { Panel } from 'rc-collapse';

function Generator(props) {
	var options = {
    lineNumbers: true,
    indentUnit: 4
  };
	return (<Panel header={props.name} key=props.name>
		<CodeMirror value={props.source} 
  	onChange={props.onSourceChange} 
  	options={options}/>
	</Panel>);
}

class MetricGenerators extends Component {
	getInitialState() {
		return {
			activeKey: []
		}
	}

	/* Used to construct a list of Generator components for inserting into the 
	accordion.
	*/
	getItems() {
		const items = [];
		for (var key in props.generators) {
			console.log(key);

		}
	}

	render() {

	}
}