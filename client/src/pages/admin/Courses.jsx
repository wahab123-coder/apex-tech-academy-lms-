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
import { courseService, userService } from '../../services';
import './Portal.css';

const columns = [
  { key: 'title',         label: 'Course Title' },
  { key: 'instructor',    label: 'Instructor',  render: (v) => v ? `${v.firstName} ${v.lastName}` : '—' },
  { key: 'level',         label: 'Level',       render: (v) => <span className="badge badge--info">{v}</span> },
  { key: 'duration',      label: 'Duration' },
  { key: 'totalStudents', label: 'Students',    render: (v) => <span className="badge badge--primary">{v}</span> },
  { key: 'price',         label: 'Price',       render: (v) => v === 0 ? 'Free' : `₦${v.toLocaleString()}` },
  { key: 'isPublished',   label: 'Status',      render: (v) => <span className={`badge badge--${v ? 'success' : 'muted'}`}>{v ? 'Published' : 'Draft'}</span> },
  { key: 'actions',       label: 'Actions',     render: (_, row) => (
    <div style={{ display: 'flex', gap: 6 }}>
      <button className="btn btn--ghost btn--sm">Edit</button>
    </div>
  )},
];

const validate = (v) => {
  const e = {};
  if (!v.title.trim())       e.title       = 'Required';
  if (!v.instructor)         e.instructor  = 'Select or create an instructor';
  if (!v.description.trim()) e.description = 'Required';
  return e;
};

