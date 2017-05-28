import React, { Component } from 'react';
import { Modal, Button } from 'react-bootstrap';
import Select from 'react-select';

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

export class PresetCVSettingsModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedValue: null
    };
  }

  render() {
    const options = this.props.presetCVs.map((obj) => {
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
          <Modal.Title>Select a preset CV method</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Select
            options={options}
            value={this.state.selectedValue}
            onChange={(selectedValue) => this.setState({selectedValue})}
            placeholder="Select preset CV method"
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
