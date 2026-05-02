// frontend/src/features/admin/components/FacultyHeatmap.jsx
//
// Renders a color-coded grid where each cell = one faculty member.
// Color encodes load severity at a glance — no numbers needed:
//
//   🟢 AVAILABLE  — 0–50% of max load    (green)
//   🟡 MODERATE   — 51–75% of max load   (yellow)
//   🟠 HIGH       — 76–99% of max load   (amber/orange)
//   🔴 MAXED OUT  — 100% of max load     (red)
//   ⬜ INACTIVE   — is_available = false  (slate/muted)
//
// Props:
//   faculty — array from GET /admin/faculty
//             Each item: { account_id, email_address, first_name, last_name,
//                          academic_department, current_teaching_load,
//                          maximum_teaching_load, is_available_for_classes }
//   onSelect — optional callback(faculty) when a cell is clicked

import React, { useState } from 'react';

// ── Color logic ───────────────────────────────────────────────────────────────

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

// ── Component ─────────────────────────────────────────────────────────────────

const FacultyHeatmap = ({ faculty = [], onSelect }) => {
    const [hoveredId, setHoveredId] = useState(null);

    if (faculty.length === 0) {
        return (
            <div className="text-center py-12 text-slate-500 font-mono text-xs">
                NO FACULTY PROFILES FOUND
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

    // Summary counts for the header
    const maxedCount = faculty.filter(f => getLoadTier(f.current_teaching_load, f.maximum_teaching_load, f.is_available_for_classes) === 'maxed').length;
    const availableCount = faculty.filter(f => getLoadTier(f.current_teaching_load, f.maximum_teaching_load, f.is_available_for_classes) === 'available').length;

    return (
        <div className="space-y-5">

            {/* ── Summary bar ───────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div className="flex gap-6 text-xs font-mono">
                    <span className="text-slate-400">
                        Total: <span className="text-white font-bold">{faculty.length}</span>
                    </span>
                    <span className="text-emerald-400">
                        Available: <span className="font-bold">{availableCount}</span>
                    </span>
                    <span className="text-rose-400">
                        Maxed: <span className="font-bold">{maxedCount}</span>
                    </span>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-3">
                    {LEGEND.map(({ tier, label }) => (
                        <div key={tier} className="flex items-center gap-1.5">
                            <span className={`w-2.5 h-2.5 rounded-sm ${TIER_STYLES[tier].dot}`} />
                            <span className="text-[10px] text-slate-500 font-mono hidden lg:block">
                                {label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Grid by department ────────────────────────────────────────── */}
            {Object.entries(byDept).map(([dept, members]) => (
                <div key={dept}>
                    <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-2 ml-1">
                        {dept}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {members.map(f => {
                            const tier = getLoadTier(
                                f.current_teaching_load,
                                f.maximum_teaching_load,
                                f.is_available_for_classes ?? true,
                            );
                            const styles = TIER_STYLES[tier];
                            const pct = f.maximum_teaching_load > 0
                                ? Math.round((f.current_teaching_load / f.maximum_teaching_load) * 100)
                                : 0;
                            const isHovered = hoveredId === f.account_id;
                            const name = (f.first_name && f.last_name)
                                ? `${f.first_name} ${f.last_name}`
                                : f.email_address;

                            return (
                                <button
                                    key={f.account_id}
                                    onClick={() => tier !== 'inactive' && onSelect?.(f)}
                                    onMouseEnter={() => setHoveredId(f.account_id)}
                                    onMouseLeave={() => setHoveredId(null)}
                                    className={`relative p-4 rounded-xl border transition-all duration-200 text-left w-full ${styles.card}`}
                                >
                                    {/* Status dot */}
                                    <span className={`absolute top-3 right-3 w-2 h-2 rounded-full ${styles.dot}`} />

                                    {/* Name */}
                                    <p className="text-sm font-semibold text-white truncate pr-4 leading-tight">
                                        {name.split(' ')[0]}
                                    </p>
                                    <p className="text-[10px] text-slate-400 truncate mb-3">
                                        {name.includes(' ') ? name.split(' ').slice(1).join(' ') : ''}
                                    </p>

                                    {/* Load fraction */}
                                    <div className="flex items-end justify-between mb-1.5">
                                        <span className="text-xl font-bold font-mono text-white leading-none">
                                            {f.current_teaching_load}
                                        </span>
                                        <span className="text-xs text-slate-500 font-mono mb-0.5">
                                            / {f.maximum_teaching_load}
                                        </span>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="w-full bg-slate-800 rounded-full h-1">
                                        <div
                                            className={`h-1 rounded-full transition-all duration-500 ${styles.bar}`}
                                            style={{ width: `${Math.min(pct, 100)}%` }}
                                        />
                                    </div>

                                    {/* Tier badge — only visible on hover */}
                                    {isHovered && (
                                        <span className={`absolute bottom-2 right-2 text-[8px] font-black px-1.5 py-0.5 rounded border tracking-wider ${styles.badge}`}>
                                            {styles.label}
                                        </span>
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