import React, { useState } from 'react';
import FormField  from '../../components/ui/FormField';
import Button     from '../../components/ui/Button';
import Alert      from '../../components/ui/Alert';
import Card       from '../../components/ui/Card';
import useForm    from '../../hooks/useForm';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services';
import api from '../../services/api';
import '../admin/Portal.css';

function StudentProfile() {
  const { user, updateUser } = useAuth();
  const [profileAlert, setProfileAlert] = useState(null);
  const [pwAlert,      setPwAlert]      = useState(null);

  const profileForm = useForm({
    initialValues: {
      firstName: user?.firstName || '',
      lastName:  user?.lastName  || '',
      email:     user?.email     || '',
      phone:     user?.phone     || '',
      address:   user?.address   || '',
      bio:       user?.bio       || '',
    },
    onSubmit: async (vals) => {
      const res = await userService.updateProfile(vals);
      updateUser(res.data.user);
      setProfileAlert({ type: 'success', msg: 'Profile updated successfully.' });
    },
  });

  const pwForm = useForm({
    initialValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
    validate: (v) => {
      const e = {};
      if (!v.currentPassword)           e.currentPassword = 'Required';
      if (v.newPassword.length < 8)     e.newPassword     = 'Min 8 characters';
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

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`;

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">My Profile</h1>
        <p className="portal-page__subtitle">Manage your personal information.</p>
      </div>

      <div className="portal-grid-2">
        {/* Avatar & info */}
        <Card padding="lg" variant="default">
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 96, height: 96,
              background: 'var(--gradient-accent)', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '2rem', fontWeight: 'bold',
              margin: '0 auto var(--space-md)',
            }}>
              {initials}
            </div>
            <h3 style={{ fontWeight: 'var(--font-weight-semibold)' }}>
              {user?.firstName} {user?.lastName}
            </h3>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', margin: 'var(--space-xs) 0 var(--space-md)' }}>
              Student
            </p>
            <span className={`badge badge--${user?.isActive ? 'success' : 'muted'}`}>
              {user?.isActive ? 'Active' : 'Inactive'}
            </span>
            <div style={{ marginTop: 'var(--space-lg)', padding: 'var(--space-md)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', textAlign: 'left' }}>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 4 }}>Email</p>
              <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>{user?.email}</p>
            </div>
            {user?.phone && (
              <div style={{ marginTop: 'var(--space-sm)', padding: 'var(--space-md)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', textAlign: 'left' }}>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 4 }}>Phone</p>
                <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>{user?.phone}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Edit form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <Card padding="lg" variant="default">
            <h3 style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-lg)' }}>
              Personal Information
            </h3>
            {profileAlert && <Alert type={profileAlert.type} onClose={() => setProfileAlert(null)}>{profileAlert.msg}</Alert>}
            {profileForm.apiError && <Alert type="error" onClose={() => profileForm.setApiError('')}>{profileForm.apiError}</Alert>}
            <form onSubmit={profileForm.handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                <div className="form-card__row">
                  <FormField label="First Name" name="firstName" value={profileForm.values.firstName} onChange={profileForm.handleChange} required />
                  <FormField label="Last Name"  name="lastName"  value={profileForm.values.lastName}  onChange={profileForm.handleChange} required />
                </div>
                <FormField label="Email"   name="email"   type="email" value={profileForm.values.email}   onChange={profileForm.handleChange} required />
                <FormField label="Phone"   name="phone"   type="tel"   value={profileForm.values.phone}   onChange={profileForm.handleChange} />
                <FormField label="Address" name="address"             value={profileForm.values.address} onChange={profileForm.handleChange} placeholder="Your address" />
                <FormField label="Bio"     name="bio"     type="textarea" rows={3} value={profileForm.values.bio} onChange={profileForm.handleChange} placeholder="Tell us about yourself..." />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button type="submit" loading={profileForm.loading}>Save Changes</Button>
                </div>
              </div>
            </form>
          </Card>

          <Card padding="lg" variant="default">
            <h3 style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-lg)' }}>
              Change Password
            </h3>
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
      </div>
    </div>
  );
}

export default StudentProfile;
