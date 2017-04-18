import React, { Component } from 'react';
import './BaseLearner.css';
import Collapse from 'react-collapse';
import { omit } from 'lodash';

function DisplayHyperparameters(props) {
  const items = [];
  for (var key in props.hyperparameters) {
      items.push(<li key={key}>{key + ': ' + props.hyperparameters[key]}</li>)
    }
  return <div>
    <h4>Hyperparameters</h4>
    <ul>{items}</ul>
  </div>
}

function DisplayScores(props) {
  const items = [];
  for (var key in props.individual_score) {
      items.push(<li key={key}>{key + ': ' + props.individual_score[key]}</li>)
    }
  return <div>
    <h4>Metrics</h4>
    <ul>{items}</ul>
  </div>
}

function DisplayError(props) {
  const items = [];
  for (var key in props.description) {
      items.push(<li key={key}>{key + ': ' + props.description[key]}</li>)
    }
  return <div>
    <h4>Error Messages</h4>
    <ul>{items}</ul>
  </div>
}

class BaseLearner extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: {
        base_learner_origin_id: 2,
        description: {},
        hyperparameters: {},
        individual_score: {},
        job_id: '',
        job_status: '',
        meta_features_exists: false
      },
      open: false
    };
  }

  // Get request from server to populate fields
  componentDidMount() {
    fetch('/ensemble/base-learners/' + this.props.id + '/?path=' + this.props.path)
    .then(response => response.json())
    .then(json => {
      console.log(json)
      this.setState({data: omit(json, 'id')});
    });
  }

  // Open collapse
  onCollapseOpen() {
    this.setState((prevState) => ({open: !prevState.open}));
  }

  render() {
    var errored = (this.state.data.job_status === 'errored');

    return (
      <tbody>
        <tr onClick={() => this.onCollapseOpen()}>
          <td>{this.props.id}</td>
          <td>{String(this.state.data.base_learner_origin_id)}</td>
          <td>{String(this.state.data.individual_score.Accuracy)}</td>
          <td>{String(this.state.data.individual_score.Recall)}</td>
          <td>{this.state.data.job_status}</td>
        </tr>
        <tr>
          <td colSpan='5'>
            <Collapse isOpened={this.state.open} keepCollapsedContent={true}>
              {errored && <DisplayError description={this.state.data.description} />}
              <DisplayHyperparameters hyperparameters={this.state.data.hyperparameters} />
              <DisplayScores individual_score={this.state.data.individual_score} />
            </Collapse>
          </td>
        </tr>
      </tbody>
    )
  }
}


export default BaseLearner;
