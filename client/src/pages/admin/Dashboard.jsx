import React from 'react';
import { Link } from 'react-router-dom';
import DashboardStatCard from '../../components/ui/DashboardStatCard';
import Card              from '../../components/ui/Card';
import LoadingSpinner    from '../../components/ui/LoadingSpinner';
import Icon              from '../../components/common/Icons';
import useApi            from '../../hooks/useApi';
import api               from '../../services/api';
import './Portal.css';

// ── Progress bar component ────────────────────────────────
function ProgressBar({ percent, color = 'var(--color-primary)' }) {
  const pct = Math.min(100, Math.max(0, percent || 0));
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 8, background: 'var(--color-border)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? 'var(--color-success)' : color, borderRadius: 99, transition: 'width 0.3s' }} />
      </div>
      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', minWidth: 32 }}>{pct}%</span>
    </div>
  );
}

function AdminDashboard() {
  const { data: students,     loading: l1 } = useApi(() => api.get('/users?role=student'),     { initialData: { total: 0 } });
  const { data: instructors,  loading: l2 } = useApi(() => api.get('/users?role=instructor'),  { initialData: { total: 0 } });
  const { data: coursesData,  loading: l3 } = useApi(() => api.get('/courses?published=all'),  { initialData: { count: 0 } });
  const { data: paymentsData, loading: l4 } = useApi(() => api.get('/payments'),               { initialData: { payments: [] } });
  const { data: admissionsData,loading: l5} = useApi(() => api.get('/admissions'),             { initialData: { admissions: [] } });
  const { data: certsData,    loading: l6 } = useApi(() => api.get('/certificates'),           { initialData: { certificates: [] } });
  const { data: progressData, loading: l7 } = useApi(() => api.get('/progress/all'),           { initialData: { progress: [] } });

  const pendingPayments   = paymentsData?.payments?.filter(p => p.status === 'Pending').length ?? 0;
  const pendingAdmissions = admissionsData?.admissions?.filter(a => a.applicationStatus === 'Pending').length ?? 0;
  const progressList      = progressData?.progress || [];
  const avgProgress       = progressList.length
    ? Math.round(progressList.reduce((s, p) => s + (p.progressPercentage || 0), 0) / progressList.length)
    : 0;
  const completed         = progressList.filter(p => p.isCompleted).length;

  const statCards = [
    { title: 'Total Students',       value: students?.total    ?? '—', icon: '🎓', color: 'primary', trend: 'All registered students' },
    { title: 'Total Instructors',    value: instructors?.total ?? '—', icon: '👨‍🏫', color: 'info',    trend: 'Active instructors' },
    { title: 'Active Courses',       value: coursesData?.count ?? '—', icon: '📚', color: 'success', trend: 'Published & draft' },
    { title: 'Pending Payments',     value: pendingPayments,           icon: '💳', color: 'warning', trend: 'Need verification' },
    { title: 'Pending Applications', value: pendingAdmissions,         icon: '📋', color: 'info',    trend: 'Awaiting review' },
    { title: 'Certificates Issued',  value: certsData?.certificates?.length ?? '—', icon: '🏆', color: 'success', trend: 'Total issued' },
  ];

  const loading = l1 || l2 || l3 || l4 || l5 || l6;
  const recentPayments = paymentsData?.payments?.slice(0, 5) ?? [];
  const recentProgress = progressList.slice(0, 8);

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">Dashboard</h1>
        <p className="portal-page__subtitle">Overview of academy activity and key metrics.</p>
      </div>

      {loading ? <LoadingSpinner label="Loading stats..." /> : (
        <div className="stat-grid">
          {statCards.map((s) => <DashboardStatCard key={s.title} {...s} />)}
        </div>
      )}

      {/* Student Progress Section */}
      <Card padding="lg" variant="default" style={{ marginBottom: 'var(--space-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
          <div>
            <h2 className="card-table-title">Student Progress Overview</h2>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>
              {progressList.length} students tracked · Average {avgProgress}% · {completed} completed
            </p>
          </div>
          <Link to="/admin/students" className="btn btn--ghost btn--sm">View Students</Link>
        </div>

        {l7 ? <LoadingSpinner label="Loading progress..." /> : progressList.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', textAlign: 'center', padding: 'var(--space-xl)' }}>
            No student progress recorded yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {/* Summary row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
              {[
                { label: 'Average Progress', value: `${avgProgress}%`, color: 'var(--color-primary)' },
                { label: 'Completed',         value: completed,          color: 'var(--color-success)' },
                { label: 'In Progress',       value: progressList.length - completed, color: 'var(--color-warning)' },
              ].map((s) => (
                <div key={s.label} style={{ background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', padding: 'var(--space-md)', textAlign: 'center' }}>
                  <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'bold', color: s.color }}>{s.value}</p>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Progress list */}
            <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
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
                    {p.isCompleted ? 'Completed' : 'In Progress'}
                  </span>
                </div>
              ))}
              {progressList.length > 8 && (
                <div style={{ padding: 'var(--space-sm) var(--space-md)', textAlign: 'center', borderTop: '1px solid var(--color-border)' }}>
                  <Link to="/admin/students" className="btn btn--ghost btn--sm">View all {progressList.length} records</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      <div className="portal-grid-2">
        <Card padding="none" variant="default">
          <div className="card-table-header">
            <h2 className="card-table-title">Recent Payments</h2>
            <Link to="/admin/payments" className="btn btn--ghost btn--sm">View All</Link>
          </div>
          <ul className="activity-list">
            {recentPayments.length === 0 && !loading ? (
              <li className="activity-item"><p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>No payments yet.</p></li>
            ) : recentPayments.map((p) => (
              <li key={p._id} className="activity-item">
                <span className="activity-item__icon"><Icon name="payment" size={16} color="var(--color-primary)" /></span>
                <div className="activity-item__body">
                  <p className="activity-item__action">{p.student?.firstName} {p.student?.lastName}</p>
                  <p className="activity-item__user">{p.description}</p>
                </div>
                <span className={`badge badge--${p.status === 'Verified' ? 'success' : p.status === 'Pending' ? 'warning' : 'error'}`}>{p.status}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card padding="md" variant="default">
          <h2 className="card-table-title" style={{ marginBottom: 'var(--space-md)' }}>Quick Actions</h2>
          <div className="quick-actions">
            {[
              { label: 'Add Student',         to: '/admin/students' },
              { label: 'Add Course',          to: '/admin/courses' },
              { label: 'Review Applications', to: '/admin/applications' },
              { label: 'Verify Payments',     to: '/admin/payments' },
              { label: 'Post Announcement',   to: '/admin/announcements' },
              { label: 'Issue Certificate',   to: '/admin/certificates' },
              { label: 'Team Members',        to: '/admin/team' },
              { label: 'Settings',            to: '/admin/settings' },
            ].map((a) => (
              <Link key={a.label} to={a.to} className="quick-action-btn"><span>{a.label}</span></Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default AdminDashboard;
