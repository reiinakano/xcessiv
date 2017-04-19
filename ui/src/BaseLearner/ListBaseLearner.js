import React, { Component } from 'react';
import './BaseLearner.css';
import BaseLearner from './BaseLearner';
import $ from 'jquery';

class ListBaseLearner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      baseLearners: [],
      ascending: null,
      includedMetrics: ['Accuracy', 'Recall', 'Precision']
    };
  }

  // Get request from server to populate fields
  componentDidMount() {
    fetch('/ensemble/base-learners/?path=' + this.props.path)
    .then(response => response.json())
    .then(json => {
      console.log(json)
      const baseLearners = []
      for (var i=0; i < json.length; i++) {
        baseLearners.push(json[i]);
      }
      this.setState({baseLearners: baseLearners});
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

  // Sort
  sortList(ascending) {
    this.setState((prevState) => {
      var newState = $.extend({}, prevState); // Copy
      newState.baseLearners.sort((a, b) => {
        a = a.individual_score.Accuracy;
        b = b.individual_score.Accuracy;
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
      return newState;
    });
  }

  getItems() {
    const items = [];
    var arrayLength = this.state.baseLearners.length;
    for (var i=0; i < arrayLength; i++) {
      items.push(
        <BaseLearner 
        key={this.state.baseLearners[i].id} 
        path={this.props.path} 
        data={this.state.baseLearners[i]} 
        includedMetrics={this.state.includedMetrics} />);
    }
    return items;
  }

  // Return headers for included metrics
  getIncludedMetrics() {
    const items = [];
    var arrayLength = this.state.includedMetrics.length;
    for (var i = 0; i < arrayLength; i++) {
      items.push(
        <td key={i}>
          <a onClick={() => this.sortList(false)}>
            {this.state.includedMetrics[i]}
          </a>
        </td>
      );
    }
    return items;
  }

  render() {
    return(
      <div className='BaseLearnerPadding'>
        <h2>Base Learners</h2>
        <table className='BaseLearner'>
          <tbody>
            <tr>
              <th>ID</th>
              <th>Type ID</th>
              {this.getIncludedMetrics()}
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
