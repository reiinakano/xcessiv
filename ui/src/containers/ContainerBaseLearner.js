import React, { Component } from 'react';
import ListBaseLearner from '../BaseLearner/ListBaseLearner';
import ListBaseLearnerOrigin from '../BaseLearnerOrigin/ListBaseLearnerOrigin'
import $ from 'jquery';

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

  // Callback to update a base learner in the list
  updateBaseLearner(id, newData) {
    this.setState((prevState) => {
      var newState = $.extend({}, prevState); // Copy
      var idx = newState.baseLearners.findIndex((x) => x.id === id);
      newState.baseLearners[idx] = newData;
      return newState;
    });
  }

  render() {
    return (
      <div>
        <ListBaseLearnerOrigin 
          path={this.props.path} 
          refreshBaseLearners={() => this.refreshBaseLearners()}
        />
        <ListBaseLearner 
          path={this.props.path} 
          baseLearners={this.state.baseLearners}
          filterOptions={this.state.filterOptions}
          metricsOptions={this.state.metricsOptions}
          hyperparametersOptions={this.state.hyperparametersOptions}
          updateBaseLearner={(id, newData) => this.updateBaseLearner(id, newData)}
        />
      </div>
    )
  }
}

export default ContainerBaseLearner;
