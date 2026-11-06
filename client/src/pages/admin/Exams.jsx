import React, { useState } from 'react';
import Table          from '../../components/ui/Table';
import Button         from '../../components/ui/Button';
import Modal          from '../../components/ui/Modal';
import FormField      from '../../components/ui/FormField';
import Alert          from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import useApi         from '../../hooks/useApi';
import useForm        from '../../hooks/useForm';
import examService    from '../../services/examService';
import { courseService } from '../../services';
import '../admin/Portal.css';
import './Exams.css';

function AdminExams() {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [createOpen,  setCreateOpen]  = useState(false);
  const [manageExam,  setManageExam]  = useState(null);
  const [mcqModal,    setMcqModal]    = useState(false);
  const [essayModal,  setEssayModal]  = useState(false);
  const [alert,       setAlert]       = useState(null);

  const { data: coursesData } = useApi(() => courseService.getAll({ published: 'all' }), { initialData: { courses: [] } });
  const courses = coursesData?.courses || [];

  const { data, loading, error, refetch } = useApi(
    () => examService.getAll(),
    { initialData: { exams: [] } }
  );
  const exams = data?.exams || [];

  // Create exam form
  const createForm = useForm({
    initialValues: { courseId: '', title: 'Final Assessment', passingScore: '50', durationMinutes: '60' },
    validate: (v) => { const e = {}; if (!v.courseId) e.courseId = 'Select a course.'; return e; },
    onSubmit: async (vals) => {
      await examService.create({
        courseId: vals.courseId, title: vals.title,
        passingScore: Number(vals.passingScore), durationMinutes: Number(vals.durationMinutes),
      });
      setAlert({ type: 'success', msg: 'Exam created. Now add questions.' });
      setCreateOpen(false);
      createForm.reset();
      refetch();
    },
  });

  // MCQ form
  const mcqForm = useForm({
    initialValues: { question: '', optA: '', optB: '', optC: '', optD: '', correctAnswer: '0', topic: '' },
    validate: (v) => {
      const e = {};
      if (!v.question.trim()) e.question = 'Question required.';
      if (!v.optA.trim() || !v.optB.trim()) e.optA = 'At least 2 options required.';
      return e;
    },
    onSubmit: async (vals) => {
      const options = [vals.optA, vals.optB, vals.optC, vals.optD].filter((o) => o.trim());
      await examService.addMCQ(manageExam._id, {
        question: vals.question, options,
        correctAnswer: Number(vals.correctAnswer), topic: vals.topic,
      });
      setAlert({ type: 'success', msg: 'MCQ added.' });
      setMcqModal(false);
      mcqForm.reset();
      refreshExam();
    },
  });

  // Essay form
  const essayForm = useForm({
    initialValues: { question: '', marks: '10', topic: '', modelAnswer: '' },
    validate: (v) => { const e = {}; if (!v.question.trim()) e.question = 'Question required.'; return e; },
    onSubmit: async (vals) => {
      await examService.addEssay(manageExam._id, {
        question: vals.question, marks: Number(vals.marks),
        topic: vals.topic, modelAnswer: vals.modelAnswer,
      });
      setAlert({ type: 'success', msg: 'Essay question added.' });
      setEssayModal(false);
      essayForm.reset();
      refreshExam();
    },
  });

  const refreshExam = async () => {
    if (!manageExam) return;
    try {
      const res = await examService.getById(manageExam._id);
      setManageExam(res.data.exam);
    } catch (_) {}
  };

  const handlePublish = async (exam) => {
    await examService.update(exam._id, { isPublished: !exam.isPublished });
    setAlert({ type: 'success', msg: exam.isPublished ? 'Exam unpublished.' : 'Exam published — students can now take it.' });
    refetch();
    if (manageExam?._id === exam._id) refreshExam();
  };

  const handleDeleteMCQ = async (mcqId) => {
    if (!window.confirm('Delete this question?')) return;
    await examService.deleteMCQ(manageExam._id, mcqId);
    setAlert({ type: 'success', msg: 'Question deleted.' });
    refreshExam();
  };

  const handleDeleteEssay = async (essayId) => {
    if (!window.confirm('Delete this essay question?')) return;
    await examService.deleteEssay(manageExam._id, essayId);
    setAlert({ type: 'success', msg: 'Essay deleted.' });
    refreshExam();
  };

  const columns = [
    { key: 'title',   label: 'Exam Title' },
    { key: 'course',  label: 'Course',     render: (v) => v?.title || '—' },
    { key: 'mcqs',    label: 'MCQs',       render: (v) => <span className="badge badge--info">{v?.length || 0} / 60</span> },
    { key: 'essays',  label: 'Essays',     render: (v) => <span className="badge badge--warning">{v?.length || 0}</span> },
    { key: 'durationMinutes', label: 'Duration', render: (v) => `${v} min` },
    { key: 'passingScore',    label: 'Pass %',    render: (v) => `${v}%` },
    { key: 'isPublished',     label: 'Status',     render: (v) => <span className={`badge badge--${v ? 'success' : 'muted'}`}>{v ? 'Published' : 'Draft'}</span> },
    { key: 'actions', label: 'Actions', render: (_, row) => (
      <div style={{ display: 'flex', gap: 6 }}>
        <Button size="sm" variant="outline" onClick={() => setManageExam(row)}>Manage</Button>
        <button className="btn btn--ghost btn--sm" onClick={() => handlePublish(row)}>
          {row.isPublished ? 'Unpublish' : 'Publish'}
        </button>
      </div>
    )},
  ];

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">Assessments</h1>
        <p className="portal-page__subtitle">Create and manage final assessments — 60 MCQs + essay questions per course.</p>
      </div>

      {alert && <Alert type={alert.type} onClose={() => setAlert(null)}>{alert.msg}</Alert>}
      {error  && <Alert type="error">{error}</Alert>}

      <div className="section-toolbar">
        <div className="section-toolbar__right">
          <Button size="sm" onClick={() => setCreateOpen(true)}>+ Create Assessment</Button>
        </div>
      </div>

      {loading ? <LoadingSpinner label="Loading exams..." /> : (
        <Table columns={columns} data={exams} emptyMsg="No exams created yet." />
      )}

      {/* Create Exam Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create Final Assessment"
        footer={<><Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button><Button loading={createForm.loading} onClick={createForm.handleSubmit}>Create</Button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {createForm.apiError && <Alert type="error" onClose={() => createForm.setApiError('')}>{createForm.apiError}</Alert>}
          <FormField label="Course *" name="courseId" type="select" value={createForm.values.courseId} onChange={createForm.handleChange} error={createForm.errors.courseId} required>
            <option value="">Select a course</option>
            {courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
          </FormField>
          <FormField label="Exam Title" name="title" value={createForm.values.title} onChange={createForm.handleChange} />
          <div className="form-card__row">
            <FormField label="Duration (min)" name="durationMinutes" type="number" value={createForm.values.durationMinutes} onChange={createForm.handleChange} />
            <FormField label="Passing Score (%)" name="passingScore" type="number" value={createForm.values.passingScore} onChange={createForm.handleChange} />
          </div>
        </div>
      </Modal>

      {/* Manage Exam Modal — shows MCQs and Essays */}
      <Modal isOpen={!!manageExam} onClose={() => setManageExam(null)} title={manageExam?.title || 'Manage Exam'} size="xl"
        footer={<><Button variant="ghost" onClick={() => setManageExam(null)}>Close</Button></>}>
        {manageExam && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
              <div className="exam-stat"><span className="exam-stat__value">{manageExam.mcqs?.length || 0}</span><span className="exam-stat__label">MCQs (of 60)</span></div>
              <div className="exam-stat"><span className="exam-stat__value">{manageExam.essays?.length || 0}</span><span className="exam-stat__label">Essays</span></div>
              <div className="exam-stat"><span className="exam-stat__value">{manageExam.durationMinutes}min</span><span className="exam-stat__label">Duration</span></div>
              <div className="exam-stat"><span className="exam-stat__value">{manageExam.passingScore}%</span><span className="exam-stat__label">Pass Mark</span></div>
            </div>

            {/* MCQ Section */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)' }}>Multiple Choice Questions</h3>
                <Button size="sm" onClick={() => { mcqForm.reset(); setMcqModal(true); }}>+ Add MCQ</Button>
              </div>
              {manageExam.mcqs?.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', padding: 'var(--space-md)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>No MCQs yet. Add questions from the course curriculum.</p>
              ) : (
                <div className="exam-question-list">
                  {manageExam.mcqs.map((mcq, i) => (
                    <div key={mcq._id} className="exam-question-item">
                      <div className="exam-question-item__header">
                        <span className="exam-question-item__num">Q{i + 1}</span>
                        <span className="exam-question-item__text">{mcq.question}</span>
                        <button className="exam-question-item__delete" onClick={() => handleDeleteMCQ(mcq._id)} title="Delete">&times;</button>
                      </div>
                      <div className="exam-question-item__options">
                        {mcq.options.map((opt, oi) => (
                          <span key={oi} className={`exam-option ${oi === mcq.correctAnswer ? 'correct' : ''}`}>
                            {String.fromCharCode(65 + oi)}. {opt}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Essay Section */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)' }}>Essay Questions</h3>
                <Button size="sm" onClick={() => { essayForm.reset(); setEssayModal(true); }}>+ Add Essay</Button>
              </div>
              {manageExam.essays?.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', padding: 'var(--space-md)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>No essay questions yet.</p>
              ) : (
                <div className="exam-question-list">
                  {manageExam.essays.map((essay, i) => (
                    <div key={essay._id} className="exam-question-item">
                      <div className="exam-question-item__header">
                        <span className="exam-question-item__num">E{i + 1}</span>
                        <span className="exam-question-item__text">{essay.question}</span>
                        <span className="badge badge--warning" style={{ marginRight: 8 }}>{essay.marks} marks</span>
                        <button className="exam-question-item__delete" onClick={() => handleDeleteEssay(essay._id)} title="Delete">&times;</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </Modal>

      {/* Add MCQ Modal */}
      <Modal isOpen={mcqModal} onClose={() => setMcqModal(false)} title="Add Multiple Choice Question" size="lg"
        footer={<><Button variant="ghost" onClick={() => setMcqModal(false)}>Cancel</Button><Button loading={mcqForm.loading} onClick={mcqForm.handleSubmit}>Add Question</Button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {mcqForm.apiError && <Alert type="error" onClose={() => mcqForm.setApiError('')}>{mcqForm.apiError}</Alert>}
          <FormField label="Question *" name="question" type="textarea" rows={2} value={mcqForm.values.question} onChange={mcqForm.handleChange} error={mcqForm.errors.question} required placeholder="Enter the question..." />
          <FormField label="Option A" name="optA" value={mcqForm.values.optA} onChange={mcqForm.handleChange} placeholder="First option" />
          <FormField label="Option B" name="optB" value={mcqForm.values.optB} onChange={mcqForm.handleChange} placeholder="Second option" />
          <FormField label="Option C" name="optC" value={mcqForm.values.optC} onChange={mcqForm.handleChange} placeholder="Third option (optional)" />
          <FormField label="Option D" name="optD" value={mcqForm.values.optD} onChange={mcqForm.handleChange} placeholder="Fourth option (optional)" />
          <FormField label="Correct Answer" name="correctAnswer" type="select" value={mcqForm.values.correctAnswer} onChange={mcqForm.handleChange}>
            <option value="0">Option A</option><option value="1">Option B</option><option value="2">Option C</option><option value="3">Option D</option>
          </FormField>
          <FormField label="Curriculum Topic (optional)" name="topic" value={mcqForm.values.topic} onChange={mcqForm.handleChange} placeholder="Which curriculum topic this relates to" />
        </div>
      </Modal>

      {/* Add Essay Modal */}
      <Modal isOpen={essayModal} onClose={() => setEssayModal(false)} title="Add Essay Question" size="lg"
        footer={<><Button variant="ghost" onClick={() => setEssayModal(false)}>Cancel</Button><Button loading={essayForm.loading} onClick={essayForm.handleSubmit}>Add Essay</Button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {essayForm.apiError && <Alert type="error" onClose={() => essayForm.setApiError('')}>{essayForm.apiError}</Alert>}
          <FormField label="Essay Question *" name="question" type="textarea" rows={3} value={essayForm.values.question} onChange={essayForm.handleChange} error={essayForm.errors.question} required placeholder="Enter the essay question..." />
          <div className="form-card__row">
            <FormField label="Marks" name="marks" type="number" value={essayForm.values.marks} onChange={essayForm.handleChange} />
            <FormField label="Curriculum Topic" name="topic" value={essayForm.values.topic} onChange={essayForm.handleChange} />
          </div>
          <FormField label="Model Answer (for grading reference)" name="modelAnswer" type="textarea" rows={4} value={essayForm.values.modelAnswer} onChange={essayForm.handleChange} placeholder="Key points expected in the answer..." />
        </div>
      </Modal>
    </div>
  );
}

export default AdminExams;
