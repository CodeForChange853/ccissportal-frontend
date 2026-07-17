import React from 'react';

const VARIANTS = {
    critical: 'critical',
    warning: 'warning',
    normal: 'normal',
    info: 'info',
    muted: 'muted',
    accent: 'accent',
};

const VARIANT_LABELS = {
    critical: 'Critical',
    warning: 'Warning',
    normal: 'Normal',
    info: 'Info',
    muted: 'Muted',
    accent: 'Accent',
};

/**
 * Severity-coded status badge with optional pulse dot.
 *
 * @param {'critical'|'warning'|'normal'|'info'|'muted'} variant
 * @param {string}  label
 * @param {boolean} showDot
 * @param {string}  className
 * @param {string}  aria-label  – override the accessible label (default: "{variant}: {label}")
 */
const StatusBadge = ({
    variant = 'info',
    label,
    showDot = true,
    className = '',
    'aria-label': ariaLabel,
}) => {
    const v = VARIANTS[variant] ?? 'info';
    const computedAriaLabel = ariaLabel ?? `${VARIANT_LABELS[v] ?? v}: ${label}`;

    return (
        <span
            className={`status-badge status-badge--${v} ${className}`.trim()}
            aria-label={computedAriaLabel}
        >
            {showDot && <span className="status-badge__dot" aria-hidden="true" />}
            <span aria-hidden="true">{label}</span>
        </span>
    );
};

export default StatusBadge;
