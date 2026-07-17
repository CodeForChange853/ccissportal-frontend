import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../api/adminApi';
import { useAdminRefresh } from '../layout/AdminLayout';
import Skeleton from '../../../components/ui/Skeleton';
import useSystemHealth from '../../../hooks/useSystemHealth';
import '../../../styles/components/admin-overview.css';

const POLL_MS = 90_000;
const pad2 = n => String(n).padStart(2, '0');
const fmtRelative = iso => {
  const diff = (Date.now() - new Date(iso)) / 60000;
  if (diff < 1)  return 'just now';
  if (diff < 60) return `${Math.floor(diff)}m ago`;
  return `${Math.floor(diff / 60)}h ago`;
};
const catColor = c => ({ 'IT SUPPORT': '#EF4444', REGISTRAR: '#BA9731', 'ACADEMIC AFFAIRS': '#F59E0B', FINANCE: '#22C55E' })[c] || '#8A8680';
const catLabel = c => c || '—';

const useSyncCountdown = (refreshTick) => {
  const [seconds, setSeconds] = useState(POLL_MS / 1000);
  useEffect(() => {
    setSeconds(POLL_MS / 1000);
    const id = setInterval(() => setSeconds(s => s <= 1 ? POLL_MS / 1000 : s - 1), 1000);
    return () => clearInterval(id);
  }, [refreshTick]);
  return seconds;
};

// CSS extracted to styles/components/admin-overview.css


/* ─── KPI Icons ───────────────────────────────────────────────────────────── */
const IconStudents = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
  </svg>
);
const IconBrain = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 3C9.23 3 6.19 5.95 6 9.66l-1.92 2.53c-.24.31-.03.81.36.81H6v3c0 1.11.89 2 2 2h1v3h7v-4.68c1.81-1.07 3-3.06 3-5.32 0-3.31-2.69-6-6-6zm-1 14h-2v-2H8v-2H6.5l1.38-1.83C7.96 10.73 8 10.37 8 10c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4z"/>
  </svg>
);
const IconFaculty = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 6h-2.18c.07-.44.18-.88.18-1.36 0-2.57-2.1-4.64-4.67-4.64C11.98 0 9 3 9 5h2c0-1.1.9-2 2-2 1.66 0 3 1.34 3 3 0 .48-.12.92-.24 1.36H3l1 4h1.09C4.41 12.65 4 13.79 4 15c0 2.76 2.24 5 5 5h6c2.76 0 5-2.24 5-5 0-1.21-.41-2.35-1.09-3.27L20 6zm-5 11H9c-1.65 0-3-1.35-3-3s1.35-3 3-3h6c1.65 0 3 1.35 3 3s-1.35 3-3 3z"/>
  </svg>
);
const IconEnroll = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
  </svg>
);
const IconTicket = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
  </svg>
);

/* ─── KpiCard ─────────────────────────────────────────────────────────────── */
const KpiCard = ({ label, value, unit = '', sub, icon, delta, deltaType = 'up', color = '#BA9731' }) => (
  <div className="kpi-card">
    <div className="kpi-top">
      <div
        className="kpi-icon-wrap"
        style={{ background: `${color}18`, border: `1px solid ${color}22`, color }}
      >
        {icon}
      </div>
      {delta != null && (
        <span className={`kpi-delta kpi-delta-${deltaType}`}>{delta}</span>
      )}
    </div>
    <div className="kpi-value-row">
      <span className="kpi-val-num" style={{ color }}>
        {value ?? '—'}
      </span>
      {unit && (
        <span className="kpi-unit" style={{ color: `${color}bb` }}>{unit}</span>
      )}
    </div>
    <div className="kpi-bottom">
      <div className="kpi-label">{label}</div>
      {sub && <div className="kpi-sub-text">{sub}</div>}
    </div>
  </div>
);

