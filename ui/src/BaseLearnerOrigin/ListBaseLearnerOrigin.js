import React, { Component } from 'react';
import './BaseLearnerOrigin.css';
import BaseLearnerOrigin from './BaseLearnerOrigin'

class ListBaseLearnerOrigin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ids: []
    };
    this.deleteBaseLearnerOrigin = this.deleteBaseLearnerOrigin.bind(this);
  }

  // Get request from server to populate fields
  componentDidMount() {
    fetch('/ensemble/base-learner-origins/?path=' + this.props.path)
    .then(response => response.json())
    .then(json => {
      console.log(json)
      const ids = []
      for (var i=0; i < json.length; i++) {
        ids.push(json[i].id);
      }
      this.setState({ids: ids});
    });
  }

  getItems() {
    const items = [];
    var arrayLength = this.state.ids.length;
    for (var i=0; i < arrayLength; i++) {
      items.push(
        <BaseLearnerOrigin 
        key={this.state.ids[i]} 
        path={this.props.path} 
        id={this.state.ids[i]}
        deleteLearner={this.deleteBaseLearnerOrigin} />);
    }
    return items;
  }

  deleteBaseLearnerOrigin(bloId) {
    fetch(
      '/ensemble/base-learner-origins/' + bloId + '/?path=' + this.props.path,
      {
        method: "DELETE",
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      })
      .then(response => response.json())
      .then(json => {
        console.log(json);
        const ids = this.state.ids.slice();
        var index = ids.indexOf(bloId);
        if (index > -1) {
          ids.splice(index, 1);
        }
        this.setState({ids: ids});
      });
  }

  render() {
    return <div className='BaseLearnerOrigin'>
      <h2>Base Learner Types</h2>
      {this.getItems()}
    </div>;
  }
}


export default ListBaseLearnerOrigin;
