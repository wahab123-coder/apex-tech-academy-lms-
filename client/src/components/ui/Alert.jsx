import React from 'react';
import './Alert.css';

/**
 * Alert — inline feedback messages
 *
 * Props:
 *   type     — 'success' | 'error' | 'warning' | 'info'
 *   title    — optional heading
 *   onClose  — function (renders close button)
 *   children — message content
 */
function Alert({ type = 'info', title, onClose, children, className = '' }) {
  const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };

  return (
    <div className={`alert alert--${type} ${className}`} role="alert">
      <span className="alert__icon" aria-hidden="true">{icons[type]}</span>
      <div className="alert__content">
        {title && <p className="alert__title">{title}</p>}
        <div className="alert__message">{children}</div>
      </div>
      {onClose && (
        <button
          className="alert__close"
          onClick={onClose}
          aria-label="Close alert"
        >
          ×
        </button>
      )}
    </div>
  );
}

export default Alert;
