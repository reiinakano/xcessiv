import React, { Component } from 'react';
import './BaseLearnerOrigin.css';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';
import ContentEditable from 'react-contenteditable';
import MetricGenerators from './MetricGenerators'

class BaseLearnerOrigin extends Component {

  constructor(props) {
    super(props);
    this.state = {
      name: 'Base Learner Origin Title',
      meta_feature_generator: '',
      metric_generators: {'Accuracy': ''},
      source: '',
      id: null
    };
    this.handleChangeTitle = this.handleChangeTitle.bind(this);
    this.handleChangeSource = this.handleChangeSource.bind(this);
    this.handleChangeMetaFeatureGenerator = this.handleChangeMetaFeatureGenerator.bind(this);
    this.handleChangeMetricGenerator = this.handleChangeMetricGenerator.bind(this);
  }

  // Change name of base learner origin
  handleChangeTitle(evt) {
    console.log(evt.target.value);
    this.setState({name: evt.target.value});
  }

  // Change source code
  handleChangeSource(value) {
    console.log(value);
    this.setState({source: value});
  }

  // Change meta-feature generator
  handleChangeMetaFeatureGenerator(event) {
    console.log(event.target.value);
    this.setState({meta_feature_generator: event.target.value});
  }

  // Change metric generator
  handleChangeMetricGenerator(metric_name, source) {
    console.log(metric_name);
    console.log(source);
    var new_metric_generators = JSON.parse(JSON.stringify(this.state.metric_generators));
    new_metric_generators[metric_name] = source;
    this.setState({
      metric_generators: new_metric_generators
    });
  }

  render() {
    var options = {
      lineNumbers: true,
      indentUnit: 4
    };

    return (
      <div className='BaseLearnerOrigin'>
        <h3>
          <ContentEditable html={this.state.name} 
          disabled={false} 
          onChange={this.handleChangeTitle} />
        </h3>
        <CodeMirror value={this.state.source} 
        onChange={this.handleChangeSource} 
        options={options}/>
        <div className='SplitFormLabel'>
          <label>
            Meta-feature generator method: 
            <input type='text' 
            value={this.state.meta_feature_generator} 
            onChange={this.handleChangeMetaFeatureGenerator}/>
          </label>
        </div>
        <MetricGenerators 
        generators={this.state.metric_generators} 
        onGeneratorChange={this.handleChangeMetricGenerator} />
      </div>
    )
  }
}


export default BaseLearnerOrigin;
