// frontend/src/features/faculty/components/SubjectCard.jsx
// PHASE 4: Pure UI component sliced from FacultyDashboard.
// Receives subject data and an onClick — does nothing else.

import React from 'react';

const SubjectCard = ({ subject, onClick }) => (
    <div
        onClick={onClick}
        className="rounded-2xl p-5 cursor-pointer transition-all border group"
        style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
        }}
        onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(34,211,238,0.4)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(34,211,238,0.08)';
        }}
        onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.boxShadow = 'none';
        }}
    >
        <div className="flex justify-between items-start mb-3">
            <span
                className="font-bold text-xs font-mono px-2.5 py-1 rounded-lg"
                style={{
                    background: 'rgba(34,211,238,0.12)',
                    color: '#22d3ee',
                    border: '1px solid rgba(34,211,238,0.25)',
                }}
            >
                {subject.code}
            </span>
            <span className="text-[10px] text-slate-600 font-mono">
                {subject.section || 'Regular'}
            </span>
        </div>

        <h3 className="font-bold text-white text-sm mb-2 leading-snug group-hover:text-cyan-200 transition-colors">
            {subject.title}
        </h3>

        <p className="text-xs text-slate-600 font-mono">
            {subject.schedule || 'TBA'}
        </p>
        {subject.room && subject.room !== 'TBA' && (
            <p className="text-xs text-slate-600 font-mono mt-0.5">
                {subject.room}
            </p>
        )}

        <div className="mt-4 pt-3 border-t border-slate-700/30 flex justify-between items-center">
            <span className="text-[10px] text-slate-600">
                {subject.units || 3} units
            </span>
            <span className="text-xs font-bold text-cyan-500 group-hover:text-cyan-300 transition-colors">
                Open Gradebook →
            </span>
        </div>
    </div>
);

export default SubjectCard;