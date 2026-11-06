import React from 'react';
import { Link } from 'react-router-dom';
import DashboardStatCard from '../../components/ui/DashboardStatCard';
import Card              from '../../components/ui/Card';
import LoadingSpinner    from '../../components/ui/LoadingSpinner';
import useApi            from '../../hooks/useApi';
import { courseService, assignmentService, submissionService } from '../../services';
import '../admin/Portal.css';

function InstructorDashboard() {
  const { data: coursesData,  loading: l1 } = useApi(() => courseService.getMine(),             { initialData: { courses: [] } });
  const { data: assignData,   loading: l2 } = useApi(() => assignmentService.getAll(),          { initialData: { assignments: [] } });
  const { data: subData,      loading: l3 } = useApi(() => submissionService.getAll(),          { initialData: { submissions: [] } });

  const courses     = coursesData?.courses     || [];
  const assignments = assignData?.assignments  || [];
  const submissions = subData?.submissions     || [];

  const totalStudents  = courses.reduce((sum, c) => sum + (c.totalStudents || 0), 0);
  const pendingReviews = submissions.filter((s) => s.status === 'Pending').length;
  const loading        = l1 || l2 || l3;

  const recentSubmissions = submissions.slice(0, 5);

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">Instructor Dashboard</h1>
        <p className="portal-page__subtitle">Overview of your courses and students.</p>
      </div>

      {loading ? <LoadingSpinner label="Loading..." /> : (
        <div className="stat-grid">
          <DashboardStatCard title="Assigned Courses" value={courses.length}    icon="📚" color="primary" />
          <DashboardStatCard title="Total Students"   value={totalStudents}     icon="🎓" color="info"    />
          <DashboardStatCard title="Assignments"      value={assignments.length}icon="📌" color="warning" />
          <DashboardStatCard title="Pending Reviews"  value={pendingReviews}    icon="📥" color="error"   />
        </div>
      )}

      <div className="portal-grid-2">
        <Card padding="none" variant="default">
          <div className="card-table-header">
            <h2 className="card-table-title">Recent Submissions</h2>
            <Link to="/instructor/submissions" className="btn btn--ghost btn--sm">View All</Link>
          </div>
          <ul className="activity-list">
            {recentSubmissions.length === 0 ? (
              <li className="activity-item">
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>No submissions yet.</p>
              </li>
            ) : recentSubmissions.map((s) => (
              <li key={s._id} className="activity-item">
                <span className="activity-item__icon">📤</span>
                <div className="activity-item__body">
                  <p className="activity-item__action">{s.assignment?.title || 'Assignment'}</p>
                  <p className="activity-item__user">
                    {s.student?.firstName} {s.student?.lastName}
                  </p>
                </div>
                <span className={`badge badge--${s.status === 'Graded' ? 'success' : 'warning'}`}>
                  {s.status}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card padding="md" variant="default">
          <h2 className="card-table-title" style={{ marginBottom: 'var(--space-md)' }}>My Courses</h2>
          {courses.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>No courses assigned yet.</p>
          ) : courses.map((c) => (
            <div key={c._id} style={{
              padding: 'var(--space-md) 0',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <p style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)' }}>{c.title}</p>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                  {c.totalStudents} students · {c.level}
                </p>
              </div>
              <Link to="/instructor/lessons" className="btn btn--outline btn--sm">Manage</Link>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

export default InstructorDashboard;
