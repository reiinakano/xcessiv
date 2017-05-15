import React, { Component } from 'react';
import './BaseLearnerOrigin.css';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';
import 'rc-collapse/assets/index.css';
import {omit} from 'lodash';
import Collapse, { Panel } from 'rc-collapse';
import { Button, Glyphicon, Modal, Form, FormGroup, 
  FormControl, ControlLabel } from 'react-bootstrap';
import Select from 'react-select';

const default_metric_generator_code = `def metric_generator(y_true, y_probas):
    """This function must return a numerical value given two numpy arrays 
    containing the ground truth labels and generated meta-features, in that order.
    (In this example, \`y_true\` and \`y_probas\`)
    """
    return 0.88
`

class AddNewModal extends Component {
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
          <Modal.Title>Add new metric generator</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => {
            e.preventDefault();
            this.props.onAdd(this.state.name);
            this.props.onRequestClose();
          }}>
            <FormGroup
              controlId='metricName'
            >
              <ControlLabel>Name new metric</ControlLabel>
              <FormControl
                value={this.state.name}
                onChange={(evt) => this.setState({name: evt.target.value})}            
              />
            </FormGroup>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.onRequestClose}>Cancel</Button>
          <Button 
            bsStyle='primary' 
            onClick={() => {
              this.props.onAdd(this.state.name);
              this.props.onRequestClose();
            }}
          >
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }
}

class PresetMetricGeneratorsModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedValue: []
    };
  }

  render() {
    const options = this.props.presetMetricGenerators.map((obj) => {
      return {
        label: obj.selection_name,
        value: obj
      }
    });
    return (
      <Modal 
        show={this.props.isOpen} 
        onHide={this.props.onRequestClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>Select a preset metric generator</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Select
            multi
            options={options}
            value={this.state.selectedValue}
            onChange={(selectedValue) => this.setState({selectedValue})}
            placeholder="Select preset metric generator"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button 
            disabled={!this.state.selectedValue}
            bsStyle='primary' 
            onClick={() => {
              const generators = {};

              for (let i=0; i<this.state.selectedValue.length; i++) {
                generators[this.state.selectedValue[i].value.name] = this.state.selectedValue[i].value.source;
              }

              this.props.apply(generators);

              this.props.onRequestClose();
            }}>
            Add
          </Button>
          <Button onClick={this.props.onRequestClose}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}

class MetricGenerators extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: [],
      showAddNewModal: false,
      showPresetMetricGeneratorsModal: false,
      showDeleteModal: false
    };
  }

  /* Used to construct a list of Generator components for inserting into the 
  accordion.
  */
  getItems() {

    var options = {
      lineNumbers: true,
      indentUnit: 4,
      readOnly: this.props.disabled
    };

    const items = Object.keys(this.props.generators).map((key) => {
      var header = (
        <b>
          {key}
          {!this.props.disabled && (
            <a
              className='DeleteButton'
              onClick={(evt) => {
                evt.stopPropagation();
                this.handleDeleteMetricGenerator(key);
              }}>
              <Glyphicon glyph="remove" />
            </a>
          )}
        </b>
      );
      return (
        <Panel key={key} header={header}>
          <CodeMirror value={this.props.generators[key]} 
          onChange={(src) => this.handleChangeMetricGenerator(key, src)} 
          options={options}/>
        </Panel>
      )
    })

    return items;
  }

  handleChangeMetricGenerator(metric_name, source) {
    var newGenerators = JSON.parse(JSON.stringify(this.props.generators));
    newGenerators[metric_name] = source;
    this.props.handleGeneratorChange(newGenerators);
  }

  handleExtendMetricGenerator(metric_generators) {
    var newGenerators = JSON.parse(JSON.stringify(this.props.generators));
    newGenerators = Object.assign(newGenerators, metric_generators);
    this.props.handleGeneratorChange(newGenerators);
  }

  handleAddMetricGenerator(metric_name) {

    if (!(metric_name in this.props.generators)) {
      var newGenerators = JSON.parse(JSON.stringify(this.props.generators));
      newGenerators[metric_name] = default_metric_generator_code;
      this.props.handleGeneratorChange(newGenerators);
    }
  }

  handleDeleteMetricGenerator(metric_name) {
    if (metric_name in this.props.generators) {
      var newGenerators = omit(this.props.generators, metric_name);
      this.props.handleGeneratorChange(newGenerators);
    }
    this.setState({showDeleteModal: false});
  }

  render() {
    return(
      <div>
        <h4>Metrics to be calculated from meta-features</h4>
        <Collapse activeKey={this.state.activeKey} 
        onChange={(activeKey) => this.setState({activeKey})}
        accordion={false}>
          {this.getItems()}
        </Collapse>
        {!this.props.disabled && 
          <table><tbody><tr>
          <td>
            <Button block 
              disabled={this.props.disabled}
              onClick={() => this.setState({showAddNewModal: true})}>
              <Glyphicon glyph="plus" />
              {' Add new metric generator'}
            </Button>
          </td>
          <td>
            <Button block 
              disabled={this.props.disabled}
              onClick={() => this.setState({showPresetMetricGeneratorsModal: true})}>
              <Glyphicon glyph="plus" />
              {' Add preset metric generator'}
            </Button>
          </td>
          </tr></tbody></table>
        }
        <AddNewModal 
          isOpen={this.state.showAddNewModal} 
          onRequestClose={() => this.setState({showAddNewModal: false})}
          onAdd={(metric_name) => this.handleAddMetricGenerator(metric_name)} 
        />
        <PresetMetricGeneratorsModal
          isOpen={this.state.showPresetMetricGeneratorsModal}
          onRequestClose={() => this.setState({showPresetMetricGeneratorsModal: false})}
          presetMetricGenerators={this.props.presetMetricGenerators}
          apply={(obj) => {
            console.log(obj);
            this.handleExtendMetricGenerator(obj);
          }}
        />
      </div>
    );
  }
}

export default MetricGenerators;
