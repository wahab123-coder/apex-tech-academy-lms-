import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import FormField  from '../../components/ui/FormField';
import Button     from '../../components/ui/Button';
import Alert      from '../../components/ui/Alert';
import useForm    from '../../hooks/useForm';
import api        from '../../services/api';
import './Auth.css';

const validate = (v) => {
  const e = {};
  if (!v.newPassword || v.newPassword.length < 8)
    e.newPassword = 'Password must be at least 8 characters.';
  if (v.newPassword !== v.confirmPassword)
    e.confirmPassword = 'Passwords do not match.';
  return e;
};

function ResetPassword() {
  const { token }    = useParams();
  const navigate     = useNavigate();

  const { values, errors, loading, apiError, handleChange, handleSubmit, setApiError } = useForm({
    initialValues: { newPassword: '', confirmPassword: '' },
    validate,
    onSubmit: async (vals) => {
      await api.post(`/auth/reset-password/${token}`, { newPassword: vals.newPassword });
      // Redirect to login after short delay
      setTimeout(() => navigate('/login'), 2000);
    },
  });

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <div className="auth-brand">
          <div className="auth-brand__icon">A</div>
          <div>
            <h1 className="auth-brand__name">Apex Tech Academy</h1>
            <p className="auth-brand__tagline">Learn Today. Build Tomorrow.</p>
          </div>
        </div>

        <h2 className="auth-title">Reset Your Password</h2>
        <p className="auth-subtitle">Enter and confirm your new password below.</p>

        {apiError && (
          <Alert type="error" onClose={() => setApiError('')}>
            {apiError}
            {apiError.includes('expired') && (
              <> — <Link to="/forgot-password" style={{ color: 'var(--color-primary)' }}>
                Request a new link
              </Link></>
            )}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <FormField
            label="New Password"
            name="newPassword"
            type="password"
            value={values.newPassword}
            onChange={handleChange}
            error={errors.newPassword}
            required
            placeholder="Min. 8 characters"
          />
          <FormField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={values.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            required
            placeholder="Repeat your new password"
          />
          <Button type="submit" loading={loading} fullWidth size="lg">
            Reset Password
          </Button>
        </form>

        <p className="auth-switch">
          <Link to="/login" className="auth-switch__link">Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;
