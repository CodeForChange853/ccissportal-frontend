// frontend/src/components/ui/StatusBadge.jsx

import React from 'react';

const VARIANTS = {
    critical: 'critical',
    warning: 'warning',
    normal: 'normal',
    info: 'info',
    muted: 'muted',
};

/**
 * Severity-coded status badge with optional pulse dot.
 *
 * @param {'critical'|'warning'|'normal'|'info'|'muted'} variant
 * @param {string}  label    
 * @param {boolean} showDot  
 * @param {string}  className
 */
const StatusBadge = ({
    variant = 'info',
    label,
    showDot = true,
    className = '',
}) => {
    const v = VARIANTS[variant] ?? 'info';

    return (
        <span className={`status-badge status-badge--${v} ${className}`.trim()}>
            {showDot && <span className="status-badge__dot" aria-hidden="true" />}
            {label}
        </span>
    );
};

export default StatusBadge;