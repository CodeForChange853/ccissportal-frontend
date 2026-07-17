import React, { useState, useEffect, useCallback } from 'react';
import { useSecretaryRefresh } from '../layout/SecretaryLayout';
import { secretaryApi } from '../api/secretaryApi';
import { useToast } from '../../../context/ToastContext';
import PageHeader from '../../../components/ui/PageHeader';
import StatusBadge from '../../../components/ui/StatusBadge';
import EmptyState from '../../../components/ui/EmptyState';

const STATUS_FILTER_OPTIONS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];

const OJT_VARIANT = {
    PENDING: 'warning',
    APPROVED: 'normal',
    REJECTED: 'critical',
    SUBMITTED: 'info',
};

const OJTClearance = () => {
    const { toast } = useToast();
    const tick = useSecretaryRefresh();

    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selected, setSelected] = useState(null);
    const [notes, setNotes] = useState('');
    const [processing, setProcessing] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await secretaryApi.fetchOJTSubmissions(statusFilter === 'ALL' ? null : statusFilter);
            setSubmissions(data);
        } catch {
            toast.error('Failed to load OJT submissions.');
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => { load(); }, [load, tick]);

    const handleDecision = async (action) => {
        if (!selected) return;
        setProcessing(true);
        try {
            await secretaryApi.reviewOJTSubmission(selected.id, { action, secretary_notes: notes });
            toast.success(`OJT submission ${action === 'APPROVE' ? 'approved' : 'rejected'}.`);
            setSelected(null);
            setNotes('');
            load();
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Action failed.');
        } finally {
            setProcessing(false);
        }
    };

    const filterTab = (status) => {
        const active = statusFilter === status;
        return (
            <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                    padding: '6px 16px',
                    borderRadius: 100,
                    border: '1px solid var(--border-default)',
                    background: active ? 'var(--accent)' : 'var(--bg-surface)',
                    color: active ? '#fff' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-code)',
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    boxShadow: active ? 'var(--shadow-accent)' : 'none',
                }}
            >
                {status}
            </button>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 24 }}>
            <PageHeader
                title="OJT Clearance"
                subtitle={`${submissions.length} submission${submissions.length !== 1 ? 's' : ''} — review and approve OJT hour completion`}
            />

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {STATUS_FILTER_OPTIONS.map(filterTab)}
            </div>

            {/* Table */}
            <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 16,
                overflow: 'hidden',
            }}>
                {loading ? (
                    <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-code)', fontSize: '0.78rem' }}>
                        Loading…
                    </div>
                ) : submissions.length === 0 ? (
                    <EmptyState title="No submissions" subtitle="No OJT submissions match the current filter." />
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-code)', fontSize: '0.78rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                                {['Student ID', 'Type', 'Hours', 'Status', 'Submitted', 'Action'].map(h => (
                                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.map((s, i) => (
                                <tr key={s.id} style={{ borderBottom: i < submissions.length - 1 ? '1px solid var(--border-default)' : 'none' }}>
                                    <td style={{ padding: '12px 16px', color: 'var(--text-primary)' }}>{s.student_account_id}</td>
                                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{s.submission_type ?? '—'}</td>
                                    <td style={{ padding: '12px 16px', color: 'var(--text-primary)' }}>{s.hours_completed ?? '—'}</td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <StatusBadge variant={OJT_VARIANT[s.submission_status] ?? 'muted'} label={s.submission_status} showDot={false} />
                                    </td>
                                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                                        {s.submitted_at ? new Date(s.submitted_at).toLocaleDateString() : '—'}
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        {s.submission_status === 'PENDING' && (
                                            <button
                                                className="btn-primary"
                                                style={{ fontSize: '0.6rem', padding: '5px 12px', background: 'var(--accent)', borderColor: 'var(--accent)' }}
                                                onClick={() => { setSelected(s); setNotes(''); }}
                                            >
                                                REVIEW
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Review modal */}
            {selected && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    background: 'rgba(0,0,0,0.65)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 24,
                }}>
                    <div style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 20,
                        padding: 28,
                        width: '100%',
                        maxWidth: 480,
                        boxShadow: 'var(--shadow-accent)',
                    }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                            Review OJT Submission #{selected.id}
                        </h3>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 20, fontFamily: 'var(--font-code)' }}>
                            Student {selected.student_account_id} · {selected.hours_completed} hrs
                        </p>
                        <label style={{ display: 'block', fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, fontFamily: 'var(--font-code)' }}>
                            Secretary Notes (optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            rows={3}
                            placeholder="Add review notes…"
                            style={{
                                width: '100%', boxSizing: 'border-box',
                                background: 'var(--bg-input)',
                                border: '1px solid var(--border-default)',
                                borderRadius: 8, padding: '10px 12px',
                                color: 'var(--text-primary)',
                                fontFamily: 'var(--font-code)', fontSize: '0.78rem',
                                outline: 'none', resize: 'vertical',
                            }}
                            onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
                            onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; }}
                        />
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                            <button className="btn-ghost" onClick={() => setSelected(null)} disabled={processing}>
                                Cancel
                            </button>
                            <button
                                className="btn-danger"
                                onClick={() => handleDecision('REJECT')}
                                disabled={processing}
                            >
                                {processing ? 'Processing…' : 'REJECT'}
                            </button>
                            <button
                                className="btn-primary"
                                style={{ background: 'var(--accent)', borderColor: 'var(--accent)' }}
                                onClick={() => handleDecision('APPROVE')}
                                disabled={processing}
                            >
                                {processing ? 'Processing…' : 'APPROVE'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OJTClearance;
