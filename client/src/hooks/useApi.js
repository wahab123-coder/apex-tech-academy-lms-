import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useApi — generic hook for any API call.
 *
 * Usage (auto-fetch on mount):
 *   const { data, loading, error, refetch } = useApi(() => courseService.getAll());
 *
 * Usage (manual trigger):
 *   const { loading, error, execute } = useApi(() => courseService.create(form), { manual: true });
 *   await execute();
 *
 * Options:
 *   manual      — don't auto-fetch; call execute() yourself
 *   initialData — default value for data before the request resolves
 *   onSuccess   — callback(data) called when request succeeds
 *   onError     — callback(error) called when request fails
 *   deps        — dependency array that re-triggers the fetch (like useEffect deps)
 */
function useApi(apiFn, options = {}) {
  const {
    manual      = false,
    initialData = null,
    onSuccess   = null,
    onError     = null,
    deps        = [],
  } = options;

  const [data,    setData]    = useState(initialData);
  const [loading, setLoading] = useState(!manual);
  const [error,   setError]   = useState(null);

  // Prevent state updates on unmounted component
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const execute = useCallback(async (...args) => {
    if (mountedRef.current) { setLoading(true); setError(null); }
    try {
      const res    = await apiFn(...args);
      const result = res.data;
      if (mountedRef.current) {
        setData(result);
        onSuccess?.(result);
      }
      return result;
    } catch (err) {
      const msg = err.message || 'An error occurred.';
      if (mountedRef.current) {
        setError(msg);
        onError?.(msg);
      }
      throw err;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-fetch
  useEffect(() => {
    if (!manual) execute();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, execute, refetch: execute, setData };
}

export default useApi;
