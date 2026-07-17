import React, { useState, useEffect, useRef } from 'react';
import { AdmissionsIcon, FacultyIcon, ShieldIcon, SupportIcon } from '../../../components/icons';
import { useSystemHealth } from '../../../hooks/useSystemHealth';

// ── Inline icons not yet in icons/index.jsx
const BellIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 2a5 5 0 015 5v3l1.5 2.5H2.5L4 10V7a5 5 0 015-5z" />
        <path d="M7 15.5a2 2 0 004 0" />
    </svg>
);

const PlusIcon = ({ size = 15 }) => (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M9 3v12M3 9h12" />
    </svg>
);

const ChevronDownIcon = ({ size = 10 }) => (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M2 3.5L5 6.5L8 3.5" />
    </svg>
);

// ── Quick actions that navigate to the relevant admin page
const QUICK_ACTIONS = [
    { id: 'enrollment', label: 'New Enrollment',    Icon: AdmissionsIcon, path: '/portal/admin/admissions' },
    { id: 'faculty',    label: 'Add Faculty',       Icon: FacultyIcon,    path: '/portal/admin/settings'   },
    { id: 'alert',      label: 'Post System Alert', Icon: ShieldIcon,     path: '/portal/admin/settings'   },
    { id: 'support',    label: 'New Support Ticket',Icon: SupportIcon,    path: '/portal/admin/support'    },
];

// ── Shared glassmorphic dark dropdown base
const glassPanel = {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    background: 'rgba(11, 11, 14, 0.94)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(186, 151, 49, 0.16)',
    borderRadius: 10,
    boxShadow: '0 12px 40px rgba(0,0,0,0.50), 0 0 0 1px rgba(255,255,255,0.04)',
    zIndex: 300,
    overflow: 'hidden',
};

const KEYFRAMES = `
@keyframes dropdownReveal {
    from { opacity: 0; transform: translateY(-5px) scale(0.975); }
    to   { opacity: 1; transform: translateY(0)    scale(1); }
}
@keyframes pulseDot {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.45; }
}
`;

// ── Reusable icon button for the bar
function BarBtn({ title, onClick, active, badge, children }) {
    const [hovered, setHovered] = useState(false);
    const isOn = active || hovered;
    return (
        <button
            title={title}
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                position: 'relative',
                width: 30, height: 30,
                borderRadius: 7,
                border: active ? '1px solid var(--border-accent)' : '1px solid transparent',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: active ? 'var(--accent-dim)' : isOn ? 'var(--bg-depth)' : 'transparent',
                color: active ? 'var(--accent-gold)' : isOn ? 'var(--text-primary)' : 'var(--text-muted)',
                transition: 'background 0.15s, color 0.15s, border-color 0.15s',
                padding: 0, flexShrink: 0,
            }}
        >
            {children}
            {badge > 0 && (
                <span style={{
                    position: 'absolute', top: 2, right: 2,
                    minWidth: 13, height: 13, borderRadius: 7,
                    background: 'var(--color-danger)',
                    border: '1.5px solid var(--bg-surface)',
                    fontSize: '0.50rem', fontWeight: 700,
                    color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-code)',
                    padding: '0 2px',
                    lineHeight: 1,
                }}>
                    {badge > 9 ? '9+' : badge}
                </span>
            )}
        </button>
    );
}

