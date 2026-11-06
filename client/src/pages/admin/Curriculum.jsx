import React, { useState } from 'react';
import Button         from '../../components/ui/Button';
import Modal          from '../../components/ui/Modal';
import FormField      from '../../components/ui/FormField';
import Alert          from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import useApi         from '../../hooks/useApi';
import useForm        from '../../hooks/useForm';
import curriculumService from '../../services/curriculumService';
import { courseService } from '../../services';
import './Portal.css';
import './Curriculum.css';

const TOPIC_TYPES = ['lecture', 'practical', 'assignment', 'quiz', 'project'];
const TYPE_COLORS = {
  lecture:    'primary',
  practical:  'success',
  assignment: 'warning',
  quiz:       'info',
  project:    'error',
};

function AdminCurriculum() {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [alert,          setAlert]          = useState(null);

  // Modals
  const [weekModal,  setWeekModal]  = useState(null); // null | 'add' | week object (edit)
  const [topicModal, setTopicModal] = useState(null); // null | { weekId, weekTitle }
  const [delWeek,    setDelWeek]    = useState(null); // week id
  const [delTopic,   setDelTopic]   = useState(null); // { weekId, topicId, title }

  // Fetch courses
  const { data: coursesData } = useApi(
    () => courseService.getAll({ published: 'all' }),
    { initialData: { courses: [] } }
  );
  const courses = coursesData?.courses || [];

  // Fetch curriculum for selected course
  const {
    data: currData,
    loading,
    error,
    refetch,
    setData: setCurrData,
  } = useApi(
    () => selectedCourse
      ? curriculumService.getByCourse(selectedCourse)
      : Promise.resolve({ data: { curriculum: null } }),
    { initialData: { curriculum: null }, deps: [selectedCourse] }
  );
  const curriculum = currData?.curriculum || null;

  // ── Overview form ─────────────────────────────────────────
  const overviewForm = useForm({
    initialValues: {
      overview:   curriculum?.overview   || '',
      totalHours: curriculum?.totalHours || '',
    },
    onSubmit: async (vals) => {
      await curriculumService.update(selectedCourse, vals);
      setAlert({ type: 'success', msg: 'Overview saved.' });
      refetch();
    },
  });

  // Sync overview form when curriculum loads
  React.useEffect(() => {
    overviewForm.setValues({
      overview:   curriculum?.overview   || '',
      totalHours: curriculum?.totalHours || '',
    });
  }, [curriculum?._id]);

  // ── Add / Edit Week form ──────────────────────────────────
  const weekForm = useForm({
    initialValues: { title: '', description: '' },
    validate: (v) => (!v.title.trim() ? { title: 'Week title is required.' } : {}),
    onSubmit: async (vals) => {
      if (weekModal === 'add') {
        await curriculumService.addWeek(selectedCourse, vals);
        setAlert({ type: 'success', msg: 'Week added.' });
      } else {
        await curriculumService.updateWeek(selectedCourse, weekModal._id, vals);
        setAlert({ type: 'success', msg: 'Week updated.' });
      }
      setWeekModal(null);
      weekForm.reset();
      refetch();
    },
  });

  const openAddWeek = () => {
    weekForm.setValues({ title: '', description: '' });
    setWeekModal('add');
  };

  const openEditWeek = (week) => {
    weekForm.setValues({ title: week.title, description: week.description || '' });
    setWeekModal(week);
  };

  // ── Add Topic form ─────────────────────────────────────────
  const topicForm = useForm({
    initialValues: { title: '', duration: '', type: 'lecture' },
    validate: (v) => (!v.title.trim() ? { title: 'Topic title is required.' } : {}),
    onSubmit: async (vals) => {
      await curriculumService.addTopic(selectedCourse, topicModal.weekId, vals);
      setAlert({ type: 'success', msg: 'Topic added.' });
      setTopicModal(null);
      topicForm.reset();
      refetch();
    },
  });

  const openAddTopic = (week) => {
    topicForm.setValues({ title: '', duration: '', type: 'lecture' });
    setTopicModal({ weekId: week._id, weekTitle: week.title });
  };

  // ── Delete handlers ────────────────────────────────────────
  const [deleting, setDeleting] = useState(false);

  const handleDeleteWeek = async () => {
    setDeleting(true);
    try {
      await curriculumService.deleteWeek(selectedCourse, delWeek);
      setAlert({ type: 'success', msg: 'Week deleted.' });
      setDelWeek(null);
      refetch();
    } catch (err) {
      setAlert({ type: 'error', msg: err.message });
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteTopic = async () => {
    setDeleting(true);
    try {
      await curriculumService.deleteTopic(selectedCourse, delTopic.weekId, delTopic.topicId);
      setAlert({ type: 'success', msg: `"${delTopic.title}" removed.` });
      setDelTopic(null);
      refetch();
    } catch (err) {
      setAlert({ type: 'error', msg: err.message });
    } finally {
      setDeleting(false);
    }
  };

  const totalTopics = curriculum?.weeks?.reduce((s, w) => s + (w.topics?.length || 0), 0) || 0;

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">Curriculum Management</h1>
        <p className="portal-page__subtitle">
          Build and manage weekly course outlines with topics for each programme.
        </p>
      </div>

      {alert && <Alert type={alert.type} onClose={() => setAlert(null)}>{alert.msg}</Alert>}

      {/* Course selector */}
      <div className="curriculum-course-select">
        <label className="form-field__label" htmlFor="course-select">
          Select Course to Edit Curriculum
        </label>
        <select
          id="course-select"
          className="form-field__input"
          style={{ maxWidth: 420 }}
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
        >
          <option value="">— Choose a course —</option>
          {courses.map((c) => (
            <option key={c._id} value={c._id}>{c.title}</option>
          ))}
        </select>
      </div>

      {/* No course selected */}
      {!selectedCourse && (
        <div className="portal-empty">
          <div className="portal-empty__icon" style={{ fontSize: '2.5rem' }}>📚</div>
          <p className="portal-empty__title">Select a course above</p>
          <p className="portal-empty__text">Choose a course to view or build its curriculum.</p>
        </div>
      )}

      {/* Loading */}
      {selectedCourse && loading && <LoadingSpinner label="Loading curriculum..." />}

      {/* Error */}
      {selectedCourse && error && !loading && error !== 'Curriculum not found for this course.' && (
        <Alert type="error">{error}</Alert>
      )}

      {/* Curriculum editor */}
      {selectedCourse && !loading && (
        <>
          {/* ── Overview ── */}
          <div className="curriculum-section">
            <div className="curriculum-section__header">
              <h2 className="curriculum-section__title">Course Overview</h2>
            </div>
            <div className="form-card">
              {overviewForm.apiError && (
                <Alert type="error" onClose={() => overviewForm.setApiError('')}>
                  {overviewForm.apiError}
                </Alert>
              )}
              <FormField
                label="Overview / Description"
                name="overview"
                type="textarea"
                rows={3}
                value={overviewForm.values.overview}
                onChange={overviewForm.handleChange}
                placeholder="Describe what students will learn in this course..."
              />
              <FormField
                label="Total Hours"
                name="totalHours"
                value={overviewForm.values.totalHours}
                onChange={overviewForm.handleChange}
                placeholder="e.g. 120 hours"
              />
              <div className="form-card__actions">
                <Button
                  size="sm"
                  loading={overviewForm.loading}
                  onClick={overviewForm.handleSubmit}
                >
                  Save Overview
                </Button>
              </div>
            </div>
          </div>

          {/* ── Stats row ── */}
          {curriculum && (
            <div className="curriculum-stats">
              <div className="curriculum-stat">
                <span className="curriculum-stat__value">{curriculum.weeks?.length || 0}</span>
                <span className="curriculum-stat__label">Weeks</span>
              </div>
              <div className="curriculum-stat">
                <span className="curriculum-stat__value">{totalTopics}</span>
                <span className="curriculum-stat__label">Topics</span>
              </div>
              <div className="curriculum-stat">
                <span className="curriculum-stat__value">{curriculum.totalHours || '—'}</span>
                <span className="curriculum-stat__label">Total Hours</span>
              </div>
            </div>
          )}

          {/* ── Weeks ── */}
          <div className="curriculum-section">
            <div className="curriculum-section__header">
              <h2 className="curriculum-section__title">
                Weekly Breakdown
                {curriculum?.weeks?.length > 0 && (
                  <span className="curriculum-section__count">
                    {curriculum.weeks.length} weeks
                  </span>
                )}
              </h2>
              <Button size="sm" onClick={openAddWeek}>+ Add Week</Button>
            </div>

            {(!curriculum || curriculum.weeks?.length === 0) ? (
              <div className="curriculum-empty">
                <p>No weeks yet. Click <strong>+ Add Week</strong> to start building the curriculum.</p>
              </div>
            ) : (
              <div className="weeks-list">
                {[...curriculum.weeks]
                  .sort((a, b) => a.weekNumber - b.weekNumber)
                  .map((week) => (
                    <div key={week._id} className="week-card">
                      {/* Week header */}
                      <div className="week-card__header">
                        <div className="week-card__header-left">
                          <div className="week-card__number">W{week.weekNumber}</div>
                          <div>
                            <h3 className="week-card__title">{week.title}</h3>
                            {week.description && (
                              <p className="week-card__desc">{week.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="week-card__actions">
                          <span className="badge badge--info" style={{ marginRight: 8 }}>
                            {week.topics?.length || 0} topics
                          </span>
                          <button
                            className="btn btn--ghost btn--sm"
                            onClick={() => openEditWeek(week)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn--outline btn--sm"
                            onClick={() => openAddTopic(week)}
                          >
                            + Topic
                          </button>
                          <button
                            className="btn btn--danger btn--sm"
                            onClick={() => setDelWeek(week._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Topics */}
                      {week.topics?.length > 0 && (
                        <div className="topics-list">
                          {week.topics.map((topic, ti) => (
                            <div key={topic._id} className="topic-row">
                              <div className="topic-row__left">
                                <span className="topic-row__num">{ti + 1}</span>
                                <div>
                                  <p className="topic-row__title">{topic.title}</p>
                                  <div className="topic-row__meta">
                                    <span className={`badge badge--${TYPE_COLORS[topic.type] || 'muted'}`}>
                                      {topic.type}
                                    </span>
                                    {topic.duration && (
                                      <span className="topic-row__duration">{topic.duration}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <button
                                className="topic-row__delete"
                                onClick={() => setDelTopic({
                                  weekId:  week._id,
                                  topicId: topic._id,
                                  title:   topic.title,
                                })}
                                aria-label={`Delete topic: ${topic.title}`}
                                title="Delete topic"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {week.topics?.length === 0 && (
                        <div className="week-card__no-topics">
                          No topics yet —{' '}
                          <button className="btn btn--ghost btn--sm" onClick={() => openAddTopic(week)}>
                            Add first topic
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Add / Edit Week Modal ── */}
      <Modal
        isOpen={!!weekModal}
        onClose={() => { setWeekModal(null); weekForm.reset(); }}
        title={weekModal === 'add' ? 'Add New Week' : `Edit Week`}
        footer={
          <>
            <Button variant="ghost" onClick={() => { setWeekModal(null); weekForm.reset(); }}>Cancel</Button>
            <Button loading={weekForm.loading} onClick={weekForm.handleSubmit}>
              {weekModal === 'add' ? 'Add Week' : 'Save Changes'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {weekForm.apiError && (
            <Alert type="error" onClose={() => weekForm.setApiError('')}>{weekForm.apiError}</Alert>
          )}
          <FormField
            label="Week Title *"
            name="title"
            value={weekForm.values.title}
            onChange={weekForm.handleChange}
            error={weekForm.errors.title}
            required
            placeholder="e.g. Week 1: Introduction to HTML & CSS"
          />
          <FormField
            label="Description (optional)"
            name="description"
            type="textarea"
            rows={3}
            value={weekForm.values.description}
            onChange={weekForm.handleChange}
            placeholder="Brief overview of what this week covers..."
          />
        </div>
      </Modal>

      {/* ── Add Topic Modal ── */}
      <Modal
        isOpen={!!topicModal}
        onClose={() => { setTopicModal(null); topicForm.reset(); }}
        title={`Add Topic — ${topicModal?.weekTitle || ''}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => { setTopicModal(null); topicForm.reset(); }}>Cancel</Button>
            <Button loading={topicForm.loading} onClick={topicForm.handleSubmit}>Add Topic</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {topicForm.apiError && (
            <Alert type="error" onClose={() => topicForm.setApiError('')}>{topicForm.apiError}</Alert>
          )}
          <FormField
            label="Topic Title *"
            name="title"
            value={topicForm.values.title}
            onChange={topicForm.handleChange}
            error={topicForm.errors.title}
            required
            placeholder="e.g. HTML Document Structure"
          />
          <div className="form-card__row">
            <FormField
              label="Duration"
              name="duration"
              value={topicForm.values.duration}
              onChange={topicForm.handleChange}
              placeholder="e.g. 2 hours, 45 mins"
            />
            <FormField
              label="Type"
              name="type"
              type="select"
              value={topicForm.values.type}
              onChange={topicForm.handleChange}
            >
              {TOPIC_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </FormField>
          </div>
        </div>
      </Modal>

      {/* ── Delete Week Confirm ── */}
      <Modal
        isOpen={!!delWeek}
        onClose={() => setDelWeek(null)}
        title="Delete Week"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDelWeek(null)}>Cancel</Button>
            <Button variant="danger" loading={deleting} onClick={handleDeleteWeek}>
              Delete Week
            </Button>
          </>
        }
      >
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          Are you sure you want to delete this week and all its topics? This cannot be undone.
        </p>
      </Modal>

      {/* ── Delete Topic Confirm ── */}
      <Modal
        isOpen={!!delTopic}
        onClose={() => setDelTopic(null)}
        title="Delete Topic"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDelTopic(null)}>Cancel</Button>
            <Button variant="danger" loading={deleting} onClick={handleDeleteTopic}>
              Delete Topic
            </Button>
          </>
        }
      >
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          Delete <strong>"{delTopic?.title}"</strong>? This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}

export default AdminCurriculum;
