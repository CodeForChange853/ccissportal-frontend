import React, { useState, useEffect, useCallback } from 'react';
import client from '../api/client';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);

    const load = useCallback(async () => {
        try {
            const data = await client.get('/notifications/my');
            setNotifications(data.data ?? []);
        } catch { /* silent */ }
    }, []);

    // Disabled polling to prevent backend spam since it is currently non-functional
    useEffect(() => { 
        // load(); 
        // const t = setInterval(load, 60_000); 
        // return () => clearInterval(t); 
    }, [load]);

    const dismiss = async (id) => {
        await client.post(`/notifications/mark-read/${id}`);
        setNotifications(prev => prev.filter(n => n.notification_id !== id));
    };

    const PRIORITY_COLOR = { URGENT: '#dc2626', HIGH: '#d97706', NORMAL: 'var(--accent)', LOW: 'var(--text-muted)' };

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    position: 'relative',
                    width: 32, height: 32,
                    background: 'transparent',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--border-radius-md)',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--bg-depth)';
                    e.currentTarget.style.borderColor = 'var(--border-strong)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'var(--border-default)';
                    e.currentTarget.style.color = 'var(--text-muted)';
                }}
            >
                <svg width="15" height="15" viewBox="0 0 18 18" fill="none"
                    stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 16c.83 0 1.5-.67 1.5-1.5h-3c0 .83.67 1.5 1.5 1.5z"/>
                    <path d="M13.5 12V8.5C13.5 6.01 12.18 4.04 10.12 3.46V3c0-.62-.51-1.12-1.12-1.12S7.88 2.38 7.88 3v.46C5.82 4.04 4.5 6.01 4.5 8.5V12l-1.5 1.5v.75h12v-.75L13.5 12z"/>
                </svg>
                {notifications.length > 0 && (
                    <span style={{
                        position: 'absolute', top: -4, right: -4,
                        background: 'var(--color-danger)',
                        color: '#fff',
                        borderRadius: 20,
                        minWidth: 16, height: 16,
                        fontSize: '0.58rem', fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '0 4px',
                        border: '2px solid var(--bg-topbar)',
                    }}>
                        {notifications.length > 9 ? '9+' : notifications.length}
                    </span>
                )}
            </button>
            {open && (
                <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                    width: 320,
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--border-radius-lg)',
                    boxShadow: 'var(--shadow-modal)',
                    zIndex: 9000,
                    maxHeight: 420, overflowY: 'auto',
                }}>
                    <div style={{
                        padding: '14px 16px 12px',
                        borderBottom: '1px solid var(--border-subtle)',
                        fontSize: '0.78rem', fontWeight: 600,
                        color: 'var(--text-primary)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                        Notifications
                    </div>
                    {notifications.length === 0 && (
                        <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.2rem', marginBottom: 6, color: 'var(--color-success)' }}>✓</div>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>You're all caught up</p>
                        </div>
                    )}
                    {notifications.map((n, idx) => (
                        <div
                            key={n.notification_id}
                            style={{
                                padding: '12px 16px',
                                borderBottom: idx < notifications.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                                transition: 'background 0.12s',
                                cursor: 'default',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-depth)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <span style={{
                                    fontWeight: 600, fontSize: '0.78rem',
                                    color: PRIORITY_COLOR[n.priority] || 'inherit',
                                }}>
                                    {n.title}
                                </span>
                                <button
                                    onClick={() => dismiss(n.notification_id)}
                                    style={{
                                        background: 'transparent', border: 'none',
                                        cursor: 'pointer', color: 'var(--text-muted)',
                                        fontSize: 16, lineHeight: 1,
                                        padding: '2px 4px', borderRadius: 4,
                                        transition: 'background 0.12s, color 0.12s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-depth)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                                >
                                    ×
                                </button>
                            </div>
                            <p style={{
                                margin: 0, marginTop: 3,
                                fontSize: '0.73rem', color: 'var(--text-secondary)',
                                lineHeight: 1.5,
                            }}>
                                {n.message}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
export default NotificationBell;