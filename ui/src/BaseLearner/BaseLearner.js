import React, { Component } from 'react';
import './BaseLearner.css';
import Collapse from 'react-collapse';
import FaCheck from 'react-icons/lib/fa/check';
import FaSpinner from 'react-icons/lib/fa/spinner';
import FaExclamationCircle from 'react-icons/lib/fa/exclamation-circle'

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
      open: false
    };
  }

  // Open collapse
  onCollapseOpen() {
    this.setState((prevState) => ({open: !prevState.open}));
  }

  render() {
    var errored = (this.props.data.job_status === 'errored');
    var status_icon
    if (this.props.data.job_status === 'errored') {
      status_icon = <FaExclamationCircle />
    }
    else if (this.props.data.job_status === 'finished') {
      status_icon = <FaCheck />
    }
    else {
      status_icon = <FaSpinner className='load-animate'/>
    }

    return (
      <tbody>
        <tr onClick={() => this.onCollapseOpen()}>
          <td>{this.props.data.id}</td>
          <td>{String(this.props.data.base_learner_origin_id)}</td>
          <td>{String(this.props.data.individual_score.Accuracy).substring(0, 5)}</td>
          <td>{String(this.props.data.individual_score.Recall).substring(0, 5)}</td>
          <td>{status_icon}</td>
        </tr>
        <tr>
          <td colSpan='5' style={{padding: 0}}>
            <Collapse isOpened={this.state.open}>
              <div className='collapse'>
                {errored && <DisplayError description={this.props.data.description} />}
                <DisplayHyperparameters hyperparameters={this.props.data.hyperparameters} />
                <DisplayScores individual_score={this.props.data.individual_score} />
                Job ID: {this.props.data.job_id}
              </div>
            </Collapse>
          </td>
        </tr>
      </tbody>
    )
  }
}


export default BaseLearner;
