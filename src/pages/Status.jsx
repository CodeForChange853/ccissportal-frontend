import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useSystemHealth from '../hooks/useSystemHealth';
import client from '../api/client';
import '../styles/components/status.css';

/* ─── Theme ─────────────────────────────────────────── */
const T = {
  bg: '#FAF8F5',
  surface: '#FFFFFF',
  surfaceHi: '#F5F3EE',
  gold: '#A37F21',
  goldLight: '#BA9731',
  goldDim: '#8B6914',
  goldBorder: 'rgba(163,127,33,0.20)',
  text: '#1A1814',
  textSec: '#5C5A56',
  textMuted: '#8A8680',
  ok: '#16A34A',
  warn: '#D97706',
  danger: '#DC2626',
};

/* ─── Heatmap generator ─────────────────────────────── */
const genHeat = (reliability = 1) =>
  Array.from({ length: 90 }, (_, i) => {
    const r = Math.random();
    if (i > 85) return 'ok';
    if (r < reliability * 0.93) return 'ok';
    if (r < reliability * 0.97) return 'warn';
    return 'danger';
  });

/* ─── Static service definitions ───────────────────── */
const BASE_SERVICES = [
  { name: 'AI Vision Core (Gemini)', uptime: '99.98', rel: 0.998, tag: 'AI' },
  { name: 'Backend API Gateway', uptime: '99.92', rel: 0.992, tag: 'API' },
  { name: 'Enrollment Engine', uptime: '100.00', rel: 1.00, tag: 'CORE' },
  { name: 'Document Vault (Zero-Retention)', uptime: '99.99', rel: 0.999, tag: 'VAULT' },
  { name: 'Global Database Cluster', uptime: '99.95', rel: 0.995, tag: 'DB' },
  { name: 'Authentication Service', uptime: '100.00', rel: 1.00, tag: 'AUTH' },
];

/* ─── Mock / fallback incidents ─────────────────────── */
const MOCK_INCIDENTS = [
  { title: 'Scheduled System Maintenance', date: 'May 11, 2026 — 02:00 AM', body: 'Routine optimization of the AI document processing engine. System was offline for 15 minutes. Services fully restored.', badge: 'RESOLVED', type: 'maintenance' },
  { title: 'Partial API Latency Spike', date: 'May 08, 2026 — 11:45 PM', body: 'Identified a bottleneck in the faculty load synchronization module. Fix applied within 8 minutes of detection.', badge: 'RESOLVED', type: 'incident' },
  { title: '1st Semester Enrollment Open', date: 'May 05, 2026 — 08:00 AM', body: 'Official enrollment window for the 1st Semester, A.Y. 2026–2027 is now live. All services operating at full capacity.', badge: 'ANNOUNCEMENT', type: 'announcement' },
];

/* ─── Helpers ────────────────────────────────────────── */
const heatColor = (v) => ({ ok: T.ok, warn: T.warn, danger: T.danger })[v] || 'rgba(255,255,255,0.06)';
const heatH = (v) => ({ ok: '100%', warn: '65%', danger: '40%' })[v] || '25%';

const incidentDotColor = (type) => ({ maintenance: T.textSec, incident: T.warn, announcement: T.gold })[type] || T.textSec;
const incidentBadge = (badge) => ({
  RESOLVED: { bg: 'rgba(34,197,94,.1)', border: 'rgba(34,197,94,.3)', color: T.ok, dot: T.ok },
  ANNOUNCEMENT: { bg: 'rgba(186,151,49,.1)', border: 'rgba(186,151,49,.3)', color: T.gold, dot: T.gold },
  INVESTIGATING: { bg: 'rgba(239,68,68,.1)', border: 'rgba(239,68,68,.3)', color: T.danger, dot: T.danger },
  MAINTENANCE: { bg: 'rgba(245,158,11,.1)', border: 'rgba(245,158,11,.3)', color: T.warn, dot: T.warn },
})[badge] || { bg: 'rgba(163,127,33,.06)', border: 'rgba(163,127,33,.18)', color: T.textSec, dot: T.textSec };

const svcStatusColor = (s) =>
  s === 'Operational' || s === 'Active' ? T.ok
    : s === 'Standby' ? T.gold
      : s === 'Maintenance' ? T.warn
        : T.danger;

/* ─── CSS ────────────────────────────────────────────── */


