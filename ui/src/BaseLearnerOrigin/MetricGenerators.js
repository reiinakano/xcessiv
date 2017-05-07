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
          <Form>
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
            onClick={() => this.props.onAdd(this.state.name)}
          >
            Yes
          </Button>
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

  handleAddMetricGenerator(metric_name) {

    if (!(metric_name in this.props.generators)) {
      var newGenerators = JSON.parse(JSON.stringify(this.props.generators));
      newGenerators[metric_name] = default_metric_generator_code;
      this.props.handleGeneratorChange(newGenerators);
    }
    this.setState({showAddNewModal: false});
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
        <Button block 
          disabled={this.props.disabled}
          onClick={() => this.setState({showAddNewModal: true})}>
          <Glyphicon glyph="plus" />
          {' Add new metric generator'}
        </Button>
        <AddNewModal isOpen={this.state.showAddNewModal} 
        onRequestClose={() => this.setState({showAddNewModal: false})}
        onAdd={(metric_name) => this.handleAddMetricGenerator(metric_name)} />
      </div>
    );
  }
}

export default MetricGenerators;
