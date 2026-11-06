import React from 'react';
import './Button.css';

/**
 * Button — reusable button component
 *
 * Props:
 *   variant  — 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
 *   size     — 'sm' | 'md' | 'lg'
 *   loading  — bool
 *   disabled — bool
 *   fullWidth— bool
 *   onClick  — function
 *   type     — 'button' | 'submit' | 'reset'
 *   children — ReactNode
 */
function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  type = 'button',
  children,
  className = '',
  ...rest
}) {
  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth ? 'btn--full' : '',
    loading ? 'btn--loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      {...rest}
    >
      {loading && <span className="btn__spinner" aria-hidden="true" />}
      <span className={loading ? 'btn__text--hidden' : ''}>{children}</span>
    </button>
  );
}

export default Button;
