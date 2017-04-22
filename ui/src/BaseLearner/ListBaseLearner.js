import React, { Component } from 'react';
import './BaseLearner.css';
import BaseLearner from './BaseLearner';
import $ from 'jquery';
import { includes } from 'lodash';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

class ListBaseLearner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      baseLearners: [],
      ascending: true,
      metricsOptions: [],
      includedMetrics: ['Accuracy', 'Recall', 'Precision'],
      hyperparametersOptions: [],
      includedHyperparameters: [],
      col: 'id',
      filterOptions: [],
      filterList: [],
      type: null
    };
  }

  // Get request from server to populate fields
  componentDidMount() {
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

  // Callback for additional filter
  handleFilterChange(value) {
    console.log(value);
    this.setState({filterList: value.map((x) => x.value)});
  }

  // Callback for additional metrics
  handleMetricsChange(value) {
    console.log(value);
    this.setState({includedMetrics: value.map((x) => x.value)});
  }

  // Callback for additional hyperparameters
  handleHyperparametersChange(value) {
    console.log(value);
    this.setState({includedHyperparameters: value.map((x) => x.value)});
  }

  // Sort
  sortList(col, ascending, type) {
    this.setState((prevState) => {
      console.log(arguments)
      var newState = $.extend({}, prevState); // Copy
      newState.baseLearners.sort((a, b) => {
        if (type === null) {
          a = a[col];
          b = b[col];
        }
        else {
          a = a[type][col];
          b = b[type][col];
        }
        if (a === undefined) {
          return 1;
        }
        else if (b === undefined) {
          return -1;
        }
        else if (a === b){
          return 0;
        }
        else if (ascending) {
          return a < b ? -1 : 1;
        }
        else {
          return a < b ? 1 : -1;
        }
      });
      newState.ascending = ascending;
      newState.col = col;
      newState.type = type;
      return newState;
    });
  }

  // Higher level sort function to be called by headers
  sortFromHeader(col, type) {
    if (this.state.col === col && this.state.type === type) {
      this.sortList(col, !this.state.ascending, type);
    }
    else {
      this.sortList(col, true, type);
    }
  }

  getItems() {
    const items = [];
    var arrayLength = this.state.baseLearners.length;
    for (var i=0; i < arrayLength; i++) {
      var inFilterList = includes(this.state.filterList, 
        this.state.baseLearners[i].base_learner_origin_id);
      if (!this.state.filterList.length || inFilterList){
        items.push(
          <BaseLearner 
          key={this.state.baseLearners[i].id} 
          path={this.props.path} 
          data={this.state.baseLearners[i]} 
          includedMetrics={this.state.includedMetrics}
          includedHyperparameters={this.state.includedHyperparameters} />
        );
      }
      
    }
    return items;
  }

  // Return headers for included metrics
  getIncludedMetrics() {

    const items = this.state.includedMetrics.map((el, index) => {
      return (
        <th key={index}>
          <a onClick={() => this.sortFromHeader(el, 'individual_score')}>
            {el}
            {(this.state.type === 'individual_score' && this.state.col === el) ? (this.state.ascending ? '↓' : '↑') : ' '}
          </a>
        </th>
      )
    })

    return items;
  }

  // Return headers for included hyperparameters
  getIncludedHyperparameters() {

    const items = this.state.includedHyperparameters.map((el, index) => {
      return (
        <th key={index}>
          <a onClick={() => this.sortFromHeader(el, 'hyperparameters')}>
            {el}
            {(this.state.type === 'hyperparameters' && this.state.col === el) ? (this.state.ascending ? '↓' : '↑') : ' '}
          </a>
        </th>
      )
    })

    return items;
  }

  render() {
    return(
      <div className='BaseLearnerPadding'>
        <h2>Base Learners</h2>
        <Select multi
        value={this.state.filterList} 
        placeholder="Filter for Base Learner Type" 
        options={this.state.filterOptions} 
        onChange={(x) => this.handleFilterChange(x)} />
        <Select multi
        value={this.state.includedMetrics} 
        placeholder="Add additional metrics to display" 
        options={this.state.metricsOptions} 
        onChange={(x) => this.handleMetricsChange(x)} />
        <Select multi
        value={this.state.includedHyperparameters} 
        placeholder="Add additional hyperparameters to display" 
        options={this.state.hyperparametersOptions} 
        onChange={(x) => this.handleHyperparametersChange(x)} />
        <table className='BaseLearner'>
          <tbody>
            <tr>
              <th>
                <a onClick={() => this.sortFromHeader('id', null)}>
                  ID
                  {(this.state.type === null && this.state.col === 'id') ? (this.state.ascending ? '↓' : '↑') : ' '}
                </a>
              </th>
              <th>
                <a onClick={() => this.sortFromHeader('base_learner_origin_id', null)}>
                  Type ID
                  {(this.state.type === null && this.state.col === 'base_learner_origin_id') ? (this.state.ascending ? '↓' : '↑') : ' '}
                </a>
              </th>
              {this.getIncludedMetrics()}
              {this.getIncludedHyperparameters()}
              <th>Status</th>
            </tr>
          </tbody>
          {this.getItems()}
        </table>
      </div>
    )
  }
}


export default ListBaseLearner;
