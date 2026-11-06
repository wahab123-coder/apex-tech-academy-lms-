import React from 'react';
import { Link } from 'react-router-dom';
import DashboardStatCard from '../../components/ui/DashboardStatCard';
import Card              from '../../components/ui/Card';
import LoadingSpinner    from '../../components/ui/LoadingSpinner';
import Icon              from '../../components/common/Icons';
import useApi            from '../../hooks/useApi';
import api               from '../../services/api';
import './Portal.css';

function AdminDashboard() {
  const { data: stats,    loading: ls } = useApi(() => api.get('/users?role=student&limit=1').then(r => r), { initialData: null });
  const { data: students, loading: l1 } = useApi(() => api.get('/users?role=student'), { initialData: { total: 0 } });
  const { data: instructors, loading: l2 } = useApi(() => api.get('/users?role=instructor'), { initialData: { total: 0 } });
  const { data: coursesData, loading: l3 } = useApi(() => api.get('/courses?published=all'), { initialData: { count: 0 } });
  const { data: paymentsData, loading: l4 } = useApi(() => api.get('/payments'), { initialData: { payments: [] } });
  const { data: admissionsData, loading: l5 } = useApi(() => api.get('/admissions'), { initialData: { admissions: [] } });
  const { data: certsData, loading: l6 } = useApi(() => api.get('/certificates'), { initialData: { certificates: [] } });

  const pendingPayments   = paymentsData?.payments?.filter(p => p.status === 'Pending').length  ?? 0;
  const pendingAdmissions = admissionsData?.admissions?.filter(a => a.applicationStatus === 'Pending').length ?? 0;

  const statCards = [
    { title: 'Total Students',     value: students?.total    ?? '—', icon: '🎓', color: 'primary', trend: 'All registered students' },
    { title: 'Total Instructors',  value: instructors?.total ?? '—', icon: '👨‍🏫', color: 'info',    trend: 'Active instructors' },
    { title: 'Active Courses',     value: coursesData?.count ?? '—', icon: '📚', color: 'success', trend: 'Published & draft' },
    { title: 'Pending Payments',   value: pendingPayments,           icon: '💳', color: 'warning', trend: 'Need verification' },
    { title: 'Pending Applications', value: pendingAdmissions,       icon: '📋', color: 'info',    trend: 'Awaiting review' },
    { title: 'Certificates Issued',value: certsData?.certificates?.length ?? '—', icon: '🏆', color: 'success', trend: 'Total issued' },
  ];

  const loading = l1 || l2 || l3 || l4 || l5 || l6;

  // Recent activity — latest 5 payments
  const recentPayments = paymentsData?.payments?.slice(0, 5) ?? [];

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
                <span className="activity-item__icon">
                  <Icon name="payment" size={16} color="var(--color-primary)" />
                </span>
                <div className="activity-item__body">
                  <p className="activity-item__action">{p.student?.firstName} {p.student?.lastName}</p>
                  <p className="activity-item__user">{p.description}</p>
                </div>
                <span className={`badge badge--${p.status === 'Verified' ? 'success' : p.status === 'Pending' ? 'warning' : 'error'}`}>
                  {p.status}
                </span>
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
              { label: 'Curriculum',          to: '/admin/curriculum' },
              { label: 'Review Applications', to: '/admin/applications' },
              { label: 'Verify Payments',     to: '/admin/payments' },
              { label: 'Post Announcement',   to: '/admin/announcements' },
              { label: 'Issue Certificate',   to: '/admin/certificates' },
              { label: 'Team Members',        to: '/admin/team' },
            ].map((a) => (
              <Link key={a.label} to={a.to} className="quick-action-btn">
                <span>{a.label}</span>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default AdminDashboard;
