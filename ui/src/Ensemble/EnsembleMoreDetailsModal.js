import React, {Component} from 'react';
import './Ensemble.css';
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

    const stackedEnsemble = this.props.stackedEnsembles.find(el => el.id === this.props.moreDetailsId);

    if (stackedEnsemble === undefined) {
      return null;
    }

    return (
      <ReactModal
        isOpen={this.props.moreDetailsId !== null}
        onRequestClose={this.props.onRequestClose}
        contentLabel='Ensemble details'
        style={modalStyle}
      >
      <h4>Base Learners</h4>
      <ul>
        {stackedEnsemble.base_learner_ids.map((id) => {
          return (
            <li key={id}>{id}</li>
          )
        })}
      </ul>
      <h4>Metrics</h4>
      <ul>
        {Object.keys(stackedEnsemble.individual_score).map((key) => {
          return <li key={key}>{key + ': ' + stackedEnsemble.individual_score[key]}</li>
        })}
      </ul>
      <h4>Secondary Learner Hyperparameters</h4>
      <ul>
        {Object.keys(stackedEnsemble.secondary_learner_hyperparameters).map((key) => {
          return (
            <li key={key}>
              {key + ': ' + stackedEnsemble.secondary_learner_hyperparameters[key]}
            </li>
          );
        })}
      </ul>
      <h4>Secondary Learner</h4>
      {stackedEnsemble.base_learner_origin_id}
      <h4>Job ID</h4>
      {stackedEnsemble.job_id}
      {(stackedEnsemble.job_status === 'errored') && 
      <DisplayError description={stackedEnsemble.description} />}
      </ReactModal>
    )
  }
}

export default DetailsModal;
