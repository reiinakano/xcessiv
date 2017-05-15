import React, {Component} from 'react';
import './BaseLearner.css';
import 'react-select/dist/react-select.css';
import { Modal, Panel, Button, Alert } from 'react-bootstrap';

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

    const baseLearner = this.props.baseLearners.find(el => el.id === this.props.moreDetailsId);

    if (baseLearner === undefined) {
      return null;
    }

    return (
      <Modal 
        show={this.props.moreDetailsId !== null} 
        onHide={this.props.onRequestClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>{'Details of base learner ID ' + baseLearner.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body className='DualList'>
          <Panel header={<h4>Metrics</h4>}>
            <ul>
              {Object.keys(baseLearner.individual_score).map((key) => {
                return <li key={key}>{key + ': ' + baseLearner.individual_score[key]}</li>
              })}
            </ul>
          </Panel>
          <Panel header={<h4>Base Learner Hyperparameters</h4>}>
            <ul>
              {Object.keys(baseLearner.hyperparameters).map((key) => {
              return (
                <li key={key}>
                  {key + ': ' + baseLearner.hyperparameters[key]}
                </li>
              );
            })}
            </ul>
          </Panel>
          <b>{'Base Learner Type ID: '}</b>
          {baseLearner.base_learner_origin_id}
          <br/>
          <b>{'Job ID: '}</b>
          {baseLearner.job_id}
          {(baseLearner.job_status === 'errored') && 
          <DisplayError description={baseLearner.description} />}
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
          <Modal.Title>Delete base learner</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this base learner?</p>
          <p>All ensembles containing this base learner will be lost as well.</p>
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

export default DetailsModal;
