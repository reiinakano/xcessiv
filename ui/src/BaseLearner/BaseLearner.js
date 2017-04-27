import React, {Component} from 'react';
import './BaseLearner.css';
import Collapse from 'react-collapse';
import ReactModal from 'react-modal';
import FaCheck from 'react-icons/lib/fa/check';
import FaSpinner from 'react-icons/lib/fa/spinner';
import FaExclamationCircle from 'react-icons/lib/fa/exclamation-circle'

const modalStyle = {
  overlay : {
    zIndex            : 1000
  },
  content : {
    top                        : '50%',
    left                       : '50%',
    right                      : 'auto',
    bottom                     : 'auto',
    marginRight                : '-50%',
    transform                  : 'translate(-50%, -50%)',
    border                     : '1px solid #ccc',
    background                 : '#fff',
    overflow                   : 'auto',
    WebkitOverflowScrolling    : 'touch',
    borderRadius               : '4px',
    outline                    : 'none',
    padding                    : '20px'
  }
}

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

class DeleteModal extends Component {

  handleYesAndClose() {
    this.props.handleYes();
    this.props.onRequestClose();
  }

  render() {
    return (
      <ReactModal
        isOpen={this.props.isOpen}
        onRequestClose={this.props.onRequestClose}
        contentLabel='Delete base learner'
        style={modalStyle}
      >
      <p>Are you sure you want to delete this base learner?</p>
      <p>You will also lose all ensembles that have been built using this learner</p>
      <p><strong>This action is irreversible.</strong></p>
        <button onClick={this.props.onRequestClose}>Cancel</button>
        <button onClick={() => this.handleYesAndClose()}>Delete</button>
      </ReactModal>
    )
  }
}

class BaseLearner extends Component {

  constructor(props) {
    super(props);
    this.state = {
      open: false,
      showDeleteModal: false
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
          <td>
            <input type="checkbox" checked={this.props.checked} 
            onClick={(e) => e.stopPropagation()}
            onChange={this.props.toggleCheckBaseLearner}
            disabled={this.props.data.job_status !== 'finished'} />
          </td>
          <td>{this.props.data.id}</td>
          <td>{String(this.props.data.base_learner_origin_id)}</td>
          {this.getIncludedMetrics()}
          {this.getIncludedHyperparameters()}
          <td>{status_icon}</td>
        </tr>
        <tr>
          <td colSpan={4 + this.props.includedMetrics.length + this.props.includedHyperparameters.length} 
          style={{padding: 0}}>
            <Collapse isOpened={this.state.open}>
              <div className='collapse'>
                {errored && <DisplayError description={this.props.data.description} />}
                <DisplayHyperparameters hyperparameters={this.props.data.hyperparameters} />
                <DisplayScores individual_score={this.props.data.individual_score} />
                Job ID: {this.props.data.job_id}
                <button onClick={() => this.setState({showDeleteModal: true})}>
                  Delete this base learner
                </button>
                <DeleteModal isOpen={this.state.showDeleteModal}
                onRequestClose={() => this.setState({showDeleteModal: false})}
                handleYes={this.props.deleteBaseLearner} />
              </div>
            </Collapse>
          </td>
        </tr>
      </tbody>
    )
  }
}


export default BaseLearner;
