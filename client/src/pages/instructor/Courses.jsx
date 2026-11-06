import React, { useState } from 'react';
import { Link }          from 'react-router-dom';
import Card              from '../../components/ui/Card';
import LoadingSpinner    from '../../components/ui/LoadingSpinner';
import Alert             from '../../components/ui/Alert';
import Icon              from '../../components/common/Icons';
import useApi            from '../../hooks/useApi';
import useForm           from '../../hooks/useForm';
import Modal             from '../../components/ui/Modal';
import FormField         from '../../components/ui/FormField';
import Button            from '../../components/ui/Button';
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
  const [weekModal,  setWeekModal]  = useState(null); // 'add' | week obj
  const [topicModal, setTopicModal] = useState(null); // { weekId, weekTitle }
  const [alert,      setAlert]      = useState(null);

  const { data, loading, error, refetch } = useApi(
    () => curriculumService.getByCourse(courseId),
    { initialData: { curriculum: null }, deps: [courseId] }
  );
  const curriculum = data?.curriculum;

  const toggleWeek = (i) =>
    setOpenWeeks((p) => p.includes(i) ? p.filter((x) => x !== i) : [...p, i]);

  // Overview form
  const overviewForm = useForm({
    initialValues: {
      overview:   curriculum?.overview   || '',
      totalHours: curriculum?.totalHours || '',
    },
    onSubmit: async (vals) => {
      await curriculumService.update(courseId, vals);
      setAlert({ type: 'success', msg: 'Overview saved.' });
      refetch();
    },
  });

  React.useEffect(() => {
    overviewForm.setValues({
      overview:   curriculum?.overview   || '',
      totalHours: curriculum?.totalHours || '',
    });
  }, [curriculum?._id]);

  // Week form
  const weekForm = useForm({
    initialValues: { title: '', description: '' },
    validate: (v) => (!v.title.trim() ? { title: 'Title is required.' } : {}),
    onSubmit: async (vals) => {
      if (weekModal === 'add') {
        await curriculumService.addWeek(courseId, vals);
        setAlert({ type: 'success', msg: 'Week added.' });
      } else {
        await curriculumService.updateWeek(courseId, weekModal._id, vals);
        setAlert({ type: 'success', msg: 'Week updated.' });
      }
      setWeekModal(null);
      weekForm.reset();
      refetch();
    },
  });

  const openAddWeek = () => { weekForm.setValues({ title: '', description: '' }); setWeekModal('add'); };
  const openEditWeek = (w) => { weekForm.setValues({ title: w.title, description: w.description || '' }); setWeekModal(w); };

  // Topic form
  const topicForm = useForm({
    initialValues: { title: '', duration: '', type: 'lecture' },
    validate: (v) => (!v.title.trim() ? { title: 'Title is required.' } : {}),
    onSubmit: async (vals) => {
      await curriculumService.addTopic(courseId, topicModal.weekId, vals);
      setAlert({ type: 'success', msg: 'Topic added.' });
      setTopicModal(null);
      topicForm.reset();
      refetch();
    },
  });

  const handleDeleteWeek = async (weekId) => {
    if (!window.confirm('Delete this week and all its topics?')) return;
    await curriculumService.deleteWeek(courseId, weekId);
    setAlert({ type: 'success', msg: 'Week deleted.' });
    refetch();
  };

  const handleDeleteTopic = async (weekId, topicId, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    await curriculumService.deleteTopic(courseId, weekId, topicId);
    setAlert({ type: 'success', msg: 'Topic deleted.' });
    refetch();
  };

  const totalTopics = curriculum?.weeks?.reduce((s, w) => s + (w.topics?.length || 0), 0) || 0;

  return (
    <div className="instructor-curriculum">
      <div className="instructor-curriculum__header">
        <h3 className="instructor-curriculum__title">Curriculum Builder</h3>
        <button className="instructor-curriculum__close" onClick={onClose} aria-label="Close">
          &times;
        </button>
      </div>

      {alert && (
        <div style={{ padding: '0 var(--space-lg)' }}>
          <Alert type={alert.type} onClose={() => setAlert(null)}>{alert.msg}</Alert>
        </div>
      )}

      {loading && <div style={{ padding: 'var(--space-lg)' }}><LoadingSpinner label="Loading curriculum..." /></div>}
      {error && !loading && error !== 'Curriculum not found for this course.' && (
        <div style={{ padding: 'var(--space-lg)' }}><Alert type="error">{error}</Alert></div>
      )}

      {!loading && (
        <div style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>

          {/* Stats */}
          {curriculum && (
            <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
              {[
                { label: 'Weeks',  value: curriculum.weeks?.length || 0 },
                { label: 'Topics', value: totalTopics },
                { label: 'Hours',  value: curriculum.totalHours || '—' },
              ].map((s) => (
                <div key={s.label} style={{
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-sm) var(--space-md)',
                  textAlign: 'center', minWidth: 80,
                }}>
                  <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold', color: 'var(--color-primary)' }}>{s.value}</p>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Overview */}
          <div style={{ background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', padding: 'var(--space-md)', borderLeft: '4px solid var(--color-primary)' }}>
            <p style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-primary)', marginBottom: 'var(--space-sm)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Overview
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              <FormField label="Description" name="overview" type="textarea" rows={2}
                value={overviewForm.values.overview} onChange={overviewForm.handleChange}
                placeholder="What students will learn..." />
              <FormField label="Total Hours" name="totalHours"
                value={overviewForm.values.totalHours} onChange={overviewForm.handleChange}
                placeholder="e.g. 120 hours" />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button size="sm" loading={overviewForm.loading} onClick={overviewForm.handleSubmit}>
                  Save Overview
                </Button>
              </div>
            </div>
          </div>

          {/* Weeks */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
              <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
                Weekly Breakdown
              </p>
              <Button size="sm" onClick={openAddWeek}>+ Add Week</Button>
            </div>

            {(!curriculum || curriculum.weeks?.length === 0) ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-xl)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                No weeks yet. Click <strong>+ Add Week</strong> to start.
              </div>
            ) : (
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                {[...curriculum.weeks]
                  .sort((a, b) => a.weekNumber - b.weekNumber)
                  .map((week, i) => (
                    <div key={week._id} style={{ borderBottom: i < curriculum.weeks.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                      {/* Week header */}
                      <div style={{ display: 'flex', alignItems: 'center', padding: 'var(--space-sm) var(--space-md)', gap: 'var(--space-sm)', background: openWeeks.includes(i) ? 'rgba(0,212,255,0.04)' : 'var(--color-bg-card)' }}>
                        <button
                          onClick={() => toggleWeek(i)}
                          style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                        >
                          <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'bold', color: 'var(--color-primary)', background: 'rgba(0,212,255,0.1)', padding: '2px 8px', borderRadius: 99 }}>
                            W{week.weekNumber}
                          </span>
                          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>{week.title}</span>
                          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
                            {week.topics?.length || 0} topics
                          </span>
                        </button>
                        <button className="btn btn--ghost btn--sm" onClick={() => openEditWeek(week)} style={{ padding: '2px 8px' }}>Edit</button>
                        <button className="btn btn--outline btn--sm" onClick={() => setTopicModal({ weekId: week._id, weekTitle: week.title })} style={{ padding: '2px 8px' }}>+ Topic</button>
                        <button className="btn btn--danger btn--sm" onClick={() => handleDeleteWeek(week._id)} style={{ padding: '2px 8px' }}>Del</button>
                      </div>

                      {/* Topics */}
                      {openWeeks.includes(i) && (
                        <div style={{ background: 'var(--color-bg-secondary)', borderTop: '1px solid var(--color-border)' }}>
                          {week.topics?.length === 0 ? (
                            <p style={{ padding: 'var(--space-sm) var(--space-md)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                              No topics yet.
                            </p>
                          ) : week.topics?.map((topic) => (
                            <div key={topic._id} style={{
                              display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
                              padding: 'var(--space-xs) var(--space-md)',
                              borderBottom: '1px solid var(--color-border)',
                            }}>
                              <span style={{ fontSize: '0.8rem' }}>{TYPE_ICON[topic.type] || '📖'}</span>
                              <span style={{ flex: 1, fontSize: 'var(--font-size-sm)' }}>{topic.title}</span>
                              {topic.duration && <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{topic.duration}</span>}
                              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', background: 'var(--color-border)', padding: '1px 6px', borderRadius: 99 }}>{topic.type}</span>
                              <button
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '1rem', padding: '0 4px', lineHeight: 1 }}
                                onClick={() => handleDeleteTopic(week._id, topic._id, topic.title)}
                                title="Delete topic"
                              >
                                &times;
                              </button>
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
      <Modal isOpen={!!weekModal} onClose={() => { setWeekModal(null); weekForm.reset(); }}
        title={weekModal === 'add' ? 'Add Week' : 'Edit Week'}
        footer={<><Button variant="ghost" onClick={() => { setWeekModal(null); weekForm.reset(); }}>Cancel</Button><Button loading={weekForm.loading} onClick={weekForm.handleSubmit}>{weekModal === 'add' ? 'Add' : 'Save'}</Button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <FormField label="Week Title *" name="title" value={weekForm.values.title} onChange={weekForm.handleChange} error={weekForm.errors.title} required placeholder="e.g. Week 1: Introduction to HTML" />
          <FormField label="Description" name="description" type="textarea" rows={2} value={weekForm.values.description} onChange={weekForm.handleChange} />
        </div>
      </Modal>

      {/* Topic Modal */}
      <Modal isOpen={!!topicModal} onClose={() => { setTopicModal(null); topicForm.reset(); }}
        title={`Add Topic — ${topicModal?.weekTitle || ''}`}
        footer={<><Button variant="ghost" onClick={() => { setTopicModal(null); topicForm.reset(); }}>Cancel</Button><Button loading={topicForm.loading} onClick={topicForm.handleSubmit}>Add Topic</Button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <FormField label="Topic Title *" name="title" value={topicForm.values.title} onChange={topicForm.handleChange} error={topicForm.errors.title} required placeholder="e.g. HTML Document Structure" />
          <div className="form-card__row">
            <FormField label="Duration" name="duration" value={topicForm.values.duration} onChange={topicForm.handleChange} placeholder="e.g. 2 hours" />
            <FormField label="Type" name="type" type="select" value={topicForm.values.type} onChange={topicForm.handleChange}>
              {TOPIC_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </FormField>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── COURSE_LEVELS constant (mirrors server/config/constants.js) ──
const COURSE_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

// ── Main instructor courses page ──────────────────────────
function InstructorCourses() {
  const [curriculumCourse, setCurriculumCourse] = useState(null);
  const [addOpen,  setAddOpen]  = useState(false);
  const [adding,   setAdding]   = useState(false);
  const [addAlert, setAddAlert] = useState(null);
  const [courses,  setCourses]  = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [coursesError,   setCoursesError]   = useState(null);

  // Course form state
  const [form, setForm] = useState({
    title: '', description: '', level: 'Beginner',
    category: '', duration: '', price: '',
  });
  const handleFormChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const loadCourses = () => {
    setLoadingCourses(true);
    courseService.getMine()
      .then((res) => { setCourses(res.data?.courses || res.courses || []); setCoursesError(null); })
      .catch((err) => setCoursesError(err.message || 'Failed to load courses'))
      .finally(() => setLoadingCourses(false));
  };

  React.useEffect(() => { loadCourses(); }, []);

  const handleAddCourse = async () => {
    if (!form.title.trim()) { setAddAlert({ type: 'error', msg: 'Course title is required.' }); return; }
    if (!form.description.trim()) { setAddAlert({ type: 'error', msg: 'Course description is required.' }); return; }
    setAdding(true);
    try {
      await courseService.create({
        title:       form.title.trim(),
        description: form.description.trim(),
        level:       form.level,
        category:    form.category.trim(),
        duration:    form.duration.trim(),
        price:       Number(form.price) || 0,
      });
      setAddAlert(null);
      setAddOpen(false);
      setForm({ title: '', description: '', level: 'Beginner', category: '', duration: '', price: '' });
      loadCourses();
    } catch (err) {
      setAddAlert({ type: 'error', msg: err.message || 'Failed to create course.' });
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">My Courses</h1>
        <p className="portal-page__subtitle">Create and manage the courses you teach.</p>
      </div>

      {coursesError && <Alert type="error">{coursesError}</Alert>}
      {loadingCourses && <LoadingSpinner label="Loading courses..." />}

      <div className="section-toolbar" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="section-toolbar__right">
          <Button size="sm" onClick={() => setAddOpen(true)}>+ Create Course</Button>
        </div>
      </div>

      {!loadingCourses && !coursesError && courses.length === 0 && (
        <div className="portal-empty">
          <p className="portal-empty__title">No courses yet</p>
          <p className="portal-empty__text">Click <strong>+ Create Course</strong> to add your first course.</p>
        </div>
      )}

      {/* Add Course Modal */}
      <Modal
        isOpen={addOpen}
        onClose={() => { setAddOpen(false); setAddAlert(null); }}
        title="Create New Course"
        footer={<>
          <Button variant="ghost" onClick={() => { setAddOpen(false); setAddAlert(null); }}>Cancel</Button>
          <Button loading={adding} onClick={handleAddCourse}>Create Course</Button>
        </>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {addAlert && <Alert type={addAlert.type} onClose={() => setAddAlert(null)}>{addAlert.msg}</Alert>}
          <FormField label="Course Title *" name="title" value={form.title} onChange={handleFormChange} placeholder="e.g. Web Development Fundamentals" required />
          <FormField label="Description *" name="description" type="textarea" rows={3} value={form.description} onChange={handleFormChange} placeholder="What students will learn in this course…" required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="form-field">
              <label className="form-field__label">Level</label>
              <select className="form-field__input" name="level" value={form.level} onChange={handleFormChange}>
                {COURSE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <FormField label="Category" name="category" value={form.category} onChange={handleFormChange} placeholder="e.g. Programming" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <FormField label="Duration" name="duration" value={form.duration} onChange={handleFormChange} placeholder="e.g. 3 months" />
            <FormField label="Price (₦)" name="price" type="number" value={form.price} onChange={handleFormChange} placeholder="0 for free" />
          </div>
        </div>
      </Modal>

      {!loadingCourses && !coursesError && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {courses.map((c) => (
            <div key={c._id}>
              <Card padding="lg" variant="default">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
                  <h3 style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-base)' }}>{c.title}</h3>
                  <span className={`badge badge--${c.isPublished ? 'success' : 'muted'}`}>
                    {c.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>

                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-md)', lineHeight: 'var(--line-height-relaxed)' }}>
                  {c.description?.slice(0, 120)}{c.description?.length > 120 ? '…' : ''}
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

              {/* Inline curriculum builder */}
              {curriculumCourse === c._id && (
                <div style={{
                  border: '1px solid var(--color-primary)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  marginTop: -8,
                  borderTop: 'none',
                  borderTopLeftRadius: 0,
                  borderTopRightRadius: 0,
                }}>
                  <CourseCurriculumManager
                    courseId={c._id}
                    onClose={() => setCurriculumCourse(null)}
                  />
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
