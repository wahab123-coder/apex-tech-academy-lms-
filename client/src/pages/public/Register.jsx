import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormField    from '../../components/ui/FormField';
import Button       from '../../components/ui/Button';
import Alert        from '../../components/ui/Alert';
import { useAuth }  from '../../context/AuthContext';
import useForm      from '../../hooks/useForm';
import courseService from '../../services/courseService';
import './Auth.css';

// ── Available courses (fetched from API, fallback list shown while loading) ──
const FALLBACK_COURSES = [
  'Web Development', 'Mobile App Development', 'Data Science',
  'Cybersecurity', 'Cloud Computing', 'UI/UX Design',
  'Digital Marketing', 'Database Management', 'Software Engineering',
  'Networking & Infrastructure',
];

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
  const navigate       = useNavigate();
  const { register }   = useAuth();
  const [role,         setRole]         = useState('student');
  const [interests,    setInterests]    = useState([]);
  const [courseList,   setCourseList]   = useState(FALLBACK_COURSES);

  // Load published courses for the interests checklist
  useEffect(() => {
    courseService.getAll({ published: true })
      .then((res) => {
        const titles = (res.data?.courses || res.courses || []).map((c) => c.title);
        if (titles.length > 0) setCourseList(titles);
      })
      .catch(() => {}); // fallback list stays
  }, []);

  const toggleInterest = (title) => {
    setInterests((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const { values, errors, loading, apiError, handleChange, handleSubmit, setApiError } = useForm({
    initialValues: {
      firstName: '', lastName: '', email: '',
      phone: '', password: '', confirmPassword: '',
    },
    validate,
    onSubmit: async (vals) => {
      await register({
        firstName:  vals.firstName,
        lastName:   vals.lastName,
        email:      vals.email,
        phone:      vals.phone,
        password:   vals.password,
        role,
        interests:  role === 'student'     ? interests : [],
        expertise:  role === 'instructor'  ? interests : [],
      });
      navigate(role === 'instructor' ? '/instructor' : '/student');
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

        {/* Role Selection */}
        <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
          {['student', 'instructor'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => { setRole(r); setInterests([]); }}
              style={{
                flex: 1,
                padding: 'var(--space-md)',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${role === r ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: role === r ? 'rgba(0,212,255,0.08)' : 'var(--color-bg-card)',
                color: role === r ? 'var(--color-primary)' : 'var(--color-text)',
                fontWeight: role === r ? 700 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>
                {r === 'student' ? '🎓' : '👨‍🏫'}
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', textTransform: 'capitalize' }}>
                {r === 'student' ? 'Student' : 'Instructor'}
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
                {r === 'student' ? 'I want to learn' : 'I want to teach'}
              </div>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="auth-form__row">
            <FormField label="First Name" name="firstName" value={values.firstName}
              onChange={handleChange} error={errors.firstName} required placeholder="First name" />
            <FormField label="Last Name"  name="lastName"  value={values.lastName}
              onChange={handleChange} error={errors.lastName}  required placeholder="Last name" />
          </div>
          <FormField label="Email Address" name="email" type="email" value={values.email}
            onChange={handleChange} error={errors.email} required placeholder="you@example.com" />
          <FormField label="Phone Number"  name="phone" type="tel" value={values.phone}
            onChange={handleChange} error={errors.phone} required placeholder="+234 800 000 0000" />
          <div className="auth-form__row">
            <FormField label="Password" name="password" type="password" value={values.password}
              onChange={handleChange} error={errors.password} required placeholder="Min. 8 characters" />
            <FormField label="Confirm Password" name="confirmPassword" type="password"
              value={values.confirmPassword} onChange={handleChange} error={errors.confirmPassword}
              required placeholder="Repeat password" />
          </div>

          {/* Course Interests */}
          <div style={{ marginBottom: 'var(--space-md)' }}>
            <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text)', display: 'block', marginBottom: 'var(--space-sm)' }}>
              {role === 'student' ? 'Courses I want to learn' : 'Courses I can teach'}
              <span style={{ color: 'var(--color-text-muted)', fontWeight: 400, marginLeft: 6 }}>(select all that apply)</span>
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {courseList.map((title) => (
                <button
                  key={title}
                  type="button"
                  onClick={() => toggleInterest(title)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 99,
                    border: `1.5px solid ${interests.includes(title) ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: interests.includes(title) ? 'var(--color-primary)' : 'transparent',
                    color: interests.includes(title) ? '#000' : 'var(--color-text)',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: interests.includes(title) ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {title}
                </button>
              ))}
            </div>
            {interests.length > 0 && (
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', marginTop: 6 }}>
                {interests.length} selected
              </p>
            )}
          </div>

          <p className="auth-terms">
            By registering, you agree to our{' '}
            <Link to="/terms">Terms of Service</Link> and{' '}
            <Link to="/privacy">Privacy Policy</Link>.
          </p>

          <Button type="submit" loading={loading} fullWidth size="lg">
            Create {role === 'instructor' ? 'Instructor' : 'Student'} Account
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
