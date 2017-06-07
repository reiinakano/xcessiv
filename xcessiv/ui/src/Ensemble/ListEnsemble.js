import React, {Component} from 'react';
import './Ensemble.css';
import 'fixed-data-table/dist/fixed-data-table.min.css';
import { Table, Column, Cell } from 'fixed-data-table';
import FaCheck from 'react-icons/lib/fa/check';
import FaTrash from 'react-icons/lib/fa/trash';
import FaDownload from 'react-icons/lib/fa/download';
import FaSpinner from 'react-icons/lib/fa/spinner';
import FaExclamationCircle from 'react-icons/lib/fa/exclamation-circle'
import FaInfo from 'react-icons/lib/fa/info';
import Dimensions from 'react-dimensions';
import Select from 'react-select';
import DetailsModal, { DeleteModal, ExportModal } from './EnsembleMoreDetailsModal'

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

function HeaderCell(props) {
  return (
    <Cell>
      <a 
        style={{cursor: 'pointer'}} 
        onClick={props.sortFromHeader}
      >
        {props.headerText}
      </a>
    </Cell>
  )
}


class ListEnsemble extends Component {

  constructor(props) {
    super(props);
    this.state = {
      includedMetrics: [],
      includedHyperparameters: [],
      sortAscending: true,
      sortCol: 'id',
      sortType: null,
      moreDetailsId: null,
      idToDelete: null,
      idToExport: null
    };
    this.sortedStackedEnsembles = this.props.stackedEnsembles;
  }

  // Sort
  returnSortedList() {
    var sortedStackedEnsembles = this.props.stackedEnsembles.slice()
    sortedStackedEnsembles.sort((a, b) => {
      if (this.state.sortType === null) {
        a = a[this.state.sortCol];
        b = b[this.state.sortCol];
      }
      else {
        a = a[this.state.sortType][this.state.sortCol];
        b = b[this.state.sortType][this.state.sortCol];
      }
      if (a === undefined) {
        return 1;
      }
      else if (b === undefined) {
        return -1;
      }
      else if (a === b){
        return 0;
      }
      else if (this.state.sortAscending) {
        return a < b ? -1 : 1;
      }
      else {
        return a < b ? 1 : -1;
      }
    });
    this.sortedStackedEnsembles = sortedStackedEnsembles;
  }

  // Higher level sort function to be called by headers
  sortFromHeader(sortCol, sortType) {
    if (this.state.sortCol === sortCol && this.state.sortType === sortType) {
      this.setState({sortAscending: !this.state.sortAscending});
    }
    else {
      this.setState({sortCol: sortCol, sortAscending: true, sortType: sortType});
    }
  }

  getDataColumns() {
    const cols = [
      {label: 'ID', value: 'id', width: 50}, 
      {label: 'Secondary Learner ID', value: 'base_learner_origin_id', width: 100},
      {label: 'Number of Base Learners', value: 'number_of_base_learners', width: 100}
    ]
    return cols.map((obj) => {
      var headerText = ((this.state.sortType === null && this.state.sortCol === obj.value) ? (this.state.sortAscending ? '↓' : '↑') : '') + obj.label

      return (
        <Column
          key={obj.value}
          header={
            <HeaderCell
              headerText={headerText}
              sortFromHeader={() => this.sortFromHeader(obj.value, null)}
            />}
          cell={(props) => {
            if (this.sortedStackedEnsembles[props.rowIndex] === undefined) {
              return (<Cell {...props}></Cell>)
            }
            return (
              <Cell {...props}>
                {String(this.sortedStackedEnsembles[props.rowIndex][obj.value])}
              </Cell>
            )
          }}
          width={obj.width}
          flexGrow={1}
        />
      )
    });
  }

  getMetricsColumns() {
    return this.state.includedMetrics.map((metric) => {
      var headerText = ((this.state.sortType === 'individual_score' && this.state.sortCol === metric) ? (this.state.sortAscending ? '↓' : '↑') : '') + metric

      return (
        <Column
          key={metric}
          header={
            <HeaderCell
              headerText={headerText}
              sortFromHeader={() => this.sortFromHeader(metric, 'individual_score')}
            />}
          cell={(props) => {
            if (this.sortedStackedEnsembles[props.rowIndex] === undefined) {
              return (<Cell {...props}></Cell>);
            }
            return (
              <Cell {...props}>
                {String(this.sortedStackedEnsembles[props.rowIndex].individual_score[metric]).substring(0, 5)}
              </Cell>
            )
          }}
          width={Math.max(metric.length*10, 50)}
          flexGrow={1}
        />
      )
    });
  }

  getHyperparametersColumns() {
    return this.state.includedHyperparameters.map((metric) => {
      var headerText = ((this.state.sortType === 'secondary_learner_hyperparameters' && this.state.sortCol === metric) ? (this.state.sortAscending ? '↓' : '↑') : '') + metric

      return (
        <Column
          key={metric}
          header={
            <HeaderCell
              headerText={headerText}
              sortFromHeader={() => this.sortFromHeader(metric, 'secondary_learner_hyperparameters')}
            />}
          cell={(props) => {
            if (this.sortedStackedEnsembles[props.rowIndex] === undefined) {
              return (<Cell {...props}></Cell>);
            }
            return (
              <Cell {...props}>
                {String(this.sortedStackedEnsembles[props.rowIndex].secondary_learner_hyperparameters[metric]).substring(0, 5)}
              </Cell>
            )
          }}
          width={Math.max(metric.length*10, 50)}
          flexGrow={1}
        />
      )
    });
  }

