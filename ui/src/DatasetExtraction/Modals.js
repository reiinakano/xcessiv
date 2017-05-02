import React from 'react';
import { Modal, Button } from 'react-bootstrap';

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
