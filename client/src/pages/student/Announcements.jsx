import React from 'react';
import Alert          from '../../components/ui/Alert';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import useApi         from '../../hooks/useApi';
import { announcementService } from '../../services';
import '../admin/Portal.css';

function StudentAnnouncements() {
  const { data, loading, error } = useApi(
    () => announcementService.getAll(),
    { initialData: { announcements: [] } }
  );

  const announcements = data?.announcements || [];

  return (
    <div className="portal-page">
      <div className="portal-page__header">
        <h1 className="portal-page__title">Announcements</h1>
        <p className="portal-page__subtitle">Messages from your instructors and the academy.</p>
      </div>

      {error   && <Alert type="error">{error}</Alert>}
      {loading && <LoadingSpinner label="Loading announcements..." />}

      {!loading && announcements.length === 0 && (
        <div className="portal-empty">
          <div className="portal-empty__icon">📢</div>
          <p className="portal-empty__title">No announcements</p>
          <p className="portal-empty__text">Check back later for updates from the academy.</p>
        </div>
      )}

      {!loading && announcements.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {announcements.map((a) => (
            <div key={a._id} style={{
              background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)', padding: 'var(--space-lg)',
              borderLeft: '4px solid var(--color-primary)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-xs)', marginBottom: 'var(--space-sm)' }}>
                <h3 style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-base)' }}>{a.title}</h3>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                  {new Date(a.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', marginBottom: 'var(--space-sm)' }}>
                📢 {a.createdBy?.firstName} {a.createdBy?.lastName}
                {a.audience !== 'all' && <span className="badge badge--info" style={{ marginLeft: 8 }}>{a.audience}</span>}
              </p>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>
                {a.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentAnnouncements;
