// frontend/src/features/admin/pages/AdminSupport.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { adminApi } from '../api/adminApi';
import { useAdminRefresh } from '../layout/AdminLayout';
import { useToast } from '../../../context/ToastContext';
import CyberPanel from '../../../components/ui/CyberPanel';
import StatusBadge from '../../../components/ui/StatusBadge';
import DataReadout from '../../../components/ui/DataReadout';
import Skeleton from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import PageHeader from '../../../components/ui/PageHeader';
import { TICKET_STATUS_VARIANT } from '../../../constants/statusVariants';

const DEPARTMENTS = ['IT SUPPORT', 'REGISTRAR', 'FINANCE', 'ACADEMIC AFFAIRS'];
const DEPT_COLOR = { 'IT SUPPORT': 'var(--accent-light)', 'REGISTRAR': 'var(--accent)', 'FINANCE': 'var(--color-warning)', 'ACADEMIC AFFAIRS': 'var(--color-success)' };
const DEPT_ICON = { 'IT SUPPORT': '🖥', 'REGISTRAR': '📋', 'FINANCE': '💳', 'ACADEMIC AFFAIRS': '🎓' };
const STATUS_FILTERS = ['ALL', 'OPEN', 'PENDING', 'RESOLVED'];

// ── Confidence bar ─────────────────────────────────────────────────────────
const ConfidenceBar = ({ score = 0 }) => {
    const pct = Math.round(score * 100);
    const color = pct > 80 ? 'var(--color-success)' : pct > 50 ? 'var(--color-warning)' : 'var(--color-danger)';
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 60, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: color }} />
            </div>
            <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.60rem', color, minWidth: 30 }}>{pct}%</span>
        </div>
    );
};

// ── Ticket card ────────────────────────────────────────────────────────────
const TicketCard = ({ ticket, onResolve, onReroute, resolving }) => {
    const id = ticket.ticket_id ?? ticket.id;
    const status = ticket.ticket_status ?? ticket.status;
    const isOpen = status !== 'RESOLVED';
    const accent = status === 'OPEN' ? 'var(--color-danger)' : status === 'PENDING' ? 'var(--color-warning)' : 'var(--border-subtle)';
    const lowConf = (ticket.confidence_score ?? 1) < 0.6 && isOpen;
    const cardBg = lowConf ? 'rgba(255,140,0,0.04)' : 'var(--bg-depth)';
    const cardBorder = lowConf ? 'rgba(255,140,0,0.25)' : 'var(--border-subtle)';

    return (
        <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderLeft: `3px solid ${accent}`, borderRadius: 6, padding: '14px 16px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'start' }}>
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    {/* ✅ Using shared TICKET_STATUS_VARIANT */}
                    <StatusBadge variant={TICKET_STATUS_VARIANT[status] ?? 'muted'} label={status} />
                    {ticket.was_manually_rerouted && (
                        <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.55rem', color: 'var(--color-warning)' }}>↪ RE-ROUTED</span>
                    )}
                    <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.60rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>#{id}</span>
                </div>
                <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{ticket.issue_subject}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 8 }}>
                    {ticket.issue_description?.slice(0, 140)}{ticket.issue_description?.length > 140 ? '…' : ''}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <ConfidenceBar score={ticket.confidence_score ?? 0} />
                    {lowConf && (
                        <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.55rem', color: 'var(--color-warning)', background: 'rgba(255,140,0,0.10)', border: '1px solid rgba(255,140,0,0.25)', borderRadius: 4, padding: '2px 6px', letterSpacing: '0.02em' }}>
                            LOW CONFIDENCE — VERIFY ROUTING
                        </span>
                    )}
                    {ticket.created_at && (
                        <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.58rem', color: 'var(--text-muted)' }}>
                            {new Date(ticket.created_at).toLocaleDateString()}
                        </span>
                    )}
                </div>
            </div>
            {isOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                    <button className="btn-primary" style={{ fontSize: '0.58rem', padding: '6px 12px' }} disabled={resolving === id} onClick={() => onResolve(id)}>
                        {resolving === id ? '...' : 'RESOLVE'}
                    </button>
                    <button className="btn-ghost" style={{ fontSize: '0.58rem', padding: '6px 12px' }} onClick={() => onReroute(ticket)}>
                        RE-ROUTE
                    </button>
                </div>
            )}
        </div>
    );
};

