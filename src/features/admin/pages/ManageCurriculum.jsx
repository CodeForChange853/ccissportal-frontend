// frontend/src/features/admin/pages/ManageCurriculum.jsx
// Curriculum organized by Year Level → Semester.
// Now featuring Drag-and-Drop reordering via react-beautiful-dnd.

import React, { useState, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { adminApi } from '../api/adminApi';
import CyberPanel from '../../../components/ui/CyberPanel';
import DataReadout from '../../../components/ui/DataReadout';
import StatusBadge from '../../../components/ui/StatusBadge';
import Skeleton from '../../../components/ui/Skeleton';
import EmptyState from '../../../components/ui/EmptyState';
import InlineConfirm from '../../../components/ui/InlineConfirm';
import { useToast } from '../../../context/ToastContext';

// ── Constants ──────────────────────────────────────────────────────────────
const YEARS = [1, 2, 3, 4];
const YEAR_LABEL = { 1: '1st Year', 2: '2nd Year', 3: '3rd Year', 4: '4th Year' };
const SEM_LABEL = { 1: '1st Semester', 2: '2nd Semester', 3: 'Summer' };
const COURSES = ['BSCS', 'BSIT', 'BSIS', 'COMMON'];
const COURSE_FILTER = ['ALL', ...COURSES];

const EMPTY_FORM = {
    subject_code: '', subject_title: '', credit_units: 3,
    target_year_level: 1, target_semester: 1,
    course: 'BSCS', prereq: '',
};

const inp = {
    background: 'var(--bg-input)', border: '1px solid var(--border-default)',
    borderRadius: 6, padding: '8px 12px', fontFamily: 'var(--font-terminal)',
    fontSize: '0.75rem', color: 'var(--text-primary)', outline: 'none', width: '100%',
};

// ── Draggable Subject Card ──────────────────────────────────────────────────
const CurriculumSubjectCard = ({ sub, index, onDelete }) => {
    const [hovered, setHovered] = useState(false);
    return (
        <Draggable draggableId={String(sub.subject_id)} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    style={{
                        background: snapshot.isDragging ? 'var(--bg-elevated)' : 'var(--bg-depth)',
                        border: `1px solid ${snapshot.isDragging ? 'var(--neon-cyan)' : hovered ? 'var(--border-accent)' : 'var(--border-subtle)'}`,
                        borderRadius: 8, padding: '14px 16px',
                        transition: 'border-color 0.15s',
                        display: 'flex', flexDirection: 'column', gap: 8,
                        boxShadow: snapshot.isDragging ? 'var(--shadow-raised)' : 'none',
                        cursor: 'grab',
                        ...provided.draggableProps.style
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {/* Drag Handle Indicator */}
                            <span style={{ color: 'var(--border-strong)', cursor: 'grab' }}>⠿</span>
                            <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.80rem', fontWeight: 700, color: 'var(--neon-cyan)' }}>
                                {sub.subject_code}
                            </span>
                        </div>
                        <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.58rem', background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)', borderRadius: 4, padding: '2px 7px', letterSpacing: '0.10em' }}>
                            {sub.course || sub.target_course || 'BSCS'}
                        </span>
                    </div>

                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                        {sub.subject_title}
                    </p>

                    {sub.prereq && (
                        <p style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.62rem', color: 'var(--text-muted)', margin: 0 }}>
                            PRE: {sub.prereq}
                        </p>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: 8, marginTop: 4 }}>
                        <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.62rem', color: 'var(--neon-cyan)', letterSpacing: '0.08em' }}>
                            {sub.credit_units} UNITS
                        </span>
                        {hovered && !snapshot.isDragging && (
                            <InlineConfirm
                                trigger={
                                    <button style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.58rem', color: 'var(--neon-red)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.10em', padding: 0 }}>
                                        DELETE
                                    </button>
                                }
                                message={`Remove ${sub.subject_code}?`}
                                confirmLabel="DELETE"
                                variant="danger"
                                onConfirm={() => onDelete(sub.subject_id)}
                            />
                        )}
                    </div>
                </div>
            )}
        </Draggable>
    );
};

