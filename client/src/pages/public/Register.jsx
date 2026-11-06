import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormField from '../../components/ui/FormField';
import Button    from '../../components/ui/Button';
import Alert     from '../../components/ui/Alert';
import { useAuth } from '../../context/AuthContext';
import useForm   from '../../hooks/useForm';
import './Auth.css';

const validate = (values) => {
  const e = {};
  if (!values.firstName.trim()) e.firstName = 'First name is required.';
  if (!values.lastName.trim())  e.lastName  = 'Last name is required.';
  if (!values.email.trim())     e.email     = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) e.email = 'Enter a valid email address.';
  if (!values.phone.trim())     e.phone     = 'Phone number is required.';
  if (!values.password)         e.password  = 'Password is required.';
  else if (values.password.length < 8) e.password = 'Password must be at least 8 characters.';
  if (values.password !== values.confirmPassword) e.confirmPassword = 'Passwords do not match.';
  return e;
};

function Register() {
  const navigate  = useNavigate();
  const { register } = useAuth();

  const { values, errors, loading, apiError, handleChange, handleSubmit, setApiError } = useForm({
    initialValues: {
      firstName: '', lastName: '', email: '',
      phone: '', password: '', confirmPassword: '',
    },
    validate,
    onSubmit: async (vals) => {
      await register({
        firstName: vals.firstName,
        lastName:  vals.lastName,
        email:     vals.email,
        phone:     vals.phone,
        password:  vals.password,
      });
      navigate('/student');
    },
  });

  return (
    <div className="auth-page">
      <div className="auth-panel auth-panel--wide">
        <div className="auth-brand">
          <div className="auth-brand__icon">A</div>
          <div>
            <h1 className="auth-brand__name">Apex Tech Academy</h1>
            <p className="auth-brand__tagline">Learn Today. Build Tomorrow.</p>
          </div>
        </div>

        <h2 className="auth-title">Create Your Account</h2>
        <p className="auth-subtitle">
          Join hundreds of students transforming their careers through technology.
        </p>

        {apiError && (
          <Alert type="error" onClose={() => setApiError('')}>{apiError}</Alert>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="auth-form__row">
            <FormField label="First Name" name="firstName" value={values.firstName}
              onChange={handleChange} error={errors.firstName} required placeholder="First name" />
            <FormField label="Last Name"  name="lastName"  value={values.lastName}
              onChange={handleChange} error={errors.lastName}  required placeholder="Last name" />
          </div>
          <FormField label="Email Address" name="email" type="email" value={values.email}
            onChange={handleChange} error={errors.email} required placeholder="you@example.com" />
          <FormField label="Phone Number"  name="phone" type="tel"   value={values.phone}
            onChange={handleChange} error={errors.phone} required placeholder="+234 800 000 0000" />
          <div className="auth-form__row">
            <FormField label="Password" name="password" type="password" value={values.password}
              onChange={handleChange} error={errors.password} required placeholder="Min. 8 characters" />
            <FormField label="Confirm Password" name="confirmPassword" type="password"
              value={values.confirmPassword} onChange={handleChange} error={errors.confirmPassword}
              required placeholder="Repeat password" />
          </div>

          <p className="auth-terms">
            By registering, you agree to our{' '}
            <Link to="/terms">Terms of Service</Link> and{' '}
            <Link to="/privacy">Privacy Policy</Link>.
          </p>

          <Button type="submit" loading={loading} fullWidth size="lg">
            Create Account
          </Button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login" className="auth-switch__link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
