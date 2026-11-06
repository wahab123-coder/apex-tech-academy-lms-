import React, { useEffect } from 'react';
import './Modal.css';

/**
 * Modal — accessible modal dialog
 *
 * Props:
 *   isOpen   — bool
 *   onClose  — function
 *   title    — string
 *   size     — 'sm' | 'md' | 'lg' | 'xl'
 *   children — modal body content
 *   footer   — ReactNode (action buttons)
 */
function Modal({ isOpen, onClose, title, size = 'md', children, footer }) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={`modal modal--${size}`}>
        <div className="modal__header">
          {title && <h3 id="modal-title" className="modal__title">{title}</h3>}
          <button
            className="modal__close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>
  );
}

export default Modal;
