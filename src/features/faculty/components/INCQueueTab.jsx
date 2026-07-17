import React, { useState, useEffect, useCallback } from 'react';
import { facultyApi } from '../api/facultyApi';
import { useToast } from '../../../context/ToastContext';
import EmptyState from '../../../components/ui/EmptyState';
import StatusBadge from '../../../components/ui/StatusBadge';

const GRADE_OPTIONS = [1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0, 5.0];

const inpStyle = {
    width: '100%', boxSizing: 'border-box',
    padding: '9px 12px', borderRadius: 9,
    border: '1px solid var(--border-default)',
    background: 'var(--bg-input)', color: 'var(--text-primary)',
    fontSize: 13, fontFamily: 'var(--font-body)', outline: 'none',
};

const GradeSubmitModal = ({ request, onSubmit, onClose, submitting }) => {
    const [grade, setGrade] = useState(1.0);
    const [note, setNote] = useState('');

    const gradeLabel = (g) => {
        if (g <= 1.0) return `${g.toFixed(2)} — Excellent`;
        if (g <= 1.75) return `${g.toFixed(2)} — Very Good`;
        if (g <= 2.5) return `${g.toFixed(2)} — Good`;
        if (g <= 3.0) return `${g.toFixed(2)} — Passing`;
        return `${g.toFixed(2)} — Failed`;
    };

    return (
        <div
            style={{ position: 'fixed', inset: 0, zIndex: 1200, background: 'var(--bg-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={onClose}
        >
            <div
                onClick={e => e.stopPropagation()}
                className="fade-in"
                style={{ background: 'var(--bg-elevated)', borderRadius: 20, width: '100%', maxWidth: 440, overflow: 'hidden', boxShadow: 'var(--shadow-modal)', border: '1px solid var(--border-default)' }}
            >
                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #9A7D28 100%)', padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: 1.5, fontFamily: 'var(--font-code)' }}>
                            INC Completion — Request #{request.id}
                        </p>
                        <p style={{ margin: '4px 0 0', fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)' }}>
                            Submit Final Grade
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ width: 26, height: 26, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.18)', cursor: 'pointer', color: '#fff', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >×</button>
                </div>

                {/* Info row */}
                <div style={{ padding: '14px 22px 0', display: 'flex', gap: 12 }}>
                    {[
                        ['Student ID', `#${request.student_account_id}`],
                        ['Gradebook Entry', `#${request.gradebook_entry_id}`],
                        ['Submitted', new Date(request.created_at).toLocaleDateString()],
                    ].map(([label, val]) => (
                        <div key={label} style={{ flex: 1, background: 'var(--bg-depth)', borderRadius: 8, padding: '8px 10px', border: '1px solid var(--border-subtle)' }}>
                            <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'var(--font-code)' }}>{label}</p>
                            <p style={{ margin: '3px 0 0', fontSize: 13, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-code)' }}>{val}</p>
                        </div>
                    ))}
                </div>

                {/* Form */}
                <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 7 }}>
                            Final Grade
                        </label>
                        <select
                            value={grade}
                            onChange={e => setGrade(parseFloat(e.target.value))}
                            style={{ ...inpStyle, cursor: 'pointer' }}
                            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                            onBlur={e => e.target.style.borderColor = 'var(--border-default)'}
                        >
                            {GRADE_OPTIONS.map(g => (
                                <option key={g} value={g}>{gradeLabel(g)}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 7 }}>
                            Note <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                        </label>
                        <textarea
                            rows={3}
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            placeholder="Add context for the secretariat or admin…"
                            style={{ ...inpStyle, resize: 'vertical' }}
                            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                            onBlur={e => e.target.style.borderColor = 'var(--border-default)'}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        style={{ padding: '9px 18px', borderRadius: 9, background: 'transparent', border: '1px solid var(--border-default)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}
                    >Cancel</button>
                    <button
                        onClick={() => onSubmit(grade, note)}
                        disabled={submitting}
                        style={{ padding: '9px 22px', borderRadius: 9, background: 'var(--accent)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)', boxShadow: '0 4px 14px rgba(186,151,49,0.32)', opacity: submitting ? 0.65 : 1 }}
                    >
                        {submitting ? 'Submitting…' : 'Submit Grade'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const INCQueueTab = () => {
    const { toast } = useToast();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await facultyApi.fetchINCQueue();
            setRequests(data);
        } catch {
            toast.error?.('Failed to load INC completion queue.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleSubmitGrade = async (grade, note) => {
        if (!selected) return;
        setSubmitting(true);
        try {
            await facultyApi.submitINCGrade(selected.id, grade, note || null);
            toast.success?.('Grade submitted — request forwarded to admin for posting.');
            setSelected(null);
            setRequests(prev => prev.filter(r => r.id !== selected.id));
        } catch (err) {
            toast.error?.(err.response?.data?.detail || 'Failed to submit grade.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fade-in">
            {/* Header */}
            <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: 4 }}>
                    INC Completion Queue
                </h2>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Students whose INC requests have been routed to you — submit a final grade to advance each request to admin posting.
                </p>
            </div>

            {/* Count badge */}
            {!loading && requests.length > 0 && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 100, background: 'var(--color-warning-bg)', border: '1px solid var(--color-warning-bd)', marginBottom: 18 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-warning)', boxShadow: '0 0 5px rgba(217,119,6,0.5)' }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-warning)', fontFamily: 'var(--font-code)' }}>
                        {requests.length} pending grade submission{requests.length !== 1 ? 's' : ''}
                    </span>
                </div>
            )}

            {/* Table */}
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 16, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--portal-accent)', fontFamily: 'var(--font-code)', fontSize: 12, letterSpacing: 2 }}>
                        LOADING INC QUEUE…
                    </div>
                ) : requests.length === 0 ? (
                    <EmptyState
                        title="No pending INC requests"
                        subtitle="All INC completion requests assigned to you have been resolved."
                    />
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-code)', fontSize: 12 }}>
                        <thead>
                            <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-default)' }}>
                                {['Request', 'Student ID', 'Gradebook Entry', 'Status', 'Requested On', ''].map(h => (
                                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 700, fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((req, idx) => (
                                <tr
                                    key={req.id}
                                    style={{
                                        borderBottom: idx < requests.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                                        transition: 'background 0.12s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-depth)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '13px 16px', color: 'var(--text-muted)' }}>#{req.id}</td>
                                    <td style={{ padding: '13px 16px', color: 'var(--text-primary)', fontWeight: 600 }}>
                                        #{req.student_account_id}
                                    </td>
                                    <td style={{ padding: '13px 16px', color: 'var(--text-secondary)' }}>
                                        #{req.gradebook_entry_id}
                                    </td>
                                    <td style={{ padding: '13px 16px' }}>
                                        <StatusBadge variant="warning" label="Awaiting Grade" showDot />
                                    </td>
                                    <td style={{ padding: '13px 16px', color: 'var(--text-muted)' }}>
                                        {new Date(req.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </td>
                                    <td style={{ padding: '13px 16px' }}>
                                        <button
                                            onClick={() => setSelected(req)}
                                            style={{
                                                padding: '6px 16px', borderRadius: 7,
                                                background: 'var(--accent)', border: 'none',
                                                color: '#fff', fontSize: 11, fontWeight: 700,
                                                cursor: 'pointer', fontFamily: 'var(--font-body)',
                                                boxShadow: '0 2px 8px rgba(186,151,49,0.28)',
                                                transition: 'opacity 0.12s',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                        >
                                            Submit Grade
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Workflow note */}
            {!loading && (
                <div style={{ marginTop: 18, padding: '12px 16px', background: 'var(--bg-depth)', borderRadius: 10, border: '1px solid var(--border-subtle)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>ℹ️</span>
                    <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                        After you submit a grade, the request moves to <strong style={{ color: 'var(--text-secondary)' }}>Awaiting Admin Posting</strong>. The admin will then finalize and post the grade to the official gradebook. Students are notified once the grade is posted.
                    </p>
                </div>
            )}

            {/* Grade submission modal */}
            {selected && (
                <GradeSubmitModal
                    request={selected}
                    onSubmit={handleSubmitGrade}
                    onClose={() => setSelected(null)}
                    submitting={submitting}
                />
            )}
        </div>
    );
};

export default INCQueueTab;
