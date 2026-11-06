import { useEffect, useRef, useCallback } from 'react';

/**
 * useInactivityLogout
 * Automatically logs out the user after a period of inactivity.
 *
 * @param {object} options
 * @param {boolean}  options.enabled         - Only runs when user is authenticated
 * @param {number}   options.timeoutMs       - Inactivity timeout in ms (default: 40 min)
 * @param {number}   options.warningMs       - Show warning this many ms before logout (default: 5 min)
 * @param {function} options.onLogout        - Called when timeout expires (perform the actual logout)
 * @param {function} options.onWarning       - Called when warning threshold is reached
 * @param {function} options.onActivity      - Called when user activity resets the timer (optional)
 */
function useInactivityLogout({
  enabled     = false,
  timeoutMs   = 40 * 60 * 1000,  // 40 minutes
  warningMs   = 5  * 60 * 1000,  // warn 5 minutes before
  onLogout,
  onWarning,
  onActivity,
}) {
  const logoutTimer  = useRef(null);
  const warningTimer = useRef(null);
  const warned       = useRef(false);

  const clearTimers = useCallback(() => {
    if (logoutTimer.current)  clearTimeout(logoutTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);
  }, []);

  const resetTimers = useCallback(() => {
    if (!enabled) return;

    clearTimers();
    warned.current = false;

    onActivity?.();

    // Warning timer — fires (timeoutMs - warningMs) after last activity
    warningTimer.current = setTimeout(() => {
      if (!warned.current) {
        warned.current = true;
        onWarning?.();
      }
    }, timeoutMs - warningMs);

    // Logout timer — fires timeoutMs after last activity
    logoutTimer.current = setTimeout(() => {
      onLogout?.();
    }, timeoutMs);
  }, [enabled, timeoutMs, warningMs, onLogout, onWarning, onActivity, clearTimers]);

  useEffect(() => {
    if (!enabled) {
      clearTimers();
      return;
    }

    // Activity events to monitor
    const events = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'scroll',
      'click',
      'wheel',
    ];

    // Throttle: only reset timer if more than 10s have passed since last reset
    let lastReset = 0;
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastReset > 10_000) {
        lastReset = now;
        resetTimers();
      }
    };

    // Start the initial timers
    resetTimers();

    // Attach listeners
    events.forEach((ev) =>
      window.addEventListener(ev, handleActivity, { passive: true })
    );

    // Handle tab visibility — pause/resume on hidden/visible
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        resetTimers();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearTimers();
      events.forEach((ev) =>
        window.removeEventListener(ev, handleActivity)
      );
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [enabled, resetTimers, clearTimers]);
}

export default useInactivityLogout;
