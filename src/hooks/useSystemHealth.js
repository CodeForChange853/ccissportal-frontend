import { useState, useEffect, useCallback, useRef } from 'react';
import client from '../api/client';

// How long between normal polls (ms)
const NORMAL_INTERVAL = 60_000;
// How long between polls when something is wrong (ms) — poll faster to catch recovery
const DEGRADED_INTERVAL = 8_000;
// How many consecutive failures before we believe the server is really down
// Set to 1 so a single 502/503/504 during a Render redeploy is caught immediately
const FAILURE_THRESHOLD = 1;

export const useSystemHealth = (intervalMs = NORMAL_INTERVAL) => {
  const [status, setStatus] = useState('CHECKING'); // CHECKING | ONLINE | OFFLINE | MAINTENANCE | DEPLOYING
  const [errorType, setErrorType] = useState(null);
  const [lastChecked, setLastChecked] = useState(new Date());
  const [enrollmentOpen, setEnrollmentOpen] = useState(false);

  // Internal counters kept in refs so they never cause re-renders or stale closures
  const failCount = useRef(0);       // consecutive failures
  const intervalRef = useRef(null);    // current setInterval handle
  const statusRef = useRef('CHECKING'); // mirror of status for use inside callbacks

  const updateStatus = useCallback((next) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  // ─── Core check ────────────────────────────────────────────────────────────
  const checkHealth = useCallback(async () => {
    // 1. Instant offline detection via browser navigator — no network request needed
    if (!window.navigator.onLine) {
      failCount.current += 1;
      if (failCount.current >= FAILURE_THRESHOLD) {
        updateStatus('OFFLINE');
        setErrorType('NETWORK_OFFLINE');
      }
      setLastChecked(new Date());
      return;
    }

    try {
      const response = await client.checkSystemStatus();

      if (response.status === 200) {
        const data = response.data;

        // ── SUCCESS: reset failure counter and mark online ─────────────────
        failCount.current = 0;
        updateStatus('ONLINE');
        setErrorType(null);
        setEnrollmentOpen(!!data.enrollment_open);

        // If server explicitly reports maintenance mode via response body
        if (data.maintenance_mode) {
          updateStatus('MAINTENANCE');
        }
      }
    } catch (error) {
      failCount.current += 1;

      // ── Classify the error ────────────────────────────────────────────────
      const httpStatus = error.response?.status;

      // Render cold-start / deployment signals
      const isDeploying = httpStatus === 502 || httpStatus === 504;
      // Explicit maintenance / temporary unavailable
      const isMaintenance = httpStatus === 503
        || error.response?.data?.detail === 'SERVER_MAINTENANCE_OR_RESTARTING'
        || error.response?.headers?.['retry-after'] != null;
      // Request timed out before server responded (common during Render restart)
      const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout');
      // CORS / no response at all (server is hard down)
      const isNetworkDead = !error.response;

      // Only flip status once we hit the threshold — prevents a single flaky
      // request from crying wolf, but with threshold=1 this fires immediately.
      if (failCount.current >= FAILURE_THRESHOLD) {
        if (isMaintenance) {
          updateStatus('MAINTENANCE');
          setErrorType('MAINTENANCE');
        } else if (isDeploying || isTimeout) {
          // 502/504 on Render = new container spinning up = deploying
          updateStatus('DEPLOYING');
          setErrorType('DEPLOYING');
        } else if (isNetworkDead) {
          updateStatus('OFFLINE');
          setErrorType('NETWORK_DEAD');
        } else {
          updateStatus('OFFLINE');
          setErrorType(`HTTP_${httpStatus || 'UNKNOWN'}`);
        }
      }
    } finally {
      setLastChecked(new Date());
    }
  }, [updateStatus]);

  // ─── Adaptive polling ───────────────────────────────────────────────────────
  // When the system is degraded we poll faster so we catch recovery quickly.
  // When healthy we fall back to the normal (slower) interval to save resources.
  useEffect(() => {
    const isUnhealthy = statusRef.current !== 'ONLINE' && statusRef.current !== 'CHECKING';
    const interval = isUnhealthy ? DEGRADED_INTERVAL : intervalMs;

    // Clear the old interval and start a new one with the right cadence
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(checkHealth, interval);

    return () => clearInterval(intervalRef.current);
  }, [status, intervalMs, checkHealth]); // re-run when status changes so cadence updates

  // ─── Initial check on mount ─────────────────────────────────────────────────
  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  // ─── Browser online/offline events ─────────────────────────────────────────
  // React immediately when the browser itself reports a connectivity change.
  useEffect(() => {
    const handleOffline = () => {
      updateStatus('OFFLINE');
      setErrorType('NETWORK_OFFLINE');
    };
    const handleOnline = () => {
      // Don't flip to ONLINE yet — let the next health check confirm the backend is up
      checkHealth();
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [checkHealth, updateStatus]);

  return {
    isSystemUp: status === 'ONLINE',
    status,
    errorType,
    lastChecked,
    enrollmentOpen,
    loading: status === 'CHECKING',
    refresh: checkHealth,
  };
};

export default useSystemHealth;