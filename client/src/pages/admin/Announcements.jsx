import React, { useState } from 'react';
import Table          from '../../components/ui/Table';
import Button         from '../../components/ui/Button';
import Modal          from '../../components/ui/Modal';
import FormField      from '../../components/ui/FormField';
import Alert          from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import useApi         from '../../hooks/useApi';
import useForm        from '../../hooks/useForm';
import { announcementService } from '../../services';
import './Portal.css';

const columns = [
  { key: 'title',     label: 'Announcement' },
  { key: 'audience',  label: 'Audience',    render: (v) => <span className="badge badge--info">{v}</span> },
  { key: 'createdBy', label: 'By',          render: (v) => v ? `${v.firstName} ${v.lastName}` : '—' },
  { key: 'createdAt', label: 'Date',        render: (v) => new Date(v).toLocaleDateString() },
  { key: 'isActive',  label: 'Status',      render: (v) => <span className={`badge badge--${v ? 'success' : 'muted'}`}>{v ? 'Active' : 'Inactive'}</span> },
  { key: 'actions',   label: 'Actions',     render: (_, row) => (
    <button className="btn btn--danger btn--sm">Delete</button>
  )},
];

const validate = (v) => {
  const e = {};
  if (!v.title.trim())   e.title   = 'Required';
  if (!v.message.trim()) e.message = 'Required';
  return e;
};

function AdminAnnouncements() {
  const [open,  setOpen]  = useState(false);
  const [alert, setAlert] = useState(null);

  const { data, loading, error, refetch } = useApi(
    () => announcementService.getAll(),
    { initialData: { announcements: [] } }
  );

  const announcements = data?.announcements || [];

  const { values, errors, loading: saving, apiError, handleChange, handleSubmit, setApiError, reset } = useForm({
    initialValues: { title: '', message: '', audience: 'all' },
    validate,
    onSubmit: async (vals) => {
      await announcementService.create(vals);
      setAlert({ type: 'success', msg: 'Announcement posted.' });
      setOpen(false);
      reset();
      refetch();
    },
  });

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">Announcements</h1>
        <p className="portal-page__subtitle">Send announcements to students, instructors or everyone.</p>
      </div>

      {alert && <Alert type={alert.type} onClose={() => setAlert(null)}>{alert.msg}</Alert>}
      {error  && <Alert type="error">{error}</Alert>}

      <div className="section-toolbar">
        <div className="section-toolbar__right">
          <Button size="sm" onClick={() => setOpen(true)}>+ New Announcement</Button>
        </div>
      </div>

      {loading ? <LoadingSpinner label="Loading announcements..." /> : (
        <Table columns={columns} data={announcements} emptyMsg="No announcements." />
      )}

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Post Announcement"
        footer={<>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button loading={saving} onClick={handleSubmit}>Post</Button>
        </>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {apiError && <Alert type="error" onClose={() => setApiError('')}>{apiError}</Alert>}
          <FormField label="Title"    name="title"    value={values.title}    onChange={handleChange} error={errors.title} required />
          <FormField label="Audience" name="audience" type="select" value={values.audience} onChange={handleChange}>
            <option value="all">Everyone</option>
            <option value="students">Students</option>
            <option value="instructors">Instructors</option>
          </FormField>
          <FormField label="Message"  name="message"  type="textarea" rows={5} value={values.message} onChange={handleChange} error={errors.message} required />
        </div>
      </Modal>
    </div>
  );
}

export default AdminAnnouncements;
