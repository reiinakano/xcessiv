import React, {Component} from 'react';
import './BaseLearner.css';
import Collapse from 'react-collapse';
import FaCheck from 'react-icons/lib/fa/check';
import FaSpinner from 'react-icons/lib/fa/spinner';
import FaExclamationCircle from 'react-icons/lib/fa/exclamation-circle'

function handleErrors(response) {
  if (!response.ok) {
    var error = new Error(response.statusText);

    // Unexpected error
    if (response.status === 500) {
      error.errMessage = 'Unexpected error';
      throw error;
    }
    return response.json()
      .then(errorBody => {
        error.errMessage = JSON.stringify(errorBody);
        throw error;
      });
  }
  return response;
}

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

  fetchUntilFinished() {
    fetch('/ensemble/base-learners/' + this.props.data.id + '/?path=' + this.props.path)
    .then(handleErrors)
    .then(response => response.json())
    .then(json => {
      console.log(json);
      if (json.job_status === 'queued' || json.job_status === 'started') {
        // Delay 5 seconds
        setTimeout(() => this.fetchUntilFinished(), 5000);
      }
      else {
        // Update base learner
        this.props.onUpdate(json);
        console.log('Job is done');
      }
    })
    .catch(error => {
      console.log(error.message);
      console.log(error.errMessage);
    });
  }

  componentDidMount() {
    if (this.props.data.job_status === 'queued' || this.props.data.job_status === 'started') {
      this.fetchUntilFinished();
    }
  }

  // Open collapse
  onCollapseOpen() {
    this.setState((prevState) => ({open: !prevState.open}));
  }

  // Return td of selected metrics
  getIncludedMetrics() {
    const items = [];
    var arrayLength = this.props.includedMetrics.length;
    for (var i = 0; i < arrayLength; i++) {
      items.push(
        <td key={i}>{String(this.props.data.individual_score[this.props.includedMetrics[i]]).substring(0, 5)}</td>
      );
    }
    return items;
  }

  // Return td of selected hyperparameters
  getIncludedHyperparameters() {
    const items = [];
    var arrayLength = this.props.includedHyperparameters.length;
    for (var i = 0; i < arrayLength; i++) {
      items.push(
        <td key={i}>
        {String(this.props.data.hyperparameters[this.props.includedHyperparameters[i]])}
        </td>
      );
    }
    return items;
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
          {this.getIncludedMetrics()}
          {this.getIncludedHyperparameters()}
          <td>{status_icon}</td>
        </tr>
        <tr>
          <td colSpan={3 + this.props.includedMetrics.length + this.props.includedHyperparameters.length} 
          style={{padding: 0}}>
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
