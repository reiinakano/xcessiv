import React, { Component } from 'react';
import { Set as ImSet } from 'immutable';
import ListBaseLearner from '../BaseLearner/ListBaseLearner';
import ListBaseLearnerOrigin from '../BaseLearnerOrigin/ListBaseLearnerOrigin'
import EnsembleBuilder from '../Ensemble/EnsembleBuilder'

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
      hyperparametersOptions: [],
      checkedBaseLearners: ImSet([]),
      baseLearnerOrigins: []
    };
  }

  // Get request from server to populate fields
  componentDidMount() {
    this.refreshBaseLearnerOrigins();
    this.refreshBaseLearners(); 
  }

  // Refresh base learner origins from server data
  refreshBaseLearnerOrigins() {
    fetch('/ensemble/base-learner-origins/?path=' + this.props.path)
    .then(response => response.json())
    .then(json => {
      console.log(json);
      this.setState({
        baseLearnerOrigins: json
      });
    });
  }

  // Create a base learner origin
  createBaseLearnerOrigin() {
    var payload = {};
    fetch(
      '/ensemble/base-learner-origins/?path=' + this.props.path,
      {
        method: "POST",
        body: JSON.stringify( payload ),
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      }
    )
    .then(response => response.json())
    .then(json => {
      console.log(json);
      this.setState((prevState) => {
        var baseLearnerOrigins = prevState.baseLearnerOrigins.slice();
        baseLearnerOrigins.push(json);
        return {baseLearnerOrigins};
      });
      this.props.addNotification({
        title: 'Success',
        message: 'Created base learner origin',
        level: 'success'
      });
    });
  }

  // Callback to update a base learner in the stored list
  updateBaseLearnerOrigin(id, newData) {
    this.setState((prevState) => {
      var baseLearnerOrigins = prevState.baseLearnerOrigins.slice(); // Copy
      var idx = baseLearnerOrigins.findIndex((x) => x.id === id);
      baseLearnerOrigins[idx] = newData;
      return {baseLearnerOrigins};
    });
  }

  // Delete base learner origin
  deleteBaseLearnerOrigin(id) {
    fetch(
      '/ensemble/base-learner-origins/' + id + '/?path=' + this.props.path,
      {
        method: "DELETE",
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      }
    )
    .then(response => response.json())
    .then(json => {
      console.log(json);
      this.setState((prevState) => {
        var baseLearnerOrigins = prevState.baseLearnerOrigins.slice();
        var idx = baseLearnerOrigins.findIndex((x) => x.id === id);
        if (idx > -1) {
          baseLearnerOrigins.splice(idx, 1);
        }
        return {baseLearnerOrigins};
      });
      this.props.addNotification({
        title: 'Success',
        message: json.message,
        level: 'success'
      });
    });
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
      var idx = prevState.baseLearners.findIndex((x) => x.id === id);
      var newBaseLearners = prevState.baseLearners.slice();
      newBaseLearners[idx] = newData;
      return {baseLearners: newBaseLearners};
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
      this.setState((prevState) => {
        return {
          checkedBaseLearners: prevState.checkedBaseLearners.delete(id)
        };
      })
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

  // Toggle base learner in checked list
  toggleCheckBaseLearner(id) {
    this.setState((prevState) => {
      if (prevState.checkedBaseLearners.includes(id)) {
        return {checkedBaseLearners: prevState.checkedBaseLearners.delete(id)};
      }
      else {
        return {checkedBaseLearners: prevState.checkedBaseLearners.add(id)};
      }
    });
  }

  render() {
    const checkedOptions = this.state.checkedBaseLearners.toJS().map((val) => {
      return {
        label: val,
        value: val        
      }
    });

    const optionsBaseLearners = this.state.baseLearners.map((obj) => {
      return {
        label: obj.id,
        value: obj.id,
        disabled: obj.job_status !== 'finished'        
      }
    });

    const optionsBaseLearnerOrigins = this.state.baseLearnerOrigins.map((obj) => {
      return {
        label: obj.id + ' - ' + obj.name,
        value: obj.id,
        disabled: !obj.final
      }
    });

    return (
      <div>
        <ListBaseLearnerOrigin 
          path={this.props.path} 
          baseLearnerOrigins={this.state.baseLearnerOrigins}
          createBaseLearnerOrigin={() => this.createBaseLearnerOrigin()}
          updateBaseLearnerOrigin={(id, newData) => this.updateBaseLearnerOrigin(id, newData)}
          deleteBaseLearnerOrigin={(id) => this.deleteBaseLearnerOrigin(id)}
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
          checkedBaseLearners={this.state.checkedBaseLearners}
          toggleCheckBaseLearner={(id) => this.toggleCheckBaseLearner(id)}
        />
        <EnsembleBuilder
          optionsBaseLearners={optionsBaseLearners}
          optionsBaseLearnerOrigins={optionsBaseLearnerOrigins}
          checkedOptions={checkedOptions}
          setCheckedBaseLearners={(checkedArray) => this.setState({checkedBaseLearners: ImSet(checkedArray)})}
        />
      </div>
    )
  }
}

export default ContainerBaseLearner;
