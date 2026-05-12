import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useSystemHealth from '../hooks/useSystemHealth';
import client from '../api/client';

/* ─── Theme ─────────────────────────────────────────── */
const T = {
  bg: '#0A0A0A',
  surface: '#111111',
  surfaceHi: '#181818',
  gold: '#BA9731',
  goldLight: '#D4AF5A',
  goldDim: '#7A6420',
  goldBorder: 'rgba(186,151,49,0.15)',
  text: '#F0EDE8',
  textSec: '#8A8680',
  textMuted: '#3E3C3A',
  ok: '#22C55E',
  warn: '#F59E0B',
  danger: '#EF4444',
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
})[badge] || { bg: 'rgba(255,255,255,.05)', border: 'rgba(255,255,255,.1)', color: T.textSec, dot: T.textSec };

const svcStatusColor = (s) =>
  s === 'Operational' || s === 'Active' ? T.ok
    : s === 'Standby' ? T.gold
      : s === 'Maintenance' ? T.warn
        : T.danger;

/* ─── CSS ────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

  @keyframes fadeUp   { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:translateY(0);} }
  @keyframes fadeIn   { from{opacity:0;} to{opacity:1;} }
  @keyframes spinRing { to{transform:rotate(360deg);} }
  @keyframes blink    { 0%,100%{opacity:1;} 50%{opacity:.3;} }
  @keyframes noise    { 0%{transform:translate(0,0);} 25%{transform:translate(-1px,1px);} 50%{transform:translate(1px,-1px);} 75%{transform:translate(-1px,-1px);} }
  @keyframes barReveal{ from{transform:scaleY(0);} to{transform:scaleY(1);} }
  @keyframes slideIn  { from{opacity:0;transform:translateX(-10px);} to{opacity:1;transform:translateX(0);} }

  .sp {
    min-height:100vh; background:#0A0A0A;
    background-image:
      radial-gradient(ellipse 80% 50% at 50% -10%, rgba(186,151,49,.07) 0%, transparent 55%),
      radial-gradient(ellipse 30% 40% at 90% 90%,  rgba(186,151,49,.04) 0%, transparent 50%);
    color:#F0EDE8; font-family:'DM Sans',sans-serif;
    padding:0 0 6rem; position:relative; overflow-x:hidden;
  }
  .sp-noise {
    position:fixed;inset:-50%;width:200%;height:200%;opacity:.018;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    pointer-events:none; animation:noise .2s steps(1) infinite;
  }

  .sp-topbar {
    position:sticky; top:0; z-index:100;
    backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px);
    background:rgba(10,10,10,.88); border-bottom:1px solid rgba(186,151,49,.1);
    padding:.875rem 2rem; display:flex; align-items:center; justify-content:space-between; gap:1rem;
  }
  .sp-topbar-brand { display:flex; align-items:center; gap:.625rem; cursor:pointer; }
  .sp-topbar-logo  { width:28px;height:28px;border-radius:7px;background:linear-gradient(135deg,#BA9731,#9A7D28);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.75rem;color:#0A0A0A;flex-shrink:0; }
  .sp-topbar-name  { font-size:.875rem;font-weight:700;letter-spacing:-.02em; }
  .sp-topbar-name em { color:#BA9731;font-style:normal; }
  .sp-topbar-right { display:flex;align-items:center;gap:.75rem; }
  .sp-topbar-ts    { font-family:'JetBrains Mono',monospace;font-size:.6rem;color:#3E3C3A;white-space:nowrap; }
  .sp-btn { background:transparent;border:1px solid rgba(186,151,49,.2);color:#8A8680;padding:.45rem 1rem;border-radius:.5rem;font-family:'DM Sans',sans-serif;font-size:.75rem;font-weight:600;cursor:pointer;transition:all .2s; }
  .sp-btn:hover { border-color:rgba(186,151,49,.45);color:#F0EDE8;background:rgba(186,151,49,.05); }

  .sp-inner { max-width:56rem;margin:0 auto;padding:0 1.5rem; }

  .sp-hero { padding:3.5rem 0 2.5rem;display:flex;align-items:center;gap:3rem;animation:fadeUp .6s cubic-bezier(.16,1,.3,1) both; }
  .sp-hero-indicator { flex-shrink:0;display:flex;flex-direction:column;align-items:center; }
  .sp-indicator-ring { width:72px;height:72px;position:relative;display:flex;align-items:center;justify-content:center; }
  .sp-ring-outer { position:absolute;inset:0;border-radius:50%;border:1.5px dashed;animation:spinRing 20s linear infinite;opacity:.4; }
  .sp-ring-inner { position:absolute;inset:10px;border-radius:50%;border:1px solid rgba(186,151,49,.2); }
  .sp-ring-dot   { width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;position:relative;z-index:1; }
  .sp-hero-text  { flex:1; }
  .sp-hero-label { font-size:.6rem;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#7A6420;margin-bottom:.5rem;display:flex;align-items:center;gap:.5rem; }
  .sp-hero-label::before { content:'';display:block;width:20px;height:1px;background:#7A6420; }
  .sp-hero-h1    { font-family:'Cormorant Garamond',serif;font-size:clamp(1.75rem,4vw,2.5rem);font-weight:700;line-height:1.1;letter-spacing:-.01em;margin-bottom:.5rem; }
  .sp-hero-sub   { font-size:.875rem;color:#8A8680;line-height:1.65; }
  .sp-hero-meta  { margin-top:1rem;display:flex;align-items:center;gap:1.25rem;flex-wrap:wrap; }
  .sp-meta-pill  { display:inline-flex;align-items:center;gap:.4rem;font-family:'JetBrains Mono',monospace;font-size:.6rem;font-weight:500;padding:.3rem .75rem;border-radius:4px;background:rgba(186,151,49,.06);border:1px solid rgba(186,151,49,.16);color:#7A6420; }
  .sp-meta-dot   { width:5px;height:5px;border-radius:50%;animation:blink 1.5s ease infinite; }

  .sp-section-hd { display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem;padding-bottom:.875rem;border-bottom:1px solid rgba(186,151,49,.1); }
  .sp-section-title { font-size:.625rem;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#7A6420;display:flex;align-items:center;gap:.5rem; }
  .sp-section-title::before { content:'';display:block;width:14px;height:1px;background:#7A6420; }
  .sp-section-sub { font-size:.6875rem;color:#3E3C3A;font-family:'JetBrains Mono',monospace; }

  .sp-services { display:flex;flex-direction:column;gap:0;margin-bottom:3.5rem; }
  .sp-svc-row  { padding:1.1rem 0;border-bottom:1px solid rgba(255,255,255,.04);animation:fadeUp .5s cubic-bezier(.16,1,.3,1) both; }
  .sp-svc-row:last-child { border-bottom:none; }
  .sp-svc-top  { display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem;gap:1rem; }
  .sp-svc-left { display:flex;align-items:center;gap:.625rem; }
  .sp-svc-tag  { font-family:'JetBrains Mono',monospace;font-size:.55rem;font-weight:500;padding:.2rem .5rem;border-radius:3px;background:rgba(186,151,49,.07);border:1px solid rgba(186,151,49,.18);color:#7A6420;letter-spacing:.08em;flex-shrink:0; }
  .sp-svc-name { font-size:.875rem;font-weight:600;color:#F0EDE8; }
  .sp-svc-right { display:flex;align-items:center;gap:.875rem;flex-shrink:0; }
  .sp-svc-uptime { font-family:'JetBrains Mono',monospace;font-size:.7rem;font-weight:500;color:#3E3C3A; }
  .sp-svc-badge  { display:flex;align-items:center;gap:.35rem; }
  .sp-svc-badge-dot { width:6px;height:6px;border-radius:50%;flex-shrink:0; }
  .sp-svc-badge-lbl { font-size:.7rem;font-weight:700; }

  .sp-heat { display:flex;align-items:flex-end;gap:2px;height:28px;overflow:hidden; }
  .sp-heat-bar { flex:1;min-width:0;border-radius:2px;cursor:default;transform-origin:bottom;animation:barReveal .4s ease both;transition:opacity .15s,transform .15s;position:relative; }
  .sp-heat-bar:hover { opacity:.75;transform:scaleY(1.15);transform-origin:bottom; }
  .sp-heat-legend { display:flex;align-items:center;justify-content:space-between;margin-top:.45rem; }
  .sp-heat-past { font-family:'JetBrains Mono',monospace;font-size:.58rem;color:#3E3C3A; }
  .sp-heat-dots { display:flex;align-items:center;gap:.5rem; }
  .sp-heat-dot-row { display:flex;align-items:center;gap:.25rem; }
  .sp-heat-dot { width:6px;height:6px;border-radius:1px; }
  .sp-heat-dot-lbl { font-family:'JetBrains Mono',monospace;font-size:.55rem;color:#3E3C3A; }

  .sp-uptime-section { margin-bottom:3.5rem;animation:fadeUp .7s .1s both; }
  .sp-uptime-bar-wrap { background:#111111;border:1px solid rgba(186,151,49,.12);border-radius:1rem;padding:1.75rem 1.5rem; }
  .sp-uptime-stat-row { display:flex;align-items:flex-end;gap:1.5rem;margin-bottom:1.5rem;flex-wrap:wrap; }
  .sp-uptime-big { font-family:'Cormorant Garamond',serif;font-size:3rem;font-weight:700;color:#BA9731;line-height:1; }
  .sp-uptime-label { font-size:.8rem;color:#8A8680;margin-bottom:.35rem; }
  .sp-uptime-period { font-family:'JetBrains Mono',monospace;font-size:.65rem;color:#3E3C3A; }
  .sp-uptime-track { height:6px;border-radius:3px;background:rgba(255,255,255,.06);overflow:hidden;margin-bottom:.5rem; }
  .sp-uptime-fill  { height:100%;border-radius:3px;background:linear-gradient(90deg,#22C55E,#16A34A);transition:width 1s cubic-bezier(.16,1,.3,1); }

  .sp-timeline { display:flex;flex-direction:column;gap:0;margin-bottom:3.5rem; }
  .sp-timeline-item { display:flex;gap:1.25rem;padding:1.5rem 0;border-bottom:1px solid rgba(255,255,255,.04);animation:slideIn .5s ease both; }
  .sp-timeline-item:last-child { border-bottom:none; }
  .sp-tl-left  { display:flex;flex-direction:column;align-items:center;flex-shrink:0;width:14px;padding-top:.25rem; }
  .sp-tl-dot   { width:10px;height:10px;border-radius:50%;flex-shrink:0;border:2px solid; }
  .sp-tl-line  { flex:1;width:1px;background:rgba(186,151,49,.12);margin-top:.5rem;min-height:2rem; }
  .sp-timeline-item:last-child .sp-tl-line { display:none; }
  .sp-tl-body  { flex:1;padding-bottom:.5rem; }
  .sp-tl-date  { font-family:'JetBrains Mono',monospace;font-size:.6rem;color:#3E3C3A;margin-bottom:.5rem; }
  .sp-tl-title { font-size:.9375rem;font-weight:700;margin-bottom:.5rem;color:#F0EDE8; }
  .sp-tl-body-text { font-size:.8375rem;color:#8A8680;line-height:1.68;margin-bottom:.75rem; }
  .sp-tl-badge { display:inline-flex;align-items:center;gap:.35rem;font-family:'JetBrains Mono',monospace;font-size:.58rem;font-weight:700;letter-spacing:.1em;padding:.25rem .6rem;border-radius:3px; }

  .sp-footer { border-top:1px solid rgba(186,151,49,.1);padding-top:2rem;margin-top:1rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.75rem; }
  .sp-footer-l { font-family:'JetBrains Mono',monospace;font-size:.6rem;color:#3E3C3A; }
  .sp-footer-r { font-size:.6rem;color:#3E3C3A; }

  @media (max-width:640px) {
    .sp-topbar { padding:.75rem 1rem; }
    .sp-topbar-ts { display:none; }
    .sp-hero { flex-direction:column;align-items:flex-start;gap:1.5rem;padding:2.5rem 0 2rem; }
    .sp-indicator-ring { width:56px;height:56px; }
    .sp-ring-dot { width:30px;height:30px; }
    .sp-inner { padding:0 1rem; }
    .sp-svc-name { font-size:.8125rem; }
    .sp-uptime-big { font-size:2.25rem; }
    .sp-footer { flex-direction:column;align-items:flex-start; }
    .sp-hero-meta { gap:.625rem; }
  }
  @media (max-width:400px) {
    .sp-heat { gap:1px; }
  }
`;

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
        {[[T.ok, 'Operational'], [T.warn, 'Degraded'], [T.danger, 'Outage']].map(([c, l]) => (
          <div key={l} className="sp-heat-dot-row">
            <div className="sp-heat-dot" style={{ background: c }} />
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
      <style>{css}</style>
      <div className="sp" style={{ opacity: show ? 1 : 0, transition: 'opacity .4s' }}>
        <div className="sp-noise" />

        {/* ── Topbar ── */}
        <div className="sp-topbar">
          <div className="sp-topbar-brand" onClick={() => navigate('/')}>
            <div className="sp-topbar-logo">N</div>
            <span className="sp-topbar-name">NexEnroll <em>Status</em></span>
          </div>
          <div className="sp-topbar-right">
            <span className="sp-topbar-ts">
              Updated: {lastChecked.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <button className="sp-btn" onClick={() => navigate('/')}>← Back to Portal</button>
          </div>
        </div>

        <div className="sp-inner">

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
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.58rem', color: T.textMuted }}>0%</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.58rem', color: T.ok, fontWeight: 600 }}>
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
            <div className="sp-footer-l">AI-Core Resilience Protocol v2.4 · Auto-refresh every 30s</div>
            <div className="sp-footer-r">© {new Date().getFullYear()} NwSSU CCIS · NexEnroll</div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Status;