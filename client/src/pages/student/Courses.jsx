import React, { useState } from 'react';
import { Link }          from 'react-router-dom';
import Card              from '../../components/ui/Card';
import Alert             from '../../components/ui/Alert';
import LoadingSpinner    from '../../components/ui/LoadingSpinner';
import Icon              from '../../components/common/Icons';
import useApi            from '../../hooks/useApi';
import { enrollmentService, progressService, curriculumService } from '../../services';
import '../admin/Portal.css';
import './StudentCourses.css';

const TYPE_ICON = {
  lecture:    '📖',
  practical:  '💻',
  assignment: '📌',
  quiz:       '✏️',
  project:    '🔧',
};

// ── Per-course curriculum accordion ──────────────────────
function CourseCurriculum({ courseId }) {
  const [openWeeks, setOpenWeeks] = useState([]);

  const { data, loading } = useApi(
    () => curriculumService.getByCourse(courseId),
    { initialData: { curriculum: null }, deps: [courseId] }
  );

  const curriculum = data?.curriculum;

  const toggleWeek = (i) =>
    setOpenWeeks((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );

  if (loading) return (
    <div style={{ padding: 'var(--space-md)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
      Loading curriculum...
    </div>
  );

  if (!curriculum || !curriculum.weeks?.length) return (
    <div style={{ padding: 'var(--space-md)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
      Curriculum not yet available for this course.
    </div>
  );

  return (
    <div className="student-curriculum">
      <div className="student-curriculum__header">
        <span className="student-curriculum__title">Course Curriculum</span>
        <span className="student-curriculum__meta">
          {curriculum.weeks.length} weeks
          {curriculum.totalHours && ` · ${curriculum.totalHours}`}
        </span>
      </div>

      <div className="student-curriculum__weeks">
        {[...curriculum.weeks]
          .sort((a, b) => a.weekNumber - b.weekNumber)
          .map((week, i) => (
            <div key={week._id} className="student-curriculum__week">
              {/* Week header */}
              <button
                className={`student-curriculum__week-header ${openWeeks.includes(i) ? 'open' : ''}`}
                onClick={() => toggleWeek(i)}
                aria-expanded={openWeeks.includes(i)}
              >
                <div className="student-curriculum__week-left">
                  <span className="student-curriculum__week-num">W{week.weekNumber}</span>
                  <span className="student-curriculum__week-title">{week.title}</span>
                </div>
                <div className="student-curriculum__week-right">
                  <span className="student-curriculum__week-count">
                    {week.topics?.length || 0} topics
                  </span>
                  <svg
                    className="student-curriculum__chevron"
                    width="14" height="14" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor"
                    strokeWidth="2.5" strokeLinecap="round"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </button>

              {/* Topics */}
              {openWeeks.includes(i) && (
                <div className="student-curriculum__topics">
                  {week.description && (
                    <p className="student-curriculum__week-desc">{week.description}</p>
                  )}
                  {week.topics?.map((topic) => (
                    <div key={topic._id} className="student-curriculum__topic">
                      <span className="student-curriculum__topic-icon">
                        {TYPE_ICON[topic.type] || '📖'}
                      </span>
                      <span className="student-curriculum__topic-title">{topic.title}</span>
                      <div className="student-curriculum__topic-meta">
                        {topic.type && (
                          <span className="student-curriculum__topic-type">{topic.type}</span>
                        )}
                        {topic.duration && (
                          <span className="student-curriculum__topic-duration">{topic.duration}</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!week.topics || week.topics.length === 0) && (
                    <p style={{ padding: 'var(--space-sm) var(--space-md)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                      Topics coming soon.
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────
function StudentCourses() {
  const [expandedCurriculum, setExpandedCurriculum] = useState(null);

  const { data: enrollData,   loading: l1, error } = useApi(
    () => enrollmentService.getAll(),
    { initialData: { enrollments: [] } }
  );
  const { data: progressData, loading: l2 } = useApi(
    () => progressService.getAll(),
    { initialData: [] }
  );

  const enrollments = enrollData?.enrollments || [];
  const progress    = Array.isArray(progressData) ? progressData : progressData?.progress || [];
  const loading     = l1 || l2;

  const getProgress = (courseId) => {
    const p = progress.find((p) => p.course?._id === courseId || p.course === courseId);
    return p
      ? { pct: p.progressPercentage, completed: p.completedLessons?.length || 0, done: p.isCompleted }
      : { pct: 0, completed: 0, done: false };
  };

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">My Courses</h1>
        <p className="portal-page__subtitle">Courses you are currently enrolled in.</p>
      </div>

      {error   && <Alert type="error">{error}</Alert>}
      {loading && <LoadingSpinner label="Loading courses..." />}

      {!loading && enrollments.length === 0 && (
        <div className="portal-empty">
          <div className="portal-empty__icon" style={{ fontSize: '2.5rem' }}>📚</div>
          <p className="portal-empty__title">No courses yet</p>
          <p className="portal-empty__text">
            You haven't been enrolled in any courses. Apply for admission to get started.
          </p>
          <Link
            to="/student/admission"
            className="btn btn--primary btn--sm"
            style={{ marginTop: 'var(--space-md)' }}
          >
            Apply for Admission
          </Link>
        </div>
      )}

      {!loading && enrollments.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {enrollments.map((e) => {
            const course = e.course;
            const { pct, completed, done } = getProgress(course?._id);
            const curriculumOpen = expandedCurriculum === e._id;

            return (
              <Card key={e._id} padding="none" variant="default">
                {/* Course info */}
                <div style={{ padding: 'var(--space-lg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-xs)' }}>
                        <h3 style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-base)' }}>
                          {course?.title}
                        </h3>
                        <span className={`badge badge--${done ? 'success' : e.status === 'Active' ? 'info' : 'muted'}`}>
                          {done ? 'Completed' : e.status}
                        </span>
                      </div>
                      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-md)' }}>
                        {course?.level} · {course?.duration}
                      </p>

                      {/* Progress bar */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                            {completed} lessons completed
                          </span>
                          <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                            {pct}%
                          </span>
                        </div>
                        <div style={{ height: 8, background: 'var(--color-border)', borderRadius: 99 }}>
                          <div style={{
                            height: '100%',
                            width: `${pct}%`,
                            background: done ? 'var(--color-success)' : 'var(--gradient-accent)',
                            borderRadius: 99,
                            transition: 'width 0.5s ease',
                          }} />
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', flexShrink: 0 }}>
                      <Link
                        to={`/student/lessons?courseId=${course?._id}`}
                        className="btn btn--primary btn--sm"
                      >
                        {done ? 'Review Lessons' : 'Continue Learning'}
                      </Link>
                      <Link
                        to={`/student/materials?courseId=${course?._id}`}
                        className="btn btn--outline btn--sm"
                      >
                        Materials
                      </Link>
                      <button
                        className={`btn btn--ghost btn--sm ${curriculumOpen ? 'active' : ''}`}
                        onClick={() =>
                          setExpandedCurriculum(curriculumOpen ? null : e._id)
                        }
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        <Icon name="courses" size={14} />
                        {curriculumOpen ? 'Hide Curriculum' : 'View Curriculum'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Curriculum accordion — shown when expanded */}
                {curriculumOpen && (
                  <div style={{ borderTop: '1px solid var(--color-border)' }}>
                    <CourseCurriculum courseId={course?._id} />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default StudentCourses;
