import React from 'react';
import './FormField.css';

/**
 * FormField — label + input/textarea/select with error state
 *
 * Props:
 *   label     — string
 *   name      — string (id + name)
 *   type      — input type (default 'text') or 'textarea' | 'select'
 *   value     — string
 *   onChange  — function
 *   error     — string (error message)
 *   required  — bool
 *   disabled  — bool
 *   placeholder — string
 *   rows      — number (textarea)
 *   children  — option elements (select)
 */
function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  placeholder = '',
  rows = 4,
  children,
  className = '',
  ...rest
}) {
  const fieldId = `field-${name}`;
  const errorId = `error-${name}`;

  const inputProps = {
    id: fieldId,
    name,
    value,
    onChange,
    disabled,
    required,
    placeholder,
    className: `form-field__input ${error ? 'form-field__input--error' : ''}`,
    'aria-describedby': error ? errorId : undefined,
    'aria-invalid': !!error,
    ...rest,
  };

  return (
    <div className={`form-field ${className}`}>
      {label && (
        <label htmlFor={fieldId} className="form-field__label">
          {label}
          {required && <span className="form-field__required" aria-hidden="true"> *</span>}
        </label>
      )}

      {type === 'textarea' ? (
        <textarea {...inputProps} rows={rows} />
      ) : type === 'select' ? (
        <select {...inputProps}>{children}</select>
      ) : (
        <input type={type} {...inputProps} />
      )}

      {error && (
        <span id={errorId} className="form-field__error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export default FormField;
