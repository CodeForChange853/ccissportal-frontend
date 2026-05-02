// frontend/src/features/student/components/GradesTab.jsx
// PHASE 4: Pure UI — grades tab content sliced from StudentDashboard.

import React from 'react';

const StatMini = ({ label, value, unit, color = '#00c9b1' }) => (
    <div
        className="flex flex-col items-center gap-0.5 px-2 py-3 rounded-xl flex-1 min-w-0"
        style={{ background: 'rgba(0,201,177,0.06)', border: `1px solid ${color}22` }}
    >
        <span className="text-base font-black text-white leading-none">{value}</span>
        <span className="text-[9px] uppercase tracking-wider font-semibold" style={{ color }}>
            {label}
        </span>
        {unit && <span className="text-[9px] text-slate-600">{unit}</span>}
    </div>
);

const statusStyle = {
    PASSED: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
    FAILED: { bg: 'rgba(255,92,110,0.15)', color: '#ff5c6e' },
    ENROLLED: { bg: 'rgba(99,102,241,0.15)', color: '#818cf8' },
};

const gradeColor = (g) =>
    g && g !== 'N/A'
        ? parseFloat(g) <= 3.0 ? '#00c9b1' : '#ff5c6e'
        : 'rgba(255,255,255,0.2)';

const GradesTab = ({ grades, gwa, gwaMeta, passed, failed, earned, academicStanding }) => (
    <div className="space-y-3">
        {/* Summary */}
        <div
            className="rounded-2xl p-4"
            style={{ background: '#1e2246', border: '1px solid rgba(255,255,255,0.06)' }}
        >
            <div className="flex gap-2">
                <StatMini label="GWA" value={gwa ?? '—'} color={gwaMeta.color} />
                <StatMini label="Passed" value={passed} unit="subjs" color="#10b981" />
                <StatMini label="Failed" value={failed} unit="subjs" color="#ff5c6e" />
                <StatMini label="Units" value={earned} unit="earned" color="#22d3ee" />
            </div>
        </div>

        {/* Mobile cards */}
        <div className="block md:hidden space-y-2">
            {grades.map((g, i) => {
                const st = statusStyle[g.completion_status] ?? { bg: 'rgba(255,255,255,0.05)', color: '#64748b' };
                return (
                    <div
                        key={i}
                        className="rounded-2xl p-3 flex items-center justify-between"
                        style={{ background: '#1e2246', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-bold font-mono" style={{ color: '#22d3ee' }}>
                                    {g.subject_code}
                                </span>
                                <span
                                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase"
                                    style={{ background: st.bg, color: st.color }}
                                >
                                    {g.completion_status}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 truncate mt-0.5">{g.subject_title}</p>
                        </div>
                        <div className="text-right ml-3 flex-shrink-0">
                            <p className="text-lg font-black leading-none"
                                style={{ color: gradeColor(g.final_grade) }}>
                                {g.final_grade === 'N/A' ? '—' : (g.final_grade || '—')}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block">
            <div className="rounded-2xl overflow-hidden"
                style={{ background: '#1e2246', border: '1px solid rgba(255,255,255,0.06)' }}>
                <table className="w-full text-sm">
                    <thead style={{ background: 'rgba(0,0,0,0.2)' }}>
                        <tr className="text-[10px] text-slate-600 uppercase font-mono tracking-wider">
                            <th className="px-4 py-3 text-left">Code</th>
                            <th className="px-4 py-3 text-left">Subject</th>
                            <th className="px-4 py-3 text-center">Midterm</th>
                            <th className="px-4 py-3 text-center">Final</th>
                            <th className="px-4 py-3 text-left">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {grades.map((g, i) => {
                            const st = statusStyle[g.completion_status] ?? { bg: 'rgba(255,255,255,0.05)', color: '#64748b' };
                            return (
                                <tr key={i} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                                    <td className="px-4 py-3 font-bold font-mono text-xs" style={{ color: '#22d3ee' }}>
                                        {g.subject_code}
                                    </td>
                                    <td className="px-4 py-3 text-slate-300 text-xs">{g.subject_title}</td>
                                    <td className="px-4 py-3 text-center font-black text-sm"
                                        style={{ color: gradeColor(g.midterm_grade) }}>
                                        {g.midterm_grade ?? '—'}
                                    </td>
                                    <td className="px-4 py-3 text-center font-black text-sm"
                                        style={{ color: gradeColor(g.final_grade) }}>
                                        {g.final_grade === 'N/A' ? '—' : (g.final_grade || '—')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase"
                                            style={{ background: st.bg, color: st.color }}
                                        >
                                            {g.completion_status}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                        {grades.length === 0 && (
                            <tr>
                                <td colSpan="5" className="py-16 text-center text-slate-600 text-xs font-mono">
                                    NO RECORDS YET
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* PREREQUISITE BLOCKER VIEW */}
        {academicStanding?.next_semester_recommendation?.subject_results?.some(r => r.status === 'BLOCKED') && (
            <div className="mt-6">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-2 px-1">Curriculum Status · Prerequisite Blockers</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {academicStanding.next_semester_recommendation.subject_results
                        .filter(r => r.status === 'BLOCKED')
                        .map((subj, i) => (
                            <div key={i} className="flex gap-3 p-3 rounded-2xl items-center" style={{ background: 'rgba(255,92,110,0.04)', border: '1px solid rgba(255,92,110,0.15)' }}>
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-rose-900/40 text-rose-400">
                                    🔒
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm font-bold text-slate-300 line-through decoration-rose-500/50">{subj.subject_code}</p>
                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded text-rose-400 bg-rose-900/30">BLOCKED</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-1 leading-tight">{subj.blocking_reason}</p>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        )}
    </div>
);

export default GradesTab;