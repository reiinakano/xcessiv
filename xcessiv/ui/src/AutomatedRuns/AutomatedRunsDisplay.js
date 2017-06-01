import React, { Component } from 'react';
import { Button, Panel } from 'react-bootstrap';
import './AutomatedRuns.css';

class AutomatedRunsDisplay extends Component {

  render() {
    const header = (
      <table><tbody><tr>
        <td>
          <Button>
            View Automated Runs
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
        <Panel header={header} bsStyle='info'>
        </Panel>
      </div>
    )
  }
}

export default AutomatedRunsDisplay;
