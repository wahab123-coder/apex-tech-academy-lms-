import React, { useState, useEffect } from 'react';
import { Link }       from 'react-router-dom';
import Card           from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert          from '../../components/ui/Alert';
import Button         from '../../components/ui/Button';
import Modal          from '../../components/ui/Modal';
import FormField      from '../../components/ui/FormField';
import Icon           from '../../components/common/Icons';
import useApi         from '../../hooks/useApi';
import { courseService, curriculumService } from '../../services';
import '../admin/Portal.css';
import './InstructorCurriculum.css';

const TYPE_ICON = {
  lecture: '📖', practical: '💻', assignment: '📌', quiz: '✏️', project: '🔧',
};
const TOPIC_TYPES = ['lecture', 'practical', 'assignment', 'quiz', 'project'];

// ── Inline curriculum manager per course ─────────────────
function CourseCurriculumManager({ courseId, onClose }) {
  const [openWeeks,  setOpenWeeks]  = useState([0]);
  const [weekModal,  setWeekModal]  = useState(null);
  const [topicModal, setTopicModal] = useState(null);
  const [alert,      setAlert]      = useState(null);
  const [weekForm,   setWeekForm]   = useState({ title: '', description: '' });
  const [topicForm,  setTopicForm]  = useState({ title: '', duration: '', type: 'lecture' });
  const [saving,     setSaving]     = useState(false);

  const { data, loading, error, refetch } = useApi(
    () => curriculumService.getByCourse(courseId),
    { initialData: { curriculum: null }, deps: [courseId] }
  );
  const curriculum = data?.curriculum;

  const toggleWeek = (i) =>
    setOpenWeeks((p) => p.includes(i) ? p.filter((x) => x !== i) : [...p, i]);

  const handleAddWeek = async () => {
    if (!weekForm.title.trim()) { setAlert({ type: 'error', msg: 'Week title required.' }); return; }
    setSaving(true);
    try {
      if (weekModal === 'add') {
        await curriculumService.addWeek(courseId, weekForm);
        setAlert({ type: 'success', msg: 'Week added.' });
      } else {
        await curriculumService.updateWeek(courseId, weekModal._id, weekForm);
        setAlert({ type: 'success', msg: 'Week updated.' });
      }
      setWeekModal(null);
      setWeekForm({ title: '', description: '' });
      refetch();
    } catch (err) {
      setAlert({ type: 'error', msg: err.message });
    } finally { setSaving(false); }
  };

  const handleAddTopic = async () => {
    if (!topicForm.title.trim()) { setAlert({ type: 'error', msg: 'Topic title required.' }); return; }
    setSaving(true);
    try {
      await curriculumService.addTopic(courseId, topicModal.weekId, topicForm);
      setAlert({ type: 'success', msg: 'Topic added.' });
      setTopicModal(null);
      setTopicForm({ title: '', duration: '', type: 'lecture' });
      refetch();
    } catch (err) {
      setAlert({ type: 'error', msg: err.message });
    } finally { setSaving(false); }
  };

  const handleDeleteWeek = async (weekId) => {
    if (!window.confirm('Delete this week and all its topics?')) return;
    await curriculumService.deleteWeek(courseId, weekId);
    refetch();
  };

  const handleDeleteTopic = async (weekId, topicId, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    await curriculumService.deleteTopic(courseId, weekId, topicId);
    refetch();
  };

  const totalTopics = curriculum?.weeks?.reduce((s, w) => s + (w.topics?.length || 0), 0) || 0;

  return (
    <div className="instructor-curriculum">
      <div className="instructor-curriculum__header">
        <h3 className="instructor-curriculum__title">Curriculum Builder</h3>
        <button className="instructor-curriculum__close" onClick={onClose}>&times;</button>
      </div>

      {alert && <div style={{ padding: '0 var(--space-lg)' }}><Alert type={alert.type} onClose={() => setAlert(null)}>{alert.msg}</Alert></div>}
      {loading && <div style={{ padding: 'var(--space-lg)' }}><LoadingSpinner label="Loading curriculum..." /></div>}

      {!loading && (
        <div style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {curriculum && (
            <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
              {[{ label: 'Weeks', value: curriculum.weeks?.length || 0 }, { label: 'Topics', value: totalTopics }, { label: 'Hours', value: curriculum.totalHours || '—' }].map((s) => (
                <div key={s.label} style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-sm) var(--space-md)', textAlign: 'center', minWidth: 80 }}>
                  <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold', color: 'var(--color-primary)' }}>{s.value}</p>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{s.label}</p>
                </div>
              ))}
            </div>
          )}

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
              <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>Weekly Breakdown</p>
              <Button size="sm" onClick={() => { setWeekForm({ title: '', description: '' }); setWeekModal('add'); }}>+ Add Week</Button>
            </div>

            {(!curriculum || curriculum.weeks?.length === 0) ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-xl)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                No weeks yet. Click <strong>+ Add Week</strong> to start.
              </div>
            ) : (
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                {[...curriculum.weeks].sort((a, b) => a.weekNumber - b.weekNumber).map((week, i) => (
                  <div key={week._id} style={{ borderBottom: i < curriculum.weeks.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', padding: 'var(--space-sm) var(--space-md)', gap: 'var(--space-sm)', background: openWeeks.includes(i) ? 'rgba(0,212,255,0.04)' : 'var(--color-bg-card)' }}>
                      <button onClick={() => toggleWeek(i)} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
                        <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'bold', color: 'var(--color-primary)', background: 'rgba(0,212,255,0.1)', padding: '2px 8px', borderRadius: 99 }}>W{week.weekNumber}</span>
                        <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>{week.title}</span>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginLeft: 'auto' }}>{week.topics?.length || 0} topics</span>
                      </button>
                      <button className="btn btn--ghost btn--sm" onClick={() => { setWeekForm({ title: week.title, description: week.description || '' }); setWeekModal(week); }} style={{ padding: '2px 8px' }}>Edit</button>
                      <button className="btn btn--outline btn--sm" onClick={() => setTopicModal({ weekId: week._id, weekTitle: week.title })} style={{ padding: '2px 8px' }}>+ Topic</button>
                      <button className="btn btn--danger btn--sm" onClick={() => handleDeleteWeek(week._id)} style={{ padding: '2px 8px' }}>Del</button>
                    </div>

                    {openWeeks.includes(i) && (
                      <div style={{ background: 'var(--color-bg-secondary)', borderTop: '1px solid var(--color-border)' }}>
                        {week.topics?.length === 0 ? (
                          <p style={{ padding: 'var(--space-sm) var(--space-md)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>No topics yet.</p>
                        ) : week.topics?.map((topic) => (
                          <div key={topic._id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', padding: 'var(--space-xs) var(--space-md)', borderBottom: '1px solid var(--color-border)' }}>
                            <span style={{ fontSize: '0.8rem' }}>{TYPE_ICON[topic.type] || '📖'}</span>
                            <span style={{ flex: 1, fontSize: 'var(--font-size-sm)' }}>{topic.title}</span>
                            {topic.duration && <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{topic.duration}</span>}
                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', background: 'var(--color-border)', padding: '1px 6px', borderRadius: 99 }}>{topic.type}</span>
                            <button onClick={() => handleDeleteTopic(week._id, topic._id, topic.title)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '1rem', padding: '0 4px' }}>&times;</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Week Modal */}
      <Modal isOpen={!!weekModal} onClose={() => setWeekModal(null)} title={weekModal === 'add' ? 'Add Week' : 'Edit Week'}
        footer={<><Button variant="ghost" onClick={() => setWeekModal(null)}>Cancel</Button><Button loading={saving} onClick={handleAddWeek}>{weekModal === 'add' ? 'Add' : 'Save'}</Button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <FormField label="Week Title *" name="title" value={weekForm.title} onChange={(e) => setWeekForm(p => ({...p, title: e.target.value}))} required placeholder="e.g. Week 1: Introduction" />
          <FormField label="Description" name="description" type="textarea" rows={2} value={weekForm.description} onChange={(e) => setWeekForm(p => ({...p, description: e.target.value}))} />
        </div>
      </Modal>

      {/* Topic Modal */}
      <Modal isOpen={!!topicModal} onClose={() => setTopicModal(null)} title={`Add Topic — ${topicModal?.weekTitle || ''}`}
        footer={<><Button variant="ghost" onClick={() => setTopicModal(null)}>Cancel</Button><Button loading={saving} onClick={handleAddTopic}>Add Topic</Button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <FormField label="Topic Title *" name="title" value={topicForm.title} onChange={(e) => setTopicForm(p => ({...p, title: e.target.value}))} required placeholder="e.g. HTML Document Structure" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <FormField label="Duration" name="duration" value={topicForm.duration} onChange={(e) => setTopicForm(p => ({...p, duration: e.target.value}))} placeholder="e.g. 2 hours" />
            <div className="form-field">
              <label className="form-field__label">Type</label>
              <select className="form-field__input" value={topicForm.type} onChange={(e) => setTopicForm(p => ({...p, type: e.target.value}))}>
                {TOPIC_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── Main instructor courses page ──────────────────────────
function InstructorCourses() {
  const [curriculumCourse, setCurriculumCourse] = useState(null);
  const [courses,          setCourses]          = useState([]);
  const [loadingCourses,   setLoadingCourses]   = useState(true);
  const [coursesError,     setCoursesError]     = useState(null);

  useEffect(() => {
    setLoadingCourses(true);
    courseService.getMine()
      .then((res) => { setCourses(res.data?.courses || res.courses || []); setCoursesError(null); })
      .catch((err) => setCoursesError(err.message || 'Failed to load courses'))
      .finally(() => setLoadingCourses(false));
  }, []);

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">My Courses</h1>
        <p className="portal-page__subtitle">Courses assigned to you by the academy admin.</p>
      </div>

      {coursesError && <Alert type="error">{coursesError}</Alert>}
      {loadingCourses && <LoadingSpinner label="Loading courses..." />}

      {!loadingCourses && !coursesError && courses.length === 0 && (
        <div className="portal-empty">
          <p className="portal-empty__title">No courses assigned yet</p>
          <p className="portal-empty__text">
            Contact the admin to have a course assigned to you, or courses you registered to teach will appear here.
          </p>
        </div>
      )}

      {!loadingCourses && !coursesError && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {courses.map((c) => (
            <div key={c._id}>
              <Card padding="lg" variant="default">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
                  <div>
                    <h3 style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-base)', marginBottom: 4 }}>{c.title}</h3>
                    {c.category && <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', background: 'var(--color-bg-secondary)', padding: '2px 8px', borderRadius: 99 }}>{c.category}</span>}
                  </div>
                  <span className={`badge badge--${c.isPublished ? 'success' : 'muted'}`}>
                    {c.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>

                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-md)', lineHeight: 'var(--line-height-relaxed)' }}>
                  {c.description?.slice(0, 150)}{c.description?.length > 150 ? '…' : ''}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)', textAlign: 'center' }}>
                  {[
                    { label: 'Students', value: c.totalStudents || 0, color: 'var(--color-primary)' },
                    { label: 'Level',    value: c.level,               color: 'var(--color-info)' },
                    { label: 'Duration', value: c.duration || '—',     color: 'var(--color-success)' },
                  ].map((stat) => (
                    <div key={stat.label} style={{ background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', padding: 'var(--space-sm)' }}>
                      <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold', color: stat.color }}>{stat.value}</p>
                      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                  <Link to={`/instructor/lessons?courseId=${c._id}`} className="btn btn--primary btn--sm">
                    Manage Lessons
                  </Link>
                  <Link to={`/instructor/materials`} className="btn btn--outline btn--sm">
                    Upload Materials
                  </Link>
                  <Link to={`/instructor/assignments?courseId=${c._id}`} className="btn btn--outline btn--sm">
                    Assignments
                  </Link>
                  <button
                    className={`btn btn--outline btn--sm ${curriculumCourse === c._id ? 'active' : ''}`}
                    onClick={() => setCurriculumCourse(curriculumCourse === c._id ? null : c._id)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      borderColor: curriculumCourse === c._id ? 'var(--color-primary)' : undefined,
                      color:       curriculumCourse === c._id ? 'var(--color-primary)' : undefined,
                    }}
                  >
                    <Icon name="courses" size={14} />
                    {curriculumCourse === c._id ? 'Hide Curriculum' : 'Build Curriculum'}
                  </button>
                </div>
              </Card>

              {curriculumCourse === c._id && (
                <div style={{ border: '1px solid var(--color-primary)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginTop: -8, borderTop: 'none', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
                  <CourseCurriculumManager courseId={c._id} onClose={() => setCurriculumCourse(null)} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default InstructorCourses;
