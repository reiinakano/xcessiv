import React, {Component} from 'react';
import './Ensemble.css';
import 'react-select/dist/react-select.css'
import 'react-virtualized/styles.css'
import 'react-virtualized-select/styles.css'
import VirtualizedSelect from 'react-virtualized-select'
import Select from 'react-select'
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';
import { Checkbox, Button, Glyphicon } from 'react-bootstrap';


const defaultSourceParams = [
  '"""This code block should ',
  'contain the hyperparameters to be used for ',
  'the secondary base learner in the variable `params`"""\n',
  'params = {}'
].join('')

class EnsembleBuilder extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedValue: null,
      source: defaultSourceParams,
      appendOriginal: false
    };
  }

  render() {
    var options = {
      lineNumbers: true,
      indentUnit: 4
    };

    const buttonDisabled = (!this.state.selectedValue || 
      !(this.props.checkedOptions.length > 0));

    return (
      <div className='Ensemble'>
        <h2>Create a stacked ensemble</h2>
        <table><tbody><tr>
          <td>
          <VirtualizedSelect
            multi
            options={this.props.optionsBaseLearners}
            value={this.props.checkedOptions}
            onChange={(selectValue) => this.props.setCheckedBaseLearners(
              selectValue.map((val) => val.value))}
            placeholder="Insert/Check base learners to add to the ensemble" 
          />
          </td>
          <td>
          <Select
            options={this.props.optionsBaseLearnerOrigins}
            value={this.state.selectedValue}
            onChange={(val) => this.setState({selectedValue: val})}
            placeholder="Select secondary base learner to use"
          />
          </td>
        </tr></tbody></table>
        <CodeMirror 
          value={this.state.source} 
          onChange={(src) => this.setState({source: src})} 
          options={options}
        />
        <Checkbox
          checked={this.state.appendOriginal} 
          onChange={() => this.setState((prevState) => 
            ({appendOriginal: !prevState.appendOriginal}))}
        >
          Append original features to secondary features
        </Checkbox>
        <Button 
          block
          disabled={buttonDisabled}
          bsStyle='primary'
          onClick={() => this.props.createStackedEnsemble(
            this.state.selectedValue.value, this.state.source, this.state.appendOriginal)}>
          <Glyphicon glyph="plus" />
          {' Create new ensemble'}
        </Button>
      </div>
    )
  }
}


export default EnsembleBuilder;
