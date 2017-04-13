import React, { Component } from 'react';
import './BaseLearnerOrigin.css';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';
import 'rc-collapse/assets/index.css';
import Collapse, { Panel } from 'rc-collapse';
import ReactModal from 'react-modal';

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
        <button onClick={this.props.onAdd.bind(null, this.state.name)}>Add</button>
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
    this.onActiveChange = this.onActiveChange.bind(this);
    this.handleOpenAddNewModal = this.handleOpenAddNewModal.bind(this);
    this.handleCloseAddNewModal = this.handleCloseAddNewModal.bind(this);
    this.handleAddMetricGenerator = this.handleAddMetricGenerator.bind(this);
    this.handleOpenDeleteModal = this.handleOpenDeleteModal.bind(this);
    this.handleCloseDeleteModal = this.handleCloseDeleteModal.bind(this);
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
        indentUnit: 4
      };
      items.push(<Panel key={key} header={key}>
        <CodeMirror value={this.props.generators[key]} 
        onChange={this.props.onGeneratorChange.bind(null, key)} 
        options={options}/>
        <button onClick={this.handleOpenDeleteModal}>Delete</button>
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

  handleAddMetricGenerator(metric_name) {
    this.props.handleAddMetricGenerator(metric_name);
    this.setState({showAddNewModal: false});
  }

  handleOpenDeleteModal() {
    this.setState({showDeleteModal: true});
  }

  handleCloseDeleteModal() {
    this.setState({showDeleteModal: false});
  }

  handleDeleteMetricGenerator(metric_name) {
    this.props.handleDeleteMetricGenerator(metric_name);
    this.setState({showDeleteModal: false});
  }

  render() {
    return(
      <div>
        <h4>Metrics to be calculated from meta-features</h4>
        <Collapse activeKey={this.state.activeKey} onChange={this.onActiveChange}
        accordion={false}>
          {this.getItems()}
        </Collapse>
        <button onClick={this.handleOpenAddNewModal}>Add new metric generator</button>
        <AddNewModal isOpen={this.state.showAddNewModal} 
        onRequestClose={this.handleCloseAddNewModal}
        onAdd={this.handleAddMetricGenerator} />
      </div>);
  }
}

export default MetricGenerators;
