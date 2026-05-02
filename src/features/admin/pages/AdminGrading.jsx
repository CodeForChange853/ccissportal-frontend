// frontend/src/features/admin/pages/AdminGrading.jsx
// READ-ONLY Academic Records viewer.
// Admins can inspect a student's transcript but cannot modify any grade.

import React, { useState, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
ModuleRegistry.registerModules([AllCommunityModule]);
import { adminApi } from '../api/adminApi';
import { useToast } from '../../../context/ToastContext';
import CyberPanel from '../../../components/ui/CyberPanel';
import StatusBadge from '../../../components/ui/StatusBadge';
import DataReadout from '../../../components/ui/DataReadout';
import Skeleton from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import PageHeader from '../../../components/ui/PageHeader';
import { GRADE_STATUS_VARIANT } from '../../../constants/statusVariants';
import { computeGWA } from '../../../utils/gradeUtils';

const gradeColor = (g) => {
    if (!g && g !== 0) return 'var(--text-muted)';
    if (g <= 1.5) return 'var(--color-success)';
    if (g <= 2.5) return 'var(--accent-light)';
    if (g <= 3.0) return 'var(--color-warning)';
    return 'var(--color-danger)';
};

// ── Read-only cell renderers ───────────────────────────────────────────────
const SubjectCodeCell = ({ value }) => (
    <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-light)' }}>
        {value}
    </span>
);

const GradeCell = ({ value }) => (
    <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.78rem', fontWeight: 600, color: gradeColor(value) }}>
        {value ?? '—'}
    </span>
);

const StatusCell = ({ value }) => (
    // ✅ Using shared GRADE_STATUS_VARIANT
    <StatusBadge variant={GRADE_STATUS_VARIANT[value] ?? 'muted'} label={value} showDot={false} />
);

// ── Transcript summary bar ─────────────────────────────────────────────────
const TranscriptSummary = ({ records }) => {
    const passed = records.filter(r => r.completion_status === 'PASSED').length;
    const failed = records.filter(r => r.completion_status === 'FAILED').length;
    const ongoing = records.filter(r => r.completion_status === 'IN PROGRESS').length;
    const dropped = records.filter(r => r.completion_status === 'DROPPED').length;

    // ✅ Using shared computeGWA — matches StudentDashboard calculation exactly
    const gwaVal = computeGWA(records);
    const gwa = gwaVal !== null ? String(gwaVal) : '—';

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginBottom: 16 }}>
            {[
                { label: 'Total Subjects', value: records.length, color: 'var(--text-terminal)' },
                { label: 'Passed', value: passed, color: 'var(--color-success)' },
                { label: 'Failed', value: failed, color: failed > 0 ? 'var(--color-danger)' : 'var(--color-success)' },
                { label: 'In Progress', value: ongoing, color: 'var(--color-warning)' },
                { label: 'Dropped', value: dropped, color: 'var(--text-muted)' },
                { label: 'Current GWA', value: gwa, color: 'var(--accent-light)' },
            ].map(({ label, value, color }) => (
                <div key={label} style={{ background: 'var(--bg-depth)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '12px 14px' }}>
                    <DataReadout label={label} value={value} color={color} size="sm" />
                </div>
            ))}
        </div>
    );
};

