// frontend/src/features/admin/pages/AdminGrading.jsx
// READ-ONLY Academic Records viewer.
// Admins can inspect a student's transcript but cannot modify any grade.

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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

// ── SE-04: At-Risk panel ───────────────────────────────────────────────────
const RISK_COLOR = { HIGH: 'var(--color-danger)', MODERATE: 'var(--color-warning)', LOW: 'var(--color-success)' };
const RISK_BG    = { HIGH: 'rgba(239,68,68,0.06)', MODERATE: 'rgba(245,158,11,0.06)', LOW: 'rgba(34,197,94,0.06)' };

const AtRiskPanel = ({ students, loading, onViewStudent, searchResults }) => {
    if (loading) return (
        <CyberPanel title="At-Risk Intelligence" subtitle="Loading at-risk assessment…">
            <Skeleton.Table rows={3} cols={4} />
        </CyberPanel>
    );
    if (!students || students.length === 0) return (
        <CyberPanel title="At-Risk Intelligence" subtitle="Rule-based risk assessment across all active students">
            <EmptyState icon="✅" title="No at-risk students detected" subtitle="All active students are below the moderate threshold (score ≥ 40)." compact />
        </CyberPanel>
    );

    const highlighted = (searchResults ?? []).map(s => s.account_id);

    return (
        <CyberPanel
            title="At-Risk Intelligence"
            subtitle={`${students.length} student${students.length !== 1 ? 's' : ''} flagged (score ≥ 40) — rule-based engine, zero AI cost`}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {students.map(s => {
                    const color  = RISK_COLOR[s.risk_level] || 'var(--text-muted)';
                    const bg     = RISK_BG[s.risk_level]    || 'transparent';
                    const isHl   = highlighted.includes(s.student_account_id);
                    return (
                        <div
                            key={s.student_account_id}
                            style={{
                                background: isHl ? 'rgba(186,151,49,0.06)' : bg,
                                border: `1px solid ${isHl ? 'rgba(186,151,49,0.35)' : `${color}28`}`,
                                borderRadius: 8, padding: '12px 14px',
                                display: 'flex', gap: 12, alignItems: 'flex-start',
                            }}
                        >
                            {/* Score badge */}
                            <div style={{
                                minWidth: 44, height: 44, borderRadius: 8, flexShrink: 0,
                                background: `${color}12`, border: `1px solid ${color}30`,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '1rem', fontWeight: 800, color, lineHeight: 1 }}>
                                    {s.risk_score}
                                </span>
                                <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.48rem', color, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                    {s.risk_level}
                                </span>
                            </div>
                            {/* Info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                    <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                        {s.student_name}
                                    </span>
                                    {s.student_number && (
                                        <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.60rem', color: 'var(--accent-light)' }}>
                                            #{s.student_number}
                                        </span>
                                    )}
                                    {s.failed_major_count > 0 && (
                                        <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.56rem', padding: '2px 6px', borderRadius: 4, background: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                            {s.failed_major_count} MAJOR FAIL{s.failed_major_count > 1 ? 'S' : ''}
                                        </span>
                                    )}
                                    {s.gwa != null && (
                                        <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.56rem', color: gradeColor(s.gwa) }}>
                                            GWA {s.gwa}
                                        </span>
                                    )}
                                </div>
                                {s.top_intervention && (
                                    <p style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.64rem', color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.45 }}>
                                        › {s.top_intervention}
                                    </p>
                                )}
                            </div>
                            {/* Action */}
                            <button
                                style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.58rem', color: 'var(--accent-light)', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', paddingTop: 2 }}
                                onClick={() => onViewStudent({ account_id: s.student_account_id, email_address: s.email_address })}
                            >
                                VIEW →
                            </button>
                        </div>
                    );
                })}
            </div>
        </CyberPanel>
    );
};

