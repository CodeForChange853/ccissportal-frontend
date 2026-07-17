import React, { useState, useEffect } from 'react';
import { useReducedMotion, useInView } from './utils';

const ROWS = [
  { id: '23-10045', name: 'A. Garcia',    status: 'ENROLLED', units: 21, color: '#22c55e' },
  { id: '23-10081', name: 'M. Santos',    status: 'PENDING',  units: 18, color: '#d97706' },
  { id: '23-10093', name: 'J. Dela Cruz', status: 'FLAGGED',  units: 15, color: '#dc2626' },
  { id: '23-10112', name: 'P. Reyes',     status: 'ENROLLED', units: 21, color: '#22c55e' },
  { id: '23-10128', name: 'A. Bautista',  status: 'ENROLLED', units: 18, color: '#22c55e' },
];

const TrafficLight = () => (
  <div style={{ display: 'flex', gap: 5 }}>
    {['rgba(220,38,38,0.60)', 'rgba(251,191,36,0.60)', 'rgba(34,197,94,0.60)'].map((c, i) => (
      <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
    ))}
  </div>
);

const StatCard = ({ label, value, color, border }) => (
  <div style={{
    padding: '0.625rem 0.75rem',
    background: 'rgba(8,4,18,0.85)',
    borderRight: border ? '1px solid rgba(186,151,49,0.07)' : 'none',
  }}>
    <div style={{
      fontSize: '0.42rem', color: 'rgba(186,151,49,0.48)',
      fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: '0.10em',
      marginBottom: 3, textTransform: 'uppercase',
    }}>{label}</div>
    <div style={{
      fontSize: '1.05rem', fontWeight: 800, color,
      fontFamily: "'JetBrains Mono', monospace", letterSpacing: '-0.02em', lineHeight: 1,
    }}>{value}</div>
  </div>
);

