import React, { Component } from 'react';
import FaSpinner from 'react-icons/lib/fa/spinner';
import { Button, Alert } from 'react-bootstrap';

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

function BasicDataStatistics(props) {
  var stats = props.stats;
  if (props.stats === null) {
    stats = {};
  }
  return (
    <ul>
      <li>Features shape: <b>{String(stats.features_shape)}</b></li>
      <li>Labels shape: <b>{String(stats.labels_shape)}</b></li>
    </ul>
  )
}

function ErrorAlert(props) {
  return (
    <Alert bsStyle='danger'>
      {props.errorMessage}
    </Alert>
  )
}

const defaultVerification = {
  'holdout_data_stats': {
    'features_shape': [0, 0],
    'labels_shape': [0]
  },
  'test_data_stats': {
    'features_shape': [0, 0],
    'labels_shape': [0]
  },
  'train_data_stats': {
    'features_shape': [0, 0],
    'labels_shape': [0]
  }
}
 
class DataVerificationResult extends Component {
  constructor(props) {
    super(props);
    this.state = {
      verification: defaultVerification,
      asyncStatus: '',
      errorMessage: ''
    };
    this.calculateStatistics = this.calculateStatistics.bind(this);
  } 

  // Get request from server to populate fields
  fetchVerification(path) {
    fetch('/ensemble/extraction/verification/?path=' + path)
    .then(response => response.json())
    .then(json => {
      console.log(json)
      if (json !== null) {
        this.setState({
          verification: json
        });
      }
      else {
        this.setState({
          verification: defaultVerification
        });
      }
    });
  }

  componentDidMount() {
    this.fetchVerification(this.props.path);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.path !== nextProps.path) {
      this.fetchVerification(nextProps.path);
    }
  }

  // Calculate statistics for extracted datasets
  calculateStatistics() {
    this.setState({asyncStatus: 'Calculating...'})
    fetch(
      '/ensemble/extraction/verification/?path=' + this.props.path,
      {
        method: "POST"
      })
    .then(handleErrors)
    .then(response => response.json())
    .then(json => {
      console.log(json);
      this.setState({
        verification: json,
        asyncStatus: '',
        errorMessage: ''
      });
      this.props.addNotification({
        title: 'Success',
        message: 'Successfully executed dataset extraction',
        level: 'success'
      });
    })
    .catch(error => {
      console.log(error.message);
      console.log(error.errMessage);
      var errorMessage = error.errMessage;
      this.setState({asyncStatus: '', errorMessage: errorMessage});
      this.props.addNotification({
        title: 'Error',
        message: 'Something went wrong in dataset extraction',
        level: 'error'
      });
    });
  }
  
  render() {
    console.log(this.props.same)
    return(
    <div className='MainDataExtraction'>
      <h3>Extracted datasets basic statistics</h3>
      <table>
        <tbody>
          <tr>
          <td>
            <h4>Training dataset statistics</h4>
            <BasicDataStatistics stats={this.state.verification.train_data_stats}/>
          </td>
          <td>
            <h4>Testing dataset statistics</h4>
          <BasicDataStatistics stats={this.state.verification.test_data_stats}/>
          </td>
          <td>
            <h4>Holdout dataset statistics</h4>
            <BasicDataStatistics stats={this.state.verification.holdout_data_stats}/>
          </td>
          </tr>
        </tbody>
      </table>
      <h4>
        {this.state.errorMessage 
          && <ErrorAlert errorMessage={this.state.errorMessage} />}
      </h4>
      <Button 
        bsStyle="primary"
        disabled={Boolean(this.state.asyncStatus) || !this.props.same}
        onClick={this.calculateStatistics}
      >
        {(this.state.asyncStatus) ? 'Calculating... ': 'Calculate Extracted Datasets Statistics'}
        {Boolean(this.state.asyncStatus) && <FaSpinner className='load-animate'/>}
      </Button>
    </div>
    )

  }
}

export default DataVerificationResult;
