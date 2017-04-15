import React, { PropTypes } from 'react';
import ReactModal from 'react-modal';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';
import FaCheck from 'react-icons/lib/fa/check';
import ContentEditable from 'react-contenteditable';
import 'rc-collapse/assets/index.css';
import Collapse, { Panel } from 'rc-collapse';

const modalStyle = {
  overlay : {
    zIndex            : 1000
  },
  content : {
    top                        : '50%',
    left                       : '50%',
    right                      : 'auto',
    bottom                     : 'auto',
    marginRight                : '-50%',
    transform                  : 'translate(-50%, -50%)',
    border                     : '1px solid #ccc',
    background                 : '#fff',
    overflow                   : 'auto',
    WebkitOverflowScrolling    : 'touch',
    borderRadius               : '4px',
    outline                    : 'none',
    padding                    : '20px'
  }
}

function ValidationResults(props) {
  const items = [];
  for (var key in props.validation_results) {
      items.push(<li key={key}>{key + ': ' + props.validation_results[key]}</li>)
    }
  return <div>
    <h4>Base learner metrics on toy data</h4>
    <ul>{items}</ul>
  </div>
}

function ClearModal(props) {
  return (
    <ReactModal 
      isOpen={props.isOpen} 
      onRequestClose={props.onRequestClose}
      contentLabel='Clear Changes'
      style={modalStyle}
    >
      <p>Are you sure you want to clear all unsaved changes?</p>
      <button onClick={props.onRequestClose}>Cancel</button>
      <button onClick={props.handleYes}>Yes</button>
    </ReactModal>
  )
}

function FinalizeModal(props) {
  return (
    <ReactModal 
      isOpen={props.isOpen} 
      onRequestClose={props.onRequestClose}
      contentLabel='Finalize Base learner'
      style={modalStyle}
    >
      <p>Are you sure you want to finalize this base learner setup?</p>
      <p>You will no longer be allowed to make changes to this base 
      learner after this</p>
      <button onClick={props.onRequestClose}>Cancel</button>
      <button onClick={props.handleYes}>Yes</button>
    </ReactModal>
  )
}

function DeleteModal(props) {
  return (
    <ReactModal 
      isOpen={props.isOpen} 
      onRequestClose={props.onRequestClose}
      contentLabel='Delete Base learner'
      style={modalStyle}
    >
      <p>Are you sure you want to delete this base learner setup?</p>
      <p>You will also lose all base learners that have been scored using this setup</p>
      <p><strong>This action is irreversible.</strong></p>
      <button onClick={props.onRequestClose}>Cancel</button>
      <button onClick={props.handleYes}>Yes</button>
    </ReactModal>
  )
}

function BaseLearnerOrigin(props) {
  var options = {
    lineNumbers: true,
    indentUnit: 4,
    readOnly: props.data.final
  };

  var header = <b>
    {(!props.same ? '* ' : ' ')}
    {'ID: ' + props.data.id + ' '}
    {props.data.name + ' '} 
    {props.data.final && <FaCheck />}
  </b>

  var activeKey = [];
  if (props.active) {
    activeKey.push(String(props.data.id));
  }

  return (
    <div>
    <Collapse activeKey={activeKey} onChange={props.onActiveChange}
      accordion={false}>
      <Panel key={props.data.id} header={header}>

        <h3>
          <ContentEditable html={props.data.name} 
          disabled={props.data.final} 
          onChange={(evt) => props.handleDataChange('name', evt.target.value)} />
        </h3>

        <h4>
          {props.data.final && 'This base learner setup has been finalized and can no longer be modified.'}
        </h4>

        <CodeMirror value={props.data.source} 
        onChange={(src) => props.handleDataChange('source', src)} 
        options={options}/>

        <div className='SplitFormLabel'>
          <label>
            Meta-feature generator method: 
            <input type='text' readOnly={props.data.final}
            value={props.data.meta_feature_generator} 
            onChange={(evt) => props.handleDataChange('meta_feature_generator', evt.target.value)}/>
          </label>
        </div>

        <ValidationResults validation_results={props.data.validation_results} />

        <button disabled={props.same || props.data.final}
        onClick={() => props.handleOpenModal('clear')}> Clear unsaved changes </button>

        <ClearModal isOpen={(props.showModal === 'clear')} 
        onRequestClose={props.handleCloseModal}
        handleYes={props.clearDataChanges} />

        <button disabled={props.same || props.data.final} 
        onClick={props.saveSetup}> Save Base Learner Setup</button>

        <button disabled={!props.same || props.data.final} 
        onClick={props.verifyLearner}>Verify on toy data</button>

        <button disabled={!props.same || props.data.final}
        onClick={props.handleOpenModal('finalize')}>Finalize Base Learner Setup</button>
        <FinalizeModal isOpen={(props.showModal === 'finalize')} 
        onRequestClose={props.handleCloseModal}
        handleYes={props.confirmLearner} />

        <button onClick={props.handleOpenModal('delete')}>Delete Base Learner Setup</button>
        <DeleteModal isOpen={(props.showModal === 'delete')}
        onRequestClose={props.handleCloseModal}
        handleYes={props.deleteLearner} />
      </Panel>
    </Collapse>
    </div>
  )
}

export default BaseLearnerOrigin;