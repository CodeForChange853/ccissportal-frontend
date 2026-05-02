// frontend/src/features/admin/components/audit/AuditTable.jsx

import React, { useState } from 'react';
import AnomalyBadge from './AnomalyBadge';

const EVENT_COLOR = {
    LOGIN_FAILED: 'var(--neon-red)',
    GRADE_MODIFIED: 'var(--neon-orange)',
    SETTING_CHANGED: 'var(--neon-orange)',
    PASSKEY_ROTATED: 'var(--neon-orange)',
    USER_SUSPENDED: 'var(--neon-red)',
    ENROLLMENT_REJECTED: 'var(--neon-red)',
    ENROLLMENT_APPROVED: 'var(--neon-green)',
    TICKET_RESOLVED: 'var(--neon-green)',
    LOGIN_SUCCESS: 'var(--neon-cyan)',
    DOCUMENT_SCANNED: 'var(--neon-cyan)',
    FACULTY_ASSIGNED: 'var(--neon-purple)',
};

function fmtDatetime(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return `${d.toLocaleDateString('en-CA')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}

const ExpandedPayload = ({ payload }) => {
    if (!payload) return <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-terminal)', fontSize: '0.65rem' }}>No payload</span>;
    return (
        <pre style={{
            background: 'var(--bg-depth)', borderRadius: 6, padding: '10px 12px',
            fontFamily: 'var(--font-terminal)', fontSize: '0.65rem',
            color: 'var(--neon-green)', lineHeight: 1.6,
            overflowX: 'auto', margin: 0,
            border: '1px solid var(--border-subtle)',
        }}>
            {JSON.stringify(payload, null, 2)}
        </pre>
    );
};

const AuditTable = ({ events = [], loading = false }) => {
    const [expanded, setExpanded] = useState(null);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 0', fontFamily: 'var(--font-terminal)', fontSize: '0.72rem', color: 'var(--neon-cyan)', letterSpacing: '0.10em' }}>
            <span className="live-dot" /> SCANNING AUDIT LOG...
        </div>
    );

    if (events.length === 0) return (
        <p style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0', letterSpacing: '0.12em' }}>
            NO AUDIT EVENTS FOUND
        </p>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Column headers */}
            <div style={{
                display: 'grid', gridTemplateColumns: '160px 1fr 160px 80px 80px 32px',
                gap: 12, padding: '6px 12px',
                fontFamily: 'var(--font-terminal)', fontSize: '0.52rem',
                letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)',
                borderBottom: '1px solid var(--border-subtle)',
            }}>
                <span>Timestamp</span>
                <span>Event / Actor</span>
                <span>Target</span>
                <span>Anomaly</span>
                <span>IP</span>
                <span />
            </div>

            {events.map(ev => {
                const isExpanded = expanded === ev.event_id;
                const eventColor = EVENT_COLOR[ev.event_type] ?? 'var(--text-muted)';
                const borderColor = ev.anomaly_score >= 70 ? 'var(--neon-red)' : ev.anomaly_score >= 40 ? 'var(--neon-orange)' : 'var(--border-subtle)';

                return (
                    <div key={ev.event_id} style={{ borderLeft: `2px solid ${borderColor}`, borderRadius: '0 6px 6px 0', background: 'var(--bg-depth)', marginBottom: 2 }}>
                        {/* Main row */}
                        <div style={{
                            display: 'grid', gridTemplateColumns: '160px 1fr 160px 80px 80px 32px',
                            gap: 12, padding: '10px 12px', alignItems: 'center', cursor: 'pointer',
                        }}
                            onClick={() => setExpanded(isExpanded ? null : ev.event_id)}
                        >
                            <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.62rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                {fmtDatetime(ev.created_at)}
                            </span>

                            <div>
                                <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.68rem', fontWeight: 700, color: eventColor, letterSpacing: '0.06em' }}>
                                    {ev.event_type.replace(/_/g, ' ')}
                                </span>
                                {ev.actor_email && (
                                    <p style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.60rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                        {ev.actor_email}
                                    </p>
                                )}
                            </div>

                            <div style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.62rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {ev.target_type && <span style={{ color: 'var(--text-muted)', marginRight: 4 }}>{ev.target_type}</span>}
                                {ev.target_id ?? '—'}
                            </div>

                            <AnomalyBadge score={ev.anomaly_score} />

                            <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.58rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {ev.ip_address ?? '—'}
                            </span>

                            <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                                {isExpanded ? '▲' : '▼'}
                            </span>
                        </div>

                        {/* Expanded payload */}
                        {isExpanded && (
                            <div style={{ padding: '0 12px 12px' }}>
                                <ExpandedPayload payload={ev.payload} />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default AuditTable;