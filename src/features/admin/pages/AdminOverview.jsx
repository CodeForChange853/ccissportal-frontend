// frontend/src/features/admin/pages/AdminOverview.jsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { adminApi } from '../api/adminApi';
import { useAdminRefresh } from '../layout/AdminLayout';
import CyberPanel from '../../../components/ui/CyberPanel';
import StatusBadge from '../../../components/ui/StatusBadge';
import Skeleton from '../../../components/ui/Skeleton';

import RadarScanner from '../components/dashboard/RadarScanner';
import AlertFeed from '../components/dashboard/AlertFeed';
import SignalChart from '../components/dashboard/SignalChart';
import ActivityGraph from '../components/dashboard/ActivityGraph';
import AISystemOverseer from '../components/dashboard/AISystemOverseer';

const POLL_MS = 90_000;

// ── Sync countdown ─────────────────────────────────────────────────────────
const useSyncCountdown = (refreshTick) => {
    const [seconds, setSeconds] = useState(POLL_MS / 1000);
    useEffect(() => {
        setSeconds(POLL_MS / 1000);
        const id = setInterval(
            () => setSeconds(s => (s <= 1 ? POLL_MS / 1000 : s - 1)),
            1000,
        );
        return () => clearInterval(id);
    }, [refreshTick]);
    return seconds;
};

// ── Unified premium KPI card ───────────────────────────────────────────────
// Handles both gradient-hero style and surface-metric style via props.
// gradient  → full colored background (like the original HeroKpiCard)
// color     → surface card with colored accent top-border and value text
const KpiCard = ({ label, value, unit = '', sub, gradient, color, alert = false }) => {
    const hasGradient = Boolean(gradient);
    return (
        <div
            style={{
                background: hasGradient ? gradient : 'var(--bg-surface)',
                border: hasGradient ? 'none' : `1px solid ${color}30`,
                borderTop: hasGradient ? 'none' : `2px solid ${color}`,
                borderRadius: 14,
                padding: '20px 22px',
                flex: '1 1 0',
                minWidth: 0,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: alert
                    ? `0 0 28px ${color}18, 0 2px 10px rgba(0,0,0,0.10)`
                    : hasGradient
                        ? '0 4px 24px rgba(0,0,0,0.22)'
                        : '0 1px 3px rgba(0,0,0,0.06)',
                transition: 'box-shadow 0.3s ease',
            }}
        >
            {hasGradient && (
                <>
                    <div style={{
                        position: 'absolute', top: -32, right: -32,
                        width: 100, height: 100, borderRadius: '50%',
                        background: 'rgba(255,255,255,0.07)', pointerEvents: 'none',
                    }} />
                    <div style={{
                        position: 'absolute', bottom: -20, left: -10,
                        width: 60, height: 60, borderRadius: '50%',
                        background: 'rgba(255,255,255,0.04)', pointerEvents: 'none',
                    }} />
                </>
            )}

            <p style={{
                fontFamily: 'var(--font-terminal)',
                fontSize: '0.57rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: hasGradient ? 'rgba(255,255,255,0.72)' : 'var(--text-muted)',
                marginBottom: 10,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            }}>
                {label}
            </p>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                <p style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '2.2rem',
                    fontWeight: 900,
                    color: hasGradient ? '#fff' : color,
                    lineHeight: 1,
                    textShadow: alert && !hasGradient ? `0 0 18px ${color}70` : 'none',
                }}>
                    {value ?? '—'}
                </p>
                {unit && (
                    <span style={{
                        fontFamily: 'var(--font-terminal)',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: hasGradient ? 'rgba(255,255,255,0.70)' : `${color}bb`,
                        marginLeft: 2,
                    }}>
                        {unit}
                    </span>
                )}
            </div>

            {sub && (
                <p style={{
                    fontFamily: 'var(--font-terminal)',
                    fontSize: '0.56rem',
                    color: hasGradient ? 'rgba(255,255,255,0.58)' : 'var(--text-muted)',
                    marginTop: 10,
                    letterSpacing: '0.04em',
                }}>
                    {sub}
                </p>
            )}
        </div>
    );
};

// ── Capacity bar ───────────────────────────────────────────────────────────
const CapacityBar = ({ label, count, total, color }) => {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.60rem', color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
                    {label}
                </span>
                <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.62rem', fontWeight: 700, color }}>
                    {count}<span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> / {total}</span>
                </span>
            </div>
            <div style={{ width: '100%', height: 4, background: 'var(--bg-depth)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.7s ease' }} />
            </div>
        </div>
    );
};

