import React, { Component } from 'react';
import { Button, Panel } from 'react-bootstrap';
import './AutomatedRuns.css';
import 'fixed-data-table/dist/fixed-data-table.min.css';
import { Table, Column, Cell } from 'fixed-data-table';
import Dimensions from 'react-dimensions';
import FaCheck from 'react-icons/lib/fa/check';
import FaTrash from 'react-icons/lib/fa/trash';
import FaSpinner from 'react-icons/lib/fa/spinner';
import FaExclamationCircle from 'react-icons/lib/fa/exclamation-circle'
import FaInfo from 'react-icons/lib/fa/info';
import { DetailsModal, DeleteModal } from './Modals'

class AutomatedRunsDisplay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      moreDetailsId: null,
      idToDelete: null
    };
  }

  render() {
    const header = (
      <table><tbody><tr>
        <td>
          <Button onClick={() => this.setState({open: !this.state.open})}>
            {(this.state.open ?  'Hide' : 'Show') + ' Automated Runs'}
          </Button>
        </td>
        <td>{'Succeeded: ' + this.props.automatedRuns.filter((el) => 
          el.job_status === 'finished').length}</td>
        <td>{'Failed: ' + this.props.automatedRuns.filter((el) => 
          el.job_status === 'errored').length}</td>
        <td>{'Queued: ' + this.props.automatedRuns.filter((el) => 
          el.job_status === 'queued').length}</td>
        <td>{'In Progress: ' + this.props.automatedRuns.filter((el) => 
          el.job_status === 'started').length}</td>
      </tr></tbody></table>
    );

    return (
      <div className='AutomatedRunsDisplay'>
        <Panel style={{marginBottom: '0px'}} header={header} bsStyle='info'></Panel>
        <Panel style={{marginBottom: '0px'}} bsStyle='info' 
          collapsible expanded={this.state.open}>
          <Table
            rowsCount={this.props.automatedRuns.length}
            rowHeight={35}
            headerHeight={50}
            width={this.props.containerWidth}
            height={Math.min(300, 50 + 35*this.props.automatedRuns.length)}>
            <Column
              header={'ID'}
              cell={(props) => {
                return (
                  <Cell {...props}>
                    {this.props.automatedRuns[props.rowIndex].id}
                  </Cell>
                )
              }}
              width={50}
              flexGrow={1}
            />
            <Column
              header={'Base Learner Type ID'}
              cell={(props) => {
                return (
                  <Cell {...props}>
                    {this.props.automatedRuns[props.rowIndex].base_learner_origin_id}
                  </Cell>
                )
              }}
              width={50}
              flexGrow={1}
            />
            <Column
              header={'Job ID'}
              cell={(props) => {
                return (
                  <Cell {...props}>
                    {this.props.automatedRuns[props.rowIndex].job_id}
                  </Cell>
                )
              }}
              width={200}
              flexGrow={1}
            />
            <Column
              header={'Job Status'}
              cell={(props) => {
                if (this.props.automatedRuns[props.rowIndex] === undefined) {
                  return (<Cell {...props}></Cell>)
                }

                var status_icon;
                if (this.props.automatedRuns[props.rowIndex].job_status === 'errored') {
                  status_icon = <FaExclamationCircle />
                }
                else if (this.props.automatedRuns[props.rowIndex].job_status === 'finished') {
                  status_icon = <FaCheck />
                }
                else if (this.props.automatedRuns[props.rowIndex].job_status === 'queued') {
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
                        this.setState({moreDetailsId: this.props.automatedRuns[props.rowIndex].id})}
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
                      onClick={() => this.setState({idToDelete: this.props.automatedRuns[props.rowIndex].id})}
                    />
                  </Cell>
                )
              }}
              width={50}
            />
          </Table>
        </Panel>
        <DetailsModal 
          onRequestClose={() => this.setState({moreDetailsId: null})}
          automatedRuns={this.props.automatedRuns}
          moreDetailsId={this.state.moreDetailsId}
        />
        <DeleteModal
          isOpen={this.state.idToDelete !== null}
          onRequestClose={() => this.setState({idToDelete: null})}
          handleYes={() => this.props.deleteAutomatedRun(this.state.idToDelete)}
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
    var widthOffset = window.innerWidth < 680 ? 0 : 145;
    return window.innerWidth - widthOffset;
  }
})(AutomatedRunsDisplay);

export default AutomatedRunsDisplay;
