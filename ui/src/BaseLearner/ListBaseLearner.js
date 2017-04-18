import React, { Component } from 'react';
import './BaseLearner.css';
import BaseLearner from './BaseLearner';

class ListBaseLearner extends Component {
  render() {
    return(
      <div className='BaseLearner'>
        <table>
          <BaseLearner path={this.props.path} id={'2'}/>
          <BaseLearner path={this.props.path} id={'3'}/>
          <BaseLearner path={this.props.path} id={'20'}/>
        </table>
      </div>
    )
  }
}


export default ListBaseLearner;