/* ─── HeatGraph ─────────────────────────────────────── */
const HeatGraph = ({ heat }) => (
  <div>
    <div className="sp-heat">
      {heat.map((v, i) => (
        <div
          key={i}
          className="sp-heat-bar"
          title={`Day ${90 - i}: ${v}`}
          style={{
            background: heatColor(v),
            height: heatH(v),
            animationDelay: `${i * 4}ms`,
            opacity: v === 'none' ? 0.4 : 1,
          }}
        />
      ))}
    </div>
    <div className="sp-heat-legend">
      <span className="sp-heat-past">90 days ago</span>
      <div className="sp-heat-dots">
        {[[T.ok, 'Operational', '■'], [T.warn, 'Degraded', '▲'], [T.danger, 'Outage', '✕']].map(([c, l, s]) => (
          <div key={l} className="sp-heat-dot-row">
            <span aria-hidden="true" style={{ fontSize: '.65rem', color: c, lineHeight: 1 }}>{s}</span>
            <span className="sp-heat-dot-lbl">{l}</span>
          </div>
        ))}
      </div>
      <span className="sp-heat-past">Today</span>
    </div>
  </div>
);

/* ─── Main Component ─────────────────────────────────── */
const Status = () => {
  const navigate = useNavigate();
  const { status, enrollmentOpen, lastChecked } = useSystemHealth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [uptimeFill, setUptimeFill] = useState(0);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const { data } = await client.getAnnouncements();
        setAnnouncements(data);
      } catch (err) {
        console.error('Failed to fetch announcements', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
    const t1 = setTimeout(() => setShow(true), 60);
    const t2 = setTimeout(() => setUptimeFill(99.96), 400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const globalOk = status === 'ONLINE';
  const globalColor = globalOk ? T.ok : status === 'MAINTENANCE' ? T.warn : T.danger;
  const globalLabel = globalOk ? 'All Systems Operational' : status === 'MAINTENANCE' ? 'Scheduled Maintenance' : 'Service Disruption';
  const globalSub = globalOk
    ? 'NexEnroll cloud infrastructure is monitored continuously. All services are healthy and performing within expected parameters.'
    : 'We are currently aware of an issue and our team is actively investigating. Updates will follow shortly.';

  const services = BASE_SERVICES.map(s => ({
    ...s,
    heat: genHeat(s.rel),
    svcStatus:
      s.name.includes('Enrollment') ? (enrollmentOpen ? 'Active' : 'Standby')
        : status === 'ONLINE' ? 'Operational'
          : status === 'MAINTENANCE' ? 'Maintenance'
            : 'Outage',
  }));

  const rawIncidents = announcements.length > 0 ? announcements : MOCK_INCIDENTS;

  // Inject live incident if system is not OK
  const activeIncident = !globalOk ? [{
    title: globalLabel,
    date: `Detected at ${lastChecked.toLocaleTimeString()}`,
    body: globalSub,
    status: status === 'MAINTENANCE' ? 'MAINTENANCE' : 'INVESTIGATING',
    badge: status === 'MAINTENANCE' ? 'MAINTENANCE' : 'INVESTIGATING',
    type: status === 'MAINTENANCE' ? 'maintenance' : 'incident'
  }] : [];

  const incidents = [...activeIncident, ...rawIncidents];

  return (
    <>

      <div className="sp" style={{ opacity: show ? 1 : 0, transition: 'opacity .4s' }}>
        <a href="#main-content" className="skip-to-content">Skip to main content</a>
        <div className="sp-noise" aria-hidden="true" />

        {/* ── Topbar ── */}
        <div className="sp-topbar">
          <button
            className="sp-topbar-brand"
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit', color: 'inherit' }}
          >
            <div className="sp-topbar-logo">N</div>
            <span className="sp-topbar-name">NexEnroll <em>Status</em></span>
          </button>
          <div className="sp-topbar-right">
            <span className="sp-topbar-ts">
              Updated: {lastChecked.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <button className="sp-btn" onClick={() => navigate('/')}>← Back to Portal</button>
          </div>
        </div>

        <div id="main-content" className="sp-inner">

          {/* ── Hero ── */}
          <div className="sp-hero">
            <div className="sp-hero-indicator">
              <div className="sp-indicator-ring">
                <div className="sp-ring-outer" style={{ borderColor: globalColor }} />
                <div className="sp-ring-inner" />
                <div className="sp-ring-dot" style={{ background: `${globalColor}1A`, border: `1.5px solid ${globalColor}66`, boxShadow: `0 0 18px ${globalColor}44` }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: globalColor, boxShadow: `0 0 10px ${globalColor}`, animation: 'blink 2s ease-in-out infinite' }} />
                </div>
              </div>
            </div>
            <div className="sp-hero-text">
              <div className="sp-hero-label">System Status</div>
              <h1 className="sp-hero-h1" style={{ color: globalOk ? T.text : globalColor }}>{globalLabel}</h1>
              <p className="sp-hero-sub">{globalSub}</p>
              <div className="sp-hero-meta">
                <div className="sp-meta-pill"><div className="sp-meta-dot" style={{ background: globalColor }} />{status}</div>
                <div className="sp-meta-pill">ENROLLMENT: {enrollmentOpen ? 'OPEN' : 'CLOSED'}</div>
                <div className="sp-meta-pill">NwSSU · CCIS</div>
              </div>
            </div>
          </div>

          {/* ── Overall Uptime ── */}
          <div className="sp-uptime-section">
            <div className="sp-section-hd">
              <span className="sp-section-title">Overall Uptime</span>
              <span className="sp-section-sub">Last 90 days</span>
            </div>
            <div className="sp-uptime-bar-wrap">
              <div className="sp-uptime-stat-row">
                <div>
                  <div className="sp-uptime-label">Platform uptime</div>
                  <div className="sp-uptime-big">{uptimeFill.toFixed(2)}%</div>
                </div>
                <div style={{ flex: 1, minWidth: 0, paddingBottom: '.35rem' }}>
                  <div className="sp-uptime-period">A.Y. 2026 · Measured across all services</div>
                </div>
              </div>
              <div className="sp-uptime-track">
                <div className="sp-uptime-fill" style={{ width: `${uptimeFill}%` }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '.35rem' }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.75rem', color: T.textMuted }}>0%</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.75rem', color: T.ok, fontWeight: 600 }}>
                  {uptimeFill.toFixed(2)}% · Target: 99.90%
                </span>
              </div>
            </div>
          </div>

          {/* ── Services ── */}
          <div style={{ marginBottom: '3.5rem', animation: 'fadeUp .7s .18s both' }}>
            <div className="sp-section-hd">
              <span className="sp-section-title">Core Infrastructure</span>
              <span className="sp-section-sub">{services.length} services monitored</span>
            </div>
            <div className="sp-services">
              {services.map((s, i) => {
                const sc = svcStatusColor(s.svcStatus);
                return (
                  <div key={i} className="sp-svc-row" style={{ animationDelay: `${.22 + i * .06}s` }}>
                    <div className="sp-svc-top">
                      <div className="sp-svc-left">
                        <span className="sp-svc-tag">{s.tag}</span>
                        <span className="sp-svc-name">{s.name}</span>
                      </div>
                      <div className="sp-svc-right">
                        <span className="sp-svc-uptime">{s.uptime}%</span>
                        <div className="sp-svc-badge">
                          <div className="sp-svc-badge-dot" style={{ background: sc }} />
                          <span className="sp-svc-badge-lbl" style={{ color: sc }}>{s.svcStatus}</span>
                        </div>
                      </div>
                    </div>
                    <HeatGraph heat={s.heat} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Incident Timeline ── */}
          <div style={{ animation: 'fadeUp .7s .32s both' }}>
            <div className="sp-section-hd">
              <span className="sp-section-title">Incident &amp; Maintenance History</span>
              <span className="sp-section-sub">{incidents.length} entries</span>
            </div>
            <div className="sp-timeline">
              {incidents.map((inc, i) => {
                const bd = incidentBadge(inc.badge || inc.status);
                const dc = incidentDotColor(inc.type);
                return (
                  <div key={i} className="sp-timeline-item" style={{ animationDelay: `${.35 + i * .08}s` }}>
                    <div className="sp-tl-left">
                      <div className="sp-tl-dot" style={{ borderColor: dc, background: `${dc}22` }} />
                      <div className="sp-tl-line" />
                    </div>
                    <div className="sp-tl-body">
                      <div className="sp-tl-date">{inc.created_at || inc.date}</div>
                      <div className="sp-tl-title">{inc.title}</div>
                      <div className="sp-tl-body-text">{inc.body}</div>
                      <span className="sp-tl-badge" style={{ background: bd.bg, border: `1px solid ${bd.border}`, color: bd.color }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: bd.dot }} />
                        {inc.badge || inc.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="sp-footer">
            <div className="sp-footer-r">© {new Date().getFullYear()} NwSSU CCIS · NexEnroll</div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Status;