function AdminCourses() {
  const [search,       setSearch]      = useState('');
  const [addOpen,      setAddOpen]     = useState(false);
  const [success,      setSuccess]     = useState('');
  const [showNewInstr, setShowNewInstr]= useState(false);
  const [instrForm,    setInstrForm]   = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [instrSaving,  setInstrSaving] = useState(false);
  const [instrAlert,   setInstrAlert]  = useState(null);

  // Load all courses
  const { data, loading, error, refetch } = useApi(
    () => courseService.getAll({ published: 'all' }),
    { initialData: { courses: [] } }
  );

  // Load instructors
  const { data: instrData, refetch: refetchInstructors } = useApi(
    () => userService.getAll({ role: 'instructor', limit: 200 }),
    { initialData: { users: [] } }
  );

  const courses     = data?.courses     || [];
  const instructors = instrData?.users  || [];
  const filtered    = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  // Course creation form
  const { values, errors, loading: saving, apiError, handleChange, handleSubmit, setApiError, reset } = useForm({
    initialValues: {
      title: '', instructor: '', level: 'Beginner',
      category: '', duration: '', price: '0',
      description: '', isPublished: false,
    },
    validate,
    onSubmit: async (vals) => {
      await courseService.create({ ...vals, price: Number(vals.price) });
      setSuccess(`Course "${vals.title}" created successfully.`);
      setAddOpen(false);
      setShowNewInstr(false);
      reset();
      refetch();
    },
  });

  // Create instructor inline
  const handleCreateInstructor = async () => {
    if (!instrForm.firstName.trim() || !instrForm.lastName.trim() || !instrForm.email.trim()) {
      setInstrAlert({ type: 'error', msg: 'First name, last name and email are required.' });
      return;
    }
    setInstrSaving(true);
    setInstrAlert(null);
    try {
      // Register with instructor role
      const res = await api.post('/auth/register', {
        firstName: instrForm.firstName.trim(),
        lastName:  instrForm.lastName.trim(),
        email:     instrForm.email.trim(),
        phone:     instrForm.phone.trim() || '+234 000 000 0000',
        password:  'Instructor@2026!',
        role:      'instructor',
      });
      const newUser = res.data?.user;
      if (newUser) {
        setInstrAlert({ type: 'success', msg: `${instrForm.firstName} ${instrForm.lastName} added as instructor. Default password: Instructor@2026!` });
        setInstrForm({ firstName: '', lastName: '', email: '', phone: '' });
        setShowNewInstr(false);
        await refetchInstructors();
        // Auto-select the new instructor
        handleChange({ target: { name: 'instructor', value: newUser._id } });
      }
    } catch (err) {
      setInstrAlert({ type: 'error', msg: err.message || 'Failed to create instructor.' });
    } finally {
      setInstrSaving(false);
    }
  };

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
        <Table columns={columns} data={filtered} emptyMsg="No courses yet. Click '+ New Course' to add one." />
      )}

      {/* ── Create Course Modal ───────────────────────── */}
      <Modal
        isOpen={addOpen}
        onClose={() => { setAddOpen(false); setShowNewInstr(false); setInstrAlert(null); }}
        title="Create New Course"
        size="lg"
        footer={<>
          <Button variant="ghost" onClick={() => { setAddOpen(false); setShowNewInstr(false); }}>Cancel</Button>
          <Button loading={saving} onClick={handleSubmit}>Create Course</Button>
        </>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {apiError && <Alert type="error" onClose={() => setApiError('')}>{apiError}</Alert>}

          <FormField
            label="Course Title *"
            name="title"
            value={values.title}
            onChange={handleChange}
            error={errors.title}
            placeholder="e.g. Web Development Fundamentals"
            required
          />

          {/* Instructor selector + inline create */}
          <div className="form-field">
            <label className="form-field__label">
              Instructor *
              <button
                type="button"
                onClick={() => { setShowNewInstr(!showNewInstr); setInstrAlert(null); }}
                style={{
                  marginLeft: 10, fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-primary)', background: 'none',
                  border: 'none', cursor: 'pointer', textDecoration: 'underline',
                }}
              >
                {showNewInstr ? '← Select existing' : '+ Create new instructor'}
              </button>
            </label>

            {!showNewInstr ? (
              <>
                <select
                  className="form-field__input"
                  name="instructor"
                  value={values.instructor}
                  onChange={handleChange}
                >
                  <option value="">— Select instructor —</option>
                  {instructors.map((i) => (
                    <option key={i._id} value={i._id}>
                      {i.firstName} {i.lastName} ({i.email})
                    </option>
                  ))}
                </select>
                {errors.instructor && (
                  <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-xs)', marginTop: 4 }}>
                    {errors.instructor}
                  </p>
                )}
                {instructors.length === 0 && (
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>
                    No instructors yet — click <strong>"+ Create new instructor"</strong> above to add one.
                  </p>
                )}
              </>
            ) : (
              <div style={{
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-md)',
                display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)',
              }}>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 4 }}>
                  A login account will be created for this instructor. Default password: <strong>Instructor@2026!</strong>
                </p>
                {instrAlert && (
                  <Alert type={instrAlert.type} onClose={() => setInstrAlert(null)}>{instrAlert.msg}</Alert>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)' }}>
                  <FormField
                    label="First Name *"
                    name="firstName"
                    value={instrForm.firstName}
                    onChange={(e) => setInstrForm((p) => ({ ...p, firstName: e.target.value }))}
                    placeholder="e.g. Ahmed"
                  />
                  <FormField
                    label="Last Name *"
                    name="lastName"
                    value={instrForm.lastName}
                    onChange={(e) => setInstrForm((p) => ({ ...p, lastName: e.target.value }))}
                    placeholder="e.g. Aliyu"
                  />
                </div>
                <FormField
                  label="Email Address *"
                  name="email"
                  type="email"
                  value={instrForm.email}
                  onChange={(e) => setInstrForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="instructor@example.com"
                />
                <FormField
                  label="Phone Number"
                  name="phone"
                  value={instrForm.phone}
                  onChange={(e) => setInstrForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+234 800 000 0000"
                />
                <Button size="sm" loading={instrSaving} onClick={handleCreateInstructor}>
                  Create Instructor Account
                </Button>
              </div>
            )}
          </div>

          {/* Course details */}
          <div className="form-card__row">
            <FormField label="Level" name="level" type="select" value={values.level} onChange={handleChange}>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </FormField>
            <FormField label="Category" name="category" value={values.category} onChange={handleChange} placeholder="e.g. Web, Security, Data" />
          </div>
          <div className="form-card__row">
            <FormField label="Duration" name="duration" value={values.duration} onChange={handleChange} placeholder="e.g. 3 months" />
            <FormField label="Price (₦)" name="price" type="number" value={values.price} onChange={handleChange} placeholder="0 for free" />
          </div>
          <div className="form-card__row" style={{ alignItems: 'center' }}>
            <FormField
              label="Description *"
              name="description"
              type="textarea"
              rows={3}
              value={values.description}
              onChange={handleChange}
              error={errors.description}
              placeholder="What will students learn in this course?"
              required
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              id="isPublished"
              checked={values.isPublished}
              onChange={(e) => handleChange({ target: { name: 'isPublished', value: e.target.checked } })}
            />
            <label htmlFor="isPublished" style={{ fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>
              Publish immediately (visible to students on the website)
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default AdminCourses;
