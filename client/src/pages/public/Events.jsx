import React from 'react';
import PageHeader     from '../../components/ui/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert          from '../../components/ui/Alert';
import Icon           from '../../components/common/Icons';
import useApi         from '../../hooks/useApi';
import { eventService } from '../../services';
import { useAuth }    from '../../context/AuthContext';
import './Events.css';

const typeColors = {
  Bootcamp:      'primary',
  Workshop:      'info',
  'Career Event':'success',
  Ceremony:      'warning',
  'Open Day':    'muted',
};

function Events() {
  const { isAuthenticated } = useAuth();

  const { data, loading, error, refetch } = useApi(
    () => eventService.getAll(),
    { initialData: { events: [] } }
  );

  const events = data?.events || [];
  const now    = new Date();
  const upcoming = events.filter((e) => new Date(e.date) >= now);
  const past     = events.filter((e) => new Date(e.date) <  now);

  const formatDate = (d) => {
    const date = new Date(d);
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      day:   date.getDate(),
      full:  date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    };
  };

  const handleRegister = async (eventId) => {
    try { await eventService.register(eventId); refetch(); }
    catch (err) { alert(err.message); }
  };

  const EventCard = ({ ev, isPast }) => {
    const d = formatDate(ev.date);
    return (
      <div className={`event-card ${isPast ? 'event-card--past' : ''}`}>
        <div className="event-card__date-block">
          <span className="event-card__month">{d.month}</span>
          <span className="event-card__day">{d.day}</span>
        </div>
        <div className="event-card__body">
          <div className="event-card__top">
            <span className={`badge badge--${typeColors[ev.type] || 'primary'}`}>{ev.type}</span>
          </div>
          <h3 className="event-card__title">{ev.title}</h3>
          <div className="event-card__meta">
            {ev.time     && <span className="event-card__meta-item"><Icon name="clock"    size={13} /> {ev.time}</span>}
            <span className="event-card__meta-item"><Icon name="location" size={13} /> {ev.location}</span>
            {ev.capacity && !isPast && (
              <span className="event-card__meta-item">
                <Icon name="users" size={13} /> {ev.capacity - (ev.registrations?.length || 0)} seats left
              </span>
            )}
          </div>
          {ev.description && (
            <p className="event-card__desc">{ev.description}</p>
          )}
        </div>
        {!isPast && (
          <div className="event-card__action">
            {isAuthenticated
              ? <button className="btn btn--primary btn--sm" onClick={() => handleRegister(ev._id)}>Register</button>
              : <a href="/register" className="btn btn--primary btn--sm">Register</a>
            }
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="events-page">
      <PageHeader
        dark
        title="Events & Programs"
        subtitle="Stay up to date with bootcamps, workshops, career fairs and academy events."
      />

      <section className="section">
        <div className="container">
          {loading && <LoadingSpinner label="Loading events..." />}
          {error   && <Alert type="error" onClose={refetch}>Failed to load events. <button className="btn btn--ghost btn--sm" onClick={refetch}>Retry</button></Alert>}

          {!loading && !error && (
            <>
              <h2 className="events-section-title">Upcoming Events</h2>
              {upcoming.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-2xl)' }}>
                  No upcoming events at this time.
                </p>
              ) : (
                <div className="events-grid">
                  {upcoming.map((ev) => <EventCard key={ev._id} ev={ev} isPast={false} />)}
                </div>
              )}

              {past.length > 0 && (
                <>
                  <h2 className="events-section-title" style={{ marginTop: 'var(--space-3xl)' }}>Past Events</h2>
                  <div className="events-grid">
                    {past.map((ev) => <EventCard key={ev._id} ev={ev} isPast={true} />)}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default Events;
