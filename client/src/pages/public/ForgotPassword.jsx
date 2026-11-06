import React, { useState } from 'react';
import { Link }   from 'react-router-dom';
import FormField  from '../../components/ui/FormField';
import Button     from '../../components/ui/Button';
import Alert      from '../../components/ui/Alert';
import Icon       from '../../components/common/Icons';
import useForm    from '../../hooks/useForm';
import api        from '../../services/api';
import './Auth.css';

const validate = (v) => {
  const e = {};
  if (!v.email.trim()) e.email = 'Email address is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email))
    e.email = 'Enter a valid email address.';
  return e;
};

function ForgotPassword() {
  const [submitted,   setSubmitted]   = useState(false);
  const [sentTo,      setSentTo]      = useState('');
  const [devResetUrl, setDevResetUrl] = useState('');

  const { values, errors, loading, apiError, handleChange, handleSubmit, setApiError } = useForm({
    initialValues: { email: '' },
    validate,
    onSubmit: async (vals) => {
      const res = await api.post('/auth/forgot-password', { email: vals.email });
      setSentTo(vals.email);
      setSubmitted(true);
      if (res.data.devResetUrl) setDevResetUrl(res.data.devResetUrl);
    },
  });

  return (
    <div className="auth-page">
      <div className="auth-panel">
        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-brand__icon">A</div>
          <div>
            <h1 className="auth-brand__name">Apex Tech Academy</h1>
            <p className="auth-brand__tagline">Learn Today. Build Tomorrow.</p>
          </div>
        </div>

        {!submitted ? (
          <>
            <h2 className="auth-title">Forgot Password</h2>
            <p className="auth-subtitle">
              Enter the email address you registered with and we will send you
              a password reset link.
            </p>

            {apiError && (
              <Alert type="error" onClose={() => setApiError('')}>{apiError}</Alert>
            )}

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              <FormField
                label="Registered Email Address"
                name="email"
                type="email"
                value={values.email}
                onChange={handleChange}
                error={errors.email}
                required
                placeholder="you@example.com"
              />
              <Button type="submit" loading={loading} fullWidth size="lg">
                Send Reset Link
              </Button>
            </form>

            <p className="auth-switch">
              Remember your password?{' '}
              <Link to="/login" className="auth-switch__link">Sign in</Link>
            </p>
          </>
        ) : (
          /* ── Success state ── */
          <>
            <div style={{
              textAlign: 'center',
              padding: 'var(--space-md) 0',
            }}>
              {/* Email sent icon */}
              <div style={{
                width: 72, height: 72,
                background: 'rgba(16,185,129,0.1)',
                border: '2px solid var(--color-success)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto var(--space-lg)',
              }}>
                <Icon name="email" size={28} color="var(--color-success)" />
              </div>

              <h2 className="auth-title">Check Your Email</h2>

              <p style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
                lineHeight: 'var(--line-height-relaxed)',
                marginBottom: 'var(--space-md)',
              }}>
                We sent a password reset link to:
              </p>

              <div style={{
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-md)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-primary)',
                fontFamily: 'var(--font-family-mono)',
                fontSize: 'var(--font-size-sm)',
                marginBottom: 'var(--space-lg)',
                wordBreak: 'break-all',
              }}>
                {sentTo}
              </div>

              <div style={{
                background: 'var(--color-info-bg)',
                border: '1px solid var(--color-info)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-md)',
                textAlign: 'left',
                marginBottom: 'var(--space-lg)',
              }}>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 'var(--line-height-relaxed)' }}>
                  <strong>Next steps:</strong><br />
                  1. Open your email inbox<br />
                  2. Look for an email from Apex Tech Academy<br />
                  3. Click the reset link in the email<br />
                  4. The link expires in <strong>30 minutes</strong>
                </p>
              </div>

              {/* Dev mode only — show clickable link */}
              {devResetUrl && (
                <Alert type="info">
                  <strong>Dev mode — click to reset:</strong><br />
                  <a href={devResetUrl} style={{ color: 'var(--color-primary)', wordBreak: 'break-all', fontSize: 'var(--font-size-xs)' }}>
                    {devResetUrl}
                  </a>
                </Alert>
              )}

              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-md)' }}>
                Did not receive the email?{' '}
                <button
                  style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 'var(--font-weight-semibold)', padding: 0, fontSize: 'inherit' }}
                  onClick={() => { setSubmitted(false); setSentTo(''); setDevResetUrl(''); }}
                >
                  Try again
                </button>
              </p>
            </div>

            <p className="auth-switch">
              <Link to="/login" className="auth-switch__link">Back to Sign In</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
