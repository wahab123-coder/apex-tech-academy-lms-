import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

/**
 * ProtectedRoute
 * Wraps authenticated portal sections. Redirects to /login if not
 * authenticated, or to the correct portal if the role doesn't match.
 *
 * Props:
 *   allowedRoles — string[] e.g. ['admin'] or ['instructor']
 *   children     — the layout component to render
 */
function ProtectedRoute({ allowedRoles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner fullPage label="Loading..." />;

  if (!user) {
    // Save the attempted URL so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Wrong role — redirect to the correct portal
    const portalMap = { admin: '/admin', instructor: '/instructor', student: '/student' };
    return <Navigate to={portalMap[user.role] || '/'} replace />;
  }

  return children;
}

export default ProtectedRoute;
