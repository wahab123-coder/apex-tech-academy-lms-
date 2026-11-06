import React from 'react';
import { Link }       from 'react-router-dom';
import Alert          from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import useApi         from '../../hooks/useApi';
import { assignmentService, submissionService } from '../../services';
import '../admin/Portal.css';

function StudentAssignments() {
  const { data: assignData, loading, error } = useApi(
    () => assignmentService.getAll(),
    { initialData: { assignments: [] } }
  );

  const { data: subData } = useApi(
    () => submissionService.getAll(),
    { initialData: { submissions: [] } }
  );

  const assignments = assignData?.assignments || [];
  const submissions = subData?.submissions   || [];

  const getStatus = (assignment) => {
    const sub = submissions.find((s) => s.assignment?._id === assignment._id || s.assignment === assignment._id);
    if (!sub) return new Date(assignment.dueDate) < new Date() ? 'Overdue' : 'Pending';
    return sub.status === 'Graded' ? 'Graded' : 'Submitted';
  };

  const getGrade = (assignmentId) => {
    const sub = submissions.find((s) => s.assignment?._id === assignmentId || s.assignment === assignmentId);
    return sub?.grade ?? null;
  };

  const statusColor = { Pending: 'warning', Submitted: 'info', Graded: 'success', Overdue: 'error' };

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">Assignments</h1>
        <p className="portal-page__subtitle">Your course assignments and submission status.</p>
      </div>

      {error   && <Alert type="error">{error}</Alert>}
      {loading && <LoadingSpinner label="Loading assignments..." />}

      {!loading && assignments.length === 0 && (
        <div className="portal-empty">
          <div className="portal-empty__icon">📌</div>
          <p className="portal-empty__title">No assignments yet</p>
          <p className="portal-empty__text">Your instructors haven't posted any assignments yet.</p>
        </div>
      )}

      {!loading && assignments.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {assignments.map((a) => {
            const status = getStatus(a);
            const grade  = getGrade(a._id);
            return (
              <div key={a._id} style={{
                background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)', padding: 'var(--space-lg)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: 'var(--space-md)', flexWrap: 'wrap',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-md)', flex: 1 }}>
                  <div style={{ width: 44, height: 44, background: 'rgba(0,212,255,0.1)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>📌</div>
                  <div>
                    <h3 style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-base)', marginBottom: 4 }}>{a.title}</h3>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                      {a.course?.title} · Due: {new Date(a.dueDate).toLocaleDateString()}
                      {grade !== null && <> · <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>Grade: {grade}%</span></>}
                    </p>
                    {a.instructions && (
                      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: 4, maxWidth: 500 }}>
                        {a.instructions.slice(0, 100)}{a.instructions.length > 100 ? '…' : ''}
                      </p>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <span className={`badge badge--${statusColor[status]}`}>{status}</span>
                  {(status === 'Pending' || status === 'Overdue') && (
                    <Link to="/student/submissions" className="btn btn--primary btn--sm">Submit</Link>
                  )}
                  {(status === 'Submitted' || status === 'Graded') && (
                    <Link to="/student/submissions" className="btn btn--ghost btn--sm">View</Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default StudentAssignments;
