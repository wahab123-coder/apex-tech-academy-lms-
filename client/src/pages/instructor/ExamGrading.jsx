import React, { useState } from 'react';
import Table          from '../../components/ui/Table';
import Button         from '../../components/ui/Button';
import Modal          from '../../components/ui/Modal';
import FormField      from '../../components/ui/FormField';
import Alert          from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import useApi         from '../../hooks/useApi';
import examService    from '../../services/examService';
import '../admin/Portal.css';

const STATUS_COLOR = {
  'in-progress': 'info', submitted: 'warning',
  graded: 'info', passed: 'success', failed: 'error',
};

function ExamGrading() {
  const [selectedExam, setSelectedExam] = useState('');
  const [gradeAttempt, setGradeAttempt] = useState(null);
  const [essayGrades, setEssayGrades] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  const { data: examsData } = useApi(() => examService.getAll(), { initialData: { exams: [] } });
  const exams = examsData?.exams || [];

  const { data: attemptsData, loading, error, refetch } = useApi(
    () => selectedExam
      ? examService.getAttempts(selectedExam)
      : Promise.resolve({ data: { attempts: [] } }),
    { initialData: { attempts: [] }, deps: [selectedExam] }
  );
  const attempts = attemptsData?.attempts || [];

  const openGrader = (attempt) => {
    setGradeAttempt(attempt);
    setRemarks(attempt.remarks || '');
    setEssayGrades(
      attempt.essayAnswers?.map((ea) => ({
        questionId: ea.questionId,
        answer: ea.answer,
        marks: ea.marks || 0,
        feedback: ea.feedback || '',
      })) || []
    );
  };

  const handleGrade = async () => {
    setSaving(true);
    try {
      await examService.gradeAttempt(gradeAttempt._id, { essayGrades, remarks });
      setAlert({ type: 'success', msg: 'Graded successfully.' });
      setGradeAttempt(null);
      refetch();
    } catch (err) {
      setAlert({ type: 'error', msg: err.message });
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'student', label: 'Student', render: (v) => v ? `${v.firstName} ${v.lastName}` : '—' },
    { key: 'status', label: 'Status', render: (v) => <span className={`badge badge--${STATUS_COLOR[v] || 'muted'}`}>{v}</span> },
    { key: 'mcqScore', label: 'MCQ Score', render: (v) => `${v || 0} / 60` },
    { key: 'essayScore', label: 'Essay', render: (v) => v !== null ? `${v} marks` : 'Pending' },
    { key: 'percentage', label: 'Total', render: (v) => v !== null ? <strong>{v}%</strong> : '—' },
    { key: 'submittedAt', label: 'Submitted', render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
    { key: 'actions', label: 'Actions', render: (_, row) =>
      row.status === 'submitted'
        ? <Button size="sm" onClick={() => openGrader(row)}>Grade Essays</Button>
        : <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
            {row.status === 'in-progress' ? 'In progress' : 'Graded'}
          </span>
    },
  ];

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">Assessment Grading</h1>
        <p className="portal-page__subtitle">Grade essay answers and finalize student assessment results.</p>
      </div>

      {alert && <Alert type={alert.type} onClose={() => setAlert(null)}>{alert.msg}</Alert>}

      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <label className="form-field__label">Select Exam</label>
        <select className="form-field__input" style={{ maxWidth: 420 }} value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)}>
          <option value="">— Choose an assessment —</option>
          {exams.map((ex) => <option key={ex._id} value={ex._id}>{ex.title} — {ex.course?.title}</option>)}
        </select>
      </div>

      {!selectedExam ? (
        <div className="portal-empty">
          <div className="portal-empty__icon" style={{ fontSize: '2.5rem' }}>📝</div>
          <p className="portal-empty__title">Select an assessment above</p>
          <p className="portal-empty__text">Choose an assessment to view student submissions for grading.</p>
        </div>
      ) : loading ? (
        <LoadingSpinner label="Loading submissions..." />
      ) : (
        <Table columns={columns} data={attempts} emptyMsg="No student attempts yet." />
      )}

      {/* Grading Modal */}
      <Modal isOpen={!!gradeAttempt} onClose={() => setGradeAttempt(null)}
        title={`Grade — ${gradeAttempt?.student?.firstName} ${gradeAttempt?.student?.lastName}`}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setGradeAttempt(null)}>Cancel</Button>
            <Button loading={saving} onClick={handleGrade}>Submit Grades</Button>
          </>
        }
      >
        {gradeAttempt && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {/* MCQ summary */}
            <div style={{ background: 'var(--color-bg-secondary)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--color-primary)' }}>
              <p style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)' }}>
                Objective: {gradeAttempt.mcqCorrect} / 60 correct — {gradeAttempt.mcqScore} marks
              </p>
            </div>

            {/* Essay grading */}
            {essayGrades.map((eg, i) => (
              <div key={i} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-md)' }}>
                <p style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-xs)' }}>
                  Essay {i + 1}
                </p>
                <div style={{ background: 'var(--color-bg-secondary)', padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--space-sm)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>
                  {eg.answer || 'No answer provided.'}
                </div>
                <div className="form-card__row">
                  <FormField label="Marks" name={`marks-${i}`} type="number"
                    value={String(eg.marks)}
                    onChange={(e) => setEssayGrades((prev) => {
                      const next = [...prev];
                      next[i] = { ...next[i], marks: Number(e.target.value) };
                      return next;
                    })}
                  />
                </div>
                <FormField label="Feedback (optional)" name={`feedback-${i}`} type="textarea" rows={2}
                  value={eg.feedback}
                  onChange={(e) => setEssayGrades((prev) => {
                    const next = [...prev];
                    next[i] = { ...next[i], feedback: e.target.value };
                    return next;
                  })}
                />
              </div>
            ))}

            {/* Overall remarks */}
            <FormField label="Overall Remarks" name="remarks" type="textarea" rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="General feedback for the student..."
            />
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ExamGrading;
