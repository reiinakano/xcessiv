import React, { Component } from 'react';
import './BaseLearner.css';
import BaseLearner from './BaseLearner';
import { includes } from 'lodash';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

class ListBaseLearner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sortAscending: true,
      includedMetrics: ['Accuracy', 'Recall', 'Precision'],
      includedHyperparameters: [],
      sortCol: 'id',
      filterList: [],
      sortType: null
    };
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
  returnSortedList() {
    var sortedBaseLearners = this.props.baseLearners.slice()
    sortedBaseLearners.sort((a, b) => {
      if (this.state.sortType === null) {
        a = a[this.state.sortCol];
        b = b[this.state.sortCol];
      }
      else {
        a = a[this.state.sortType][this.state.sortCol];
        b = b[this.state.sortType][this.state.sortCol];
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
      else if (this.state.sortAscending) {
        return a < b ? -1 : 1;
      }
      else {
        return a < b ? 1 : -1;
      }
    });
    return sortedBaseLearners;
  }

  // Higher level sort function to be called by headers
  sortFromHeader(sortCol, sortType) {
    if (this.state.sortCol === sortCol && this.state.sortType === sortType) {
      this.setState({sortAscending: !this.state.sortAscending});
    }
    else {
      this.setState({sortCol: sortCol, sortAscending: true, sortType: sortType});
    }
  }

  getItems() {

    var sortedBaseLearners = this.returnSortedList();

    const items = sortedBaseLearners.filter((el) => {
      return (!this.state.filterList.length || includes(this.state.filterList, el.base_learner_origin_id));
    }).map((el, index) => {
      return (
        <BaseLearner 
        key={el.id} 
        path={this.props.path} 
        data={el} 
        includedMetrics={this.state.includedMetrics}
        includedHyperparameters={this.state.includedHyperparameters} 
        onUpdate={(newData) => this.props.updateBaseLearner(el.id, newData)}
        deleteBaseLearner={() => this.props.deleteBaseLearner(el.id)} />
      );
    });

    return items;
  }

  // Return headers for included metrics
  getIncludedMetrics() {

    const items = this.state.includedMetrics.map((el, index) => {
      return (
        <th key={index}>
          <a onClick={() => this.sortFromHeader(el, 'individual_score')}>
            {el}
            {(this.state.sortType === 'individual_score' && this.state.sortCol === el) ? (this.state.sortAscending ? '↓' : '↑') : ' '}
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
            {(this.state.sortType === 'hyperparameters' && this.state.sortCol === el) ? (this.state.sortAscending ? '↓' : '↑') : ' '}
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
        options={this.props.filterOptions} 
        onChange={(x) => this.handleFilterChange(x)} />
        <Select multi
        value={this.state.includedMetrics} 
        placeholder="Add additional metrics to display" 
        options={this.props.metricsOptions} 
        onChange={(x) => this.handleMetricsChange(x)} />
        <Select multi
        value={this.state.includedHyperparameters} 
        placeholder="Add additional hyperparameters to display" 
        options={this.props.hyperparametersOptions} 
        onChange={(x) => this.handleHyperparametersChange(x)} />
        <table className='BaseLearner'>
          <tbody>
            <tr>
              <th>
                <a onClick={() => this.sortFromHeader('id', null)}>
                  ID
                  {(this.state.sortType === null && this.state.sortCol === 'id') ? (this.state.sortAscending ? '↓' : '↑') : ' '}
                </a>
              </th>
              <th>
                <a onClick={() => this.sortFromHeader('base_learner_origin_id', null)}>
                  Type ID
                  {(this.state.sortType === null && this.state.sortCol === 'base_learner_origin_id') ? (this.state.sortAscending ? '↓' : '↑') : ' '}
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