// ── Faculty member row ─────────────────────────────────────────────────────
const FacultyRow = ({ faculty }) => {
    const load = faculty.current_teaching_load ?? 0;
    const maxLoad = faculty.maximum_teaching_load ?? 1;
    const pct = Math.round((load / maxLoad) * 100);
    const color = pct >= 100 ? 'var(--color-danger)'
        : pct >= 70 ? 'var(--color-warning)'
            : 'var(--color-success)';

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 48px 54px',
            alignItems: 'center',
            gap: 10,
            padding: '9px 0',
            borderBottom: '1px solid var(--border-subtle)',
        }}>
            <div style={{ minWidth: 0 }}>
                <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.78rem',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}>
                    {faculty.full_name || faculty.email || '—'}
                </p>
                <div style={{ marginTop: 4, height: 2, background: 'var(--bg-depth)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                        width: `${Math.min(pct, 100)}%`,
                        height: '100%',
                        background: color,
                        borderRadius: 2,
                        transition: 'width 0.6s ease',
                    }} />
                </div>
            </div>
            <p style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                {load}/{maxLoad}
            </p>
            <span style={{
                fontFamily: 'var(--font-terminal)',
                fontSize: '0.52rem',
                letterSpacing: '0.02em',
                color,
                background: `${color}15`,
                border: `1px solid ${color}30`,
                borderRadius: 6,
                padding: '2px 5px',
                textAlign: 'center',
            }}>
                {pct >= 100 ? 'FULL' : pct >= 70 ? 'HIGH' : 'OK'}
            </span>
        </div>
    );
};

