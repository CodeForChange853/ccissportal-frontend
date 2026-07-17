import React, { useState, useEffect, useCallback } from 'react';
import { useSecretaryRefresh } from '../layout/SecretaryLayout';
import { secretaryApi } from '../api/secretaryApi';
import { useToast } from '../../../context/ToastContext';
import PageHeader from '../../../components/ui/PageHeader';
import StatusBadge from '../../../components/ui/StatusBadge';
import EmptyState from '../../../components/ui/EmptyState';

const DOC_VARIANT = {
    PENDING:          'warning',
    PROCESSING:       'info',
    READY_FOR_PICKUP: 'normal',
    RELEASED:         'muted',
    REJECTED:         'critical',
};

const NEXT_STATUS = {
    PENDING:          'PROCESSING',
    PROCESSING:       'READY_FOR_PICKUP',
    READY_FOR_PICKUP: 'RELEASED',
};

const STATUS_OPTIONS = ['ALL', 'PENDING', 'PROCESSING', 'READY_FOR_PICKUP', 'RELEASED', 'REJECTED'];

const DocumentRequests = () => {
    const { toast } = useToast();
    const tick = useSecretaryRefresh();

    const [requests,  setRequests]  = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selected,  setSelected]  = useState(null);
    const [notes,     setNotes]     = useState('');
    const [rejecting, setRejecting] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [processing, setProcessing] = useState(false);

    // Walk-in external form
    const [showWalkIn, setShowWalkIn] = useState(false);
    const [walkin, setWalkin] = useState({ requestor_name: '', requestor_email: '', document_type: 'TRANSCRIPT', purpose: '' });
    const [submitting, setSubmitting] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await secretaryApi.fetchDocumentRequests(statusFilter === 'ALL' ? null : statusFilter);
            setRequests(data);
        } catch {
            toast.error('Failed to load document requests.');
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => { load(); }, [load, tick]);

    const handleAdvance = async () => {
        if (!selected) return;
        const targetStatus = rejecting ? 'REJECTED' : NEXT_STATUS[selected.status];
        if (!targetStatus) return;
        setProcessing(true);
        try {
            await secretaryApi.advanceDocumentStatus(selected.id, {
                target_status: targetStatus,
                secretary_notes: rejecting ? rejectReason : notes,
            });
            toast.success(`Status updated to ${targetStatus}.`);
            setSelected(null); setNotes(''); setRejecting(false); setRejectReason('');
            load();
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Action failed.');
        } finally {
            setProcessing(false);
        }
    };

    const handleWalkIn = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await secretaryApi.createExternalDocumentRequest(walkin);
            toast.success('Walk-in document request created.');
            setShowWalkIn(false);
            setWalkin({ requestor_name: '', requestor_email: '', document_type: 'TRANSCRIPT', purpose: '' });
            load();
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to create request.');
        } finally {
            setSubmitting(false);
        }
    };

    const inputStyle = {
        width: '100%', boxSizing: 'border-box',
        background: 'var(--bg-input)', border: '1px solid var(--border-default)',
        borderRadius: 8, padding: '10px 12px',
        color: 'var(--text-primary)', fontFamily: 'var(--font-code)', fontSize: '0.78rem',
        outline: 'none',
    };

    const canAdvance = selected && NEXT_STATUS[selected.status];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 24 }}>
            <PageHeader
                title="Document Requests"
                subtitle="Process student and alumni document requests through the pickup pipeline"
                badge={
                    <button className="btn-primary" style={{ fontSize: '0.7rem', background: 'var(--accent)', borderColor: 'var(--accent)' }}
                        onClick={() => setShowWalkIn(v => !v)}>
                        {showWalkIn ? 'CANCEL' : '+ WALK-IN'}
                    </button>
                }
            />

            {/* Walk-in form */}
            {showWalkIn && (
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 16, padding: 24 }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
                        Walk-in / External Request
                    </h3>
                    <form onSubmit={handleWalkIn} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, fontFamily: 'var(--font-code)' }}>Full Name</label>
                            <input required value={walkin.requestor_name} onChange={e => setWalkin(p => ({ ...p, requestor_name: e.target.value }))} placeholder="Juan dela Cruz" style={inputStyle}
                                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }} onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, fontFamily: 'var(--font-code)' }}>Email (optional)</label>
                            <input type="email" value={walkin.requestor_email} onChange={e => setWalkin(p => ({ ...p, requestor_email: e.target.value }))} placeholder="email@example.com" style={inputStyle}
                                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }} onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, fontFamily: 'var(--font-code)' }}>Document Type</label>
                            <select value={walkin.document_type} onChange={e => setWalkin(p => ({ ...p, document_type: e.target.value }))} style={inputStyle}>
                                {['TRANSCRIPT', 'CERTIFICATION', 'DIPLOMA_AUTH', 'GOOD_MORAL', 'ENROLLMENT_CERT', 'OTHER'].map(t => (
                                    <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, fontFamily: 'var(--font-code)' }}>Purpose</label>
                            <input required value={walkin.purpose} onChange={e => setWalkin(p => ({ ...p, purpose: e.target.value }))} placeholder="Purpose of request" style={inputStyle}
                                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }} onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; }} />
                        </div>
                        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                            <button type="button" className="btn-ghost" onClick={() => setShowWalkIn(false)}>Cancel</button>
                            <button type="submit" className="btn-primary" style={{ background: 'var(--accent)', borderColor: 'var(--accent)' }} disabled={submitting}>
                                {submitting ? 'Creating…' : 'CREATE REQUEST'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {STATUS_OPTIONS.map(s => {
                    const active = statusFilter === s;
                    return (
                        <button key={s} onClick={() => setStatusFilter(s)} style={{
                            padding: '6px 14px', borderRadius: 100, cursor: 'pointer', transition: 'all 0.15s',
                            border: '1px solid var(--border-default)',
                            background: active ? 'var(--accent)' : 'var(--bg-surface)',
                            color: active ? '#fff' : 'var(--text-secondary)',
                            fontFamily: 'var(--font-code)', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.05em',
                            boxShadow: active ? 'var(--shadow-accent)' : 'none',
                        }}>{s.replace(/_/g, ' ')}</button>
                    );
                })}
            </div>

            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 16, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-code)', fontSize: '0.78rem' }}>Loading…</div>
                ) : requests.length === 0 ? (
                    <EmptyState title="No requests" subtitle="No document requests match the current filter." />
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-code)', fontSize: '0.78rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                                {['Reference', 'Type', 'Requestor', 'Category', 'Status', 'Date', 'Action'].map(h => (
                                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((r, i) => (
                                <tr key={r.id} style={{ borderBottom: i < requests.length - 1 ? '1px solid var(--border-default)' : 'none' }}>
                                    <td style={{ padding: '12px 16px', color: 'var(--accent)', fontFamily: 'var(--font-code)', fontWeight: 700, fontSize: '0.7rem' }}>{r.reference_number}</td>
                                    <td style={{ padding: '12px 16px', color: 'var(--text-primary)' }}>{r.document_type.replace(/_/g, ' ')}</td>
                                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{r.requestor_name ?? `Account #${r.requestor_account_id}`}</td>
                                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{r.requestor_type}</td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <StatusBadge variant={DOC_VARIANT[r.status] ?? 'muted'} label={r.status.replace(/_/g, ' ')} showDot={false} />
                                    </td>
                                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                                        {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        {NEXT_STATUS[r.status] && (
                                            <button className="btn-primary" style={{ fontSize: '0.6rem', padding: '5px 12px', background: 'var(--accent)', borderColor: 'var(--accent)' }}
                                                onClick={() => { setSelected(r); setNotes(''); setRejecting(false); setRejectReason(''); }}>
                                                ADVANCE
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Advance / reject modal */}
            {selected && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 480, boxShadow: 'var(--shadow-accent)' }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                            {selected.reference_number}
                        </h3>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 20, fontFamily: 'var(--font-code)' }}>
                            {selected.document_type} · {selected.status} → {rejecting ? 'REJECTED' : NEXT_STATUS[selected.status]}
                        </p>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                            <button onClick={() => setRejecting(false)} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border-default)', background: !rejecting ? 'var(--accent)' : 'transparent', color: !rejecting ? '#fff' : 'var(--text-secondary)', fontFamily: 'var(--font-code)', fontSize: '0.68rem', cursor: 'pointer' }}>
                                ADVANCE
                            </button>
                            <button onClick={() => setRejecting(true)} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--color-danger)', background: rejecting ? 'var(--color-danger)' : 'transparent', color: rejecting ? '#fff' : 'var(--color-danger)', fontFamily: 'var(--font-code)', fontSize: '0.68rem', cursor: 'pointer' }}>
                                REJECT
                            </button>
                        </div>
                        <textarea
                            value={rejecting ? rejectReason : notes}
                            onChange={e => rejecting ? setRejectReason(e.target.value) : setNotes(e.target.value)}
                            rows={3}
                            placeholder={rejecting ? 'Rejection reason…' : 'Optional notes…'}
                            style={{ width: '100%', boxSizing: 'border-box', background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontFamily: 'var(--font-code)', fontSize: '0.78rem', outline: 'none', resize: 'vertical' }}
                            onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
                            onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; }}
                        />
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                            <button className="btn-ghost" onClick={() => setSelected(null)} disabled={processing}>Cancel</button>
                            <button
                                className={rejecting ? 'btn-danger' : 'btn-primary'}
                                style={rejecting ? {} : { background: 'var(--accent)', borderColor: 'var(--accent)' }}
                                onClick={handleAdvance}
                                disabled={processing || (rejecting && !rejectReason.trim())}
                            >
                                {processing ? 'Processing…' : rejecting ? 'REJECT' : 'ADVANCE STATUS'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentRequests;
