import React, { Component } from 'react';


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
	      },
		}
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
  	fetch(
      '/ensemble/extraction/verification/?path=' + this.props.path,
      {
      	method: "POST"
      })
      .then(response => response.json())
      .then(json => {
	  	console.log(json)
	    this.setState({
	      verification: json
	    })
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
  	  <button onClick={this.calculateStatistics}>Calculate Extracted Datasets Statistics</button>
  	</div>
  	)

  }
}

export default DataVerificationResult;
