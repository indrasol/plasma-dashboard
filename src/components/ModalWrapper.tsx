import { ReactNode } from 'react';

interface ModalWrapperProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export default function ModalWrapper({ title, children, onClose }: ModalWrapperProps) {
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

