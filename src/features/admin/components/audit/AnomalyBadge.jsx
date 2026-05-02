// frontend/src/features/admin/components/audit/AnomalyBadge.jsx

import React from 'react';

const LEVELS = [
    { min: 70, label: 'HIGH', color: 'var(--neon-red)', bg: 'var(--color-danger-bg)', border: 'var(--border-critical)' },
    { min: 40, label: 'MEDIUM', color: 'var(--neon-orange)', bg: 'rgba(255,140,0,0.08)', border: 'rgba(255,140,0,0.30)' },
    { min: 0, label: 'LOW', color: 'var(--neon-green)', bg: 'var(--color-success-bg)', border: 'var(--color-success-bd)' },
];

const AnomalyBadge = ({ score = 0, showScore = true }) => {
    const level = LEVELS.find(l => score >= l.min) ?? LEVELS[2];

    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '2px 8px',
            borderRadius: 100,
            background: level.bg,
            border: `1px solid ${level.border}`,
            fontFamily: 'var(--font-terminal)',
            fontSize: '0.58rem',
            fontWeight: 700,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            color: level.color,
        }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: level.color, flexShrink: 0, boxShadow: score >= 70 ? `0 0 6px ${level.color}` : 'none' }} />
            {level.label}{showScore ? ` ${Math.round(score)}` : ''}
        </span>
    );
};

export default AnomalyBadge;