import React, { useState } from 'react';
import Table          from '../../components/ui/Table';
import Button         from '../../components/ui/Button';
import Modal          from '../../components/ui/Modal';
import FormField      from '../../components/ui/FormField';
import Alert          from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import useApi         from '../../hooks/useApi';
import api            from '../../services/api';
import { userService } from '../../services';
import './Portal.css';

function AdminInstructors() {
  const [search,   setSearch]   = useState('');
  const [addOpen,  setAddOpen]  = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [alert,    setAlert]    = useState(null);
  const [saving,   setSaving]   = useState(false);

  const [addForm,  setAddForm]  = useState({ firstName: '', lastName: '', email: '', phone: '', password: 'Instructor@2026!', bio: '' });
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', phone: '', bio: '', isActive: true });

  const { data, loading, error, refetch } = useApi(
    () => userService.getAll({ role: 'instructor', limit: 200 }),
    { initialData: { users: [] } }
  );

  const instructors = data?.users || [];
  const filtered    = instructors.filter((i) =>
    `${i.firstName} ${i.lastName} ${i.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (instructor) => {
    setSelected(instructor);
    setEditForm({ firstName: instructor.firstName, lastName: instructor.lastName, phone: instructor.phone || '', bio: instructor.bio || '', isActive: instructor.isActive });
    setEditOpen(true);
  };

  const handleAdd = async () => {
    if (!addForm.firstName.trim() || !addForm.lastName.trim() || !addForm.email.trim()) {
      setAlert({ type: 'error', msg: 'First name, last name and email are required.' });
      return;
    }
    setSaving(true);
    try {
      // Register with instructor role directly
      const res = await api.post('/auth/register', { ...addForm, role: 'instructor' });
      setAlert({ type: 'success', msg: `Instructor ${addForm.firstName} ${addForm.lastName} created. Default password: ${addForm.password}` });
      setAddOpen(false);
      setAddForm({ firstName: '', lastName: '', email: '', phone: '', password: 'Instructor@2026!', bio: '' });
      refetch();
    } catch (err) {
      setAlert({ type: 'error', msg: err.message || 'Failed to create instructor.' });
    } finally { setSaving(false); }
  };

  const handleEdit = async () => {
    setSaving(true);
    try {
      await userService.update(selected._id, editForm);
      setAlert({ type: 'success', msg: 'Instructor updated successfully.' });
      setEditOpen(false);
      refetch();
    } catch (err) {
      setAlert({ type: 'error', msg: err.message || 'Failed to update.' });
    } finally { setSaving(false); }
  };

  const handleDelete = async (instructor) => {
    if (!window.confirm(`Delete ${instructor.firstName} ${instructor.lastName}? This cannot be undone.`)) return;
    try {
      await userService.remove(instructor._id);
      setAlert({ type: 'success', msg: `${instructor.firstName} ${instructor.lastName} deleted.` });
      refetch();
    } catch (err) {
      setAlert({ type: 'error', msg: err.message || 'Failed to delete.' });
    }
  };

  const handleToggleActive = async (instructor) => {
    try {
      await userService.toggleActive(instructor._id);
      setAlert({ type: 'success', msg: `${instructor.firstName} ${instructor.isActive ? 'deactivated' : 'activated'}.` });
      refetch();
    } catch (err) {
      setAlert({ type: 'error', msg: err.message || 'Failed to toggle status.' });
    }
  };

  const columns = [
    { key: 'name',      label: 'Name',    render: (_, r) => `${r.firstName} ${r.lastName}` },
    { key: 'email',     label: 'Email' },
    { key: 'phone',     label: 'Phone',   render: (v) => v || '—' },
    { key: 'bio',       label: 'Bio',     render: (v) => v ? v.slice(0, 50) + (v.length > 50 ? '…' : '') : '—' },
    { key: 'expertise', label: 'Expertise', render: (v) => v?.length ? v.slice(0,2).join(', ') + (v.length > 2 ? ` +${v.length-2}` : '') : '—' },
    { key: 'isActive',  label: 'Status',  render: (v) => <span className={`badge badge--${v ? 'success' : 'muted'}`}>{v ? 'Active' : 'Inactive'}</span> },
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
        <h1 className="portal-page__title">Instructors</h1>
        <p className="portal-page__subtitle">Manage instructor accounts and course assignments.</p>
      </div>

      {alert && <Alert type={alert.type} onClose={() => setAlert(null)}>{alert.msg}</Alert>}
      {error  && <Alert type="error">{error}</Alert>}

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

      {/* Add Instructor Modal */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add New Instructor"
        footer={<>
          <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button loading={saving} onClick={handleAdd}>Create Instructor</Button>
        </>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="form-card__row">
            <FormField label="First Name *" name="firstName" value={addForm.firstName} onChange={(e) => setAddForm(p => ({...p, firstName: e.target.value}))} required />
            <FormField label="Last Name *"  name="lastName"  value={addForm.lastName}  onChange={(e) => setAddForm(p => ({...p, lastName: e.target.value}))}  required />
          </div>
          <FormField label="Email *"    name="email"    type="email"    value={addForm.email}    onChange={(e) => setAddForm(p => ({...p, email: e.target.value}))}    required />
          <FormField label="Phone"      name="phone"    type="tel"      value={addForm.phone}    onChange={(e) => setAddForm(p => ({...p, phone: e.target.value}))} />
          <FormField label="Password *" name="password" type="password" value={addForm.password} onChange={(e) => setAddForm(p => ({...p, password: e.target.value}))} required />
          <FormField label="Bio"        name="bio"      type="textarea" rows={2} value={addForm.bio} onChange={(e) => setAddForm(p => ({...p, bio: e.target.value}))} placeholder="Instructor background and expertise..." />
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            The instructor will log in with the email and password above.
          </p>
        </div>
      </Modal>

      {/* Edit Instructor Modal */}
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
          <FormField label="Phone" name="phone" type="tel"      value={editForm.phone} onChange={(e) => setEditForm(p => ({...p, phone: e.target.value}))} />
          <FormField label="Bio"   name="bio"   type="textarea" rows={3} value={editForm.bio} onChange={(e) => setEditForm(p => ({...p, bio: e.target.value}))} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" id="instrActive" checked={editForm.isActive} onChange={(e) => setEditForm(p => ({...p, isActive: e.target.checked}))} />
            <label htmlFor="instrActive" style={{ fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>Account is active</label>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default AdminInstructors;
