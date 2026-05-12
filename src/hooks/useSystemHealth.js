import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';


export const useSystemHealth = (intervalMs = 60000) => {
  const [status, setStatus] = useState('CHECKING'); // CHECKING, ONLINE, OFFLINE, MAINTENANCE
  const [errorType, setErrorType] = useState(null);
  const [lastChecked, setLastChecked] = useState(new Date());
  const [enrollmentOpen, setEnrollmentOpen] = useState(false);

  const checkHealth = useCallback(async () => {
    try {
      if (!window.navigator.onLine) {
        setStatus('OFFLINE');
        setErrorType('NETWORK_OFFLINE');
        return;
      }

      const response = await client.checkSystemStatus();

      if (response.status === 200) {
        setStatus('ONLINE');
        setErrorType(null);
        setEnrollmentOpen(response.data.enrollment_open);
      }
    } catch (error) {
      const respStatus = error.response?.status;
      const isMaintenance = respStatus === 503 || error === 'SERVER_MAINTENANCE_OR_RESTARTING';
      const isRestarting = [502, 504].includes(respStatus);

      if (isMaintenance) {
        setStatus('MAINTENANCE');
        setErrorType('SERVER_MAINTENANCE');
      } else if (isRestarting) {
        setStatus('MAINTENANCE');
        setErrorType('SERVER_RESTARTING');
      } else if (error === 'BACKEND_UNREACHABLE' || respStatus === 500) {
        setStatus('OFFLINE');
        setErrorType('BACKEND_UNREACHABLE');
      } else if (error === 'NETWORK_OFFLINE') {
        setStatus('OFFLINE');
        setErrorType('NETWORK_OFFLINE');
      } else {
        setStatus('OFFLINE');
        setErrorType('UNKNOWN_ERROR');
      }
    } finally {
      setLastChecked(new Date());
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, intervalMs);
    return () => clearInterval(interval);
  }, [checkHealth, intervalMs]);

  return {
    isSystemUp: status === 'ONLINE',
    status,
    errorType,
    lastChecked,
    enrollmentOpen,
    refresh: checkHealth
  };
};

export default useSystemHealth;