  // Export an ensemble
  exportEnsemble(id, name) {
    var payload = {name};
    payload.type = 'file';

    fetch(
      '/ensemble/stacked/' + id + '/export/?path=' + this.props.path,
      {
        method: "POST",
        body: JSON.stringify( payload ),
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      }
    )
    .then(handleErrors)
    .then(response => response.json())
    .then(json => {
      this.props.addNotification({
        title: 'Success',
        message: json.message,
        level: 'success'
      });
    })
    .catch(error => {
      console.log(error.message);
      console.log(error.errMessage);
      this.props.addNotification({
        title: error.message,
        message: error.errMessage,
        level: 'error'
      });
    });
  }

  render() {
    const metricsOptionsSet = new Set([]);
    for (let obj of this.props.stackedEnsembles) {
      for (let metric in obj.individual_score) metricsOptionsSet.add(metric);
    }
    const metricsOptions = [...metricsOptionsSet].map((metric) => {
      return {
        label: metric,
        value: metric
      };
    });
    const hyperparametersOptionsSet = new Set([]);
    for (let obj of this.props.stackedEnsembles) {
      for (let metric in obj.secondary_learner_hyperparameters) 
        hyperparametersOptionsSet.add(metric);
    }
    const hyperparametersOptions = [...hyperparametersOptionsSet].map((metric) => {
      return {
        label: metric,
        value: metric
      };
    });
    this.returnSortedList();
    return(
      <div className='Ensemble'>
        <h2>Stacked Ensembles</h2>
        <table><tbody><tr>
          <td>
          <Select multi
            value={this.state.includedMetrics} 
            placeholder="Add additional metrics to display" 
            options={metricsOptions} 
            onChange={(x) => this.setState({includedMetrics: x.map(obj => obj.value)})} />
          </td>
          <td>
          <Select multi
            value={this.state.includedHyperparameters} 
            placeholder="Add additional secondary learner hyperparameters to display" 
            options={hyperparametersOptions} 
            onChange={(x) => this.setState({includedHyperparameters: x.map(obj => obj.value)})} />
          </td>
        </tr></tbody></table>
        <Table
          rowsCount={this.props.stackedEnsembles.length}
          rowHeight={35}
          headerHeight={50}
          width={this.props.containerWidth}
          height={Math.min(500, 50 + 35*this.props.stackedEnsembles.length)}>
          {this.getDataColumns()}
          {this.getMetricsColumns()}
          {this.getHyperparametersColumns()}
          <Column
            header={
            <HeaderCell
              headerText={((this.state.sortType === null && this.state.sortCol === 'job_status') ? (this.state.sortAscending ? '↓' : '↑') : '') + 'Status'}
              sortFromHeader={() => this.sortFromHeader('job_status', null)}
            />}
            cell={(props) => {
              if (this.sortedStackedEnsembles[props.rowIndex] === undefined) {
                return (<Cell {...props}></Cell>)
              }

              var status_icon;
              if (this.sortedStackedEnsembles[props.rowIndex].job_status === 'errored') {
                status_icon = <FaExclamationCircle />
              }
              else if (this.sortedStackedEnsembles[props.rowIndex].job_status === 'finished') {
                status_icon = <FaCheck />
              }
              else if (this.sortedStackedEnsembles[props.rowIndex].job_status === 'queued') {
                status_icon = 'Queued'
              }
              else {
                status_icon = <FaSpinner className='load-animate'/>
              }

              return (
                <Cell {...props}>
                  {status_icon}
                </Cell>
              )
            }}
            width={50}
            flexGrow={1}
          />
          <Column
            cell={(props) => {

              return (
                <Cell {...props}>
                  <FaDownload 
                    style={{cursor: 'pointer'}}
                    onClick={() => this.setState({idToExport: this.sortedStackedEnsembles[props.rowIndex].id})}
                  />
                </Cell>
              )
            }}
            width={50}
          />
          <Column
            cell={(props) => {

              return (
                <Cell {...props}>
                  <FaInfo 
                    style={{cursor: 'pointer'}}
                    onClick={() => 
                      this.setState({moreDetailsId: this.sortedStackedEnsembles[props.rowIndex].id})}
                  />
                </Cell>
              )
            }}
            width={50}
          />
          <Column
            cell={(props) => {

              return (
                <Cell {...props}>
                  <FaTrash 
                    style={{cursor: 'pointer'}}
                    onClick={() => this.setState({idToDelete: this.sortedStackedEnsembles[props.rowIndex].id})}
                  />
                </Cell>
              )
            }}
            width={50}
          />
        </Table>
        <DetailsModal 
          onRequestClose={() => this.setState({moreDetailsId: null})}
          stackedEnsembles={this.props.stackedEnsembles}
          moreDetailsId={this.state.moreDetailsId}
        />
        <DeleteModal
          isOpen={this.state.idToDelete !== null}
          onRequestClose={() => this.setState({idToDelete: null})}
          handleYes={() => this.props.deleteStackedEnsemble(this.state.idToDelete)}
        />
        <ExportModal
          isOpen={this.state.idToExport !== null}
          onRequestClose={() => this.setState({idToExport: null})}
          exportEnsemble={(name) => this.exportEnsemble(this.state.idToExport, name)}
          exportEnsembleToBaseLearnerOrigin={() => this.props.exportEnsembleToBaseLearnerOrigin(this.state.idToExport)}
        />
      </div>
    )
  }
}

module.exports = Dimensions({
  getHeight: function(element) {
    return window.innerHeight - 200;
  },
  getWidth: function(element) {
    var widthOffset = window.innerWidth < 680 ? 0 : 120;
    return window.innerWidth - widthOffset;
  }
})(ListEnsemble);
export default ListEnsemble;
