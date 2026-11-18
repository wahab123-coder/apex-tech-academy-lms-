import React from 'react';
import { Link } from 'react-router-dom';
import DashboardStatCard from '../../components/ui/DashboardStatCard';
import Card              from '../../components/ui/Card';
import LoadingSpinner    from '../../components/ui/LoadingSpinner';
import useApi            from '../../hooks/useApi';
import api               from '../../services/api';
import { courseService, assignmentService, submissionService } from '../../services';
import '../admin/Portal.css';

// ── Progress bar ──────────────────────────────────────────
function ProgressBar({ percent }) {
  const pct = Math.min(100, Math.max(0, percent || 0));
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 8, background: 'var(--color-border)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? 'var(--color-success)' : 'var(--color-primary)', borderRadius: 99 }} />
      </div>
      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', minWidth: 32 }}>{pct}%</span>
    </div>
  );
}

function InstructorDashboard() {
  const { data: coursesData,  loading: l1 } = useApi(() => courseService.getMine(),    { initialData: { courses: [] } });
  const { data: assignData,   loading: l2 } = useApi(() => assignmentService.getAll(), { initialData: { assignments: [] } });
  const { data: subData,      loading: l3 } = useApi(() => submissionService.getAll(), { initialData: { submissions: [] } });
  const { data: progressData, loading: l4 } = useApi(() => api.get('/progress/all'),   { initialData: { progress: [] } });

  const courses     = coursesData?.courses    || [];
  const assignments = assignData?.assignments || [];
  const submissions = subData?.submissions    || [];
  const progressList= progressData?.progress  || [];

  const totalStudents  = courses.reduce((sum, c) => sum + (c.totalStudents || 0), 0);
  const pendingReviews = submissions.filter((s) => s.status === 'Pending').length;
  const completed      = progressList.filter(p => p.isCompleted).length;
  const avgProgress    = progressList.length
    ? Math.round(progressList.reduce((s, p) => s + (p.progressPercentage || 0), 0) / progressList.length)
    : 0;

  const loading           = l1 || l2 || l3;
  const recentSubmissions = submissions.slice(0, 5);
  const recentProgress    = progressList.slice(0, 8);

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">Instructor Dashboard</h1>
        <p className="portal-page__subtitle">Overview of your courses and student progress.</p>
      </div>

      {loading ? <LoadingSpinner label="Loading..." /> : (
        <div className="stat-grid">
          <DashboardStatCard title="My Courses"       value={courses.length}     icon="📚" color="primary" />
          <DashboardStatCard title="Total Students"   value={totalStudents}      icon="🎓" color="info"    />
          <DashboardStatCard title="Avg Progress"     value={`${avgProgress}%`}  icon="📈" color="success" />
          <DashboardStatCard title="Pending Reviews"  value={pendingReviews}     icon="📥" color="warning" />
        </div>
      )}

      {/* Student Progress */}
      <Card padding="lg" variant="default" style={{ marginBottom: 'var(--space-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
          <div>
            <h2 className="card-table-title">Student Progress</h2>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>
              {progressList.length} students · {completed} completed · Average {avgProgress}%
            </p>
          </div>
        </div>

        {l4 ? <LoadingSpinner label="Loading progress..." /> : progressList.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', textAlign: 'center', padding: 'var(--space-xl)' }}>
            No student progress yet. Progress appears once students start lessons.
          </p>
        ) : (
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 2fr 1fr', gap: 'var(--space-sm)', padding: 'var(--space-sm) var(--space-md)', background: 'var(--color-bg-secondary)', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              <span>Student</span><span>Course</span><span>Progress</span><span>Status</span>
            </div>
            {recentProgress.map((p) => (
              <div key={p._id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 2fr 1fr', gap: 'var(--space-sm)', padding: 'var(--space-sm) var(--space-md)', borderTop: '1px solid var(--color-border)', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>
                  {p.student?.firstName} {p.student?.lastName}
                </span>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                  {p.course?.title || '—'}
                </span>
                <ProgressBar percent={p.progressPercentage} />
                <span className={`badge badge--${p.isCompleted ? 'success' : 'info'}`} style={{ fontSize: 'var(--font-size-xs)', justifySelf: 'start' }}>
                  {p.isCompleted ? 'Done' : 'Active'}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="portal-grid-2">
        {/* Recent Submissions */}
        <Card padding="none" variant="default">
          <div className="card-table-header">
            <h2 className="card-table-title">Recent Submissions</h2>
            <Link to="/instructor/submissions" className="btn btn--ghost btn--sm">View All</Link>
          </div>
          <ul className="activity-list">
            {recentSubmissions.length === 0 ? (
              <li className="activity-item"><p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>No submissions yet.</p></li>
            ) : recentSubmissions.map((s) => (
              <li key={s._id} className="activity-item">
                <span className="activity-item__icon">📤</span>
                <div className="activity-item__body">
                  <p className="activity-item__action">{s.assignment?.title || 'Assignment'}</p>
                  <p className="activity-item__user">{s.student?.firstName} {s.student?.lastName}</p>
                </div>
                <span className={`badge badge--${s.status === 'Graded' ? 'success' : 'warning'}`}>{s.status}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* My Courses */}
        <Card padding="md" variant="default">
          <h2 className="card-table-title" style={{ marginBottom: 'var(--space-md)' }}>My Courses</h2>
          {courses.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>No courses assigned yet.</p>
          ) : courses.map((c) => (
            <div key={c._id} style={{ padding: 'var(--space-md) 0', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)' }}>{c.title}</p>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                  {c.totalStudents || 0} students · {c.level}
                </p>
              </div>
              <Link to={`/instructor/lessons?courseId=${c._id}`} className="btn btn--outline btn--sm">Manage</Link>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

export default InstructorDashboard;
