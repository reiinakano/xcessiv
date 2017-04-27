import React, {Component} from 'react';
import './Ensemble.css';
import 'react-select/dist/react-select.css'
import 'react-virtualized/styles.css'
import 'react-virtualized-select/styles.css'
import VirtualizedSelect from 'react-virtualized-select'

class EnsembleBuilder extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {

    return (
      <div className='Ensemble'>
        <h2>Stacked Ensemble</h2>
        <VirtualizedSelect
          multi
          options={this.props.options}
          value={this.props.checkedOptions}
          onChange={(selectValue) => this.props.setCheckedBaseLearners(
            selectValue.map((val) => val.value))}
          placeholder="Insert/Check base learners to add to the ensemble" 
        />
      </div>
    )
  }
}


export default EnsembleBuilder;
