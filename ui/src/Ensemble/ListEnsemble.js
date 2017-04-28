import React, {Component} from 'react';
import './Ensemble.css';
import 'fixed-data-table/dist/fixed-data-table.min.css';
import { Table, Column, Cell } from 'fixed-data-table';
import FaCheck from 'react-icons/lib/fa/check';
import FaSpinner from 'react-icons/lib/fa/spinner';
import FaExclamationCircle from 'react-icons/lib/fa/exclamation-circle'

class ListEnsemble extends Component {

  constructor(props) {
    super(props);
    this.state = {
      includedMetrics: ['Accuracy', 'Recall', 'Precision'],
      includedHyperparameters: ['C']
    };
  }

  getDataColumns() {
    const cols = [
      {label: 'ID', value: 'id', width: 50}, 
      {label: 'Secondary Learner ID', value: 'base_learner_origin_id', width: 100}
    ]
    return cols.map((obj) => {
      return (
        <Column
          key={obj.value}
          header={obj.label}
          cell={(props) => {
            if (this.props.stackedEnsembles[props.rowIndex] === undefined) {
              return (<Cell {...props}></Cell>)
            }
            return (
              <Cell {...props}>
                {this.props.stackedEnsembles[props.rowIndex][obj.value]}
              </Cell>
            )
          }}
          width={obj.width}
        />
      )
    });
  }

  getMetricsColumns() {
    return this.state.includedMetrics.map((metric) => {
      return (
        <Column
          key={metric}
          header={metric}
          cell={(props) => {
            if (this.props.stackedEnsembles[props.rowIndex] === undefined) {
              return (<Cell {...props}></Cell>);
            }
            return (
              <Cell {...props}>
                {String(this.props.stackedEnsembles[props.rowIndex].individual_score[metric]).substring(0, 5)}
              </Cell>
            )
          }}
          width={Math.max(metric.length*10, 50)}
        />
      )
    });
  }

  getHyperparametersColumns() {
    return this.state.includedHyperparameters.map((metric) => {
      return (
        <Column
          key={metric}
          header={metric}
          cell={(props) => {
            if (this.props.stackedEnsembles[props.rowIndex] === undefined) {
              return (<Cell {...props}></Cell>);
            }
            return (
              <Cell {...props}>
                {String(this.props.stackedEnsembles[props.rowIndex].secondary_learner_hyperparameters[metric]).substring(0, 5)}
              </Cell>
            )
          }}
          width={Math.max(metric.length*10, 50)}
        />
      )
    });
  }

  render() {
    return(
      <div className='Ensemble'>
        <Table
          rowsCount={this.props.stackedEnsembles.length}
          rowHeight={35}
          headerHeight={50}
          width={1500}
          height={500}>
          {this.getDataColumns()}
          <Column
            header={'Number of base learners used'}
            cell={(props) => {
              if (this.props.stackedEnsembles[props.rowIndex] === undefined) {
                return (<Cell {...props}></Cell>)
              }
              return (
                <Cell {...props}>
                  {this.props.stackedEnsembles[props.rowIndex].base_learner_ids.length}
                </Cell>
              )
            }}
            width={150}
          />
          {this.getMetricsColumns()}
          {this.getHyperparametersColumns()}
          <Column
            header={'Status'}
            cell={(props) => {
              if (this.props.stackedEnsembles[props.rowIndex] === undefined) {
                return (<Cell {...props}></Cell>)
              }

              var status_icon;
              if (this.props.stackedEnsembles[props.rowIndex].job_status === 'errored') {
                status_icon = <FaExclamationCircle />
              }
              else if (this.props.stackedEnsembles[props.rowIndex].job_status === 'finished') {
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
            width={60}
          />
        </Table>
      </div>
    )
  }
}

export default ListEnsemble;
