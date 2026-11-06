import React, { useState, useRef } from 'react';
import FormField      from '../../components/ui/FormField';
import Button         from '../../components/ui/Button';
import Alert          from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import useApi         from '../../hooks/useApi';
import { submissionService, assignmentService } from '../../services';
import '../admin/Portal.css';

function StudentSubmissions() {
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [notes,              setNotes]              = useState('');
  const [submitting,         setSubmitting]         = useState(false);
  const [alert,              setAlert]              = useState(null);
  const fileRef = useRef(null);

  const { data: assignData }                = useApi(() => assignmentService.getAll(),  { initialData: { assignments: [] } });
  const { data: subData, loading, refetch } = useApi(() => submissionService.getAll(), { initialData: { submissions: [] } });

  const assignments = assignData?.assignments || [];
  const submissions = subData?.submissions   || [];

  // Only show assignments not yet submitted
  const pendingAssignments = assignments.filter((a) =>
    !submissions.some((s) => s.assignment?._id === a._id || s.assignment === a._id)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAssignment) { setAlert({ type: 'error', msg: 'Please select an assignment.' }); return; }
    const file = fileRef.current?.files?.[0];
    if (!file) { setAlert({ type: 'error', msg: 'Please attach a file.' }); return; }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('file',         file);
      fd.append('assignmentId', selectedAssignment);
      fd.append('notes',        notes);
      await submissionService.submit(fd);
      setAlert({ type: 'success', msg: 'Assignment submitted successfully!' });
      setSelectedAssignment('');
      setNotes('');
      if (fileRef.current) fileRef.current.value = '';
      refetch();
    } catch (err) {
      setAlert({ type: 'error', msg: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">Submissions</h1>
        <p className="portal-page__subtitle">Submit your assignments and view graded work.</p>
      </div>

      {alert && <Alert type={alert.type} onClose={() => setAlert(null)}>{alert.msg}</Alert>}

      {/* Submit form */}
      <div className="form-card">
        <h3 style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-md)' }}>
          Submit an Assignment
        </h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="form-field">
            <label className="form-field__label">Assignment *</label>
            <select className="form-field__input" value={selectedAssignment} onChange={(e) => setSelectedAssignment(e.target.value)} required>
              <option value="">Select assignment</option>
              {pendingAssignments.map((a) => (
                <option key={a._id} value={a._id}>{a.title} — Due: {new Date(a.dueDate).toLocaleDateString()}</option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label className="form-field__label">File Upload *</label>
            <input ref={fileRef} type="file" className="form-field__input" accept=".pdf,.zip,.html,.js,.docx" required />
          </div>
          <FormField label="Notes (optional)" name="notes" type="textarea" rows={3}
            value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="Any notes for your instructor..." />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" loading={submitting}>Submit Assignment</Button>
          </div>
        </form>
      </div>

      {/* Past submissions */}
      <div>
        <h3 style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-md)' }}>
          My Submissions
        </h3>

        {loading ? <LoadingSpinner label="Loading..." /> : submissions.length === 0 ? (
          <div className="portal-empty">
            <div className="portal-empty__icon">📤</div>
            <p className="portal-empty__text">No submissions yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {submissions.map((s) => (
              <div key={s._id} className="form-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                  <div>
                    <h4 style={{ fontWeight: 'var(--font-weight-semibold)' }}>{s.assignment?.title || 'Assignment'}</h4>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>
                      Submitted: {new Date(s.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                    <span className={`badge badge--${s.status === 'Graded' ? 'success' : 'warning'}`}>{s.status}</span>
                    {s.grade !== null && <span className="badge badge--success">Grade: {s.grade}%</span>}
                  </div>
                </div>
                {s.feedback && (
                  <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-md)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--color-success)' }}>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 4 }}>Instructor Feedback</p>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{s.feedback}</p>
                  </div>
                )}
                {s.notes && (
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-sm)' }}>
                    Your notes: {s.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentSubmissions;
