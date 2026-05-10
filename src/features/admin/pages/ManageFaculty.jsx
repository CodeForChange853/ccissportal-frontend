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
import { UsersIcon, FacultyIcon, ShieldIcon, LoadIcon } from '../../../components/icons';

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 900, letterSpacing: '0.02em', color: 'var(--text-primary)' }}>
                        Faculty Load Balancer
                    </h1>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                        Intelligent teaching load enforcement and semestral balancing.
                    </p>
                </div>
                <div style={{ 
                    display: 'flex', gap: 4, 
                    background: 'var(--bg-depth)', 
                    padding: 4, borderRadius: 10,
                    border: '1px solid var(--border-default)' 
                }}>
                    {[
                        { id: 'table', label: 'ROSTER' },
                        { id: 'heatmap', label: 'HEATMAP' }
                    ].map(m => (
                        <button 
                            key={m.id} 
                            style={{ 
                                fontSize: '0.6rem', 
                                fontWeight: 800,
                                padding: '6px 16px',
                                borderRadius: 8,
                                border: 'none',
                                cursor: 'pointer',
                                background: viewMode === m.id ? 'var(--bg-surface)' : 'transparent',
                                color: viewMode === m.id ? 'var(--text-primary)' : 'var(--text-muted)',
                                boxShadow: viewMode === m.id ? 'var(--shadow-card)' : 'none',
                                transition: 'all 0.2s'
                            }} 
                            onClick={() => setViewMode(m.id)}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {[
                    { label: 'Total Faculty', value: faculty.length, color: 'var(--accent)', icon: <UsersIcon size={18} /> },
                    { label: 'Available Units', value: available, color: 'var(--color-success)', icon: <FacultyIcon size={18} /> },
                    { label: 'At Capacity', value: atCapacity, color: atCapacity > 0 ? 'var(--color-danger)' : 'var(--color-success)', icon: <ShieldIcon size={18} /> },
                ].map(({ label, value, color, icon }) => (
                    <div key={label} style={{ 
                        background: 'var(--bg-surface)', 
                        border: '1px solid var(--border-default)', 
                        borderRadius: 16, 
                        padding: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        boxShadow: 'var(--shadow-card)'
                    }}>
                        <div style={{ 
                            width: 44, height: 44, borderRadius: 12, 
                            background: `${color}10`, color: color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {icon}
                        </div>
                        <DataReadout label={label} value={value} size="sm" />
                    </div>
                ))}
            </div>

            {/* Bulk Assignment form */}
            <div style={{ 
                background: 'var(--bg-sidebar)', 
                borderRadius: 24, 
                padding: 24, 
                color: '#fff',
                boxShadow: 'var(--shadow-accent)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }}>
                    <LoadIcon size={120} />
                </div>

                <div style={{ marginBottom: 24 }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>Load Assignment Console</h2>
                    <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>AI-powered subject distribution for semestral faculty load</p>
                </div>

                <form onSubmit={handleAssign} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        {/* Target Professor */}
                        <div>
                            <label style={{ 
                                fontFamily: 'var(--font-terminal)', fontSize: '0.6rem', 
                                fontWeight: 800, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', 
                                display: 'block', marginBottom: 8, textTransform: 'uppercase' 
                            }}>Target Professor</label>
                            <select 
                                required value={selectedFaculty} 
                                onChange={e => setSelectedFaculty(e.target.value)} 
                                style={{
                                    ...selectStyle,
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#fff',
                                    padding: '12px',
                                    borderRadius: 12
                                }}
                            >
                                <option value="" style={{ background: '#111' }}>Select instructor…</option>
                                {faculty.map(f => (
                                    <option key={f.account_id} value={f.account_id} disabled={f.current_teaching_load >= f.maximum_teaching_load} style={{ background: '#111' }}>
                                        {f.email_address} ({f.current_teaching_load}/{f.maximum_teaching_load})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Projected Load Preview */}
                        <div style={{ 
                            background: 'rgba(0,0,0,0.2)', 
                            borderRadius: 16, 
                            border: `1px solid ${isOverload ? 'rgba(220,38,38,0.3)' : 'rgba(255,255,255,0.05)'}`,
                            padding: '16px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div>
                                <p style={{ fontSize: '0.62rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Projected Load</p>
                                <p style={{ fontSize: '1.2rem', fontWeight: 900, color: isOverload ? 'var(--color-danger)' : 'var(--student-gold)', marginTop: 2 }}>
                                    {selectedProf ? projectedLoad : '—'} / {selectedProf?.maximum_teaching_load ?? '—'}
                                </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '0.62rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Status</p>
                                <p style={{ 
                                    fontSize: '0.7rem', fontWeight: 800, 
                                    color: isOverload ? 'var(--color-danger)' : selectedProf ? 'var(--color-success)' : 'rgba(255,255,255,0.2)',
                                    marginTop: 4
                                }}>
                                    {isOverload ? '⚠ OVERLOAD' : selectedProf ? 'READY' : 'WAITING'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Subjects Grid */}
                    <div>
                        <label style={{ 
                            fontFamily: 'var(--font-terminal)', fontSize: '0.6rem', 
                            fontWeight: 800, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', 
                            display: 'block', marginBottom: 10, textTransform: 'uppercase' 
                        }}>
                            Subjects to Assign ({selectedSubjects.length})
                        </label>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                            gap: 8,
                            maxHeight: 200,
                            overflowY: 'auto',
                            padding: 12,
                            background: 'rgba(0,0,0,0.2)',
                            borderRadius: 16,
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            {subjects.map(s => (
                                <label key={s.subject_id} style={{
                                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                                    cursor: 'pointer', borderRadius: 12,
                                    background: selectedSubjects.includes(s.subject_id) ? 'rgba(218,206,132,0.1)' : 'rgba(255,255,255,0.02)',
                                    border: `1px solid ${selectedSubjects.includes(s.subject_id) ? 'rgba(218,206,132,0.3)' : 'transparent'}`,
                                    transition: 'all 0.2s'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedSubjects.includes(s.subject_id)}
                                        onChange={() => toggleSubject(s.subject_id)}
                                        style={{ accentColor: 'var(--student-gold)', width: 16, height: 16 }}
                                    />
                                    <div style={{ minWidth: 0 }}>
                                        <p style={{ fontSize: '0.75rem', fontWeight: 800, color: selectedSubjects.includes(s.subject_id) ? 'var(--student-gold)' : '#fff', truncate: true }}>
                                            {s.subject_code}
                                        </p>
                                        <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', truncate: true }}>
                                            {s.subject_title}
                                        </p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
                        <button 
                            type="submit" 
                            disabled={submitting || isOverload || selectedSubjects.length === 0} 
                            style={{ 
                                padding: '12px 32px',
                                borderRadius: 12,
                                background: 'var(--student-gold)',
                                color: '#000',
                                border: 'none',
                                fontSize: '0.75rem',
                                fontWeight: 900,
                                letterSpacing: '0.05em',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: '0 4px 12px rgba(201,168,76,0.3)'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            {submitting ? 'EXECUTING BATCH...' : 'CONFIRM ASSIGNMENTS'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Faculty list or heatmap */}
            {viewMode === 'heatmap' ? (
                <CyberPanel title="Load Heatmap" subtitle="Real-time distribution of teaching units">
                    <FacultyHeatmap faculty={faculty} />
                </CyberPanel>
            ) : (
                <CyberPanel title="Faculty Roster" subtitle={`Managed registry of ${faculty.length} academic staff`}>
                    <div className="ag-theme-quartz" style={{ width: '100%', borderRadius: 12, overflow: 'hidden' }}>
                        <AgGridReact
                            theme="legacy"
                            rowData={faculty}
                            columnDefs={columnDefs}
                            defaultColDef={defaultColDef}
                            domLayout="autoHeight"
                            rowHeight={48}
                            headerHeight={40}
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