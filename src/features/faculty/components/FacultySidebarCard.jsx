import React from 'react';
import { useTheme } from '../../../context/ThemeContext';

const FacultySidebarCard = ({ user, subjects = [], totalUnits = 0, totalStudents = 0, loadPct = 0 }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Use portal accent variables
    const accent = 'var(--portal-accent)';

    const displayName = user?.full_name || user?.username?.split('@')[0] || 'Faculty';
    const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const role = (user?.role || 'FACULTY').replace(/_/g, ' ');

    return (
        <div style={{
            margin: '10px 10px 4px', flexShrink: 0,
            background: 'var(--portal-sidebar-hover)',
            border: '1px solid var(--portal-sidebar-border)',
            borderRadius: 8, padding: '11px 12px',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 9 }}>
                <div style={{
                    width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                    background: `linear-gradient(135deg, var(--portal-sidebar-bg), ${accent})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700,
                    color: '#fff',
                    border: '1px solid var(--portal-sidebar-border)',
                }}>{initials}</div>
                <div style={{ minWidth: 0 }}>
                    <div style={{
                        fontSize: 13, fontWeight: 600, color: 'var(--portal-sidebar-active)',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        fontFamily: 'var(--font-display)'
                    }}>{displayName}</div>
                    <div style={{ fontSize: 9, color: accent, fontFamily: 'var(--font-code)', letterSpacing: 0.3, textTransform: 'uppercase' }}>{role}</div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                {[
                    { val: subjects.length, label: 'Subjs' },
                    { val: `${totalUnits}u`, label: 'Units' },
                    { val: totalStudents || '—', label: 'Studs' }
                ].map(({ val, label }) => (
                    <div key={label} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--portal-sidebar-active)', fontFamily: 'var(--font-display)' }}>{val}</div>
                        <div style={{ fontSize: 7, color: 'var(--portal-sidebar-text)', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
                    </div>
                ))}
            </div>

            <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                    height: '100%', borderRadius: 2, width: `${loadPct}%`,
                    background: `linear-gradient(90deg, ${accent}, var(--accent-light))`,
                    transition: 'width 0.4s'
                }} />
            </div>
            <div style={{ fontSize: 8, color: 'var(--portal-sidebar-text)', textAlign: 'right', marginTop: 2, fontFamily: 'var(--font-code)', opacity: 0.7 }}>
                {totalUnits}/21u
            </div>
        </div>
    );
};

export default FacultySidebarCard;
