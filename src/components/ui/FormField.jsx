import React from 'react';

const FormField = ({ label, hint, error, required, children, style }) => (
  <div style={style}>
    {label && (
      <label style={{
        display: 'block',
        fontSize: '0.72rem',
        fontWeight: 700,
        letterSpacing: '0.09em',
        textTransform: 'uppercase',
        marginBottom: 6,
        color: error ? 'var(--color-danger)' : 'var(--text-secondary)',
      }}>
        {label}
        {required && <span style={{ color: 'var(--color-danger)', marginLeft: 2 }}>*</span>}
        {hint && (
          <span style={{ marginLeft: 6, textTransform: 'none', fontWeight: 400, color: 'var(--text-muted)' }}>
            {hint}
          </span>
        )}
      </label>
    )}
    {children}
    {error && (
      <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: 'var(--color-danger)' }}>
        {error}
      </p>
    )}
  </div>
);

export default FormField;
