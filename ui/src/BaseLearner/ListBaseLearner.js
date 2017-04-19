import React, { Component } from 'react';
import './BaseLearner.css';
import BaseLearner from './BaseLearner';
import $ from 'jquery';

class ListBaseLearner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      baseLearners: []
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

  getItems() {
    const items = [];
    var arrayLength = this.state.baseLearners.length;
    for (var i=0; i < arrayLength; i++) {
      items.push(
        <BaseLearner 
        key={this.state.baseLearners[i].id} 
        path={this.props.path} 
        data={this.state.baseLearners[i]} />);
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
              <th><a onClick={() => console.log('kl')}>Accuracy</a></th>
              <th>Recall</th>
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
