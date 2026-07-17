import React, { useState, useEffect, useCallback } from 'react';
import { useSecretaryRefresh } from '../layout/SecretaryLayout';
import { secretaryApi } from '../api/secretaryApi';
import { useToast } from '../../../context/ToastContext';
import PageHeader from '../../../components/ui/PageHeader';
import StatusBadge from '../../../components/ui/StatusBadge';
import EmptyState from '../../../components/ui/EmptyState';

const STATUS_OPTIONS = ['ALL', 'PENDING', 'RELEASED'];
const COR_VARIANT = { PENDING: 'warning', RELEASED: 'normal' };

const tabStyle = (active) => ({
    padding: '8px 20px', borderRadius: 100,
    border: '1px solid var(--border-default)',
    background: active ? 'var(--accent)' : 'var(--bg-surface)',
    color: active ? '#fff' : 'var(--text-secondary)',
    fontFamily: 'var(--font-code)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.05em',
    cursor: 'pointer', transition: 'all 0.15s',
    boxShadow: active ? 'var(--shadow-accent)' : 'none',
});

const THead = ({ cols }) => (
    <thead>
        <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
            {cols.map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{h}</th>
            ))}
        </tr>
    </thead>
);

const CORRelease = () => {
    const { toast } = useToast();
    const tick = useSecretaryRefresh();

    const [statusFilter, setStatusFilter] = useState('PENDING');
    const [queue, setQueue]               = useState([]);
    const [loading, setLoading]           = useState(true);
    const [selected, setSelected]         = useState(null);
    const [notes, setNotes]               = useState('');
    const [processing, setProcessing]     = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await secretaryApi.fetchCORQueue(statusFilter === 'ALL' ? null : statusFilter);
            setQueue(data);
        } catch {
            toast.error('Failed to load COR queue.');
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => { load(); }, [load, tick]);

    const handleRelease = async () => {
        if (!selected) return;
        setProcessing(true);
        try {
            await secretaryApi.releaseCOR(selected.request_id, { secretary_notes: notes || undefined });
            toast.success(`COR released for ${selected.student_name ?? `request #${selected.request_id}`}.`);
            setSelected(null);
            setNotes('');
            load();
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to release COR.');
        } finally {
            setProcessing(false);
        }
    };

    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
    const fmtSem  = (yr, sem) => `${yr}-${yr + 1} Sem ${sem}`;

    const modalBase = { position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 };
    const modalCard = { background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 480, boxShadow: 'var(--shadow-accent)' };
    const label     = { display: 'block', fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, fontFamily: 'var(--font-code)' };
    const textarea  = { width: '100%', boxSizing: 'border-box', background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontFamily: 'var(--font-code)', fontSize: '0.78rem', outline: 'none', resize: 'vertical' };

    const pendingCount = queue.filter(q => q.cor_release_status === 'PENDING').length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 24 }}>
            <PageHeader
                title="COR Release"
                subtitle="Verify and release Certificates of Registration for admin-approved enrollments"
            />

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 12 }}>
                {[
                    { label: 'Pending Release', value: queue.filter(q => q.cor_release_status === 'PENDING').length, color: 'var(--color-warning)' },
                    { label: 'Released',         value: queue.filter(q => q.cor_release_status === 'RELEASED').length, color: 'var(--accent)' },
                    { label: 'Total Approved',   value: queue.length, color: 'var(--text-secondary)' },
                ].map(s => (
                    <div key={s.label} style={{ flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 12, padding: '14px 18px' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                        <div style={{ fontFamily: 'var(--font-code)', fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 8 }}>
                {STATUS_OPTIONS.map(o => (
                    <button key={o} onClick={() => setStatusFilter(o)} style={tabStyle(statusFilter === o)}>
                        {o}{o === 'PENDING' && pendingCount > 0 ? ` (${pendingCount})` : ''}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 16, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-code)', fontSize: '0.78rem' }}>Loading…</div>
                ) : queue.length === 0 ? (
                    <EmptyState title="No records" subtitle="No approved enrollments match this COR status." />
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-code)', fontSize: '0.78rem' }}>
                        <THead cols={['Student', 'Student No.', 'Period', 'Enrolled', 'COR Status', 'Released At', 'Action']} />
                        <tbody>
                            {queue.map((item, i) => (
                                <tr key={item.request_id} style={{ borderBottom: i < queue.length - 1 ? '1px solid var(--border-default)' : 'none' }}>
                                    <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontWeight: 600 }}>
                                        {item.student_name ?? `Student #${item.student_account_id}`}
                                    </td>
                                    <td style={{ padding: '12px 16px', color: 'var(--accent)' }}>
                                        {item.student_number ?? '—'}
                                    </td>
                                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                                        {item.target_year_level ? fmtSem(item.target_year_level, item.target_semester) : '—'}
                                    </td>
                                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                                        {fmtDate(item.date_submitted)}
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <StatusBadge
                                            variant={COR_VARIANT[item.cor_release_status] ?? 'muted'}
                                            label={item.cor_release_status}
                                            showDot={false}
                                        />
                                    </td>
                                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.68rem' }}>
                                        {item.cor_released_at ? fmtDate(item.cor_released_at) : '—'}
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        {item.cor_release_status === 'PENDING' && (
                                            <button
                                                className="btn-primary"
                                                style={{ fontSize: '0.6rem', padding: '5px 12px', background: 'var(--accent)', borderColor: 'var(--accent)' }}
                                                onClick={() => { setSelected(item); setNotes(''); }}
                                            >
                                                RELEASE
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Release confirmation modal */}
            {selected && (
                <div style={modalBase}>
                    <div style={modalCard}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                            Release COR
                        </h3>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 20, fontFamily: 'var(--font-code)' }}>
                            {selected.student_name ?? `Student #${selected.student_account_id}`}
                            {selected.student_number ? ` · ${selected.student_number}` : ''}
                        </p>

                        <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '12px 16px', marginBottom: 18 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
                                {[
                                    ['Year Level', selected.target_year_level ?? '—'],
                                    ['Semester',   selected.target_semester ?? '—'],
                                    ['Submitted',  fmtDate(selected.date_submitted)],
                                    ['Subjects',   Array.isArray(selected.extracted_subjects) ? selected.extracted_subjects.length : '—'],
                                ].map(([k, v]) => (
                                    <div key={k}>
                                        <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2, fontFamily: 'var(--font-code)' }}>{k}</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontFamily: 'var(--font-code)' }}>{v}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <label style={label}>Secretary Notes (optional)</label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            rows={3}
                            placeholder="Any notes for the record…"
                            style={textarea}
                            onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
                            onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; }}
                        />

                        <p style={{ fontSize: '0.68rem', color: 'var(--color-warning)', fontFamily: 'var(--font-code)', marginTop: 12, marginBottom: 0 }}>
                            Releasing marks this COR as officially distributed. This action cannot be undone.
                        </p>

                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                            <button className="btn-ghost" onClick={() => setSelected(null)} disabled={processing}>Cancel</button>
                            <button
                                className="btn-primary"
                                style={{ background: 'var(--accent)', borderColor: 'var(--accent)' }}
                                onClick={handleRelease}
                                disabled={processing}
                            >
                                {processing ? 'Releasing…' : 'CONFIRM RELEASE'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CORRelease;
