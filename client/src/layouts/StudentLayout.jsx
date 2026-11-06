import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth }    from '../context/AuthContext';
import ThemeToggle    from '../components/common/ThemeToggle';
import './DashboardLayout.css';

const navItems = [
  { to: '/student',               label: 'Dashboard',         end: true },
  { to: '/student/profile',       label: 'Profile'        },
  { to: '/student/courses',       label: 'My Courses'     },
  { to: '/student/lessons',       label: 'Lessons'        },
  { to: '/student/materials',     label: 'Materials'      },
  { to: '/student/assignments',   label: 'Assignments'    },
  { to: '/student/submissions',   label: 'Submissions'    },
  { to: '/student/progress',      label: 'Progress'       },
  { to: '/student/announcements', label: 'Announcements'  },
  { to: '/student/admission',     label: 'Admission'      },
  { to: '/student/payments',      label: 'Payments'       },
  { to: '/student/receipts',      label: 'Receipts'       },
  { to: '/student/projects',      label: 'Projects'       },
  { to: '/student/certificates',  label: 'Certificates'   },
  { to: '/student/exams',         label: 'Final Assessment' },
];

function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : 'S';

  return (
    <div className={`dashboard-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* ── Sidebar ── */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">A</span>
          {sidebarOpen && <span className="brand-name">Apex Tech</span>}
        </div>
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? '←' : '→'}
        </button>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="link-icon">—</span>
              {sidebarOpen && <span className="link-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="link-icon">←</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="dashboard-main">
        <header className="dashboard-header">
          <h2 className="portal-title">Student Portal</h2>
          <div className="header-user">
            <ThemeToggle />
            <span className="user-avatar">{initials}</span>
            {sidebarOpen && (
              <span className="user-name">{user?.firstName} {user?.lastName}</span>
            )}
          </div>
        </header>
        <div className="dashboard-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default StudentLayout;
