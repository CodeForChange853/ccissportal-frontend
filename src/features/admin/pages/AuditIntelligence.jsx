// frontend/src/features/admin/pages/AuditIntelligence.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../api/adminApi';
import CyberPanel from '../../../components/ui/CyberPanel';
import DataReadout from '../../../components/ui/DataReadout';
import StatusBadge from '../../../components/ui/StatusBadge';
import PageHeader from '../../../components/ui/PageHeader';
import AuditTable from '../components/audit/AuditTable';
import AuditFilters from '../components/audit/AuditFilters';
import AnomalyBadge from '../components/audit/AnomalyBadge';

// ── Anomaly gauge (SVG arc) ────────────────────────────────────────────────
const AnomalyGauge = ({ score = 0 }) => {
    const R = 54;
    const arc = 2 * Math.PI * R;
    const pct = Math.min(score / 100, 1);

    const color = score >= 70 ? 'var(--neon-red)' : score >= 40 ? 'var(--neon-orange)' : 'var(--neon-green)';
    const label = score >= 70 ? 'HIGH RISK' : score >= 40 ? 'ELEVATED' : 'NORMAL';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <svg width={140} height={140} viewBox="0 0 140 140" aria-label={`Anomaly score: ${score}`}>
                <circle cx={70} cy={70} r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={10} />
                <circle
                    cx={70} cy={70} r={R} fill="none"
                    stroke={color} strokeWidth={10}
                    strokeDasharray={`${pct * arc} ${arc}`}
                    strokeLinecap="round"
                    transform="rotate(-90 70 70)"
                    style={{ transition: 'stroke-dasharray 0.8s ease, stroke 0.5s ease', filter: `drop-shadow(0 0 6px ${color})` }}
                />
                <text x={70} y={64} textAnchor="middle" fontFamily="var(--font-display)" fontSize={26} fontWeight={900} fill={color}>
                    {Math.round(score)}
                </text>
                <text x={70} y={82} textAnchor="middle" fontFamily="var(--font-terminal)" fontSize={9} letterSpacing={2} fill="var(--text-muted)">
                    /100
                </text>
            </svg>
            <AnomalyBadge score={score} showScore={false} />
            <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.60rem', color: 'var(--text-muted)', letterSpacing: '0.10em' }}>
                {label}
            </span>
        </div>
    );
};

// ── Top anomaly entry ──────────────────────────────────────────────────────
const AnomalyEntry = ({ event }) => {
    const color = event.anomaly_score >= 70 ? 'var(--neon-red)' : 'var(--neon-orange)';
    return (
        <div style={{
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
            padding: '10px 0', borderBottom: '1px solid var(--border-subtle)',
        }}>
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.68rem', fontWeight: 700, color, letterSpacing: '0.05em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {event.event_type.replace(/_/g, ' ')}
                </p>
                <p style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.58rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {event.actor_email ?? 'unknown'} — {event.target_type ? `${event.target_type} ${event.target_id ?? ''}` : 'system'}
                </p>
            </div>
            <AnomalyBadge score={event.anomaly_score} />
        </div>
    );
};

// ── Default filters ────────────────────────────────────────────────────────
const DEFAULT_FILTERS = { event_type: '', actor_email: '' };

