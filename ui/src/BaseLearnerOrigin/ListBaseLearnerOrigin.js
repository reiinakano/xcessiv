import React, { Component } from 'react';
import './BaseLearnerOrigin.css';
import BaseLearnerOrigin from './BaseLearnerOrigin';
import { Button, Glyphicon } from 'react-bootstrap';

class ListBaseLearnerOrigin extends Component {

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
      <Button block onClick={this.props.createBaseLearnerOrigin}>
        <Glyphicon glyph="plus" />
        {' Add new base learner origin'}
      </Button>
    </div>;
  }
}


export default ListBaseLearnerOrigin;
