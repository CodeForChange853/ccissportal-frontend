import React, { useState, useEffect, useCallback } from 'react';
import { useSecretaryRefresh } from '../layout/SecretaryLayout';
import { secretaryApi } from '../api/secretaryApi';
import { useToast } from '../../../context/ToastContext';
import PageHeader from '../../../components/ui/PageHeader';
import StatusBadge from '../../../components/ui/StatusBadge';
import EmptyState from '../../../components/ui/EmptyState';

const STATUS_VARIANT = { DRAFT: 'warning', PUBLISHED: 'normal', ARCHIVED: 'muted' };
const STATUS_OPTIONS  = ['ALL', 'DRAFT', 'PUBLISHED', 'ARCHIVED'];

const CurriculumMapping = () => {
    const { toast } = useToast();
    const tick = useSecretaryRefresh();

    const [drafts,    setDrafts]    = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selected,  setSelected]  = useState(null);
    const [action,    setAction]    = useState('PUBLISH');
    const [notes,     setNotes]     = useState('');
    const [processing, setProcessing] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await secretaryApi.fetchMappingDrafts(statusFilter === 'ALL' ? null : statusFilter);
            setDrafts(data);
        } catch {
            toast.error('Failed to load mapping drafts.');
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => { load(); }, [load, tick]);

    const handleProcess = async () => {
        if (!selected) return;
        setProcessing(true);
        try {
            await secretaryApi.decideMappingDraft(selected.id, { action, secretary_notes: notes });
            toast.success(`Draft ${action === 'PUBLISH' ? 'published' : 'archived'}.`);
            setSelected(null); setNotes('');
            load();
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Action failed.');
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async (id) => {
        setProcessing(true);
        try {
            await secretaryApi.deleteMappingDraft(id);
            toast.success('Draft deleted.');
            setConfirmDelete(null);
            load();
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Delete failed.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 24 }}>
            <PageHeader title="Curriculum Mapping" subtitle="Review, publish, and archive subject mapping drafts submitted by students" />

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {STATUS_OPTIONS.map(s => {
                    const active = statusFilter === s;
                    return (
                        <button key={s} onClick={() => setStatusFilter(s)} style={{
                            padding: '6px 14px', borderRadius: 100, cursor: 'pointer', transition: 'all 0.15s',
                            border: '1px solid var(--border-default)',
                            background: active ? 'var(--accent)' : 'var(--bg-surface)',
                            color: active ? '#fff' : 'var(--text-secondary)',
                            fontFamily: 'var(--font-code)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.05em',
                            boxShadow: active ? 'var(--shadow-accent)' : 'none',
                        }}>{s}</button>
                    );
                })}
            </div>

            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 16, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-code)', fontSize: '0.78rem' }}>Loading…</div>
                ) : drafts.length === 0 ? (
                    <EmptyState title="No drafts" subtitle="No mapping drafts match the current filter." />
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-code)', fontSize: '0.78rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                                {['ID', 'Student', 'Draft Title', 'Status', 'Created', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {drafts.map((d, i) => (
                                <tr key={d.id} style={{ borderBottom: i < drafts.length - 1 ? '1px solid var(--border-default)' : 'none' }}>
                                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>#{d.id}</td>
                                    <td style={{ padding: '12px 16px', color: 'var(--text-primary)' }}>{d.student_account_id}</td>
                                    <td style={{ padding: '12px 16px', color: 'var(--text-primary)' }}>{d.draft_title ?? `Draft #${d.id}`}</td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <StatusBadge variant={STATUS_VARIANT[d.status] ?? 'muted'} label={d.status} showDot={false} />
                                    </td>
                                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                                        {d.created_at ? new Date(d.created_at).toLocaleDateString() : '—'}
                                    </td>
                                    <td style={{ padding: '12px 16px', display: 'flex', gap: 8 }}>
                                        {d.status === 'DRAFT' && (
                                            <button className="btn-primary" style={{ fontSize: '0.6rem', padding: '5px 12px', background: 'var(--accent)', borderColor: 'var(--accent)' }}
                                                onClick={() => { setSelected(d); setAction('PUBLISH'); setNotes(''); }}>
                                                PROCESS
                                            </button>
                                        )}
                                        <button className="btn-danger" style={{ fontSize: '0.6rem', padding: '5px 12px' }}
                                            onClick={() => setConfirmDelete(d)}>
                                            DELETE
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Process modal */}
            {selected && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 440, boxShadow: 'var(--shadow-accent)' }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
                            Process Draft #{selected.id}
                        </h3>
                        <select value={action} onChange={e => setAction(e.target.value)}
                            style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 8, color: 'var(--text-primary)', fontFamily: 'var(--font-code)', fontSize: '0.78rem', marginBottom: 14 }}>
                            <option value="PUBLISH">PUBLISH</option>
                            <option value="ARCHIVE">ARCHIVE</option>
                        </select>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Notes…"
                            style={{ width: '100%', boxSizing: 'border-box', background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontFamily: 'var(--font-code)', fontSize: '0.78rem', outline: 'none', resize: 'vertical' }}
                            onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
                            onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; }}
                        />
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                            <button className="btn-ghost" onClick={() => setSelected(null)} disabled={processing}>Cancel</button>
                            <button className="btn-primary" style={{ background: 'var(--accent)', borderColor: 'var(--accent)' }} onClick={handleProcess} disabled={processing}>
                                {processing ? 'Processing…' : 'CONFIRM'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm delete */}
            {confirmDelete && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 380, boxShadow: 'var(--shadow-accent)' }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Delete Draft #{confirmDelete.id}?</h3>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 20 }}>This action cannot be undone.</p>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                            <button className="btn-ghost" onClick={() => setConfirmDelete(null)} disabled={processing}>Cancel</button>
                            <button className="btn-danger" onClick={() => handleDelete(confirmDelete.id)} disabled={processing}>
                                {processing ? 'Deleting…' : 'DELETE'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CurriculumMapping;