const DashboardPreview = () => {
  const [activeRow, setActiveRow] = useState(0);
  const [stats, setStats] = useState({ enrolled: 0, load: 0, checks: 0 });
  const reduced = useReducedMotion();
  const [ref, inView] = useInView(0.1);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setActiveRow(r => (r + 1) % ROWS.length), 1800);
    return () => clearInterval(id);
  }, [reduced]);

  useEffect(() => {
    if (!inView) return;
    if (reduced) { setStats({ enrolled: 247, load: 89, checks: 99 }); return; }
    let t = 0;
    const id = setInterval(() => {
      t++;
      setStats({
        enrolled: Math.min(Math.round(247 * t / 36), 247),
        load:     Math.min(Math.round(89  * t / 36), 89),
        checks:   Math.min(Math.round(99  * t / 36), 99),
      });
      if (t >= 36) clearInterval(id);
    }, 25);
    return () => clearInterval(id);
  }, [inView, reduced]);

  return (
    <div
      ref={ref}
      style={{
        position: 'relative', width: '100%', maxWidth: 460, margin: '0 auto',
        borderRadius: '0.875rem',
        background: 'rgba(8,4,18,0.92)',
        border: '1px solid rgba(186,151,49,0.22)',
        boxShadow: [
          'inset 0 1px 0 rgba(255,255,255,0.07)',
          '0 40px 90px rgba(0,0,0,0.75)',
          '0 12px 32px rgba(0,0,0,0.55)',
          '0 0 0 1px rgba(0,0,0,0.45)',
          '0 0 60px rgba(186,151,49,0.04)',
        ].join(', '),
        overflow: 'hidden',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Specular top sheen */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent 10%, rgba(255,255,255,0.09) 35%, rgba(186,151,49,0.18) 50%, rgba(255,255,255,0.09) 65%, transparent 90%)',
        pointerEvents: 'none',
      }} />

      {/* Browser chrome */}
      <div style={{
        padding: '0.5rem 0.875rem',
        background: 'rgba(255,255,255,0.025)',
        borderBottom: '1px solid rgba(186,151,49,0.10)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <TrafficLight />
        <div style={{
          flex: 1, height: 20, marginLeft: 6,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(186,151,49,0.10)',
          borderRadius: 4,
          display: 'flex', alignItems: 'center', paddingLeft: 8, gap: 5,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', opacity: 0.7 }} />
          <span style={{ fontSize: '0.50rem', color: 'rgba(186,151,49,0.50)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em' }}>
            nexenroll.ccis.edu / dashboard
          </span>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        borderBottom: '1px solid rgba(186,151,49,0.08)',
        background: 'rgba(186,151,49,0.03)',
      }}>
        <StatCard label="Enrolled"     value={stats.enrolled}          color="#22c55e" border />
        <StatCard label="Faculty Load" value={`${stats.load}%`}        color="#BA9731" border />
        <StatCard label="AI Checks"    value={`${stats.checks}%`}      color="#DACE84" />
      </div>

      {/* Table header */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr auto',
        padding: '0.45rem 0.875rem',
        background: 'rgba(186,151,49,0.04)',
        borderBottom: '1px solid rgba(186,151,49,0.08)',
        gap: 8,
      }}>
        {['STUDENT', 'UNITS', 'STATUS'].map((h, i) => (
          <div key={i} style={{
            fontSize: '0.40rem', color: 'rgba(186,151,49,0.42)',
            fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: '0.12em', textTransform: 'uppercase',
            textAlign: i === 2 ? 'right' : 'left',
          }}>{h}</div>
        ))}
      </div>

      {/* Enrollment rows */}
      <div>
        {ROWS.map((row, i) => (
          <div key={row.id} style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr auto',
            padding: '0.52rem 0.875rem',
            background: activeRow === i ? 'rgba(186,151,49,0.07)' : 'transparent',
            borderLeft: `2.5px solid ${activeRow === i ? 'rgba(186,151,49,0.60)' : 'transparent'}`,
            borderBottom: i < ROWS.length - 1 ? '1px solid rgba(186,151,49,0.05)' : 'none',
            transition: 'all 0.45s cubic-bezier(0.34,1.2,0.64,1)',
            gap: 8,
          }}>
            <div>
              <div style={{
                fontSize: '0.55rem', fontFamily: "'JetBrains Mono', monospace",
                color: 'rgba(245,236,200,0.84)', letterSpacing: '0.03em',
              }}>{row.id}</div>
              <div style={{
                fontSize: '0.42rem', color: 'rgba(200,185,160,0.46)',
                fontFamily: "'Inter', system-ui, sans-serif", marginTop: 1,
              }}>{row.name}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{
                fontSize: '0.50rem', color: 'rgba(186,151,49,0.62)',
                fontFamily: "'JetBrains Mono', monospace",
              }}>{row.units} units</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <span style={{
                fontSize: '0.40rem', fontWeight: 700, letterSpacing: '0.06em',
                fontFamily: "'Inter', system-ui, sans-serif",
                color: row.color,
                padding: '2px 6px', borderRadius: 3,
                background: `${row.color}18`,
                border: `1px solid ${row.color}35`,
              }}>
                {row.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* AI triage bar */}
      <div style={{
        padding: '0.52rem 0.875rem',
        borderTop: '1px solid rgba(186,151,49,0.09)',
        background: 'rgba(186,151,49,0.03)',
        display: 'flex', alignItems: 'center', gap: 7,
      }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%', background: '#22c55e',
          boxShadow: '0 0 7px rgba(34,197,94,0.55)',
          animation: reduced ? 'none' : 'pulse 2s infinite', flexShrink: 0,
        }} />
        <span style={{
          fontSize: '0.46rem', color: 'rgba(186,151,49,0.52)',
          fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: '0.05em',
        }}>
          AI TRIAGE ACTIVE — 3 items in queue — faculty load optimal
        </span>
      </div>
    </div>
  );
};

export default DashboardPreview;
