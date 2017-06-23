import React, { Component } from 'react';
import './BaseLearnerOrigin.css';
import BaseLearnerOrigin from './BaseLearnerOrigin';
import { Button, Glyphicon, ButtonGroup } from 'react-bootstrap';
import { TpotModal } from './BaseLearnerOriginModals'
import FaCogs from 'react-icons/lib/fa/cogs';

class ListBaseLearnerOrigin extends Component {

  constructor(props) {
    super(props);
    this.state = {
      showTpotModal: false
    };
  }

  getItems() {

    const items = this.props.baseLearnerOrigins.map((el, index) => {
      return (
        <BaseLearnerOrigin
          key={el.id} 
          path={this.props.path} 
          data={el} 
          updateBaseLearnerOrigin={(newData) => this.props.updateBaseLearnerOrigin(el.id, newData)}
          deleteLearner={() => this.props.deleteBaseLearnerOrigin(el.id)}
          createBaseLearner={(source) => this.props.createBaseLearner(el.id, source)}
          gridSearch={(source) => this.props.gridSearch(el.id, source)}
          randomSearch={(source, n) => this.props.randomSearch(el.id, source, n)}
          startBayesianRun={(source) => this.props.startBayesianRun(el.id, source)}
          addNotification={(notif) => this.props.addNotification(notif)}
          presetBaseLearnerOrigins={this.props.presetBaseLearnerOrigins}
          presetMetricGenerators={this.props.presetMetricGenerators}
        />
      );
    });

    return items;
  }

  render() {
    return <div className='BaseLearnerOrigin'>
      <h2>Base Learner Types</h2>
      {this.getItems()}
      <ButtonGroup justified>
        <Button href="#" onClick={this.props.createBaseLearnerOrigin}>
          <Glyphicon glyph="plus" />
          {' Add new base learner origin'}
        </Button>
        <Button href="#" onClick={() => this.setState({showTpotModal: true})}>
          <FaCogs />
          {' Automated base learner generation with TPOT'}
        </Button>
      </ButtonGroup>
      <TpotModal isOpen={this.state.showTpotModal} 
        onRequestClose={() => this.setState({showTpotModal: false})}
        handleYes={(source) => this.props.startTpotRun(source)} />
    </div>;
  }
}


export default ListBaseLearnerOrigin;
