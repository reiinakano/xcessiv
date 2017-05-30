import React, {Component} from 'react';
import './BaseLearner.css';
import 'fixed-data-table/dist/fixed-data-table.min.css';
import { Table, Column, Cell } from 'fixed-data-table';
import FaCheck from 'react-icons/lib/fa/check';
import FaTrash from 'react-icons/lib/fa/trash';
import FaSpinner from 'react-icons/lib/fa/spinner';
import FaExclamationCircle from 'react-icons/lib/fa/exclamation-circle'
import FaInfo from 'react-icons/lib/fa/info';
import Dimensions from 'react-dimensions';
import Select from 'react-select';
import { includes } from 'lodash';
import DetailsModal, { DeleteModal } from './BaseLearnerMoreDetailsModal'

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


class ListBaseLearner extends Component {

  constructor(props) {
    super(props);
    this.state = {
      filteredTypes: [],
      includedMetrics: [],
      includedHyperparameters: [],
      sortAscending: true,
      sortCol: 'id',
      sortType: null,
      moreDetailsId: null,
      idToDelete: null
    };
    this.sortedBaseLearners = this.props.baseLearners;
  }

  // Sort
  returnSortedList() {
    var sortedBaseLearners = this.props.baseLearners.slice();
    sortedBaseLearners = sortedBaseLearners.filter((el) => {
      return (!this.state.filteredTypes.length || includes(this.state.filteredTypes, el.base_learner_origin_id));
    });
    sortedBaseLearners.sort((a, b) => {
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
    this.sortedBaseLearners = sortedBaseLearners;
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
      {label: 'Type ID', value: 'base_learner_origin_id', width: 100}
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
            if (this.sortedBaseLearners[props.rowIndex] === undefined) {
              return (<Cell {...props}></Cell>)
            }
            return (
              <Cell {...props}>
                {String(this.sortedBaseLearners[props.rowIndex][obj.value])}
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
            if (this.sortedBaseLearners[props.rowIndex] === undefined) {
              return (<Cell {...props}></Cell>);
            }
            return (
              <Cell {...props}>
                {String(this.sortedBaseLearners[props.rowIndex].individual_score[metric]).substring(0, 5)}
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
      var headerText = ((this.state.sortType === 'hyperparameters' && this.state.sortCol === metric) ? (this.state.sortAscending ? '↓' : '↑') : '') + metric

      return (
        <Column
          key={metric}
          header={
            <HeaderCell
              headerText={headerText}
              sortFromHeader={() => this.sortFromHeader(metric, 'hyperparameters')}
            />}
          cell={(props) => {
            if (this.sortedBaseLearners[props.rowIndex] === undefined) {
              return (<Cell {...props}></Cell>);
            }
            return (
              <Cell {...props}>
                {String(this.sortedBaseLearners[props.rowIndex].hyperparameters[metric])}
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
    for (let obj of this.props.baseLearners) {
      for (let metric in obj.individual_score) metricsOptionsSet.add(metric);
    }
    const metricsOptions = [...metricsOptionsSet].map((metric) => {
      return {
        label: metric,
        value: metric
      };
    });
    const hyperparametersOptionsSet = new Set([]);
    for (let obj of this.props.baseLearners) {
      for (let metric in obj.hyperparameters) 
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
        <h2>Base Learners</h2>
        <table><tbody><tr>
          <td>
          <Select multi
            value={this.state.filteredTypes} 
            placeholder="Filter for base learner type" 
            options={this.props.filterOptions} 
            onChange={(x) => this.setState({filteredTypes: x.map(obj => obj.value)})} />
          </td>
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
            placeholder="Add additional hyperparameters to display" 
            options={hyperparametersOptions} 
            onChange={(x) => this.setState({includedHyperparameters: x.map(obj => obj.value)})} />
          </td>
        </tr></tbody></table>
        <Table
          rowsCount={this.sortedBaseLearners.length}
          rowHeight={35}
          headerHeight={50}
          width={this.props.containerWidth}
          height={500}>
          <Column
            cell={(props) => {

              return (
                <Cell {...props}>
                  <input 
                    type='checkbox' 
                    checked={this.props.checkedBaseLearners.includes(
                      this.sortedBaseLearners[props.rowIndex].id)}
                    onChange={() => this.props.toggleCheckBaseLearner(
                      this.sortedBaseLearners[props.rowIndex].id)}
                    disabled={this.sortedBaseLearners[props.rowIndex].job_status !== 'finished'}
                  />
                </Cell>
              )
            }}
            width={40}
          />
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
              if (this.sortedBaseLearners[props.rowIndex] === undefined) {
                return (<Cell {...props}></Cell>)
              }

              var status_icon;
              if (this.sortedBaseLearners[props.rowIndex].job_status === 'errored') {
                status_icon = <FaExclamationCircle />
              }
              else if (this.sortedBaseLearners[props.rowIndex].job_status === 'finished') {
                status_icon = <FaCheck />
              }
              else if (this.sortedBaseLearners[props.rowIndex].job_status === 'queued') {
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
                  <FaInfo 
                    style={{cursor: 'pointer'}}
                    onClick={() => 
                      this.setState({moreDetailsId: this.sortedBaseLearners[props.rowIndex].id})}
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
                    onClick={() => this.setState({idToDelete: this.sortedBaseLearners[props.rowIndex].id})}
                  />
                </Cell>
              )
            }}
            width={50}
          />
        </Table>
        <DetailsModal 
          onRequestClose={() => this.setState({moreDetailsId: null})}
          baseLearners={this.props.baseLearners}
          moreDetailsId={this.state.moreDetailsId}
        />
        <DeleteModal
          isOpen={this.state.idToDelete !== null}
          onRequestClose={() => this.setState({idToDelete: null})}
          handleYes={() => this.props.deleteBaseLearner(this.state.idToDelete)}
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
})(ListBaseLearner);
export default ListBaseLearner;
