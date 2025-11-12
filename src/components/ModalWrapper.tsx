import { ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ModalWrapperProps {
  title: string | ReactNode;
  children: ReactNode;
  onClose: () => void;
  slideFrom?: 'center' | 'right';
}

export default function ModalWrapper({ title, children, onClose, slideFrom = 'center' }: ModalWrapperProps) {
  const modalClass = slideFrom === 'right' ? 'modern-modal-right' : 'modern-modal';
  
  const modalContent = (
    <div className="modern-modal-overlay" onClick={onClose}>
      <div className={modalClass} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close-btn" onClick={onClose} title="Close dialog">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );

  // Render modal at document root using portal to avoid stacking context issues
  return createPortal(modalContent, document.body);
}

