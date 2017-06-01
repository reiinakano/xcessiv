import React, { Component } from 'react';
import { Button, Modal, Form, FormGroup, 
  ControlLabel, FormControl } from 'react-bootstrap';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';
import Select from 'react-select';


const defaultAutomatedRunSource = `random_state = 8  # Random seed

# Configuration to pass to maximize()
maximize_config = {
  'init_points': 2,
  'n_iter': 30,
  'acq': 'ucb',
  'kappa': 5
}

# Default parameters of base learner
default_params = {

}

# Min-max bounds of parameters to be searched
pbounds = {

}

# List of hyperparameters that should be rounded off to integers
integers = [
]

metric_to_optimize = 'Accuracy'  # metric to optimize

invert_metric = False  # Whether or not to invert metric e.g. optimizing a loss
`


export class MulticlassDatasetModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      type: 'multiclass',
      n_classes: 2,
      n_features: 8,
      n_samples: 100,
      n_clusters_per_class: 1,
      n_informative: 2,
      n_redundant: 0
    };
  }

  handleYesAndClose() {
    this.props.handleYes(this.state);
    this.props.onRequestClose();
  }

  render() {
    return (
      <Modal 
        show={this.props.isOpen} 
        onHide={this.props.onRequestClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>Custom multiclass dataset</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <FormGroup
              controlId='nClasses'
            >
              <ControlLabel>Number of classes</ControlLabel>
              <FormControl
                type='number' min='2'
                value={this.state.n_classes}
                onChange={(evt) => this.setState({n_classes: parseInt(evt.target.value, 10)})}            
              />
            </FormGroup>
            <FormGroup
              controlId='nFeatures'
            >
              <ControlLabel>Number of features</ControlLabel>
              <FormControl
                type='number' min='1'
                value={this.state.n_features}
                onChange={(evt) => this.setState({n_features: parseInt(evt.target.value, 10)})}            
              />
            </FormGroup>
            <FormGroup
              controlId='nSamples'
            >
              <ControlLabel>Number of samples</ControlLabel>
              <FormControl
                type='number' min='100'
                value={this.state.n_samples}
                onChange={(evt) => this.setState({n_samples: parseInt(evt.target.value, 10)})}            
              />
            </FormGroup>
            <FormGroup
              controlId='nClusters'
            >
              <ControlLabel>Number of clusters per class</ControlLabel>
              <FormControl
                type='number' min='1'
                value={this.state.n_clusters_per_class}
                onChange={(evt) => this.setState({n_clusters_per_class: parseInt(evt.target.value, 10)})}            
              />
            </FormGroup>
            <FormGroup
              controlId='nInformative'
            >
              <ControlLabel>Number of informative features</ControlLabel>
              <FormControl
                type='number' min='100'
                value={this.state.n_informative}
                onChange={(evt) => this.setState({n_informative: parseInt(evt.target.value, 10)})}            
              />
            </FormGroup>
            <FormGroup
              controlId='nRedundant'
            >
              <ControlLabel>Number of redundant features</ControlLabel>
              <FormControl
                type='number' min='100'
                value={this.state.n_redundant}
                onChange={(evt) => this.setState({n_redundant: parseInt(evt.target.value, 10)})}            
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

export class CreateBaseLearnerModal extends Component {
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

export class GridSearchModal extends Component {
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

export class RandomSearchModal extends Component {
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

export class AutomatedRunModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      source: defaultAutomatedRunSource
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
        bsSize='large'
        show={this.props.isOpen} 
        onHide={this.props.onRequestClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>Bayesian Optimization</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{'Designate configurations for Bayesian hyperparameter optimization'}</p>
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

export function ClearModal(props) {
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

export class PresetLearnerSettingsModal extends Component {
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

export function FinalizeModal(props) {
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

export function DeleteModal(props) {
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