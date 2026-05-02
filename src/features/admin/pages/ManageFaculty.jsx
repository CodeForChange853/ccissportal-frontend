// frontend/src/features/admin/pages/ManageFaculty.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { adminApi } from '../api/adminApi';
import FacultyHeatmap from '../components/FacultyHeatmap';
import CyberPanel from '../../../components/ui/CyberPanel';
import Skeleton from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import { useToast } from '../../../context/ToastContext';
import StatusBadge from '../../../components/ui/StatusBadge';
import DataReadout from '../../../components/ui/DataReadout';
import LoadBar from '../../../components/ui/LoadBar';

// ── Cell renderers ─────────────────────────────────────────────────────────
const LoadBarCellRenderer = ({ data }) => (
    <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <LoadBar current={data.current_teaching_load} max={data.maximum_teaching_load} />
    </div>
);

const FacultyStatusCellRenderer = ({ data }) => {
    const full = data.current_teaching_load >= data.maximum_teaching_load;
    return (
        <StatusBadge
            variant={full ? 'critical' : data.is_available_for_classes ? 'normal' : 'warning'}
            label={full ? 'AT CAPACITY' : data.is_available_for_classes ? 'AVAILABLE' : 'UNAVAILABLE'}
        />
    );
};

const ManageFaculty = () => {
    const [faculty, setFaculty] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Updated state for Multi-Select
    const [selectedFaculty, setSelectedFaculty] = useState('');
    const [selectedSubjects, setSelectedSubjects] = useState([]);

    const [viewMode, setViewMode] = useState('table');

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [fl, cl] = await Promise.all([adminApi.fetchFacultyList(), adminApi.fetchCurriculum()]);
            setFaculty(fl); setSubjects(cl);
        } catch { toast.error('Failed to load faculty or curriculum data.'); }
        finally { setLoading(false); }
    };

    const toggleSubject = (subjectId) => {
        setSelectedSubjects(prev =>
            prev.includes(subjectId)
                ? prev.filter(id => id !== subjectId)
                : [...prev, subjectId]
        );
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        if (!selectedFaculty || selectedSubjects.length === 0) return;
        setSubmitting(true); setError(null); setSuccess(null);
        try {
            const result = await adminApi.assignBulkFacultyLoad({
                faculty_account_id: parseInt(selectedFaculty),
                curriculum_subject_ids: selectedSubjects.map(id => parseInt(id)),
            });
            toast.success(result.message || `Assignment confirmed.`);
            setSelectedFaculty('');
            setSelectedSubjects([]); // Clear selections
            setFaculty(await adminApi.fetchFacultyList());
        } catch (err) {
            const errorMsg = err.response?.data?.detail || 'Assignment failed — professor may be at maximum load.';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally { setSubmitting(false); }
    };

    const selectStyle = { width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 6, padding: '9px 12px', fontFamily: 'var(--font-terminal)', fontSize: '0.75rem', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer' };

    // ── AG Grid config ────────────────────────────────────────────────────
    const columnDefs = useMemo(() => [
        {
            field: 'email_address',
            headerName: 'Email',
            flex: 3,
            cellStyle: { fontFamily: 'var(--font-terminal)', fontSize: '0.75rem' },
        },
        {
            field: 'academic_department',
            headerName: 'Department',
            flex: 2,
            cellStyle: { fontFamily: 'var(--font-terminal)', fontSize: '0.72rem', color: 'var(--text-muted)' },
        },
        {
            headerName: 'Load',
            flex: 2,
            cellRenderer: LoadBarCellRenderer,
            sortable: false,
        },
        {
            headerName: 'Status',
            flex: 2,
            cellRenderer: FacultyStatusCellRenderer,
            sortable: false,
        },
    ], []);

    const defaultColDef = useMemo(() => ({
        sortable: true,
        resizable: true,
        suppressMovable: true,
    }), []);

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Skeleton.PageHeader />
            <Skeleton.KpiStrip count={3} />
            <Skeleton.Table rows={6} cols={4} />
        </div>
    );

    const atCapacity = faculty.filter(f => f.current_teaching_load >= f.maximum_teaching_load).length;
    const available = faculty.filter(f => f.is_available_for_classes).length;

    // Calculate dynamic load preview
    const selectedProf = faculty.find(f => f.account_id === parseInt(selectedFaculty));
    const projectedLoad = selectedProf ? selectedProf.current_teaching_load + selectedSubjects.length : 0;
    const isOverload = selectedProf && projectedLoad > selectedProf.maximum_teaching_load;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                        Faculty Load Balancer
                    </h1>
                    <p style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 5 }}>
                        The AI enforces maximum teaching load limits on all assignments.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    {['table', 'heatmap'].map(m => (
                        <button key={m} className={viewMode === m ? 'btn-primary' : 'btn-ghost'} style={{ fontSize: '0.6rem', padding: '6px 14px' }} onClick={() => setViewMode(m)}>
                            {m.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                    { label: 'TOTAL FACULTY', value: faculty.length, color: 'var(--neon-cyan)' },
                    { label: 'AVAILABLE', value: available, color: 'var(--neon-green)' },
                    { label: 'AT CAPACITY', value: atCapacity, color: atCapacity > 0 ? 'var(--neon-red)' : 'var(--neon-green)' },
                ].map(({ label, value, color }) => (
                    <div key={label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '14px 16px' }}>
                        <DataReadout label={label} value={value} color={color} size="sm" />
                    </div>
                ))}
            </div>

            {/* Bulk Assignment form */}
            <CyberPanel title="Bulk Assign Subjects" variant="warning">
                {error && <div style={{ background: 'var(--color-danger-bg)', border: '1px solid var(--border-critical)', borderRadius: 6, padding: '8px 12px', fontFamily: 'var(--font-terminal)', fontSize: '0.72rem', color: 'var(--neon-red)', marginBottom: 12 }}>{error}</div>}
                {success && <div style={{ background: 'var(--color-success-bg)', border: '1px solid var(--color-success-bd)', borderRadius: 6, padding: '8px 12px', fontFamily: 'var(--font-terminal)', fontSize: '0.72rem', color: 'var(--neon-green)', marginBottom: 12 }}>{success}</div>}

                <form onSubmit={handleAssign} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* Top Row: Professor Selection & Projected Load */}
                    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.55rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>Target Professor</label>
                            <select required value={selectedFaculty} onChange={e => setSelectedFaculty(e.target.value)} style={selectStyle}>
                                <option value="">Select professor…</option>
                                {faculty.map(f => (
                                    <option key={f.account_id} value={f.account_id} disabled={f.current_teaching_load >= f.maximum_teaching_load}>
                                        {f.email_address} — {f.current_teaching_load}/{f.maximum_teaching_load} classes
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedProf && (
                            <div style={{ padding: '8px 16px', background: 'var(--bg-depth)', borderRadius: 6, border: `1px solid ${isOverload ? 'var(--neon-red)' : 'var(--border-default)'}`, flexShrink: 0 }}>
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>PROJECTED LOAD: </span>
                                <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: isOverload ? 'var(--neon-red)' : 'var(--accent)' }}>
                                    {projectedLoad} / {selectedProf.maximum_teaching_load}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Bottom Row: Multi-Select Subject List */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                            <label style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.55rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Subjects to Assign ({selectedSubjects.length} selected)</label>
                        </div>
                        <div style={{
                            maxHeight: '180px', overflowY: 'auto', background: 'var(--bg-input)',
                            border: '1px solid var(--border-default)', borderRadius: 6, padding: '8px'
                        }}>
                            {subjects.map(s => (
                                <label key={s.subject_id} style={{
                                    display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px',
                                    cursor: 'pointer', borderRadius: 4,
                                    background: selectedSubjects.includes(s.subject_id) ? 'rgba(212, 168, 32, 0.1)' : 'transparent',
                                    transition: 'background 0.2s'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedSubjects.includes(s.subject_id)}
                                        onChange={() => toggleSubject(s.subject_id)}
                                        style={{ accentColor: 'var(--accent)' }}
                                    />
                                    <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.75rem', color: selectedSubjects.includes(s.subject_id) ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                        <strong>{s.subject_code}</strong> — {s.subject_title}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="submit" className="btn-primary" disabled={submitting || isOverload || selectedSubjects.length === 0} style={{ padding: '10px 24px' }}>
                            {submitting ? 'PROCESSING BATCH...' : 'CONFIRM BULK ASSIGNMENT'}
                        </button>
                    </div>
                </form>
            </CyberPanel>

            {/* Faculty list or heatmap */}
            {viewMode === 'heatmap' ? (
                <CyberPanel title="Load Heatmap" subtitle="Visual distribution of teaching load">
                    <FacultyHeatmap faculty={faculty} />
                </CyberPanel>
            ) : (
                <CyberPanel title="Faculty Roster" subtitle={`${faculty.length} instructors`}>
                    <div className="ag-theme-quartz" style={{ width: '100%' }}>
                        <AgGridReact
                            theme="legacy"
                            rowData={faculty}
                            columnDefs={columnDefs}
                            defaultColDef={defaultColDef}
                            domLayout="autoHeight"
                            rowHeight={44}
                            headerHeight={36}
                            suppressCellFocus
                            getRowId={params => String(params.data.account_id)}
                        />
                    </div>
                </CyberPanel>
            )}
        </div>
    );
};

export default ManageFaculty;