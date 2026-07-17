import React, { useState, useEffect, useMemo } from 'react';
import { studentApi } from '../api/studentApi';
import { useToast } from '../../../context/ToastContext';

// ── Calendar helpers ─────────────────────────────────────────────────────────
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

// Converts a hex color to rgba(r,g,b,alpha) string
function hexAlpha(hex, alpha) {
    if (!hex || !hex.startsWith('#')) return `rgba(201,168,76,${alpha})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

// ── Faculty color palette (deterministic by index) ───────────────────────────
const FACULTY_COLORS = [
    '#C9A84C', // gold
    '#60a5fa', // blue
    '#a78bfa', // purple
    '#34d399', // emerald
    '#f87171', // coral
    '#fb923c', // orange
    '#38bdf8', // sky
    '#e879f9', // fuchsia
];

// ── Shared input style ───────────────────────────────────────────────────────
const inputStyle = {
    background: 'var(--student-black-4)',
    border: '1px solid rgba(201,168,76,0.15)',
    color: 'var(--student-white)',
    borderRadius: 10,
    padding: '11px 14px',
    fontSize: 13,
    fontFamily: 'var(--student-font-body)',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
};

// ── Block card wrapper ───────────────────────────────────────────────────────
const Block = ({ children, style = {}, className = '' }) => (
    <div
        className={className}
        style={{
            background: 'var(--student-black-3)',
            border: '1px solid rgba(201,168,76,0.08)',
            borderRadius: 18,
            ...style,
        }}
    >
        {children}
    </div>
);

// ── Section field label ──────────────────────────────────────────────────────
const FieldLabel = ({ children }) => (
    <label style={{
        fontSize: 10, fontWeight: 700,
        color: 'var(--student-gold)',
        textTransform: 'uppercase', letterSpacing: 1.5,
        fontFamily: 'var(--student-font-mono)',
        display: 'block', marginBottom: 8,
    }}>
        {children}
    </label>
);

// ── Month navigation button ──────────────────────────────────────────────────
const NavBtn = ({ label, onClick }) => {
    const [hov, setHov] = useState(false);
    const isText = label === 'Today';
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                height: 28,
                padding: isText ? '0 12px' : '0',
                width: isText ? 'auto' : 28,
                borderRadius: 7,
                border: `1px solid ${hov ? 'var(--student-gold)' : 'rgba(201,168,76,0.2)'}`,
                background: hov ? 'var(--student-gold-dim)' : 'var(--student-black-4)',
                color: hov ? 'var(--student-gold)' : 'var(--student-white-dim)',
                cursor: 'pointer',
                fontSize: isText ? 11 : 15,
                fontWeight: isText ? 600 : 400,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--student-font-body)',
                transition: 'all 0.15s',
            }}
        >
            {label}
        </button>
    );
};

// ── Calendar day cell ────────────────────────────────────────────────────────
const DayCell = ({ day, dateStr, isToday, isSelected, isPast, hasSlots, slotCount, facultyColor, borderRight, borderBottom, onClick }) => {
    const [hov, setHov] = useState(false);
    const color = facultyColor || '#C9A84C';

    return (
        <div
            onClick={isPast || !onClick ? undefined : onClick}
            onMouseEnter={() => !isPast && setHov(true)}
            onMouseLeave={() => setHov(false)}
            title={hasSlots && !isPast ? `${slotCount} slot${slotCount !== 1 ? 's' : ''} available` : undefined}
            style={{
                minHeight: 60,
                padding: '7px 4px 5px',
                borderRight: borderRight ? '1px solid rgba(201,168,76,0.06)' : 'none',
                borderBottom: borderBottom ? '1px solid rgba(201,168,76,0.06)' : 'none',
                cursor: isPast || !onClick ? 'default' : 'pointer',
                background: isSelected
                    ? hexAlpha(color, 0.12)
                    : hov && !isPast
                    ? 'rgba(255,255,255,0.025)'
                    : 'transparent',
                transition: 'background 0.13s',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                opacity: isPast ? 0.28 : 1,
            }}
        >
            {/* Day number circle */}
            <div style={{
                width: 22, height: 22, borderRadius: '50%',
                background: isToday ? color : 'transparent',
                border: isSelected && !isToday ? `1.5px solid ${color}` : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: isToday ? 700 : 400,
                color: isToday ? '#000' : 'var(--student-white)',
                fontFamily: 'var(--student-font-body)',
                flexShrink: 0,
            }}>
                {day}
            </div>

            {/* Availability dot */}
            {hasSlots && !isPast && (
                <div style={{
                    width: 5, height: 5, borderRadius: '50%',
                    background: color,
                    boxShadow: `0 0 5px ${hexAlpha(color, 0.6)}`,
                    flexShrink: 0,
                }} />
            )}
        </div>
    );
};

// ── Main Component ───────────────────────────────────────────────────────────
const ConsultationBookingTab = () => {
    const { toast } = useToast();
    const now = new Date();

    const [facultyList, setFacultyList] = useState([]);
    const [selectedFacultyId, setSelectedFacultyId] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [timeChunks, setTimeChunks] = useState([]);
    const [selectedChunk, setSelectedChunk] = useState(null);
    const [reason, setReason] = useState('');
    const [myRequests, setMyRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchingChunks, setFetchingChunks] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Calendar state
    const [month, setMonth] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
    // availabilityMap: { [dateStr]: number of slots }
    const [availabilityMap, setAvailabilityMap] = useState({});
    const [loadingAvailability, setLoadingAvailability] = useState(false);

    // ── Initial load ─────────────────────────────────────────────────────────
    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                const [faculties, requests] = await Promise.all([
                    studentApi.fetchAvailableFaculty(),
                    studentApi.fetchMyConsultations(),
                ]);
                setFacultyList(faculties);
                setMyRequests(requests);
            } catch {
                toast?.error?.('Failed to load consultation data');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    // ── Preload month availability when faculty or month changes ─────────────
    useEffect(() => {
        if (!selectedFacultyId) {
            setAvailabilityMap({});
            return;
        }

        const y = month.getFullYear();
        const mo = month.getMonth();
        const daysInMonth = new Date(y, mo + 1, 0).getDate();

        const fetchMonth = async () => {
            setLoadingAvailability(true);
            try {
                const promises = [];
                for (let d = 1; d <= daysInMonth; d++) {
                    const dateStr = toDateStr(y, mo, d);
                    if (dateStr >= TODAY_STR) {
                        promises.push(
                            studentApi.fetchFacultyTimeChunks(selectedFacultyId, dateStr)
                                .then(chunks => ({ dateStr, count: chunks.length }))
                                .catch(() => ({ dateStr, count: 0 }))
                        );
                    }
                }
                const results = await Promise.all(promises);
                const map = {};
                results.forEach(({ dateStr, count }) => { map[dateStr] = count; });
                setAvailabilityMap(map);
            } finally {
                setLoadingAvailability(false);
            }
        };

        fetchMonth();
    }, [selectedFacultyId, month]);

    // ── Fetch time chunks when date changes ──────────────────────────────────
    useEffect(() => {
        if (!selectedFacultyId || !selectedDate) {
            setTimeChunks([]);
            setSelectedChunk(null);
            return;
        }
        const fetchChunks = async () => {
            setFetchingChunks(true);
            setSelectedChunk(null);
            try {
                const chunks = await studentApi.fetchFacultyTimeChunks(selectedFacultyId, selectedDate);
                setTimeChunks(chunks);
            } catch {
                toast?.error?.('Failed to fetch available time slots');
            } finally {
                setFetchingChunks(false);
            }
        };
        fetchChunks();
    }, [selectedFacultyId, selectedDate]);

    // ── Book handler ─────────────────────────────────────────────────────────
    const handleBook = async () => {
        if (!selectedFacultyId || !selectedDate || !selectedChunk || !reason.trim()) {
            toast?.warn?.('Please complete all fields before sending your request.');
            return;
        }
        setSubmitting(true);
        try {
            const newReq = await studentApi.bookConsultation({
                faculty_account_id: parseInt(selectedFacultyId),
                booking_date: selectedDate,
                start_time: selectedChunk.start_time,
                end_time: selectedChunk.end_time,
                reason: reason.trim(),
            });
            toast?.success?.('Appointment requested successfully!');
            setMyRequests(prev => [newReq, ...prev]);
            setSelectedChunk(null);
            setReason('');
            const chunks = await studentApi.fetchFacultyTimeChunks(selectedFacultyId, selectedDate);
            setTimeChunks(chunks);
        } catch (err) {
            toast?.error?.(err.response?.data?.detail || 'Failed to submit your request.');
        } finally {
            setSubmitting(false);
        }
    };

    // ── Derived state ────────────────────────────────────────────────────────
    const facultyColorMap = useMemo(() => {
        const map = {};
        facultyList.forEach((f, i) => {
            map[String(f.account_id)] = FACULTY_COLORS[i % FACULTY_COLORS.length];
            map[f.faculty_name] = FACULTY_COLORS[i % FACULTY_COLORS.length];
        });
        return map;
    }, [facultyList]);

    const selectedFacultyColor = selectedFacultyId ? (facultyColorMap[String(selectedFacultyId)] ?? null) : null;

    const pendingRequests = useMemo(() => myRequests.filter(r => r.status === 'PENDING'), [myRequests]);
    const pastRequests = useMemo(() => myRequests.filter(r => r.status !== 'PENDING'), [myRequests]);

    const y = month.getFullYear(), mo = month.getMonth();
    const grid = buildGrid(y, mo);

    // ── Loading state ────────────────────────────────────────────────────────
    if (loading) return (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--student-gold)', fontFamily: 'var(--student-font-mono)', fontSize: 12, letterSpacing: 2 }}>
            Loading...
        </div>
    );

    const canSubmit = !submitting && !!selectedChunk && reason.trim().length > 0;
    const accentColor = selectedFacultyColor || '#C9A84C';

    return (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* ── Header ──────────────────────────────────────────────────── */}
            <Block style={{ padding: '26px 30px', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                    position: 'absolute', top: 0, right: 0, width: 220, height: 220,
                    opacity: 0.15, pointerEvents: 'none',
                    background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)`,
                    transform: 'translate(30%,-30%)',
                }} />
                <h2 style={{
                    fontSize: 24, fontWeight: 800,
                    fontFamily: 'var(--student-font-display)',
                    color: 'var(--student-white)',
                    margin: '0 0 8px', letterSpacing: '-0.5px',
                }}>
                    Consultation Network
                </h2>
                <p style={{
                    fontSize: 14, color: 'var(--student-white-dim)',
                    maxWidth: 500, lineHeight: 1.65, margin: 0,
                    fontFamily: 'var(--student-font-body)',
                }}>
                    Connect with your professors by reserving dedicated 30-minute time slots.
                    Choose an available slot that works for both of you.
                </p>
            </Block>

            {/* ── Two-column layout ────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12" style={{ gap: 20, alignItems: 'flex-start' }}>

                {/* ══ LEFT: Booking Form ══════════════════════════════════════ */}
                <div className="lg:col-span-8" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <Block style={{ padding: '24px 26px' }}>

                        {/* Card heading */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: 10,
                                background: hexAlpha(accentColor, 0.15),
                                border: `1px solid ${hexAlpha(accentColor, 0.3)}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 16, flexShrink: 0,
                            }}>
                                📅
                            </div>
                            <div>
                                <h3 style={{
                                    fontFamily: 'var(--student-font-display)',
                                    fontSize: 16, fontWeight: 700,
                                    color: 'var(--student-white)', margin: 0,
                                }}>
                                    Book an Appointment
                                </h3>
                                <p style={{
                                    fontSize: 12, color: 'var(--student-white-dim)',
                                    margin: '2px 0 0', fontFamily: 'var(--student-font-body)',
                                }}>
                                    Fill in the details below to send your request
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

                            {/* ── Professor selector ───────────────────────── */}
                            <div>
                                <FieldLabel>Choose Professor</FieldLabel>

                                {/* Dropdown with color dot indicator */}
                                <div style={{ position: 'relative' }}>
                                    {selectedFacultyColor && (
                                        <div style={{
                                            position: 'absolute', left: 12, top: '50%',
                                            transform: 'translateY(-50%)',
                                            width: 9, height: 9, borderRadius: '50%',
                                            background: selectedFacultyColor,
                                            boxShadow: `0 0 8px ${hexAlpha(selectedFacultyColor, 0.7)}`,
                                            zIndex: 1, pointerEvents: 'none',
                                        }} />
                                    )}
                                    <select
                                        value={selectedFacultyId}
                                        onChange={e => {
                                            setSelectedFacultyId(e.target.value);
                                            setSelectedDate('');
                                            setSelectedChunk(null);
                                            setTimeChunks([]);
                                        }}
                                        style={{ ...inputStyle, paddingLeft: selectedFacultyColor ? 30 : 14 }}
                                        onFocus={e => e.target.style.borderColor = 'var(--student-gold)'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.15)'}
                                    >
                                        <option value="" style={{ background: 'var(--student-black-3)' }}>
                                            Choose a professor...
                                        </option>
                                        {facultyList.map((f, i) => (
                                            <option key={f.account_id} value={f.account_id} style={{ background: 'var(--student-black-3)' }}>
                                                {f.faculty_name} — {f.academic_department}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Quick-pick color chips */}
                                {facultyList.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 10 }}>
                                        {facultyList.map((f, i) => {
                                            const color = FACULTY_COLORS[i % FACULTY_COLORS.length];
                                            const isActive = String(f.account_id) === String(selectedFacultyId);
                                            return (
                                                <button
                                                    key={f.account_id}
                                                    onClick={() => {
                                                        setSelectedFacultyId(String(f.account_id));
                                                        setSelectedDate('');
                                                        setSelectedChunk(null);
                                                        setTimeChunks([]);
                                                    }}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: 6,
                                                        padding: '5px 11px', borderRadius: 20,
                                                        border: `1px solid ${isActive ? color : 'rgba(255,255,255,0.07)'}`,
                                                        background: isActive ? hexAlpha(color, 0.15) : 'transparent',
                                                        color: isActive ? color : 'var(--student-white-dim)',
                                                        fontSize: 11, fontWeight: 600,
                                                        cursor: 'pointer',
                                                        fontFamily: 'var(--student-font-body)',
                                                        transition: 'all 0.15s',
                                                    }}
                                                >
                                                    <div style={{
                                                        width: 7, height: 7, borderRadius: '50%',
                                                        background: color, flexShrink: 0,
                                                    }} />
                                                    {f.faculty_name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* ── Calendar ─────────────────────────────────── */}
                            <div>
                                {/* Calendar header row */}
                                <div style={{
                                    display: 'flex', alignItems: 'flex-end',
                                    justifyContent: 'space-between',
                                    marginBottom: 12, flexWrap: 'wrap', gap: 10,
                                }}>
                                    <div>
                                        <FieldLabel>Select Date</FieldLabel>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <h4 style={{
                                                margin: 0, fontSize: 15, fontWeight: 700,
                                                color: 'var(--student-white)',
                                                fontFamily: 'var(--student-font-display)',
                                            }}>
                                                {MONTHS[mo]}{' '}
                                                <span style={{ color: 'var(--student-white-dim)', fontWeight: 400 }}>
                                                    {y}
                                                </span>
                                            </h4>
                                            {loadingAvailability && (
                                                <span style={{
                                                    fontSize: 9, color: accentColor,
                                                    fontFamily: 'var(--student-font-mono)',
                                                    letterSpacing: 1, opacity: 0.75,
                                                }}>
                                                    LOADING...
                                                </span>
                                            )}
                                        </div>
                                        <p style={{
                                            margin: '3px 0 0', fontSize: 11,
                                            color: 'var(--student-white-dim)',
                                            fontFamily: 'var(--student-font-body)',
                                        }}>
                                            {selectedFacultyId
                                                ? 'Colored dots indicate days with open slots'
                                                : 'Select a professor first to see their availability'}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                                        {[
                                            ['‹', () => setMonth(new Date(y, mo - 1, 1))],
                                            ['Today', () => setMonth(new Date(now.getFullYear(), now.getMonth(), 1))],
                                            ['›', () => setMonth(new Date(y, mo + 1, 1))],
                                        ].map(([label, fn]) => (
                                            <NavBtn key={label} label={label} onClick={fn} />
                                        ))}
                                    </div>
                                </div>

                                {/* Calendar grid */}
                                <div style={{
                                    background: 'var(--student-black-4)',
                                    border: '1px solid rgba(201,168,76,0.08)',
                                    borderRadius: 14, overflow: 'hidden',
                                }}>
                                    {/* Weekday header */}
                                    <div style={{
                                        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
                                        background: 'var(--student-black-5)',
                                        borderBottom: '1px solid rgba(201,168,76,0.06)',
                                    }}>
                                        {WEEKDAYS.map(d => (
                                            <div key={d} style={{
                                                padding: '8px 0', textAlign: 'center',
                                                fontSize: 9, fontWeight: 700,
                                                color: 'var(--student-white-dim)',
                                                textTransform: 'uppercase', letterSpacing: 0.8,
                                                fontFamily: 'var(--student-font-mono)',
                                            }}>
                                                {d}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Day cells */}
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
                                                        minHeight: 60,
                                                        borderRight: borderRight ? '1px solid rgba(201,168,76,0.06)' : 'none',
                                                        borderBottom: borderBottom ? '1px solid rgba(201,168,76,0.06)' : 'none',
                                                        background: 'rgba(0,0,0,0.12)',
                                                        opacity: 0.4,
                                                    }}
                                                />
                                            );

                                            const dateStr = toDateStr(y, mo, day);
                                            const isPast = dateStr < TODAY_STR;
                                            const isToday = dateStr === TODAY_STR;
                                            const isSelected = dateStr === selectedDate;
                                            const slotCount = availabilityMap[dateStr] ?? 0;
                                            const hasSlots = slotCount > 0;

                                            return (
                                                <DayCell
                                                    key={dateStr}
                                                    day={day}
                                                    dateStr={dateStr}
                                                    isToday={isToday}
                                                    isSelected={isSelected}
                                                    isPast={isPast}
                                                    hasSlots={hasSlots}
                                                    slotCount={slotCount}
                                                    facultyColor={selectedFacultyColor}
                                                    borderRight={borderRight}
                                                    borderBottom={borderBottom}
                                                    onClick={selectedFacultyId && !isPast
                                                        ? () => setSelectedDate(dateStr)
                                                        : null}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Legend */}
                                <div style={{
                                    display: 'flex', gap: 16, marginTop: 10,
                                    paddingLeft: 2, flexWrap: 'wrap',
                                }}>
                                    {[
                                        {
                                            el: <div style={{ width: 6, height: 6, borderRadius: '50%', background: accentColor, boxShadow: `0 0 5px ${hexAlpha(accentColor, 0.6)}` }} />,
                                            label: 'Has open slots',
                                        },
                                        {
                                            el: <div style={{ width: 20, height: 20, borderRadius: '50%', background: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <span style={{ fontSize: 8, color: '#000', fontWeight: 700 }}>7</span>
                                            </div>,
                                            label: 'Today',
                                        },
                                        {
                                            el: <div style={{ width: 20, height: 20, borderRadius: '50%', border: `1.5px solid ${accentColor}` }} />,
                                            label: 'Selected',
                                        },
                                    ].map(({ el, label }) => (
                                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            {el}
                                            <span style={{ fontSize: 11, color: 'var(--student-white-dim)', fontFamily: 'var(--student-font-body)' }}>
                                                {label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ── Time slot picker ─────────────────────────── */}
                            <div>
                                <FieldLabel>Pick a Time Slot</FieldLabel>
                                <div style={{
                                    background: 'var(--student-black-4)',
                                    border: '1px solid rgba(201,168,76,0.08)',
                                    borderRadius: 12, padding: 16, minHeight: 96,
                                    display: 'flex', flexDirection: 'column',
                                    justifyContent: (!selectedFacultyId || !selectedDate || fetchingChunks || timeChunks.length === 0) ? 'center' : 'flex-start',
                                }}>
                                    {!selectedFacultyId ? (
                                        <p style={{ textAlign: 'center', color: 'var(--student-white-dim)', fontSize: 13, margin: 0, fontFamily: 'var(--student-font-body)' }}>
                                            Choose a professor to get started
                                        </p>
                                    ) : !selectedDate ? (
                                        <p style={{ textAlign: 'center', color: 'var(--student-white-dim)', fontSize: 13, margin: 0, fontFamily: 'var(--student-font-body)' }}>
                                            Click a date on the calendar above
                                        </p>
                                    ) : fetchingChunks ? (
                                        <p style={{ textAlign: 'center', color: accentColor, fontSize: 12, margin: 0, fontFamily: 'var(--student-font-mono)', letterSpacing: 1 }}>
                                            Checking availability...
                                        </p>
                                    ) : timeChunks.length === 0 ? (
                                        <p style={{ textAlign: 'center', color: 'var(--student-red-light)', fontSize: 13, margin: 0, fontFamily: 'var(--student-font-body)' }}>
                                            No open slots on this date. Try a different day.
                                        </p>
                                    ) : (
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                                            gap: 10,
                                        }}>
                                            {timeChunks.map((chunk, idx) => {
                                                const isChunkSelected = selectedChunk?.start_time === chunk.start_time;
                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setSelectedChunk(chunk)}
                                                        style={{
                                                            padding: '10px 6px',
                                                            borderRadius: 9,
                                                            border: `1px solid ${isChunkSelected ? accentColor : 'rgba(201,168,76,0.18)'}`,
                                                            background: isChunkSelected ? hexAlpha(accentColor, 0.16) : 'transparent',
                                                            color: isChunkSelected ? accentColor : 'var(--student-white)',
                                                            fontSize: 11,
                                                            fontFamily: 'var(--student-font-mono)',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.15s',
                                                            fontWeight: isChunkSelected ? 700 : 400,
                                                            boxShadow: isChunkSelected ? `0 0 14px ${hexAlpha(accentColor, 0.25)}` : 'none',
                                                            textAlign: 'center',
                                                            lineHeight: 1.6,
                                                        }}
                                                        onMouseEnter={e => { if (!isChunkSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                                                        onMouseLeave={e => { if (!isChunkSelected) e.currentTarget.style.background = 'transparent'; }}
                                                    >
                                                        {chunk.start_time}
                                                        <br />
                                                        <span style={{ fontSize: 9, opacity: 0.65 }}>
                                                            {chunk.end_time}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ── Discussion topic ─────────────────────────── */}
                            <div>
                                <FieldLabel>What would you like to discuss?</FieldLabel>
                                <textarea
                                    value={reason}
                                    onChange={e => setReason(e.target.value)}
                                    placeholder="Briefly describe the topic or question you'd like help with..."
                                    style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }}
                                    onFocus={e => e.target.style.borderColor = accentColor}
                                    onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.15)'}
                                />
                            </div>

                            {/* ── Submit button ────────────────────────────── */}
                            <button
                                onClick={handleBook}
                                disabled={!canSubmit}
                                style={{
                                    padding: '14px 0',
                                    borderRadius: 12,
                                    background: canSubmit ? accentColor : 'var(--student-black-4)',
                                    color: canSubmit ? '#000' : 'rgba(255,255,255,0.18)',
                                    border: canSubmit ? 'none' : '1px solid rgba(255,255,255,0.05)',
                                    fontWeight: 700,
                                    fontSize: 14,
                                    fontFamily: 'var(--student-font-body)',
                                    letterSpacing: 0.4,
                                    cursor: canSubmit ? 'pointer' : 'not-allowed',
                                    transition: 'all 0.25s',
                                    boxShadow: canSubmit ? `0 4px 18px ${hexAlpha(accentColor, 0.4)}` : 'none',
                                    width: '100%',
                                }}
                                onMouseEnter={e => { if (canSubmit) e.currentTarget.style.opacity = '0.88'; }}
                                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                            >
                                {submitting ? 'Sending your request...' : 'Request Appointment'}
                            </button>

                        </div>
                    </Block>
                </div>

                {/* ══ RIGHT: My Requests ══════════════════════════════════════ */}
                <div className="lg:col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* Pending requests */}
                    <Block style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                            <h3 style={{
                                fontFamily: 'var(--student-font-display)',
                                fontSize: 15, fontWeight: 700,
                                color: 'var(--student-white)', margin: 0,
                            }}>
                                Pending Requests
                            </h3>
                            <div style={{
                                padding: '3px 10px', borderRadius: 20,
                                background: pendingRequests.length > 0 ? 'var(--student-gold-dim)' : 'rgba(255,255,255,0.05)',
                                color: pendingRequests.length > 0 ? 'var(--student-gold)' : 'var(--student-white-dim)',
                                fontSize: 11, fontWeight: 700,
                                fontFamily: 'var(--student-font-mono)',
                            }}>
                                {pendingRequests.length}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {pendingRequests.length === 0 ? (
                                <div style={{
                                    textAlign: 'center', padding: '22px 0',
                                    fontSize: 12, color: 'var(--student-white-dim)',
                                    fontFamily: 'var(--student-font-body)',
                                }}>
                                    No pending requests yet
                                </div>
                            ) : pendingRequests.map(req => {
                                const reqColor = facultyColorMap[req.faculty_name] || '#C9A84C';
                                return (
                                    <div key={req.request_id} style={{
                                        padding: '13px 14px', borderRadius: 12,
                                        background: 'var(--student-black-4)',
                                        border: `1px solid ${hexAlpha(reqColor, 0.22)}`,
                                        borderLeft: `3px solid ${reqColor}`,
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                                            <div style={{
                                                width: 8, height: 8, borderRadius: '50%',
                                                background: reqColor, flexShrink: 0,
                                            }} />
                                            <p style={{
                                                fontSize: 13, fontWeight: 700,
                                                color: 'var(--student-white)', margin: 0,
                                                flex: 1, overflow: 'hidden',
                                                textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                            }}>
                                                {req.faculty_name}
                                            </p>
                                        </div>
                                        <div style={{
                                            display: 'inline-flex', alignItems: 'center', gap: 5,
                                            background: hexAlpha(reqColor, 0.1),
                                            padding: '5px 10px', borderRadius: 7,
                                            fontSize: 11, color: reqColor,
                                            fontFamily: 'var(--student-font-mono)',
                                            marginBottom: 8, border: `1px solid ${hexAlpha(reqColor, 0.2)}`,
                                        }}>
                                            {req.booking_date} · {req.start_time}–{req.end_time}
                                        </div>
                                        <p style={{
                                            fontSize: 11, color: 'var(--student-white-dim)',
                                            fontStyle: 'italic', lineHeight: 1.55, margin: 0,
                                        }}>
                                            &quot;{req.reason}&quot;
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </Block>

                    {/* Appointment history */}
                    <Block style={{ padding: '20px' }}>
                        <h3 style={{
                            fontFamily: 'var(--student-font-display)',
                            fontSize: 15, fontWeight: 700,
                            color: 'var(--student-white)',
                            margin: '0 0 14px',
                        }}>
                            Appointment History
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {pastRequests.length === 0 ? (
                                <div style={{
                                    textAlign: 'center', padding: '20px 0',
                                    fontSize: 12, color: 'var(--student-white-dim)',
                                    fontFamily: 'var(--student-font-body)',
                                }}>
                                    No past appointments
                                </div>
                            ) : pastRequests.map(req => {
                                const ok = req.status === 'APPROVED';
                                return (
                                    <div key={req.request_id} style={{
                                        padding: '11px 13px', borderRadius: 10,
                                        background: 'var(--student-black-4)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        display: 'flex', justifyContent: 'space-between',
                                        alignItems: 'center', gap: 10,
                                    }}>
                                        <div style={{ minWidth: 0, flex: 1 }}>
                                            <p style={{
                                                fontSize: 12, fontWeight: 600,
                                                color: 'var(--student-white)', margin: 0,
                                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                            }}>
                                                {req.faculty_name}
                                            </p>
                                            <p style={{
                                                fontSize: 10, color: 'var(--student-white-dim)',
                                                fontFamily: 'var(--student-font-mono)',
                                                margin: '2px 0 0',
                                            }}>
                                                {req.booking_date}
                                            </p>
                                        </div>
                                        <span style={{
                                            fontSize: 10, fontWeight: 700,
                                            padding: '3px 10px', borderRadius: 20,
                                            fontFamily: 'var(--student-font-mono)', flexShrink: 0,
                                            background: ok ? 'var(--student-green-dim)' : 'var(--student-red-dim)',
                                            color: ok ? 'var(--student-green)' : 'var(--student-red-light)',
                                            border: `1px solid ${ok ? 'rgba(39,174,96,0.2)' : 'rgba(192,57,43,0.2)'}`,
                                        }}>
                                            {ok ? 'Approved' : 'Declined'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </Block>
                </div>
            </div>
        </div>
    );
};

export default ConsultationBookingTab;
