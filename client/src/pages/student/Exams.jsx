import React, { useState, useEffect, useRef, useCallback } from 'react';
import Button         from '../../components/ui/Button';
import Alert           from '../../components/ui/Alert';
import LoadingSpinner  from '../../components/ui/LoadingSpinner';
import Modal           from '../../components/ui/Modal';
import useApi          from '../../hooks/useApi';
import examService     from '../../services/examService';
import '../admin/Portal.css';
import './StudentExams.css';

const STATUS_LABELS = {
  'not-started': 'Not Started',
  'in-progress': 'In Progress',
  'submitted':   'Submitted — Pending Grading',
  'graded':      'Graded',
  'passed':      'Passed',
  'failed':      'Failed — Retake Required',
};
const STATUS_COLORS = {
  'not-started': 'muted', 'in-progress': 'info', 'submitted': 'warning',
  'graded': 'info', 'passed': 'success', 'failed': 'error',
};

// ── Exam taking screen ────────────────────────────────────
function ExamRunner({ examData, attemptId, onFinish }) {
  const { exam, startedAt, durationMinutes, mcqAnswers: initialMcq, essayAnswers: initialEssay } = examData;
  const [mcqAnswers, setMcqAnswers]   = useState(initialMcq || new Array(exam.mcqs.length).fill(-1));
  const [essayAnswers, setEssayAnswers] = useState(
    initialEssay?.length > 0
      ? initialEssay
      : exam.essays.map((e) => ({ questionId: e._id, answer: '' }))
  );
  const [timeLeft, setTimeLeft]       = useState(0);
  const [submitting, setSubmitting]   = useState(false);
  const [saved, setSaved]             = useState('');
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [currentSection, setCurrentSection] = useState('mcq'); // 'mcq' | 'essay'
  const saveTimer = useRef(null);

  // Countdown timer
  useEffect(() => {
    const endTime = new Date(startedAt).getTime() + durationMinutes * 60 * 1000;
    const update = () => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        handleSubmit(true);
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-save every 30 seconds
  useEffect(() => {
    saveTimer.current = setInterval(async () => {
      try {
        await examService.saveProgress(exam._id, { mcqAnswers, essayAnswers });
        setSaved('Saved ' + new Date().toLocaleTimeString());
        setTimeout(() => setSaved(''), 2000);
      } catch (_) {}
    }, 30000);
    return () => clearInterval(saveTimer.current);
  }, [mcqAnswers, essayAnswers]);

  const handleMcqSelect = (qIndex, optionIndex) => {
    setMcqAnswers((prev) => {
      const next = [...prev];
      next[qIndex] = optionIndex;
      return next;
    });
  };

  const handleEssayChange = (eIndex, value) => {
    setEssayAnswers((prev) => {
      const next = [...prev];
      if (next[eIndex]) next[eIndex].answer = value;
      return [...next];
    });
  };

  const handleSubmit = useCallback(async (auto = false) => {
    if (saveTimer.current) clearInterval(saveTimer.current);
    setSubmitting(true);
    try {
      const res = await examService.submitExam(exam._id, { mcqAnswers, essayAnswers });
      onFinish(res.data);
    } catch (err) {
      setSubmitting(false);
      alert('Failed to submit: ' + err.message);
    }
  }, [mcqAnswers, essayAnswers, exam._id]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const answeredCount = mcqAnswers.filter((a) => a !== -1).length;
  const isUrgent = timeLeft <= 300; // 5 min

  return (
    <div className="exam-runner">
      {/* Timer bar */}
      <div className={`exam-timer-bar ${isUrgent ? 'urgent' : ''}`}>
        <div className="exam-timer-bar__left">
          <span className="exam-timer-bar__title">{exam.title || 'Final Assessment'}</span>
          <span className="exam-timer-bar__course">{exam.course?.title}</span>
        </div>
        <div className="exam-timer-bar__right">
          {saved && <span className="exam-timer-bar__saved">{saved}</span>}
          <span className={`exam-timer-bar__time ${isUrgent ? 'urgent' : ''}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Section tabs */}
      <div className="exam-tabs">
        <button
          className={`exam-tab ${currentSection === 'mcq' ? 'active' : ''}`}
          onClick={() => setCurrentSection('mcq')}
        >
          Objective ({answeredCount}/{exam.mcqs.length})
        </button>
        <button
          className={`exam-tab ${currentSection === 'essay' ? 'active' : ''}`}
          onClick={() => setCurrentSection('essay')}
        >
          Essay ({exam.essays.length})
        </button>
      </div>

      {/* MCQ Section */}
      {currentSection === 'mcq' && (
        <div className="exam-section">
          <div className="exam-section__header">
            <h2>Multiple Choice Questions</h2>
            <p>60 questions — 1 mark each — Total: 60 marks</p>
          </div>
          <div className="exam-questions">
            {exam.mcqs.map((mcq, i) => (
              <div key={mcq._id} className={`exam-mcq ${mcqAnswers[i] !== -1 ? 'answered' : ''}`}>
                <p className="exam-mcq__num">Question {i + 1}</p>
                <p className="exam-mcq__text">{mcq.question}</p>
                <div className="exam-mcq__options">
                  {mcq.options.map((opt, oi) => (
                    <label key={oi} className={`exam-mcq__option ${mcqAnswers[i] === oi ? 'selected' : ''}`}>
                      <input
                        type="radio" name={`mcq-${i}`}
                        checked={mcqAnswers[i] === oi}
                        onChange={() => handleMcqSelect(i, oi)}
                      />
                      <span className="exam-mcq__option-letter">{String.fromCharCode(65 + oi)}</span>
                      <span className="exam-mcq__option-text">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Essay Section */}
      {currentSection === 'essay' && (
        <div className="exam-section">
          <div className="exam-section__header">
            <h2>Essay Questions</h2>
            <p>Write detailed answers — instructor will grade these</p>
          </div>
          {exam.essays.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', padding: 'var(--space-xl)', textAlign: 'center' }}>No essay questions in this exam.</p>
          ) : (
            <div className="exam-questions">
              {exam.essays.map((essay, i) => (
                <div key={essay._id} className="exam-essay">
                  <p className="exam-essay__num">Essay {i + 1} — {essay.marks} marks</p>
                  <p className="exam-essay__text">{essay.question}</p>
                  <textarea
                    className="exam-essay__textarea"
                    rows={8}
                    placeholder="Write your answer here..."
                    value={essayAnswers[i]?.answer || ''}
                    onChange={(e) => handleEssayChange(i, e.target.value)}
                  />
                  <p className="exam-essay__count">
                    {(essayAnswers[i]?.answer || '').length} characters
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Submit bar */}
      <div className="exam-submit-bar">
        <div className="exam-submit-bar__info">
          <span>Answered: {answeredCount}/{exam.mcqs.length} MCQs</span>
          {exam.essays.length > 0 && (
            <span> · {exam.essays.length} essay{exam.essays.length > 1 ? 's' : ''}</span>
          )}
        </div>
        <Button
          loading={submitting}
          onClick={() => setConfirmSubmit(true)}
          size="md"
        >
          Submit Exam
        </Button>
      </div>

      {/* Confirm Submit Modal */}
      <Modal isOpen={confirmSubmit} onClose={() => setConfirmSubmit(false)} title="Submit Exam?" size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmSubmit(false)}>Cancel</Button>
            <Button loading={submitting} onClick={() => { setConfirmSubmit(false); handleSubmit(false); }}>Submit Now</Button>
          </>
        }
      >
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          You have answered <strong>{answeredCount}</strong> of <strong>{exam.mcqs.length}</strong> multiple choice questions.
          {answeredCount < exam.mcqs.length && ' Some questions are unanswered.'}
          {exam.essays.length > 0 && ` ${exam.essays.length} essay question${exam.essays.length > 1 ? 's' : ''} will be graded by your instructor.`}
        </p>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-sm)' }}>
          Once submitted, you cannot change your answers.
        </p>
      </Modal>
    </div>
  );
}

// ── Main Student Exams Page ───────────────────────────────
function StudentExams() {
  const [activeExam, setActiveExam] = useState(null); // exam data from startExam
  const [submitResult, setSubmitResult] = useState(null);
  const [viewResult, setViewResult] = useState(null); // examId for result view
  const [starting, setStarting] = useState(null);

  const { data, loading, error, refetch } = useApi(
    () => examService.getAvailable(),
    { initialData: { exams: [] } }
  );
  const exams = data?.exams || [];

  const handleStart = async (examId) => {
    setStarting(examId);
    try {
      const res = await examService.startExam(examId);
      setActiveExam(res.data);
    } catch (err) {
      alert(err.message);
    } finally {
      setStarting(null);
    }
  };

  const handleFinish = (result) => {
    setActiveExam(null);
    setSubmitResult(result);
    refetch();
  };

  if (activeExam) {
    return <ExamRunner examData={activeExam} onFinish={handleFinish} />;
  }

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">Final Assessment</h1>
        <p className="portal-page__subtitle">Complete your final assessment to qualify for certification.</p>
      </div>

      {submitResult && (
        <Alert type={submitResult.status === 'passed' ? 'success' : 'info'} onClose={() => setSubmitResult(null)}>
          {submitResult.message}
        </Alert>
      )}

      {loading && <LoadingSpinner label="Loading exams..." />}
      {error   && <Alert type="error">{error}</Alert>}

      {!loading && exams.length === 0 && (
        <div className="portal-empty">
          <div className="portal-empty__icon" style={{ fontSize: '2.5rem' }}>📄</div>
          <p className="portal-empty__title">No assessments available</p>
          <p className="portal-empty__text">Your assessments will appear here when published by the admin.</p>
        </div>
      )}

      {!loading && exams.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {exams.map((exam) => (
            <div key={exam._id} className="exam-card">
              <div className="exam-card__left">
                <h3 className="exam-card__title">{exam.title}</h3>
                <p className="exam-card__course">{exam.course?.title}</p>
                <div className="exam-card__meta">
                  <span>{exam.mcqs?.length || 0} MCQs</span>
                  <span>·</span>
                  <span>{exam.essays?.length || 0} Essays</span>
                  <span>·</span>
                  <span>{exam.durationMinutes} min</span>
                  <span>·</span>
                  <span>Pass: {exam.passingScore}%</span>
                </div>
              </div>
              <div className="exam-card__right">
                <span className={`badge badge--${STATUS_COLORS[exam.attemptStatus] || 'muted'}`}>
                  {STATUS_LABELS[exam.attemptStatus] || exam.attemptStatus}
                </span>
                {exam.score !== null && (
                  <span style={{ fontWeight: 'bold', color: exam.attemptStatus === 'passed' ? 'var(--color-success)' : 'var(--color-error)' }}>
                    {exam.score}%
                  </span>
                )}
                {exam.attemptStatus === 'not-started' && (
                  <Button size="sm" loading={starting === exam._id} onClick={() => handleStart(exam._id)}>
                    Start Exam
                  </Button>
                )}
                {exam.attemptStatus === 'in-progress' && (
                  <Button size="sm" loading={starting === exam._id} onClick={() => handleStart(exam._id)}>
                    Resume
                  </Button>
                )}
                {['passed', 'failed', 'graded'].includes(exam.attemptStatus) && (
                  <Button size="sm" variant="outline" onClick={() => setViewResult(exam._id)}>
                    View Result
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Result modal */}
      {viewResult && (
        <ExamResultModal examId={viewResult} onClose={() => setViewResult(null)} />
      )}
    </div>
  );
}

// ── Result Modal ───────────────────────────────────────────
function ExamResultModal({ examId, onClose }) {
  const { data, loading, error } = useApi(
    () => examService.getResult(examId),
    { initialData: null }
  );
  const result = data?.result;

  return (
    <Modal isOpen={!!examId} onClose={onClose} title="Assessment Result" size="lg"
      footer={<Button variant="ghost" onClick={onClose}>Close</Button>}>
      {loading && <LoadingSpinner label="Loading result..." />}
      {error && <Alert type="error">{error}</Alert>}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {/* Score summary */}
          <div className="exam-result-summary">
            <div className={`exam-result-score ${result.status === 'passed' ? 'pass' : 'fail'}`}>
              {result.percentage !== null ? `${result.percentage}%` : 'Pending'}
            </div>
            <div>
              <p className="exam-result-status">
                {result.status === 'passed' ? 'PASSED' : result.status === 'failed' ? 'FAILED' : 'Pending Grading'}
              </p>
              <p className="exam-result-detail">
                Score: {result.totalScore ?? '—'} / {result.totalMarks} marks
              </p>
              <p className="exam-result-detail">Pass mark: {result.passingScore}%</p>
            </div>
          </div>

          {/* MCQ breakdown */}
          <div className="exam-result-section">
            <h4>Objective Section</h4>
            <p>{result.mcqCorrect} correct out of {result.mcqCount} — {result.mcqScore} marks</p>
          </div>

          {/* Essay breakdown */}
          {result.essayCount > 0 && (
            <div className="exam-result-section">
              <h4>Essay Section</h4>
              {result.essayScore !== null ? (
                <p>{result.essayScore} marks — graded by instructor</p>
              ) : (
                <p style={{ color: 'var(--color-warning)' }}>Pending instructor grading</p>
              )}
            </div>
          )}

          {/* Instructor remarks */}
          {result.remarks && (
            <div className="exam-result-section">
              <h4>Instructor Remarks</h4>
              <p style={{ fontStyle: 'italic', color: 'var(--color-text-secondary)' }}>{result.remarks}</p>
            </div>
          )}

          {/* Auto-submitted notice */}
          {result.autoSubmitted && (
            <Alert type="warning">This exam was auto-submitted when time expired.</Alert>
          )}
        </div>
      )}
    </Modal>
  );
}

export default StudentExams;
