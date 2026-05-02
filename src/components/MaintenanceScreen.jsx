// frontend/src/components/MaintenanceScreen.jsx


import React, { useEffect, useState } from 'react';

const MaintenanceScreen = () => {
    const [dots, setDots] = useState('');

    // Animated ellipsis
    useEffect(() => {
        const id = setInterval(() => {
            setDots(d => d.length >= 3 ? '' : d + '.');
        }, 500);
        return () => clearInterval(id);
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-base, #0f1117)',
            padding: '24px',
            gap: 24,
        }}>
            {/* Pulsing icon */}
            <div style={{
                width: 72, height: 72,
                borderRadius: '50%',
                background: 'var(--accent-dim, rgba(157,78,221,0.12))',
                border: '1px solid var(--border-accent, rgba(157,78,221,0.3))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'pulse-ring 2s ease-in-out infinite',
            }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                    stroke="var(--accent, #9d4edd)" strokeWidth="1.5"
                    strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
            </div>

            {/* Heading */}
            <div style={{ textAlign: 'center', maxWidth: 480 }}>
                <h1 style={{
                    fontFamily: 'var(--font-display, monospace)',
                    fontSize: '1.4rem',
                    fontWeight: 900,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: 'var(--text-primary, #f0ede8)',
                    marginBottom: 12,
                }}>
                    System Maintenance
                </h1>
                <p style={{
                    fontFamily: 'var(--font-terminal, monospace)',
                    fontSize: '0.80rem',
                    color: 'var(--text-muted, #888)',
                    lineHeight: 1.7,
                }}>
                    The University Campus AI System is currently undergoing scheduled
                    maintenance. We'll be back shortly.
                </p>
            </div>

            {/* Status chip */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 18px',
                background: 'var(--bg-surface, #1a1d2e)',
                border: '1px solid var(--border-default, rgba(255,255,255,0.08))',
                borderRadius: 8,
            }}>
                <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: 'var(--color-warning, #f59e0b)',
                    animation: 'blink 1.2s ease-in-out infinite',
                    flexShrink: 0,
                }} />
                <span style={{
                    fontFamily: 'var(--font-terminal, monospace)',
                    fontSize: '0.72rem',
                    letterSpacing: '0.12em',
                    color: 'var(--color-warning, #f59e0b)',
                }}>
                    MAINTENANCE IN PROGRESS{dots}
                </span>
            </div>

            {/* Retry link */}
            <button
                onClick={() => window.location.reload()}
                style={{
                    marginTop: 8,
                    background: 'transparent',
                    border: '1px solid var(--border-default, rgba(255,255,255,0.08))',
                    borderRadius: 6,
                    padding: '8px 20px',
                    fontFamily: 'var(--font-terminal, monospace)',
                    fontSize: '0.68rem',
                    letterSpacing: '0.10em',
                    color: 'var(--text-muted, #888)',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s, color 0.15s',
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--border-accent, rgba(157,78,221,0.4))';
                    e.currentTarget.style.color = 'var(--text-primary, #f0ede8)';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border-default, rgba(255,255,255,0.08))';
                    e.currentTarget.style.color = 'var(--text-muted, #888)';
                }}
            >
                TRY AGAIN
            </button>

            <style>{`
                @keyframes pulse-ring {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(157,78,221,0.2); }
                    50%       { box-shadow: 0 0 0 12px rgba(157,78,221,0); }
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50%       { opacity: 0.3; }
                }
            `}</style>
        </div>
    );
};

export default MaintenanceScreen;