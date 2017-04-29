import React, {Component} from 'react';
import './Ensemble.css';
import 'fixed-data-table/dist/fixed-data-table.min.css';
import { Table, Column, Cell } from 'fixed-data-table';
import FaCheck from 'react-icons/lib/fa/check';
import FaSpinner from 'react-icons/lib/fa/spinner';
import FaExclamationCircle from 'react-icons/lib/fa/exclamation-circle'
import FaInfo from 'react-icons/lib/fa/info';
import Dimensions from 'react-dimensions';
import Select from 'react-select';
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
      Base Learners
      <ul>
        {stackedEnsemble.base_learner_ids.map((id) => {
          return (
            <li key={id}>{id}</li>
          )
        })}
      </ul>
      </ReactModal>
    )
  }
}

class ListEnsemble extends Component {

  constructor(props) {
    super(props);
    this.state = {
      includedMetrics: ['Accuracy', 'Recall', 'Precision'],
      includedHyperparameters: [],
      sortAscending: true,
      sortCol: 'id',
      sortType: null,
      moreDetailsId: null
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
      {label: 'Appended Original Features', value: 'append_original', width: 100}
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
          height={500}>
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
        </Table>
        <DetailsModal 
          onRequestClose={() => this.setState({moreDetailsId: null})}
          stackedEnsembles={this.props.stackedEnsembles}
          moreDetailsId={this.state.moreDetailsId}
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
