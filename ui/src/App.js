import React, { Component } from 'react';
import './App.css';
import DataExtractionTabs from './DatasetExtraction/DataExtractionTabs';
import ContainerBaseLearner from './containers/ContainerBaseLearner';
import NotificationSystem from 'react-notification-system';
import { Button, Modal, Form, FormGroup, FormControl, 
  ControlLabel } from 'react-bootstrap';

function handleErrors(response) {
  if (!response.ok) {
    var error = new Error(response.statusText);

    // Unexpected error
    if (response.status === 500) {
      error.errMessage = 'Unexpected error';
      throw error;
    }
    return response.json()
      .then(errorBody => {
        error.errMessage = JSON.stringify(errorBody);
        throw error;
      });
  }
  return response;
}

class CreateProjectModal extends Component {
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
          <Modal.Title>Create New Project</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>Existing folders</h4>
          <ul>
            {this.props.folders.map((x) => {
              return <li key={x}>{x}</li>
            })}
          </ul>
          <Form inline onSubmit={(e) => e.preventDefault()}>
            <FormGroup
              controlId='newProjectName'
            >
              <ControlLabel>{'Name new project '}</ControlLabel>
              {' '}
              <FormControl
                placeholder='Enter new project name'
                value={this.state.name}
                onChange={(evt) => this.setState({name: evt.target.value})}            
              />
            </FormGroup>
            {' '}
            <Button 
              disabled={!this.state.name}
              bsStyle='primary'
              onClick={() => {
                this.props.createProject(this.state.name);
              }}
            >
              Create
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          
          <Button
           bsStyle='primary'
          >
            Open project folder
          </Button>
          <Button onClick={this.props.onRequestClose}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}

class NotebookWithToolbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      path: 'test',
      folders: [],
      showCreateProjectModal: false
    };
  }

  // Get request from server to populate fields
  componentDidMount() {
    this.getFolders();
  }

  // Get list of folders in current working directory
  getFolders() {
    fetch('/folders/')
    .then(response => response.json())
    .then(json => {
      console.log(json);
      this.setState({
        folders: json
      });
    });
  }

  // Creates new project folder with initialized xcnb.db
  createProject(name) {
    var payload = {ensemble_name: name};
    fetch(
      '/ensemble/',
      {
        method: "POST",
        body: JSON.stringify( payload ),
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      }
    )
    .then(handleErrors)
    .then(response => response.json())
    .then(json => {
      console.log(json);
      this.props.addNotification({
        title: 'Success',
        message: 'Created new project folder',
        level: 'success'
      });
      this.getFolders();
    })
    .catch(error => {
      console.log(error.message);
      console.log(error.errMessage);
      this.props.addNotification({
        title: error.message,
        message: error.errMessage,
        level: 'error'
      });
    });
  }

  render() {
    return (
      <div>
        <Button
          onClick={() => this.setState({showCreateProjectModal: true})}
        >
          Create new project
        </Button>
        <Notebook
          path={this.state.path}
          addNotification={(notif) => this.props.addNotification(notif)}
        />
        <CreateProjectModal
          createProject={(name) => this.createProject(name)}
          folders={this.state.folders}
          isOpen={this.state.showCreateProjectModal}
          onRequestClose={() => this.setState({showCreateProjectModal: false})}
        />
      </div>
    );
  }
}

function Notebook(props) {
  return (
    <div>
      <DataExtractionTabs 
        path={props.path}
        addNotification={(notif) => props.addNotification(notif)}
      />
      <ContainerBaseLearner 
        path={props.path}
        addNotification={(notif) => props.addNotification(notif)}
      />
    </div>
  )
}

class App extends Component {

  constructor(props) {
    super(props);
    this._notificationSystem = null;
  }

  componentDidMount() {
    this._notificationSystem = this.refs.notificationSystem;
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Xcessiv</h2>
        </div>
        <NotebookWithToolbar
          addNotification={(notif) => this._notificationSystem.addNotification(notif)} 
        />
        <NotificationSystem ref='notificationSystem' />
      </div>
    )
  }
}

export default App;
