import { useState, useCallback } from 'react';

/**
 * useForm — lightweight form state + validation helper.
 *
 * Usage:
 *   const { values, errors, handleChange, handleSubmit, setFieldError, reset } =
 *     useForm({ initialValues: { email: '', password: '' }, validate, onSubmit });
 */
function useForm({ initialValues = {}, validate = null, onSubmit }) {
  const [values, setValues]   = useState(initialValues);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    // Clear field error on change
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setApiError('');
  }, []);

  const setFieldError = useCallback((name, message) => {
    setErrors((prev) => ({ ...prev, [name]: message }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setApiError('');
  }, [initialValues]);

  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();

    // Run validation if provided
    if (validate) {
      const errs = validate(values);
      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        return;
      }
    }

    setLoading(true);
    setApiError('');
    try {
      await onSubmit(values);
    } catch (err) {
      setApiError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [values, validate, onSubmit]);

  return {
    values, errors, loading, apiError,
    handleChange, handleSubmit, setFieldError, setApiError, reset,
    setValues,
  };
}

export default useForm;
