// frontend/src/features/faculty/components/FacultyProfile.jsx
// PHASE 4: Sliced from FacultyDashboard — pure UI profile display.

import React from 'react';

const FacultyProfile = ({ user, subjectCount }) => (
    <div className="max-w-sm">
        <h2 className="text-base font-bold text-white mb-5">My Profile</h2>
        <div
            className="rounded-2xl p-6 border"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}

        >
            {/* Avatar row */}
            <div className="flex items-center gap-4 mb-5 pb-5 border-b border-slate-700/30">
                <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl"
                    style={{ background: 'linear-gradient(135deg,#22d3ee,#6366f1)' }}
                >
                    {user?.full_name?.charAt(0) ?? user?.email?.charAt(0) ?? 'F'}
                </div>
                <div>
                    <h3 className="text-white font-bold">
                        {user?.full_name || 'Faculty Member'}
                    </h3>
                    <p className="text-xs text-cyan-500 font-mono uppercase tracking-wider">
                        Faculty
                    </p>
                </div>
            </div>

            {/* Info rows */}
            {[
                ['Email', user?.email ?? '—'],
                ['Role', user?.role ?? 'FACULTY'],
                ['Subjects Assigned', subjectCount],
            ].map(([label, val]) => (
                <div
                    key={label}
                    className="flex justify-between items-center py-2.5 border-b border-slate-700/20 last:border-0"
                >
                    <span className="text-xs text-slate-500">{label}</span>
                    <span className="text-white text-sm font-medium">{val}</span>
                </div>
            ))}
        </div>
    </div>
);

export default FacultyProfile;