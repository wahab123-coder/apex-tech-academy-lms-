import React, { useState } from 'react';
import Table          from '../../components/ui/Table';
import Button         from '../../components/ui/Button';
import Modal          from '../../components/ui/Modal';
import FormField      from '../../components/ui/FormField';
import Alert          from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import useApi         from '../../hooks/useApi';
import useForm        from '../../hooks/useForm';
import { assignmentService, lessonService, courseService, submissionService } from '../../services';
import '../admin/Portal.css';

const validate = (v) => {
  const e = {};
  if (!v.title.trim()) e.title   = 'Title is required';
  if (!v.lesson)       e.lesson  = 'Select a lesson';
  if (!v.dueDate)      e.dueDate = 'Due date is required';
  return e;
};

function InstructorAssignments() {
  const [open,  setOpen]  = useState(false);
  const [alert, setAlert] = useState(null);

  const { data: coursesData } = useApi(() => courseService.getMine(), { initialData: { courses: [] } });
  const firstCourse = coursesData?.courses?.[0];

  const { data: lessonsData } = useApi(
    () => firstCourse?._id ? lessonService.getByCourse(firstCourse._id) : Promise.resolve({ data: { lessons: [] } }),
    { initialData: { lessons: [] }, deps: [firstCourse?._id] }
  );

  const { data, loading, error, refetch } = useApi(
    () => assignmentService.getAll(),
    { initialData: { assignments: [] } }
  );

  const { data: subData } = useApi(
    () => submissionService.getAll(),
    { initialData: { submissions: [] } }
  );

  const assignments  = data?.assignments  || [];
  const submissions  = subData?.submissions || [];
  const lessons      = lessonsData?.lessons || [];

  const getSubmissionCount = (assignmentId) =>
    submissions.filter((s) => s.assignment?._id === assignmentId || s.assignment === assignmentId).length;

  const columns = [
    { key: 'title',      label: 'Assignment' },
    { key: 'lesson',     label: 'Lesson',    render: (v) => v?.title || '—' },
    { key: 'dueDate',    label: 'Due Date',  render: (v) => new Date(v).toLocaleDateString() },
    { key: '_id',        label: 'Submissions', render: (v) => (
      <span className="badge badge--info">{getSubmissionCount(v)}</span>
    )},
    { key: 'isPublished',label: 'Status',   render: (v) => <span className={`badge badge--${v ? 'success' : 'muted'}`}>{v ? 'Active' : 'Draft'}</span> },
    { key: 'actions',    label: 'Actions',  render: () => (
      <button className="btn btn--primary btn--sm">Review</button>
    )},
  ];

  const { values, errors, loading: saving, apiError, handleChange, handleSubmit, setApiError, reset } = useForm({
    initialValues: { title: '', lesson: '', dueDate: '', instructions: '', maxScore: '100' },
    validate,
    onSubmit: async (vals) => {
      await assignmentService.create({
        ...vals,
        course:    firstCourse?._id,
        maxScore:  Number(vals.maxScore),
      });
      setAlert({ type: 'success', msg: `Assignment "${vals.title}" created.` });
      setOpen(false);
      reset();
      refetch();
    },
  });

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">Assignments</h1>
        <p className="portal-page__subtitle">Create assignments for your course lessons.</p>
      </div>

      {alert && <Alert type={alert.type} onClose={() => setAlert(null)}>{alert.msg}</Alert>}
      {error  && <Alert type="error">{error}</Alert>}

      <div className="section-toolbar">
        <div className="section-toolbar__right">
          <Button size="sm" onClick={() => setOpen(true)}>+ New Assignment</Button>
        </div>
      </div>

      {loading ? <LoadingSpinner label="Loading assignments..." /> : (
        <Table columns={columns} data={assignments} emptyMsg="No assignments yet." />
      )}

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Create Assignment" size="lg"
        footer={<>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button loading={saving} onClick={handleSubmit}>Create</Button>
        </>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {apiError && <Alert type="error" onClose={() => setApiError('')}>{apiError}</Alert>}
          <FormField label="Title *"       name="title"    value={values.title}    onChange={handleChange} error={errors.title} required />
          <FormField label="Lesson *"      name="lesson"   type="select" value={values.lesson} onChange={handleChange} error={errors.lesson} required>
            <option value="">Select lesson</option>
            {lessons.map((l) => <option key={l._id} value={l._id}>{l.order}. {l.title}</option>)}
          </FormField>
          <div className="form-card__row">
            <FormField label="Due Date *"  name="dueDate"  type="date"   value={values.dueDate}  onChange={handleChange} error={errors.dueDate} required />
            <FormField label="Max Score"   name="maxScore" type="number" value={values.maxScore} onChange={handleChange} />
          </div>
          <FormField label="Instructions" name="instructions" type="textarea" rows={5} value={values.instructions} onChange={handleChange} />
        </div>
      </Modal>
    </div>
  );
}

export default InstructorAssignments;
