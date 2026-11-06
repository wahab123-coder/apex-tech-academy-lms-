import React, { useState } from 'react';
import Table          from '../../components/ui/Table';
import Button         from '../../components/ui/Button';
import Modal          from '../../components/ui/Modal';
import FormField      from '../../components/ui/FormField';
import Alert          from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import useApi         from '../../hooks/useApi';
import { submissionService } from '../../services';
import './Portal.css';

const statusColor = { Pending: 'warning', Graded: 'success' };

function AdminSubmissions() {
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [gradeModal,   setGradeModal]   = useState(null);
  const [grade,        setGrade]        = useState('');
  const [feedback,     setFeedback]     = useState('');
  const [saving,       setSaving]       = useState(false);
  const [alert,        setAlert]        = useState(null);

  const { data, loading, error, refetch } = useApi(
    () => submissionService.getAll(),
    { initialData: { submissions: [] } }
  );

  const submissions = data?.submissions || [];

  const filtered = submissions.filter((s) => {
    const name = `${s.student?.firstName} ${s.student?.lastName} ${s.assignment?.title}`.toLowerCase();
    const matchSearch = name.includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleGrade = async () => {
    if (!grade || grade < 0 || grade > 100) {
      setAlert({ type: 'error', msg: 'Grade must be between 0 and 100.' });
      return;
    }
    setSaving(true);
    try {
      await submissionService.grade(gradeModal._id, {
        grade:    Number(grade),
        feedback: feedback,
      });
      setAlert({ type: 'success', msg: 'Submission graded successfully.' });
      setGradeModal(null);
      setGrade('');
      setFeedback('');
      refetch();
    } catch (err) {
      setAlert({ type: 'error', msg: err.message });
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: 'student',
      label: 'Student',
      render: (v) => v ? `${v.firstName} ${v.lastName}` : '—',
    },
    {
      key: 'assignment',
      label: 'Assignment',
      render: (v) => v?.title || '—',
    },
    {
      key: 'course',
      label: 'Course',
      render: (v) => v?.title || '—',
    },
    {
      key: 'createdAt',
      label: 'Submitted',
      render: (v) => v ? new Date(v).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
      }) : '—',
    },
    {
      key: 'grade',
      label: 'Grade',
      render: (v) => v !== null && v !== undefined
        ? <span className="badge badge--success">{v}%</span>
        : <span className="badge badge--muted">Ungraded</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => (
        <span className={`badge badge--${statusColor[v] || 'muted'}`}>{v}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 6 }}>
          {row.status === 'Pending' ? (
            <Button
              size="sm"
              onClick={() => { setGradeModal(row); setGrade(''); setFeedback(''); }}
            >
              Grade
            </Button>
          ) : (
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => { setGradeModal(row); setGrade(String(row.grade)); setFeedback(row.feedback || ''); }}
            >
              View
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">Submissions</h1>
        <p className="portal-page__subtitle">
          Review and grade all student assignment submissions across all courses.
        </p>
      </div>

      {alert && <Alert type={alert.type} onClose={() => setAlert(null)}>{alert.msg}</Alert>}
      {error  && <Alert type="error">{error}</Alert>}

      {/* Stats */}
      <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
        {[
          { label: 'Total',   value: submissions.length,                                color: 'primary' },
          { label: 'Pending', value: submissions.filter(s => s.status === 'Pending').length, color: 'warning' },
          { label: 'Graded',  value: submissions.filter(s => s.status === 'Graded').length,  color: 'success' },
        ].map((s) => (
          <div key={s.label} style={{
            background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)', padding: 'var(--space-md)', textAlign: 'center', minWidth: 100,
          }}>
            <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'bold', color: `var(--color-${s.color})` }}>
              {s.value}
            </p>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <div className="section-toolbar">
        <div className="section-toolbar__left">
          <input
            className="portal-search"
            type="search"
            placeholder="Search by student or assignment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {['All', 'Pending', 'Graded'].map((s) => (
            <button
              key={s}
              className={`filter-btn ${statusFilter === s ? 'active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading submissions..." />
      ) : (
        <Table
          columns={columns}
          data={filtered}
          emptyMsg="No submissions found."
        />
      )}

      {/* Grade Modal */}
      <Modal
        isOpen={!!gradeModal}
        onClose={() => setGradeModal(null)}
        title={gradeModal?.status === 'Graded' ? 'View Submission' : 'Grade Submission'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setGradeModal(null)}>Close</Button>
            {gradeModal?.status === 'Pending' && (
              <Button loading={saving} onClick={handleGrade}>Submit Grade</Button>
            )}
          </>
        }
      >
        {gradeModal && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {alert?.type === 'error' && <Alert type="error" onClose={() => setAlert(null)}>{alert.msg}</Alert>}

            {/* Submission info */}
            <div style={{
              background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)',
              padding: 'var(--space-md)', borderLeft: '4px solid var(--color-primary)',
            }}>
              <p style={{ fontSize: 'var(--font-size-sm)', marginBottom: 4 }}>
                <strong>Student:</strong> {gradeModal.student?.firstName} {gradeModal.student?.lastName}
              </p>
              <p style={{ fontSize: 'var(--font-size-sm)', marginBottom: 4 }}>
                <strong>Assignment:</strong> {gradeModal.assignment?.title}
              </p>
              <p style={{ fontSize: 'var(--font-size-sm)' }}>
                <strong>Submitted:</strong> {new Date(gradeModal.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

            {/* Student notes */}
            {gradeModal.notes && (
              <div>
                <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 4 }}>
                  Student Notes:
                </p>
                <p style={{
                  background: 'var(--color-bg-secondary)', padding: 'var(--space-sm) var(--space-md)',
                  borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-secondary)', fontStyle: 'italic',
                }}>
                  {gradeModal.notes}
                </p>
              </div>
            )}

            {/* Grading fields */}
            <FormField
              label="Grade (0–100)"
              name="grade"
              type="number"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="Enter score (0–100)"
              disabled={gradeModal.status === 'Graded'}
            />
            <FormField
              label="Feedback to Student"
              name="feedback"
              type="textarea"
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Write constructive feedback for the student..."
              disabled={gradeModal.status === 'Graded'}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AdminSubmissions;
