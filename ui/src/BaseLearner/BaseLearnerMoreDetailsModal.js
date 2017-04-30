import React, {Component} from 'react';
import './BaseLearner.css';
import 'react-select/dist/react-select.css';
import ReactModal from 'react-modal';


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

class DetailsModal extends Component {
  render() {
    if (this.props.moreDetailsId === null) {
      return null;
    }

    const baseLearner = this.props.baseLearners.find(el => el.id === this.props.moreDetailsId);

    if (baseLearner === undefined) {
      return null;
    }

    return (
      <ReactModal
        isOpen={this.props.moreDetailsId !== null}
        onRequestClose={this.props.onRequestClose}
        contentLabel='Ensemble details'
        style={modalStyle}
      >
      <h4>Metrics</h4>
      <ul>
        {Object.keys(baseLearner.individual_score).map((key) => {
          return <li key={key}>{key + ': ' + baseLearner.individual_score[key]}</li>
        })}
      </ul>
      <h4>Secondary Learner Hyperparameters</h4>
      <ul>
        {Object.keys(baseLearner.hyperparameters).map((key) => {
          return (
            <li key={key}>
              {key + ': ' + baseLearner.hyperparameters[key]}
            </li>
          );
        })}
      </ul>
      <h4>Type ID</h4>
      {baseLearner.base_learner_origin_id}
      <h4>Job ID</h4>
      {baseLearner.job_id}
      {(baseLearner.job_status === 'errored') && 
      <DisplayError description={baseLearner.description} />}
      </ReactModal>
    )
  }
}

export class DeleteModal extends Component {

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
      <p>All ensembles containing this base learner will be lost as well.</p>
      <p><strong>This action is irreversible.</strong></p>
        <button onClick={this.props.onRequestClose}>Cancel</button>
        <button onClick={() => this.handleYesAndClose()}>Delete</button>
      </ReactModal>
    )
  }
}

export default DetailsModal;
