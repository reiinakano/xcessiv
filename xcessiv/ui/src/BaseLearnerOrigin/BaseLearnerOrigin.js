import React, { Component } from 'react';
import './BaseLearnerOrigin.css';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';
import ContentEditable from 'react-contenteditable';
import MetricGenerators from './MetricGenerators';
import 'rc-collapse/assets/index.css';
import Collapse, { Panel } from 'rc-collapse';
import { isEqual, pick, omit } from 'lodash';
import $ from 'jquery';
import FaCheck from 'react-icons/lib/fa/check';
import FaSpinner from 'react-icons/lib/fa/spinner';
import FaExclamationCircle from 'react-icons/lib/fa/exclamation-circle';
import { Button, ButtonToolbar, Glyphicon, Alert, Panel as BsPanel,
  Form, FormGroup, ControlLabel, FormControl, DropdownButton,
  MenuItem } from 'react-bootstrap';
import { MulticlassDatasetModal, CreateBaseLearnerModal, RandomSearchModal,
  GridSearchModal, DeleteModal, FinalizeModal, PresetLearnerSettingsModal,
  ClearModal } from './BaseLearnerOriginModals';

const changeableProps = [
  'name', 
  'meta_feature_generator', 
  'metric_generators', 
  'source'
];

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
        error.errMessage = JSON.stringify(errorBody);
        throw error;
      });
  }
  return response;
}

function ErrorAlert(props) {
  return (
    <Alert bsStyle='danger'>
      {props.errorMessage}
    </Alert>
  )
}

function FinalizedAlert(props) {
  return(
    <Alert bsStyle='success'>
      {'This base learner setup has been finalized and can no longer be modified.'}
    </Alert>
  )
}

