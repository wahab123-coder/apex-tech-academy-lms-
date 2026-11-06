import React, { useState } from 'react';
import Table          from '../../components/ui/Table';
import Modal          from '../../components/ui/Modal';
import FormField      from '../../components/ui/FormField';
import Button         from '../../components/ui/Button';
import Alert          from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import useApi         from '../../hooks/useApi';
import useForm        from '../../hooks/useForm';
import { submissionService } from '../../services';
import '../admin/Portal.css';

function InstructorSubmissions() {
  const [gradeModal, setGradeModal] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [alert,        setAlert]        = useState(null);

  const { data, loading, error, refetch } = useApi(
    () => submissionService.getAll(),
    { initialData: { submissions: [] } }
  );

  const submissions = data?.submissions || [];

  const filtered = statusFilter === 'All'
    ? submissions
    : submissions.filter((s) => s.status === statusFilter);

  const { values, errors, loading: saving, apiError, handleChange, handleSubmit, setApiError, reset } = useForm({
    initialValues: { grade: '', feedback: '' },
    validate: (v) => {
      const e = {};
      if (!v.grade || v.grade < 0 || v.grade > 100) e.grade = 'Grade must be 0–100';
      return e;
    },
    onSubmit: async (vals) => {
      await submissionService.grade(gradeModal._id, {
        grade:    Number(vals.grade),
        feedback: vals.feedback,
      });
      setAlert({ type: 'success', msg: 'Submission graded.' });
      setGradeModal(null);
      reset();
      refetch();
    },
  });

  const columns = [
    { key: 'student',     label: 'Student',    render: (v) => v ? `${v.firstName} ${v.lastName}` : '—' },
    { key: 'assignment',  label: 'Assignment',  render: (v) => v?.title || '—' },
    { key: 'createdAt',   label: 'Submitted',   render: (v) => new Date(v).toLocaleDateString() },
    { key: 'grade',       label: 'Grade',       render: (v) => v !== null ? <span className="badge badge--success">{v}%</span> : <span className="badge badge--warning">Ungraded</span> },
    { key: 'status',      label: 'Status',      render: (v) => <span className={`badge badge--${v === 'Graded' ? 'success' : 'warning'}`}>{v}</span> },
    { key: 'actions',     label: 'Actions',     render: (_, row) => (
      row.status === 'Pending'
        ? <Button size="sm" onClick={() => { setGradeModal(row); reset(); }}>Grade</Button>
        : <button className="btn btn--ghost btn--sm">View</button>
    )},
  ];

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">Student Submissions</h1>
        <p className="portal-page__subtitle">Review and grade student assignment submissions.</p>
      </div>

      {alert && <Alert type={alert.type} onClose={() => setAlert(null)}>{alert.msg}</Alert>}
      {error  && <Alert type="error">{error}</Alert>}

      <div className="section-toolbar">
        <div className="section-toolbar__left">
          {['All','Pending','Graded'].map((s) => (
            <button key={s} className={`filter-btn ${statusFilter === s ? 'active' : ''}`}
              onClick={() => setStatusFilter(s)}>{s}</button>
          ))}
        </div>
      </div>

      {loading ? <LoadingSpinner label="Loading submissions..." /> : (
        <Table columns={columns} data={filtered} emptyMsg="No submissions yet." />
      )}

      {/* Grade Modal */}
      <Modal isOpen={!!gradeModal} onClose={() => setGradeModal(null)} title="Grade Submission"
        footer={<>
          <Button variant="ghost" onClick={() => setGradeModal(null)}>Cancel</Button>
          <Button loading={saving} onClick={handleSubmit}>Submit Grade</Button>
        </>}>
        {gradeModal && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {apiError && <Alert type="error" onClose={() => setApiError('')}>{apiError}</Alert>}
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              Student: <strong>{gradeModal.student?.firstName} {gradeModal.student?.lastName}</strong><br />
              Assignment: <strong>{gradeModal.assignment?.title}</strong>
            </p>
            {gradeModal.notes && (
              <div style={{ background: 'var(--color-bg-secondary)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                <strong>Student notes:</strong> {gradeModal.notes}
              </div>
            )}
            <FormField label="Grade (0–100) *" name="grade" type="number" value={values.grade}
              onChange={handleChange} error={errors.grade} required placeholder="e.g. 85" />
            <FormField label="Feedback"        name="feedback" type="textarea" rows={4}
              value={values.feedback} onChange={handleChange} placeholder="Write feedback for the student..." />
          </div>
        )}
      </Modal>
    </div>
  );
}

export default InstructorSubmissions;
