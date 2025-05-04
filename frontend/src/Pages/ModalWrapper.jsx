import React from 'react';
import './styles.css';

const ModalWrapper = ({ children }) => {
  return (
    <div className="modal-wrapper">
      {children}
    </div>
  );
};

export default ModalWrapper;