// ── System Health pill — live, driven by useSystemHealth hook
function SystemHealthPill({ onNavigate }) {
    const { status, latency } = useSystemHealth();

    // Map hook status → pill variant
    const variant = (() => {
        if (status === 'OFFLINE' || status === 'DEPLOYING') return 'critical';
        if (status === 'MAINTENANCE' || status === 'CHECKING') return 'degraded';
        return 'nominal';
    })();

    const DOT  = { nominal: 'var(--color-success)', degraded: 'var(--color-warning)', critical: 'var(--color-danger)' };
    const BG   = { nominal: 'var(--color-success-bg)', degraded: 'var(--color-warning-bg)', critical: 'var(--color-danger-bg)' };
    const BD   = { nominal: 'var(--color-success-bd)', degraded: 'var(--color-warning-bd)', critical: 'var(--color-danger-bd)' };
    const TEXT = {
        nominal:  latency > 0 ? `${latency}ms` : 'Systems OK',
        degraded: status === 'MAINTENANCE' ? 'Maintenance' : status === 'CHECKING' ? 'Checking…' : 'Degraded',
        critical: status === 'DEPLOYING' ? 'Deploying…' : 'Offline',
    };

    return (
        <div
            title={`System ${status.toLowerCase()} · Click for System Controls`}
            onClick={() => variant !== 'nominal' && onNavigate?.('/portal/admin/settings')}
            style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '4px 9px',
                background: BG[variant],
                border: `1px solid ${BD[variant]}`,
                borderRadius: 20,
                cursor: variant !== 'nominal' ? 'pointer' : 'default',
                userSelect: 'none',
                transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => { if (variant !== 'nominal') e.currentTarget.style.opacity = '0.80'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
        >
            <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: DOT[variant],
                boxShadow: `0 0 5px ${DOT[variant]}`,
                animation: 'pulseDot 2.4s ease-in-out infinite',
                flexShrink: 0,
            }} />
            <span style={{
                fontSize: '0.60rem', fontFamily: 'var(--font-code)',
                color: DOT[variant], letterSpacing: '0.04em', whiteSpace: 'nowrap',
            }}>
                {TEXT[variant]}
            </span>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// Props:
//   logs        — string[] from AdminLayout (activity feed entries)
//   onSearchOpen — () => void, opens CommandPalette
//   onNavigate  — (path: string) => void, navigates to page
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminQuickNav({ logs = [], onSearchOpen, onNavigate }) {
    const [addOpen,   setAddOpen]   = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [unread,    setUnread]    = useState(0);
    const addRef   = useRef(null);
    const notifRef = useRef(null);
    const prevLen  = useRef(logs.length);

    // bump unread badge when new logs arrive while bell is closed
    useEffect(() => {
        if (logs.length > prevLen.current && !notifOpen) {
            setUnread(u => u + (logs.length - prevLen.current));
        }
        prevLen.current = logs.length;
    }, [logs, notifOpen]);

    // clear badge when user opens the feed
    useEffect(() => {
        if (notifOpen) setUnread(0);
    }, [notifOpen]);

    // close dropdowns on outside click
    useEffect(() => {
        const handler = (e) => {
            if (addRef.current   && !addRef.current.contains(e.target))   setAddOpen(false);
            if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <>
            <style>{KEYFRAMES}</style>

            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>

                {/* ── Global Add (+) ─────────────────────────────────────── */}
                <div ref={addRef} style={{ position: 'relative' }}>
                    <button
                        title="Quick Actions"
                        onClick={() => { setAddOpen(v => !v); setNotifOpen(false); }}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            padding: '5px 9px',
                            height: 30,
                            borderRadius: 7,
                            border: addOpen ? '1px solid var(--border-accent)' : '1px solid var(--border-default)',
                            cursor: 'pointer',
                            background: addOpen ? 'var(--accent-dim)' : 'var(--bg-surface)',
                            color: addOpen ? 'var(--accent-gold)' : 'var(--text-muted)',
                            fontSize: '0.70rem',
                            fontFamily: 'var(--font-display)',
                            fontWeight: 500,
                            transition: 'all 0.15s',
                            flexShrink: 0,
                        }}
                        onMouseEnter={e => {
                            if (!addOpen) {
                                e.currentTarget.style.borderColor = 'var(--border-accent)';
                                e.currentTarget.style.color = 'var(--accent-gold)';
                                e.currentTarget.style.background = 'var(--accent-dim)';
                            }
                        }}
                        onMouseLeave={e => {
                            if (!addOpen) {
                                e.currentTarget.style.borderColor = 'var(--border-default)';
                                e.currentTarget.style.color = 'var(--text-muted)';
                                e.currentTarget.style.background = 'var(--bg-surface)';
                            }
                        }}
                    >
                        <PlusIcon size={13} />
                        <span>Add</span>
                        <ChevronDownIcon size={9} />
                    </button>

                    {addOpen && (
                        <div style={{ ...glassPanel, left: 0, minWidth: 210, animation: 'dropdownReveal 0.14s cubic-bezier(0.16,1,0.3,1) both' }}>
                            <div style={{ padding: '8px 12px 6px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                <span style={{ fontSize: '0.58rem', fontFamily: 'var(--font-code)', color: 'rgba(186,151,49,0.75)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                    Quick Actions
                                </span>
                            </div>
                            {QUICK_ACTIONS.map(({ id, label, Icon, path }) => (
                                <QuickActionRow
                                    key={id}
                                    label={label}
                                    Icon={Icon}
                                    onClick={() => { onNavigate?.(path); setAddOpen(false); }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Notification Bell ──────────────────────────────────── */}
                <div ref={notifRef} style={{ position: 'relative' }}>
                    <BarBtn
                        title="Activity Feed"
                        onClick={() => { setNotifOpen(v => !v); setAddOpen(false); }}
                        active={notifOpen}
                        badge={unread}
                    >
                        <BellIcon size={14} />
                    </BarBtn>

                    {notifOpen && (
                        <div style={{ ...glassPanel, right: 0, width: 300, animation: 'dropdownReveal 0.14s cubic-bezier(0.16,1,0.3,1) both' }}>
                            {/* header */}
                            <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.60rem', fontFamily: 'var(--font-code)', color: 'rgba(186,151,49,0.8)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                    Activity Feed
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#16a34a', boxShadow: '0 0 5px rgba(22,163,74,0.7)', animation: 'pulseDot 2s ease-in-out infinite' }} />
                                    <span style={{ fontSize: '0.58rem', fontFamily: 'var(--font-code)', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em' }}>LIVE</span>
                                </div>
                            </div>

                            {/* entries */}
                            <div style={{ maxHeight: 264, overflowY: 'auto' }}>
                                {logs.length === 0 ? (
                                    <div style={{ padding: '24px 14px', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem', fontFamily: 'var(--font-code)' }}>
                                        No activity yet
                                    </div>
                                ) : (
                                    logs.map((entry, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                padding: '9px 14px',
                                                borderBottom: '1px solid rgba(255,255,255,0.04)',
                                                display: 'flex', alignItems: 'flex-start', gap: 9,
                                                transition: 'background 0.12s',
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                        >
                                            <span style={{
                                                width: 6, height: 6, borderRadius: '50%', flexShrink: 0, marginTop: 5,
                                                background: i === 0 ? 'var(--accent-gold)' : 'rgba(255,255,255,0.18)',
                                                boxShadow: i === 0 ? '0 0 5px rgba(186,151,49,0.5)' : 'none',
                                            }} />
                                            <span style={{
                                                fontSize: '0.70rem',
                                                fontFamily: 'var(--font-code)',
                                                color: i === 0 ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.40)',
                                                lineHeight: 1.55,
                                                wordBreak: 'break-all',
                                            }}>
                                                {entry}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* footer */}
                            <div style={{ padding: '7px 14px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontSize: '0.58rem', fontFamily: 'var(--font-code)', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.04em' }}>
                                    Auto-polls every 90 s
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── System Health ───────────────────────────────────────── */}
                <SystemHealthPill onNavigate={onNavigate} />

            </div>
        </>
    );
}

// ── Private helper
function QuickActionRow({ label, Icon, onClick }) {
    const [hovered, setHovered] = useState(false);
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 14px', border: 'none', cursor: 'pointer',
                background: hovered ? 'rgba(186,151,49,0.08)' : 'transparent',
                color: hovered ? '#fff' : 'rgba(255,255,255,0.65)',
                fontSize: '0.78rem',
                fontFamily: 'var(--font-display)',
                textAlign: 'left',
                transition: 'background 0.12s, color 0.12s',
            }}
        >
            <span style={{ color: 'rgba(186,151,49,0.70)', display: 'flex', flexShrink: 0 }}>
                <Icon size={13} />
            </span>
            {label}
        </button>
    );
}
