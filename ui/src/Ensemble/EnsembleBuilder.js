import React, {Component} from 'react';
import './Ensemble.css';
import 'react-select/dist/react-select.css'
import 'react-virtualized/styles.css'
import 'react-virtualized-select/styles.css'
import VirtualizedSelect from 'react-virtualized-select'
import Select from 'react-select'

class EnsembleBuilder extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedValue: null 
    };
  }

  render() {
    console.log(this.state.selectedValue);

    return (
      <div className='Ensemble'>
        <h2>Stacked Ensemble</h2>
        <VirtualizedSelect
          multi
          options={this.props.optionsBaseLearners}
          value={this.props.checkedOptions}
          onChange={(selectValue) => this.props.setCheckedBaseLearners(
            selectValue.map((val) => val.value))}
          placeholder="Insert/Check base learners to add to the ensemble" 
        />
        <Select
          options={this.props.optionsBaseLearnerOrigins}
          value={this.state.selectedValue}
          onChange={(val) => this.setState({selectedValue: val})}
          placeholder="Select secondary base learner to use"
        />
      </div>
    )
  }
}


export default EnsembleBuilder;
