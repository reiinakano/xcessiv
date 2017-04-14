import React, { Component } from 'react';
import './BaseLearnerOrigin.css';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';
import ContentEditable from 'react-contenteditable';
import MetricGenerators from './MetricGenerators';
import 'rc-collapse/assets/index.css';
import Collapse, { Panel } from 'rc-collapse';
import { isEqual, omit } from 'lodash';
import $ from 'jquery';
import ReactModal from 'react-modal';
import FaCheck from 'react-icons/lib/fa/check';

const default_metric_generator_code = `def metric_generator(y_true, y_probas):
    """This function must return a numerical value given two numpy arrays 
    containing the ground truth labels and generated meta-features, in that order.
    (In this example, \`y_true\` and \`y_probas\`)
    """
    return 0.88
`

const modalStyle = {
  overlay : {
    zIndex            : 1000
  },
  content : {
    top                        : '50%',
    left                       : '50%',
    right                      : 'auto',
    bottom                     : 'auto',
    marginRight                : '-50%',
    transform                  : 'translate(-50%, -50%)',
    border                     : '1px solid #ccc',
    background                 : '#fff',
    overflow                   : 'auto',
    WebkitOverflowScrolling    : 'touch',
    borderRadius               : '4px',
    outline                    : 'none',
    padding                    : '20px'
  }
}

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

function ClearModal(props) {
  return (
    <ReactModal 
      isOpen={props.isOpen} 
      onRequestClose={props.onRequestClose}
      contentLabel='Clear Changes'
      style={modalStyle}
    >
      <p>Are you sure you want to clear all unsaved changes?</p>
      <button onClick={props.onRequestClose}>Cancel</button>
      <button onClick={props.handleYes}>Yes</button>
    </ReactModal>
  )
}

function FinalizeModal(props) {
  return (
    <ReactModal 
      isOpen={props.isOpen} 
      onRequestClose={props.onRequestClose}
      contentLabel='Finalize Base learner'
      style={modalStyle}
    >
      <p>Are you sure you want to finalize this base learner setup?</p>
      <p>You will no longer be allowed to make changes to this base 
      learner after this</p>
      <button onClick={props.onRequestClose}>Cancel</button>
      <button onClick={props.handleYes}>Yes</button>
    </ReactModal>
  )
}

