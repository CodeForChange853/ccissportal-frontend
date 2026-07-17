import React, { useState, useEffect, useCallback, useRef } from 'react';
import { adminApi } from '../api/adminApi';
import { useToast } from '../../../context/ToastContext';
import PageHeader from '../../../components/ui/PageHeader';
import StatusBadge from '../../../components/ui/StatusBadge';
import EmptyState from '../../../components/ui/EmptyState';
import { SearchIcon, RefreshIcon } from '../../../components/icons';
import { downloadCSV } from '../../../utils/csvDownload';

const ENROLLMENT_VARIANT = { APPROVED: 'normal', PENDING: 'warning', REJECTED: 'critical' };
const COR_VARIANT        = { RELEASED: 'normal', PENDING: 'warning' };

const YEAR_OPTIONS  = ['All Years', '1', '2', '3', '4'];
const COURSE_OPTIONS = ['All Courses', 'BSCS', 'BSIT', 'BSIS', 'BSEMC', 'ACT'];

const THead = ({ cols }) => (
    <thead>
        <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
            {cols.map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
        </tr>
    </thead>
);

const StudentRecords = () => {
    const { toast } = useToast();

    const [records, setRecords]       = useState([]);
    const [loading, setLoading]       = useState(true);
    const [search,  setSearch]        = useState('');
    const [course,  setCourse]        = useState('All Courses');
    const [year,    setYear]          = useState('All Years');
    const [total,   setTotal]         = useState(0);

    const searchRef = useRef(null);
    const debounceRef = useRef(null);

    const load = useCallback(async (params = {}) => {
        setLoading(true);
        try {
            const data = await adminApi.fetchStudentRecords({
                search:     params.search     ?? (search || undefined),
                course:     params.course     !== 'All Courses' ? (params.course     ?? (course !== 'All Courses' ? course : undefined)) : undefined,
                year_level: params.year_level !== 'All Years'   ? (params.year_level ?? (year   !== 'All Years'   ? year   : undefined)) : undefined,
            });
            setRecords(data);
            setTotal(data.length);
        } catch {
            toast.error('Failed to load student records.');
        } finally {
            setLoading(false);
        }
    }, [search, course, year]);

    useEffect(() => { load(); }, []);

    const handleSearchChange = (val) => {
        setSearch(val);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            loadWith({ search: val || undefined, course, year });
        }, 400);
    };

    const loadWith = ({ search: s, course: c, year: y }) => {
        setLoading(true);
        adminApi.fetchStudentRecords({
            search:     s || undefined,
            course:     c !== 'All Courses' ? c : undefined,
            year_level: y !== 'All Years'   ? y : undefined,
        }).then(data => {
            setRecords(data);
            setTotal(data.length);
        }).catch(() => {
            toast.error('Failed to load student records.');
        }).finally(() => setLoading(false));
    };

    const handleCourse = (val) => { setCourse(val); loadWith({ search, course: val, year }); };
    const handleYear   = (val) => { setYear(val);   loadWith({ search, course, year: val }); };
    const handleRefresh = () => loadWith({ search, course, year });

    const selectStyle = {
        padding: '8px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
        borderRadius: 8, color: 'var(--text-primary)', fontFamily: 'var(--font-code)', fontSize: '0.72rem', cursor: 'pointer',
    };

    const approvedCount  = records.filter(r => r.latest_enrollment_status === 'APPROVED').length;
    const pendingCount   = records.filter(r => r.latest_enrollment_status === 'PENDING').length;
    const corRelCount    = records.filter(r => r.latest_cor_release_status === 'RELEASED').length;
    const irregularCount = records.filter(r => r.is_irregular).length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 24 }}>
            <PageHeader
                subtitle="Read-only roster of all enrolled students with enrollment and COR release status"
                actions={
                    <button
                        id="export-student-records-btn"
                        onClick={() => {
                            const params = new URLSearchParams();
                            if (search) params.set('search', search);
                            if (course !== 'All Courses') params.set('course', course);
                            if (year !== 'All Years') params.set('year_level', year);
                            const qs = params.toString();
                            downloadCSV(
                                `/enrollment/export/student-records.csv${qs ? '?' + qs : ''}`,
                                'student-records.csv'
                            ).catch(() => toast.error('Export failed. Try a narrower filter.'));
                        }}
                        style={{
                            padding: '7px 14px', fontFamily: 'var(--font-code)', fontSize: '0.68rem',
                            fontWeight: 700, background: 'var(--bg-surface)',
                            border: '1px solid var(--border-default)', borderRadius: 8,
                            color: 'var(--text-secondary)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 6,
                        }}
                    >
                        ⬇ Export CSV
                    </button>
                }
            />

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {[
                    { label: 'Total Students', value: total,         color: 'var(--text-primary)' },
                    { label: 'Approved',        value: approvedCount, color: 'var(--accent)' },
                    { label: 'COR Released',    value: corRelCount,   color: 'var(--color-success, #22c55e)' },
                    { label: 'Irregular',       value: irregularCount,color: 'var(--color-warning)' },
                ].map(s => (
                    <div key={s.label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 12, padding: '14px 18px' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                        <div style={{ fontFamily: 'var(--font-code)', fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Search */}
                <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200 }}>
                    <SearchIcon size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <input
                        ref={searchRef}
                        value={search}
                        onChange={e => handleSearchChange(e.target.value)}
                        placeholder="Search by name or student number…"
                        style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px 9px 36px', background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 8, color: 'var(--text-primary)', fontFamily: 'var(--font-code)', fontSize: '0.78rem', outline: 'none' }}
                        onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
                        onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; }}
                    />
                </div>

                <select value={course} onChange={e => handleCourse(e.target.value)} style={selectStyle}>
                    {COURSE_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <select value={year} onChange={e => handleYear(e.target.value)} style={selectStyle}>
                    {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y === 'All Years' ? y : `Year ${y}`}</option>)}
                </select>

                <button
                    onClick={handleRefresh}
                    style={{ padding: '8px 14px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 8, color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-code)', fontSize: '0.68rem' }}
                >
                    <RefreshIcon size={14} spinning={loading} />
                    {loading ? 'Loading…' : 'Refresh'}
                </button>

                <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-code)', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    {total} record{total !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Table */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 16, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-code)', fontSize: '0.78rem' }}>Loading…</div>
                ) : records.length === 0 ? (
                    <EmptyState title="No students found" subtitle="Try adjusting the search or filters." />
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-code)', fontSize: '0.78rem' }}>
                            <THead cols={['Student Name', 'Student No.', 'Course', 'Year', 'Sem', 'Enrollment', 'COR Release', 'Irregular']} />
                            <tbody>
                                {records.map((r, i) => (
                                    <tr key={r.student_account_id} style={{ borderBottom: i < records.length - 1 ? '1px solid var(--border-default)' : 'none' }}>
                                        <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontWeight: 600 }}>
                                            {r.student_name}
                                        </td>
                                        <td style={{ padding: '12px 16px', color: 'var(--accent)' }}>
                                            {r.student_number ?? '—'}
                                        </td>
                                        <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                                            {r.course ?? '—'}
                                        </td>
                                        <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                                            {r.year_level ?? '—'}
                                        </td>
                                        <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                                            {r.semester ?? '—'}
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            {r.latest_enrollment_status ? (
                                                <StatusBadge
                                                    variant={ENROLLMENT_VARIANT[r.latest_enrollment_status] ?? 'muted'}
                                                    label={r.latest_enrollment_status}
                                                    showDot={false}
                                                />
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>No record</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            {r.latest_cor_release_status ? (
                                                <StatusBadge
                                                    variant={COR_VARIANT[r.latest_cor_release_status] ?? 'muted'}
                                                    label={r.latest_cor_release_status}
                                                    showDot={false}
                                                />
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>—</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                            {r.is_irregular ? (
                                                <span style={{ fontFamily: 'var(--font-code)', fontSize: '0.62rem', color: 'var(--color-warning)', fontWeight: 700 }}>IRR</span>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <p style={{ fontFamily: 'var(--font-code)', fontSize: '0.62rem', color: 'var(--text-muted)', margin: 0 }}>
                Read-only view. COR release is managed from the Secretariat portal.
            </p>
        </div>
    );
};

export default StudentRecords;
