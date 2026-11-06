import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import './InactivityWarning.css';

/**
 * InactivityWarning
 * Shows a countdown modal warning the user they will be logged out.
 *
 * Props:
 *   isOpen        — bool
 *   onStayLoggedIn — function (user clicked "Stay Logged In")
 *   onLogoutNow    — function (user clicked "Logout Now")
 *   secondsLeft    — number  (seconds until forced logout)
 */
function InactivityWarning({ isOpen, onStayLoggedIn, onLogoutNow, secondsLeft = 300 }) {
  const [countdown, setCountdown] = useState(secondsLeft);

  // Countdown timer
  useEffect(() => {
    if (!isOpen) { setCountdown(secondsLeft); return; }
    setCountdown(secondsLeft);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, secondsLeft]);

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const timeStr = minutes > 0
    ? `${minutes}:${String(seconds).padStart(2, '0')} minutes`
    : `${seconds} second${seconds !== 1 ? 's' : ''}`;

  const urgency = countdown <= 60; // red when under 1 minute

  if (!isOpen) return null;

  return (
    <div className="inactivity-overlay" role="alertdialog" aria-modal="true" aria-labelledby="inactivity-title">
      <div className="inactivity-modal">
        {/* Icon */}
        <div className={`inactivity-modal__icon ${urgency ? 'inactivity-modal__icon--urgent' : ''}`}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>

        {/* Title */}
        <h2 id="inactivity-title" className="inactivity-modal__title">
          Session Expiring Soon
        </h2>

        {/* Message */}
        <p className="inactivity-modal__message">
          You have been inactive. For your security, you will be automatically
          logged out in:
        </p>

        {/* Countdown */}
        <div className={`inactivity-modal__countdown ${urgency ? 'inactivity-modal__countdown--urgent' : ''}`}>
          {timeStr}
        </div>

        <p className="inactivity-modal__hint">
          Click <strong>Stay Logged In</strong> to continue your session.
        </p>

        {/* Actions */}
        <div className="inactivity-modal__actions">
          <Button variant="ghost" onClick={onLogoutNow}>
            Logout Now
          </Button>
          <Button onClick={onStayLoggedIn}>
            Stay Logged In
          </Button>
        </div>
      </div>
    </div>
  );
}

export default InactivityWarning;