// ── Droppable Semester Section ──────────────────────────────────────────────
const SemesterSection = ({ year, sem, subjects, courseFilter, onAddSubject, onDeleteSubject }) => {
    const [open, setOpen] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ ...EMPTY_FORM, target_year_level: year, target_semester: sem });
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState(null);

    const filtered = useMemo(() => {
        let list = subjects.filter(s => s.target_year_level === year && s.target_semester === sem);
        if (courseFilter !== 'ALL') {
            list = list.filter(s => {
                const c = s.course || s.target_course || 'BSCS';
                return c === courseFilter || c === 'COMMON';
            });
        }
        return list;
    }, [subjects, year, sem, courseFilter]);

    const totalUnits = filtered.reduce((sum, s) => sum + (s.credit_units || 0), 0);
    const droppableId = `sem-${year}-${sem}`;

    const handleSubmit = async (e) => {
        e.preventDefault(); setSubmitting(true); setFormError(null);
        try {
            await onAddSubject({ ...form, target_year_level: year, target_semester: sem });
            setForm({ ...EMPTY_FORM, target_year_level: year, target_semester: sem });
            setShowForm(false);
        } catch (err) {
            setFormError(err.response?.data?.detail || 'Failed to add subject.');
        } finally { setSubmitting(false); }
    };

    const f = (key) => ({
        value: form[key],
        onChange: e => setForm(p => ({ ...p, [key]: e.target.value })),
        style: inp,
        onFocus: e => { e.target.style.borderColor = 'var(--border-focus)'; },
        onBlur: e => { e.target.style.borderColor = 'var(--border-default)'; },
    });

    return (
        <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 10, overflow: 'hidden' }}>
            <div
                onClick={() => setOpen(v => !v)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-surface)', cursor: 'pointer', userSelect: 'none' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.70rem', fontWeight: 700, letterSpacing: '0.14em', color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                        {SEM_LABEL[sem]}
                    </span>
                    <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.60rem', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
                        {filtered.length} subject{filtered.length !== 1 ? 's' : ''} · {totalUnits} units
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {open && (
                        <button
                            onClick={e => { e.stopPropagation(); setShowForm(v => !v); }}
                            className={showForm ? 'btn-ghost' : 'btn-primary'}
                            style={{ fontSize: '0.58rem', padding: '4px 12px' }}
                        >
                            {showForm ? 'CANCEL' : '+ ADD'}
                        </button>
                    )}
                    <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.65rem', color: 'var(--text-muted)', transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>
                        ▶
                    </span>
                </div>
            </div>

            {open && (
                <div style={{ padding: '14px 16px', background: 'var(--bg-depth)' }}>
                    {showForm && (
                        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-accent)', borderRadius: 8, padding: 16, marginBottom: 14 }}>
                            <p style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.60rem', letterSpacing: '0.14em', color: 'var(--neon-cyan)', textTransform: 'uppercase', marginBottom: 12 }}>
                                New Subject — {YEAR_LABEL[year]}, {SEM_LABEL[sem]}
                            </p>
                            {formError && (
                                <div style={{ background: 'var(--color-danger-bg)', border: '1px solid var(--border-critical)', borderRadius: 6, padding: '8px 12px', fontFamily: 'var(--font-terminal)', fontSize: '0.70rem', color: 'var(--neon-red)', marginBottom: 12 }}>
                                    {formError}
                                </div>
                            )}
                            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, alignItems: 'end' }}>
                                <div>
                                    <label style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.55rem', letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Code *</label>
                                    <input required placeholder="e.g. CS101" aria-label="Subject code" {...f('subject_code')} />
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.55rem', letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Subject Title *</label>
                                    <input required placeholder="e.g. Intro to Computing" aria-label="Subject title" {...f('subject_title')} />
                                </div>
                                <div>
                                    <label style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.55rem', letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Units *</label>
                                    <input required type="number" min="1" max="9" aria-label="Credit units" {...f('credit_units')} onChange={e => setForm(p => ({ ...p, credit_units: parseInt(e.target.value) }))} />
                                </div>
                                <div>
                                    <label style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.55rem', letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Course *</label>
                                    <select {...f('course')} aria-label="Course program" style={{ ...inp }}>
                                        {COURSES.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.55rem', letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Prerequisite</label>
                                    <input placeholder="Code or blank" aria-label="Prerequisite subject code" {...f('prereq')} />
                                </div>
                                <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                                    <button type="submit" className="btn-primary" disabled={submitting} style={{ flex: 1, fontSize: '0.65rem' }}>
                                        {submitting ? 'SAVING...' : 'SAVE'}
                                    </button>
                                    <button type="button" className="btn-ghost" onClick={() => setShowForm(false)} style={{ fontSize: '0.65rem' }}>
                                        CANCEL
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <Droppable droppableId={droppableId}>
                        {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                                    gap: 10,
                                    minHeight: 120, // Provide target area even if empty
                                    padding: '10px',
                                    background: snapshot.isDraggingOver ? 'var(--bg-surface)' : 'transparent',
                                    borderRadius: 8,
                                    transition: 'background 0.2s',
                                }}
                            >
                                {filtered.length === 0 && !snapshot.isDraggingOver && (
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <EmptyState
                                            icon="📚" title="Drop subjects here"
                                            subtitle={`Or click add to create a new subject.`}
                                            action={{ label: '+ ADD SUBJECT', onClick: () => setShowForm(true) }}
                                            compact
                                        />
                                    </div>
                                )}

                                {filtered.map((sub, index) => (
                                    <CurriculumSubjectCard key={sub.subject_id} sub={sub} index={index} onDelete={onDeleteSubject} />
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </div>
            )}
        </div>
    );
};

