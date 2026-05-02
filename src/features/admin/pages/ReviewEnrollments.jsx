// frontend/src/features/admin/pages/ReviewEnrollments.jsx
// Two-panel layout: left = scrollable queue, right = selected application detail.
// No modals — approve/reject action lives inline in the right panel.

import React, { useState, useEffect, useMemo } from 'react';
import { adminApi } from '../api/adminApi';
import { useAdminRefresh } from '../layout/AdminLayout';
import Skeleton from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import PageHeader from '../../../components/ui/PageHeader';
import { useToast } from '../../../context/ToastContext';
import CyberPanel from '../../../components/ui/CyberPanel';
import StatusBadge from '../../../components/ui/StatusBadge';
import DataReadout from '../../../components/ui/DataReadout';
import { ENROLLMENT_STATUS_VARIANT } from '../../../constants/statusVariants';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ── Queue item row ─────────────────────────────────────────────────────────
const QueueRow = ({ req, selected, onClick, isChecked, onToggleCheck }) => {
    const status = req.review_status ?? 'PENDING';
    const accent = status === 'PENDING' ? 'var(--neon-orange)' : status === 'APPROVED' ? 'var(--neon-green)' : 'var(--neon-red)';
    const ageDays = req.created_at ? (Date.now() - new Date(req.created_at)) / 86400000 : 0;
    const ageColor = status === 'PENDING' ? (ageDays > 7 ? 'var(--neon-red)' : ageDays > 3 ? 'var(--neon-orange)' : null) : null;

    return (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
            {status === 'PENDING' && (
                <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                        e.stopPropagation();
                        if (onToggleCheck) onToggleCheck(req.request_id);
                    }}
                    style={{ accentColor: 'var(--accent)', cursor: 'pointer', width: 16, height: 16, flexShrink: 0 }}
                />
            )}
            <button
                onClick={() => onClick(req)}
                style={{
                    width: '100%', textAlign: 'left', cursor: 'pointer',
                    background: selected ? 'var(--accent-dim)' : 'var(--bg-depth)',
                    border: selected ? '1px solid var(--border-accent)' : '1px solid var(--border-subtle)',
                    borderLeft: `3px solid ${selected ? 'var(--neon-cyan)' : accent}`,
                    borderRadius: 6, padding: '12px 14px',
                    transition: 'all 0.12s',
                }}
                onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = 'var(--border-default)'; }}
                onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.72rem', fontWeight: 600, color: selected ? 'var(--neon-cyan)' : 'var(--text-primary)' }}>
                        {req.full_name || `Student #${req.student_account_id}`}
                    </span>
                    <StatusBadge variant={ENROLLMENT_STATUS_VARIANT[status] ?? 'muted'} label={status} showDot={false} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.60rem', color: 'var(--text-muted)' }}>#{req.request_id}</span>
                    {ageColor && <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.55rem', color: ageColor, background: `${ageColor}18`, border: `1px solid ${ageColor}40`, borderRadius: 4, padding: '1px 5px', letterSpacing: '0.06em' }}>{Math.floor(ageDays)}d OLD</span>}
                    <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.60rem', color: 'var(--text-muted)' }}>
                        Y{req.target_year_level} S{req.target_semester}
                    </span>
                    {req.created_at && (
                        <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.60rem', color: 'var(--text-muted)' }}>
                            {new Date(req.created_at).toLocaleDateString()}
                        </span>
                    )}
                </div>
            </button>
        </div>
    );
};

