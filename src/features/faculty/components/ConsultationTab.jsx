import React, { useState, useEffect, useMemo, useRef } from 'react';
import { facultyApi } from '../api/facultyApi';
import { useToast } from '../../../context/ToastContext';

const TODAY_STR = new Date().toISOString().split('T')[0];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

function buildGrid(year, month) {
    const firstDay = new Date(year, month, 1).getDay();
    const total = new Date(year, month + 1, 0).getDate();
    const grid = [];
    for (let i = 0; i < firstDay; i++) grid.push(null);
    for (let d = 1; d <= total; d++) grid.push(d);
    while (grid.length % 7 !== 0) grid.push(null);
    return grid;
}

function toDateStr(y, m, d) {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function fmtShort(str) {
    return new Date(str + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric',
    });
}

// ── Shared input style ───────────────────────────────────────────────────────
const inpStyle = {
    width: '100%', boxSizing: 'border-box',
    padding: '9px 12px', borderRadius: 9,
    border: '1px solid var(--border-default)',
    background: 'var(--bg-input)', color: 'var(--text-primary)',
    fontSize: 13, fontFamily: 'var(--font-body)', outline: 'none',
};

// ── Quick-add Popover (anchored to day cell) ─────────────────────────────────
const QuickAddPopover = ({ date, rect, startTime, endTime, onChangeStart, onChangeEnd, onSave, onClose }) => {
    const ref = useRef(null);

    useEffect(() => {
        const onMouse = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
        const onKey = e => { if (e.key === 'Escape') onClose(); };
        const t = setTimeout(() => document.addEventListener('mousedown', onMouse), 80);
        document.addEventListener('keydown', onKey);
        return () => { clearTimeout(t); document.removeEventListener('mousedown', onMouse); document.removeEventListener('keydown', onKey); };
    }, [onClose]);

    const W = 268, H = 192;
    let left = rect.left;
    let top = rect.bottom + 8;
    if (left + W > window.innerWidth - 12) left = window.innerWidth - W - 12;
    if (top + H > window.innerHeight - 12) top = rect.top - H - 8;
    if (left < 12) left = 12;
    if (top < 12) top = 12;

    return (
        <div
            ref={ref}
            className="fade-in"
            style={{
                position: 'fixed', left, top, width: W, zIndex: 1100,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-accent)',
                borderRadius: 16,
                boxShadow: '0 24px 64px rgba(0,0,0,0.18), 0 0 0 1px rgba(186,151,49,0.15)',
                overflow: 'hidden',
            }}
        >
            <div style={{
                background: 'linear-gradient(135deg, var(--accent) 0%, #9A7D28 100%)',
                padding: '12px 14px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div>
                    <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: 1.5, fontFamily: 'var(--font-code)' }}>
                        New Availability Slot
                    </p>
                    <p style={{ margin: '3px 0 0', fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)' }}>
                        {fmtShort(date)}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    style={{ width: 22, height: 22, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.18)', cursor: 'pointer', color: '#fff', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, flexShrink: 0 }}
                >×</button>
            </div>
            <div style={{ padding: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                    {[['Start', startTime, onChangeStart], ['End', endTime, onChangeEnd]].map(([label, val, fn]) => (
                        <div key={label}>
                            <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 5 }}>{label}</label>
                            <input
                                type="time"
                                value={val}
                                onChange={e => fn(e.target.value)}
                                style={inpStyle}
                                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                onBlur={e => e.target.style.borderColor = 'var(--border-default)'}
                            />
                        </div>
                    ))}
                </div>
                <button
                    onClick={onSave}
                    style={{
                        width: '100%', padding: '10px 0', borderRadius: 9,
                        background: 'var(--accent)', color: '#fff', border: 'none',
                        fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        fontFamily: 'var(--font-display)',
                        boxShadow: '0 4px 14px rgba(186,151,49,0.32)',
                        letterSpacing: 0.3,
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                    Confirm Slot
                </button>
            </div>
        </div>
    );
};

// ── Full Slot Modal (add with date / edit existing) ──────────────────────────
const SlotModal = ({ slot, onSave, onDelete, onClose }) => {
    const isEdit = !!slot;
    const [form, setForm] = useState(
        isEdit
            ? { available_date: slot.available_date, start_time: slot.start_time, end_time: slot.end_time }
            : { available_date: TODAY_STR, start_time: '08:00', end_time: '09:00' }
    );

    return (
        <div
            style={{ position: 'fixed', inset: 0, zIndex: 1200, background: 'var(--bg-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={onClose}
        >
            <div
                onClick={e => e.stopPropagation()}
                className="fade-in"
                style={{ background: 'var(--bg-elevated)', borderRadius: 20, width: '100%', maxWidth: 400, overflow: 'hidden', boxShadow: 'var(--shadow-modal)', border: '1px solid var(--border-default)' }}
            >
                {/* Header */}
                <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                            {isEdit ? 'Edit Availability Slot' : 'New Availability Slot'}
                        </h3>
                        {isEdit && (
                            <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                                {fmtShort(slot.available_date)}
                            </p>
                        )}
                    </div>
                    <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'var(--bg-depth)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>×</button>
                </div>

                {/* Body */}
                <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 15 }}>
                    <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>Date</label>
                        <input
                            type="date"
                            value={form.available_date}
                            onChange={e => setForm(f => ({ ...f, available_date: e.target.value }))}
                            style={inpStyle}
                            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                            onBlur={e => e.target.style.borderColor = 'var(--border-default)'}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {[['Start Time', 'start_time'], ['End Time', 'end_time']].map(([label, field]) => (
                            <div key={field}>
                                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>{label}</label>
                                <input
                                    type="time"
                                    value={form[field]}
                                    onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                                    style={inpStyle}
                                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                    onBlur={e => e.target.style.borderColor = 'var(--border-default)'}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: isEdit ? 'space-between' : 'flex-end' }}>
                    {isEdit && (
                        <button
                            onClick={onDelete}
                            style={{ padding: '8px 14px', borderRadius: 8, background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-bd)', color: 'var(--color-danger)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}
                        >Remove</button>
                    )}
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border-default)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Cancel</button>
                        <button
                            onClick={() => onSave(form)}
                            style={{ padding: '8px 20px', borderRadius: 8, background: 'var(--accent)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)', boxShadow: '0 4px 12px rgba(186,151,49,0.28)' }}
                        >{isEdit ? 'Save Changes' : 'Add Slot'}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Slot Pill (rendered inside calendar cell) ────────────────────────────────
const SlotPill = ({ slot, onClick }) => {
    const [hov, setHov] = useState(false);
    const active = slot.is_active;
    return (
        <button
            onClick={e => { e.stopPropagation(); onClick(slot); }}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            title={`${slot.start_time}–${slot.end_time} • ${active ? 'Open' : 'Closed'} — click to edit`}
            style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '3px 6px 3px 7px', borderRadius: 5,
                background: active
                    ? hov ? 'rgba(22,163,74,0.15)' : 'rgba(22,163,74,0.08)'
                    : hov ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.04)',
                borderLeft: `2.5px solid ${active ? '#16a34a' : 'var(--border-strong)'}`,
                border: `1px solid ${active ? 'rgba(22,163,74,0.20)' : 'var(--border-subtle)'}`,
                borderLeftWidth: 2.5,
                color: active ? '#15803d' : 'var(--text-muted)',
                fontSize: 10, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--font-code)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                transition: 'all 0.12s', lineHeight: 1.6,
            }}
        >
            {slot.start_time}–{slot.end_time}
        </button>
    );
};

// ── Calendar Day Cell ─────────────────────────────────────────────────────────
const DayCell = ({ day, dateStr, isToday, isSelected, slots, overflow, hasPending, borderRight, borderBottom, onClick, onSlotClick }) => {
    const [hov, setHov] = useState(false);
    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                minHeight: 108, padding: '9px 7px 7px',
                borderRight: borderRight ? '1px solid var(--border-subtle)' : 'none',
                borderBottom: borderBottom ? '1px solid var(--border-subtle)' : 'none',
                cursor: 'pointer',
                background: isSelected
                    ? 'rgba(186,151,49,0.06)'
                    : hov ? 'var(--bg-depth)' : 'transparent',
                transition: 'background 0.13s',
                position: 'relative',
                display: 'flex', flexDirection: 'column',
            }}
        >
            {/* Day number + indicators */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: isToday ? 'var(--accent)' : 'transparent',
                    border: isSelected && !isToday ? '1.5px solid var(--accent)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: isToday ? 700 : 500,
                    color: isToday ? '#fff' : 'var(--text-primary)',
                    flexShrink: 0,
                }}>
                    {day}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, paddingTop: 2 }}>
                    {hasPending && (
                        <div
                            title="Pending consultation request"
                            style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-warning)', boxShadow: '0 0 5px rgba(217,119,6,0.55)' }}
                        />
                    )}
                    {hov && (
                        <div style={{
                            width: 17, height: 17, borderRadius: 4,
                            background: 'var(--accent-dim)',
                            border: '1px dashed var(--accent)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--accent)', fontSize: 13, fontWeight: 700, lineHeight: 1,
                        }}>+</div>
                    )}
                </div>
            </div>

            {/* Slot pills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {slots.map(slot => (
                    <SlotPill key={slot.slot_id} slot={slot} onClick={onSlotClick} />
                ))}
                {overflow > 0 && (
                    <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', paddingLeft: 6, fontFamily: 'var(--font-code)', letterSpacing: 0.3 }}>
                        +{overflow} more
                    </span>
                )}
            </div>
        </div>
    );
};

// ── Request Card ─────────────────────────────────────────────────────────────
const RequestCard = ({ req, onApprove, onDecline }) => {
    const [appHov, setAppHov] = useState(false);
    const [decHov, setDecHov] = useState(false);
    return (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 14, padding: '13px', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                    {req.student_name?.[0] ?? '?'}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{req.student_name}</p>
                    <p style={{ margin: 0, fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-code)' }}>{req.student_id}</p>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: 'var(--color-warning-bg)', color: 'var(--color-warning)', border: '1px solid var(--color-warning-bd)', flexShrink: 0 }}>
                    Pending
                </span>
            </div>

            <div style={{ background: 'var(--bg-depth)', borderRadius: 9, padding: '8px 10px', marginBottom: 9, border: '1px solid var(--border-subtle)' }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>
                    {fmtShort(req.booking_date)}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-secondary)' }}>{req.start_time} – {req.end_time}</p>
            </div>

            {req.reason && (
                <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.55, fontStyle: 'italic', margin: '0 0 10px', padding: '0 2px' }}>
                    &quot;{req.reason}&quot;
                </p>
            )}

            <div style={{ display: 'flex', gap: 7 }}>
                <button
                    onMouseEnter={() => setAppHov(true)}
                    onMouseLeave={() => setAppHov(false)}
                    onClick={onApprove}
                    style={{ flex: 1, padding: '8px 0', borderRadius: 8, background: appHov ? '#15803d' : 'var(--color-success)', color: '#fff', border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'background 0.15s', fontFamily: 'var(--font-body)' }}
                >Approve</button>
                <button
                    onMouseEnter={() => setDecHov(true)}
                    onMouseLeave={() => setDecHov(false)}
                    onClick={onDecline}
                    style={{ flex: 1, padding: '8px 0', borderRadius: 8, background: decHov ? 'var(--color-danger-bg)' : 'transparent', color: 'var(--color-danger)', border: '1px solid var(--color-danger-bd)', fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'background 0.15s', fontFamily: 'var(--font-body)' }}
                >Decline</button>
            </div>
        </div>
    );
};

// ── Add Availability Button ───────────────────────────────────────────────────
const AddBtn = ({ onClick }) => {
    const [hov, setHov] = useState(false);
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                width: '100%', padding: '12px 0', borderRadius: 12, border: 'none',
                background: hov
                    ? 'linear-gradient(135deg, #9A7D28 0%, var(--accent) 100%)'
                    : 'linear-gradient(135deg, var(--accent) 0%, #9A7D28 100%)',
                color: '#fff', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'var(--font-display)',
                boxShadow: hov
                    ? '0 6px 24px rgba(186,151,49,0.50), 0 0 0 1px rgba(186,151,49,0.18)'
                    : '0 4px 16px rgba(186,151,49,0.28)',
                transform: hov ? 'translateY(-1px)' : 'translateY(0)',
                transition: 'all 0.2s',
                letterSpacing: 0.3,
            }}
        >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Availability
        </button>
    );
};

// ── Stat Chip ─────────────────────────────────────────────────────────────────
const StatChip = ({ label, value, color }) => (
    <div style={{ flex: 1, background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: '9px 8px', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color, fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>{value}</p>
        <p style={{ margin: '3px 0 0', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</p>
    </div>
);

// ── Section label ─────────────────────────────────────────────────────────────
const SectionLabel = ({ children, badge }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{children}</p>
        {badge}
    </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const ConsultationTab = () => {
    const { toast } = useToast();
    const now = new Date();

    const [slots, setSlots] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState(new Date(now.getFullYear(), now.getMonth(), 1));

    // Quick-add popover state
    const [popover, setPopover] = useState(null); // { date, rect }
    const [pStart, setPStart] = useState('08:00');
    const [pEnd, setPEnd] = useState('09:00');

    // Full slot modal state
    const [slotModal, setSlotModal] = useState(null); // null | 'add' | slot object (edit)

    useEffect(() => {
        (async () => {
            try {
                const [s, r] = await Promise.all([
                    facultyApi.fetchConsultationSlots(),
                    facultyApi.fetchConsultationRequests(),
                ]);
                setSlots(s);
                setRequests(r);
            } catch {
                toast.error?.('Could not fetch consultation data.');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const slotsByDate = useMemo(() => {
        const map = {};
        slots.forEach(s => {
            (map[s.available_date] = map[s.available_date] || []).push(s);
        });
        return map;
    }, [slots]);

    const pendingByDate = useMemo(() => {
        const map = {};
        requests.filter(r => r.status === 'PENDING').forEach(r => {
            (map[r.booking_date] = map[r.booking_date] || []).push(r);
        });
        return map;
    }, [requests]);

    const pending = useMemo(() => requests.filter(r => r.status === 'PENDING'), [requests]);
    const handled = useMemo(() => requests.filter(r => r.status !== 'PENDING'), [requests]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleDayClick = (dateStr, e) => {
        if (popover?.date === dateStr) { setPopover(null); return; }
        setSlotModal(null);
        const r = e.currentTarget.getBoundingClientRect();
        setPStart('08:00');
        setPEnd('09:00');
        setPopover({
            date: dateStr,
            rect: { left: r.left, top: r.top, bottom: r.bottom, right: r.right },
        });
    };

    const handleQuickAdd = async () => {
        if (!popover) return;
        try {
            const created = await facultyApi.addConsultationSlot({
                available_date: popover.date,
                start_time: pStart,
                end_time: pEnd,
            });
            setSlots(prev => [...prev, created]);
            toast.success?.('Slot added!');
            setPopover(null);
        } catch {
            toast.error?.('Failed to add slot.');
        }
    };

    const handleSaveModal = async (form) => {
        const isEdit = slotModal && slotModal !== 'add';
        try {
            if (isEdit) {
                const updated = await facultyApi.updateConsultationSlot(slotModal.slot_id, form);
                setSlots(prev => prev.map(s => s.slot_id === slotModal.slot_id ? updated : s));
                toast.success?.('Slot updated.');
            } else {
                const created = await facultyApi.addConsultationSlot(form);
                setSlots(prev => [...prev, created]);
                toast.success?.('Slot created!');
            }
            setSlotModal(null);
        } catch {
            toast.error?.('Failed to save slot.');
        }
    };

    const handleDeleteModal = async () => {
        if (!slotModal || slotModal === 'add') return;
        if (!window.confirm('Remove this availability slot?')) return;
        try {
            await facultyApi.deleteConsultationSlot(slotModal.slot_id);
            setSlots(prev => prev.filter(s => s.slot_id !== slotModal.slot_id));
            toast.success?.('Slot removed.');
            setSlotModal(null);
        } catch {
            toast.error?.('Failed to remove slot.');
        }
    };

    const handleApprove = async (id) => {
        try {
            await facultyApi.updateConsultationStatus(id, 'APPROVED');
            setRequests(prev => prev.map(r => r.request_id === id ? { ...r, status: 'APPROVED' } : r));
            toast.success?.('Approved.');
        } catch {
            toast.error?.('Failed to approve.');
        }
    };

    const handleDecline = async (id) => {
        try {
            await facultyApi.updateConsultationStatus(id, 'DECLINED');
            setRequests(prev => prev.map(r => r.request_id === id ? { ...r, status: 'DECLINED' } : r));
            toast.success?.('Declined.');
        } catch {
            toast.error?.('Failed to decline.');
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────

    const y = month.getFullYear(), mo = month.getMonth();
    const grid = buildGrid(y, mo);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - var(--topbar-height, 52px))' }}>
            <p style={{ color: 'var(--accent)', fontFamily: 'var(--font-code)', fontSize: 12, letterSpacing: 2, margin: 0 }}>LOADING CONSULTATIONS...</p>
        </div>
    );

    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', minHeight: 'calc(100vh - var(--topbar-height, 52px))' }}>

            {/* ══ LEFT — Calendar Column ════════════════════════════════════════ */}
            <div style={{ flex: 1, minWidth: 0, padding: '28px 24px 48px 28px' }}>

                {/* Month nav */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.5px' }}>
                            {MONTHS[mo]}{' '}
                            <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 22 }}>{y}</span>
                        </h1>
                        <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                            Click a day to set availability · Click a slot to edit
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                        {[
                            ['‹', () => setMonth(new Date(y, mo - 1, 1))],
                            ['Today', () => setMonth(new Date(now.getFullYear(), now.getMonth(), 1))],
                            ['›', () => setMonth(new Date(y, mo + 1, 1))],
                        ].map(([label, fn]) => (
                            <NavBtn key={label} label={label} onClick={fn} />
                        ))}
                    </div>
                </div>

                {/* Calendar card */}
                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 20, overflow: 'hidden', boxShadow: 'var(--shadow-raised)' }}>

                    {/* Weekday header */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)' }}>
                        {WEEKDAYS.map(d => (
                            <div key={d} style={{ padding: '11px 0', textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Day grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                        {grid.map((day, idx) => {
                            const col = idx % 7;
                            const row = Math.floor(idx / 7);
                            const totalRows = Math.floor(grid.length / 7);
                            const borderRight = col < 6;
                            const borderBottom = row < totalRows - 1;

                            if (!day) return (
                                <div
                                    key={`pad-${idx}`}
                                    style={{
                                        minHeight: 108,
                                        borderRight: borderRight ? '1px solid var(--border-subtle)' : 'none',
                                        borderBottom: borderBottom ? '1px solid var(--border-subtle)' : 'none',
                                        background: 'var(--bg-base)',
                                        opacity: 0.5,
                                    }}
                                />
                            );

                            const dateStr = toDateStr(y, mo, day);
                            const isToday = dateStr === TODAY_STR;
                            const isSelected = popover?.date === dateStr;
                            const daySlots = slotsByDate[dateStr] || [];
                            const visibleSlots = daySlots.slice(0, 3);
                            const overflow = Math.max(0, daySlots.length - 3);
                            const hasPending = !!pendingByDate[dateStr];

                            return (
                                <DayCell
                                    key={dateStr}
                                    day={day}
                                    dateStr={dateStr}
                                    isToday={isToday}
                                    isSelected={isSelected}
                                    slots={visibleSlots}
                                    overflow={overflow}
                                    hasPending={hasPending}
                                    borderRight={borderRight}
                                    borderBottom={borderBottom}
                                    onClick={e => handleDayClick(dateStr, e)}
                                    onSlotClick={slot => { setPopover(null); setSlotModal(slot); }}
                                />
                            );
                        })}
                    </div>
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', gap: 18, marginTop: 14, paddingLeft: 2, flexWrap: 'wrap' }}>
                    {[
                        { el: <div style={{ width: 26, height: 12, borderRadius: 3, background: 'rgba(22,163,74,0.1)', borderLeft: '2.5px solid #16a34a', border: '1px solid rgba(22,163,74,0.22)', borderLeftWidth: 2.5 }} />, label: 'Open slot' },
                        { el: <div style={{ width: 26, height: 12, borderRadius: 3, background: 'rgba(0,0,0,0.04)', borderLeft: '2.5px solid var(--border-strong)', border: '1px solid var(--border-subtle)', borderLeftWidth: 2.5 }} />, label: 'Closed slot' },
                        { el: <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-warning)', boxShadow: '0 0 4px rgba(217,119,6,0.5)' }} />, label: 'Pending request' },
                        { el: <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 9, color: '#fff', fontWeight: 700 }}>23</span></div>, label: 'Today' },
                    ].map(({ el, label }) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            {el}
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ══ RIGHT — Sticky Sidebar ════════════════════════════════════════ */}
            <div style={{
                width: 316, flexShrink: 0,
                position: 'sticky', top: 0,
                height: 'calc(100vh - var(--topbar-height, 52px))',
                display: 'flex', flexDirection: 'column',
                borderLeft: '1px solid var(--border-default)',
                background: 'var(--bg-elevated)',
            }}>

                {/* ── Non-scrollable header ─────────────────────────────────── */}
                <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
                    {/* Portal sub-label */}
                    <p style={{ margin: '0 0 12px', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1.5, fontFamily: 'var(--font-code)' }}>
                        Faculty Portal
                    </p>
                    <h2 style={{ margin: '0 0 14px', fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '-0.3px' }}>
                        Consultations
                    </h2>

                    {/* ★ Add Availability — fixed, never scrolls */}
                    <AddBtn onClick={() => { setPopover(null); setSlotModal('add'); }} />

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                        <StatChip label="Slots" value={slots.length} color="var(--accent)" />
                        <StatChip label="Pending" value={pending.length} color="var(--color-warning)" />
                        <StatChip label="Handled" value={handled.length} color="var(--color-success)" />
                    </div>
                </div>

                {/* ── Scrollable section ────────────────────────────────────── */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px 24px' }} className="scrollbar-hide">

                    {/* Request Queue */}
                    <div style={{ marginBottom: 22 }}>
                        <SectionLabel
                            badge={
                                pending.length > 0
                                    ? <span style={{ minWidth: 20, height: 20, borderRadius: 10, padding: '0 5px', background: 'var(--color-warning-bg)', border: '1px solid var(--color-warning-bd)', color: 'var(--color-warning)', fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{pending.length}</span>
                                    : null
                            }
                        >Request Queue</SectionLabel>

                        {pending.length === 0 ? (
                            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: '24px 16px', textAlign: 'center' }}>
                                <p style={{ margin: 0, fontSize: 22, opacity: 0.35 }}>✓</p>
                                <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>All caught up</p>
                            </div>
                        ) : pending.map(req => (
                            <RequestCard
                                key={req.request_id}
                                req={req}
                                onApprove={() => handleApprove(req.request_id)}
                                onDecline={() => handleDecline(req.request_id)}
                            />
                        ))}
                    </div>

                    {/* Recent Activity */}
                    {handled.length > 0 && (
                        <div>
                            <SectionLabel>Recent Activity</SectionLabel>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {handled.slice(0, 5).map(req => {
                                    const ok = req.status === 'APPROVED';
                                    return (
                                        <div key={req.request_id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 11px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 10 }}>
                                            <div style={{ width: 26, height: 26, borderRadius: '50%', background: ok ? 'var(--color-success-bg)' : 'var(--color-danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: ok ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 800, flexShrink: 0 }}>
                                                {ok ? '✓' : '✕'}
                                            </div>
                                            <div style={{ minWidth: 0, flex: 1 }}>
                                                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{req.student_name}</p>
                                                <p style={{ margin: 0, fontSize: 10, color: 'var(--text-muted)' }}>{req.booking_date}</p>
                                            </div>
                                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: ok ? 'var(--color-success-bg)' : 'var(--color-danger-bg)', color: ok ? 'var(--color-success)' : 'var(--color-danger)', border: `1px solid ${ok ? 'var(--color-success-bd)' : 'var(--color-danger-bd)'}`, flexShrink: 0 }}>
                                                {ok ? 'Approved' : 'Declined'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick-add Popover */}
            {popover && (
                <QuickAddPopover
                    date={popover.date}
                    rect={popover.rect}
                    startTime={pStart}
                    endTime={pEnd}
                    onChangeStart={setPStart}
                    onChangeEnd={setPEnd}
                    onSave={handleQuickAdd}
                    onClose={() => setPopover(null)}
                />
            )}

            {/* Full Slot Modal */}
            {slotModal && (
                <SlotModal
                    slot={slotModal === 'add' ? null : slotModal}
                    onSave={handleSaveModal}
                    onDelete={handleDeleteModal}
                    onClose={() => setSlotModal(null)}
                />
            )}
        </div>
    );
};

// ── Nav Button ────────────────────────────────────────────────────────────────
const NavBtn = ({ label, onClick }) => {
    const [hov, setHov] = useState(false);
    const isText = label === 'Today';
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                height: 32,
                padding: isText ? '0 14px' : '0',
                width: isText ? 'auto' : 32,
                borderRadius: 8,
                border: `1px solid ${hov ? 'var(--accent)' : 'var(--border-default)'}`,
                background: hov ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                color: hov ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: 'pointer', fontSize: isText ? 12 : 17,
                fontWeight: isText ? 600 : 400,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-body)',
                transition: 'all 0.15s',
            }}
        >{label}</button>
    );
};

export default ConsultationTab;
