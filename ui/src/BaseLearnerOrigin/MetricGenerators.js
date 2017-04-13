import React, { Component } from 'react';
import './BaseLearnerOrigin.css';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';
import 'rc-collapse/assets/index.css';
import Collapse, { Panel } from 'rc-collapse';
import ReactModal from 'react-modal';

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
        style={{
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
        }}
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

class MetricGenerators extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: [],
      showAddNewModal: false
    };
    this.onActiveChange = this.onActiveChange.bind(this);
    this.handleOpenAddNewModal = this.handleOpenAddNewModal.bind(this);
    this.handleCloseAddNewModal = this.handleCloseAddNewModal.bind(this);
    this.handleAddMetricGenerator = this.handleAddMetricGenerator.bind(this);
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