// ── Main component ─────────────────────────────────────────────────────────
const AdminGrading = () => {
    const { toast } = useToast();

    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [viewingStudent, setViewingStudent] = useState(null);
    const [loadingRecord, setLoadingRecord] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        e?.preventDefault();
        if (!query.trim()) return;
        setSearching(true); setHasSearched(true); setViewingStudent(null); setError(null);
        try {
            const data = await adminApi.searchUsers(query.trim());
            setResults((data ?? []).filter(u => u.account_role === 'STUDENT'));
        } catch {
            setError('Search failed. Check API connection.');
        } finally { setSearching(false); }
    };

    const openStudentRecord = async (student) => {
        setLoadingRecord(true); setError(null);
        try {
            const data = await adminApi.fetchStudentGrades(student.account_id);
            const records = data?.records ?? [];
            setViewingStudent({ ...student, records });
        } catch {
            toast.error('Failed to load academic records.');
        } finally { setLoadingRecord(false); }
    };

    // ── AG Grid — fully read-only ─────────────────────────────────────────
    const columnDefs = useMemo(() => [
        { field: 'subject_code', headerName: 'Code', flex: 1, cellRenderer: SubjectCodeCell },
        { field: 'subject_title', headerName: 'Subject', flex: 3, cellStyle: { fontSize: '0.78rem' } },
        { field: 'midterm_grade', headerName: 'Midterm', flex: 1, cellRenderer: GradeCell },
        { field: 'final_grade', headerName: 'Final', flex: 1, cellRenderer: GradeCell },
        { field: 'completion_status', headerName: 'Status', flex: 2, cellRenderer: StatusCell },
        { field: 'term', headerName: 'Term', flex: 1, cellStyle: { fontFamily: 'var(--font-terminal)', fontSize: '0.70rem', color: 'var(--text-muted)' } },
    ], []);

    const defaultColDef = useMemo(() => ({
        sortable: true, resizable: true, suppressMovable: true,
    }), []);

    const inputStyle = {
        width: '100%', background: 'var(--bg-input)',
        border: '1px solid var(--border-default)', borderRadius: 6,
        padding: '9px 12px', fontFamily: 'var(--font-terminal)',
        fontSize: '0.78rem', color: 'var(--text-primary)', outline: 'none',
    };

    // ✅ "View Only" badge for the PageHeader right slot
    const viewOnlyBadge = (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-depth)', border: '1px solid var(--border-subtle)', borderRadius: 6, padding: '6px 12px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-warning)', flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.58rem', letterSpacing: '0.02em', color: 'var(--color-warning)' }}>VIEW ONLY</span>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* ✅ Shared PageHeader */}
            <PageHeader
                title="Academic Records"
                subtitle="Read-only transcript viewer — grade entry is handled by assigned faculty only."
                badge={viewOnlyBadge}
            />

            {error && (
                <div style={{ background: 'var(--color-danger-bg)', border: '1px solid var(--border-critical)', borderRadius: 6, padding: '10px 14px', fontFamily: 'var(--font-terminal)', fontSize: '0.72rem', color: 'var(--color-danger)' }}>
                    {error}
                </div>
            )}

            {/* ── Search view ──────────────────────────────────────────────── */}
            {!viewingStudent && !loadingRecord && (
                <>
                    <CyberPanel title="Student Lookup" subtitle="Search by student email or account ID">
                        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10 }}>
                            <input
                                type="text"
                                placeholder="SEARCH STUDENT EMAIL OR ID..."
                                aria-label="Search student by email or account ID"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                style={{ ...inputStyle, flex: 1 }}
                                onFocus={e => { e.target.style.borderColor = 'var(--border-focus)'; }}
                                onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; }}
                            />
                            <button type="submit" className="btn-primary" disabled={searching}>
                                {searching ? 'SEARCHING...' : 'LOOKUP'}
                            </button>
                        </form>
                    </CyberPanel>

                    {hasSearched && (
                        <CyberPanel title={`${results.length} student${results.length !== 1 ? 's' : ''} found`}>
                            {results.length === 0 ? (
                                <EmptyState icon="🔍" title="No students found" subtitle="Try a different email or account ID." compact />
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {results.map(s => (
                                        <button
                                            key={s.account_id}
                                            onClick={() => openStudentRecord(s)}
                                            style={{ background: 'var(--bg-depth)', border: '1px solid var(--border-subtle)', borderRadius: 6, padding: '12px 16px', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'border-color 0.15s' }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-accent)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                                        >
                                            <div>
                                                <p style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 600 }}>{s.email_address}</p>
                                                <p style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 3 }}>Account #{s.account_id}</p>
                                            </div>
                                            <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.60rem', color: 'var(--accent-light)', letterSpacing: '0.02em' }}>
                                                VIEW TRANSCRIPT →
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </CyberPanel>
                    )}
                </>
            )}

            {/* ── Loading skeleton ─────────────────────────────────────────── */}
            {loadingRecord && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <Skeleton.Card />
                    <Skeleton.Table rows={5} cols={5} />
                </div>
            )}

            {/* ── Transcript view ──────────────────────────────────────────── */}
            {viewingStudent && !loadingRecord && (
                <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <button className="btn-ghost" style={{ fontSize: '0.62rem' }} onClick={() => setViewingStudent(null)}>
                                ← BACK
                            </button>
                            <div>
                                <p style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 600 }}>{viewingStudent.email_address}</p>
                                <p style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.60rem', color: 'var(--text-muted)', marginTop: 2 }}>Account #{viewingStudent.account_id}</p>
                            </div>
                        </div>
                        <StatusBadge variant="info" label="READ ONLY" showDot={false} />
                    </div>

                    {viewingStudent.records?.length > 0 && (
                        <TranscriptSummary records={viewingStudent.records} />
                    )}

                    <CyberPanel title="Transcript" subtitle={`${viewingStudent.records?.length ?? 0} subjects on record`}>
                        {viewingStudent.records?.length === 0 ? (
                            <EmptyState icon="📄" title="No records on file" subtitle="This student has no grade entries in the system yet." compact />
                        ) : (
                            <div className="ag-theme-quartz" data-ag-theme-mode="dark" style={{ width: '100%' }}>
                                <AgGridReact
                                    rowData={viewingStudent.records}
                                    columnDefs={columnDefs}
                                    defaultColDef={defaultColDef}
                                    domLayout="autoHeight"
                                    rowHeight={44}
                                    headerHeight={36}
                                    suppressCellFocus
                                    getRowId={params => params.data.subject_code}
                                />
                            </div>
                        )}
                    </CyberPanel>
                </>
            )}

        </div>
    );
};

export default AdminGrading;