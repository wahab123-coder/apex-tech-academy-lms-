import React, { useState } from 'react';
import Table            from '../../components/ui/Table';
import Button           from '../../components/ui/Button';
import Modal            from '../../components/ui/Modal';
import FormField        from '../../components/ui/FormField';
import Alert            from '../../components/ui/Alert';
import DashboardStatCard from '../../components/ui/DashboardStatCard';
import LoadingSpinner   from '../../components/ui/LoadingSpinner';
import useApi           from '../../hooks/useApi';
import useForm          from '../../hooks/useForm';
import api              from '../../services/api';
import { userService, courseService } from '../../services';
import './Portal.css';

const columns = [
  { key: 'admissionNo',  label: 'Admission No.', render: (_, row) => row.admissionNo || '—' },
  { key: 'name',         label: 'Name',          render: (_, row) => `${row.firstName} ${row.lastName}` },
  { key: 'email',        label: 'Email' },
  { key: 'phone',        label: 'Phone',         render: (v) => v || '—' },
  { key: 'isActive',     label: 'Status',        render: (v) => <span className={`badge badge--${v ? 'success' : 'muted'}`}>{v ? 'Active' : 'Inactive'}</span> },
  { key: 'createdAt',    label: 'Joined',        render: (v) => new Date(v).toLocaleDateString() },
  { key: 'actions',      label: 'Actions',       render: (_, row) => (
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
  if (!v.phone.trim())     e.phone     = 'Required';
  if (!v.password || v.password.length < 8) e.password = 'Min 8 characters';
  return e;
};

function AdminStudents() {
  const [search, setSearch]   = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [success, setSuccess] = useState('');

  const { data, loading, error, refetch } = useApi(
    () => userService.getAll({ role: 'student', limit: 100 }),
    { initialData: { users: [], total: 0 } }
  );

  const { data: coursesData } = useApi(
    () => courseService.getAll({ published: true }),
    { initialData: { courses: [] } }
  );

  const students = data?.users || [];
  const courses  = coursesData?.courses || [];

  const filtered = students.filter((s) =>
    `${s.firstName} ${s.lastName} ${s.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const { values, errors, loading: saving, apiError, handleChange, handleSubmit, setApiError, reset } = useForm({
    initialValues: { firstName: '', lastName: '', email: '', phone: '', password: 'Student@1234' },
    validate,
    onSubmit: async (vals) => {
      // Create user via auth register endpoint (admin can also do this directly)
      const res = await api.post('/auth/register', vals);
      setSuccess(`Student ${vals.firstName} ${vals.lastName} created.`);
      setAddOpen(false);
      reset();
      refetch();
    },
  });

  const total    = data?.total || 0;
  const active   = students.filter((s) => s.isActive).length;
  const inactive = students.filter((s) => !s.isActive).length;

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">Students</h1>
        <p className="portal-page__subtitle">Manage all registered students.</p>
      </div>

      {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}
      {error   && <Alert type="error">{error}</Alert>}

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <DashboardStatCard title="Total Students"  value={total}    icon="🎓" color="primary" />
        <DashboardStatCard title="Active"          value={active}   icon="✅" color="success" />
        <DashboardStatCard title="Inactive"        value={inactive} icon="⏸" color="warning" />
        <DashboardStatCard title="Showing"         value={filtered.length} icon="🔍" color="info" />
      </div>

      <div className="section-toolbar">
        <div className="section-toolbar__left">
          <input className="portal-search" type="search" placeholder="Search by name or email..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="section-toolbar__right">
          <Button size="sm" onClick={() => setAddOpen(true)}>+ Add Student</Button>
        </div>
      </div>

      {loading ? <LoadingSpinner label="Loading students..." /> : (
        <Table columns={columns} data={filtered} emptyMsg="No students found." />
      )}

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add New Student"
        footer={<>
          <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button loading={saving} onClick={handleSubmit}>Create Student</Button>
        </>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {apiError && <Alert type="error" onClose={() => setApiError('')}>{apiError}</Alert>}
          <div className="form-card__row">
            <FormField label="First Name" name="firstName" value={values.firstName} onChange={handleChange} error={errors.firstName} required />
            <FormField label="Last Name"  name="lastName"  value={values.lastName}  onChange={handleChange} error={errors.lastName}  required />
          </div>
          <FormField label="Email"    name="email"    type="email" value={values.email}    onChange={handleChange} error={errors.email}    required />
          <FormField label="Phone"    name="phone"    type="tel"   value={values.phone}    onChange={handleChange} error={errors.phone}    required />
          <FormField label="Password" name="password" type="password" value={values.password} onChange={handleChange} error={errors.password} required />
        </div>
      </Modal>
    </div>
  );
}

export default AdminStudents;
