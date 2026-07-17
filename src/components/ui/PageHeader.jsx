// frontend/src/components/ui/PageHeader.jsx

import React from 'react';

const PageHeader = ({ title, subtitle, badge = null, actions = null }) => (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
            {title && (
                <h1 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1rem',
                    fontWeight: 900,
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                    color: 'var(--text-primary)',
                    lineHeight: 1,
                }}>
                    {title}
                </h1>
            )}
            {subtitle && (
                <p style={{
                    fontFamily: 'var(--font-terminal)',
                    fontSize: '0.65rem',
                    color: 'var(--text-muted)',
                    marginTop: title ? 5 : 0,
                    letterSpacing: '0.01em',
                }}>
                    {subtitle}
                </p>
            )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {badge && <div>{badge}</div>}
            {actions && <div>{actions}</div>}
        </div>
    </div>
);

export default PageHeader;