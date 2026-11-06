import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found__content">
        <div className="not-found__code">404</div>
        <h1 className="not-found__title">Page Not Found</h1>
        <p className="not-found__subtitle">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="not-found__actions">
          <Link to="/" className="btn btn--primary btn--md">Go Home</Link>
          <Link to="/courses" className="btn btn--outline btn--md">Explore Courses</Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
