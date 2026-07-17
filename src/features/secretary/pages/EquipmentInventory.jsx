import React, { useState, useEffect, useCallback } from 'react';
import { useSecretaryRefresh } from '../layout/SecretaryLayout';
import { secretaryApi } from '../api/secretaryApi';
import { useToast } from '../../../context/ToastContext';
import PageHeader from '../../../components/ui/PageHeader';
import StatusBadge from '../../../components/ui/StatusBadge';
import EmptyState from '../../../components/ui/EmptyState';

const CHECKOUT_VARIANT = { CHECKED_OUT: 'warning', OVERDUE: 'critical', RETURNED: 'normal' };

const tabStyle = (active) => ({
    padding: '8px 20px', borderRadius: 100,
    border: '1px solid var(--border-default)',
    background: active ? 'var(--accent)' : 'var(--bg-surface)',
    color: active ? '#fff' : 'var(--text-secondary)',
    fontFamily: 'var(--font-code)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.05em',
    cursor: 'pointer', transition: 'all 0.15s',
    boxShadow: active ? 'var(--shadow-accent)' : 'none',
});

const EquipmentInventory = () => {
    const { toast } = useToast();
    const tick = useSecretaryRefresh();

    const [tab,       setTab]       = useState('inventory');
    const [equipment, setEquipment] = useState([]);
    const [checkouts, setCheckouts] = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [returnId,  setReturnId]  = useState(null);
    const [returnNotes, setReturnNotes] = useState('');
    const [condition, setCondition] = useState('GOOD');
    const [processing, setProcessing] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [eq, co] = await Promise.all([
                secretaryApi.fetchEquipment(),
                secretaryApi.fetchActiveCheckouts(),
            ]);
            setEquipment(eq);
            setCheckouts(co);
        } catch {
            toast.error('Failed to load equipment data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load, tick]);

    const handleReturn = async () => {
        if (!returnId) return;
        setProcessing(true);
        try {
            await secretaryApi.returnEquipment(returnId, { returned_condition: condition, secretary_notes: returnNotes });
            toast.success('Equipment marked as returned.');
            setReturnId(null); setReturnNotes(''); setCondition('GOOD');
            load();
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Return failed.');
        } finally {
            setProcessing(false);
        }
    };

    const THead = ({ cols }) => (
        <thead>
            <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                {cols.map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{h}</th>
                ))}
            </tr>
        </thead>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 24 }}>
            <PageHeader
                title="Equipment Inventory"
                subtitle={`${equipment.length} items · ${checkouts.length} active checkout${checkouts.length !== 1 ? 's' : ''}`}
            />

            <div style={{ display: 'flex', gap: 8 }}>
                <button style={tabStyle(tab === 'inventory')} onClick={() => setTab('inventory')}>INVENTORY</button>
                <button style={tabStyle(tab === 'checkouts')} onClick={() => setTab('checkouts')}>
                    ACTIVE CHECKOUTS {checkouts.length > 0 ? `(${checkouts.length})` : ''}
                </button>
            </div>

            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 16, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-code)', fontSize: '0.78rem' }}>Loading…</div>
                ) : tab === 'inventory' ? (
                    equipment.length === 0 ? (
                        <EmptyState title="No equipment" subtitle="No equipment items in the inventory." />
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-code)', fontSize: '0.78rem' }}>
                            <THead cols={['Asset Tag', 'Name', 'Category', 'Condition', 'Available', 'Total']} />
                            <tbody>
                                {equipment.map((e, i) => (
                                    <tr key={e.id} style={{ borderBottom: i < equipment.length - 1 ? '1px solid var(--border-default)' : 'none' }}>
                                        <td style={{ padding: '12px 16px', color: 'var(--accent)', fontWeight: 600 }}>{e.asset_tag}</td>
                                        <td style={{ padding: '12px 16px', color: 'var(--text-primary)' }}>{e.equipment_name}</td>
                                        <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{e.category ?? '—'}</td>
                                        <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{e.condition ?? '—'}</td>
                                        <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontWeight: 700 }}>{e.quantity_available ?? '—'}</td>
                                        <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{e.quantity_total ?? '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                ) : (
                    checkouts.length === 0 ? (
                        <EmptyState title="No active checkouts" subtitle="All equipment is currently in the inventory." />
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-code)', fontSize: '0.78rem' }}>
                            <THead cols={['ID', 'Equipment', 'Borrower', 'Status', 'Due Date', 'Action']} />
                            <tbody>
                                {checkouts.map((c, i) => (
                                    <tr key={c.id} style={{ borderBottom: i < checkouts.length - 1 ? '1px solid var(--border-default)' : 'none' }}>
                                        <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>#{c.id}</td>
                                        <td style={{ padding: '12px 16px', color: 'var(--text-primary)' }}>{c.equipment_id}</td>
                                        <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{c.borrower_account_id}</td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <StatusBadge variant={CHECKOUT_VARIANT[c.status] ?? 'muted'} label={c.status} showDot={false} />
                                        </td>
                                        <td style={{ padding: '12px 16px', color: c.status === 'OVERDUE' ? 'var(--color-danger)' : 'var(--text-muted)' }}>
                                            {c.expected_return_at ? new Date(c.expected_return_at).toLocaleDateString() : '—'}
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <button className="btn-primary" style={{ fontSize: '0.6rem', padding: '5px 12px', background: 'var(--accent)', borderColor: 'var(--accent)' }}
                                                onClick={() => { setReturnId(c.id); setReturnNotes(''); setCondition('GOOD'); }}>
                                                MARK RETURNED
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                )}
            </div>

            {/* Return modal */}
            {returnId && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 420, boxShadow: 'var(--shadow-accent)' }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
                            Record Equipment Return
                        </h3>
                        <label style={{ display: 'block', fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, fontFamily: 'var(--font-code)' }}>Returned Condition</label>
                        <select value={condition} onChange={e => setCondition(e.target.value)}
                            style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 8, color: 'var(--text-primary)', fontFamily: 'var(--font-code)', fontSize: '0.78rem', marginBottom: 14 }}>
                            <option value="GOOD">GOOD</option>
                            <option value="FAIR">FAIR</option>
                            <option value="DAMAGED">DAMAGED</option>
                            <option value="LOST">LOST</option>
                        </select>
                        <textarea value={returnNotes} onChange={e => setReturnNotes(e.target.value)} rows={3} placeholder="Return notes…"
                            style={{ width: '100%', boxSizing: 'border-box', background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontFamily: 'var(--font-code)', fontSize: '0.78rem', outline: 'none', resize: 'vertical' }}
                            onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
                            onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; }}
                        />
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                            <button className="btn-ghost" onClick={() => setReturnId(null)} disabled={processing}>Cancel</button>
                            <button className="btn-primary" style={{ background: 'var(--accent)', borderColor: 'var(--accent)' }} onClick={handleReturn} disabled={processing}>
                                {processing ? 'Saving…' : 'CONFIRM RETURN'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EquipmentInventory;