// ── Detail panel ───────────────────────────────────────────────────────────
const DetailPanel = ({ req, onDecision, submitting }) => {
    const [notes, setNotes] = useState('');
    const [corExpanded, setCorExpanded] = useState(false);

    const status = req.review_status ?? 'PENDING';
    const isPending = status === 'PENDING';
    const hasImage = req.cor_image_path && req.cor_image_path !== 'initial_registration_cor';
    const imgSrc = hasImage ? `${API_BASE}/api/uploads/${req.cor_image_path}` : null;

    const rows = [
        { label: 'Request ID', value: `#${req.request_id}` },
        { label: 'Student ID', value: req.student_account_id },
        { label: 'Year Level', value: `Year ${req.target_year_level}` },
        { label: 'Semester', value: `Semester ${req.target_semester}` },
        { label: 'Status', value: status },
        { label: 'Submitted', value: req.created_at ? new Date(req.created_at).toLocaleString() : '—' },
    ];

    if (req.admin_notes) rows.push({ label: 'Admin Notes', value: req.admin_notes });

    const inpStyle = { width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 6, padding: '9px 12px', fontFamily: 'var(--font-terminal)', fontSize: '0.75rem', color: 'var(--text-primary)', outline: 'none', resize: 'none' };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            <CyberPanel title={req.full_name || `Student #${req.student_account_id}`} subtitle={`Enrollment Request #${req.request_id}`}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {rows.map(({ label, value }) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                            <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.62rem', letterSpacing: '0.10em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</span>
                            <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.72rem', color: 'var(--text-primary)' }}>{value}</span>
                        </div>
                    ))}
                </div>
            </CyberPanel>

            {imgSrc ? (
                <CyberPanel title="Certificate of Registration" subtitle="AI-scanned document">
                    <div style={{ cursor: 'pointer' }} onClick={() => setCorExpanded(v => !v)}>
                        <img
                            src={imgSrc}
                            alt="Certificate of Registration document"
                            style={{ width: '100%', borderRadius: 6, objectFit: 'contain', maxHeight: corExpanded ? 'none' : 200, transition: 'max-height 0.3s' }}
                        />
                        <p style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.60rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 8, letterSpacing: '0.10em' }}>
                            {corExpanded ? 'CLICK TO COLLAPSE' : 'CLICK TO EXPAND'}
                        </p>
                    </div>
                </CyberPanel>
            ) : (
                <CyberPanel title="Certificate of Registration">
                    <div style={{ padding: '20px 0', textAlign: 'center', fontFamily: 'var(--font-terminal)', fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.10em' }}>
                        {req.cor_image_path === 'initial_registration_cor' ? 'NEW REGISTRANT — NO COR ON FILE' : 'NO DOCUMENT ATTACHED'}
                    </div>
                </CyberPanel>
            )}

            {isPending ? (
                <CyberPanel title="Decision" variant="warning">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <label style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.55rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>
                            Admin Notes (optional)
                        </label>
                        <textarea
                            rows={3}
                            placeholder="Reason for approval or rejection, instructions to student…"
                            aria-label="Admin decision notes"
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            style={inpStyle}
                            onFocus={e => { e.target.style.borderColor = 'var(--border-focus)'; }}
                            onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; }}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            <button className="btn-danger" disabled={submitting} onClick={() => onDecision(req, 'REJECTED', notes)} style={{ fontSize: '0.65rem', padding: '10px' }}>
                                {submitting === 'REJECTED' ? 'PROCESSING...' : '✕ REJECT'}
                            </button>
                            <button className="btn-primary" disabled={!!submitting} onClick={() => onDecision(req, 'APPROVED', notes)} style={{ fontSize: '0.65rem', padding: '10px' }}>
                                {submitting === 'APPROVED' ? 'PROCESSING...' : '✓ APPROVE'}
                            </button>
                        </div>
                    </div>
                </CyberPanel>
            ) : (
                <div style={{ background: status === 'APPROVED' ? 'var(--color-success-bg)' : 'var(--color-danger-bg)', border: `1px solid ${status === 'APPROVED' ? 'var(--color-success-bd)' : 'var(--border-critical)'}`, borderRadius: 8, padding: '14px 16px', fontFamily: 'var(--font-terminal)', fontSize: '0.72rem', color: status === 'APPROVED' ? 'var(--neon-green)' : 'var(--neon-red)', textAlign: 'center', letterSpacing: '0.10em' }}>
                    {status === 'APPROVED' ? '✓ ENROLLMENT APPROVED' : '✕ ENROLLMENT REJECTED'}
                </div>
            )}
        </div>
    );
};

