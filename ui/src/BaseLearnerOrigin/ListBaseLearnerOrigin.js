import React, { Component } from 'react';
import './BaseLearnerOrigin.css';
import BaseLearnerOrigin from './BaseLearnerOrigin'

class ListBaseLearnerOrigin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ids: []
    };
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
      items.push(<BaseLearnerOrigin key={this.state.ids[i]} path={this.props.path} id={this.state.ids[i]}/>);
    }
    return items;
  }

  render() {
    return <div className='BaseLearnerOrigin'>
      <h2>Base Learner Types</h2>
      {this.getItems()}
    </div>;
  }
}


export default ListBaseLearnerOrigin;
