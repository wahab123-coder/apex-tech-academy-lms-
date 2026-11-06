import React from 'react';
import DashboardStatCard from '../../components/ui/DashboardStatCard';
import Card              from '../../components/ui/Card';
import Alert             from '../../components/ui/Alert';
import LoadingSpinner    from '../../components/ui/LoadingSpinner';
import useApi            from '../../hooks/useApi';
import { progressService, submissionService } from '../../services';
import '../admin/Portal.css';

function StudentProgress() {
  const { data: progressData, loading: l1, error } = useApi(() => progressService.getAll(),    { initialData: [] });
  const { data: subData,      loading: l2 }        = useApi(() => submissionService.getAll(),  { initialData: { submissions: [] } });

  const progressList = Array.isArray(progressData) ? progressData : progressData?.progress || [];
  const submissions  = subData?.submissions || [];
  const loading      = l1 || l2;

  const gradedSubs    = submissions.filter((s) => s.grade !== null && s.grade !== undefined);
  const averageGrade  = gradedSubs.length > 0
    ? Math.round(gradedSubs.reduce((sum, s) => sum + s.grade, 0) / gradedSubs.length)
    : null;

  const completedLessons = progressList.reduce((sum, p) => sum + (p.completedLessons?.length || 0), 0);
  const completedCourses = progressList.filter((p) => p.isCompleted).length;
  const overallProgress  = progressList.length > 0
    ? Math.round(progressList.reduce((sum, p) => sum + (p.progressPercentage || 0), 0) / progressList.length)
    : 0;

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">My Progress</h1>
        <p className="portal-page__subtitle">Track your learning across all enrolled courses.</p>
      </div>

      {error   && <Alert type="error">{error}</Alert>}
      {loading && <LoadingSpinner label="Loading progress..." />}

      {!loading && (
        <>
          <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <DashboardStatCard title="Overall Progress"    value={`${overallProgress}%`} icon="📈" color="primary" />
            <DashboardStatCard title="Lessons Completed"   value={completedLessons}      icon="✅" color="success" />
            <DashboardStatCard title="Assignments Graded"  value={gradedSubs.length}     icon="📌" color="info"    />
            <DashboardStatCard title="Average Grade"       value={averageGrade !== null ? `${averageGrade}%` : '—'} icon="🏅" color="warning" />
          </div>

          {/* Per-course progress */}
          <Card padding="lg" variant="default">
            <h3 style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-lg)' }}>Course Progress</h3>
            {progressList.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>No progress data yet. Start your lessons!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                {progressList.map((p) => (
                  <div key={p._id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-xs)' }}>
                      <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                        {p.course?.title || 'Course'}
                      </span>
                      <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                        {p.completedLessons?.length || 0} lessons · {p.progressPercentage}%
                        {p.isCompleted && <span className="badge badge--success" style={{ marginLeft: 8 }}>Completed ✓</span>}
                      </span>
                    </div>
                    <div style={{ height: 10, background: 'var(--color-border)', borderRadius: 99 }}>
                      <div style={{
                        height: '100%', width: `${p.progressPercentage}%`,
                        background: p.isCompleted ? 'var(--color-success)' : 'var(--gradient-accent)',
                        borderRadius: 99, transition: 'width 0.5s ease',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent grades */}
          {gradedSubs.length > 0 && (
            <Card padding="none" variant="default">
              <div className="card-table-header">
                <h3 className="card-table-title">Recent Grades</h3>
              </div>
              <ul className="activity-list">
                {gradedSubs.slice(0, 5).map((s) => (
                  <li key={s._id} className="activity-item">
                    <span className="activity-item__icon">🏅</span>
                    <div className="activity-item__body">
                      <p className="activity-item__action">{s.assignment?.title || 'Assignment'}</p>
                      <p className="activity-item__user">{new Date(s.gradedAt || s.updatedAt).toLocaleDateString()}</p>
                    </div>
                    <span className="badge badge--success">{s.grade}%</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

export default StudentProgress;
