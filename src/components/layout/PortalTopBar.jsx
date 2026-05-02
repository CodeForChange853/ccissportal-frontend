// frontend/src/components/layout/PortalTopBar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../NotificationBell';

// ── Icons 
const RefreshIcon = ({ spinning }) => (
    <svg
        width="14" height="14"
        viewBox="0 0 18 18" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={spinning ? { animation: 'spin 1s linear infinite' } : {}}
    >
        <path d="M16 3v5h-5" />
        <path d="M2 15v-5h5" />
        <path d="M15.4 9A7 7 0 1114 5.3L16 3" />
    </svg>
);

const UserAvatar = ({ name, role }) => {
    const initials = name
        ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : 'CA';

    return (
        <div style={{
            width: 28, height: 28,
            borderRadius: '50%',
            background: 'var(--accent-dim)',
            border: '1px solid var(--border-accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent)', fontWeight: 600, fontSize: '0.70rem'
        }}>
            {initials}
        </div>
    );
};

// ── Component 
export default function PortalTopBar({ breadcrumb = [], onRefresh, isRefreshing, rightContent }) {
    const { user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const displayName = user?.username || 'Crisse Ann B. Ambe';
    const displayRole = user?.role || 'Administrator';

    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        }}>
            {/* Left: Breadcrumbs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {breadcrumb.map((crumb, i) => (
                    <React.Fragment key={crumb}>
                        {i > 0 && <span style={{ color: 'var(--border-strong)', fontSize: '0.70rem' }}>›</span>}
                        <span style={{
                            fontSize: '0.80rem',
                            fontWeight: i === breadcrumb.length - 1 ? 600 : 400,
                            color: i === breadcrumb.length - 1 ? 'var(--text-primary)' : 'var(--text-muted)',
                            letterSpacing: '0.01em',
                        }}>
                            {crumb}
                        </span>
                    </React.Fragment>
                ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

                {rightContent && rightContent}

                {onRefresh && (
                    <button
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        style={{
                            background: 'transparent', border: 'none',
                            color: isRefreshing ? 'var(--accent)' : 'var(--text-muted)',
                            cursor: 'pointer', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', width: 32, height: 32,
                            borderRadius: 'var(--border-radius-md)',
                            transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { if (!isRefreshing) { e.currentTarget.style.background = 'var(--bg-depth)'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; if (!isRefreshing) e.currentTarget.style.color = 'var(--text-muted)'; }}
                    >
                        <RefreshIcon spinning={isRefreshing} />
                    </button>
                )}

                <div style={{ width: '1px', height: '20px', background: 'var(--border-default)' }}></div>

                <NotificationBell />

                <div style={{ position: 'relative' }} ref={menuRef}>
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        style={{
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px 4px 4px',
                            borderRadius: 'var(--border-radius-md)',
                            transition: 'background 0.15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-depth)'}
                        onMouseLeave={e => {
                            if (!menuOpen) e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        <UserAvatar name={displayName} role={displayRole} />
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round">
                            <path d="M2 4l3 3 3-3" />
                        </svg>
                    </button>

                    {menuOpen && (
                        <div style={{
                            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                            minWidth: '180px', background: 'var(--bg-surface)',
                            border: '1px solid var(--border-default)',
                            borderRadius: 'var(--border-radius-lg)',
                            boxShadow: 'var(--shadow-modal)', overflow: 'hidden',
                            zIndex: 200, padding: '6px'
                        }}>
                            <div style={{ padding: '8px 10px 10px', borderBottom: '1px solid var(--border-subtle)', marginBottom: 4 }}>
                                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {displayName}
                                </div>
                                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 1 }}>
                                    {displayRole}
                                </div>
                            </div>

                            <button style={{
                                width: '100%', textAlign: 'left', padding: '7px 10px',
                                background: 'transparent', border: 'none',
                                color: 'var(--text-secondary)', fontSize: '0.75rem',
                                borderRadius: 'var(--border-radius-sm)', cursor: 'pointer',
                                transition: 'background 0.1s, color 0.1s'
                            }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-depth)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                                Command Center
                            </button>

                            <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '4px 0' }} />

                            <button onClick={logout} style={{
                                width: '100%', textAlign: 'left', padding: '7px 10px',
                                background: 'transparent', border: 'none',
                                color: 'var(--color-danger)', fontSize: '0.75rem',
                                borderRadius: 'var(--border-radius-sm)', cursor: 'pointer',
                                transition: 'background 0.1s'
                            }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-danger-bg)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}