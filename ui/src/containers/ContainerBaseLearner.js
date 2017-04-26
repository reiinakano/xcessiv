import React, { Component } from 'react';
import ListBaseLearner from '../BaseLearner/ListBaseLearner';
import ListBaseLearnerOrigin from '../BaseLearnerOrigin/ListBaseLearnerOrigin'
import $ from 'jquery';

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

class ContainerBaseLearner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      baseLearners: [],
      filterOptions: [],
      metricsOptions: [],
      hyperparametersOptions: []
    };
  }

  // Get request from server to populate fields
  componentDidMount() {
    this.refreshBaseLearners(); 
  }

  // Refresh base learners from server data
  refreshBaseLearners() {
    fetch('/ensemble/base-learners/?path=' + this.props.path)
    .then(response => response.json())
    .then(json => {
      console.log(json)
      const baseLearners = [];
      const filterOptionsSet = new Set([]);
      const filterOptions = [];
      const metricsOptionsSet = new Set([]);
      const metricsOptions = [];
      const hyperparametersOptionsSet = new Set([]);
      const hyperparametersOptions = [];
      for (var i=0; i < json.length; i++) {
        baseLearners.push(json[i]);
        filterOptionsSet.add(json[i].base_learner_origin_id);
        for (let el in json[i].individual_score) metricsOptionsSet.add(el);
        for (let el in json[i].hyperparameters) hyperparametersOptionsSet.add(el);
        
      }
      
      for (let item of filterOptionsSet) {
        filterOptions.push({
          label: String(item),
          value: item
        });
      }

      for (let item of metricsOptionsSet) {
        metricsOptions.push({
          label: String(item),
          value: item
        });
      }

      for (let item of hyperparametersOptionsSet) {
        hyperparametersOptions.push({
          label: String(item),
          value: item
        });
      }

      this.setState({
        baseLearners: baseLearners, 
        filterOptions: filterOptions,
        metricsOptions: metricsOptions,
        hyperparametersOptions: hyperparametersOptions
      });
    });
  }

  // Create a single base learner from a base learner origin
  createBaseLearner(id, source) {
    var payload = {source: source};

    fetch(
      '/ensemble/base-learner-origins/' + id + '/create-base-learner/?path=' + this.props.path,
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
      this.refreshBaseLearners();
      this.props.addNotification({
        title: 'Success',
        message: json.message,
        level: 'success'
      });
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

  // Grid search from a base learner origin
  gridSearch(id, source) {
    var payload = {source: source, method: 'grid'};

    fetch(
      '/ensemble/base-learner-origins/' + id + '/search/?path=' + this.props.path,
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
      this.refreshBaseLearners();
      this.props.addNotification({
        title: 'Success',
        message: json.message,
        level: 'success'
      });
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

  // Random search from a base learner origin
  randomSearch(id, source, n) {
    var payload = {source: source, method: 'random', n_iter: n};

    fetch(
      '/ensemble/base-learner-origins/' + id + '/search/?path=' + this.props.path,
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
      this.refreshBaseLearners();
      this.props.addNotification({
        title: 'Success',
        message: json.message,
        level: 'success'
      });
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

  // Callback to update a base learner in the list
  updateBaseLearner(id, newData) {
    this.setState((prevState) => {
      var newState = $.extend({}, prevState); // Copy
      var idx = newState.baseLearners.findIndex((x) => x.id === id);
      newState.baseLearners[idx] = newData;
      return newState;
    });
  }

  // Delete a base learner in the list
  deleteBaseLearner(id) {

    fetch(
      '/ensemble/base-learners/' + id + '/?path=' + this.props.path,
      {
        method: "DELETE"
      }
    )
    .then(handleErrors)
    .then(response => response.json())
    .then(json => {
      console.log(json);
      this.refreshBaseLearners();
      this.props.addNotification({
        title: 'Success',
        message: json.message,
        level: 'success'
      });
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
        <ListBaseLearnerOrigin 
          path={this.props.path} 
          createBaseLearner={(id, source) => this.createBaseLearner(id, source)}
          gridSearch={(id, source) => this.gridSearch(id, source)}
          randomSearch={(id, source, n) => this.randomSearch(id, source, n)}
          addNotification={(notif) => this.props.addNotification(notif)}
        />
        <ListBaseLearner 
          path={this.props.path} 
          baseLearners={this.state.baseLearners}
          filterOptions={this.state.filterOptions}
          metricsOptions={this.state.metricsOptions}
          hyperparametersOptions={this.state.hyperparametersOptions}
          updateBaseLearner={(id, newData) => this.updateBaseLearner(id, newData)}
          deleteBaseLearner={(id) => this.deleteBaseLearner(id)}
        />
      </div>
    )
  }
}

export default ContainerBaseLearner;
