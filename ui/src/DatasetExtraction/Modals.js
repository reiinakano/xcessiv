import React from 'react';
import ReactModal from 'react-modal'

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

export function ClearModal(props) {
  return (
    <ReactModal 
      isOpen={props.isOpen} 
      onRequestClose={props.onRequestClose}
      contentLabel='Clear Changes'
      style={modalStyle}
    >
      <p>Are you sure you want to clear all unsaved changes?</p>
      <button onClick={props.onRequestClose}>Cancel</button>
      <button onClick={() => {
        props.handleYes();
        props.onRequestClose();
      }}>Yes</button>
    </ReactModal>
  )
}
