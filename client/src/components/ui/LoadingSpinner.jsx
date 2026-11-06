import React from 'react';
import './LoadingSpinner.css';

/**
 * LoadingSpinner — full-page or inline loading indicator
 *
 * Props:
 *   fullPage — bool (centers in viewport)
 *   size     — 'sm' | 'md' | 'lg'
 *   label    — string (accessibility)
 */
function LoadingSpinner({ fullPage = false, size = 'md', label = 'Loading...' }) {
  const spinner = (
    <div className={`spinner spinner--${size}`} role="status" aria-label={label}>
      <div className="spinner__ring" />
      <span className="spinner__text">{label}</span>
    </div>
  );

  if (fullPage) {
    return <div className="spinner-overlay">{spinner}</div>;
  }

  return spinner;
}

export default LoadingSpinner;
