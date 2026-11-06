import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import FormField from '../../components/ui/FormField';
import Button    from '../../components/ui/Button';
import Alert     from '../../components/ui/Alert';
import { useAuth } from '../../context/AuthContext';
import useForm   from '../../hooks/useForm';
import './Auth.css';

const validate = (values) => {
  const e = {};
  if (!values.email.trim()) e.email    = 'Email is required.';
  if (!values.password)     e.password = 'Password is required.';
  return e;
};

const portalMap = {
  admin:      '/admin',
  instructor: '/instructor',
  student:    '/student',
};

function Login() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();

  // Where to go after login — original destination or role-based portal
  const from = location.state?.from?.pathname || null;

  const { values, errors, loading, apiError, handleChange, handleSubmit, setApiError } = useForm({
    initialValues: { email: '', password: '' },
    validate,
    onSubmit: async (vals) => {
      const user = await login(vals.email, vals.password);
      const dest = from || portalMap[user.role] || '/student';
      navigate(dest, { replace: true });
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

        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to access your portal.</p>

        {apiError && (
          <Alert type="error" onClose={() => setApiError('')}>{apiError}</Alert>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <FormField
            label="Email Address" name="email" type="email"
            value={values.email} onChange={handleChange}
            error={errors.email} required placeholder="you@example.com"
          />
          <FormField
            label="Password" name="password" type="password"
            value={values.password} onChange={handleChange}
            error={errors.password} required placeholder="Your password"
          />
          <div className="auth-forgot">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
          <Button type="submit" loading={loading} fullWidth size="lg">
            Sign In
          </Button>
        </form>

        {/* Quick dev login shortcuts */}
        {import.meta.env.DEV && (
          <div className="auth-dev-shortcuts">
            <p className="auth-dev-label">Dev shortcuts:</p>
            <div className="auth-dev-btns">
              {[
                { label: 'Admin',      email: 'admin@apextechacademy.com',        pw: 'Admin@1234' },
                { label: 'Instructor', email: 'john.adeyemi@apextechacademy.com', pw: 'Instructor@1234' },
                { label: 'Student',    email: 'emeka.okafor@student.com',         pw: 'Student@1234' },
              ].map((u) => (
                <button
                  key={u.label}
                  type="button"
                  className="auth-dev-btn"
                  onClick={() => {
                    login(u.email, u.pw)
                      .then((user) => navigate(portalMap[user.role] || '/student'))
                      .catch((err) => setApiError(err.message));
                  }}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="auth-switch">
          Don't have an account?{' '}
          <Link to="/register" className="auth-switch__link">Create one free</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
