import React from 'react';

/**
 * GlassBackground — reusable dark glass canvas wrapper for all public pages.
 *
 * Props:
 *   children   — page content
 *   style      — optional extra styles on the root div
 *   className  — optional extra class names on the root div
 *   centered   — if true, adds flex centering for single-card pages (Login, etc.)
 */
const GlassBackground = ({ children, style, className = '', centered = false }) => {
  const rootStyle = {
    ...(centered && {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem 1rem',
    }),
    ...style,
  };

  return (
    <div className={`glass-canvas ${className}`} style={{ ...rootStyle, position: 'relative' }}>
      <a href="#main-content" className="skip-to-content">Skip to main content</a>
      <div className="glass-noise" aria-hidden="true" />
      {children}
    </div>
  );
};

export default GlassBackground;
