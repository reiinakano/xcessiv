import React, { Component } from 'react';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';
import './CodeBox.css'

class CodeBox extends Component {

  render() {
    var options = {
      lineNumbers: true,
      indentUnit: 4
    };
    return <div className='CodeBox'>
      <CodeMirror value={this.props.defaultText} onChange={this.props.onChange} options={options} />
    </div>
  }
}

export default CodeBox;