// ── Main page ──────────────────────────────────────────────────────────────
const ReviewEnrollments = () => {
    const refreshTick = useAdminRefresh();
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selected, setSelected] = useState(null);
    const [submitting, setSubmitting] = useState(null);
    const [statusFilter, setStatusFilter] = useState('PENDING');

    // Bulk Action State
    const [selectedIds, setSelectedIds] = useState([]);

    const { toast } = useToast();
    const flash = (msg, type = 'success') => type === 'error' ? toast.error(msg) : toast.success(msg);

    const loadData = async () => {
        setLoading(true); setError(null);
        try { setEnrollments((await adminApi.fetchPendingEnrollments()) ?? []); }
        catch { setError("Failed to sync with the Registrar's database."); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        loadData();
    }, [refreshTick]);

    const counts = useMemo(() => ({
        PENDING: enrollments.filter(e => e.review_status === 'PENDING').length,
        APPROVED: enrollments.filter(e => e.review_status === 'APPROVED').length,
        REJECTED: enrollments.filter(e => e.review_status === 'REJECTED').length,
    }), [enrollments]);

    const visible = useMemo(() =>
        statusFilter === 'ALL' ? enrollments : enrollments.filter(e => e.review_status === statusFilter),
        [enrollments, statusFilter]
    );

    // ── Handlers ──
    const handleDecision = async (req, action, notes) => {
        setSubmitting(action);
        try {
            await adminApi.submitEnrollmentDecision(req.request_id, { decision_status: action, admin_notes: notes || null });
            setEnrollments(prev => prev.map(r => r.request_id === req.request_id ? { ...r, review_status: action, admin_notes: notes || null } : r));
            setSelected(prev => prev?.request_id === req.request_id ? { ...prev, review_status: action, admin_notes: notes || null } : prev);
            flash(`Request #${req.request_id} ${action === 'APPROVED' ? 'approved' : 'rejected'}.`);
        } catch { flash('Action failed — please try again.', 'error'); }
        finally { setSubmitting(null); }
    };

    const toggleCheck = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleBulkDecision = async (decision_status) => {
        if (!selectedIds.length) return;
        setSubmitting(decision_status);
        try {
            const result = await adminApi.submitBulkEnrollmentDecision({
                request_ids: selectedIds,
                decision_status,
                admin_notes: "Processed via Bulk Action"
            });
            flash(result.message);
            setSelectedIds([]); // clear selection
            setSelected(null); // clear detail view to prevent stale data
            loadData(); // refresh queue
        } catch (err) {
            flash(err.response?.data?.detail || 'Bulk processing failed.', 'error');
        } finally {
            setSubmitting(null);
        }
    };

    if (loading && enrollments.length === 0) return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Skeleton.PageHeader />
            <Skeleton.KpiStrip count={3} />
            <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {Array.from({ length: 6 }).map((_, i) => <Skeleton.Card key={i} />)}
                </div>
                <Skeleton.Card />
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <PageHeader
                title="Enrollment Triage"
                subtitle="Review student submissions — select a request to view details and act."
                badge={counts.PENDING > 0 ? <StatusBadge variant="warning" label={`${counts.PENDING} PENDING`} showDot /> : null}
            />

            {error && <div style={{ padding: '10px 14px', fontFamily: 'var(--font-terminal)', fontSize: '0.72rem', color: 'var(--neon-red)', background: 'var(--color-danger-bg)', border: '1px solid var(--border-critical)', borderRadius: 6 }}>{error}</div>}

            {/* KPI strip */}
            <div role="status" aria-live="polite" aria-atomic="true" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                    { label: 'PENDING', value: counts.PENDING, color: counts.PENDING > 0 ? 'var(--neon-orange)' : 'var(--neon-green)' },
                    { label: 'APPROVED', value: counts.APPROVED, color: 'var(--neon-green)' },
                    { label: 'REJECTED', value: counts.REJECTED, color: counts.REJECTED > 0 ? 'var(--neon-red)' : 'var(--text-muted)' },
                ].map(({ label, value, color }) => (
                    <div key={label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '14px 16px' }}>
                        <DataReadout label={label} value={value} color={color} size="sm" />
                    </div>
                ))}
            </div>

            {/* Two-panel layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 16, alignItems: 'start' }}>

                {/* LEFT — Queue list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border-subtle)', marginBottom: 10 }}>
                        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(s => {
                            const active = statusFilter === s;
                            return (
                                <button key={s} onClick={() => setStatusFilter(s)} style={{ flex: 1, padding: '8px 4px', background: 'transparent', border: 'none', borderBottom: active ? '2px solid var(--neon-cyan)' : '2px solid transparent', cursor: 'pointer', fontFamily: 'var(--font-terminal)', fontSize: '0.58rem', letterSpacing: '0.10em', color: active ? 'var(--neon-cyan)' : 'var(--text-muted)', transition: 'all 0.15s' }}>
                                    {s}
                                </button>
                            );
                        })}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 640, overflowY: 'auto', paddingRight: 4 }}>

                        {/* Bulk Action Bar - Appears when items are checked */}
                        {selectedIds.length > 0 && (
                            <div className="animate-fade-in-up" style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '10px 14px', background: 'var(--bg-elevated)',
                                border: '1px solid var(--border-accent)', borderRadius: 6, marginBottom: 10
                            }}>
                                <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.70rem', fontWeight: 600, color: 'var(--accent)' }}>
                                    {selectedIds.length} SELECTED
                                </span>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button
                                        disabled={!!submitting}
                                        onClick={() => handleBulkDecision('APPROVED')}
                                        className="btn-primary" style={{ padding: '4px 12px', fontSize: '0.65rem' }}>
                                        {submitting === 'APPROVED' ? '...' : 'APPROVE ALL'}
                                    </button>
                                    <button
                                        disabled={!!submitting}
                                        onClick={() => handleBulkDecision('REJECTED')}
                                        style={{
                                            padding: '4px 12px', fontSize: '0.65rem', fontWeight: 700,
                                            background: 'transparent', color: 'var(--neon-red)',
                                            border: '1px solid var(--neon-red)', borderRadius: 4, cursor: 'pointer', transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 51, 102, 0.1)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        REJECT ALL
                                    </button>
                                </div>
                            </div>
                        )}

                        {visible.length === 0 ? (
                            <p style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.68rem', color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0', letterSpacing: '0.10em' }}>
                                NO SUBMISSIONS IN THIS FILTER
                            </p>
                        ) : visible.map(req => (
                            <QueueRow
                                key={req.request_id}
                                req={req}
                                selected={selected?.request_id === req.request_id}
                                onClick={setSelected}
                                isChecked={selectedIds.includes(req.request_id)}
                                onToggleCheck={toggleCheck}
                            />
                        ))}
                    </div>
                </div>

                {/* RIGHT — Detail panel */}
                <div>
                    {selected ? (
                        <DetailPanel req={selected} onDecision={handleDecision} submitting={submitting} />
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, background: 'var(--bg-depth)', border: '1px solid var(--border-subtle)', borderRadius: 10, gap: 10 }}>
                            <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
                                SELECT A REQUEST TO REVIEW
                            </span>
                            <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.60rem', color: 'var(--border-default)', letterSpacing: '0.08em' }}>
                                ← choose from the queue
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewEnrollments;