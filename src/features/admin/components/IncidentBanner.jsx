import React from 'react';
import '../../../styles/components/incident-banner.css';
import { useIncident } from '../layout/AdminLayout';

const PALETTE = {
  critical: {
    bg:     'rgba(239,68,68,0.07)',
    border: 'rgba(239,68,68,0.22)',
    dot:    '#EF4444',
    text:   'rgba(252,165,165,0.90)',
    accent: '#EF4444',
    label:  'SECURITY BREACH DETECTED',
  },
  elevated: {
    bg:     'rgba(245,158,11,0.06)',
    border: 'rgba(245,158,11,0.20)',
    dot:    '#F59E0B',
    text:   'rgba(253,211,77,0.88)',
    accent: '#F59E0B',
    label:  'ANOMALY DETECTED',
  },
};



export default function IncidentBanner({ onNavigateAudit }) {
  const { incidentLevel, anomalyScore, eventCount, dismiss } = useIncident();
  const c = PALETTE[incidentLevel] ?? PALETTE.elevated;

  return (
    <>
      <div role="alert" aria-live="assertive" style={{
        width: '100%',
        height: 44,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '0 20px',
        background: c.bg,
        borderBottom: `1px solid ${c.border}`,
        animation: 'bannerSlide 0.20s ease both',
        zIndex: 40,
        overflow: 'hidden',
      }}>

        {/* Pulsing status dot */}
        <span style={{
          width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
          background: c.dot, color: c.dot,
          animation: 'incidentDot 1.2s ease-in-out infinite',
        }} />

        {/* Category label */}
        <span style={{
          fontSize: '0.60rem', fontFamily: 'var(--font-code)',
          fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase',
          color: c.accent, flexShrink: 0,
        }}>{c.label}</span>

        {/* Hairline divider */}
        <span style={{ width: 1, height: 14, background: c.border, flexShrink: 0 }} />

        {/* Details */}
        <span style={{
          flex: 1, fontSize: '0.73rem', color: c.text,
          fontFamily: 'var(--font-display)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          Anomaly score{' '}
          <strong style={{ color: c.accent }}>{anomalyScore}/100</strong>
          {eventCount > 0 && (
            <>
              {' '}·{' '}
              <strong style={{ color: c.accent }}>{eventCount}</strong>
              {' '}flagged {eventCount === 1 ? 'event' : 'events'}
            </>
          )}
        </span>

        {/* View Audit CTA */}
        <button
          onClick={onNavigateAudit}
          style={{
            height: 28, padding: '0 14px', flexShrink: 0,
            background: c.accent, border: 'none', borderRadius: 6,
            color: incidentLevel === 'critical' ? '#fff' : '#0D0D0D',
            fontSize: '0.70rem', fontWeight: 700,
            fontFamily: 'var(--font-display)',
            cursor: 'pointer', transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.82'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
        >
          View Audit →
        </button>

        {/* Dismiss */}
        <button
          onClick={dismiss}
          title="Suppress this alert for 15 minutes"
          style={{
            height: 28, padding: '0 10px', flexShrink: 0,
            background: 'transparent',
            border: `1px solid ${c.border}`,
            borderRadius: 6,
            color: c.text, fontSize: '0.65rem',
            fontFamily: 'var(--font-code)',
            cursor: 'pointer', transition: 'background 0.12s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          Dismiss (15 min)
        </button>

      </div>
    </>
  );
}
