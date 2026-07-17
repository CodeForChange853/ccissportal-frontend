import React, { useId } from 'react';

/**
 * Shared cybersecurity panel wrapper.
 *
 * @param {string}  title
 * @param {string}  subtitle
 * @param {'default'|'alert'|'warning'|'success'} variant
 * @param {React.ReactNode} headerRight
 * @param {string}  className
 * @param {string}  aria-label  – override label when no visible title is present
 * @param {React.ReactNode} children
 */
const CyberPanel = ({
    title,
    subtitle,
    variant = 'default',
    headerRight,
    className = '',
    'aria-label': ariaLabel,
    children,
}) => {
    const titleId = useId();
    const variantClass = variant !== 'default' ? `cyber-panel--${variant}` : '';

    return (
        <section
            className={`cyber-panel ${variantClass} ${className}`.trim()}
            aria-labelledby={title ? titleId : undefined}
            aria-label={!title ? ariaLabel : undefined}
        >
            {title && (
                <header className="cyber-panel__header">
                    <div>
                        <h2 id={titleId} className="cyber-panel__title">{title}</h2>
                        {subtitle && <p className="cyber-panel__subtitle">{subtitle}</p>}
                    </div>
                    {headerRight && (
                        <div className="cyber-panel__header-right">{headerRight}</div>
                    )}
                </header>
            )}
            <div className="cyber-panel__body">{children}</div>
        </section>
    );
};

export default CyberPanel;
