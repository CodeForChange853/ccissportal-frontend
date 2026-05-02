// frontend/src/features/admin/layout/AdminSidebar.jsx
// Synthwave dark theme with 3-tone sidebar switch.

import React, { useState, useEffect } from 'react';
import {
    OverviewIcon, EnrollmentsIcon, GradingIcon,
    CurriculumIcon,
    AdmissionsIcon, SupportIcon, SettingsIcon,
    ShieldIcon, LogoutIcon, ChevronLeftIcon, ChevronRightIcon,
} from '../../../components/icons';

/* ── Nav structure ─────────────────────────────────────────────── */
const NAV_GROUPS = [
    {
        label: 'Core',
        items: [
            { id: 'overview', label: 'Overview', Icon: OverviewIcon, path: '/portal/admin' },
            { id: 'enrollments', label: 'Enrollments', Icon: EnrollmentsIcon, path: '/portal/admin/enrollments' },
            { id: 'grading', label: 'Grading', Icon: GradingIcon, path: '/portal/admin/grading' },
        ],
    },
    {
        label: 'Academics',
        items: [
            { id: 'curriculum', label: 'Curriculum', Icon: CurriculumIcon, path: '/portal/admin/curriculum' },
            { id: 'admissions', label: 'Admissions', Icon: AdmissionsIcon, path: '/portal/admin/admissions' },
        ],
    },
    {
        label: 'System',
        items: [
            { id: 'support', label: 'Support', Icon: SupportIcon, path: '/portal/admin/support' },
            { id: 'settings', label: 'Command Center', Icon: SettingsIcon, path: '/portal/admin/settings' },
            { id: 'audit', label: 'Audit Intel', Icon: ShieldIcon, path: '/portal/admin/audit' },
        ],
    },
];

/* ── Sidebar Tone Configs ──────────────────────────────────────── */
const SIDEBAR_TONES = [
    { id: 1, color: '#09061C', label: 'Seamless', bg: '#09061C' },
    { id: 2, color: '#2F1E4A', label: 'Elevated', bg: 'linear-gradient(180deg, #2F1E4A 0%, #150D2E 100%)' },
    { id: 3, color: '#554E6B', label: 'Soft Contrast', bg: '#554E6B' },
];

/* ── ToneSwitcher ──────────────────────────────────────────────── */
const ToneSwitcher = ({ activeTone, onToneChange }) => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {SIDEBAR_TONES.map(({ id, color, label }) => (
            <button
                key={id}
                onClick={() => onToneChange(id)}
                title={label}
                aria-label={`Sidebar tone: ${label}`}
                style={{
                    width: 20, height: 20,
                    borderRadius: '50%',
                    background: color,
                    border: activeTone === id
                        ? '2px solid #F40BE9'
                        : '2px solid rgba(85, 78, 107, 0.50)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: activeTone === id
                        ? '0 0 10px rgba(244, 11, 233, 0.35)'
                        : 'none',
                    outline: 'none',
                    padding: 0,
                    flexShrink: 0,
                }}
            />
        ))}
    </div>
);

/* ── NavItem ───────────────────────────────────────────────────── */
const NavItem = ({ item, isActive, isOpen, onClick, badge }) => {
    const { Icon } = item;
    return (
        <button
            onClick={() => onClick(item.path)}
            className={`nav-item ${isActive ? 'active' : ''}`}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            title={!isOpen ? item.label : undefined}
            style={!isOpen ? { justifyContent: 'center', padding: '8px', margin: '1px 8px' } : {}}
        >
            <span className="nav-icon" aria-hidden="true"><Icon /></span>
            {isOpen && <span className="nav-label">{item.label}</span>}
            {isOpen && badge > 0 && (
                <span className="nav-badge" aria-label={`${badge} pending`}>
                    {badge > 99 ? '99+' : badge}
                </span>
            )}
            {!isOpen && (
                <span className="nav-tooltip" role="tooltip">
                    {item.label}{badge > 0 ? ` (${badge})` : ''}
                </span>
            )}
        </button>
    );
};

/* ── getSidebarBackground ──────────────────────────────────────── */
const getSidebarBackground = (theme, tone) => {
    if (theme !== 'dark') return {};
    const toneConfig = SIDEBAR_TONES.find(t => t.id === tone) || SIDEBAR_TONES[1];
    return { background: toneConfig.bg };
};

