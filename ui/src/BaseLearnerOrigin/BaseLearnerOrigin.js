import React, { Component } from 'react';
import './BaseLearnerOrigin.css';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';
import ContentEditable from 'react-contenteditable';
import MetricGenerators from './MetricGenerators';
import 'rc-collapse/assets/index.css';
import Collapse, { Panel } from 'rc-collapse';
import { isEqual, pick } from 'lodash';
import $ from 'jquery';
import ReactModal from 'react-modal';
import FaCheck from 'react-icons/lib/fa/check';
import FaSpinner from 'react-icons/lib/fa/spinner';
import FaExclamationCircle from 'react-icons/lib/fa/exclamation-circle'

const serverProps = ['name', 
                     'meta_feature_generator', 
                     'metric_generators',
                     'source',
                     'final',
                     'validation_results'];

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

function handleErrors(response) {
  if (!response.ok) {
    var error = new Error(response.statusText);

    // Unexpected error
    if (response.status === 500) {
      error.errMessage = 'Unexpected error';
      throw error;
    }
    return response.json()
      .then(errorBody => {
        error.errMessage = errorBody.message
        throw error;
      });
  }
  return response;
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
      activeKey: [],
      asyncStatus: '',
      errorMessage: ''
    };
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
      this.savedState = pick(json, serverProps);
      this.setState(this.savedState);
    });
  }

  handleDataChange(key, value) {
    console.log(key);
    console.log(value);
    var savedState = this.savedState;

    this.setState((prevState) => {
      prevState = pick(prevState, serverProps);

      var newState = $.extend({}, prevState); // Copy
      newState[key] = value;
      newState['same'] = isEqual(newState, savedState);
      return newState;
    })
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
      this.savedState = pick(json, serverProps);
      this.setState($.extend({}, {same: true}, this.savedState));
    });
  }

  // Verify Base Learner Origin + Metric Generators
  verifyLearner() {
    this.setState({asyncStatus: 'Verifying...'});
    fetch(
      '/ensemble/base-learner-origins/' + this.props.id + '/verify/?path=' + this.props.path,
    )
    .then(handleErrors)
    .then(response => response.json())
    .then(json => {
      console.log(json)
      this.savedState = pick(json, serverProps);
      this.setState($.extend({}, {same: true, asyncStatus: '', errorMessage: ''}, this.savedState));
    })
    .catch(error => {
      console.log(error.message);
      console.log(error.errMessage);
      var errorMessage = error.message + ' ' + error.errMessage
      this.setState({asyncStatus: '', errorMessage: errorMessage});
    });
  }

  // Confirm Base Learner Origin
  confirmLearner() {
    this.setState({
      asyncStatus: 'Finalizing base learner...',
      showFinalizeModal: false
    });
    fetch(
      '/ensemble/base-learner-origins/' + this.props.id + '/confirm/?path=' + this.props.path,
      )
    .then(handleErrors)
    .then(response => response.json())
    .then(json => {
      console.log(json)
      this.savedState = pick(json, serverProps);
      this.setState($.extend({}, {same: true, asyncStatus: '', errorMessage: ''}, this.savedState));
    })
    .catch(error => {
      console.log(error.message);
      console.log(error.errMessage);
      var errorMessage = error.message + ' ' + error.errMessage
      this.setState({asyncStatus: '', errorMessage: errorMessage});
    });;
  }

  handleOpenFinalizeModal() {
    this.setState({showFinalizeModal: true});
  }

  handleCloseFinalizeModal() {
    this.setState({showFinalizeModal: false});
  }

  render() {
    var disableAll = (this.state.final || Boolean(this.state.asyncStatus));

    var options = {
      lineNumbers: true,
      indentUnit: 4,
      readOnly: disableAll
    };

    var showExlamationCircle = !this.state.asyncStatus && Boolean(this.state.errorMessage);

    var header = <b>
      {(!this.state.same ? '* ' : ' ')}
      {'ID: ' + this.props.id + ' '}
      {this.state.name + ' '} 
      {this.state.final && <FaCheck />}
      {Boolean(this.state.asyncStatus) && (this.state.asyncStatus + ' ')}
      {Boolean(this.state.asyncStatus) && <FaSpinner className='load-animate'/>}
      {showExlamationCircle && <FaExclamationCircle />}
    </b>

    return (
      <div>
      <Collapse activeKey={this.state.activeKey} onChange={(activeKey) => this.onActiveChange(activeKey)}
        accordion={false}>
        <Panel key={this.props.id} header={header}>

          <h3>
            <ContentEditable html={this.state.name} 
            disabled={disableAll} 
            onChange={(evt) => this.handleDataChange('name', evt.target.value)} />
          </h3>

          <h4>
            {this.state.final && 'This base learner setup has been finalized and can no longer be modified.'}
          </h4>

          <h4>
            {this.state.errorMessage}
          </h4>

          <CodeMirror value={this.state.source} 
          onChange={(src) => this.handleDataChange('source', src)} 
          options={options}/>

          <div className='SplitFormLabel'>
            <label>
              Meta-feature generator method: 
              <input type='text' readOnly={disableAll}
              value={this.state.meta_feature_generator} 
              onChange={(evt) => this.handleDataChange('meta_feature_generator', evt.target.value)}/>
            </label>
          </div>

          <MetricGenerators 
          disabled={disableAll}
          generators={this.state.metric_generators} 
          handleGeneratorChange={(gen) => this.handleDataChange('metric_generators', gen)} />

          <ValidationResults validation_results={this.state.validation_results} />

          <button disabled={this.state.same || disableAll}
          onClick={() => this.handleOpenClearModal()}> Clear unsaved changes </button>
          <ClearModal isOpen={this.state.showClearModal} 
          onRequestClose={() => this.handleCloseClearModal()}
          handleYes={() => this.clearChanges()} />

          <button disabled={this.state.same || disableAll} 
          onClick={() => this.saveSetup()}> Save Base Learner Setup</button>

          <button disabled={!this.state.same || disableAll} 
          onClick={() => this.verifyLearner()}>Verify on toy data</button>

          <button disabled={!this.state.same || disableAll}
          onClick={() => this.handleOpenFinalizeModal()}>Finalize Base Learner Setup</button>
          <FinalizeModal isOpen={this.state.showFinalizeModal} 
          onRequestClose={() => this.handleCloseFinalizeModal()}
          handleYes={() => this.confirmLearner()} />

          <button onClick={() => this.handleOpenDeleteModal()}>Delete Base Learner Setup</button>
          <DeleteModal isOpen={this.state.showDeleteModal}
          onRequestClose={() => this.handleCloseDeleteModal()}
          handleYes={() => this.handleDeleteLearner()} />

        </Panel>
      </Collapse>
      </div>
    )
  }
}


export default BaseLearnerOrigin;
