import React, { Component } from 'react';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';
import './CodeBox.css'

class CodeBox extends Component {

  constructor(props) {
    super(props);
    this.state = {code: this.props.defaultText};
    this.logCode = this.logCode.bind(this);
  }

  componentDidMount() {
  	fetch('/ensemble/extraction/main-dataset/?path=test')
	  .then(response => response.json())
	  .then(json => {
	  	console.log(json)
	    this.setState({
	      code: json.source.join('')
	    })
	  });
  }

  logCode(newCode) {
  	console.log(this.state.code);
  	console.log(newCode);
  	console.log(this.CodeMirror);
  }

  render() {
    var options = {
      lineNumbers: true,
      indentUnit: 4
    };
    console.log('rendering...');
    this.CodeMirror = <CodeMirror value={this.state.code} onChange={this.logCode} options={options} />;
    return <div className='CodeBox'>
    {this.CodeMirror}
    </div>
  }
}

export default CodeBox;
