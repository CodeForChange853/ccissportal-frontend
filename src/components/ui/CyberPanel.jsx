// frontend/src/components/ui/CyberPanel.jsx

import React from 'react';

/**
 * Shared cybersecurity panel wrapper.
 *
 * @param {string}  title        
 * @param {string}  subtitle     
 * @param {'default'|'alert'|'warning'|'success'} variant
 * @param {React.ReactNode} headerRight 
 * @param {string}  className    
 * @param {React.ReactNode} children
 */
const CyberPanel = ({
    title,
    subtitle,
    variant = 'default',
    headerRight,
    className = '',
    children,
}) => {
    const variantClass = variant !== 'default' ? `cyber-panel--${variant}` : '';

    return (
        <section className={`cyber-panel ${variantClass} ${className}`.trim()}>
            {title && (
                <header className="cyber-panel__header">
                    <div>
                        <h2 className="cyber-panel__title">{title}</h2>
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