import React, { useState, useEffect, useCallback } from 'react';
import { useSecretaryRefresh } from '../layout/SecretaryLayout';
import { secretaryApi } from '../api/secretaryApi';
import { useToast } from '../../../context/ToastContext';
import PageHeader from '../../../components/ui/PageHeader';
import StatusBadge from '../../../components/ui/StatusBadge';
import EmptyState from '../../../components/ui/EmptyState';

const ORG_VARIANT = { PENDING: 'warning', RECOGNIZED: 'normal', SUSPENDED: 'critical', DISSOLVED: 'muted' };
const BOOKING_VARIANT = { PENDING: 'warning', APPROVED: 'normal', REJECTED: 'critical', CANCELLED: 'muted' };
const ORG_STATUS_OPTIONS     = ['ALL', 'PENDING', 'RECOGNIZED', 'SUSPENDED', 'DISSOLVED'];
const BOOKING_STATUS_OPTIONS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];
const FACILITY_TYPE_OPTIONS  = ['ROOM', 'LAB', 'AUDITORIUM', 'GYMNASIUM', 'FIELD', 'OTHER'];

const EMPTY_FACILITY = { facility_code: '', facility_name: '', facility_type: 'ROOM', building: '', capacity: '', description: '', is_bookable: true };

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

const OrgsAndFacilities = () => {
    const { toast } = useToast();
    const tick = useSecretaryRefresh();

    const [mainTab, setMainTab] = useState('orgs');

    // Orgs state
    const [orgs,       setOrgs]       = useState([]);
    const [orgsFilter, setOrgsFilter] = useState('ALL');
    const [orgsLoading, setOrgsLoading] = useState(true);
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [orgAction,   setOrgAction]   = useState('RECOGNIZE');
    const [orgNotes,    setOrgNotes]    = useState('');

    // Bookings state
    const [bookings,       setBookings]       = useState([]);
    const [bookingsFilter, setBookingsFilter] = useState('ALL');
    const [bookingsLoading, setBookingsLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [bookingDecision, setBookingDecision] = useState('APPROVE');
    const [bookingNotes,    setBookingNotes]    = useState('');
    const [bookingRejectReason, setBookingRejectReason] = useState('');

    // Facilities state
    const [facilities,       setFacilities]       = useState([]);
    const [facilitiesLoading, setFacilitiesLoading] = useState(true);
    const [facilityModal,    setFacilityModal]    = useState(null); // null | 'add' | 'edit'
    const [facilityForm,     setFacilityForm]     = useState({ ...EMPTY_FACILITY });
    const [editingFacility,  setEditingFacility]  = useState(null);

    const [processing, setProcessing] = useState(false);

    const loadFacilities = useCallback(async () => {
        setFacilitiesLoading(true);
        try {
            const data = await secretaryApi.fetchFacilities();
            setFacilities(data);
        } catch {
            toast.error('Failed to load facilities.');
        } finally {
            setFacilitiesLoading(false);
        }
    }, []);

    const loadOrgs = useCallback(async () => {
        setOrgsLoading(true);
        try {
            const data = await secretaryApi.fetchOrganizations(orgsFilter === 'ALL' ? null : orgsFilter);
            setOrgs(data);
        } catch {
            toast.error('Failed to load organizations.');
        } finally {
            setOrgsLoading(false);
        }
    }, [orgsFilter]);

    const loadBookings = useCallback(async () => {
        setBookingsLoading(true);
        try {
            const data = await secretaryApi.fetchBookings(bookingsFilter === 'ALL' ? null : bookingsFilter);
            setBookings(data);
        } catch {
            toast.error('Failed to load bookings.');
        } finally {
            setBookingsLoading(false);
        }
    }, [bookingsFilter]);

    useEffect(() => { loadOrgs();       }, [loadOrgs,       tick]);
    useEffect(() => { loadBookings();   }, [loadBookings,   tick]);
    useEffect(() => { loadFacilities(); }, [loadFacilities, tick]);

    const handleOrgProcess = async () => {
        if (!selectedOrg) return;
        setProcessing(true);
        try {
            await secretaryApi.processOrgRegistration(selectedOrg.id, { action: orgAction, secretary_notes: orgNotes });
            toast.success(`Organization ${orgAction.toLowerCase()}d.`);
            setSelectedOrg(null); setOrgNotes('');
            loadOrgs();
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Action failed.');
        } finally {
            setProcessing(false);
        }
    };

    const openAddFacility = () => {
        setFacilityForm({ ...EMPTY_FACILITY });
        setEditingFacility(null);
        setFacilityModal('add');
    };

    const openEditFacility = (f) => {
        setFacilityForm({
            facility_code: f.facility_code ?? '',
            facility_name: f.facility_name ?? '',
            facility_type: f.facility_type ?? 'ROOM',
            building:      f.building ?? '',
            capacity:      f.capacity ?? '',
            description:   f.description ?? '',
            is_bookable:   f.is_bookable ?? true,
        });
        setEditingFacility(f);
        setFacilityModal('edit');
    };

    const handleFacilitySave = async () => {
        const payload = {
            ...facilityForm,
            capacity: facilityForm.capacity !== '' ? Number(facilityForm.capacity) : null,
        };
        if (!payload.facility_code.trim() || !payload.facility_name.trim()) {
            toast.error('Facility code and name are required.');
            return;
        }
        setProcessing(true);
        try {
            if (facilityModal === 'add') {
                await secretaryApi.addFacility(payload);
                toast.success('Facility added.');
            } else {
                await secretaryApi.updateFacility(editingFacility.id, payload);
                toast.success('Facility updated.');
            }
            setFacilityModal(null);
            loadFacilities();
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Save failed.');
        } finally {
            setProcessing(false);
        }
    };

    const handleBookingProcess = async () => {
        if (!selectedBooking) return;
        setProcessing(true);
        try {
            await secretaryApi.processBooking(selectedBooking.id, {
                decision: bookingDecision,
                secretary_notes: bookingNotes,
                rejection_reason: bookingDecision === 'REJECT' ? bookingRejectReason : undefined,
            });
            toast.success(`Booking ${bookingDecision === 'APPROVE' ? 'approved' : 'rejected'}.`);
            setSelectedBooking(null); setBookingNotes(''); setBookingRejectReason('');
            loadBookings();
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Action failed.');
        } finally {
            setProcessing(false);
        }
    };

    const FilterTabs = ({ options, value, onChange }) => (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {options.map(o => {
                const active = value === o;
                return (
                    <button key={o} onClick={() => onChange(o)} style={{
                        padding: '5px 12px', borderRadius: 100, cursor: 'pointer', transition: 'all 0.15s',
                        border: '1px solid var(--border-default)',
                        background: active ? 'var(--accent)' : 'var(--bg-surface)',
                        color: active ? '#fff' : 'var(--text-secondary)',
                        fontFamily: 'var(--font-code)', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.05em',
                        boxShadow: active ? 'var(--shadow-accent)' : 'none',
                    }}>{o}</button>
                );
            })}
        </div>
    );

    const modalBase = { position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 };
    const modalCard = { background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 480, boxShadow: 'var(--shadow-accent)' };
    const textarea  = { width: '100%', boxSizing: 'border-box', background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontFamily: 'var(--font-code)', fontSize: '0.78rem', outline: 'none', resize: 'vertical' };
    const selectEl  = { width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 8, color: 'var(--text-primary)', fontFamily: 'var(--font-code)', fontSize: '0.78rem', marginBottom: 14 };
    const label     = { display: 'block', fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, fontFamily: 'var(--font-code)' };

    const inputStyle = { width: '100%', boxSizing: 'border-box', padding: '9px 12px', background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 8, color: 'var(--text-primary)', fontFamily: 'var(--font-code)', fontSize: '0.78rem', outline: 'none' };
    const checkboxLabel = { display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-code)', fontSize: '0.78rem', color: 'var(--text-primary)', cursor: 'pointer' };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 24 }}>
            <PageHeader title="Orgs & Facilities" subtitle="Manage student organization recognition, facility rooms, and booking requests" />

            {/* Main tab: Orgs / Bookings / Facilities */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button style={tabStyle(mainTab === 'orgs')}       onClick={() => setMainTab('orgs')}>
                    ORGANIZATIONS {orgs.filter(o => o.status === 'PENDING').length > 0 ? `(${orgs.filter(o => o.status === 'PENDING').length} pending)` : ''}
                </button>
                <button style={tabStyle(mainTab === 'bookings')}   onClick={() => setMainTab('bookings')}>
                    BOOKINGS {bookings.filter(b => b.status === 'PENDING').length > 0 ? `(${bookings.filter(b => b.status === 'PENDING').length} pending)` : ''}
                </button>
                <button style={tabStyle(mainTab === 'facilities')} onClick={() => setMainTab('facilities')}>
                    FACILITIES ({facilities.length})
                </button>
            </div>

            {/* ── Organizations tab ── */}
            {mainTab === 'orgs' && (
                <>
                    <FilterTabs options={ORG_STATUS_OPTIONS} value={orgsFilter} onChange={setOrgsFilter} />
                    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 16, overflow: 'hidden' }}>
                        {orgsLoading ? (
                            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-code)', fontSize: '0.78rem' }}>Loading…</div>
                        ) : orgs.length === 0 ? (
                            <EmptyState title="No organizations" subtitle="No organizations match the current filter." />
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-code)', fontSize: '0.78rem' }}>
                                <THead cols={['Org Name', 'Acronym', 'Type', 'Status', 'Submitted', 'Action']} />
                                <tbody>
                                    {orgs.map((o, i) => (
                                        <tr key={o.id} style={{ borderBottom: i < orgs.length - 1 ? '1px solid var(--border-default)' : 'none' }}>
                                            <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontWeight: 600 }}>{o.org_name}</td>
                                            <td style={{ padding: '12px 16px', color: 'var(--accent)' }}>{o.org_acronym ?? '—'}</td>
                                            <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{o.org_type}</td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <StatusBadge variant={ORG_VARIANT[o.status] ?? 'muted'} label={o.status} showDot={false} />
                                            </td>
                                            <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                                                {o.created_at ? new Date(o.created_at).toLocaleDateString() : '—'}
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                {o.status === 'PENDING' && (
                                                    <button className="btn-primary" style={{ fontSize: '0.6rem', padding: '5px 12px', background: 'var(--accent)', borderColor: 'var(--accent)' }}
                                                        onClick={() => { setSelectedOrg(o); setOrgAction('RECOGNIZE'); setOrgNotes(''); }}>
                                                        PROCESS
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            )}

            {/* ── Bookings tab ── */}
            {mainTab === 'bookings' && (
                <>
                    <FilterTabs options={BOOKING_STATUS_OPTIONS} value={bookingsFilter} onChange={setBookingsFilter} />
                    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 16, overflow: 'hidden' }}>
                        {bookingsLoading ? (
                            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-code)', fontSize: '0.78rem' }}>Loading…</div>
                        ) : bookings.length === 0 ? (
                            <EmptyState title="No bookings" subtitle="No facility booking requests match the filter." />
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-code)', fontSize: '0.78rem' }}>
                                <THead cols={['ID', 'Event', 'Facility', 'Date', 'Time', 'Status', 'Action']} />
                                <tbody>
                                    {bookings.map((b, i) => (
                                        <tr key={b.id} style={{ borderBottom: i < bookings.length - 1 ? '1px solid var(--border-default)' : 'none' }}>
                                            <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>#{b.id}</td>
                                            <td style={{ padding: '12px 16px', color: 'var(--text-primary)', maxWidth: 180 }}>
                                                <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{b.event_title}</span>
                                            </td>
                                            <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{b.facility_id}</td>
                                            <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                                                {b.booking_date ? new Date(b.booking_date).toLocaleDateString() : '—'}
                                            </td>
                                            <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.68rem' }}>
                                                {b.time_start ? new Date(b.time_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                                                {' – '}
                                                {b.time_end ? new Date(b.time_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <StatusBadge variant={BOOKING_VARIANT[b.status] ?? 'muted'} label={b.status} showDot={false} />
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                {b.status === 'PENDING' && (
                                                    <button className="btn-primary" style={{ fontSize: '0.6rem', padding: '5px 12px', background: 'var(--accent)', borderColor: 'var(--accent)' }}
                                                        onClick={() => { setSelectedBooking(b); setBookingDecision('APPROVE'); setBookingNotes(''); setBookingRejectReason(''); }}>
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
                </>
            )}

            {/* ── Facilities tab ── */}
            {mainTab === 'facilities' && (
                <>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            className="btn-primary"
                            style={{ background: 'var(--accent)', borderColor: 'var(--accent)', fontSize: '0.68rem', padding: '8px 18px' }}
                            onClick={openAddFacility}
                        >
                            + ADD FACILITY
                        </button>
                    </div>
                    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 16, overflow: 'hidden' }}>
                        {facilitiesLoading ? (
                            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-code)', fontSize: '0.78rem' }}>Loading…</div>
                        ) : facilities.length === 0 ? (
                            <EmptyState title="No facilities" subtitle="Add a room or facility to get started." />
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-code)', fontSize: '0.78rem' }}>
                                <THead cols={['Code', 'Name', 'Type', 'Building', 'Capacity', 'Bookable', 'Action']} />
                                <tbody>
                                    {facilities.map((f, i) => (
                                        <tr key={f.id} style={{ borderBottom: i < facilities.length - 1 ? '1px solid var(--border-default)' : 'none' }}>
                                            <td style={{ padding: '12px 16px', color: 'var(--accent)', fontWeight: 700 }}>{f.facility_code}</td>
                                            <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontWeight: 600 }}>{f.facility_name}</td>
                                            <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{f.facility_type}</td>
                                            <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{f.building || '—'}</td>
                                            <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', textAlign: 'center' }}>{f.capacity ?? '—'}</td>
                                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                <StatusBadge variant={f.is_bookable ? 'normal' : 'muted'} label={f.is_bookable ? 'YES' : 'NO'} showDot={false} />
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <button
                                                    className="btn-ghost"
                                                    style={{ fontSize: '0.6rem', padding: '5px 12px' }}
                                                    onClick={() => openEditFacility(f)}
                                                >
                                                    EDIT
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            )}

            {/* ── Facility add/edit modal ── */}
            {facilityModal && (
                <div style={modalBase}>
                    <div style={{ ...modalCard, maxWidth: 520 }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
                            {facilityModal === 'add' ? 'Add Facility' : 'Edit Facility'}
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                            <div>
                                <label style={label}>Facility Code *</label>
                                <input value={facilityForm.facility_code} onChange={e => setFacilityForm(f => ({ ...f, facility_code: e.target.value }))}
                                    placeholder="e.g. LAB-301" style={inputStyle}
                                    onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
                                    onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; }}
                                />
                            </div>
                            <div>
                                <label style={label}>Type</label>
                                <select value={facilityForm.facility_type} onChange={e => setFacilityForm(f => ({ ...f, facility_type: e.target.value }))}
                                    style={{ ...inputStyle, cursor: 'pointer' }}>
                                    {FACILITY_TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>

                        <div style={{ marginBottom: 12 }}>
                            <label style={label}>Facility Name *</label>
                            <input value={facilityForm.facility_name} onChange={e => setFacilityForm(f => ({ ...f, facility_name: e.target.value }))}
                                placeholder="e.g. Computer Laboratory 301" style={inputStyle}
                                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
                                onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                            <div>
                                <label style={label}>Building</label>
                                <input value={facilityForm.building} onChange={e => setFacilityForm(f => ({ ...f, building: e.target.value }))}
                                    placeholder="e.g. CCIS Building" style={inputStyle}
                                    onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
                                    onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; }}
                                />
                            </div>
                            <div>
                                <label style={label}>Capacity</label>
                                <input type="number" min={1} value={facilityForm.capacity} onChange={e => setFacilityForm(f => ({ ...f, capacity: e.target.value }))}
                                    placeholder="e.g. 40" style={inputStyle}
                                    onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
                                    onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: 12 }}>
                            <label style={label}>Description</label>
                            <textarea value={facilityForm.description} onChange={e => setFacilityForm(f => ({ ...f, description: e.target.value }))}
                                rows={2} placeholder="Optional notes about this facility…" style={{ ...textarea, marginBottom: 0 }}
                                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
                                onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; }}
                            />
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={facilityForm.is_bookable}
                                    onChange={e => setFacilityForm(f => ({ ...f, is_bookable: e.target.checked }))}
                                    style={{ width: 16, height: 16, accentColor: 'var(--accent)', cursor: 'pointer' }}
                                />
                                Allow facility bookings
                            </label>
                        </div>

                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                            <button className="btn-ghost" onClick={() => setFacilityModal(null)} disabled={processing}>Cancel</button>
                            <button className="btn-primary" style={{ background: 'var(--accent)', borderColor: 'var(--accent)' }}
                                onClick={handleFacilitySave} disabled={processing}>
                                {processing ? 'Saving…' : facilityModal === 'add' ? 'ADD FACILITY' : 'SAVE CHANGES'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Org process modal */}
            {selectedOrg && (
                <div style={modalBase}>
                    <div style={modalCard}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{selectedOrg.org_name}</h3>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 20, fontFamily: 'var(--font-code)' }}>{selectedOrg.org_type} · Status: {selectedOrg.status}</p>
                        <label style={label}>Action</label>
                        <select value={orgAction} onChange={e => setOrgAction(e.target.value)} style={selectEl}>
                            <option value="RECOGNIZE">RECOGNIZE</option>
                            <option value="SUSPEND">SUSPEND</option>
                            <option value="DISSOLVE">DISSOLVE</option>
                        </select>
                        <label style={label}>Secretary Notes</label>
                        <textarea value={orgNotes} onChange={e => setOrgNotes(e.target.value)} rows={3} placeholder="Optional notes…" style={textarea}
                            onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
                            onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; }}
                        />
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                            <button className="btn-ghost" onClick={() => setSelectedOrg(null)} disabled={processing}>Cancel</button>
                            <button className="btn-primary" style={{ background: 'var(--accent)', borderColor: 'var(--accent)' }} onClick={handleOrgProcess} disabled={processing}>
                                {processing ? 'Processing…' : 'CONFIRM'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Booking decide modal */}
            {selectedBooking && (
                <div style={modalBase}>
                    <div style={modalCard}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{selectedBooking.event_title}</h3>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 20, fontFamily: 'var(--font-code)' }}>
                            Facility #{selectedBooking.facility_id} · {selectedBooking.booking_date}
                        </p>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                            <button onClick={() => setBookingDecision('APPROVE')} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border-default)', background: bookingDecision === 'APPROVE' ? 'var(--accent)' : 'transparent', color: bookingDecision === 'APPROVE' ? '#fff' : 'var(--text-secondary)', fontFamily: 'var(--font-code)', fontSize: '0.68rem', cursor: 'pointer' }}>APPROVE</button>
                            <button onClick={() => setBookingDecision('REJECT')} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--color-danger)', background: bookingDecision === 'REJECT' ? 'var(--color-danger)' : 'transparent', color: bookingDecision === 'REJECT' ? '#fff' : 'var(--color-danger)', fontFamily: 'var(--font-code)', fontSize: '0.68rem', cursor: 'pointer' }}>REJECT</button>
                        </div>
                        {bookingDecision === 'REJECT' && (
                            <>
                                <label style={label}>Rejection Reason</label>
                                <textarea value={bookingRejectReason} onChange={e => setBookingRejectReason(e.target.value)} rows={2} placeholder="Required for rejection…" style={{ ...textarea, marginBottom: 12 }}
                                    onFocus={e => { e.target.style.borderColor = 'var(--color-danger)'; }}
                                    onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; }}
                                />
                            </>
                        )}
                        <label style={label}>Notes</label>
                        <textarea value={bookingNotes} onChange={e => setBookingNotes(e.target.value)} rows={2} placeholder="Optional notes…" style={textarea}
                            onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
                            onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; }}
                        />
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                            <button className="btn-ghost" onClick={() => setSelectedBooking(null)} disabled={processing}>Cancel</button>
                            <button
                                className={bookingDecision === 'REJECT' ? 'btn-danger' : 'btn-primary'}
                                style={bookingDecision === 'APPROVE' ? { background: 'var(--accent)', borderColor: 'var(--accent)' } : {}}
                                onClick={handleBookingProcess}
                                disabled={processing || (bookingDecision === 'REJECT' && !bookingRejectReason.trim())}
                            >
                                {processing ? 'Processing…' : bookingDecision === 'APPROVE' ? 'APPROVE' : 'REJECT'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrgsAndFacilities;