// ── INC Posting Queue ──────────────────────────────────────────────────────
const INCPostingQueue = () => {
    const { toast } = useToast();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rejectTarget, setRejectTarget] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [processing, setProcessing] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const data = await adminApi.fetchINCPostingQueue();
            setRequests(data ?? []);
        } catch {
            toast.error('Failed to load INC posting queue.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handlePost = async (req) => {
        setProcessing(true);
        try {
            await adminApi.advanceINCCompletion(req.id, { new_state: 'POSTED' });
            toast.success(`INC grade posted for request #${req.id}.`);
            setRequests(prev => prev.filter(r => r.id !== req.id));
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to post grade.');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!rejectTarget || !rejectReason.trim()) return;
        setProcessing(true);
        try {
            await adminApi.advanceINCCompletion(rejectTarget.id, {
                new_state: 'REJECTED',
                rejection_reason: rejectReason.trim(),
            });
            toast.success(`INC request #${rejectTarget.id} rejected.`);
            setRequests(prev => prev.filter(r => r.id !== rejectTarget.id));
            setRejectTarget(null);
            setRejectReason('');
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to reject request.');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <CyberPanel title="INC Posting Queue"><Skeleton.Table rows={4} cols={5} /></CyberPanel>;

    return (
        <>
            <CyberPanel
                title="INC Posting Queue"
                subtitle={`${requests.length} completion request${requests.length !== 1 ? 's' : ''} awaiting grade posting`}
            >
                {requests.length === 0 ? (
                    <EmptyState icon="✅" title="Queue is clear" subtitle="No INC completion requests are pending admin posting." compact />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {requests.map(req => (
                            <div key={req.id} style={{
                                background: 'var(--bg-depth)', border: '1px solid var(--border-subtle)',
                                borderRadius: 10, padding: '14px 16px',
                                display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
                            }}>
                                <div style={{ flex: 1, minWidth: 160 }}>
                                    <p style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 2 }}>Request #{req.id}</p>
                                    <p style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                        Student #{req.student_account_id}
                                    </p>
                                    <p style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.64rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                        Gradebook entry #{req.gradebook_entry_id}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.58rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Faculty Grade</p>
                                    <p style={{ fontFamily: 'var(--font-terminal)', fontSize: '1.3rem', fontWeight: 800, color: gradeColor(req.faculty_final_grade) }}>
                                        {req.faculty_final_grade ?? '—'}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button
                                        className="btn-primary"
                                        style={{ fontSize: '0.6rem', padding: '6px 14px' }}
                                        onClick={() => handlePost(req)}
                                        disabled={processing}
                                    >
                                        POST GRADE
                                    </button>
                                    <button
                                        className="btn-danger"
                                        style={{ fontSize: '0.6rem', padding: '6px 14px' }}
                                        onClick={() => { setRejectTarget(req); setRejectReason(''); }}
                                        disabled={processing}
                                    >
                                        REJECT
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CyberPanel>

            {rejectTarget && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 460, boxShadow: 'var(--shadow-accent)' }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                            Reject INC Request #{rejectTarget.id}
                        </h3>
                        <p style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 18 }}>
                            Student #{rejectTarget.student_account_id} · Faculty grade: {rejectTarget.faculty_final_grade ?? '—'}
                        </p>
                        <label style={{ display: 'block', fontFamily: 'var(--font-terminal)', fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                            Rejection Reason *
                        </label>
                        <textarea
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            rows={3}
                            placeholder="Explain why this grade cannot be posted…"
                            style={{ width: '100%', boxSizing: 'border-box', background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '10px 12px', color: 'var(--text-primary)', fontFamily: 'var(--font-code)', fontSize: '0.78rem', outline: 'none', resize: 'vertical' }}
                            onFocus={e => { e.target.style.borderColor = 'var(--color-danger)'; }}
                            onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; }}
                        />
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                            <button className="btn-ghost" onClick={() => setRejectTarget(null)} disabled={processing}>Cancel</button>
                            <button
                                className="btn-danger"
                                onClick={handleReject}
                                disabled={processing || !rejectReason.trim()}
                            >
                                {processing ? 'Processing…' : 'CONFIRM REJECT'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// ── Main component ─────────────────────────────────────────────────────────
const AdminGrading = () => {
    const { toast } = useToast();

    const [viewTab, setViewTab] = useState('transcript');
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [viewingStudent, setViewingStudent] = useState(null);
    const [loadingRecord, setLoadingRecord] = useState(false);
    const [error, setError] = useState(null);

    // SE-04 — at-risk list
    const [atRiskStudents, setAtRiskStudents] = useState([]);
    const [loadingAtRisk, setLoadingAtRisk] = useState(true);

    useEffect(() => {
        adminApi.fetchAtRiskStudents(40)
            .then(data => setAtRiskStudents(data ?? []))
            .catch(() => {})
            .finally(() => setLoadingAtRisk(false));
    }, []);

    // Deep-link from command palette: ?studentId=<account_id>
    const [searchParams, setSearchParams] = useSearchParams();
    useEffect(() => {
        const studentId = Number(searchParams.get('studentId'));
        if (!studentId || viewingStudent) return;
        setSearchParams({}, { replace: true }); // clean URL
        openStudentRecord({ account_id: studentId, email_address: `#${studentId}` });
    }, [searchParams]);

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
                subtitle="Read-only transcript viewer · INC grade posting queue."
                badge={viewOnlyBadge}
            />

            {/* Tab switcher */}
            <div style={{ display: 'flex', gap: 8 }}>
                {[
                    { id: 'transcript', label: 'Transcript Viewer' },
                    { id: 'inc-posting', label: 'INC Posting Queue' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setViewTab(tab.id)}
                        style={{
                            padding: '7px 18px', borderRadius: 100, cursor: 'pointer', transition: 'all 0.15s',
                            fontFamily: 'var(--font-terminal)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.05em',
                            border: '1px solid var(--border-default)',
                            background: viewTab === tab.id ? 'var(--portal-accent)' : 'var(--bg-surface)',
                            color: viewTab === tab.id ? '#fff' : 'var(--text-secondary)',
                            boxShadow: viewTab === tab.id ? 'var(--shadow-accent)' : 'none',
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {viewTab === 'inc-posting' && <INCPostingQueue />}

            {viewTab === 'transcript' && error && (
                <div style={{ background: 'var(--color-danger-bg)', border: '1px solid var(--border-critical)', borderRadius: 6, padding: '10px 14px', fontFamily: 'var(--font-terminal)', fontSize: '0.72rem', color: 'var(--color-danger)' }}>
                    {error}
                </div>
            )}

            {/* ── Search view ──────────────────────────────────────────────── */}
            {viewTab === 'transcript' && !viewingStudent && !loadingRecord && (
                <>
                    <AtRiskPanel
                        students={atRiskStudents}
                        loading={loadingAtRisk}
                        onViewStudent={openStudentRecord}
                        searchResults={results}
                    />
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
            {viewTab === 'transcript' && loadingRecord && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <Skeleton.Card />
                    <Skeleton.Table rows={5} cols={5} />
                </div>
            )}

            {/* ── Transcript view ──────────────────────────────────────────── */}
            {viewTab === 'transcript' && viewingStudent && !loadingRecord && (
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