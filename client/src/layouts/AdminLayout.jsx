import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon         from '../components/common/Icons';
import ThemeToggle  from '../components/common/ThemeToggle';
import './DashboardLayout.css';

const navItems = [
  { to: '/admin',               label: 'Dashboard',         icon: 'dashboard',    end: true },
  { to: '/admin/students',      label: 'Students',          icon: 'users' },
  { to: '/admin/instructors',   label: 'Instructors',       icon: 'users' },
  { to: '/admin/courses',       label: 'Courses',           icon: 'courses' },
  { to: '/admin/curriculum',    label: 'Curriculum',        icon: 'courses' },
  { to: '/admin/exams',         label: 'Assessments',        icon: 'projects' },
  { to: '/admin/applications',  label: 'Applications',      icon: 'blog' },
  { to: '/admin/admissions',    label: 'Admissions',        icon: 'check' },
  { to: '/admin/enrollments',   label: 'Enrollments',       icon: 'training' },
  { to: '/admin/materials',     label: 'Learning Materials', icon: 'courses' },
  { to: '/admin/assignments',   label: 'Assignments',       icon: 'projects' },
  { to: '/admin/submissions',   label: 'Submissions',        icon: 'download' },
  { to: '/admin/payments',      label: 'Payments',          icon: 'payment' },
  { to: '/admin/receipts',      label: 'Receipts',          icon: 'download' },
  { to: '/admin/certificates',  label: 'Certificates',      icon: 'certificate' },
  { to: '/admin/projects',      label: 'Projects',          icon: 'projects' },
  { to: '/admin/blog',          label: 'Blog',              icon: 'blog' },
  { to: '/admin/events',        label: 'Events',            icon: 'events' },
  { to: '/admin/gallery',       label: 'Gallery',           icon: 'gallery' },
  { to: '/admin/team',          label: 'Team Members',      icon: 'users' },
  { to: '/admin/announcements', label: 'Announcements',     icon: 'announcement' },
  { to: '/admin/messages',      label: 'Messages',          icon: 'message' },
  { to: '/admin/settings',      label: 'Settings',          icon: 'settings' },
];

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : 'A';

  return (
    <div className={`dashboard-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Sidebar */}
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
              <span className="link-icon">
                <Icon name={item.icon} size={16} />
              </span>
              {sidebarOpen && <span className="link-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="link-icon">
              <Icon name="logout" size={16} />
            </span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="dashboard-main">
        <header className="dashboard-header">
          <h2 className="portal-title">Admin Dashboard</h2>
          <div className="header-user">
            <ThemeToggle />
            <span className="user-avatar">{initials}</span>
            {sidebarOpen && (
              <span className="user-name">
                {user?.firstName} {user?.lastName}
              </span>
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

export default AdminLayout;
