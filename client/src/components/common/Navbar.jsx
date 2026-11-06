import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Icon from './Icons';
import ThemeToggle from './ThemeToggle';
import './Navbar.css';

const navLinks = [
  { to: '/',         label: 'Home',      end: true },
  { to: '/about',    label: 'About' },
  { to: '/courses',  label: 'Courses' },
  { to: '/training', label: 'Training' },
  { to: '/projects', label: 'Projects' },
  { to: '/blog',     label: 'Blog' },
  { to: '/events',   label: 'Events' },
  { to: '/gallery',  label: 'Gallery' },
  { to: '/contact',  label: 'Contact' },
];

const portalLink = { admin: '/admin', instructor: '/instructor', student: '/student' };

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [scrolled,  setScrolled]  = useState(false);
  const [dropOpen,  setDropOpen]  = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLinkClick = () => { setMenuOpen(false); setDropOpen(false); };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    handleLinkClick();
  };

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : '';

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} role="banner">
      <div className="container navbar__inner">

        {/* ── Brand ── */}
        <Link to="/" className="navbar__brand" onClick={handleLinkClick} aria-label="Apex Tech Academy home">
          <div className="navbar__logo" aria-hidden="true">
            <span>A</span>
          </div>
          <div className="navbar__brand-text">
            <span className="navbar__brand-name">Apex Tech</span>
            <span className="navbar__brand-sub">Academy</span>
          </div>
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="navbar__links" aria-label="Main navigation">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `navbar__link ${isActive ? 'active' : ''}`}
              onClick={handleLinkClick}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* ── Auth actions ── */}
        <div className="navbar__actions">
          <Link to="/search" className="navbar__search-btn" aria-label="Search" title="Search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </Link>
          <ThemeToggle />
          {isAuthenticated ? (
            <div className="navbar__user-menu" ref={dropRef}>
              <button
                className="navbar__user-btn"
                onClick={() => setDropOpen(!dropOpen)}
                aria-expanded={dropOpen}
                aria-haspopup="true"
              >
                <span className="navbar__user-avatar">{initials}</span>
                <span className="navbar__user-name">{user?.firstName}</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
              {dropOpen && (
                <div className="navbar__dropdown" role="menu">
                  <div className="navbar__dropdown-header">
                    <p className="navbar__dropdown-name">{user?.firstName} {user?.lastName}</p>
                    <p className="navbar__dropdown-role">{user?.role}</p>
                  </div>
                  <div className="navbar__dropdown-divider" />
                  <Link
                    to={portalLink[user?.role] || '/student'}
                    className="navbar__dropdown-item"
                    onClick={handleLinkClick}
                    role="menuitem"
                  >
                    <Icon name="dashboard" size={16} />
                    My Portal
                  </Link>
                  <button
                    className="navbar__dropdown-item navbar__dropdown-item--danger"
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    <Icon name="logout" size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login"    className="btn btn--ghost   btn--sm" onClick={handleLinkClick}>Sign In</Link>
              <Link to="/register" className="btn btn--primary btn--sm" onClick={handleLinkClick}>Get Started</Link>
            </>
          )}
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          className={`navbar__hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* ── Mobile menu ── */}
      <div
        id="mobile-nav"
        className={`navbar__mobile ${menuOpen ? 'navbar__mobile--open' : ''}`}
        aria-hidden={!menuOpen}
      >
        <nav className="navbar__mobile-links">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `navbar__mobile-link ${isActive ? 'active' : ''}`}
              onClick={handleLinkClick}
            >
              {link.label}
            </NavLink>
          ))}
          <div className="navbar__mobile-auth">
            {isAuthenticated ? (
              <>
                <Link
                  to={portalLink[user?.role] || '/student'}
                  className="btn btn--outline btn--sm"
                  onClick={handleLinkClick}
                >
                  My Portal
                </Link>
                <button className="btn btn--ghost btn--sm" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login"    className="btn btn--outline btn--sm" onClick={handleLinkClick}>Sign In</Link>
                <Link to="/register" className="btn btn--primary btn--sm" onClick={handleLinkClick}>Get Started</Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
