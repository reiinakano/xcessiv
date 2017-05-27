import React, { Component } from 'react';
import './MainDataExtraction.css';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';
import { isEqual } from 'lodash';
import $ from 'jquery';
import { ClearModal } from './Modals';
import { Button, ButtonToolbar, Glyphicon } from 'react-bootstrap';

class MetaFeatureExtraction extends Component {
  constructor(props) {
    super(props);
    this.state = {
      config: {
        "source": ''
      },
      showClearModal: false
    };
  }

  componentDidMount() {
    this.fetchMfe(this.props.path);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.path !== nextProps.path) {
      this.fetchMfe(nextProps.path);
    }
  }

  fetchMfe(path) {
    fetch('/ensemble/extraction/meta-feature-generation/?path=' + path)
    .then(response => response.json())
    .then(json => {
      console.log(json);
      this.savedConfig = $.extend({}, this.state.config, json);
      this.setState({
        config: this.savedConfig
      })
    });
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
      '/ensemble/extraction/meta-feature-generation/?path=' + this.props.path,
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
        message: 'Saved meta-feature extraction method',
        level: 'success'
      });
    });
  }

  render() {
    var options = {
      lineNumbers: true,
      indentUnit: 4
    };
    return <div className='MainDataExtraction'>
      <h5>Cross-validation iterator Source Code</h5>
      <CodeMirror value={this.state.config.source} 
      onChange={(src) => this.handleConfigChange('source', src)} 
      options={options}/>
      <ButtonToolbar>
        <Button 
          bsStyle="primary"
          disabled={this.props.same} 
          onClick={() => this.saveSetup()}
        > 
          <Glyphicon glyph="save" />
          Save Meta-Feature Generation Setup 
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

export default MetaFeatureExtraction;
