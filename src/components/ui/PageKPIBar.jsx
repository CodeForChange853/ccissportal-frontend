import React, { useState } from 'react';

// ── Variant colour maps (all CSS variables — no hardcoded hex)
const VARIANTS = {
  default: {
    value:  'var(--text-primary)',
    label:  'var(--text-placeholder)',
    border: 'var(--border-subtle)',
    hoverBorder: 'var(--border-default)',
  },
  accent: {
    value:  'var(--accent-gold)',
    label:  'var(--text-placeholder)',
    border: 'rgba(186,151,49,0.22)',
    hoverBorder: 'rgba(186,151,49,0.45)',
  },
  success: {
    value:  'var(--color-success)',
    label:  'var(--text-placeholder)',
    border: 'var(--color-success-bd)',
    hoverBorder: 'var(--color-success)',
  },
  warning: {
    value:  'var(--color-warning)',
    label:  'var(--text-placeholder)',
    border: 'var(--color-warning-bd)',
    hoverBorder: 'var(--color-warning)',
  },
  danger: {
    value:  'var(--color-danger)',
    label:  'var(--text-placeholder)',
    border: 'var(--color-danger-bd)',
    hoverBorder: 'var(--color-danger)',
  },
};

// ── Single stat tile
// Props:
//   label   — string, uppercase caption
//   value   — string | number, the big number
//   sub     — string (optional), small note below value
//   icon    — ReactNode (optional), shown top-right
//   variant — 'default' | 'accent' | 'success' | 'warning' | 'danger'
//   onClick — () => void (optional); adds pointer cursor + hover lift
export function KPIStat({
  label,
  value,
  sub,
  icon,
  variant = 'default',
  onClick,
}) {
  const [hov, setHov] = useState(false);
  const v = VARIANTS[variant] ?? VARIANTS.default;
  const clickable = typeof onClick === 'function';

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? 'var(--bg-elevated)' : 'var(--bg-surface)',
        border: `1px solid ${hov ? v.hoverBorder : v.border}`,
        borderRadius: 10,
        padding: '10px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        cursor: clickable ? 'pointer' : 'default',
        transition: 'background 0.15s, border-color 0.15s, transform 0.15s, box-shadow 0.15s',
        transform: hov && clickable ? 'translateY(-1px)' : 'none',
        boxShadow: hov && clickable ? '0 4px 16px rgba(0,0,0,0.14)' : 'none',
        minWidth: 0,
        userSelect: 'none',
      }}
    >
      {/* Label row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
        <span style={{
          fontSize: '0.58rem',
          fontFamily: 'var(--font-code)',
          letterSpacing: '0.09em',
          textTransform: 'uppercase',
          color: v.label,
          fontWeight: 500,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>{label}</span>
        {icon && (
          <span style={{ color: v.value, display: 'flex', flexShrink: 0, opacity: 0.65 }}>
            {icon}
          </span>
        )}
      </div>

      {/* Value */}
      <div style={{
        fontSize: '1.45rem',
        fontWeight: 700,
        fontFamily: 'var(--font-display)',
        lineHeight: 1,
        color: v.value,
        letterSpacing: '-0.02em',
      }}>{value ?? '—'}</div>

      {/* Sub-note */}
      {sub && (
        <div style={{
          fontSize: '0.63rem',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-code)',
          letterSpacing: '0.02em',
        }}>{sub}</div>
      )}
    </div>
  );
}

// ── Strip of stat tiles in a responsive grid
// Props:
//   stats   — KPIStat props array
//   columns — explicit column count (optional; defaults to min(stats.length, 5))
export default function PageKPIBar({ stats = [], columns }) {
  const cols = columns ?? Math.min(stats.length, 5);
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      gap: 10,
    }}>
      {stats.map((stat, i) => (
        <KPIStat key={i} {...stat} />
      ))}
    </div>
  );
}
