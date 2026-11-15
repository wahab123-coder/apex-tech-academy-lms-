import React, { useState } from 'react';
import Table            from '../../components/ui/Table';
import Button           from '../../components/ui/Button';
import Modal            from '../../components/ui/Modal';
import FormField        from '../../components/ui/FormField';
import Alert            from '../../components/ui/Alert';
import DashboardStatCard from '../../components/ui/DashboardStatCard';
import LoadingSpinner   from '../../components/ui/LoadingSpinner';
import useApi           from '../../hooks/useApi';
import api              from '../../services/api';
import { userService }  from '../../services';
import './Portal.css';

function AdminStudents() {
  const [search,    setSearch]    = useState('');
  const [addOpen,   setAddOpen]   = useState(false);
  const [editOpen,  setEditOpen]  = useState(false);
  const [selected,  setSelected]  = useState(null);
  const [alert,     setAlert]     = useState(null);
  const [saving,    setSaving]    = useState(false);

  // Add form state
  const [addForm, setAddForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: 'Student@1234' });
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', phone: '', bio: '', isActive: true });

  const { data, loading, error, refetch } = useApi(
    () => userService.getAll({ role: 'student', limit: 200 }),
    { initialData: { users: [], total: 0 } }
  );

  const students = data?.users || [];
  const filtered = students.filter((s) =>
    `${s.firstName} ${s.lastName} ${s.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const total    = data?.total || students.length;
  const active   = students.filter((s) => s.isActive).length;
  const inactive = students.filter((s) => !s.isActive).length;

  const openEdit = (student) => {
    setSelected(student);
    setEditForm({ firstName: student.firstName, lastName: student.lastName, phone: student.phone || '', bio: student.bio || '', isActive: student.isActive });
    setEditOpen(true);
  };

  const handleAdd = async () => {
    if (!addForm.firstName.trim() || !addForm.lastName.trim() || !addForm.email.trim()) {
      setAlert({ type: 'error', msg: 'First name, last name and email are required.' });
      return;
    }
    setSaving(true);
    try {
      await api.post('/auth/register', { ...addForm, role: 'student' });
      setAlert({ type: 'success', msg: `Student ${addForm.firstName} ${addForm.lastName} created.` });
      setAddOpen(false);
      setAddForm({ firstName: '', lastName: '', email: '', phone: '', password: 'Student@1234' });
      refetch();
    } catch (err) {
      setAlert({ type: 'error', msg: err.message || 'Failed to create student.' });
    } finally { setSaving(false); }
  };

  const handleEdit = async () => {
    setSaving(true);
    try {
      await userService.update(selected._id, editForm);
      setAlert({ type: 'success', msg: 'Student updated successfully.' });
      setEditOpen(false);
      refetch();
    } catch (err) {
      setAlert({ type: 'error', msg: err.message || 'Failed to update student.' });
    } finally { setSaving(false); }
  };

  const handleDelete = async (student) => {
    if (!window.confirm(`Delete ${student.firstName} ${student.lastName}? This cannot be undone.`)) return;
    try {
      await userService.remove(student._id);
      setAlert({ type: 'success', msg: `${student.firstName} ${student.lastName} deleted.` });
      refetch();
    } catch (err) {
      setAlert({ type: 'error', msg: err.message || 'Failed to delete student.' });
    }
  };

  const handleToggleActive = async (student) => {
    try {
      await userService.toggleActive(student._id);
      setAlert({ type: 'success', msg: `${student.firstName} ${student.isActive ? 'deactivated' : 'activated'}.` });
      refetch();
    } catch (err) {
      setAlert({ type: 'error', msg: err.message || 'Failed to toggle status.' });
    }
  };

  const columns = [
    { key: 'name',      label: 'Name',    render: (_, r) => `${r.firstName} ${r.lastName}` },
    { key: 'email',     label: 'Email' },
    { key: 'phone',     label: 'Phone',   render: (v) => v || '—' },
    { key: 'interests', label: 'Interests', render: (v) => v?.length ? v.slice(0,2).join(', ') + (v.length > 2 ? ` +${v.length-2}` : '') : '—' },
    { key: 'isActive',  label: 'Status',  render: (v) => <span className={`badge badge--${v ? 'success' : 'muted'}`}>{v ? 'Active' : 'Inactive'}</span> },
    { key: 'createdAt', label: 'Joined',  render: (v) => new Date(v).toLocaleDateString() },
    { key: 'actions',   label: 'Actions', render: (_, row) => (
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        <button className="btn btn--ghost btn--sm" onClick={() => openEdit(row)}>Edit</button>
        <button className="btn btn--outline btn--sm" onClick={() => handleToggleActive(row)}>
          {row.isActive ? 'Deactivate' : 'Activate'}
        </button>
        <button className="btn btn--danger btn--sm" onClick={() => handleDelete(row)}>Delete</button>
      </div>
    )},
  ];

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">Students</h1>
        <p className="portal-page__subtitle">Manage all registered students.</p>
      </div>

      {alert && <Alert type={alert.type} onClose={() => setAlert(null)}>{alert.msg}</Alert>}
      {error  && <Alert type="error">{error}</Alert>}

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 'var(--space-lg)' }}>
        <DashboardStatCard title="Total Students" value={total}    icon="🎓" color="primary" />
        <DashboardStatCard title="Active"          value={active}   icon="✅" color="success" />
        <DashboardStatCard title="Inactive"        value={inactive} icon="⏸" color="warning" />
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

      {/* Add Student Modal */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add New Student"
        footer={<>
          <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button loading={saving} onClick={handleAdd}>Create Student</Button>
        </>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="form-card__row">
            <FormField label="First Name *" name="firstName" value={addForm.firstName} onChange={(e) => setAddForm(p => ({...p, firstName: e.target.value}))} required />
            <FormField label="Last Name *"  name="lastName"  value={addForm.lastName}  onChange={(e) => setAddForm(p => ({...p, lastName: e.target.value}))}  required />
          </div>
          <FormField label="Email *"    name="email"    type="email"    value={addForm.email}    onChange={(e) => setAddForm(p => ({...p, email: e.target.value}))}    required />
          <FormField label="Phone"      name="phone"    type="tel"      value={addForm.phone}    onChange={(e) => setAddForm(p => ({...p, phone: e.target.value}))} />
          <FormField label="Password *" name="password" type="password" value={addForm.password} onChange={(e) => setAddForm(p => ({...p, password: e.target.value}))} required />
        </div>
      </Modal>

      {/* Edit Student Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title={`Edit — ${selected?.firstName} ${selected?.lastName}`}
        footer={<>
          <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button loading={saving} onClick={handleEdit}>Save Changes</Button>
        </>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="form-card__row">
            <FormField label="First Name" name="firstName" value={editForm.firstName} onChange={(e) => setEditForm(p => ({...p, firstName: e.target.value}))} />
            <FormField label="Last Name"  name="lastName"  value={editForm.lastName}  onChange={(e) => setEditForm(p => ({...p, lastName: e.target.value}))} />
          </div>
          <FormField label="Phone" name="phone" type="tel" value={editForm.phone} onChange={(e) => setEditForm(p => ({...p, phone: e.target.value}))} />
          <FormField label="Bio"   name="bio"   type="textarea" rows={3} value={editForm.bio} onChange={(e) => setEditForm(p => ({...p, bio: e.target.value}))} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" id="isActive" checked={editForm.isActive} onChange={(e) => setEditForm(p => ({...p, isActive: e.target.checked}))} />
            <label htmlFor="isActive" style={{ fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>Account is active</label>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default AdminStudents;
