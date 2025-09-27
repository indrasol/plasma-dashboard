import React from 'react';

export default function ModalWrapper({ title, children, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{title}</h3>
        {children}
        <button onClick={onClose} style={{ marginTop: '1rem' }}>Close</button>
      </div>
    </div>
  );
}