/* ─── InfraPanel ─────────────────────────────────────────────────────────── */
const INFRA_SERVICES = [
  { name: 'AI Vision Core',  status: 'ok',   uptime: 99.9 },
  { name: 'API Gateway',     status: 'ok',   uptime: 100  },
  { name: 'Enrollment Eng',  status: 'ok',   uptime: 99.7 },
  { name: 'Database',        status: 'ok',   uptime: 100  },
  { name: 'Auth Service',    status: 'ok',   uptime: 100  },
  { name: 'Doc Vault',       status: 'warn', uptime: 97.2 },
];

const InfraPanel = ({ systemHealth }) => {
  const ok = systemHealth?.isSystemUp !== false;
  const overallUptime = 99.8;
  const healthyCount = INFRA_SERVICES.filter(s => s.status === 'ok').length;

  const r = 28, circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - overallUptime / 100);

  return (
    <div className="panel panel-col">
      <div className="panel-head">
        <div>
          <div className="panel-title">Infrastructure Health</div>
          <div className="panel-sub">{ok ? `${healthyCount}/${INFRA_SERVICES.length} services operational` : `Error: ${systemHealth?.errorType || 'OFFLINE'}`}</div>
        </div>
        <span className={`ao-badge ${ok ? 'ao-badge-ok' : 'ao-badge-alert'}`}>
          <span className="ao-badge-dot"/>
          {systemHealth?.status || 'ONLINE'}
        </span>
      </div>
      <div className="infra-body">
        <div className="infra-score-row">
          <div className="infra-score-donut">
            <svg viewBox="0 0 72 72">
              <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="6"/>
              <circle
                cx="36" cy="36" r={r} fill="none"
                stroke={ok ? '#22C55E' : '#EF4444'} strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 1s ease', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
              />
            </svg>
            <div className="infra-score-label-wrap">
              <span className="infra-score-pct">{overallUptime}%</span>
              <span className="infra-score-txt">UPTIME</span>
            </div>
          </div>
          <div className="infra-score-stats">
            <div className="infra-stat-row">
              <span className="infra-stat-k">Healthy</span>
              <span className="infra-stat-v" style={{ color: '#22C55E' }}>{healthyCount} svc</span>
            </div>
            <div className="infra-stat-row">
              <span className="infra-stat-k">Degraded</span>
              <span className="infra-stat-v" style={{ color: '#F59E0B' }}>{INFRA_SERVICES.length - healthyCount} svc</span>
            </div>
            <div className="infra-stat-row">
              <span className="infra-stat-k">Incidents</span>
              <span className="infra-stat-v" style={{ color: '#EF4444' }}>0 active</span>
            </div>
          </div>
        </div>

        <div className="ao-div"/>

        <div className="infra-services">
          {INFRA_SERVICES.map((s, i) => {
            const color = s.status === 'ok' ? '#22C55E' : '#F59E0B';
            return (
              <div key={i} className="infra-svc-row">
                <div
                  className="infra-svc-dot"
                  style={{ background: color, boxShadow: `0 0 5px ${color}88` }}
                />
                <span className="infra-svc-name">{s.name}</span>
                <div className="infra-svc-bar-track">
                  <div
                    className="infra-svc-bar-fill"
                    style={{ width: `${s.uptime}%`, background: color }}
                  />
                </div>
                <span className="infra-svc-pct">{s.uptime}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ─── SupportOverviewPanel ───────────────────────────────────────────────── */
const SupportOverviewPanel = ({ tickets = [] }) => {
  const total    = tickets.length;
  const open     = tickets.filter(t => t.ticket_status === 'OPEN').length;
  const resolved = tickets.filter(t => t.ticket_status === 'RESOLVED').length;
  const rerouted = tickets.filter(t => t.was_manually_rerouted).length;
  const resolveRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const cx = 80, cy = 72, r = 56;
  const circumference = Math.PI * r;
  const offset = circumference * (1 - resolveRate / 100);

  return (
    <div className="panel panel-col">
      <div className="panel-head">
        <div>
          <div className="panel-title">Support Overview</div>
          <div className="panel-sub">Resolution rate · {total} total tickets</div>
        </div>
        <span className={`ao-badge ${open > 4 ? 'ao-badge-alert' : open > 2 ? 'ao-badge-warn' : 'ao-badge-ok'}`}>
          <span className="ao-badge-dot"/>{open > 0 ? `${open} OPEN` : 'ALL CLEAR'}
        </span>
      </div>
      <div className="panel-body">
        <div className="gauge-wrap">
          <svg width="160" height="90" viewBox="0 0 160 90" style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#9A7D28"/>
                <stop offset="100%" stopColor="#D4AF5A"/>
              </linearGradient>
            </defs>
            <path d={`M ${cx - r},${cy} A ${r} ${r} 0 0 1 ${cx + r},${cy}`} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="8" strokeLinecap="round"/>
            <path d={`M ${cx - r},${cy} A ${r} ${r} 0 0 1 ${cx + r},${cy}`} fill="none" stroke="rgba(186,151,49,.18)" strokeWidth="14" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.16,1,.3,1)' }}
            />
            <path d={`M ${cx - r},${cy} A ${r} ${r} 0 0 1 ${cx + r},${cy}`} fill="none" stroke="url(#gaugeGrad)" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.16,1,.3,1)' }}
            />
            <text x="80" y="68" textAnchor="middle" fontFamily="'Cormorant Garamond',serif" fontSize="26" fontWeight="700" fill="#D4AF5A">
              {resolveRate}
            </text>
            <text x="80" y="82" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="8" fill="#7A6420" letterSpacing="2">RESOLVED %</text>
          </svg>
          <div className="gauge-stats">
            <div className="gauge-stat">
              <div className="gauge-stat-val">{total}</div>
              <div className="gauge-stat-key">Total</div>
            </div>
            <div className="gauge-stat">
              <div className="gauge-stat-val" style={{ color: open > 0 ? '#EF4444' : '#22C55E' }}>{open}</div>
              <div className="gauge-stat-key">Open</div>
            </div>
            <div className="gauge-stat">
              <div className="gauge-stat-val" style={{ color: '#22C55E' }}>{resolved}</div>
              <div className="gauge-stat-key">Resolved</div>
            </div>
            <div className="gauge-stat">
              <div className="gauge-stat-val" style={{ color: rerouted > 0 ? '#F59E0B' : 'inherit' }}>{rerouted}</div>
              <div className="gauge-stat-key">Rerouted</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── AlertFeedPanel ─────────────────────────────────────────────────────── */
const AlertFeedPanel = ({ tickets = [], openCount = 0 }) => {
  const badgeClass = openCount > 4 ? 'ao-badge-alert' : openCount > 2 ? 'ao-badge-warn' : 'ao-badge-ok';
  return (
    <div className="panel panel-col">
      <div className="panel-head">
        <div>
          <div className="panel-title">Alert Feed</div>
          <div className="panel-sub">Sorted by severity · real-time</div>
        </div>
        <span className={`ao-badge ${badgeClass}`}>
          <span className="ao-badge-dot"/>
          {openCount} OPEN
        </span>
      </div>
      <div className="alert-feed-body">
        <div className="alert-list">
          {tickets.slice(0, 6).map((t, i) => {
            const cc = catColor(t.department || t.category);
            const isOpen = t.ticket_status === 'OPEN';
            return (
              <div key={t.ticket_id ?? t.id ?? i} className="alert-item">
                <div className="alert-cat-dot" style={{ background: cc, boxShadow: `0 0 6px ${cc}88` }}/>
                <div className="alert-body">
                  <div className="alert-subj">{t.issue_subject || t.subject || t.title || '—'}</div>
                  <div className="alert-meta">
                    <span className="alert-cat-pill" style={{ background: `${cc}18`, color: cc, border: `1px solid ${cc}30` }}>
                      {catLabel(t.department || t.category)}
                    </span>
                    <span className="alert-time">{t.created_at ? fmtRelative(t.created_at) : '—'}</span>
                  </div>
                </div>
                <span className="alert-status" style={{
                  background: isOpen ? 'rgba(239,68,68,.1)' : 'rgba(34,197,94,.1)',
                  color:      isOpen ? '#EF4444' : '#22C55E',
                  border:     `1px solid ${isOpen ? 'rgba(239,68,68,.25)' : 'rgba(34,197,94,.25)'}`,
                }}>
                  {t.ticket_status}
                </span>
              </div>
            );
          })}
          {tickets.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', fontFamily: "'JetBrains Mono',monospace", fontSize: '.65rem', color: '#3E3C3A' }}>
              NO ACTIVE ALERTS
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── DemandForecastPanel ─────────────────────────────────────────────────── */
const FORECAST_YEAR_COLORS = ['#BA9731', '#63B3ED', '#22C55E', '#F59E0B'];

const DemandForecastPanel = ({ forecasts = [] }) => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);

  const top = useMemo(() =>
    [...forecasts].sort((a, b) => b.predicted_demand - a.predicted_demand).slice(0, 8),
    [forecasts]
  );

  const maxDemand = top.length ? Math.max(...top.map(f => f.upper_bound || f.predicted_demand), 1) : 1;

  if (!top.length) {
    return (
      <div className="panel row3">
        <div className="panel-head">
          <div>
            <div className="panel-title">Enrollment Demand Forecast</div>
            <div className="panel-sub">Top subjects by predicted enrollment demand</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3E3C3A', display: 'block' }}/>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.6rem', color: '#3E3C3A', letterSpacing: '.06em' }}>NO DATA</span>
          </div>
        </div>
        <div className="sparkline-empty">
          <div className="sparkline-empty-icon">📊</div>
          <div className="sparkline-empty-text">NO FORECAST DATA — RUN FORECAST FROM ANALYTICS PAGE</div>
        </div>
      </div>
    );
  }

  return (
    <div className="panel row3">
      <div className="panel-head">
        <div>
          <div className="panel-title">Enrollment Demand Forecast</div>
          <div className="panel-sub">Top {top.length} subjects by predicted demand · {forecasts.length} total forecasted</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {[1, 2, 3, 4].map(yr => (
            <div key={yr} style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: FORECAST_YEAR_COLORS[yr - 1] }}/>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.54rem', color: '#5A5550' }}>Yr {yr}</span>
            </div>
          ))}
          <button
            onClick={() => navigate('/portal/admin/forecast')}
            style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.58rem', color: '#BA9731', background: 'rgba(186,151,49,.08)', border: '1px solid rgba(186,151,49,.25)', borderRadius: 4, padding: '.25rem .6rem', cursor: 'pointer', letterSpacing: '.04em', transition: 'background .15s' }}
          >FULL FORECAST →</button>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, padding: '4px 0' }}>
        {top.map((f, i) => {
          const pct   = (f.predicted_demand / maxDemand) * 100;
          const ciLo  = ((f.lower_bound || f.predicted_demand) / maxDemand) * 100;
          const ciHi  = ((f.upper_bound || f.predicted_demand) / maxDemand) * 100;
          const color = FORECAST_YEAR_COLORS[(f.target_year_level - 1) % FORECAST_YEAR_COLORS.length];
          const isHov = hovered === i;
          return (
            <div
              key={f.forecast_id ?? i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ display: 'grid', gridTemplateColumns: '80px 1fr 36px', alignItems: 'center', gap: 8, opacity: hovered !== null && !isHov ? 0.4 : 1, transition: 'opacity .15s' }}
            >
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.6rem', color: isHov ? color : '#8A8680', textAlign: 'right', letterSpacing: '.02em', transition: 'color .15s', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {f.subject_code}
              </span>
              <div style={{ position: 'relative', height: 14, background: 'rgba(255,255,255,.04)', borderRadius: 3 }}>
                {f.lower_bound !== f.upper_bound && (
                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${ciLo}%`, width: `${Math.max(ciHi - ciLo, 0.5)}%`, background: color, opacity: 0.18, borderRadius: 3 }}/>
                )}
                <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(to right, ${color}bb, ${color})`, borderRadius: 3, transition: 'width .6s cubic-bezier(.16,1,.3,1)', boxShadow: isHov ? `0 0 8px ${color}55` : 'none' }}/>
                {isHov && (
                  <div style={{ position: 'absolute', left: `${Math.min(pct, 72)}%`, bottom: '110%', transform: 'translateX(-50%)', background: 'rgba(10,10,10,.95)', border: `1px solid ${color}44`, borderTop: `2px solid ${color}`, borderRadius: 4, padding: '4px 9px', whiteSpace: 'nowrap', zIndex: 20, pointerEvents: 'none', boxShadow: '0 4px 16px rgba(0,0,0,.5)' }}>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.6rem', fontWeight: 700, color, marginBottom: 2 }}>{f.subject_title}</div>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.56rem', color: '#B8B4AC' }}>
                      Demand: <strong style={{ color }}>{f.predicted_demand}</strong> · CI: {f.lower_bound}–{f.upper_bound}
                    </div>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.52rem', color: '#5A5550', marginTop: 2 }}>
                      Year {f.target_year_level} · Sem {f.target_semester} · {f.forecast_academic_year}
                    </div>
                  </div>
                )}
              </div>
              <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '.9rem', fontWeight: 700, color, textAlign: 'right' }}>{f.predicted_demand}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─── ActivityPanel ─────────────────────────────────────────────────────── */
const DEPT_COLORS = ['#BA9731', '#D4AF5A', '#9A7D28', '#7A6420', '#5A4820', '#F59E0B'];

const ActivityPanel = ({ tickets = [] }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const deptMap = {};
  tickets.forEach(t => {
    const dept = t.department || t.category || 'OTHER';
    deptMap[dept] = (deptMap[dept] || 0) + 1;
  });
  const data = Object.entries(deptMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([dept, count], i) => ({ dept, count, color: DEPT_COLORS[i] ?? '#BA9731' }));

  const total    = data.reduce((s, d) => s + d.count, 0);
  const maxCount = data.length ? Math.max(...data.map(d => d.count)) : 1;

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <div className="panel-title">Triage Activity by Category</div>
          <div className="panel-sub">Ticket distribution — current cycle</div>
        </div>
      </div>
      <div className="activity-body">
        <div className="activity-bars" style={{ position: 'relative' }}>
          {data.map((d, i) => {
            const heightPct = (d.count / maxCount) * 100;
            const isHovered = hoveredIdx === i;
            return (
              <div
                key={d.dept}
                className="activity-bar-wrap"
                style={{ position: 'relative', cursor: 'pointer' }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Tooltip — rendered above the bar, clipped by the panel */}
                {isHovered && (
                  <div style={{
                    position: 'absolute',
                    bottom: `calc(${heightPct}% + 10px)`,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(10,10,10,0.94)',
                    border: `1px solid ${d.color}55`,
                    borderTop: `2px solid ${d.color}`,
                    borderRadius: 5,
                    padding: '5px 9px',
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap',
                    zIndex: 20,
                    boxShadow: `0 4px 16px rgba(0,0,0,.5), 0 0 0 1px ${d.color}22`,
                  }}>
                    <div style={{
                      fontFamily: "'JetBrains Mono',monospace", fontSize: '.62rem',
                      fontWeight: 700, color: d.color, letterSpacing: '.04em',
                    }}>
                      {catLabel(d.dept)}
                    </div>
                    <div style={{
                      fontFamily: "'JetBrains Mono',monospace", fontSize: '.58rem',
                      color: '#B8B4AC', marginTop: 2,
                    }}>
                      {d.count} ticket{d.count !== 1 ? 's' : ''}
                      <span style={{ color: '#5A5550', marginLeft: 4 }}>
                        ({total > 0 ? Math.round((d.count / total) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                )}
                <div
                  className="activity-bar"
                  style={{
                    height: `${heightPct}%`,
                    '--h': `${heightPct}%`,
                    background: `linear-gradient(to top, ${d.color}, ${d.color}88)`,
                    animationDelay: `${i * .1}s`,
                    boxShadow: isHovered
                      ? `0 -4px 20px ${d.color}77`
                      : `0 -2px 12px ${d.color}44`,
                    transform: isHovered ? 'scaleX(1.08)' : 'scaleX(1)',
                    transition: 'box-shadow .15s, transform .15s',
                  }}
                />
              </div>
            );
          })}
          {data.length === 0 && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono',monospace", fontSize: '.65rem', color: '#3E3C3A' }}>
              NO TICKET DATA
            </div>
          )}
        </div>
        <div className="activity-axis"/>
        <div style={{ display: 'flex', gap: '.625rem', marginTop: '.5rem', flexWrap: 'wrap' }}>
          {data.map((d, i) => (
            <div
              key={d.dept}
              style={{
                display: 'flex', alignItems: 'center', gap: '.3rem',
                opacity: hoveredIdx === null || hoveredIdx === i ? 1 : 0.4,
                transition: 'opacity .15s',
              }}
            >
              <div style={{ width: 6, height: 6, borderRadius: 1, background: d.color }}/>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.6rem', color: '#4A4840', letterSpacing: '.04em' }}>{catLabel(d.dept)}</span>
            </div>
          ))}
        </div>
        <div className="activity-summary">
          {[['Total', `${total}`], ['Avg/Cat', total && data.length ? (total / data.length).toFixed(1) : '—'], ['Peak', data[0] ? catLabel(data[0].dept) : '—']].map(([k, v]) => (
            <div key={k} className="activity-sum-card">
              <div className="activity-sum-val">{v}</div>
              <div className="activity-sum-key">{k}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── FacultyPanel ───────────────────────────────────────────────────────── */
const FacultyPanel = ({ facultyList = [], breakdown = {}, maxLoad = 4, onViewAll }) => {
  const sorted = [...facultyList]
    .sort((a, b) => (b.current_teaching_load ?? 0) - (a.current_teaching_load ?? 0))
    .slice(0, 6);

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <div className="panel-title">Faculty Load Status</div>
          <div className="panel-sub">{facultyList.length} faculty members</div>
        </div>
        <span className={`ao-badge ${breakdown.atCap > 2 ? 'ao-badge-warn' : 'ao-badge-ok'}`}>
          <span className="ao-badge-dot"/>
          CAP: {maxLoad}
        </span>
      </div>
      <div className="faculty-panel-body">
        <div className="faculty-cap-section">
          {[
            { label: 'At full capacity',   count: breakdown.atCap,    color: '#EF4444' },
            { label: 'Near capacity ≥70%', count: breakdown.nearCap,  color: '#F59E0B' },
            { label: 'Available',          count: breakdown.available, color: '#22C55E' },
          ].map(({ label, count, color }) => {
            const pct = breakdown.total > 0 ? Math.round((count / breakdown.total) * 100) : 0;
            return (
              <div key={label} className="cap-bar-row">
                <div className="cap-bar-header">
                  <span className="cap-bar-label">{label}</span>
                  <span className="cap-bar-val" style={{ color }}>
                    {count}<span style={{ color: '#3E3C3A', fontWeight: 400 }}> / {breakdown.total}</span>
                  </span>
                </div>
                <div className="cap-bar-track">
                  <div className="cap-bar-fill" style={{ width: `${pct}%`, background: color }}/>
                </div>
              </div>
            );
          })}
          <div className="ao-div" style={{ margin: '.875rem 0' }}/>
          <div className="faculty-list-header">Highest Load</div>
        </div>

        <div className="faculty-scroll-list">
          {sorted.length === 0 ? (
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.65rem', color: '#3E3C3A', textAlign: 'center', padding: '1rem 0' }}>NO FACULTY DATA</p>
          ) : sorted.map((f, i) => {
            const load  = f.current_teaching_load ?? 0;
            const ml    = f.maximum_teaching_load ?? maxLoad;
            const pct   = Math.round((load / ml) * 100);
            const color = pct >= 100 ? '#EF4444' : pct >= 70 ? '#F59E0B' : '#22C55E';
            const badge = pct >= 100 ? 'FULL' : pct >= 70 ? 'HIGH' : 'OK';
            return (
              <div key={f.account_id ?? i} className="faculty-row">
                <div style={{ minWidth: 0 }}>
                  <div className="faculty-name">{f.full_name || f.email || '—'}</div>
                  <div className="faculty-mini-bar">
                    <div className="faculty-mini-fill" style={{ width: `${Math.min(pct, 100)}%`, background: color }}/>
                  </div>
                </div>
                <div className="faculty-load-val">{load}/{ml}</div>
                <span className="faculty-badge" style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
                  {badge}
                </span>
              </div>
            );
          })}
        </div>

        <button className="view-btn" onClick={onViewAll}>
          View all faculty →
        </button>
      </div>
    </div>
  );
};

/* ─── Main ───────────────────────────────────────────────────────────────── */
const AdminOverview = () => {
  const navigate    = useNavigate();
  const refreshTick = useAdminRefresh();
  const syncIn      = useSyncCountdown(refreshTick);
  const systemHealth = useSystemHealth();

  const [requests,    setRequests]    = useState([]);
  const [subjects,    setSubjects]    = useState([]);
  const [tickets,     setTickets]     = useState([]);
  const [stats,       setStats]       = useState(null);
  const [facultyList, setFacultyList] = useState([]);
  const [forecasts,   setForecasts]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [reqR, curR, tixR, statR, facR, forR] = await Promise.allSettled([
        adminApi.fetchPendingEnrollments(),
        adminApi.fetchCurriculum(),
        adminApi.fetchAllTickets(),
        adminApi.fetchDashboardStats(),
        adminApi.fetchFacultyList(),
        adminApi.fetchEnrollmentForecast(),
      ]);
      if (reqR.status  === 'fulfilled') setRequests(reqR.value   ?? []);
      if (curR.status  === 'fulfilled') setSubjects(curR.value   ?? []);
      if (tixR.status  === 'fulfilled') setTickets(tixR.value    ?? []);
      if (statR.status === 'fulfilled') setStats(statR.value);
      if (facR.status  === 'fulfilled') setFacultyList(facR.value ?? []);
      if (forR.status  === 'fulfilled') setForecasts(forR.value?.forecasts ?? forR.value ?? []);
    } catch {
      setError('Failed to load dashboard data. Check API connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load, refreshTick]);

  const pendingCount = useMemo(() => requests.filter(r => r.review_status === 'PENDING').length, [requests]);
  const openTickets  = useMemo(() => tickets.filter(t => t.ticket_status  === 'OPEN').length, [tickets]);
  const systemAlert  = openTickets > 4;

  const facultyBreakdown = useMemo(() => {
    const atCap   = facultyList.filter(f => (f.current_teaching_load ?? 0) >= (f.maximum_teaching_load ?? 1)).length;
    const nearCap = facultyList.filter(f => {
      const r = (f.current_teaching_load ?? 0) / (f.maximum_teaching_load ?? 1);
      return r >= 0.7 && r < 1;
    }).length;
    return { atCap, nearCap, available: facultyList.length - atCap - nearCap, total: facultyList.length };
  }, [facultyList]);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Skeleton.PageHeader/>
      <Skeleton.KpiStrip count={5}/>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        <Skeleton.Card/><Skeleton.Card/><Skeleton.Card/>
      </div>
    </div>
  );

  if (error) return <div className="ao-error">⚠ {error}</div>;

  return (
    <div className="ao">
      {/* ── Header ── */}
      <div className="ao-header">
        <div>
          <div className="ao-sub">University Campus AI System — Mission-critical monitoring</div>
        </div>
        <div className="ao-header-right">
          <span className={`ao-badge ${systemAlert ? 'ao-badge-alert' : 'ao-badge-ok'}`}>
            <span className="ao-badge-dot"/>
            {systemAlert ? 'ALERT DETECTED' : 'ALL SYSTEMS NOMINAL'}
          </span>
          <div className="ao-sync">
            <div className="ao-sync-label">Auto-sync in</div>
            <div className="ao-sync-val">{pad2(Math.floor(syncIn / 60))}:{pad2(syncIn % 60)}</div>
          </div>
        </div>
      </div>

      <div className="ao-div"/>

      {/* ── KPI Strip ── */}
      <div className="kpi-strip">
        <KpiCard
          label="Total Students"
          value={stats?.total_students != null ? Number(stats.total_students).toLocaleString() : '—'}
          sub={`${subjects.length} active subjects`}
          icon={<IconStudents/>}
          delta={subjects.length > 0 ? `${subjects.length} subjects` : null}
          deltaType="neu"
          color="#BA9731"
        />
        <KpiCard
          label="Support Tickets"
          value={tickets.length}
          sub={`${openTickets} open · ${tickets.filter(t => t.ticket_status === 'RESOLVED').length} resolved`}
          icon={<IconBrain/>}
          delta={openTickets === 0 ? 'All clear' : `${openTickets} open`}
          deltaType={openTickets === 0 ? 'up' : openTickets > 4 ? 'down' : 'warn'}
          color="#63B3ED"
        />
        <KpiCard
          label="Faculty Members"
          value={(stats?.total_faculty ?? facultyList.length) || '—'}
          sub={`${facultyBreakdown.atCap} at full load`}
          icon={<IconFaculty/>}
          delta={facultyBreakdown.atCap > 0 ? `${facultyBreakdown.atCap} full` : 'All available'}
          deltaType={facultyBreakdown.atCap > 2 ? 'warn' : 'up'}
          color="#D4AF5A"
        />
        <KpiCard
          label="Pending Enrollments"
          value={pendingCount}
          sub="Awaiting admin review"
          icon={<IconEnroll/>}
          delta={pendingCount > 0 ? `${pendingCount} pending` : 'Clear'}
          deltaType={pendingCount > 0 ? 'warn' : 'up'}
          color={pendingCount > 0 ? '#F59E0B' : '#22C55E'}
        />
        <KpiCard
          label="Open Tickets"
          value={openTickets}
          sub={`of ${tickets.length} total`}
          icon={<IconTicket/>}
          delta={openTickets > 0 ? `${openTickets} open` : 'All clear'}
          deltaType={openTickets > 5 ? 'down' : openTickets > 2 ? 'warn' : 'up'}
          color={openTickets > 5 ? '#EF4444' : openTickets > 2 ? '#F59E0B' : '#22C55E'}
        />
      </div>

      {/* ── Row 2: Infra + AI Gauge + Alert Feed ── */}
      <div className="row2">
        <InfraPanel systemHealth={systemHealth}/>
        <SupportOverviewPanel tickets={tickets}/>
        <AlertFeedPanel tickets={tickets} openCount={openTickets}/>
      </div>

      {/* ── Row 3: Enrollment Demand Forecast ── */}
      <DemandForecastPanel forecasts={forecasts}/>

      {/* ── Row 4: Activity + Faculty ── */}
      <div className="row4">
        <ActivityPanel tickets={tickets}/>
        <FacultyPanel
          facultyList={facultyList}
          breakdown={facultyBreakdown}
          maxLoad={stats?.global_max_teaching_load ?? 4}
          onViewAll={() => navigate('/portal/admin/faculty')}
        />
      </div>
    </div>
  );
};

export default AdminOverview;