function DeleteModal(props) {
  return (
    <ReactModal 
      isOpen={props.isOpen} 
      onRequestClose={props.onRequestClose}
      contentLabel='Delete Base learner'
      style={modalStyle}
    >
      <p>Are you sure you want to delete this base learner setup?</p>
      <p>You will also lose all base learners that have been scored using this setup</p>
      <p><strong>This action is irreversible.</strong></p>
      <button onClick={props.onRequestClose}>Cancel</button>
      <button onClick={props.handleYes}>Yes</button>
    </ReactModal>
  )
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
      same: true,
      showClearModal: false,
      showFinalizeModal: false,
      showDeleteModal: false,
      activeKey: []
    };
    this.onActiveChange = this.onActiveChange.bind(this);
    this.handleChangeTitle = this.handleChangeTitle.bind(this);
    this.handleChangeSource = this.handleChangeSource.bind(this);
    this.handleChangeMetaFeatureGenerator = this.handleChangeMetaFeatureGenerator.bind(this);
    this.handleChangeMetricGenerator = this.handleChangeMetricGenerator.bind(this);
    this.handleAddMetricGenerator = this.handleAddMetricGenerator.bind(this);
    this.handleDeleteMetricGenerator = this.handleDeleteMetricGenerator.bind(this);
    this.clearChanges = this.clearChanges.bind(this);
    this.handleOpenClearModal = this.handleOpenClearModal.bind(this);
    this.handleCloseClearModal = this.handleCloseClearModal.bind(this);
    this.saveSetup = this.saveSetup.bind(this);
    this.verifyLearner = this.verifyLearner.bind(this);
    this.confirmLearner = this.confirmLearner.bind(this);
    this.handleOpenFinalizeModal = this.handleOpenFinalizeModal.bind(this);
    this.handleCloseFinalizeModal = this.handleCloseFinalizeModal.bind(this);
    this.handleOpenDeleteModal = this.handleOpenDeleteModal.bind(this);
    this.handleCloseDeleteModal = this.handleCloseDeleteModal.bind(this);
    this.handleDeleteLearner = this.handleDeleteLearner.bind(this);
  }

  // Returns true if changing value of 'key' to 'value' in state will result in
  // different state from that stored in database.
  stateNoChange(key, value) {
    var nextState = omit(this.state, ['same', 'showClearModal', 'showFinalizeModal', 'activeKey']);
    nextState[key] = value
    return isEqual(nextState, this.savedState);
  }

  // Handler when active panel changes
  onActiveChange(activeKey) {
    console.log(activeKey);
    this.setState({
      activeKey
    });
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

  // Add new metric generator
  handleAddMetricGenerator(metric_name) {
    console.log(metric_name);
    if (!(metric_name in this.state.metric_generators)) {
      var new_metric_generators = JSON.parse(JSON.stringify(this.state.metric_generators));
      new_metric_generators[metric_name] = default_metric_generator_code;
      this.setState({
        metric_generators: new_metric_generators,
        same: this.stateNoChange('metric_generators', new_metric_generators)
      });
    }
  }

  // Delete metric generator
  handleDeleteMetricGenerator(metric_name) {
    if (metric_name in this.state.metric_generators) {
      var new_metric_generators = omit(this.state.metric_generators, metric_name);
      this.setState({
        metric_generators: new_metric_generators,
        same: this.stateNoChange('metric_generators', new_metric_generators)
      });
    }
  }

  // Clear any unsaved changes
  clearChanges() {
    this.setState($.extend({}, {same: true, showClearModal: false}, this.savedState));
  }

  handleOpenClearModal() {
    this.setState({showClearModal: true});
  }

  handleCloseClearModal() {
    this.setState({showClearModal: false});
  }

  handleOpenDeleteModal() {
    this.setState({showDeleteModal: true});
  }

  handleCloseDeleteModal() {
    this.setState({showDeleteModal: false});
  }

  handleDeleteLearner() {
    this.props.deleteLearner(this.props.id);
    this.handleCloseDeleteModal();
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

  // Confirm Base Learner Origin
  confirmLearner() {
    fetch(
      '/ensemble/base-learner-origins/' + this.props.id + '/confirm/?path=' + this.props.path,
      )
      .then(response => response.json())
      .then(json => {
      console.log(json)
      this.savedState = omit(json, 'id');
      this.setState($.extend({}, {same: true, showFinalizeModal: false}, this.savedState));
    });
  }

  handleOpenFinalizeModal() {
    this.setState({showFinalizeModal: true});
  }

  handleCloseFinalizeModal() {
    this.setState({showFinalizeModal: false});
  }

  render() {
    var options = {
      lineNumbers: true,
      indentUnit: 4,
      readOnly: this.state.final
    };
    var header = <b>
      {'ID: ' + this.props.id + ' '}
      {this.state.name + (!this.state.same ? '* ' : ' ')} 
      {this.state.final && <FaCheck />}
    </b>

    return (
      <div>
      <Collapse activeKey={this.state.activeKey} onChange={this.onActiveChange}
        accordion={false}>
        <Panel key={this.props.id} header={header}>
          <h3>
            <ContentEditable html={this.state.name} 
            disabled={this.state.final} 
            onChange={this.handleChangeTitle} />
          </h3>
          <h4>
            {this.state.final && 'This base learner setup has been finalized and can no longer be modified.'}
          </h4>
          <CodeMirror value={this.state.source} 
          onChange={this.handleChangeSource} 
          options={options}/>
          <div className='SplitFormLabel'>
            <label>
              Meta-feature generator method: 
              <input type='text' readOnly={this.state.final}
              value={this.state.meta_feature_generator} 
              onChange={this.handleChangeMetaFeatureGenerator}/>
            </label>
          </div>
          <MetricGenerators 
          disabled={this.state.final}
          generators={this.state.metric_generators} 
          onGeneratorChange={this.handleChangeMetricGenerator} 
          handleAddMetricGenerator={this.handleAddMetricGenerator} 
          handleDeleteMetricGenerator={this.handleDeleteMetricGenerator} />
          <ValidationResults validation_results={this.state.validation_results} />
          <button disabled={this.state.same || this.state.final}
          onClick={this.handleOpenClearModal}> Clear unsaved changes </button>
          <ClearModal isOpen={this.state.showClearModal} 
          onRequestClose={this.handleCloseClearModal}
          handleYes={this.clearChanges} />
          <button disabled={this.state.same || this.state.final} 
          onClick={this.saveSetup}> Save Base Learner Setup</button>
          <button disabled={!this.state.same || this.state.final} 
          onClick={this.verifyLearner}>Verify on toy data</button>
          <button disabled={!this.state.same || this.state.final}
          onClick={this.handleOpenFinalizeModal}>Finalize Base Learner Setup</button>
          <FinalizeModal isOpen={this.state.showFinalizeModal} 
          onRequestClose={this.handleCloseFinalizeModal}
          handleYes={this.confirmLearner} />
          <button onClick={this.handleOpenDeleteModal}>Delete Base Learner Setup</button>
          <DeleteModal isOpen={this.state.showDeleteModal}
          onRequestClose={this.handleCloseDeleteModal}
          handleYes={this.handleDeleteLearner} />
        </Panel>
      </Collapse>
      </div>
    )
  }
}


export default BaseLearnerOrigin;
