import React from 'react';
import './DashboardStatCard.css';

/**
 * DashboardStatCard — KPI metric card for admin/portal dashboards
 *
 * Props:
 *   title  — string
 *   value  — string | number
 *   icon   — string (emoji or symbol)
 *   color  — 'primary' | 'success' | 'warning' | 'error' | 'info'
 *   trend  — string (e.g. '+12% this month')
 */
function DashboardStatCard({ title, value, icon, color = 'primary', trend }) {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-card__icon" aria-hidden="true">{icon}</div>
      <div className="stat-card__body">
        <p className="stat-card__title">{title}</p>
        <p className="stat-card__value">{value ?? '—'}</p>
        {trend && <p className="stat-card__trend">{trend}</p>}
      </div>
    </div>
  );
}

export default DashboardStatCard;
