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
import FaCheck from 'react-icons/lib/fa/check';
import FaSpinner from 'react-icons/lib/fa/spinner';
import FaExclamationCircle from 'react-icons/lib/fa/exclamation-circle';
import { Button, ButtonToolbar, Glyphicon, Alert, Modal, Panel as BsPanel,
  Form, FormGroup, ControlLabel, FormControl, DropdownButton,
  MenuItem } from 'react-bootstrap';
import Select from 'react-select';

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

  const items = Object.keys(props.validation_results).map((key) => {
    return (
      <div key={key}>
        {"Data type: "} <b>{key}</b>
        <ul>
          {Object.keys(props.validation_results[key]).map((metric) => {
            return(
              <li key={metric}>
                {metric + ': ' + props.validation_results[key][metric]}
              </li>
            );
          })}
        </ul>
      </div>
    );
  })

  return <div className='DualList'>
    <BsPanel header={<h4>Base learner metrics on toy data</h4>}>
      {items}
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

function ClearModal(props) {
  return (
    <Modal 
      show={props.isOpen} 
      onHide={props.onRequestClose}
    >
      <Modal.Header closeButton>
        <Modal.Title>Clear all changes</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Are you sure you want to clear all unsaved changes?</p>
      </Modal.Body>
      <Modal.Footer>
        <Button bsStyle='primary' onClick={() => {
          props.handleYes();
          props.onRequestClose();
        }}>Yes</Button>
        <Button onClick={props.onRequestClose}>Cancel</Button>
      </Modal.Footer>
    </Modal>
  )
}

class PresetLearnerSettingsModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedValue: null
    };
  }

  render() {
    const options = this.props.presetBaseLearnerOrigins.map((obj) => {
      return {
        label: obj.name,
        value: obj
      }
    });
    return (
      <Modal 
        show={this.props.isOpen} 
        onHide={this.props.onRequestClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>Select a preset base learner origin</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Select
            options={options}
            value={this.state.selectedValue}
            onChange={(selectedValue) => this.setState({selectedValue})}
            placeholder="Select base learner origin"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button 
            disabled={!this.state.selectedValue}
            bsStyle='primary' 
            onClick={() => {
            this.props.apply(this.state.selectedValue);
            this.props.onRequestClose();
          }}>
            Apply
          </Button>
          <Button onClick={this.props.onRequestClose}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}

function FinalizeModal(props) {
  return (
    <Modal 
      show={props.isOpen} 
      onHide={props.onRequestClose}
    >
      <Modal.Header closeButton>
        <Modal.Title>Finalize base learner</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Are you sure you want to finalize this base learner setup?</p>
        <p>You will no longer be allowed to make changes to this base 
        learner after this</p>
      </Modal.Body>
      <Modal.Footer>
        <Button bsStyle='primary' onClick={props.handleYes}>Yes</Button>
        <Button onClick={props.onRequestClose}>Cancel</Button>
      </Modal.Footer>
    </Modal>
  )
}

function DeleteModal(props) {
  return (
    <Modal 
      bsStyle='danger'
      show={props.isOpen} 
      onHide={props.onRequestClose}
    >
      <Modal.Header closeButton>
        <Modal.Title>Delete base learner</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Are you sure you want to delete this base learner setup?</p>
        <p>You will also lose all base learners that have been scored using this setup</p>
        <p><strong>This action is irreversible.</strong></p>
      </Modal.Body>
      <Modal.Footer>
        <Button bsStyle='danger' onClick={props.handleYes}>Yes</Button>
        <Button onClick={props.onRequestClose}>Cancel</Button>
      </Modal.Footer>
    </Modal>
  )
}

class CreateBaseLearnerModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      source: 'params = {}'
    };
  }

  handleYesAndClose() {
    this.props.handleYes(this.state.source);
    this.props.onRequestClose();
  }

  render() {
    var options = {
      lineNumbers: true,
      indentUnit: 4
    };

    return (
      <Modal 
        show={this.props.isOpen} 
        onHide={this.props.onRequestClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>Create base learner</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{'Enter parameters to use for base learner in variable `params`'}</p>
          <CodeMirror value={this.state.source} 
            onChange={(src) => this.setState({source: src})} 
            options={options}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle='primary' onClick={() => this.handleYesAndClose()}>
            Create single base learner
          </Button>
          <Button onClick={this.props.onRequestClose}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}

class GridSearchModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      source: 'param_grid = []'
    };
  }

  handleYesAndClose() {
    this.props.handleYes(this.state.source);
    this.props.onRequestClose();
  }

  render() {
    var options = {
      lineNumbers: true,
      indentUnit: 4
    };

    return (
      <Modal 
        show={this.props.isOpen} 
        onHide={this.props.onRequestClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>Grid Search</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{'Designate parameter grid for grid search in variable `param_grid`'}</p>
          <CodeMirror value={this.state.source} 
            onChange={(src) => this.setState({source: src})} 
            options={options}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle='primary' onClick={() => this.handleYesAndClose()}>
            Go
          </Button>
          <Button onClick={this.props.onRequestClose}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}

class RandomSearchModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      source: 'param_distributions = {}',
      n: 0
    };
  }

  handleYesAndClose() {
    this.props.handleYes(this.state.source, this.state.n);
    this.props.onRequestClose();
  }

  render() {
    var options = {
      lineNumbers: true,
      indentUnit: 4
    };

    return (
      <Modal 
        show={this.props.isOpen} 
        onHide={this.props.onRequestClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>Random Search</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{'Designate parameter distribution for random search in variable `param_distributions`'}</p>
          <CodeMirror value={this.state.source} 
            onChange={(src) => this.setState({source: src})} 
            options={options}
          />
          <Form>
            <FormGroup
              controlId='numIter'
            >
              <ControlLabel>Number of base learners to create</ControlLabel>
              <FormControl
                type='number' min='0'
                value={this.state.n} 
                onChange={(evt) => this.setState({n: parseInt(evt.target.value, 10)})}            
              />
            </FormGroup>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle='primary' onClick={() => this.handleYesAndClose()}>
            Go
          </Button>
          <Button onClick={this.props.onRequestClose}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    )
  }
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

  // Verify Base Learner Origin + Metric Generators
  verifyLearner(dataset) {
    var payload = {dataset};


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
              this.verifyLearner(key)
            }}
          >
            <MenuItem eventKey='binary'>Binary data</MenuItem>
            <MenuItem eventKey='multiclass'>Multiclass data</MenuItem>
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
