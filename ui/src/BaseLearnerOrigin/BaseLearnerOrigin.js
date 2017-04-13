import React, { Component } from 'react';
import './BaseLearnerOrigin.css';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';
import ContentEditable from 'react-contenteditable';
import MetricGenerators from './MetricGenerators';
import { isEqual, omit } from 'lodash';
import $ from 'jquery';

function ValidationResults(props) {
  const items = [];
  for (var key in props.validation_results) {
      items.push(<li key={key}>{key + ': ' + props.validation_results[key]}</li>)
    }
  return <div>
    <h4>Base learner metrics on toy data</h4>
    <ul>{items}</ul>
  </div>
}

class BaseLearnerOrigin extends Component {

  constructor(props) {
    super(props);
    this.state = {
      name: 'Edit base learner origin name',
      meta_feature_generator: '',
      metric_generators: {'Accuracy': ''},
      source: '',
      final: false,
      validation_results: {},
      same: true
    };
    this.handleChangeTitle = this.handleChangeTitle.bind(this);
    this.handleChangeSource = this.handleChangeSource.bind(this);
    this.handleChangeMetaFeatureGenerator = this.handleChangeMetaFeatureGenerator.bind(this);
    this.handleChangeMetricGenerator = this.handleChangeMetricGenerator.bind(this);
    this.clearChanges = this.clearChanges.bind(this);
    this.saveSetup = this.saveSetup.bind(this);
    this.verifyLearner = this.verifyLearner.bind(this);
  }

  // Returns true if changing value of 'key' to 'value' in state will result in
  // different state from that stored in database.
  stateNoChange(key, value) {
    var nextState = omit(this.state, 'same');
    nextState[key] = value
    return isEqual(nextState, this.savedState);
  }

  // Get request from server to populate fields
  componentDidMount() {
    fetch('/ensemble/base-learner-origins/' + this.props.id + '/?path=' + this.props.path)
    .then(response => response.json())
    .then(json => {
      console.log(json)
      this.savedState = omit(json, 'id');
      this.setState(this.savedState);
    });
  }

  // Change name of base learner origin
  handleChangeTitle(evt) {
    console.log(evt.target.value);
    console.log(this.stateNoChange('name', evt.target.value));
    this.setState({name: evt.target.value, 
      same: this.stateNoChange('name', evt.target.value)});
  }

  // Change source code
  handleChangeSource(value) {
    console.log(value);
    this.setState({source: value,
      same: this.stateNoChange('source', value)});
  }

  // Change meta-feature generator
  handleChangeMetaFeatureGenerator(event) {
    console.log(event.target.value);
    this.setState({meta_feature_generator: event.target.value,
      same: this.stateNoChange('meta_feature_generator', event.target.value)});
  }

  // Change metric generator
  handleChangeMetricGenerator(metric_name, source) {
    console.log(metric_name);
    console.log(source);
    var new_metric_generators = JSON.parse(JSON.stringify(this.state.metric_generators));
    new_metric_generators[metric_name] = source;
    this.setState({
      metric_generators: new_metric_generators,
      same: this.stateNoChange('metric_generators', new_metric_generators)
    });
  }

  // Clear any unsaved changes
  clearChanges() {
    if (confirm('Are you sure you want to clear all unsaved changes?')) {
      this.setState($.extend({}, {same: true}, this.savedState));
    }
  }

  // Save any changes to server
  saveSetup() {
    var payload = {
      name: this.state['name'],
      meta_feature_generator: this.state['meta_feature_generator'],
      metric_generators: this.state['metric_generators'],
      source: this.state['source']
    };

    fetch(
      '/ensemble/base-learner-origins/' + this.props.id + '/?path=' + this.props.path,
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
      this.savedState = omit(json, 'id');
      this.setState($.extend({}, {same: true}, this.savedState));
    });
  }

  // Verify Base Learner Origin + Metric Generators
  verifyLearner() {

    fetch(
      '/ensemble/base-learner-origins/' + this.props.id + '/verify/?path=' + this.props.path,
      )
      .then(response => response.json())
      .then(json => {
      console.log(json)
      this.savedState = omit(json, 'id');
      this.setState($.extend({}, {same: true}, this.savedState));
    });
  }

  render() {
    var options = {
      lineNumbers: true,
      indentUnit: 4
    };

    return (
      <div className='BaseLearnerOrigin'>
        <h3>
          {!this.state.same && '*'}
          <ContentEditable html={this.state.name} 
          disabled={false} 
          onChange={this.handleChangeTitle} />
        </h3>
        <CodeMirror value={this.state.source} 
        onChange={this.handleChangeSource} 
        options={options}/>
        <div className='SplitFormLabel'>
          <label>
            Meta-feature generator method: 
            <input type='text' 
            value={this.state.meta_feature_generator} 
            onChange={this.handleChangeMetaFeatureGenerator}/>
          </label>
        </div>
        <MetricGenerators 
        generators={this.state.metric_generators} 
        onGeneratorChange={this.handleChangeMetricGenerator} />
        <ValidationResults validation_results={this.state.validation_results} />
        <button disabled={this.state.same}
        onClick={this.clearChanges}> Clear unsaved changes </button>
        <button disabled={this.state.same} 
        onClick={this.saveSetup}> Save Base Learner Setup</button>
        <button disabled={!this.state.same} 
        onClick={this.verifyLearner}>Verify on toy data</button>
      </div>
    )
  }
}


export default BaseLearnerOrigin;
