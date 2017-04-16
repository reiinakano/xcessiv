import React, { Component } from 'react';
import './BaseLearnerOrigin.css';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';
import 'rc-collapse/assets/index.css';
import {omit} from 'lodash';
import Collapse, { Panel } from 'rc-collapse';
import ReactModal from 'react-modal';

const default_metric_generator_code = `def metric_generator(y_true, y_probas):
    """This function must return a numerical value given two numpy arrays 
    containing the ground truth labels and generated meta-features, in that order.
    (In this example, \`y_true\` and \`y_probas\`)
    """
    return 0.88
`

const modalStyle = {
  overlay : {
    zIndex            : 1000
  },
  content : {
    top                        : '50%',
    left                       : '50%',
    right                      : 'auto',
    bottom                     : 'auto',
    marginRight                : '-50%',
    transform                  : 'translate(-50%, -50%)',
    border                     : '1px solid #ccc',
    background                 : '#fff',
    overflow                   : 'auto',
    WebkitOverflowScrolling    : 'touch',
    borderRadius               : '4px',
    outline                    : 'none',
    padding                    : '20px'
  }
}

class AddNewModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: ''
    };
    this.handleNameChange = this.handleNameChange.bind(this);
  }

  handleNameChange(event) {
    console.log(event.target.value);
    this.setState({name: event.target.value});
  }

  render() {
    return (
      <ReactModal 
        isOpen={this.props.isOpen} 
        onRequestClose={this.props.onRequestClose}
        contentLabel='Add new metric generator'
        style={modalStyle}
      >
        <p>Name new metric</p>
        <label>
          Name: 
          <input type='text' value={this.state.name} 
          onChange={this.handleNameChange} />
        </label>
        <button onClick={this.props.onRequestClose}>Cancel</button>
        <button onClick={() => this.props.onAdd(this.state.name)}>Add</button>
      </ReactModal>
    )
  }
}

function DeleteModal(props) {
  return (
    <ReactModal 
      isOpen={props.isOpen} 
      onRequestClose={props.onRequestClose}
      contentLabel='Delete metric generator'
      style={modalStyle}
    >
      <p>Are you sure you want to delete this metric generator?</p>
      <button onClick={props.onRequestClose}>Cancel</button>
      <button onClick={props.onDelete}>Yes</button>
    </ReactModal>
  )
}

class MetricGenerators extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: [],
      showAddNewModal: false,
      showDeleteModal: false
    };
    this.handleOpenDeleteModal = this.handleOpenDeleteModal.bind(this);
    this.handleCloseDeleteModal = this.handleCloseDeleteModal.bind(this);
    this.handleChangeMetricGenerator = this.handleChangeMetricGenerator.bind(this);
    this.handleDeleteMetricGenerator = this.handleDeleteMetricGenerator.bind(this);
  }

  /* Used to construct a list of Generator components for inserting into the 
  accordion.
  */
  getItems() {
    const items = [];
    for (var key in this.props.generators) {
      console.log(key);
      
      var options = {
        lineNumbers: true,
        indentUnit: 4,
        readOnly: this.props.disabled
      };
      items.push(<Panel key={key} header={key}>
        <CodeMirror value={this.props.generators[key]} 
        onChange={this.handleChangeMetricGenerator.bind(null, key)} 
        options={options}/>
        <button disabled={this.props.disabled} 
        onClick={this.handleOpenDeleteModal}>Delete</button>
        <DeleteModal isOpen={this.state.showDeleteModal} 
        onRequestClose={this.handleCloseDeleteModal}
        onDelete={this.handleDeleteMetricGenerator.bind(null, key)} />
      </Panel>)
    }

    return items;
  }

  // Handler when active panel changes
  onActiveChange(activeKey) {
    console.log(activeKey);
    this.setState({
      activeKey
    });
  }

  handleOpenAddNewModal() {
    this.setState({showAddNewModal: true});
  }

  handleCloseAddNewModal() {
    this.setState({showAddNewModal: false});
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

  handleOpenDeleteModal() {
    this.setState({showDeleteModal: true});
  }

  handleCloseDeleteModal() {
    this.setState({showDeleteModal: false});
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
        onChange={(activeKey) => this.onActiveChange(activeKey)}
        accordion={false}>
          {this.getItems()}
        </Collapse>
        <button disabled={this.props.disabled}
        onClick={() => this.handleOpenAddNewModal()}>Add new metric generator</button>
        <AddNewModal isOpen={this.state.showAddNewModal} 
        onRequestClose={() => this.handleCloseAddNewModal()}
        onAdd={(metric_name) => this.handleAddMetricGenerator(metric_name)} />
      </div>);
  }
}

export default MetricGenerators;
