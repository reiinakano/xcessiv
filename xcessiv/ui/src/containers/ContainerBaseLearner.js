import React, { Component } from 'react';
import { Set as ImSet } from 'immutable';
import DataExtractionTabs from '../DatasetExtraction/DataExtractionTabs'
import ListBaseLearner from '../BaseLearner/ListBaseLearner';
import ListBaseLearnerOrigin from '../BaseLearnerOrigin/ListBaseLearnerOrigin'
import EnsembleBuilder from '../Ensemble/EnsembleBuilder'
import ListEnsemble from '../Ensemble/ListEnsemble'
import AutomatedRunsDisplay from '../AutomatedRuns/AutomatedRunsDisplay'

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
      checkedBaseLearners: ImSet([]),
      baseLearnerOrigins: [],
      automatedRuns: [],
      stackedEnsembles: [],
      presetBaseLearnerOrigins: [],
      presetMetricGenerators: [],
      presetCVs: []
    };
  }

  // Get request from server to populate fields
  componentDidMount() {
    this.refreshBaseLearnerOrigins(this.props.path);
    this.refreshAutomatedRunsUntilFinished(this.props.path);
    this.refreshBaseLearnersUntilFinished(this.props.path); 
    this.refreshStackedEnsemblesUntilFinished(this.props.path);
    this.refreshPresetCVs();
    this.refreshPresetBaseLearnerOrigins();
    this.refreshPresetMetricGenerators();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.path !== nextProps.path) {
      this.refreshBaseLearnerOrigins(nextProps.path);
      this.refreshAutomatedRunsUntilFinished(nextProps.path);
      this.refreshBaseLearnersUntilFinished(nextProps.path); 
      this.refreshStackedEnsemblesUntilFinished(nextProps.path);
    }
  }

  // Refresh cross-validation preset settings from server data
  refreshPresetCVs() {
    fetch('/ensemble/cv-settings/')
    .then(response => response.json())
    .then(json => {
      console.log(json);
      this.setState({
        presetCVs: json
      });
    });
  }

  // Refresh base learner origin preset settings from server data
  refreshPresetBaseLearnerOrigins() {
    fetch('/ensemble/base-learner-origins-settings/')
    .then(response => response.json())
    .then(json => {
      console.log(json);
      this.setState({
        presetBaseLearnerOrigins: json
      });
    });
  }

  // Refresh base learner origin preset settings from server data
  refreshPresetMetricGenerators() {
    fetch('/ensemble/metric-generators-settings/')
    .then(response => response.json())
    .then(json => {
      console.log(json);
      this.setState({
        presetMetricGenerators: json
      });
    });
  }

  // Refresh base learner origins from server data
  refreshBaseLearnerOrigins(path) {
    fetch('/ensemble/base-learner-origins/?path=' + path)
    .then(handleErrors)
    .then(response => response.json())
    .then(json => {
      console.log(json);
      this.setState({
        baseLearnerOrigins: json
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
      if (!this.refreshingBL) {
        this.refreshBaseLearnersUntilFinished(this.props.path);
      }
      if (!this.refreshingSE) {
        this.refreshStackedEnsemblesUntilFinished(this.props.path);
      }
      this.props.addNotification({
        title: 'Success',
        message: json.message,
        level: 'success'
      });
    });
  }

  // Refresh automated runs until all are finished
  refreshAutomatedRunsUntilFinished(path) {
    this.refreshingAR = true;
    fetch('/ensemble/automated-runs/?path=' + path)
    .then(handleErrors)
    .then(response => response.json())
    .then(json => {
      if (this.props.path !== path) { return null; }
      console.log(json);
      this.setState({
        automatedRuns: json
      });
      // If base learners are not refreshing, trigger it
      if (!this.refreshingBL) { 
        this.refreshBaseLearnersUntilFinished(this.props.path); 
      }
      // If stacked ensembles are not refreshing, trigger it
      if (!this.refreshingSE) { 
        this.refreshStackedEnsemblesUntilFinished(this.props.path); 
      }
      // Trigger a refresh of base learner origin
      this.refreshBaseLearnerOrigins(this.props.path);
      // If an automated run is not done, trigger a refresh in 5 seconds
      for (let obj of json) {
        if (obj.job_status === 'started' || obj.job_status === 'queued') {
          setTimeout(() => this.refreshAutomatedRunsUntilFinished(path), 5000);
          return null;
        }
      }
      this.refreshingAR = false;
    })
    .catch(error => {
      console.log(error.message);
      console.log(error.errMessage);
      this.refreshingAR = false;
      this.props.addNotification({
        title: error.message,
        message: error.errMessage,
        level: 'error'
      });
    });
  }

  // Create a single automated run from a base learner origin
  createAutomatedRun(payload) {

    fetch(
      '/ensemble/automated-runs/?path=' + this.props.path,
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
      this.setState((prevState) => {
        var automatedRuns = prevState.automatedRuns.slice();
        automatedRuns.push(json);
        return {automatedRuns};
      });
      if (!this.refreshingAR) { 
        this.refreshAutomatedRunsUntilFinished(this.props.path); 
      }
      this.props.addNotification({
        title: 'Success',
        message: 'Created new automated run',
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

  // Start bayesian optimization automated run
  startBayesianRun(bloId, source) {
    var payload = {
      base_learner_origin_id: bloId, 
      source: source,
      category: 'bayes'
    };
    this.createAutomatedRun(payload);
  }

  // Start TPOT automated run
  startTpotRun(source) {
    var payload = {
      source: source,
      category: 'tpot'
    };
    this.createAutomatedRun(payload);
  }

  // Start greedy forward selection
  startGreedyRun(bloId, source) {
    var payload = {
      base_learner_origin_id: bloId, 
      source: source,
      category: 'greedy_ensemble_search'
    };
    this.createAutomatedRun(payload);
  }

  // Delete a base learner in the list
  deleteAutomatedRun(id) {

    fetch(
      '/ensemble/automated-runs/' + id + '/?path=' + this.props.path,
      {
        method: "DELETE"
      }
    )
    .then(handleErrors)
    .then(response => response.json())
    .then(json => {
      console.log(json);
      this.setState((prevState) => {
        var automatedRuns = prevState.automatedRuns.slice();
        var idx = automatedRuns.findIndex((x) => x.id === id);
        automatedRuns.splice(idx, 1);
        return {automatedRuns};
      });
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

  // Refresh base learners until all are finished
  refreshBaseLearnersUntilFinished(path) {
    this.refreshingBL = true;
    fetch('/ensemble/base-learners/?path=' + path)
    .then(handleErrors)
    .then(response => response.json())
    .then(json => {
      if (this.props.path !== path) { return null; }
      console.log(json);
      this.setState({
        baseLearners: json
      });
      for (let obj of json) {
        if (obj.job_status === 'started' || obj.job_status === 'queued') {
          setTimeout(() => this.refreshBaseLearnersUntilFinished(path), 5000);
          return null;    
        }
      }
      this.refreshingBL = false;
    })
    .catch(error => {
      console.log(error.message);
      console.log(error.errMessage);
      this.refreshingBL = false;
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
      this.setState((prevState) => {
        var baseLearners = prevState.baseLearners.slice();
        baseLearners.push(json);
        return {baseLearners};
      });
      if (!this.refreshingBL) { 
        this.refreshBaseLearnersUntilFinished(this.props.path); 
      }
      this.refreshBaseLearnerOrigins(this.props.path); // to refresh search history
      this.props.addNotification({
        title: 'Success',
        message: 'Created new base learner',
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
      this.setState((prevState) => {
        var baseLearners = prevState.baseLearners.concat(json);
        return {baseLearners};
      });
      if (!this.refreshingBL) {
        this.refreshBaseLearnersUntilFinished(this.props.path);
      }
      this.refreshBaseLearnerOrigins(this.props.path); // to refresh search history
      this.props.addNotification({
        title: 'Success',
        message: 'Successfully created ' + json.length + ' new base learners',
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
      this.setState((prevState) => {
        var baseLearners = prevState.baseLearners.concat(json);
        return {baseLearners};
      });
      if (!this.refreshingBL) {
        this.refreshBaseLearnersUntilFinished(this.props.path);
      }
      this.refreshBaseLearnerOrigins(this.props.path); // to refresh search history
      this.props.addNotification({
        title: 'Success',
        message: 'Successfully created ' + json.length + ' new base learners',
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
      this.setState((prevState) => {
        var baseLearners = prevState.baseLearners.slice();
        var idx = baseLearners.findIndex((x) => x.id === id);
        baseLearners.splice(idx, 1);
        return {baseLearners};
      });
      if (!this.refreshingSE) {
        this.refreshStackedEnsemblesUntilFinished(this.props.path);
      }
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

  // Refresh stacked ensembles until all are finished
  refreshStackedEnsemblesUntilFinished(path) {
    this.refreshingSE = true;
    fetch('/ensemble/stacked/?path=' + path)
    .then(handleErrors)
    .then(response => response.json())
    .then(json => {
      if (this.props.path !== path) { return null; }
      console.log(json);
      this.setState({
        stackedEnsembles: json
      });
      for (let obj of json) {
        if (obj.job_status === 'started' || obj.job_status === 'queued') {
          setTimeout(() => this.refreshStackedEnsemblesUntilFinished(path), 5000);
          return null;    
        }
      }
      this.refreshingSE = false;
    })
    .catch(error => {
      console.log(error.message);
      console.log(error.errMessage);
      this.refreshingSE = false;
      this.props.addNotification({
        title: error.message,
        message: error.errMessage,
        level: 'error'
      });
    });
  }

  // Create new stacked ensemble
  createStackedEnsemble(base_learner_ids, base_learner_origin_id, 
    secondary_learner_hyperparameters_source) {
    var payload = {
      base_learner_ids, 
      base_learner_origin_id, 
      secondary_learner_hyperparameters_source
    };

    fetch(
      '/ensemble/stacked/?path=' + this.props.path,
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
      this.setState((prevState) => {
        var stackedEnsembles = prevState.stackedEnsembles.slice();
        stackedEnsembles.push(json);
        return {stackedEnsembles};
      });
      if (!this.refreshingSE) {
        this.refreshStackedEnsemblesUntilFinished(this.props.path)
      }
      this.props.addNotification({
        title: 'Success',
        message: 'Created ensemble',
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

  // Delete a stacked ensemble in the list
  deleteStackedEnsemble(id) {

    fetch(
      '/ensemble/stacked/' + id + '/?path=' + this.props.path,
      {
        method: "DELETE"
      }
    )
    .then(handleErrors)
    .then(response => response.json())
    .then(json => {
      console.log(json);
      this.setState((prevState) => {
        var stackedEnsembles = prevState.stackedEnsembles.slice();
        var idx = stackedEnsembles.findIndex((x) => x.id === id);
        stackedEnsembles.splice(idx, 1);
        return {stackedEnsembles};
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

  // Export an ensemble
  exportEnsembleToBaseLearnerOrigin(id) {
    var payload = {};

    fetch(
      '/ensemble/stacked/' + id + '/export-new-blo/?path=' + this.props.path,
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
      this.setState((prevState) => {
        var baseLearnerOrigins = prevState.baseLearnerOrigins.slice();
        baseLearnerOrigins.push(json);
        return {baseLearnerOrigins};
      });
      this.props.addNotification({
        title: 'Success',
        message: 'Exported ensemble as new base learner type',
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
        label: obj.name + ' - ID: ' + obj.id,
        value: obj.id,
        disabled: !obj.final
      }
    });

    return (
      <div>
        <DataExtractionTabs 
          path={this.props.path}
          addNotification={(notif) => this.props.addNotification(notif)}
          presetCVs={this.state.presetCVs}
        />
        <ListBaseLearnerOrigin 
          path={this.props.path} 
          baseLearnerOrigins={this.state.baseLearnerOrigins}
          createBaseLearnerOrigin={() => this.createBaseLearnerOrigin()}
          updateBaseLearnerOrigin={(id, newData) => this.updateBaseLearnerOrigin(id, newData)}
          deleteBaseLearnerOrigin={(id) => this.deleteBaseLearnerOrigin(id)}
          createBaseLearner={(id, source) => this.createBaseLearner(id, source)}
          gridSearch={(id, source) => this.gridSearch(id, source)}
          randomSearch={(id, source, n) => this.randomSearch(id, source, n)}
          startBayesianRun={(id, source) => this.startBayesianRun(id, source)}
          startTpotRun={(source) => this.startTpotRun(source)}
          addNotification={(notif) => this.props.addNotification(notif)}
          presetBaseLearnerOrigins={this.state.presetBaseLearnerOrigins}
          presetMetricGenerators={this.state.presetMetricGenerators}
        />
        <AutomatedRunsDisplay
          automatedRuns={this.state.automatedRuns}
          deleteAutomatedRun={(id) => this.deleteAutomatedRun(id)}
        />
        <ListBaseLearner 
          path={this.props.path} 
          baseLearners={this.state.baseLearners}
          filterOptions={optionsBaseLearnerOrigins}
          deleteBaseLearner={(id) => this.deleteBaseLearner(id)}
          checkedBaseLearners={this.state.checkedBaseLearners}
          toggleCheckBaseLearner={(id) => this.toggleCheckBaseLearner(id)}
        />
        <EnsembleBuilder
          optionsBaseLearners={optionsBaseLearners}
          optionsBaseLearnerOrigins={optionsBaseLearnerOrigins}
          checkedOptions={checkedOptions}
          setCheckedBaseLearners={(checkedArray) => this.setState({checkedBaseLearners: ImSet(checkedArray)})}
          createStackedEnsemble={(bloId, hp) => 
            this.createStackedEnsemble(this.state.checkedBaseLearners, bloId, hp)}
          startGreedyRun={(id, source) => this.startGreedyRun(id, source)}
        />
        <ListEnsemble 
          path={this.props.path}
          addNotification={(notif) => this.props.addNotification(notif)}
          stackedEnsembles={this.state.stackedEnsembles}
          deleteStackedEnsemble={(id) => this.deleteStackedEnsemble(id)}
          exportEnsembleToBaseLearnerOrigin={(id) => this.exportEnsembleToBaseLearnerOrigin(id)}
        />
      </div>
    )
  }
}

export default ContainerBaseLearner;
