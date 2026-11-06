import React, { useState } from 'react';
import Table          from '../../components/ui/Table';
import Button         from '../../components/ui/Button';
import Modal          from '../../components/ui/Modal';
import FormField      from '../../components/ui/FormField';
import Alert          from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import useApi         from '../../hooks/useApi';
import useForm        from '../../hooks/useForm';
import { enrollmentService, userService, courseService } from '../../services';
import './Portal.css';

const columns = [
  { key: 'student',    label: 'Student',  render: (v) => v ? `${v.firstName} ${v.lastName}` : '—' },
  { key: 'course',     label: 'Course',   render: (v) => v?.title || '—' },
  { key: 'enrolledAt', label: 'Enrolled', render: (v) => new Date(v).toLocaleDateString() },
  { key: 'status',     label: 'Status',   render: (v) => <span className={`badge badge--${v === 'Active' ? 'success' : v === 'Completed' ? 'info' : 'error'}`}>{v}</span> },
  { key: 'actions',    label: 'Actions',  render: () => <button className="btn btn--ghost btn--sm">View</button> },
];

function AdminEnrollments() {
  const [search, setSearch] = useState('');
  const [open,   setOpen]   = useState(false);
  const [alert,  setAlert]  = useState(null);

  const { data, loading, error, refetch } = useApi(
    () => enrollmentService.getAll(),
    { initialData: { enrollments: [] } }
  );

  const { data: studentsData } = useApi(() => userService.getAll({ role: 'student', limit: 100 }), { initialData: { users: [] } });
  const { data: coursesData  } = useApi(() => courseService.getAll({ published: true }),             { initialData: { courses: [] } });

  const enrollments = data?.enrollments || [];
  const students    = studentsData?.users || [];
  const courses     = coursesData?.courses || [];

  const filtered = enrollments.filter((e) =>
    `${e.student?.firstName} ${e.student?.lastName} ${e.course?.title}`.toLowerCase()
      .includes(search.toLowerCase())
  );

  const { values, loading: saving, apiError, handleChange, handleSubmit, setApiError, reset } = useForm({
    initialValues: { studentId: '', courseId: '' },
    onSubmit: async (vals) => {
      await enrollmentService.enroll(vals);
      setAlert({ type: 'success', msg: 'Student enrolled successfully.' });
      setOpen(false);
      reset();
      refetch();
    },
  });

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">Enrollments</h1>
        <p className="portal-page__subtitle">View and manage student course enrollments.</p>
      </div>

      {alert && <Alert type={alert.type} onClose={() => setAlert(null)}>{alert.msg}</Alert>}
      {error  && <Alert type="error">{error}</Alert>}

      <div className="section-toolbar">
        <div className="section-toolbar__left">
          <input className="portal-search" type="search" placeholder="Search by student or course..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="section-toolbar__right">
          <Button size="sm" onClick={() => setOpen(true)}>+ Enroll Student</Button>
        </div>
      </div>

      {loading ? <LoadingSpinner label="Loading enrollments..." /> : (
        <Table columns={columns} data={filtered} emptyMsg="No enrollments found." />
      )}

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Enroll Student in Course"
        footer={<>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button loading={saving} onClick={handleSubmit}>Enroll</Button>
        </>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {apiError && <Alert type="error" onClose={() => setApiError('')}>{apiError}</Alert>}
          <FormField label="Student" name="studentId" type="select" value={values.studentId} onChange={handleChange} required>
            <option value="">Select student</option>
            {students.map((s) => <option key={s._id} value={s._id}>{s.firstName} {s.lastName}</option>)}
          </FormField>
          <FormField label="Course" name="courseId" type="select" value={values.courseId} onChange={handleChange} required>
            <option value="">Select course</option>
            {courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
          </FormField>
        </div>
      </Modal>
    </div>
  );
}

export default AdminEnrollments;