// ── Main page ──────────────────────────────────────────────────────────────
const AuditIntelligence = () => {
    const [summary, setSummary] = useState(null);
    const [events, setEvents] = useState([]);
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [loading, setLoading] = useState(true);
    const [evtLoad, setEvtLoad] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const LIMIT = 50;

    useEffect(() => {
        (async () => {
            try {
                setSummary(await adminApi.fetchAuditSummary());
            } catch {
                setError('Failed to load audit summary.');
            } finally { setLoading(false); }
        })();
    }, []);

    const fetchEvents = useCallback(async (f = filters, p = page) => {
        setEvtLoad(true);
        try {
            const params = { skip: p * LIMIT, limit: LIMIT };
            if (f.event_type) params.event_type = f.event_type;
            if (f.actor_email) params.actor_email = f.actor_email;
            setEvents(await adminApi.fetchAuditEvents(params));
        } catch {
            setError('Failed to load audit events.');
        } finally { setEvtLoad(false); }
    }, [filters, page]);

    useEffect(() => { fetchEvents(filters, page); }, [filters, page]);

    const handleFilters = (f) => { setFilters(f); setPage(0); };
    const handleReset = () => { setFilters(DEFAULT_FILTERS); setPage(0); };

    const score = summary?.anomaly_score ?? 0;
    const highCount = summary?.high_anomalies ?? 0;
    const totalEvents = summary?.total_events ?? 0;
    const topAnomalies = summary?.top_anomalies ?? [];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* ✅ Shared PageHeader */}
            <PageHeader
                title="Audit Intelligence"
                subtitle="Behavioral audit log — every system action recorded with AI anomaly scoring."
                badge={<StatusBadge variant="info" label="SCANNER ACTIVE" showDot />}
            />

            {error && (
                <div style={{ background: 'var(--color-danger-bg)', border: '1px solid var(--border-critical)', borderRadius: 6, padding: '10px 14px', fontFamily: 'var(--font-terminal)', fontSize: '0.72rem', color: 'var(--neon-red)' }}>
                    ⚠ {error}
                </div>
            )}

            {/* Row 1: Gauge + Top Anomalies + KPI */}
            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 1fr', gap: 16 }}>

                <CyberPanel title="Anomaly Score" subtitle="Last 100 events" variant={score >= 70 ? 'alert' : score >= 40 ? 'warning' : 'default'}>
                    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8 }}>
                        {loading ? (
                            <div style={{ height: 140, display: 'flex', alignItems: 'center', fontFamily: 'var(--font-terminal)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                COMPUTING...
                            </div>
                        ) : (
                            <AnomalyGauge score={score} />
                        )}
                    </div>
                </CyberPanel>

                <CyberPanel
                    title="Detected Anomalies"
                    subtitle="Highest scoring events"
                    variant={highCount > 0 ? 'alert' : 'default'}
                    headerRight={highCount > 0 && <AnomalyBadge score={75} showScore={false} />}
                >
                    {topAnomalies.length === 0 ? (
                        <p style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.68rem', color: 'var(--neon-green)', letterSpacing: '0.10em', padding: '16px 0', textAlign: 'center' }}>
                            NO ANOMALIES DETECTED
                        </p>
                    ) : (
                        <div>
                            {topAnomalies.slice(0, 4).map(ev => (
                                <AnomalyEntry key={ev.event_id} event={ev} />
                            ))}
                        </div>
                    )}
                </CyberPanel>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                        { label: 'TOTAL EVENTS', value: totalEvents, color: 'var(--text-terminal)' },
                        { label: 'HIGH ANOMALIES', value: highCount, color: highCount > 0 ? 'var(--neon-red)' : 'var(--neon-green)' },
                        { label: 'LOG ENTRIES', value: events.length, color: 'var(--neon-cyan)' },
                    ].map(({ label, value, color }) => (
                        <div key={label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '16px', flex: 1, display: 'flex', alignItems: 'center' }}>
                            <DataReadout label={label} value={value} color={color} size="sm" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Row 2: Filters */}
            <CyberPanel title="Filters" subtitle="Narrow the audit log">
                <AuditFilters filters={filters} onChange={handleFilters} onReset={handleReset} />
            </CyberPanel>

            {/* Row 3: Audit log table */}
            <CyberPanel
                title="Audit Log"
                subtitle={`Showing ${events.length} of ${totalEvents} events`}
                headerRight={
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn-ghost" style={{ fontSize: '0.58rem', padding: '5px 12px' }} disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                            ← PREV
                        </button>
                        <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.62rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                            PAGE {page + 1}
                        </span>
                        <button className="btn-ghost" style={{ fontSize: '0.58rem', padding: '5px 12px' }} disabled={events.length < LIMIT} onClick={() => setPage(p => p + 1)}>
                            NEXT →
                        </button>
                    </div>
                }
            >
                <AuditTable events={events} loading={evtLoad} />
            </CyberPanel>

        </div>
    );
};

export default AuditIntelligence;