/* ── AdminSidebar ──────────────────────────────────────────────── */
const AdminSidebar = ({
    activeTab, onNavigate, onLogout, user, isOpen, onToggle, badges = {},
    sidebarTone = 2, onToneChange, theme = 'light',
}) => {
    const sidebarStyle = getSidebarBackground(theme, sidebarTone);

    return (
        <aside
            className={`admin-sidebar ${isOpen ? 'open' : 'closed'}`}
            aria-label="Admin navigation"
            style={sidebarStyle}
        >

            {/* ── Brand ───────────────────────────────────────────── */}
            <div style={{
                padding: isOpen ? '18px 18px 14px' : '18px 0 14px',
                borderBottom: '1px solid var(--sidebar-border)',
                display: 'flex', alignItems: 'center', gap: 10,
                justifyContent: isOpen ? 'space-between' : 'center',
                transition: 'padding 0.25s', minHeight: 68, flexShrink: 0,
            }}>
                {isOpen && (
                    <div style={{ overflow: 'hidden' }}>
                        <p style={{
                            fontWeight: 700, fontSize: '0.92rem',
                            letterSpacing: '-0.01em', lineHeight: 1.1,
                            color: 'var(--sidebar-logo-text)',
                            whiteSpace: 'nowrap',
                            fontFamily: 'var(--font-display)',
                        }}>
                            NexEnroll
                        </p>
                        <p style={{ fontSize: '0.65rem', color: 'var(--sidebar-text-muted)', marginTop: 2, letterSpacing: '0.04em' }}>
                            Admin Portal · v2.0
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                            <span className="live-dot" aria-hidden="true" />
                            <span style={{ fontSize: '0.62rem', color: 'var(--color-success)', letterSpacing: '0.03em' }}>
                                Systems Online
                            </span>
                        </div>
                    </div>
                )}

                <button
                    onClick={onToggle}
                    className="sidebar-toggle"
                    aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                    style={{ flexShrink: 0 }}
                >
                    {isOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                </button>
            </div>

            {/* ── Nav ─────────────────────────────────────────────── */}
            <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '6px 0' }} aria-label="Main navigation">
                {NAV_GROUPS.map((group) => (
                    <div key={group.label}>
                        {isOpen ? (
                            <p className="section-label">{group.label}</p>
                        ) : (
                            <hr style={{ border: 'none', borderTop: '1px solid var(--sidebar-border)', margin: '5px 12px' }} />
                        )}
                        {group.items.map((item) => (
                            <NavItem
                                key={item.id}
                                item={item}
                                isActive={activeTab === item.id}
                                isOpen={isOpen}
                                onClick={onNavigate}
                                badge={badges[item.id] || 0}
                            />
                        ))}
                    </div>
                ))}
            </nav>

            {/* ── Sidebar Tone Switcher (dark mode only, open only) ─ */}
            {isOpen && theme === 'dark' && onToneChange && (
                <div style={{
                    padding: '10px 16px 8px',
                    borderTop: '1px solid var(--sidebar-border)',
                    flexShrink: 0,
                }}>
                    <p style={{
                        fontSize: '0.58rem', fontWeight: 600,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase', letterSpacing: '0.08em',
                        marginBottom: 8, userSelect: 'none',
                    }}>
                        Sidebar Tone
                    </p>
                    <ToneSwitcher activeTone={sidebarTone} onToneChange={onToneChange} />
                </div>
            )}

            {/* ── User + Logout ────────────────────────────────────── */}
            <div style={{
                borderTop: '1px solid var(--sidebar-border)',
                padding: isOpen ? '12px 14px' : '12px 8px',
                flexShrink: 0,
            }}>
                {isOpen ? (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                            <UserAvatar email={user?.username || user?.email || 'A'} size={28} />
                            <div style={{ overflow: 'hidden', flex: 1 }}>
                                <p style={{
                                    fontSize: '0.75rem', fontWeight: 600,
                                    color: 'var(--sidebar-logo-text)',
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                }}>
                                    {user?.username || user?.email?.split('@')[0] || 'Admin'}
                                </p>
                                <p style={{ fontSize: '0.65rem', color: 'var(--sidebar-text-active)', marginTop: 2, letterSpacing: '0.03em' }}>
                                    Administrator
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onLogout}
                            className="nav-item"
                            aria-label="Log out"
                            style={{ margin: 0, width: '100%', color: 'var(--color-danger)', opacity: 1, fontSize: '0.75rem' }}
                        >
                            <span className="nav-icon" aria-hidden="true"><LogoutIcon /></span>
                            <span className="nav-label">Log Out</span>
                        </button>
                    </>
                ) : (
                    <button
                        className="nav-item"
                        onClick={onLogout}
                        aria-label="Log out"
                        style={{ justifyContent: 'center', padding: '8px', margin: 0, width: '100%', color: 'var(--color-danger)', opacity: 1 }}
                    >
                        <span className="nav-icon" aria-hidden="true"><LogoutIcon /></span>
                        <span className="nav-tooltip" role="tooltip">Log Out</span>
                    </button>
                )}
            </div>
        </aside>
    );
};

/* ── UserAvatar ────────────────────────────────────────────────── */
const AVATAR_PALETTE = [
    '#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6',
];

export const UserAvatar = ({ email = '', size = 30 }) => {
    const initial = (email[0] || 'A').toUpperCase();
    const idx = email.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_PALETTE.length;
    const bg = AVATAR_PALETTE[idx];

    return (
        <div
            aria-hidden="true"
            style={{
                width: size, height: size,
                borderRadius: '50%',
                background: bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff',
                fontWeight: 600,
                fontSize: size * 0.40,
                flexShrink: 0,
                fontFamily: 'var(--font-display)',
            }}
        >
            {initial}
        </div>
    );
};

export { NAV_GROUPS };
export default AdminSidebar;