function ValidationResults(props) {

  var dataset_used;
  if (props.validation_results['dataset']) {
    dataset_used = (
      <div>
        <b>{'Dataset used: ' + props.validation_results['dataset']['type']}</b>
        <ul>
          {Object.keys(omit(props.validation_results['dataset'], 'type')).map((property) => {
            return(
              <li key={property}>
                {property + ': ' + props.validation_results['dataset'][property]}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  var generated_metrics;
  if (props.validation_results['metrics']) {
    generated_metrics = (
      <div>
        <b>Learner metrics</b>
        <ul>
          {Object.keys(props.validation_results['metrics']).map((property) => {
            return(
              <li key={property}>
                {property + ': ' + props.validation_results['metrics'][property]}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return <div className='DualList'>
    <BsPanel header={<h4>Base learner metrics on toy data</h4>}>
      {dataset_used}
      {generated_metrics}
    </BsPanel>
  </div>
}

function DefaultHyperparameters(props) {
  const items = [];
  for (var key in props.hyperparameters) {
      items.push(<li key={key}>{key + ': ' + props.hyperparameters[key]}</li>)
    }
  return <div className='DualList' style={{paddingTop: '15px'}}>
    <BsPanel header={<h4>Base learner default hyperparameters</h4>}>
      <ul>{items}</ul>
    </BsPanel>
  </div>
}

class BaseLearnerOrigin extends Component {

  constructor(props) {
    super(props);
    this.state = {
      unsavedData: {
        name: this.props.data.name,
        meta_feature_generator: this.props.data.meta_feature_generator,
        metric_generators: this.props.data.metric_generators,
        source: this.props.data.source
      },
      same: true,
      showClearModal: false,
      showPresetLearnerSettingsModal: false,
      showFinalizeModal: false,
      showDeleteModal: false,
      showMulticlassDatasetModal: false,
      showCreateModal: false,
      showGridSearchModal: false,
      showRandomSearchModal: false,
      activeKey: [],
      asyncStatus: '',
      errorMessage: ''
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.data !== nextProps.data) {
      this.setState({
        unsavedData: pick(nextProps.data, changeableProps),
        same: true
      });
    }
  }

  // Handler when active panel changes
  onActiveChange(activeKey) {
    console.log(activeKey);
    this.setState({
      activeKey
    });
  }

  handleDataChange(key, value) {
    console.log(key);
    console.log(value);

    this.setState((prevState) => {

      var newState = $.extend({}, prevState); // Copy
      newState.unsavedData[key] = value;
      newState['same'] = isEqual(newState.unsavedData, 
        pick(this.props.data, changeableProps));
      return newState;
    })
  }

  // Clear any unsaved changes
  clearChanges() {
    this.setState({
      same: true, 
      showClearModal: false, 
      unsavedData: pick(this.props.data, changeableProps)
    });
  }

  handleDeleteLearner() {
    this.props.deleteLearner();
    this.setState({showDeleteModal: false});
  }

  // Save any changes to server
  saveSetup() {
    var payload = this.state.unsavedData;

    fetch(
      '/ensemble/base-learner-origins/' + this.props.data.id + '/?path=' + this.props.path,
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
      console.log(json)
      this.props.updateBaseLearnerOrigin(json);
      this.props.addNotification({
        title: 'Success',
        message: 'Successfully updated base learner',
        level: 'success'
      });
    });
  }

  // Build datasetProperties to pass to verifyLearner
  buildDatasetProperties(selectedDataset) {
    if (selectedDataset === 'iris') {
      this.verifyLearner({ type: 'iris' });
    }
    else if (selectedDataset === 'multiclass') {
      this.setState({showMulticlassDatasetModal: true});
    }
    else if (selectedDataset === 'mnist') {
      this.verifyLearner({ type: 'mnist' });
    }
    else if (selectedDataset === 'breast_cancer') {
      this.verifyLearner({ type: 'breast_cancer' });
    }
    else if (selectedDataset === 'boston') {
      this.verifyLearner({ type: 'boston' })
    }
  }

  // Verify Base Learner Origin + Metric Generators
  verifyLearner(datasetProperties) {
    var payload = { dataset_properties: datasetProperties };

    this.setState({asyncStatus: 'Verifying...'});
    fetch(
      '/ensemble/base-learner-origins/' + this.props.data.id + '/verify/?path=' + this.props.path,
      {
        method: "POST",
        body: JSON.stringify( payload ),
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      }
    )
    .then(handleErrors)
    .then(response => response.json())
    .then(json => {
      console.log(json)
      this.props.updateBaseLearnerOrigin(json);
      this.setState({asyncStatus: '', errorMessage: ''});
      this.props.addNotification({
        title: 'Success',
        message: 'Successfully verified base learner',
        level: 'success'
      });
    })
    .catch(error => {
      console.log(error.message);
      console.log(error.errMessage);
      var errorMessage = error.message + ' ' + error.errMessage
      this.setState({asyncStatus: '', errorMessage: errorMessage});
      this.props.addNotification({
        title: error.message,
        message: error.errMessage,
        level: 'error'
      });
    });
  }

  // Confirm Base Learner Origin
  confirmLearner() {
    this.setState({
      asyncStatus: 'Finalizing base learner...',
      showFinalizeModal: false
    });
    fetch(
      '/ensemble/base-learner-origins/' + this.props.data.id + '/confirm/?path=' + this.props.path,
      )
    .then(handleErrors)
    .then(response => response.json())
    .then(json => {
      console.log(json);
      this.props.updateBaseLearnerOrigin(json);
      this.setState({asyncStatus: '', errorMessage: ''});
      this.props.addNotification({
        title: 'Success',
        message: 'Successfully finalized base learner',
        level: 'success'
      });
    })
    .catch(error => {
      console.log(error.message);
      console.log(error.errMessage);
      var errorMessage = error.message + ' ' + error.errMessage
      this.setState({asyncStatus: '', errorMessage: errorMessage});
      this.props.addNotification({
        title: error.message,
        message: error.errMessage,
        level: 'error'
      });
    });;
  }

  render() {
    var disableAll = (this.props.data.final || Boolean(this.state.asyncStatus));

    var options = {
      lineNumbers: true,
      indentUnit: 4,
      readOnly: disableAll
    };

    var showExlamationCircle = !this.state.asyncStatus && Boolean(this.state.errorMessage);

    var header = <b>
      {(!this.state.same ? '* ' : ' ')}
      {'ID: ' + this.props.data.id + ' '}
      {this.state.unsavedData.name + ' '} 
      {this.props.data.final && <FaCheck style={{color: 'green'}} />}
      {Boolean(this.state.asyncStatus) && (this.state.asyncStatus + ' ')}
      {Boolean(this.state.asyncStatus) && <FaSpinner className='load-animate'/>}
      {showExlamationCircle && <FaExclamationCircle />}
      <a
        className='DeleteButton'
        onClick={(evt) => {
          evt.stopPropagation();
          this.setState({showDeleteModal: true});
        }}>
        <Glyphicon glyph="remove" />
      </a>
    </b>

    var buttonToolbar = null;
    if (!this.props.data.final) {
      buttonToolbar = (
        <ButtonToolbar>

          <Button 
            disabled={this.state.same || disableAll}
            onClick={() => this.setState({showClearModal: true})}> 
            Clear unsaved changes 
          </Button>

          <Button 
            disabled={disableAll}
            onClick={() => this.setState({showPresetLearnerSettingsModal: true})}> 
            Choose preset learner setting
          </Button>

          <Button 
            disabled={this.state.same || disableAll} 
            onClick={() => this.saveSetup()}> 
            Save Changes
          </Button>

          <DropdownButton
            dropup
            title='Verify on toy data'
            bsStyle={"info"}
            disabled={!this.state.same || disableAll}
            id='verifyLearner'
            onSelect={(key) => {
              this.buildDatasetProperties(key)
            }}
          >
            <MenuItem eventKey='iris'>Iris data</MenuItem>
            <MenuItem eventKey='mnist'>MNIST data</MenuItem>
            <MenuItem eventKey='breast_cancer'>Breast cancer data (Binary)</MenuItem>
            <MenuItem eventKey='boston'>Boston housing (Regression)</MenuItem>            
            <MenuItem eventKey='multiclass'>Custom multiclass data</MenuItem>
          </DropdownButton>

          <Button 
            bsStyle="primary"
            disabled={!this.state.same || disableAll}
            onClick={() => this.setState({showFinalizeModal: true})}>
            Finalize Base Learner Setup
          </Button>

        </ButtonToolbar>
      )
    }
    else {
      buttonToolbar = (
        <ButtonToolbar>

          <Button 
            disabled={!this.props.data.final}
            onClick={() => this.setState({showCreateModal: true})}>
            Create Single Base Learner
          </Button>

          <Button 
            disabled={!this.props.data.final}
            onClick={() => this.setState({showGridSearchModal: true})}>
            Grid Search
          </Button>

          <Button 
            disabled={!this.props.data.final}
            onClick={() => this.setState({showRandomSearchModal: true})}>
            Random Search
          </Button>

        </ButtonToolbar>
      )
    }

    return (
      <div>
      <Collapse activeKey={this.state.activeKey} onChange={(activeKey) => this.onActiveChange(activeKey)}
        accordion={false}>
        <Panel key={this.props.data.id} header={header}>

          <h3>
            <ContentEditable html={this.state.unsavedData.name} 
            disabled={disableAll} 
            onChange={(evt) => this.handleDataChange('name', evt.target.value)} />
          </h3>

          {this.props.data.final && <FinalizedAlert/>}

          <CodeMirror value={this.state.unsavedData.source} 
          onChange={(src) => this.handleDataChange('source', src)} 
          options={options}/>

          <Form onSubmit={(e) => e.preventDefault()}>
            <FormGroup
              controlId='mfgMethod'
            >
              <ControlLabel>Meta-feature generator method</ControlLabel>
              <FormControl
                value={this.state.unsavedData.meta_feature_generator}
                readOnly={disableAll} 
                onChange={(evt) => this.handleDataChange('meta_feature_generator', evt.target.value)}            
              />
            </FormGroup>
          </Form>

          <MetricGenerators 
          disabled={disableAll}
          generators={this.state.unsavedData.metric_generators} 
          handleGeneratorChange={(gen) => this.handleDataChange('metric_generators', gen)}
          presetMetricGenerators={this.props.presetMetricGenerators} />

          <DefaultHyperparameters hyperparameters={this.props.data.hyperparameters} />

          <ValidationResults validation_results={this.props.data.validation_results} />

          {buttonToolbar}

          <h4>
            {this.state.errorMessage 
              && <ErrorAlert errorMessage={this.state.errorMessage} />}
          </h4>

          <FinalizeModal isOpen={this.state.showFinalizeModal} 
          onRequestClose={() => this.setState({showFinalizeModal: false})}
          handleYes={() => this.confirmLearner()} />

          <ClearModal isOpen={this.state.showClearModal} 
          onRequestClose={() => this.setState({showClearModal: false})}
          handleYes={() => this.clearChanges()} />

          <PresetLearnerSettingsModal 
          isOpen={this.state.showPresetLearnerSettingsModal} 
          onRequestClose={() => this.setState({showPresetLearnerSettingsModal: false})}
          presetBaseLearnerOrigins={this.props.presetBaseLearnerOrigins}
          apply={(obj) => {
            this.handleDataChange('name', obj.value.name);
            this.handleDataChange('meta_feature_generator', 
              obj.value.meta_feature_generator);
            this.handleDataChange('source', obj.value.source);
          }} />

          <MulticlassDatasetModal
            isOpen={this.state.showMulticlassDatasetModal}
            onRequestClose={() => this.setState({showMulticlassDatasetModal: false})}
            handleYes={(x) => this.verifyLearner(x)}
          />

          <CreateBaseLearnerModal isOpen={this.state.showCreateModal} 
          onRequestClose={() => this.setState({showCreateModal: false})}
          handleYes={(source) => this.props.createBaseLearner(source)} />

          <GridSearchModal isOpen={this.state.showGridSearchModal} 
          onRequestClose={() => this.setState({showGridSearchModal: false})}
          handleYes={(source) => this.props.gridSearch(source)} />

          <RandomSearchModal 
            isOpen={this.state.showRandomSearchModal} 
            onRequestClose={() => this.setState({showRandomSearchModal: false})}
            handleYes={(source, n) => this.props.randomSearch(source, n)} />
          
        </Panel>
      </Collapse>

      <DeleteModal 
        isOpen={this.state.showDeleteModal}
        onRequestClose={() => this.setState({showDeleteModal: false})}
        handleYes={() => this.handleDeleteLearner()} />
      </div>
    )
  }
}


export default BaseLearnerOrigin;
