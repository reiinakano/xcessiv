import React, { Component } from 'react';
import './BaseLearner.css';
import BaseLearner from './BaseLearner';

class ListBaseLearner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ids: []
    };
  }

  // Get request from server to populate fields
  componentDidMount() {
    fetch('/ensemble/base-learners/?path=' + this.props.path)
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
        <BaseLearner 
        key={this.state.ids[i]} 
        path={this.props.path} 
        id={this.state.ids[i]} />);
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
              <th>Accuracy</th>
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
