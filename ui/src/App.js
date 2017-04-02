import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import CodeBox from './CodeBox';

class App extends Component {
  render() {
    return (
      <div>
        <div className="App">
          <div className="App-header">
            <h2>Xcessiv</h2>
          </div>
        </div>
        <CodeBox defaultText='# Enter code here'/>
      </div>
    );
  }
}

export default App;
