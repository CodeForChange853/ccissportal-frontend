import React, { useState, useEffect } from 'react';

const OfflineBanner = () => {
    const [offline, setOffline] = useState(!navigator.onLine);
    const [justReconnected, setJustReconnected] = useState(false);

    useEffect(() => {
        const handleOffline = () => {
            setOffline(true);
            setJustReconnected(false);
        };
        const handleOnline = () => {
            setOffline(false);
            setJustReconnected(true);
            const t = setTimeout(() => setJustReconnected(false), 3000);
            return () => clearTimeout(t);
        };

        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);
        return () => {
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
        };
    }, []);

    if (!offline && !justReconnected) return null;

    return (
        <div
            role="status"
            aria-live="polite"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 99999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '7px 16px',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.06em',
                fontFamily: "'Inter', system-ui, sans-serif",
                textTransform: 'uppercase',
                transition: 'background 0.3s, color 0.3s',
                background: offline ? 'rgba(192, 38, 38, 0.88)' : 'rgba(16, 148, 64, 0.88)',
                color: '#fff',
                backdropFilter: 'blur(16px) saturate(150%)',
                WebkitBackdropFilter: 'blur(16px) saturate(150%)',
                boxShadow: offline
                    ? '0 2px 16px rgba(192,38,38,.35)'
                    : '0 2px 16px rgba(16,148,64,.3)',
            }}
        >
            <span style={{
                width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                background: '#fff',
                animation: offline ? 'pulse-dot 1.5s ease-in-out infinite' : 'none',
            }} />
            {offline
                ? 'You are offline — cached content is available'
                : 'Back online'}
        </div>
    );
};

export default OfflineBanner;
