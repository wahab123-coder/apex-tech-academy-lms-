import React from 'react';
import { Link } from 'react-router-dom';
import DashboardStatCard from '../../components/ui/DashboardStatCard';
import Card              from '../../components/ui/Card';
import LoadingSpinner    from '../../components/ui/LoadingSpinner';
import { useAuth }       from '../../context/AuthContext';
import useApi            from '../../hooks/useApi';
import { enrollmentService, assignmentService, progressService, certificateService } from '../../services';
import '../admin/Portal.css';

function StudentDashboard() {
  const { user } = useAuth();

  const { data: enrollData,  loading: l1 } = useApi(() => enrollmentService.getAll(),     { initialData: { enrollments: [] } });
  const { data: assignData,  loading: l2 } = useApi(() => assignmentService.getAll(),     { initialData: { assignments: [] } });
  const { data: progressData,loading: l3 } = useApi(() => progressService.getAll(),       { initialData: [] });
  const { data: certData,    loading: l4 } = useApi(() => certificateService.getAll(),    { initialData: { certificates: [] } });

  const enrollments   = enrollData?.enrollments   || [];
  const assignments   = assignData?.assignments   || [];
  const progress      = Array.isArray(progressData) ? progressData : progressData?.progress || [];
  const certificates  = certData?.certificates    || [];
  const loading       = l1 || l2 || l3 || l4;

  const overallProgress = progress.length > 0
    ? Math.round(progress.reduce((sum, p) => sum + (p.progressPercentage || 0), 0) / progress.length)
    : 0;

  const upcomingAssignments = assignments
    .filter((a) => new Date(a.dueDate) > new Date())
    .slice(0, 4);

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">Welcome back, {user?.firstName}! 👋</h1>
        <p className="portal-page__subtitle">Here's a summary of your learning progress.</p>
      </div>

      {loading ? <LoadingSpinner label="Loading..." /> : (
        <div className="stat-grid">
          <DashboardStatCard title="Enrolled Courses"  value={enrollments.length}  icon="📚" color="primary" />
          <DashboardStatCard title="Assignments Due"    value={upcomingAssignments.length} icon="📌" color="warning" />
          <DashboardStatCard title="Overall Progress"   value={`${overallProgress}%`} icon="📈" color="success" />
          <DashboardStatCard title="Certificates"       value={certificates.length} icon="🏆" color="info" />
        </div>
      )}

      <div className="portal-grid-2">
        <Card padding="none" variant="default">
          <div className="card-table-header">
            <h2 className="card-table-title">Upcoming Assignments</h2>
            <Link to="/student/assignments" className="btn btn--ghost btn--sm">View All</Link>
          </div>
          <ul className="activity-list">
            {upcomingAssignments.length === 0 ? (
              <li className="activity-item">
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>No upcoming assignments.</p>
              </li>
            ) : upcomingAssignments.map((a) => (
              <li key={a._id} className="activity-item">
                <span className="activity-item__icon">📌</span>
                <div className="activity-item__body">
                  <p className="activity-item__action">{a.title}</p>
                  <p className="activity-item__user">{a.course?.title}</p>
                </div>
                <span className="activity-item__time">
                  {new Date(a.dueDate).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card padding="md" variant="default">
          <h2 className="card-table-title" style={{ marginBottom: 'var(--space-md)' }}>My Courses</h2>
          {enrollments.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
              You are not enrolled in any courses yet.
            </p>
          ) : enrollments.map((e) => {
            const prog = progress.find((p) => p.course?._id === e.course?._id || p.course === e.course?._id);
            const pct  = prog?.progressPercentage || 0;
            return (
              <div key={e._id} style={{ marginBottom: 'var(--space-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                    {e.course?.title}
                  </span>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{pct}%</span>
                </div>
                <div style={{ height: 6, background: 'var(--color-border)', borderRadius: 99 }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: 'var(--gradient-accent)', borderRadius: 99 }} />
                </div>
              </div>
            );
          })}
          <Link to="/student/courses" className="btn btn--outline btn--sm" style={{ marginTop: 'var(--space-sm)' }}>
            View Courses
          </Link>
        </Card>
      </div>
    </div>
  );
}

export default StudentDashboard;
