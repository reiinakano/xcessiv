import React, {Component} from 'react';
import './AutomatedRuns.css';
import 'react-select/dist/react-select.css';
import { Modal, Button, Alert } from 'react-bootstrap';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';

function DisplayError(props) {
  return <Alert bsStyle='danger'>
    {props.description['error_traceback'].join('').split("\n").map((i, index) => {
      return <div key={index}>{i}</div>;
    })}
  </Alert>
}

export class DetailsModal extends Component {
  render() {

    const automatedRun = this.props.automatedRuns.find(el => el.id === this.props.moreDetailsId);

    if (automatedRun === undefined) {
      return null;
    }

    var options = {
      lineNumbers: true,
      indentUnit: 4,
      readOnly: true
    };

    return (
      <Modal 
        bsSize='lg'
        show={this.props.moreDetailsId !== null} 
        onHide={this.props.onRequestClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>{'Details of Automated Run ID ' + automatedRun.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <b>Configuration Source</b>
          <CodeMirror value={automatedRun.source} 
            options={options}/>
          <b>{'Base Learner Type ID: '}</b>
          {automatedRun.base_learner_origin_id}
          <br/>
          <b>{'Job ID: '}</b>
          {automatedRun.job_id}
          {(automatedRun.job_status === 'errored') && 
          <DisplayError description={automatedRun.description} />}
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
          <Modal.Title>Delete Automated Run</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete record of this automated run?</p>
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