// ── Re-route modal ─────────────────────────────────────────────────────────
const RerouteModal = ({ ticket, onConfirm, onClose, loading }) => {
    const [category, setCategory] = useState('');
    const id = ticket?.ticket_id ?? ticket?.id;
    const labelId = `reroute-title-${id}`;
    const sel = { width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 6, padding: '9px 12px', fontFamily: 'var(--font-terminal)', fontSize: '0.75rem', color: 'var(--text-primary)', outline: 'none', marginBottom: 16 };
    return (
        <div
            style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(2px)' }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={labelId}
                style={{ background: 'var(--bg-modal)', border: '1px solid var(--border-accent)', borderRadius: 12, padding: 28, maxWidth: 420, width: '100%', margin: '0 16px' }}
            >
                <h3 id={labelId} style={{ fontFamily: 'var(--font-display)', fontSize: '0.72rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent-light)', marginBottom: 8 }}>Re-route Ticket #{id}</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>{ticket?.issue_subject}</p>
                <label style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.55rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Correct Department</label>
                <select value={category} onChange={e => setCategory(e.target.value)} style={sel}>
                    <option value="">Select department…</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button className="btn-ghost" onClick={onClose}>Cancel</button>
                    <button className="btn-primary" disabled={!category || loading} onClick={() => onConfirm(id, category)}>
                        {loading ? 'REROUTING...' : 'CONFIRM RE-ROUTE'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Main page ──────────────────────────────────────────────────────────────
const AdminSupport = () => {
    const refreshTick = useAdminRefresh();
    const { toast } = useToast();

    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeDept, setActiveDept] = useState('IT SUPPORT');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [resolving, setResolving] = useState(null);
    const [rerouteModal, setRerouteModal] = useState(null);
    const [rerouting, setRerouting] = useState(false);
    const [isRetraining, setIsRetraining] = useState(false);

    const load = async () => {
        setLoading(true);
        try { setTickets((await adminApi.fetchAllTickets()) ?? []); }
        catch { toast.error('Failed to load tickets.'); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        load();
    }, [refreshTick]);

    const handleRetrain = async () => {
        if (!window.confirm("Trigger AI model retraining? This will use all currently resolved and corrected tickets to improve accuracy.")) return;
        setIsRetraining(true);
        try {
            const res = await adminApi.retrainTriageModel();
            if (res.status === 'SUCCESS') {
                toast.success(`AI Model retrained successfully on ${res.trained_on} samples.`);
            } else {
                toast.warning(res.reason || "Retraining skipped (need more resolved tickets).");
            }
        } catch {
            toast.error("Failed to trigger model retraining.");
        } finally {
            setIsRetraining(false);
        }
    };

    const deptStats = useMemo(() => {
        const s = {};
        DEPARTMENTS.forEach(dept => {
            const dt = tickets.filter(t => t.ai_predicted_category === dept);
            s[dept] = { total: dt.length, open: dt.filter(t => (t.ticket_status ?? t.status) === 'OPEN').length };
        });
        return s;
    }, [tickets]);

    const total = tickets.length;
    const allOpen = tickets.filter(t => (t.ticket_status ?? t.status) === 'OPEN').length;
    const allPend = tickets.filter(t => (t.ticket_status ?? t.status) === 'PENDING').length;
    const allRes = tickets.filter(t => (t.ticket_status ?? t.status) === 'RESOLVED').length;

    const visible = useMemo(() => {
        let list = tickets.filter(t => t.ai_predicted_category === activeDept);
        if (statusFilter !== 'ALL') list = list.filter(t => (t.ticket_status ?? t.status) === statusFilter);
        return list;
    }, [tickets, activeDept, statusFilter]);

    const handleResolve = async (id) => {
        setResolving(id);
        try {
            await adminApi.resolveTicket(id);
            setTickets(prev => prev.map(t => (t.ticket_id ?? t.id) === id ? { ...t, ticket_status: 'RESOLVED' } : t));
            toast.success(`Ticket #${id} resolved.`);
        } catch { toast.error('Failed to resolve ticket.'); }
        finally { setResolving(null); }
    };

    const handleReroute = async (id, category) => {
        setRerouting(true);
        try {
            await adminApi.rerouteTicket(id, category);
            setTickets(prev => prev.map(t => (t.ticket_id ?? t.id) === id ? { ...t, ai_predicted_category: category, ticket_status: 'RESOLVED', was_manually_rerouted: true } : t));
            toast.success(`Ticket #${id} re-routed to ${category}.`);
            setRerouteModal(null);
        } catch (err) { toast.error(err.response?.data?.detail || 'Re-route failed.'); }
        finally { setRerouting(false); }
    };

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Skeleton.PageHeader />
            <Skeleton.KpiStrip count={4} />
            <Skeleton.Table rows={6} cols={3} />
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* ✅ Shared PageHeader */}
            <PageHeader
                title="Support Triage Center"
                subtitle="AI-routed tickets by department — resolve or re-route to the correct queue."
            >
                <button
                    className="btn-ghost"
                    style={{ fontSize: '0.62rem', letterSpacing: '0.05em' }}
                    onClick={handleRetrain}
                    disabled={isRetraining}
                >
                    {isRetraining ? 'TRAINING...' : 'RETRAIN AI MODEL'}
                </button>
            </PageHeader>

            {/* Global KPI strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {[
                    { label: 'TOTAL TICKETS', value: total, color: 'var(--text-terminal)' },
                    { label: 'OPEN', value: allOpen, color: allOpen > 0 ? 'var(--color-danger)' : 'var(--color-success)' },
                    { label: 'PENDING', value: allPend, color: allPend > 0 ? 'var(--color-warning)' : 'var(--color-success)' },
                    { label: 'RESOLVED', value: allRes, color: 'var(--color-success)' },
                ].map(({ label, value, color }) => (
                    <div key={label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '14px 16px' }}>
                        <DataReadout label={label} value={value} color={color} size="sm" />
                    </div>
                ))}
            </div>

            {/* Department tabs */}
            <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border-subtle)' }}>
                {DEPARTMENTS.map(dept => {
                    const active = activeDept === dept;
                    const color = DEPT_COLOR[dept];
                    const stats = deptStats[dept];
                    return (
                        <button
                            key={dept}
                            onClick={() => { setActiveDept(dept); setStatusFilter('ALL'); }}
                            style={{ flex: 1, padding: '12px 8px', background: active ? 'var(--bg-surface)' : 'transparent', border: 'none', borderBottom: active ? `2px solid ${color}` : '2px solid transparent', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
                        >
                            <span style={{ fontSize: '1rem' }}>{DEPT_ICON[dept]}</span>
                            <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.58rem', letterSpacing: '0.02em', color: active ? color : 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.3 }}>{dept}</span>
                            {stats.open > 0 && (
                                <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.55rem', background: 'var(--color-danger)', color: 'var(--bg-base)', borderRadius: 10, padding: '1px 7px' }}>
                                    {stats.open} OPEN
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Active department panel */}
            <CyberPanel
                title={`${DEPT_ICON[activeDept]} ${activeDept}`}
                subtitle={`${deptStats[activeDept].total} ticket${deptStats[activeDept].total !== 1 ? 's' : ''} — ${deptStats[activeDept].open} open`}
                variant={deptStats[activeDept].open > 0 ? 'alert' : 'default'}
            >
                <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                    {STATUS_FILTERS.map(sf => (
                        <button key={sf} onClick={() => setStatusFilter(sf)} className={statusFilter === sf ? 'btn-primary' : 'btn-ghost'} style={{ fontSize: '0.58rem', padding: '4px 12px' }}>
                            {sf}
                        </button>
                    ))}
                    <span aria-live="polite" aria-atomic="true" style={{ marginLeft: 'auto', fontFamily: 'var(--font-terminal)', fontSize: '0.62rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
                        {visible.length} shown
                    </span>
                </div>

                {visible.length === 0 ? (
                    <EmptyState icon="✓" title="All clear" subtitle="No tickets in this department queue." compact />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {visible.map(ticket => (
                            <TicketCard
                                key={ticket.ticket_id ?? ticket.id}
                                ticket={ticket}
                                onResolve={handleResolve}
                                onReroute={setRerouteModal}
                                resolving={resolving}
                            />
                        ))}
                    </div>
                )}
            </CyberPanel>

            {rerouteModal && (
                <RerouteModal ticket={rerouteModal} onConfirm={handleReroute} onClose={() => setRerouteModal(null)} loading={rerouting} />
            )}

        </div>
    );
};

export default AdminSupport;