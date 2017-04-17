import React, { Component } from 'react';
import './BaseLearner.css';

class BaseLearner extends Component {
  render() {
    return (
      <div className='BaseLearner'>
        <div className='MyTable'>
          <div className='MyRow'>
            <div className='MyCell'>Text</div>
            <div className='MyCell'>Text2</div>
          </div>
          <p>hi</p>
        </div>
        <div className='MyTable'>
          <div className='MyRow'>
            <div className='MyCell'>Text</div>
            <div className='MyCell'>Text2</div>
          </div>
          <p>hi</p>
        </div>
        <div className='MyTable'>
          <div className='MyRow'>
            <div className='MyCell'>Text</div>
            <div className='MyCell'>Text2</div>
          </div>
        </div>
        <div className='MyTable'>
          <div className='MyRow'>
            <div className='MyCell'>Text</div>
            <div className='MyCell'>Text2</div>
          </div>
        </div>
      </div>
    )
  }
}


export default BaseLearner;
