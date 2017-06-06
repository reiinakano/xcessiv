import React, {Component} from 'react';
import './Ensemble.css';
import 'react-select/dist/react-select.css';
import { Modal, Panel, Button, Alert, Form, 
  FormGroup, ControlLabel, FormControl } from 'react-bootstrap';


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

  handleYesAndClose() {
    this.props.handleYes(this.state.name);
    this.props.onRequestClose();
  }

  render() {

    return (
      <Modal 
        show={this.props.isOpen} 
        onHide={this.props.onRequestClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>Export ensemble as Python package</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => {
            e.preventDefault();
            this.handleYesAndClose();
          }}>
            <FormGroup
              controlId='name'
            >
              <ControlLabel>Name to use as package name</ControlLabel>
              <FormControl
                value={this.state.name} 
                onChange={(evt) => this.setState({name: evt.target.value})}            
              />
            </FormGroup>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle='primary' onClick={() => this.handleYesAndClose()}>
            Save
          </Button>
          <Button onClick={this.props.onRequestClose}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}

export default DetailsModal;
