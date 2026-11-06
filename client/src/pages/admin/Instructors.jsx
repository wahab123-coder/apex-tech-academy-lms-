import React, { useState } from 'react';
import Table          from '../../components/ui/Table';
import Button         from '../../components/ui/Button';
import Modal          from '../../components/ui/Modal';
import FormField      from '../../components/ui/FormField';
import Alert          from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import useApi         from '../../hooks/useApi';
import useForm        from '../../hooks/useForm';
import api            from '../../services/api';
import { userService } from '../../services';
import './Portal.css';

const columns = [
  { key: 'name',       label: 'Name',   render: (_, r) => `${r.firstName} ${r.lastName}` },
  { key: 'email',      label: 'Email' },
  { key: 'phone',      label: 'Phone',  render: (v) => v || '—' },
  { key: 'bio',        label: 'Bio',    render: (v) => v ? v.slice(0, 60) + (v.length > 60 ? '…' : '') : '—' },
  { key: 'isActive',   label: 'Status', render: (v) => <span className={`badge badge--${v ? 'success' : 'muted'}`}>{v ? 'Active' : 'Inactive'}</span> },
  { key: 'createdAt',  label: 'Joined', render: (v) => new Date(v).toLocaleDateString() },
  { key: 'actions',    label: 'Actions',render: (_, r) => (
    <div style={{ display: 'flex', gap: 6 }}>
      <button className="btn btn--ghost btn--sm">View</button>
    </div>
  )},
];

const validate = (v) => {
  const e = {};
  if (!v.firstName.trim()) e.firstName = 'Required';
  if (!v.lastName.trim())  e.lastName  = 'Required';
  if (!v.email.trim())     e.email     = 'Required';
  if (!v.password || v.password.length < 8) e.password = 'Min 8 characters';
  return e;
};

function AdminInstructors() {
  const [search, setSearch]   = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [success, setSuccess] = useState('');

  const { data, loading, error, refetch } = useApi(
    () => userService.getAll({ role: 'instructor', limit: 100 }),
    { initialData: { users: [] } }
  );

  const instructors = data?.users || [];
  const filtered    = instructors.filter((i) =>
    `${i.firstName} ${i.lastName} ${i.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const { values, errors, loading: saving, apiError, handleChange, handleSubmit, setApiError, reset } = useForm({
    initialValues: { firstName: '', lastName: '', email: '', phone: '', password: 'Instructor@1234', bio: '' },
    validate,
    onSubmit: async (vals) => {
      // Create then promote to instructor role
      const api = (await import('../../services/api')).default;
      const res = await api.post('/auth/register', { ...vals, role: 'student' }); // register creates student      await userService.setRole(res.data.user._id, 'instructor');
      setSuccess(`Instructor ${vals.firstName} ${vals.lastName} created.`);
      setAddOpen(false);
      reset();
      refetch();
    },
  });

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">Instructors</h1>
        <p className="portal-page__subtitle">Manage instructor accounts and course assignments.</p>
      </div>

      {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}
      {error   && <Alert type="error">{error}</Alert>}

      <div className="section-toolbar">
        <div className="section-toolbar__left">
          <input className="portal-search" type="search" placeholder="Search instructors..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="section-toolbar__right">
          <Button size="sm" onClick={() => setAddOpen(true)}>+ Add Instructor</Button>
        </div>
      </div>

      {loading ? <LoadingSpinner label="Loading instructors..." /> : (
        <Table columns={columns} data={filtered} emptyMsg="No instructors found." />
      )}

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add New Instructor"
        footer={<>
          <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button loading={saving} onClick={handleSubmit}>Create Instructor</Button>
        </>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {apiError && <Alert type="error" onClose={() => setApiError('')}>{apiError}</Alert>}
          <div className="form-card__row">
            <FormField label="First Name" name="firstName" value={values.firstName} onChange={handleChange} error={errors.firstName} required />
            <FormField label="Last Name"  name="lastName"  value={values.lastName}  onChange={handleChange} error={errors.lastName}  required />
          </div>
          <FormField label="Email"    name="email"    type="email"    value={values.email}    onChange={handleChange} error={errors.email}    required />
          <FormField label="Phone"    name="phone"    type="tel"      value={values.phone}    onChange={handleChange} />
          <FormField label="Password" name="password" type="password" value={values.password} onChange={handleChange} error={errors.password} required />
          <FormField label="Bio"      name="bio"      type="textarea" rows={3} value={values.bio} onChange={handleChange} placeholder="Instructor background..." />
        </div>
      </Modal>
    </div>
  );
}

export default AdminInstructors;
