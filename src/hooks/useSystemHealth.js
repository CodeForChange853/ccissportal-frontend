import { useState, useEffect, useCallback, useRef } from 'react';
import client from '../api/client';

const NORMAL_INTERVAL = 60_000;
const DEGRADED_INTERVAL = 8_000;
const FAILURE_THRESHOLD = 1;

export const useSystemHealth = (intervalMs = NORMAL_INTERVAL) => {
  const [status, setStatus] = useState('CHECKING'); 
  const [errorType, setErrorType] = useState(null);
  const [lastChecked, setLastChecked] = useState(new Date());
  const [enrollmentOpen, setEnrollmentOpen] = useState(false);
  const [latency, setLatency] = useState(0);
  const [frontendStatus, setFrontendStatus] = useState('ONLINE');
  const [dbStatus, setDbStatus] = useState('ONLINE');
  const failCount = useRef(0);       
  const intervalRef = useRef(null);    
  const statusRef = useRef('CHECKING'); 

  const updateStatus = useCallback((next) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  //  Core check 
  const checkHealth = useCallback(async () => {
    if (!window.navigator.onLine) {
      failCount.current += 1;
      if (failCount.current >= FAILURE_THRESHOLD) {
        updateStatus('OFFLINE');
        setErrorType('NETWORK_OFFLINE');
        setFrontendStatus('OFFLINE');
        setDbStatus('OFFLINE');
      }
      setLastChecked(new Date());
      return;
    }

    try {
      await fetch(window.location.origin, { method: 'HEAD', cache: 'no-store' });
      setFrontendStatus('ONLINE');
    } catch (e) {
      setFrontendStatus('OFFLINE');
    }

    const start = performance.now();
    try {
      const response = await client.checkSystemStatus();
      const end = performance.now();
      setLatency(Math.round(end - start));

      if (response.status === 200) {
        const data = response.data;

        failCount.current = 0;
        updateStatus('ONLINE');
        setErrorType(null);
        setEnrollmentOpen(!!data.enrollment_open);
        setDbStatus(data.database_status || 'ONLINE');

        if (data.maintenance_mode) {
          updateStatus('MAINTENANCE');
        }
      }
    } catch (error) {
      failCount.current += 1;
      setDbStatus('OFFLINE');
      setLatency(0);

      const httpStatus = error.response?.status;

      const isDeploying = httpStatus === 502 || httpStatus === 504;
      const isMaintenance = httpStatus === 503
        || error.response?.data?.detail === 'SERVER_MAINTENANCE_OR_RESTARTING'
        || error.response?.headers?.['retry-after'] != null;
      const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout');
      const isNetworkDead = !error.response;

      if (failCount.current >= FAILURE_THRESHOLD) {
        if (isMaintenance) {
          updateStatus('MAINTENANCE');
          setErrorType('MAINTENANCE');
        } else if (isDeploying || isTimeout) {
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

  useEffect(() => {
    const isUnhealthy = statusRef.current !== 'ONLINE' && statusRef.current !== 'CHECKING';
    const interval = isUnhealthy ? DEGRADED_INTERVAL : intervalMs;

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(checkHealth, interval);

    return () => clearInterval(intervalRef.current);
  }, [status, intervalMs, checkHealth]);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  useEffect(() => {
    const handleOffline = () => {
      updateStatus('OFFLINE');
      setErrorType('NETWORK_OFFLINE');
    };
    const handleOnline = () => {
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
    latency,
    frontendStatus,
    dbStatus,
    loading: status === 'CHECKING',
    refresh: checkHealth,
  };
};

export default useSystemHealth;