import React, { useState } from 'react';
import '../../../styles/components/emergency-bar.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useIncident } from '../layout/AdminLayout';
import { adminApi } from '../api/adminApi';



// ── Single action button inside the bar
function BarAction({ label, onClick, primary, danger, disabled, accentColor }) {
  const [hov, setHov] = useState(false);
  const color = accentColor || (danger ? '#EF4444' : null);

  let bg, border, text;
  if (primary && color) {
    bg     = hov ? color : `${color}28`;
    border = `${color}44`;
    text   = hov ? '#fff' : color;
  } else if (danger) {
    bg     = hov ? 'rgba(239,68,68,0.16)' : 'rgba(239,68,68,0.07)';
    border = 'rgba(239,68,68,0.20)';
    text   = hov ? '#FCA5A5' : 'rgba(239,68,68,0.72)';
  } else {
    bg     = hov ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)';
    border = 'rgba(255,255,255,0.09)';
    text   = hov ? 'rgba(255,255,255,0.90)' : 'rgba(255,255,255,0.50)';
  }

  return (
    <button
      onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        height: 26, padding: '0 11px', flexShrink: 0,
        background: disabled ? 'rgba(255,255,255,0.03)' : bg,
        border: `1px solid ${border}`,
        borderRadius: 5,
        color: disabled ? 'rgba(255,255,255,0.22)' : text,
        fontSize: '0.68rem', fontFamily: 'var(--font-display)', fontWeight: 500,
        cursor: disabled ? 'default' : 'pointer',
        transition: 'background 0.12s, color 0.12s',
        whiteSpace: 'nowrap',
      }}
    >{label}</button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EmergencyBar — fixed bottom strip shown during active incidents.
// Hidden automatically when the admin is already on the Audit page.
// ─────────────────────────────────────────────────────────────────────────────
export default function EmergencyBar() {
  const { incidentLevel, isActive } = useIncident();
  const location  = useLocation();
  const navigate  = useNavigate();

  const [lockStep,   setLockStep]   = useState('idle'); // 'idle' | 'confirm' | 'locking'
  const [exporting,  setExporting]  = useState(false);

  // Don't show on the Audit page (admin is already there) or when inactive
  if (!isActive || location.pathname.includes('/audit')) return null;

  const isCritical   = incidentLevel === 'critical';
  const accentColor  = isCritical ? '#EF4444' : '#F59E0B';
  const borderTop    = isCritical ? 'rgba(239,68,68,0.30)' : 'rgba(245,158,11,0.25)';
  const statusLabel  = isCritical ? 'Critical Incident' : 'Elevated Alert';

  // ── Lock Down: two-step confirm → PATCH maintenance mode
  const handleLockDown = async () => {
    if (lockStep === 'idle') { setLockStep('confirm'); return; }
    setLockStep('locking');
    try {
      await adminApi.updateSystemSettings({ is_maintenance_mode: true });
      navigate('/portal/admin/settings');
    } catch {
      setLockStep('idle');
    }
  };

  // ── Export: fetch recent audit events → CSV download
  const handleExport = async () => {
    setExporting(true);
    try {
      const raw    = await adminApi.fetchAuditEvents({ limit: 500 });
      const events = Array.isArray(raw) ? raw : (raw?.events ?? raw?.items ?? []);
      if (!events.length) return;

      const headers = ['ID', 'Event Type', 'Actor', 'Target', 'Description', 'Timestamp', 'Anomaly Score'];
      const rows    = events.map(e => [
        e.id            ?? '',
        e.event_type    ?? '',
        e.actor_email   ?? '',
        e.target_entity ?? '',
        String(e.description ?? '').replace(/,/g, ';').replace(/\n/g, ' '),
        e.created_at    ?? '',
        e.anomaly_score ?? '',
      ]);
      const csv  = [headers, ...rows].map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `audit-export-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch { /* silent */ } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <div
        role="complementary"
        aria-label="Incident response bar"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          height: 38, zIndex: 500,
          background: 'rgba(9, 9, 11, 0.96)',
          backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          borderTop: `1px solid ${borderTop}`,
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '0 18px',
          animation: 'emergencyBarReveal 0.22s ease both',
        }}
      >
        {/* ── Status indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginRight: 4 }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
            background: accentColor, boxShadow: `0 0 5px ${accentColor}`,
            animation: 'ebDot 1.1s ease-in-out infinite',
          }} />
          <span style={{
            fontSize: '0.58rem', fontFamily: 'var(--font-code)',
            fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase',
            color: accentColor,
          }}>{statusLabel}</span>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.10)', flexShrink: 0 }} />

        {/* ── Quick actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flex: 1 }}>

          <BarAction
            label="Audit Intelligence"
            onClick={() => navigate('/portal/admin/audit')}
            primary
            accentColor={accentColor}
          />

          {/* Lock Down — two-step confirm */}
          {lockStep === 'confirm' ? (
            <>
              <span style={{
                fontSize: '0.65rem', color: 'rgba(239,68,68,0.80)',
                fontFamily: 'var(--font-code)', flexShrink: 0,
              }}>
                This activates maintenance mode. Confirm?
              </span>
              <BarAction
                label="Yes, Lock Down"
                onClick={handleLockDown}
                danger
                disabled={lockStep === 'locking'}
              />
              <BarAction
                label="Cancel"
                onClick={() => setLockStep('idle')}
              />
            </>
          ) : (
            <BarAction
              label={lockStep === 'locking' ? 'Locking…' : 'Lock Down System'}
              onClick={handleLockDown}
              danger
              disabled={lockStep === 'locking'}
            />
          )}

          <BarAction
            label={exporting ? 'Exporting…' : 'Export Audit Log'}
            onClick={handleExport}
            disabled={exporting}
          />
        </div>

        {/* ── Keyboard hint */}
        <span style={{
          fontSize: '0.55rem', fontFamily: 'var(--font-code)',
          color: 'rgba(255,255,255,0.16)', flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span>Alt+Shift+A — Jump to Audit</span>
          <span>Alt+Shift+L — Lock Down</span>
        </span>
      </div>
    </>
  );
}
