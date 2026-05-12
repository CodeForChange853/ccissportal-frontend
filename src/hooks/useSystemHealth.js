import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';


export const useSystemHealth = (intervalMs = 60000) => {
  const [status, setStatus] = useState('CHECKING'); // CHECKING, ONLINE, OFFLINE, MAINTENANCE
  const [errorType, setErrorType] = useState(null);
  const [lastChecked, setLastChecked] = useState(new Date());
  const [enrollmentOpen, setEnrollmentOpen] = useState(false);

  const [consensusCount, setConsensusCount] = useState(0);
  const [lastResponse, setLastResponse] = useState(null);

  const checkHealth = useCallback(async () => {
    try {
      if (!window.navigator.onLine) {
        setStatus('OFFLINE');
        setErrorType('NETWORK_OFFLINE');
        return;
      }

      const response = await client.checkSystemStatus();

      if (response.status === 200) {
        const newData = response.data;
        
        // Consensus Logic: Only change status if we get the same result consistently
        // or if it's the very first successful check.
        if (lastResponse === null) {
          setStatus('ONLINE');
          setErrorType(null);
          setEnrollmentOpen(newData.enrollment_open);
          setLastResponse(newData);
          setConsensusCount(1);
        } else if (newData.enrollment_open === lastResponse.enrollment_open && 
                   newData.maintenance_mode === lastResponse.maintenance_mode) {
          // Status is stable
          setStatus('ONLINE');
          setErrorType(null);
          setEnrollmentOpen(newData.enrollment_open);
        } else {
          // Detected a change! Wait for consensus (3 polls) before flipping UI
          if (consensusCount >= 2) {
            setEnrollmentOpen(newData.enrollment_open);
            setLastResponse(newData);
            setConsensusCount(0);
          } else {
            setConsensusCount(prev => prev + 1);
          }
        }
      }
    } catch (error) {
      // For errors, we keep the last known good state of enrollmentOpen 
      // but update the system status to alert the user.
      const respStatus = error.response?.status;
      const isMaintenance = respStatus === 503 || error === 'SERVER_MAINTENANCE_OR_RESTARTING';
      
      if (isMaintenance) {
        setStatus('MAINTENANCE');
      } else {
        setStatus('OFFLINE');
      }
    } finally {
      setLastChecked(new Date());
    }
  }, [lastResponse, consensusCount]);

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
    loading: status === 'CHECKING',
    refresh: checkHealth
  };
};

export default useSystemHealth;
