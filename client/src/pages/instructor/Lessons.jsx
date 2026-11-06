import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Table          from '../../components/ui/Table';
import Button         from '../../components/ui/Button';
import Modal          from '../../components/ui/Modal';
import FormField      from '../../components/ui/FormField';
import Alert          from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import useApi         from '../../hooks/useApi';
import useForm        from '../../hooks/useForm';
import { lessonService, courseService } from '../../services';
import '../admin/Portal.css';

const columns = [
  { key: 'order',      label: '#' },
  { key: 'title',      label: 'Lesson Title' },
  { key: 'duration',   label: 'Duration',  render: (v) => v || '—' },
  { key: 'isPublished',label: 'Status',    render: (v) => <span className={`badge badge--${v ? 'success' : 'muted'}`}>{v ? 'Published' : 'Draft'}</span> },
  { key: 'actions',    label: 'Actions',   render: (_, row) => (
    <div style={{ display: 'flex', gap: 6 }}>
      <button className="btn btn--ghost btn--sm">Edit</button>
      <button className="btn btn--outline btn--sm">Materials</button>
    </div>
  )},
];

const validate = (v) => {
  const e = {};
  if (!v.title.trim()) e.title = 'Title is required';
  if (!v.order)        e.order = 'Order is required';
  return e;
};

function InstructorLessons() {
  const [params]          = useSearchParams();
  const courseId          = params.get('courseId');
  const [open, setOpen]   = useState(false);
  const [alert, setAlert] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(courseId || '');

  const { data: coursesData } = useApi(() => courseService.getMine(), { initialData: { courses: [] } });
  const courses               = coursesData?.courses || [];

  const activeCourse = selectedCourse || courses[0]?._id || '';

  const { data, loading, error, refetch } = useApi(
    () => activeCourse ? lessonService.getByCourse(activeCourse) : Promise.resolve({ data: { lessons: [] } }),
    { initialData: { lessons: [] }, deps: [activeCourse] }
  );

  const lessons = data?.lessons || [];

  const { values, errors, loading: saving, apiError, handleChange, handleSubmit, setApiError, reset } = useForm({
    initialValues: { title: '', order: lessons.length + 1, duration: '', description: '', isPublished: true },
    validate,
    onSubmit: async (vals) => {
      await lessonService.create({ ...vals, course: activeCourse, order: Number(vals.order) });
      setAlert({ type: 'success', msg: `Lesson "${vals.title}" created.` });
      setOpen(false);
      reset();
      refetch();
    },
  });

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">Lessons</h1>
        <p className="portal-page__subtitle">Manage course lessons and attach learning materials.</p>
      </div>

      {alert && <Alert type={alert.type} onClose={() => setAlert(null)}>{alert.msg}</Alert>}
      {error  && <Alert type="error">{error}</Alert>}

      {/* Course selector */}
      {courses.length > 1 && (
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <select
            className="form-field__input"
            style={{ maxWidth: 360 }}
            value={activeCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            {courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
          </select>
        </div>
      )}

      <div className="section-toolbar">
        <div className="section-toolbar__right">
          <Button size="sm" onClick={() => setOpen(true)} disabled={!activeCourse}>+ Add Lesson</Button>
        </div>
      </div>

      {loading ? <LoadingSpinner label="Loading lessons..." /> : (
        <Table columns={columns} data={lessons} emptyMsg="No lessons yet. Add your first lesson." />
      )}

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Add Lesson"
        footer={<>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button loading={saving} onClick={handleSubmit}>Save Lesson</Button>
        </>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {apiError && <Alert type="error" onClose={() => setApiError('')}>{apiError}</Alert>}
          <FormField label="Lesson Title" name="title"       value={values.title}       onChange={handleChange} error={errors.title} required />
          <div className="form-card__row">
            <FormField label="Order (#)"  name="order"       type="number" value={values.order}    onChange={handleChange} error={errors.order} required />
            <FormField label="Duration"   name="duration"    value={values.duration}    onChange={handleChange} placeholder="e.g. 45 min" />
          </div>
          <FormField label="Description"  name="description" type="textarea" rows={3} value={values.description} onChange={handleChange} />
        </div>
      </Modal>
    </div>
  );
}

export default InstructorLessons;
