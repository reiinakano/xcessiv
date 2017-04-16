import React, { Component } from 'react';
import FaSpinner from 'react-icons/lib/fa/spinner';


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

class DataVerificationResult extends Component {
  constructor(props) {
    super(props);
    this.state = {
      verification: {
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
      },
      asyncStatus: '',
      errorMessage: ''
    };
    this.calculateStatistics = this.calculateStatistics.bind(this);
  } 

  // Get request from server to populate fields
  componentDidMount() {
    fetch('/ensemble/extraction/verification/?path=' + this.props.path)
    .then(response => response.json())
    .then(json => {
      console.log(json)
      if (json !== null) {

      this.setState({
        verification: json
      });
    }
    });
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
    })
    .catch(error => {
      console.log(error.message);
      console.log(error.errMessage);
      var errorMessage = error.message + ' ' + error.errMessage
      this.setState({asyncStatus: '', errorMessage: errorMessage});
    });
  }
  
  render() {

    return(
    <div className='MainDataExtraction'>
      <h2>Extracted datasets basic statistics</h2>
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
        {this.state.errorMessage}
      </h4>
      <button disabled={Boolean(this.state.asyncStatus)}
      onClick={this.calculateStatistics}>Calculate Extracted Datasets Statistics</button>
      {Boolean(this.state.asyncStatus) && (' ' + this.state.asyncStatus + ' ')}
      {Boolean(this.state.asyncStatus) && <FaSpinner/>}
    </div>
    )

  }
}

export default DataVerificationResult;
