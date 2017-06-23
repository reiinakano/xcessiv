import React, {Component} from 'react';
import './Ensemble.css';
import 'react-select/dist/react-select.css';
import { Modal, Panel, Button, Alert, Form, 
  FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';
import Select from 'react-select'
import 'react-select/dist/react-select.css'


const defaultGreedyRunSource = `secondary_learner_hyperparameters = {}  # hyperparameters of secondary learner

metric_to_optimize = 'Accuracy'  # metric to optimize

invert_metric = False  # Whether or not to invert metric e.g. optimizing a loss

max_num_base_learners = 5  # Maximum size of ensemble to consider (the higher this is, the longer the run will take)
`


function DisplayError(props) {
  return <Alert bsStyle='danger'>
    {props.description['error_traceback'].join('').split("\n").map((i, index) => {
      return <div key={index}>{i}</div>;
    })}
  </Alert>
}

class DetailsModal extends Component {
  render() {
    if (this.props.moreDetailsId === null) {
      return null;
    }

    const stackedEnsemble = this.props.stackedEnsembles.find(el => el.id === this.props.moreDetailsId);

    if (stackedEnsemble === undefined) {
      return null;
    }

    return (
      <Modal 
        show={this.props.moreDetailsId !== null} 
        onHide={this.props.onRequestClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>{'Details of ensemble ID ' + stackedEnsemble.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body className='DualList'>
          <Panel header={<h4>Base Learners</h4>}>
            <ul>
              {stackedEnsemble.base_learner_ids.map((id) => {
                return (
                  <li key={id}>{id}</li>
                )
              })}
            </ul>
          </Panel>
          <Panel header={<h4>Metrics</h4>}>
            <ul>
              {Object.keys(stackedEnsemble.individual_score).map((key) => {
                return <li key={key}>{key + ': ' + stackedEnsemble.individual_score[key]}</li>
              })}
            </ul>
          </Panel>
          <Panel header={<h4>Secondary Learner Hyperparameters</h4>}>
            <ul>
              {Object.keys(stackedEnsemble.secondary_learner_hyperparameters).map((key) => {
                return (
                  <li key={key}>
                    {key + ': ' + stackedEnsemble.secondary_learner_hyperparameters[key]}
                  </li>
                );
              })}
            </ul>
          </Panel>
          <b>{'Base Learner Type ID: '}</b>
          {stackedEnsemble.base_learner_origin_id}
          <br/>
          <b>{'Job ID: '}</b>
          {stackedEnsemble.job_id}
          {(stackedEnsemble.job_status === 'errored') && 
          <DisplayError description={stackedEnsemble.description} />}
        </Modal.Body>
      </Modal>
    )
  }
}

export class DeleteModal extends Component {

  handleYesAndClose() {
    this.props.handleYes();
    this.props.onRequestClose();
  }

  render() {
    return (
      <Modal 
        show={this.props.isOpen} 
        onHide={this.props.onRequestClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete ensemble</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this ensemble?</p>
          <p><strong>This action is irreversible.</strong></p>
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle='danger' onClick={() => this.handleYesAndClose()}>
            Delete
          </Button>
          <Button onClick={this.props.onRequestClose}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}

export class ExportModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: ''
    };
  }

  render() {

    return (
      <Modal 
        show={this.props.isOpen} 
        onHide={this.props.onRequestClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>Export ensemble as Python file</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => {
            e.preventDefault();
            this.handleYesAndClose();
          }}>
            <FormGroup
              controlId='name'
            >
              <ControlLabel>Name to use as filename</ControlLabel>
              <FormControl
                value={this.state.name} 
                onChange={(evt) => this.setState({name: evt.target.value})}            
              />
            </FormGroup>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle='primary' onClick={() => {
            this.props.exportEnsemble(this.state.name);
            this.props.onRequestClose();
          }}>
            Save as Python file
          </Button>
          <Button bsStyle='primary' onClick={() => {
            this.props.exportEnsembleToBaseLearnerOrigin();
            this.props.onRequestClose();
          }}>
            Export as separate base learner setup
          </Button>
          <Button onClick={this.props.onRequestClose}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}

export class GreedyRunModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      source: defaultGreedyRunSource,
      selectedValue: null
    };
  }

  handleYesAndClose() {
    this.props.handleYes(this.state.selectedValue.value, this.state.source);
    this.props.onRequestClose();
  }

  render() {
    var options = {
      lineNumbers: true,
      indentUnit: 4
    };

    return (
      <Modal 
        bsSize='lg'
        show={this.props.isOpen} 
        onHide={this.props.onRequestClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>Greedy Forward Model Selection</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{'Designate configuration for greedy forward model selection'}</p>
          <CodeMirror value={this.state.source} 
            onChange={(src) => this.setState({source: src})} 
            options={options}
          />
          <Select
            options={this.props.optionsBaseLearnerOrigins}
            value={this.state.selectedValue}
            onChange={(val) => this.setState({selectedValue: val})}
            placeholder="Select secondary base learner to use"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button 
            bsStyle='primary' 
            onClick={() => this.handleYesAndClose()}
            disabled={!this.state.selectedValue}>
            Go
          </Button>
          <Button onClick={this.props.onRequestClose}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}

export default DetailsModal;
