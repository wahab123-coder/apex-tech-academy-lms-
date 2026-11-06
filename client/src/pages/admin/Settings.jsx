import React, { useState, useEffect } from 'react';
import FormField  from '../../components/ui/FormField';
import Button     from '../../components/ui/Button';
import Alert      from '../../components/ui/Alert';
import Card       from '../../components/ui/Card';
import useForm    from '../../hooks/useForm';
import useApi     from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import { userService, settingsService } from '../../services';
import api from '../../services/api';
import './Portal.css';

function AdminSettings() {
  const { user, updateUser } = useAuth();
  const [profileAlert, setProfileAlert] = useState(null);
  const [pwAlert,      setPwAlert]      = useState(null);
  const [sessionAlert, setSessionAlert]  = useState(null);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [savingTimeout, setSavingTimeout] = useState(false);

  // Fetch current settings
  const { data: settingsData } = useApi(
    () => settingsService.getPublic(),
    { initialData: { settings: {} } }
  );

  // Sync session timeout from API
  useEffect(() => {
    if (settingsData?.settings?.session_timeout) {
      setSessionTimeout(settingsData.settings.session_timeout);
    }
  }, [settingsData]);

  // ── Profile form ──
  const profileForm = useForm({
    initialValues: {
      firstName: user?.firstName || '',
      lastName:  user?.lastName  || '',
      email:     user?.email     || '',
      phone:     user?.phone     || '',
    },
    onSubmit: async (vals) => {
      const res = await userService.updateProfile(vals);
      updateUser(res.data.user);
      setProfileAlert({ type: 'success', msg: 'Profile updated successfully.' });
    },
  });

  // ── Password form ──
  const pwForm = useForm({
    initialValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
    validate: (v) => {
      const e = {};
      if (!v.currentPassword)    e.currentPassword = 'Required';
      if (v.newPassword.length < 8) e.newPassword  = 'Min 8 characters';
      if (v.newPassword !== v.confirmPassword) e.confirmPassword = 'Passwords do not match';
      return e;
    },
    onSubmit: async (vals) => {
      await api.post('/auth/change-password', {
        currentPassword: vals.currentPassword,
        newPassword:     vals.newPassword,
      });
      setPwAlert({ type: 'success', msg: 'Password changed successfully.' });
      pwForm.reset();
    },
  });

  // ── Save session timeout ──
  const handleSaveTimeout = async () => {
    const minutes = Number(sessionTimeout);
    if (!minutes || minutes < 5 || minutes > 120) {
      setSessionAlert({ type: 'error', msg: 'Timeout must be between 5 and 120 minutes.' });
      return;
    }
    setSavingTimeout(true);
    try {
      await settingsService.update('session_timeout', {
        value: String(minutes),
        label: 'Session Timeout (minutes)',
        description: 'Auto-logout users after this many minutes of inactivity',
        category: 'security',
      });
      setSessionAlert({ type: 'success', msg: `Session timeout set to ${minutes} minutes. Users will be logged out after ${minutes} minutes of inactivity.` });
    } catch (err) {
      setSessionAlert({ type: 'error', msg: err.message });
    } finally {
      setSavingTimeout(false);
    }
  };

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">Settings</h1>
        <p className="portal-page__subtitle">Configure your account and academy settings.</p>
      </div>

      {/* ── Session Timeout ── */}
      <Card padding="lg" variant="default">
        <h2 style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-sm)' }}>
          Session Timeout
        </h2>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-lg)' }}>
          Set how long users stay logged in without activity before being automatically logged out.
          Public pages are not affected — only the admin, instructor and student portals.
        </p>

        {sessionAlert && <Alert type={sessionAlert.type} onClose={() => setSessionAlert(null)}>{sessionAlert.msg}</Alert>}

        <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <FormField
              label="Inactivity Timeout (minutes)"
              name="sessionTimeout"
              type="number"
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
            />
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>
              Recommended: 30 minutes. Range: 5–120 minutes.
            </p>
          </div>
          <Button loading={savingTimeout} onClick={handleSaveTimeout}>
            Save Timeout
          </Button>
        </div>

        {/* Quick presets */}
        <div style={{ display: 'flex', gap: 'var(--space-xs)', marginTop: 'var(--space-md)', flexWrap: 'wrap' }}>
          {[
            { label: '15 min',  value: '15'  },
            { label: '30 min',  value: '30'  },
            { label: '45 min',  value: '45'  },
            { label: '60 min',  value: '60'  },
            { label: '90 min',  value: '90'  },
            { label: '2 hours',  value: '120' },
          ].map((preset) => (
            <button
              key={preset.value}
              className={`filter-btn ${sessionTimeout === preset.value ? 'active' : ''}`}
              onClick={() => setSessionTimeout(preset.value)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </Card>

      {/* ── Profile ── */}
      <Card padding="lg" variant="default">
        <h2 style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-lg)' }}>
          Profile Information
        </h2>
        {profileAlert && <Alert type={profileAlert.type} onClose={() => setProfileAlert(null)}>{profileAlert.msg}</Alert>}
        {profileForm.apiError && <Alert type="error" onClose={() => profileForm.setApiError('')}>{profileForm.apiError}</Alert>}
        <form onSubmit={profileForm.handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div className="form-card__row">
              <FormField label="First Name" name="firstName" value={profileForm.values.firstName} onChange={profileForm.handleChange} required />
              <FormField label="Last Name"  name="lastName"  value={profileForm.values.lastName}  onChange={profileForm.handleChange} required />
            </div>
            <div className="form-card__row">
              <FormField label="Email" name="email" type="email" value={profileForm.values.email} onChange={profileForm.handleChange} required />
              <FormField label="Phone" name="phone" type="tel"   value={profileForm.values.phone} onChange={profileForm.handleChange} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" loading={profileForm.loading}>Save Changes</Button>
            </div>
          </div>
        </form>
      </Card>

      {/* ── Change Password ── */}
      <Card padding="lg" variant="default">
        <h2 style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-lg)' }}>
          Change Password
        </h2>
        {pwAlert && <Alert type={pwAlert.type} onClose={() => setPwAlert(null)}>{pwAlert.msg}</Alert>}
        {pwForm.apiError && <Alert type="error" onClose={() => pwForm.setApiError('')}>{pwForm.apiError}</Alert>}
        <form onSubmit={pwForm.handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <FormField label="Current Password" name="currentPassword" type="password"
              value={pwForm.values.currentPassword} onChange={pwForm.handleChange}
              error={pwForm.errors.currentPassword} required />
            <div className="form-card__row">
              <FormField label="New Password"     name="newPassword"     type="password"
                value={pwForm.values.newPassword}     onChange={pwForm.handleChange}
                error={pwForm.errors.newPassword}     required />
              <FormField label="Confirm Password" name="confirmPassword" type="password"
                value={pwForm.values.confirmPassword} onChange={pwForm.handleChange}
                error={pwForm.errors.confirmPassword} required />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" loading={pwForm.loading}>Update Password</Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default AdminSettings;