// ── Main component ─────────────────────────────────────────────────────────
const AdminOverview = () => {
    const navigate = useNavigate();
    const refreshTick = useAdminRefresh();
    const syncIn = useSyncCountdown(refreshTick);

    const [requests, setRequests] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [stats, setStats] = useState(null);
    const [telemetry, setTelemetry] = useState(null);
    const [facultyList, setFacultyList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [reqR, curR, tixR, statR, telR, facR] = await Promise.allSettled([
                adminApi.fetchPendingEnrollments(),
                adminApi.fetchCurriculum(),
                adminApi.fetchAllTickets(),
                adminApi.fetchDashboardStats(),
                adminApi.fetchTelemetry(),
                adminApi.fetchFacultyList(),
            ]);
            if (reqR.status === 'fulfilled') setRequests(reqR.value ?? []);
            if (curR.status === 'fulfilled') setSubjects(curR.value ?? []);
            if (tixR.status === 'fulfilled') setTickets(tixR.value ?? []);
            if (statR.status === 'fulfilled') setStats(statR.value);
            if (telR.status === 'fulfilled') setTelemetry(telR.value);
            if (facR.status === 'fulfilled') setFacultyList(facR.value ?? []);
        } catch {
            setError('Failed to load dashboard data. Check API connection.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load, refreshTick]);

    const pendingCount = useMemo(
        () => requests.filter(r => r.review_status === 'PENDING').length,
        [requests],
    );
    const openTickets = useMemo(
        () => tickets.filter(t => t.ticket_status === 'OPEN').length,
        [tickets],
    );
    const aiAccuracy = useMemo(
        () => telemetry?.accuracy_percentage != null
            ? Math.round(telemetry.accuracy_percentage)
            : null,
        [telemetry],
    );
    const systemAlert = openTickets > 4;

    const sortedFaculty = useMemo(
        () => [...facultyList]
            .sort((a, b) => (b.current_teaching_load ?? 0) - (a.current_teaching_load ?? 0))
            .slice(0, 6),
        [facultyList],
    );

    const facultyBreakdown = useMemo(() => {
        const atCap = facultyList.filter(f =>
            (f.current_teaching_load ?? 0) >= (f.maximum_teaching_load ?? 1),
        ).length;
        const nearCap = facultyList.filter(f => {
            const r = (f.current_teaching_load ?? 0) / (f.maximum_teaching_load ?? 1);
            return r >= 0.7 && r < 1;
        }).length;
        return {
            atCap,
            nearCap,
            available: facultyList.length - atCap - nearCap,
            total: facultyList.length,
        };
    }, [facultyList]);

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Skeleton.PageHeader />
            <Skeleton.KpiStrip count={5} />
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 4fr 5fr', gap: 16 }}>
                <Skeleton.Card /><Skeleton.Card /><Skeleton.Card />
            </div>
        </div>
    );

    if (error) return (
        <div style={{
            padding: '20px 24px',
            fontFamily: 'var(--font-terminal)',
            fontSize: '0.75rem',
            color: 'var(--color-danger)',
            background: 'var(--color-danger-bg)',
            border: '1px solid var(--border-critical)',
            borderLeft: '3px solid var(--color-danger)',
            borderRadius: 12,
        }}>
            ⚠ {error}
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <div>
                    <h1 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.05rem',
                        fontWeight: 900,
                        letterSpacing: '0.02em',
                        color: 'var(--text-primary)',
                        lineHeight: 1,
                    }}>
                        System Intelligence HQ
                    </h1>
                    <p style={{
                        fontFamily: 'var(--font-terminal)',
                        fontSize: '0.60rem',
                        color: 'var(--text-muted)',
                        marginTop: 6,
                        letterSpacing: '0.02em',
                    }}>
                        University Campus AI System — Mission-critical monitoring
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <StatusBadge
                        variant={systemAlert ? 'critical' : 'normal'}
                        label={systemAlert ? 'ALERT DETECTED' : 'ALL SYSTEMS NOMINAL'}
                        showDot
                    />
                    <div style={{ textAlign: 'right' }}>
                        <p style={{
                            fontFamily: 'var(--font-terminal)',
                            fontSize: '0.52rem',
                            color: 'var(--text-muted)',
                            letterSpacing: '0.02em',
                        }}>
                            AUTO-SYNC IN
                        </p>
                        <p style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            color: 'var(--accent-light)',
                        }}>
                            {String(Math.floor(syncIn / 60)).padStart(2, '0')}:{String(syncIn % 60).padStart(2, '0')}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Row 1 — Unified KPI strip ───────────────────────────────── */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
                <KpiCard
                    label="Total Students"
                    value={stats?.total_students ?? '—'}
                    sub={`${subjects.length} active subjects`}
                    gradient="linear-gradient(135deg, #6b21a8 0%, #9d4edd 50%, #c026d3 100%)"
                />
                <KpiCard
                    label="AI Triage Accuracy"
                    value={aiAccuracy !== null ? `${aiAccuracy}` : '—'}
                    unit="%"
                    sub={telemetry ? `${telemetry.total_tickets ?? 0} tickets processed` : 'Awaiting data…'}
                    gradient="linear-gradient(135deg, #0891b2 0%, #06b6d4 50%, #22d3ee 100%)"
                />
                <KpiCard
                    label="Faculty Members"
                    value={(stats?.total_faculty ?? facultyList.length) || '—'}
                    sub={`${facultyBreakdown.atCap} at full load`}
                    color="var(--accent)"
                />
                <KpiCard
                    label="Pending Enrollments"
                    value={pendingCount}
                    sub="Awaiting admin review"
                    color={pendingCount > 0 ? 'var(--color-warning)' : 'var(--color-success)'}
                    alert={pendingCount > 0}
                />
                <KpiCard
                    label="Open Tickets"
                    value={openTickets}
                    sub={`of ${tickets.length} total`}
                    color={openTickets > 5 ? 'var(--color-danger)' : openTickets > 2 ? 'var(--color-warning)' : 'var(--color-success)'}
                    alert={openTickets > 4}
                />
            </div>

            {/* ── Row 2 — Radar | AI Overseer | Alert Feed ────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, alignItems: 'stretch' }}>
                <CyberPanel
                    title="Threat Scanner"
                    subtitle={`${pendingCount} signals queued`}
                    headerRight={<StatusBadge variant="info" label="SCANNING" showDot />}
                >
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 6px' }}>
                        <RadarScanner stats={stats} tickets={tickets} requests={requests} />
                    </div>
                </CyberPanel>

                <CyberPanel
                    title="System Overseer"
                    subtitle="Alert-reactive AI indicator · hover to interact"
                    variant={systemAlert ? 'alert' : 'default'}
                    headerRight={
                        <StatusBadge
                            variant={systemAlert ? 'critical' : 'normal'}
                            label={systemAlert ? 'ALERT' : 'NOMINAL'}
                            showDot
                        />
                    }
                >
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 4px' }}>
                        <AISystemOverseer
                            stats={stats}
                            tickets={tickets}
                            telemetry={telemetry}
                            subjects={subjects.length}
                            systemAlert={systemAlert}
                            noDonut
                        />
                    </div>
                </CyberPanel>

                <CyberPanel
                    title="Alert Feed"
                    subtitle="Sorted by severity · real-time"
                    variant={openTickets > 3 ? 'alert' : 'default'}
                    headerRight={
                        <StatusBadge
                            variant={openTickets > 3 ? 'critical' : openTickets > 0 ? 'warning' : 'normal'}
                            label={`${openTickets} OPEN`}
                            showDot
                        />
                    }
                >
                    <div style={{ height: 340 }}>
                        <AlertFeed tickets={tickets} />
                    </div>
                </CyberPanel>
            </div>

            {/* ── Row 3 — Signal chart full width ─────────────────────────── */}
            <CyberPanel
                title="Neural Confidence Trend"
                subtitle="AI triage confidence over time — last 30 tickets"
                headerRight={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className="live-dot" aria-hidden="true" />
                        <span style={{
                            fontFamily: 'var(--font-terminal)',
                            fontSize: '0.58rem',
                            color: 'var(--color-success)',
                            letterSpacing: '0.02em',
                        }}>
                            LIVE
                        </span>
                    </div>
                }
            >
                <div style={{ height: 185 }}>
                    <SignalChart tickets={tickets} />
                </div>
            </CyberPanel>

            {/* ── Row 4 — Activity map + Faculty load ─────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '5fr 3fr', gap: 16, alignItems: 'start' }}>
                <CyberPanel
                    title="Triage Activity Map"
                    subtitle="Ticket distribution by department"
                >
                    <div style={{ height: 260 }}>
                        <ActivityGraph tickets={tickets} />
                    </div>
                </CyberPanel>

                <CyberPanel
                    title="Faculty Load Status"
                    subtitle={`${facultyList.length} faculty members`}
                    headerRight={
                        <StatusBadge
                            variant={facultyBreakdown.atCap > 2 ? 'warning' : 'normal'}
                            label={`CAP: ${stats?.global_max_teaching_load ?? '—'}`}
                        />
                    }
                >
                    <div style={{ paddingTop: 8 }}>
                        <CapacityBar label="At full capacity" count={facultyBreakdown.atCap} total={facultyBreakdown.total} color="var(--color-danger)" />
                        <CapacityBar label="Near capacity (≥ 70%)" count={facultyBreakdown.nearCap} total={facultyBreakdown.total} color="var(--color-warning)" />
                        <CapacityBar label="Available" count={facultyBreakdown.available} total={facultyBreakdown.total} color="var(--color-success)" />
                        <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '12px 0' }} />

                        <p style={{
                            fontFamily: 'var(--font-terminal)',
                            fontSize: '0.54rem',
                            letterSpacing: '0.02em',
                            color: 'var(--text-muted)',
                            marginBottom: 6,
                        }}>
                            Highest load
                        </p>

                        {sortedFaculty.length === 0 ? (
                            <p style={{
                                fontFamily: 'var(--font-terminal)',
                                fontSize: '0.63rem',
                                color: 'var(--text-muted)',
                                textAlign: 'center',
                                padding: '14px 0',
                                letterSpacing: '0.02em',
                            }}>
                                NO FACULTY DATA
                            </p>
                        ) : (
                            sortedFaculty.map((f, i) => (
                                <FacultyRow key={f.account_id ?? i} faculty={f} />
                            ))
                        )}

                        <button
                            style={{
                                marginTop: 12,
                                width: '100%',
                                background: 'transparent',
                                border: '1px solid var(--border-default)',
                                borderLeft: '2px solid var(--accent)',
                                borderRadius: 10,
                                padding: '7px 12px',
                                cursor: 'pointer',
                                fontFamily: 'var(--font-terminal)',
                                fontSize: '0.58rem',
                                letterSpacing: '0.02em',
                                color: 'var(--accent)',
                                textAlign: 'left',
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(157,78,221,0.06)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                            onClick={() => navigate('/portal/admin/faculty')}
                        >
                            View all faculty →
                        </button>
                    </div>
                </CyberPanel>
            </div>

        </div>
    );
};

export default AdminOverview;