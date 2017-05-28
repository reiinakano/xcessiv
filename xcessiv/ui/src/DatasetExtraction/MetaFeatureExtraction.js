import React, { Component } from 'react';
import './MainDataExtraction.css';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';
import { isEqual } from 'lodash';
import { ClearModal, PresetCVSettingsModal } from './Modals';
import { Button, ButtonToolbar, Glyphicon } from 'react-bootstrap';

class MetaFeatureExtraction extends Component {
  constructor(props) {
    super(props);
    this.state = {
      unsavedConfig: this.props.config,
      showClearModal: false,
      showPresetCVSettingsModal: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.config !== nextProps.config) {
      this.setState({
        unsavedConfig: nextProps.config
      })
    }
  }

  handleConfigChange(option, val) {
    var config = JSON.parse(JSON.stringify(this.state.unsavedConfig));
    config[option] = val;
    this.props.setSame(isEqual(this.props.config, config));
    this.setState({unsavedConfig: config})
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
    return <div className='MainDataExtraction'>
      <h5>Cross-validation iterator Source Code</h5>
      <CodeMirror value={this.state.unsavedConfig.source} 
      onChange={(src) => this.handleConfigChange('source', src)} 
      options={options}/>
      <ButtonToolbar>
        <Button 
          bsStyle="primary"
          disabled={this.props.same} 
          onClick={() => {
            this.props.saveConfig(this.state.unsavedConfig);
          }}
        > 
          <Glyphicon glyph="save" />
          Save Meta-Feature Generation Setup 
        </Button>
        <Button 
          disabled={this.props.same} 
          onClick={() => this.setState({showClearModal: true})}>
            Clear unsaved changes
        </Button>
        <Button 
          onClick={() => this.setState({showPresetCVSettingsModal: true})}>
            Choose preset CV
        </Button>
      </ButtonToolbar>
      <ClearModal
        isOpen={this.state.showClearModal}
        onRequestClose={() => this.setState({showClearModal: false})}
        handleYes={() => this.clearChanges()}
      />
      <PresetCVSettingsModal 
        isOpen={this.state.showPresetCVSettingsModal} 
        onRequestClose={() => this.setState({showPresetCVSettingsModal: false})}
        presetCVs={this.props.presetCVs}
        apply={(obj) => {
          this.handleConfigChange('source', obj.value.source);
        }} />
    </div>
  }
}

export default MetaFeatureExtraction;
