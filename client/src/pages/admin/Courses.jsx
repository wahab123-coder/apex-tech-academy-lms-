import React, { useState } from 'react';
import Table          from '../../components/ui/Table';
import Button         from '../../components/ui/Button';
import Modal          from '../../components/ui/Modal';
import FormField      from '../../components/ui/FormField';
import Alert          from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import useApi         from '../../hooks/useApi';
import useForm        from '../../hooks/useForm';
import { courseService, userService } from '../../services';
import './Portal.css';

const columns = [
  { key: 'title',       label: 'Course Title' },
  { key: 'instructor',  label: 'Instructor',  render: (v) => v ? `${v.firstName} ${v.lastName}` : '—' },
  { key: 'level',       label: 'Level',       render: (v) => <span className="badge badge--info">{v}</span> },
  { key: 'duration',    label: 'Duration' },
  { key: 'totalStudents', label: 'Students',  render: (v) => <span className="badge badge--primary">{v}</span> },
  { key: 'price',       label: 'Price',       render: (v) => v === 0 ? 'Free' : `$${v}` },
  { key: 'isPublished', label: 'Status',      render: (v) => <span className={`badge badge--${v ? 'success' : 'muted'}`}>{v ? 'Published' : 'Draft'}</span> },
  { key: 'actions',     label: 'Actions',     render: (_, row) => (
    <div style={{ display: 'flex', gap: 6 }}>
      <button className="btn btn--ghost btn--sm">Edit</button>
    </div>
  )},
];

const validate = (v) => {
  const e = {};
  if (!v.title.trim())       e.title      = 'Required';
  if (!v.instructor)         e.instructor = 'Required';
  if (!v.description.trim()) e.description= 'Required';
  return e;
};

function AdminCourses() {
  const [search, setSearch]   = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [success, setSuccess] = useState('');

  const { data, loading, error, refetch } = useApi(
    () => courseService.getAll({ published: 'all' }),
    { initialData: { courses: [] } }
  );

  const { data: instrData } = useApi(
    () => userService.getAll({ role: 'instructor', limit: 100 }),
    { initialData: { users: [] } }
  );

  const courses     = data?.courses || [];
  const instructors = instrData?.users || [];

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const { values, errors, loading: saving, apiError, handleChange, handleSubmit, setApiError, reset } = useForm({
    initialValues: { title: '', instructor: '', level: 'Beginner', category: '', duration: '', price: '0', description: '', isPublished: false },
    validate,
    onSubmit: async (vals) => {
      await courseService.create({ ...vals, price: Number(vals.price) });
      setSuccess(`Course "${vals.title}" created.`);
      setAddOpen(false);
      reset();
      refetch();
    },
  });

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">Courses</h1>
        <p className="portal-page__subtitle">Create and manage all academy courses.</p>
      </div>

      {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}
      {error   && <Alert type="error">{error}</Alert>}

      <div className="section-toolbar">
        <div className="section-toolbar__left">
          <input className="portal-search" type="search" placeholder="Search courses..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="section-toolbar__right">
          <Button size="sm" onClick={() => setAddOpen(true)}>+ New Course</Button>
        </div>
      </div>

      {loading ? <LoadingSpinner label="Loading courses..." /> : (
        <Table columns={columns} data={filtered} emptyMsg="No courses found." />
      )}

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Create New Course" size="lg"
        footer={<>
          <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button loading={saving} onClick={handleSubmit}>Create Course</Button>
        </>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {apiError && <Alert type="error" onClose={() => setApiError('')}>{apiError}</Alert>}
          <FormField label="Course Title" name="title" value={values.title} onChange={handleChange} error={errors.title} required />
          <FormField label="Instructor" name="instructor" type="select" value={values.instructor} onChange={handleChange} error={errors.instructor} required>
            <option value="">Select instructor</option>
            {instructors.map((i) => <option key={i._id} value={i._id}>{i.firstName} {i.lastName}</option>)}
          </FormField>
          <div className="form-card__row">
            <FormField label="Level" name="level" type="select" value={values.level} onChange={handleChange}>
              <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
            </FormField>
            <FormField label="Category" name="category" value={values.category} onChange={handleChange} placeholder="e.g. Web, Security" />
          </div>
          <div className="form-card__row">
            <FormField label="Duration" name="duration" value={values.duration} onChange={handleChange} placeholder="e.g. 3 months" />
            <FormField label="Price (USD)" name="price" type="number" value={values.price} onChange={handleChange} />
          </div>
          <FormField label="Description" name="description" type="textarea" rows={4} value={values.description} onChange={handleChange} error={errors.description} required />
        </div>
      </Modal>
    </div>
  );
}

export default AdminCourses;
