import React, { Component } from 'react';
import './MainDataExtraction.css';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';
import { isEqual } from 'lodash';
import $ from 'jquery';
import { ClearModal } from './Modals';
import { Button, ButtonToolbar, DropdownButton, MenuItem, Glyphicon,
  Form, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';

class CVForm extends Component {
  render() {

    return (
      <div>
        <Form>
          <FormGroup
            controlId='foldsValue'
          >
            <ControlLabel>Number of folds</ControlLabel>
            <FormControl
              type='number'
              value={this.props.folds}
              min='2' 
              onChange={(evt) => this.props.handleConfigChange('folds', parseInt(
                evt.target.value, 10))}            
            />
          </FormGroup>
          <FormGroup
            controlId='seedValue'
          >
            <ControlLabel>Random Seed</ControlLabel>
            <FormControl
              type='number'
              value={this.props.seed}
              onChange={(evt) => this.props.handleConfigChange('seed', parseInt(
                evt.target.value, 10))}          
            />
          </FormGroup>
        </Form>
      </div>
    )
  }
}

class SplitForm extends Component {
  render() {

    return (
      <div>
        <Form>
          <FormGroup
            controlId='ratioValue'
          >
            <ControlLabel>Holdout Dataset Ratio</ControlLabel>
            <FormControl
              type='number' 
              step='0.001' 
              min='0' 
              max='1' 
              value={this.props.split_ratio} 
              onChange={(evt) => this.props.handleConfigChange('split_ratio',
                parseFloat(evt.target.value))}            
            />
          </FormGroup>
          <FormGroup
            controlId='ratioValue'
          >
            <ControlLabel>Random Seed</ControlLabel>
            <FormControl
              type='number' 
              value={this.props.split_seed} 
              onChange={(evt) => this.props.handleConfigChange('seed',
                parseInt(evt.target.value, 10))}            
            />
          </FormGroup>
        </Form>
      </div>
    )
  }
}


class SourceForm extends Component {
  render() {
    var options = {
      lineNumbers: true,
      indentUnit: 4
    };
    return (
      <div>
        <CodeMirror value={this.props.value} 
        onChange={this.props.onChange} options={options}/>
      </div>
    )
  }
}

class MetaFeatureExtraction extends Component {
  constructor(props) {
    super(props);
    this.state = {
      config: {
        "method": 'cv',
        "split_ratio": 0.1,
        "seed": 8,
        "source": '',
        "folds": 5
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
    const options = {
      cv: 'Stratified Cross-validation',
      holdout_split: 'Split holdout set from main dataset',
      holdout_source: 'Extract holdout set with source code'
    }

    return <div className='MainDataExtraction'>
      <h5> Choose your method of extracting meta-features </h5>
      <DropdownButton 
        title={options[this.state.config.method]} 
        id={'metafeaturedropdown'}
        onSelect={(x) => this.handleConfigChange('method', x)}>
        <MenuItem eventKey={'cv'}>{options['cv']}</MenuItem>
        <MenuItem eventKey={'holdout_split'}>{options['holdout_split']}</MenuItem>
        <MenuItem eventKey={'holdout_source'}>{options['holdout_source']}</MenuItem>
      </DropdownButton>
      {this.state.config.method === 'cv' && 
        <CVForm folds={this.state.config.folds} 
        seed={this.state.config.seed} 
        onCVFormChange={this.onCVFormChange}
        handleConfigChange={(option, val) => this.handleConfigChange(option, val)}/>
      }
      {this.state.config.method === 'holdout_split' &&
        <SplitForm split_ratio={this.state.config.split_ratio} 
        split_seed={this.state.config.seed} 
        handleConfigChange={(option, val) => this.handleConfigChange(option, val)}/>
      }
      {this.state.config.method === 'holdout_source' &&
        <SourceForm value={this.state.config.source} 
        onChange={(src) => this.handleConfigChange('source', src)} />
      }
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
