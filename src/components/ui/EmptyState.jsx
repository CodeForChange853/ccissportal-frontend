import React from 'react';

const EmptyState = ({
    icon = '◎',
    title,
    subtitle,
    action,
    compact = false,
}) => (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: compact ? '20px 16px' : '40px 24px',
        gap: compact ? 6 : 10,
        textAlign: 'center',
    }}>
        {/* Icon */}
        <div style={{
            width: compact ? 36 : 48,
            height: compact ? 36 : 48,
            borderRadius: '50%',
            background: 'var(--bg-depth)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: compact ? '1rem' : '1.3rem',
            marginBottom: 4,
            flexShrink: 0,
        }}>
            {icon}
        </div>

        {/* Title */}
        {title && (
            <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: compact ? '0.68rem' : '0.75rem',
                fontWeight: 700,


                color: 'var(--text-secondary)',
                margin: 0,
            }}>
                {title}
            </p>
        )}

        {/* Subtitle */}
        {subtitle && (
            <p style={{
                fontFamily: 'var(--font-terminal)',
                fontSize: '0.65rem',
                color: 'var(--text-muted)',

                lineHeight: 1.5,
                maxWidth: 280,
                margin: 0,
            }}>
                {subtitle}
            </p>
        )}

        {/* Optional action */}
        {action && (
            <button
                onClick={action.onClick}
                className="btn-primary"
                style={{
                    fontSize: '0.62rem',
                    padding: '7px 16px',
                    marginTop: 6,
                    letterSpacing: '0.12em',
                }}
            >
                {action.label}
            </button>
        )}
    </div>
);

export default EmptyState;