import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Alert          from '../../components/ui/Alert';
import Button         from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import useApi         from '../../hooks/useApi';
import { lessonService, progressService, enrollmentService } from '../../services';
import '../admin/Portal.css';

const statusColor = { Completed: 'success', 'In Progress': 'info', Locked: 'muted' };
const statusIcon  = { Completed: '✅', 'In Progress': '▶️', Locked: '🔒' };

function StudentLessons() {
  const [params]          = useSearchParams();
  const courseId          = params.get('courseId');
  const [active,  setActive]  = useState(null);
  const [alert,   setAlert]   = useState(null);
  const [marking, setMarking] = useState(false);

  const { data: enrollData } = useApi(() => enrollmentService.getAll(), { initialData: { enrollments: [] } });
  const enrollments          = enrollData?.enrollments || [];
  const activeCourseId       = courseId || enrollments[0]?.course?._id;

  const { data: lessonsData, loading, error } = useApi(
    () => activeCourseId ? lessonService.getByCourse(activeCourseId) : Promise.resolve({ data: { lessons: [] } }),
    { initialData: { lessons: [] }, deps: [activeCourseId] }
  );

  const { data: progressData, refetch: refetchProgress } = useApi(
    () => activeCourseId ? progressService.getAll(activeCourseId) : Promise.resolve([]),
    { initialData: [], deps: [activeCourseId] }
  );

  const lessons  = lessonsData?.lessons || [];
  const progress = Array.isArray(progressData) ? progressData[0] : progressData?.progress?.[0];
  const completedIds = (progress?.completedLessons || []).map((l) => l._id || l);

  const getLessonStatus = (lesson, index) => {
    if (completedIds.includes(lesson._id)) return 'Completed';
    if (index === 0 || completedIds.includes(lessons[index - 1]?._id)) return 'In Progress';
    return 'Locked';
  };

  const handleMarkComplete = async () => {
    if (!active || !activeCourseId) return;
    setMarking(true);
    try {
      await progressService.completeLesson({ lessonId: active._id, courseId: activeCourseId });
      setAlert({ type: 'success', msg: `"${active.title}" marked as complete!` });
      refetchProgress();
    } catch (err) {
      setAlert({ type: 'error', msg: err.message });
    } finally {
      setMarking(false);
    }
  };

  if (loading) return <div className="portal-page"><LoadingSpinner label="Loading lessons..." /></div>;

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">Lessons</h1>
        <p className="portal-page__subtitle">Work through each lesson in order to progress.</p>
      </div>

      {alert && <Alert type={alert.type} onClose={() => setAlert(null)}>{alert.msg}</Alert>}
      {error  && <Alert type="error">{error}</Alert>}

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 'var(--space-lg)', alignItems: 'start' }}>
        {/* Lesson list */}
        <div style={{ background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
          {lessons.length === 0 ? (
            <p style={{ padding: 'var(--space-lg)', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
              No lessons available yet.
            </p>
          ) : lessons.map((l, i) => {
            const status = getLessonStatus(l, i);
            return (
              <button key={l._id} disabled={status === 'Locked'}
                onClick={() => status !== 'Locked' && setActive(l)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
                  width: '100%', padding: 'var(--space-md)', border: 'none',
                  background: active?._id === l._id ? 'rgba(0,212,255,0.08)' : 'transparent',
                  borderLeft: active?._id === l._id ? '3px solid var(--color-primary)' : '3px solid transparent',
                  cursor: status === 'Locked' ? 'not-allowed' : 'pointer',
                  borderBottom: '1px solid var(--color-border)', textAlign: 'left',
                  opacity: status === 'Locked' ? 0.5 : 1, transition: 'background var(--transition-fast)',
                }}>
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{statusIcon[status]}</span>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {l.order}. {l.title}
                  </p>
                  {l.duration && <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>⏱ {l.duration}</p>}
                </div>
                <span className={`badge badge--${statusColor[status]}`} style={{ flexShrink: 0 }}>{status}</span>
              </button>
            );
          })}
        </div>

        {/* Lesson content */}
        <div style={{ background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: 'var(--space-xl)' }}>
          {active ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
                <h2 style={{ fontWeight: 'var(--font-weight-semibold)' }}>{active.order}. {active.title}</h2>
              </div>
              {/* Video/content placeholder */}
              <div style={{ height: 260, background: 'var(--gradient-primary)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-lg)' }}>
                <span style={{ fontSize: '3rem' }}>▶️</span>
              </div>
              {active.description && (
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height-relaxed)', marginBottom: 'var(--space-lg)' }}>
                  {active.description}
                </p>
              )}
              <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                <a href={`/student/materials?courseId=${activeCourseId}`} className="btn btn--outline btn--sm">📄 View Materials</a>
                <a href="/student/assignments" className="btn btn--outline btn--sm">📌 Assignments</a>
                {!completedIds.includes(active._id) && (
                  <Button size="sm" loading={marking} onClick={handleMarkComplete}>
                    ✅ Mark Complete
                  </Button>
                )}
                {completedIds.includes(active._id) && (
                  <span className="badge badge--success" style={{ padding: '8px 14px' }}>✓ Completed</span>
                )}
              </div>
            </>
          ) : (
            <div className="portal-empty">
              <div className="portal-empty__icon">📖</div>
              <p className="portal-empty__title">Select a lesson</p>
              <p className="portal-empty__text">Choose a lesson from the list to start learning.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentLessons;
