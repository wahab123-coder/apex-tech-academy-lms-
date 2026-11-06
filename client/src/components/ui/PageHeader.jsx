import React from 'react';
import './PageHeader.css';

/**
 * PageHeader — hero banner for public pages and portal sub-pages
 *
 * Props:
 *   title    — string
 *   subtitle — string
 *   dark     — bool (uses dark gradient bg)
 *   children — optional action buttons
 */
function PageHeader({ title, subtitle, dark = false, children }) {
  return (
    <section className={`page-header ${dark ? 'page-header--dark' : ''}`}>
      <div className="container">
        <h1 className="page-header__title">{title}</h1>
        {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
        {children && <div className="page-header__actions">{children}</div>}
      </div>
    </section>
  );
}

export default PageHeader;
