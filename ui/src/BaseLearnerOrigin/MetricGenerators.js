import React, { Component } from 'react';
import './BaseLearnerOrigin.css';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';
import 'rc-collapse/assets/index.css';
import Collapse, { Panel } from 'rc-collapse';

class MetricGenerators extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: []
    };
    this.onActiveChange = this.onActiveChange.bind(this);
  }

  /* Used to construct a list of Generator components for inserting into the 
  accordion.
  */
  getItems() {
    const items = [];
    for (var key in this.props.generators) {
      console.log(key);
      
      var options = {
        lineNumbers: true,
        indentUnit: 4
      };
      items.push(<Panel key={key} header={key}>
        <CodeMirror value={this.props.generators[key]} 
        onChange={this.props.onGeneratorChange.bind(null, key)} 
        options={options}/>
      </Panel>)
    }

    return items;
  }

  // Handler when active panel changes
  onActiveChange(activeKey) {
    console.log(activeKey);
    this.setState({
      activeKey
    });
  }

  render() {
    return(
      <div>
        <h4>Metrics to be calculated from meta-features</h4>
        <Collapse activeKey={this.state.activeKey} onChange={this.onActiveChange}
        accordion={false}>
          {this.getItems()}
        </Collapse>
      </div>);
  }
}

export default MetricGenerators;
