import React, { Component } from 'react';
import './MainDataExtraction.css';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';
import { isEqual } from 'lodash';
import $ from 'jquery';
import { ClearModal } from './Modals';
import { Button, ButtonToolbar, Glyphicon } from 'react-bootstrap';

class MainDataExtraction extends Component {

  constructor(props) {
    super(props);
    this.state = {
      unsavedConfig: this.props.config,
      showClearModal: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.config !== nextProps.config) {
      this.setState({
        unsavedConfig: nextProps.config
      })
    }
  }

  newSource(newCode) {
  	console.log('change newCode to ' + newCode);
  	this.setState((prevState) => {
      var config = $.extend({}, prevState.unsavedConfig); // Make copy
      config.source = newCode;
      this.props.setSame(isEqual(config, this.props.config));
      return {
        unsavedConfig: config
      };
    })
  }

  clearChanges() {
    this.setState({unsavedConfig: this.props.config});
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
    	  <CodeMirror value={this.state.unsavedConfig.source} 
        onChange={(src) => this.newSource(src)} options={options}/>
        <ButtonToolbar>
      	  <Button 
          bsStyle="primary"
          disabled={this.props.same} 
          onClick={() => this.props.saveConfig(this.state.unsavedConfig)}>
            <Glyphicon glyph="save" />
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
