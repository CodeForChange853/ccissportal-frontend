import React, { useState, useEffect, useCallback } from 'react';
import { useSecretaryRefresh } from '../layout/SecretaryLayout';
import { secretaryApi } from '../api/secretaryApi';
import { useToast } from '../../../context/ToastContext';
import PageHeader from '../../../components/ui/PageHeader';
import StatusBadge from '../../../components/ui/StatusBadge';
import EmptyState from '../../../components/ui/EmptyState';

const STATE_VARIANT = {
    PENDING_FEE:            'warning',
    ROUTED_TO_FACULTY:      'info',
    AWAITING_ADMIN_POSTING: 'normal',
    POSTED:                 'success',
    REJECTED:               'critical',
};

// Secretary can only advance PENDING_FEE → ROUTED_TO_FACULTY
const NEXT_ACTIONS = {
    PENDING_FEE: [{ label: 'Route to Faculty', new_state: 'ROUTED_TO_FACULTY' }],
};

const INCCompletions = () => {
    const { toast } = useToast();
    const tick = useSecretaryRefresh();

    const [requests, setRequests] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [stateFilter, setStateFilter] = useState('ALL');
    const [selected, setSelected] = useState(null);
    const [notes, setNotes]       = useState('');
    const [newState, setNewState]  = useState('');
    const [processing, setProcessing] = useState(false);

    const STATE_OPTIONS = ['ALL', 'PENDING_FEE', 'ROUTED_TO_FACULTY', 'AWAITING_ADMIN_POSTING', 'POSTED', 'REJECTED'];

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await secretaryApi.fetchCompletionRequests(stateFilter === 'ALL' ? null : stateFilter);
            setRequests(data);
        } catch {
            toast.error('Failed to load completion requests.');
        } finally {
            setLoading(false);
        }
    }, [stateFilter]);

    useEffect(() => { load(); }, [load, tick]);

    const handleAdvance = async () => {
        if (!selected || !newState) return;
        setProcessing(true);
        try {
            await secretaryApi.advanceCompletionRequest(selected.id, { new_state: newState, note: notes || null });
            toast.success('Completion request advanced.');
            setSelected(null);
            setNotes(''); setNewState('');
            load();
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Action failed.');
        } finally {
            setProcessing(false);
        }
    };

    const openModal = (req) => {
        const actions = NEXT_ACTIONS[req.workflow_state] || [];
        setNewState(actions[0]?.new_state || '');
        setSelected(req);
        setNotes('');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 24 }}>
            <PageHeader
                title="INC Completions"
                subtitle="Route INC grade completion requests through the faculty workflow"
            />

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {STATE_OPTIONS.map(s => {
                    const active = stateFilter === s;
                    return (
                        <button key={s} onClick={() => setStateFilter(s)} style={{
                            padding: '6px 14px', borderRadius: 100,
                            border: '1px solid var(--border-default)',
                            background: active ? 'var(--accent)' : 'var(--bg-surface)',
                            color: active ? '#fff' : 'var(--text-secondary)',
                            fontFamily: 'var(--font-code)', fontSize: '0.58rem',
                            fontWeight: 700, letterSpacing: '0.05em',
                            cursor: 'pointer', transition: 'all 0.15s',
                            boxShadow: active ? 'var(--shadow-accent)' : 'none',
                        }}>{s.replace(/_/g, ' ')}</button>
                    );
                })}
            </div>

            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 16, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-code)', fontSize: '0.78rem' }}>Loading…</div>
                ) : requests.length === 0 ? (
                    <EmptyState title="No requests" subtitle="No INC completion requests match the filter." />
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-code)', fontSize: '0.78rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                                {['ID', 'Student', 'Gradebook Entry', 'State', 'Created', 'Action'].map(h => (
                                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((r, i) => {
                                const canAdvance = !!NEXT_ACTIONS[r.workflow_state]?.length;
                                return (
                                    <tr key={r.id} style={{ borderBottom: i < requests.length - 1 ? '1px solid var(--border-default)' : 'none' }}>
                                        <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>#{r.id}</td>
                                        <td style={{ padding: '12px 16px', color: 'var(--text-primary)' }}>{r.student_account_id}</td>
                                        <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{r.gradebook_entry_id}</td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <StatusBadge variant={STATE_VARIANT[r.workflow_state] ?? 'muted'} label={r.workflow_state.replace(/_/g, ' ')} showDot={false} />
                                        </td>
                                        <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                                            {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            {canAdvance && (
                                                <button
                                                    className="btn-primary"
                                                    style={{ fontSize: '0.6rem', padding: '5px 12px', background: 'var(--accent)', borderColor: 'var(--accent)' }}
                                                    onClick={() => openModal(r)}
                                                >
                                                    ADVANCE
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Advance modal */}
            {selected && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 480, boxShadow: 'var(--shadow-accent)' }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
                            Advance Request #{selected.id}
                        </h3>
                        <label style={{ display: 'block', fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, fontFamily: 'var(--font-code)' }}>Action</label>
                        <select
                            value={newState}
                            onChange={e => setNewState(e.target.value)}
                            style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 8, color: 'var(--text-primary)', fontFamily: 'var(--font-code)', fontSize: '0.78rem', marginBottom: 16 }}
                        >
                            {(NEXT_ACTIONS[selected.workflow_state] || []).map(a => (
                                <option key={a.new_state} value={a.new_state}>{a.label}</option>
                            ))}
                        </select>
                        <label style={{ display: 'block', fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, fontFamily: 'var(--font-code)' }}>Notes</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Optional notes…"
                            style={{ width: '100%', boxSizing: 'border-box', background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontFamily: 'var(--font-code)', fontSize: '0.78rem', outline: 'none', resize: 'vertical' }}
                            onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
                            onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; }}
                        />
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                            <button className="btn-ghost" onClick={() => setSelected(null)} disabled={processing}>Cancel</button>
                            <button className="btn-primary" style={{ background: 'var(--accent)', borderColor: 'var(--accent)' }} onClick={handleAdvance} disabled={processing}>
                                {processing ? 'Processing…' : 'CONFIRM'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default INCCompletions;
