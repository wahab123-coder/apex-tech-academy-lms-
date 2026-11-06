import React, { useState } from 'react';
import Button         from '../../components/ui/Button';
import Modal          from '../../components/ui/Modal';
import FormField      from '../../components/ui/FormField';
import Alert          from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import useApi         from '../../hooks/useApi';
import useForm        from '../../hooks/useForm';
import { announcementService, courseService } from '../../services';
import '../admin/Portal.css';

const validate = (v) => {
  const e = {};
  if (!v.title.trim())   e.title   = 'Required';
  if (!v.message.trim()) e.message = 'Required';
  return e;
};

function InstructorAnnouncements() {
  const [open,  setOpen]  = useState(false);
  const [alert, setAlert] = useState(null);

  const { data: coursesData } = useApi(() => courseService.getMine(), { initialData: { courses: [] } });
  const courses = coursesData?.courses || [];

  const { data, loading, error, refetch } = useApi(
    () => announcementService.getAll(),
    { initialData: { announcements: [] } }
  );

  const announcements = data?.announcements || [];

  const { values, errors, loading: saving, apiError, handleChange, handleSubmit, setApiError, reset } = useForm({
    initialValues: { title: '', message: '', course: '', audience: 'students' },
    validate,
    onSubmit: async (vals) => {
      await announcementService.create({
        title:    vals.title,
        message:  vals.message,
        audience: vals.audience,
        course:   vals.course || undefined,
      });
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
        <p className="portal-page__subtitle">Post announcements to students in your courses.</p>
      </div>

      {alert && <Alert type={alert.type} onClose={() => setAlert(null)}>{alert.msg}</Alert>}
      {error  && <Alert type="error">{error}</Alert>}

      <div className="section-toolbar">
        <div className="section-toolbar__right">
          <Button size="sm" onClick={() => setOpen(true)}>+ Post Announcement</Button>
        </div>
      </div>

      {loading ? <LoadingSpinner label="Loading..." /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {announcements.length === 0 ? (
            <div className="portal-empty">
              <div className="portal-empty__icon">📢</div>
              <p className="portal-empty__title">No announcements yet</p>
            </div>
          ) : announcements.map((a) => (
            <div key={a._id} style={{
              background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)', padding: 'var(--space-lg)',
              borderLeft: '4px solid var(--color-primary)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            }}>
              <div>
                <p style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 4 }}>{a.title}</p>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 4 }}>{a.message}</p>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                  {new Date(a.createdAt).toLocaleDateString()} ·
                  <span className="badge badge--info" style={{ marginLeft: 6 }}>{a.audience}</span>
                </p>
              </div>
              <button
                className="btn btn--danger btn--sm"
                onClick={async () => {
                  await announcementService.remove(a._id);
                  refetch();
                }}
              >Delete</button>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Post Announcement"
        footer={<>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button loading={saving} onClick={handleSubmit}>Post</Button>
        </>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {apiError && <Alert type="error" onClose={() => setApiError('')}>{apiError}</Alert>}
          {courses.length > 0 && (
            <FormField label="Course (optional)" name="course" type="select" value={values.course} onChange={handleChange}>
              <option value="">All my courses</option>
              {courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
            </FormField>
          )}
          <FormField label="Title *"   name="title"   value={values.title}   onChange={handleChange} error={errors.title}   required />
          <FormField label="Message *" name="message" type="textarea" rows={5} value={values.message} onChange={handleChange} error={errors.message} required />
        </div>
      </Modal>
    </div>
  );
}

export default InstructorAnnouncements;
