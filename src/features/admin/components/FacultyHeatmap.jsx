import React, { useState } from 'react';
const getLoadTier = (current, max, isAvailable) => {
    if (!isAvailable) return 'inactive';
    if (max === 0) return 'available';
    const pct = current / max;
    if (pct >= 1) return 'maxed';
    if (pct >= 0.76) return 'high';
    if (pct >= 0.51) return 'moderate';
    return 'available';
};

const TIER_STYLES = {
    available: {
        card: 'bg-emerald-900/30 border-emerald-500/40 hover:bg-emerald-900/50 hover:border-emerald-400/60',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        dot: 'bg-emerald-400',
        label: 'AVAILABLE',
        bar: 'bg-emerald-400',
    },
    moderate: {
        card: 'bg-yellow-900/20 border-yellow-500/40 hover:bg-yellow-900/40 hover:border-yellow-400/60',
        badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
        dot: 'bg-yellow-400',
        label: 'MODERATE',
        bar: 'bg-yellow-400',
    },
    high: {
        card: 'bg-orange-900/20 border-orange-500/40 hover:bg-orange-900/40 hover:border-orange-400/60',
        badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        dot: 'bg-orange-400',
        label: 'HIGH',
        bar: 'bg-orange-400',
    },
    maxed: {
        card: 'bg-rose-900/30 border-rose-500/50 hover:bg-rose-900/50 hover:border-rose-400/70',
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        dot: 'bg-rose-500 animate-pulse',
        label: 'MAXED',
        bar: 'bg-rose-500',
    },
    inactive: {
        card: 'bg-slate-900/20 border-slate-700/40 opacity-50 cursor-not-allowed',
        badge: 'bg-slate-800 text-slate-500 border-slate-700',
        dot: 'bg-slate-600',
        label: 'INACTIVE',
        bar: 'bg-slate-600',
    },
};

// ── Legend strip ──────────────────────────────────────────────────────────────

const LEGEND = [
    { tier: 'available', label: 'Available (0–50%)' },
    { tier: 'moderate', label: 'Moderate (51–75%)' },
    { tier: 'high', label: 'High (76–99%)' },
    { tier: 'maxed', label: 'Maxed (100%)' },
    { tier: 'inactive', label: 'Inactive' },
];

// ── Component 

const FacultyHeatmap = ({ faculty = [], onSelect }) => {
    const [hoveredId, setHoveredId] = useState(null);

    if (faculty.length === 0) {
        return (
            <div style={{
                padding: '48px 0', textAlign: 'center',
                background: 'var(--bg-depth)', borderRadius: 16,
                border: '1px solid var(--border-default)'
            }}>
                <p style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
                    NO FACULTY PROFILES DETECTED
                </p>
            </div>
        );
    }

    // Group by department for organised rows
    const byDept = faculty.reduce((acc, f) => {
        const dept = f.academic_department || 'Unassigned';
        if (!acc[dept]) acc[dept] = [];
        acc[dept].push(f);
        return acc;
    }, {});

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Legend strip */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 20,
                padding: '12px 16px', background: 'var(--bg-depth)',
                borderRadius: 12, border: '1px solid var(--border-default)',
                flexWrap: 'wrap'
            }}>
                <p style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Severity Scale:</p>
                {LEGEND.map(({ tier, label }) => (
                    <div key={tier} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                            width: 10, height: 10, borderRadius: 3,
                            background: TIER_STYLES[tier].bar.split(' ')[0].replace('bg-', '').replace('-400', '').replace('-500', '').replace('emerald', '#4ade80').replace('yellow', '#fbbf24').replace('orange', '#fb923c').replace('rose', '#f43f5e').replace('slate', '#64748b'),
                            boxShadow: `0 0 8px ${TIER_STYLES[tier].bar.split(' ')[0].replace('bg-', '').replace('-400', '').replace('-500', '').replace('emerald', 'rgba(74,222,128,0.4)').replace('yellow', 'rgba(251,191,36,0.4)').replace('orange', 'rgba(251,146,60,0.4)').replace('rose', 'rgba(244,63,94,0.4)').replace('slate', 'rgba(100,116,139,0.4)')}`
                        }} />
                        <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
                    </div>
                ))}
            </div>

            {/* Grid by department */}
            {Object.entries(byDept).map(([dept, members]) => (
                <div key={dept}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <h3 style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            {dept}
                        </h3>
                        <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>{members.length} STAFF</span>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                        gap: 12
                    }}>
                        {members.map(f => {
                            const tier = getLoadTier(f.current_teaching_load, f.maximum_teaching_load, f.is_available_for_classes ?? true);
                            const styles = TIER_STYLES[tier];
                            const pct = f.maximum_teaching_load > 0 ? Math.round((f.current_teaching_load / f.maximum_teaching_load) * 100) : 0;
                            const isHovered = hoveredId === f.account_id;
                            const name = (f.first_name && f.last_name) ? `${f.first_name} ${f.last_name}` : f.email_address;

                            // Map tailwind color strings to hex/var for the JS styles
                            const getColor = (t) => {
                                if (t === 'available') return '#4ade80';
                                if (t === 'moderate') return '#fbbf24';
                                if (t === 'high') return '#fb923c';
                                if (t === 'maxed') return '#f43f5e';
                                return 'var(--text-muted)';
                            };
                            const accentColor = getColor(tier);

                            return (
                                <button
                                    key={f.account_id}
                                    onClick={() => tier !== 'inactive' && onSelect?.(f)}
                                    onMouseEnter={() => setHoveredId(f.account_id)}
                                    onMouseLeave={() => setHoveredId(null)}
                                    style={{
                                        position: 'relative',
                                        padding: '16px',
                                        borderRadius: 16,
                                        border: `1px solid ${isHovered ? accentColor : 'var(--border-default)'}`,
                                        background: isHovered ? `${accentColor}08` : 'var(--bg-surface)',
                                        textAlign: 'left',
                                        cursor: tier === 'inactive' ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s',
                                        opacity: tier === 'inactive' ? 0.6 : 1,
                                        boxShadow: isHovered ? `0 4px 20px ${accentColor}15` : 'var(--shadow-card)',
                                        transform: isHovered ? 'translateY(-2px)' : 'none',
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                        <div style={{ minWidth: 0 }}>
                                            <p style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', truncate: true }}>
                                                {name.split(' ')[0]}
                                            </p>
                                            <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', truncate: true }}>
                                                {name.includes(' ') ? name.split(' ').slice(1).join(' ') : 'Instructor'}
                                            </p>
                                        </div>
                                        <div style={{
                                            width: 8, height: 8, borderRadius: '50%',
                                            background: accentColor,
                                            boxShadow: `0 0 8px ${accentColor}`
                                        }} />
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                                        <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-code)' }}>{f.current_teaching_load}</span>
                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>/ {f.maximum_teaching_load} UNITS</span>
                                    </div>

                                    {/* Progress bar */}
                                    <div style={{ width: '100%', height: 4, background: 'var(--bg-depth)', borderRadius: 2, overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${Math.min(pct, 100)}%`,
                                            height: '100%',
                                            background: accentColor,
                                            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                                        }} />
                                    </div>

                                    {isHovered && (
                                        <div style={{
                                            position: 'absolute', bottom: 8, right: 8,
                                            fontSize: '0.55rem', fontWeight: 900,
                                            color: accentColor, textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}>
                                            {tier}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FacultyHeatmap;