// ── Main page ──────────────────────────────────────────────────────────────
const ManageCurriculum = () => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeYear, setActiveYear] = useState(1);
    const [courseFilter, setCourseFilter] = useState('ALL');

    const { toast } = useToast();

    useEffect(() => { load(); }, []);

    const load = async () => {
        setLoading(true);
        try { setSubjects(await adminApi.fetchCurriculum()); }
        catch { toast.error('Failed to load curriculum.'); }
        finally { setLoading(false); }
    };

    const handleAdd = async (data) => {
        const added = await adminApi.addSubject(data);
        setSubjects(prev => [added, ...prev]);
        toast.success(`${data.subject_code} added to curriculum.`);
    };

    const handleDelete = async (id) => {
        try {
            await adminApi.deleteSubject(id);
            setSubjects(prev => prev.filter(s => s.subject_id !== id));
            toast.success('Subject removed from curriculum.');
        } catch { toast.error('Failed to delete subject.'); }
    };

    // ── Drag and Drop Handler ──
    const onDragEnd = async (result) => {
        const { destination, source, draggableId } = result;

        // If dropped outside a valid droppable area, do nothing
        if (!destination) return;

        // If dropped in the same place it started, do nothing
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        // Parse droppable IDs (e.g., "sem-1-2" -> year 1, sem 2)
        const [_, destYear, destSem] = destination.droppableId.split('-').map(Number);
        const subjectId = parseInt(draggableId);
        const subjectToMove = subjects.find(s => s.subject_id === subjectId);

        if (!subjectToMove) return;

        // Optimistically update UI
        setSubjects(prev => prev.map(s =>
            s.subject_id === subjectId
                ? { ...s, target_year_level: destYear, target_semester: destSem }
                : s
        ));

        // Sync with Backend
        try {
            await adminApi.updateSubject(subjectId, {
                target_year_level: destYear,
                target_semester: destSem
            });
            toast.success(`${subjectToMove.subject_code} moved to ${SEM_LABEL[destSem]}.`);
        } catch (error) {
            // Revert on failure
            toast.error('Failed to save order to database.');
            load();
        }
    };

    const stats = useMemo(() => ({
        total: subjects.length,
        units: subjects.reduce((s, x) => s + (x.credit_units || 0), 0),
        byYear: YEARS.reduce((acc, y) => ({ ...acc, [y]: subjects.filter(s => s.target_year_level === y).length }), {}),
    }), [subjects]);

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Skeleton.PageHeader />
            <Skeleton.KpiStrip count={6} />
            <Skeleton.Grid cols={3} count={6} />
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                        Master Curriculum
                    </h1>
                    <p style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 5 }}>
                        Manage subjects. Drag and drop cards to move them between semesters.
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.60rem', color: 'var(--text-muted)', letterSpacing: '0.10em' }}>COURSE</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                        {COURSE_FILTER.map(c => (
                            <button
                                key={c}
                                onClick={() => setCourseFilter(c)}
                                style={{
                                    background: courseFilter === c ? 'var(--accent-dim)' : 'transparent',
                                    border: courseFilter === c ? '1px solid var(--border-accent)' : '1px solid var(--border-subtle)',
                                    borderRadius: 5, padding: '5px 10px', cursor: 'pointer',
                                    fontFamily: 'var(--font-terminal)', fontSize: '0.60rem',
                                    color: courseFilter === c ? 'var(--neon-cyan)' : 'var(--text-muted)',
                                    letterSpacing: '0.08em',
                                }}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
                {[
                    { label: 'TOTAL SUBJECTS', value: stats.total, color: 'var(--neon-green)' },
                    { label: 'TOTAL UNITS', value: stats.units, color: 'var(--neon-cyan)' },
                    { label: 'YEAR 1', value: stats.byYear[1], color: 'var(--text-terminal)' },
                    { label: 'YEAR 2', value: stats.byYear[2], color: 'var(--text-terminal)' },
                    { label: 'YEAR 3', value: stats.byYear[3], color: 'var(--text-terminal)' },
                    { label: 'YEAR 4', value: stats.byYear[4], color: 'var(--text-terminal)' },
                ].map(({ label, value, color }) => (
                    <div key={label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '12px 14px' }}>
                        <DataReadout label={label} value={value} color={color} size="sm" />
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 0 }}>
                {YEARS.map(y => {
                    const active = activeYear === y;
                    return (
                        <button
                            key={y}
                            onClick={() => setActiveYear(y)}
                            style={{
                                background: active ? 'var(--bg-surface)' : 'transparent',
                                border: active ? '1px solid var(--border-default)' : '1px solid transparent',
                                borderBottom: active ? '1px solid var(--bg-surface)' : '1px solid transparent',
                                borderRadius: '8px 8px 0 0',
                                padding: '10px 20px',
                                cursor: 'pointer',
                                marginBottom: -1,
                                display: 'flex', alignItems: 'center', gap: 8,
                            }}
                        >
                            <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', color: active ? 'var(--neon-cyan)' : 'var(--text-muted)', textTransform: 'uppercase' }}>
                                {YEAR_LABEL[y]}
                            </span>
                            <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.58rem', background: active ? 'var(--neon-cyan)' : 'var(--bg-depth)', color: active ? 'var(--bg-base)' : 'var(--text-muted)', borderRadius: 4, padding: '1px 6px', minWidth: 22, textAlign: 'center' }}>
                                {stats.byYear[y]}
                            </span>
                        </button>
                    );
                })}
            </div>

            <CyberPanel title={`${YEAR_LABEL[activeYear]} — Curriculum`} subtitle={`${stats.byYear[activeYear]} subject${stats.byYear[activeYear] !== 1 ? 's' : ''} across ${activeYear === 4 ? '2 semesters' : '2 semesters'}`}>
                {/* DragDropContext wraps the area where dragging is allowed */}
                <DragDropContext onDragEnd={onDragEnd}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[1, 2].map(sem => (
                            <SemesterSection
                                key={sem}
                                year={activeYear}
                                sem={sem}
                                subjects={subjects}
                                courseFilter={courseFilter}
                                onAddSubject={handleAdd}
                                onDeleteSubject={handleDelete}
                            />
                        ))}
                    </div>
                </DragDropContext>
            </CyberPanel>

        </div>
    );
};

export default ManageCurriculum;