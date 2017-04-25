import React, { Component } from 'react';
import './BaseLearnerOrigin.css';
import $ from 'jquery';
import BaseLearnerOrigin from './BaseLearnerOrigin'

class ListBaseLearnerOrigin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      baseLearnerOrigins: []
    };
  }

  // Get request from server to populate fields
  componentDidMount() {
    fetch('/ensemble/base-learner-origins/?path=' + this.props.path)
    .then(response => response.json())
    .then(json => {
      console.log(json);
      this.setState({baseLearnerOrigins: json});
    });
  }

  getItems() {

    const items = this.state.baseLearnerOrigins.map((el, index) => {
      return (
        <BaseLearnerOrigin
          key={el.id} 
          path={this.props.path} 
          data={el} 
          updateBaseLearnerOrigin={(newData) => this.updateBaseLearnerOrigin(el.id, newData)}
          deleteLearner={() => this.deleteBaseLearnerOrigin(el.id)}
          createBaseLearner={(source) => this.props.createBaseLearner(el.id, source)}
          gridSearch={(source) => this.props.gridSearch(el.id, source)}
          randomSearch={(source, n) => this.props.randomSearch(el.id, source, n)}
        />
      );
    });

    return items;
  }

  // Creates a new base learner origin
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
        var newState = $.extend({}, prevState); // Copy
        newState.baseLearnerOrigins.push(json);
        return newState;
      });
    });
  }

  // Callback to update a base learner in the stored list
  updateBaseLearnerOrigin(id, newData) {
    this.setState((prevState) => {
      var newState = $.extend({}, prevState); // Copy
      var idx = newState.baseLearnerOrigins.findIndex((x) => x.id === id);
      newState.baseLearnerOrigins[idx] = newData;
      return newState;
    });
  }

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
        var newState = $.extend({}, prevState); // Copy
        var idx = newState.baseLearnerOrigins.findIndex((x) => x.id === id);
        if (idx > -1) {
          newState.baseLearnerOrigins.splice(idx, 1);
        }
        return newState;
      });
    });
  }

  render() {
    return <div className='BaseLearnerOrigin'>
      <h2>Base Learner Types</h2>
      {this.getItems()}
      <button onClick={() => this.createBaseLearnerOrigin()}>
        Add new base learner origin
      </button>
    </div>;
  }
}


export default ListBaseLearnerOrigin;
