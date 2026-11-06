import React, { useState } from 'react';
import Table          from '../../components/ui/Table';
import Button         from '../../components/ui/Button';
import Modal          from '../../components/ui/Modal';
import FormField      from '../../components/ui/FormField';
import Alert          from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import useApi         from '../../hooks/useApi';
import useForm        from '../../hooks/useForm';
import { eventService } from '../../services';
import './Portal.css';

const columns = [
  { key: 'title',    label: 'Event' },
  { key: 'type',     label: 'Type' },
  { key: 'date',     label: 'Date',     render: (v) => new Date(v).toLocaleDateString() },
  { key: 'location', label: 'Location' },
  { key: 'registrations', label: 'Registrations', render: (v) => <span className="badge badge--info">{v?.length || 0}</span> },
  { key: 'isPublished', label: 'Status', render: (v) => <span className={`badge badge--${v ? 'success' : 'muted'}`}>{v ? 'Published' : 'Draft'}</span> },
  { key: 'actions',  label: 'Actions',  render: (_, row) => (
    <div style={{ display: 'flex', gap: 6 }}>
      <button className="btn btn--ghost btn--sm">Edit</button>
      <button className="btn btn--danger btn--sm">Delete</button>
    </div>
  )},
];

const validate = (v) => {
  const e = {};
  if (!v.title.trim())    e.title    = 'Required';
  if (!v.type)            e.type     = 'Required';
  if (!v.date)            e.date     = 'Required';
  if (!v.location.trim()) e.location = 'Required';
  return e;
};

function AdminEvents() {
  const [open,  setOpen]  = useState(false);
  const [alert, setAlert] = useState(null);

  const { data, loading, error, refetch } = useApi(
    () => eventService.getAll(),
    { initialData: { events: [] } }
  );

  const events = data?.events || [];

  const { values, errors, loading: saving, apiError, handleChange, handleSubmit, setApiError, reset } = useForm({
    initialValues: { title: '', type: 'Workshop', date: '', time: '', location: '', capacity: '', description: '' },
    validate,
    onSubmit: async (vals) => {
      await eventService.create({ ...vals, capacity: vals.capacity ? Number(vals.capacity) : null });
      setAlert({ type: 'success', msg: `Event "${vals.title}" created.` });
      setOpen(false);
      reset();
      refetch();
    },
  });

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">Events</h1>
        <p className="portal-page__subtitle">Create and manage academy events.</p>
      </div>

      {alert && <Alert type={alert.type} onClose={() => setAlert(null)}>{alert.msg}</Alert>}
      {error  && <Alert type="error">{error}</Alert>}

      <div className="section-toolbar">
        <div className="section-toolbar__right">
          <Button size="sm" onClick={() => setOpen(true)}>+ New Event</Button>
        </div>
      </div>

      {loading ? <LoadingSpinner label="Loading events..." /> : (
        <Table columns={columns} data={events} emptyMsg="No events found." />
      )}

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Create Event"
        footer={<>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button loading={saving} onClick={handleSubmit}>Save Event</Button>
        </>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {apiError && <Alert type="error" onClose={() => setApiError('')}>{apiError}</Alert>}
          <FormField label="Event Title" name="title"    value={values.title}    onChange={handleChange} error={errors.title}    required />
          <FormField label="Type"        name="type"     type="select" value={values.type} onChange={handleChange} error={errors.type}>
            <option>Bootcamp</option><option>Workshop</option><option>Ceremony</option><option>Career Event</option><option>Open Day</option>
          </FormField>
          <div className="form-card__row">
            <FormField label="Date"     name="date"     type="date"   value={values.date}     onChange={handleChange} error={errors.date}     required />
            <FormField label="Time"     name="time"                   value={values.time}     onChange={handleChange} placeholder="e.g. 9:00 AM" />
          </div>
          <div className="form-card__row">
            <FormField label="Location" name="location"              value={values.location} onChange={handleChange} error={errors.location} required />
            <FormField label="Capacity" name="capacity" type="number" value={values.capacity} onChange={handleChange} placeholder="Leave blank for unlimited" />
          </div>
          <FormField label="Description" name="description" type="textarea" rows={3} value={values.description} onChange={handleChange} />
        </div>
      </Modal>
    </div>
  );
}

export default AdminEvents;
