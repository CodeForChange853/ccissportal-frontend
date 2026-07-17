import React, { useState, useEffect, useCallback } from 'react';
import { useSecretaryRefresh } from '../layout/SecretaryLayout';
import { secretaryApi } from '../api/secretaryApi';
import { useToast } from '../../../context/ToastContext';
import PageHeader from '../../../components/ui/PageHeader';
import StatusBadge from '../../../components/ui/StatusBadge';
import EmptyState from '../../../components/ui/EmptyState';

const STATUS_VARIANT = { PENDING: 'warning', APPROVED: 'normal', REJECTED: 'critical', FORWARDED: 'info' };
const TYPE_OPTIONS  = ['ALL', 'OVERRIDE', 'SUBSTITUTION', 'LATE_ADD', 'LATE_DROP', 'OTHER'];
const STATUS_OPTIONS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'FORWARDED'];

const SubjectPetitions = () => {
    const { toast } = useToast();
    const tick = useSecretaryRefresh();

    const [petitions, setPetitions] = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [typeFilter,   setTypeFilter]   = useState('ALL');
    const [selected,   setSelected]   = useState(null);
    const [decision,   setDecision]   = useState('APPROVE');
    const [notes,      setNotes]      = useState('');
    const [processing, setProcessing] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await secretaryApi.fetchPetitions(
                statusFilter === 'ALL' ? null : statusFilter,
                typeFilter   === 'ALL' ? null : typeFilter,
            );
            setPetitions(data);
        } catch {
            toast.error('Failed to load petitions.');
        } finally {
            setLoading(false);
        }
    }, [statusFilter, typeFilter]);

    useEffect(() => { load(); }, [load, tick]);

    const handleProcess = async () => {
        if (!selected) return;
        setProcessing(true);
        try {
            await secretaryApi.secretaryActOnPetition(selected.id, { decision, secretary_notes: notes });
            toast.success(`Petition ${decision === 'APPROVE' ? 'approved' : decision === 'REJECT' ? 'rejected' : 'forwarded'}.`);
            setSelected(null);
            setNotes('');
            load();
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Action failed.');
        } finally {
            setProcessing(false);
        }
    };

    const FilterRow = ({ options, value, onChange }) => (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {options.map(o => {
                const active = value === o;
                return (
                    <button key={o} onClick={() => onChange(o)} style={{
                        padding: '5px 13px', borderRadius: 100, cursor: 'pointer', transition: 'all 0.15s',
                        border: '1px solid var(--border-default)',
                        background: active ? 'var(--accent)' : 'var(--bg-surface)',
                        color: active ? '#fff' : 'var(--text-secondary)',
                        fontFamily: 'var(--font-code)', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.05em',
                        boxShadow: active ? 'var(--shadow-accent)' : 'none',
                    }}>{o.replace(/_/g, ' ')}</button>
                );
            })}
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 24 }}>
            <PageHeader title="Subject Petitions" subtitle="Review and decide on student subject override, substitution, and add/drop petitions" />

            <FilterRow options={STATUS_OPTIONS} value={statusFilter} onChange={setStatusFilter} />
            <FilterRow options={TYPE_OPTIONS}   value={typeFilter}   onChange={setTypeFilter} />

            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 16, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-code)', fontSize: '0.78rem' }}>Loading…</div>
                ) : petitions.length === 0 ? (
                    <EmptyState title="No petitions" subtitle="No petitions match the current filters." />
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-code)', fontSize: '0.78rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                                {['ID', 'Student', 'Type', 'Subject', 'Reason', 'Status', 'Action'].map(h => (
                                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {petitions.map((p, i) => (
                                <tr key={p.id} style={{ borderBottom: i < petitions.length - 1 ? '1px solid var(--border-default)' : 'none' }}>
                                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>#{p.id}</td>
                                    <td style={{ padding: '12px 16px', color: 'var(--text-primary)' }}>{p.student_account_id}</td>
                                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{p.petition_type}</td>
                                    <td style={{ padding: '12px 16px', color: 'var(--text-primary)' }}>{p.subject_code ?? '—'}</td>
                                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)', maxWidth: 200 }}>
                                        <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {p.reason ?? '—'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <StatusBadge variant={STATUS_VARIANT[p.status] ?? 'muted'} label={p.status} showDot={false} />
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        {p.status === 'PENDING' && (
                                            <button className="btn-primary" style={{ fontSize: '0.6rem', padding: '5px 12px', background: 'var(--accent)', borderColor: 'var(--accent)' }}
                                                onClick={() => { setSelected(p); setDecision('APPROVE'); setNotes(''); }}>
                                                DECIDE
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {selected && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 480, boxShadow: 'var(--shadow-accent)' }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                            Decide on Petition #{selected.id}
                        </h3>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 20, fontFamily: 'var(--font-code)' }}>
                            {selected.petition_type} · {selected.subject_code ?? 'No subject'}
                        </p>
                        {selected.reason && (
                            <div style={{ background: 'var(--bg-depth)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-code)' }}>
                                {selected.reason}
                            </div>
                        )}
                        <label style={{ display: 'block', fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, fontFamily: 'var(--font-code)' }}>Decision</label>
                        <select value={decision} onChange={e => setDecision(e.target.value)}
                            style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 8, color: 'var(--text-primary)', fontFamily: 'var(--font-code)', fontSize: '0.78rem', marginBottom: 16 }}>
                            <option value="APPROVE">APPROVE</option>
                            <option value="REJECT">REJECT</option>
                            <option value="FORWARD">FORWARD TO DEAN</option>
                        </select>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Decision notes…"
                            style={{ width: '100%', boxSizing: 'border-box', background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontFamily: 'var(--font-code)', fontSize: '0.78rem', outline: 'none', resize: 'vertical' }}
                            onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
                            onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; }}
                        />
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                            <button className="btn-ghost" onClick={() => setSelected(null)} disabled={processing}>Cancel</button>
                            <button className="btn-primary" style={{ background: 'var(--accent)', borderColor: 'var(--accent)' }} onClick={handleProcess} disabled={processing}>
                                {processing ? 'Processing…' : 'SUBMIT DECISION'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubjectPetitions;
