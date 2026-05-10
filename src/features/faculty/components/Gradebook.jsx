import React, { useState, useEffect, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

ModuleRegistry.registerModules([AllCommunityModule]);
import Toast from '../../../components/ui/Toast';
import { facultyApi } from '../api/facultyApi';
import { useTheme } from '../../../context/ThemeContext';
import {
    saveGradeLocally, getLocalGrades,
    addToSyncQueue, getSyncQueue, clearSyncQueue,
} from '../../../utils/indexedDB';

const Gradebook = ({ subject }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const gridTheme = isDark ? 'ag-theme-quartz-dark' : 'ag-theme-quartz';

    const [rowData, setRowData] = useState([]);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [pendingSync, setPendingSync] = useState(0);
    const [toast, setToast] = useState(null);
    const [quizCount, setQuizCount] = useState(1);

    const showToast = (message, type = 'success') => setToast({ message, type });

    const colDefs = useMemo(() => {
        const cols = [
            { field: 'student_id', headerName: 'Student ID', pinned: 'left', width: 130, editable: false },
            { field: 'student_name', headerName: 'Name', pinned: 'left', width: 200, editable: false },
        ];
        for (let i = 1; i <= quizCount; i++) {
            cols.push(
                { field: `quiz_${i}_score`, headerName: `Quiz ${i} Score`, editable: true, width: 110 },
                { field: `quiz_${i}_total`, headerName: `Quiz ${i} Total`, editable: true, width: 110 },
            );
        }
        cols.push({
            field: 'quiz_percentage', headerName: 'Percentage (%)', width: 140, editable: false,
            valueGetter: (params) => {
                let ts = 0, ti = 0, ok = false;
                for (let i = 1; i <= quizCount; i++) {
                    const s = parseFloat(params.data?.[`quiz_${i}_score`]);
                    const t = parseFloat(params.data?.[`quiz_${i}_total`]);
                    if (!isNaN(s) && !isNaN(t) && t > 0) { ts += s; ti += t; ok = true; }
                }
                return ok && ti > 0 ? ((ts / ti) * 100).toFixed(2) + '%' : '';
            },
            cellStyle: { fontWeight: 'bold', color: 'var(--accent)' },
        });
        cols.push(
            { field: 'system_grade', headerName: 'Calculated Grade', editable: true, width: 155 },
            { field: 'final_grade', headerName: 'Final Grade', editable: true, width: 120, cellStyle: { fontWeight: 'bold' } },
            { field: 'override_reason', headerName: 'Override Reason', editable: true, width: 250, tooltipField: 'override_reason' },
            { field: 'status', headerName: 'Status', editable: false, width: 120 },
        );
        return cols;
    }, [quizCount]);

    useEffect(() => {
        const goOnline = () => { setIsOffline(false); getSyncQueue().then(q => { if (q.length > 0) showToast(`Back online — ${q.length} pending sync(s).`); }); };
        const goOffline = () => setIsOffline(true);
        window.addEventListener('online', goOnline);
        window.addEventListener('offline', goOffline);
        return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline); };
    }, []);

    useEffect(() => {
        if (!subject) return;
        (async () => {
            try {
                const fresh = await facultyApi.fetchClassRoster(subject.code);
                let maxQ = 1;
                fresh.forEach(r => { const q = r.raw_score_data?.quiz_count || 1; if (q > maxQ) maxQ = q; });
                setQuizCount(maxQ);
                const mapped = fresh.map(r => {
                    const raw = r.raw_score_data || {};
                    const res = { ...r };
                    res.quiz_1_score = raw.quizzes?.[0]?.score ?? raw.quiz_score ?? '';
                    res.quiz_1_total = raw.quizzes?.[0]?.total ?? raw.quiz_total ?? '';
                    for (let i = 2; i <= maxQ; i++) {
                        res[`quiz_${i}_score`] = raw.quizzes?.[i - 1]?.score ?? '';
                        res[`quiz_${i}_total`] = raw.quizzes?.[i - 1]?.total ?? '';
                    }
                    return res;
                });
                setRowData(mapped);
                setIsOffline(false);
                await Promise.all(mapped.map(r => saveGradeLocally({ ...r, subject_code: subject.code })));
            } catch {
                setIsOffline(true);
                const cached = await getLocalGrades(subject.code);
                if (cached.length > 0) {
                    let maxQ = 1;
                    cached.forEach(r => { const q = r.raw_score_data?.quiz_count || 1; if (q > maxQ) maxQ = q; });
                    setQuizCount(maxQ);
                    const mapped = cached.map(r => {
                        const raw = r.raw_score_data || {};
                        const res = { ...r };
                        res.quiz_1_score = raw.quizzes?.[0]?.score ?? raw.quiz_score ?? r.quiz_score ?? '';
                        res.quiz_1_total = raw.quizzes?.[0]?.total ?? raw.quiz_total ?? r.quiz_total ?? '';
                        for (let i = 2; i <= maxQ; i++) {
                            res[`quiz_${i}_score`] = raw.quizzes?.[i - 1]?.score ?? '';
                            res[`quiz_${i}_total`] = raw.quizzes?.[i - 1]?.total ?? '';
                        }
                        return res;
                    });
                    setRowData(mapped);
                    showToast('Offline: Showing cached grades.', 'error');
                } else {
                    showToast('Offline: No cached data found.', 'error');
                }
            }
            const queue = await getSyncQueue();
            setPendingSync(queue.length);
        })();
    }, [subject]);

    const onCellValueChanged = async (event) => {
        const rec = event.data;
        if (event.column.colId === 'final_grade' || event.column.colId === 'override_reason') {
            if (rec.final_grade !== rec.system_grade && !rec.override_reason?.trim()) {
                showToast('An override reason must be provided before committing the grade.', 'error');
                if (event.column.colId === 'final_grade')
                    event.node.setDataValue('final_grade', event.oldValue || rec.system_grade);
                return;
            }
        }
        const quizzes = [];
        for (let i = 1; i <= quizCount; i++)
            quizzes.push({ score: rec[`quiz_${i}_score`], total: rec[`quiz_${i}_total`] });
        await saveGradeLocally({ ...rec, subject_code: subject.code });
        await addToSyncQueue({
            student_account_id: rec.student_account_id, subject_code: subject.code,
            raw_score_data: { ...(rec.raw_score_data || {}), quiz_count: quizCount, quizzes, quiz_score: rec.quiz_1_score, quiz_total: rec.quiz_1_total },
            system_grade: parseFloat(rec.system_grade || 0),
            final_grade: parseFloat(rec.final_grade || 0),
            override_reason: rec.override_reason || null,
        });
        const queue = await getSyncQueue();
        setPendingSync(queue.length);
    };

    const handleSync = async () => {
        const queue = await getSyncQueue();
        if (!queue.length) return;
        try {
            const result = await facultyApi.syncGrades(queue);
            if (result.status === 'SUCCESS') {
                showToast(`Synced ${result.synced_records} records!`);
                await clearSyncQueue(); setPendingSync(0); setIsOffline(false);
            }
        } catch { showToast('Sync failed — server unreachable.', 'error'); }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.name.endsWith('.xlsx')) {
            showToast('Strictly .xlsx files only.', 'error');
            e.target.value = null; return;
        }
        showToast(`Parsed ${file.name} — pending Sync.`);
        e.target.value = null;
    };

    // Button style helpers
    const ghostBtn = (extra = {}) => ({
        padding: '5px 11px', borderRadius: 5, cursor: 'pointer',
        background: 'transparent', border: '1px solid var(--border-default)',
        color: 'var(--text-primary)', fontSize: 12, fontFamily: 'var(--font-code)',
        transition: 'all 0.12s', display: 'inline-flex', alignItems: 'center', gap: 5,
        ...extra,
    });
    const primaryBtn = (extra = {}) => ({
        ...ghostBtn(),
        background: isDark ? 'rgba(244,11,233,0.15)' : 'rgba(186,151,49,0.15)',
        border: `1px solid ${isDark ? 'rgba(244,11,233,0.35)' : 'rgba(186,151,49,0.35)'}`,
        color: isDark ? '#F40BE9' : '#BA9731',
        fontWeight: 600,
        ...extra,
    });

    return (
        /* The parent in FacultyDashboard gives us flex:1 + display:flex + flexDirection:column.
           This component fills it completely. */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <style>{`
                .ag-theme-quartz-dark, .ag-theme-quartz {
                    --ag-range-selection-highlight-color: rgba(186,151,49,0.15);
                    --ag-selected-row-background-color: rgba(186,151,49,0.08);
                    --ag-input-focus-border-color: var(--accent);
                    --ag-input-focus-box-shadow: 0 0 0 2px rgba(186,151,49,0.3);
                }
                .ag-theme-quartz-dark .ag-cell-inline-editing,
                .ag-theme-quartz .ag-cell-inline-editing {
                    background-color: var(--bg-surface) !important;
                    box-shadow: inset 0 0 0 2px var(--accent) !important;
                }
                .ag-theme-quartz-dark .ag-input-field-input,
                .ag-theme-quartz .ag-input-field-input {
                    background-color: var(--bg-surface) !important;
                    color: var(--text-primary) !important;
                    caret-color: var(--text-primary) !important;
                }
                .ag-theme-quartz-dark .ag-cell-focus:not(.ag-cell-inline-editing),
                .ag-theme-quartz .ag-cell-focus:not(.ag-cell-inline-editing) {
                    border: 1px solid var(--accent) !important;
                    outline: none !important;
                }
            `}</style>

            {/* Toolbar — fixed height */}
            <div style={{
                flexShrink: 0,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px', marginBottom: 12, borderRadius: 8,
                background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display, serif)', margin: 0 }}>
                            {subject?.title}
                        </h2>
                        <span style={{ fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--font-code)' }}>{subject?.code}</span>
                        {isOffline && (
                            <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 20, fontFamily: 'var(--font-code)', fontWeight: 700, background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-bd)', color: 'var(--color-danger)' }}>
                                OFFLINE
                            </span>
                        )}
                    </div>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-code)', marginTop: 2 }}>
                        Auto-saved to browser storage · {rowData.length} students
                    </p>
                </div>

                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                    <button style={ghostBtn()} onClick={() => setQuizCount(p => p + 1)}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                    >+ Quiz</button>

                    {quizCount > 1 && (
                        <button style={ghostBtn({ color: 'var(--color-danger)', borderColor: 'var(--color-danger-bd)' })}
                            onClick={() => setQuizCount(p => p - 1)}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-danger-bg)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >− Quiz</button>
                    )}

                    <div style={{ width: 1, height: 20, background: 'var(--border-subtle)', margin: '0 2px' }} />

                    <label style={{ ...ghostBtn(), cursor: 'pointer' }}>
                        <span style={{ opacity: 0.7 }}>📄</span> Bulk .xlsx
                        <input type="file" accept=".xlsx" style={{ display: 'none' }} onChange={handleFileUpload} />
                    </label>

                    <button
                        onClick={handleSync}
                        disabled={pendingSync === 0}
                        style={pendingSync > 0 ? primaryBtn() : ghostBtn({ opacity: 0.35, cursor: 'not-allowed' })}
                        onMouseEnter={e => { if (pendingSync > 0) e.currentTarget.style.opacity = '0.8'; }}
                        onMouseLeave={e => { if (pendingSync > 0) e.currentTarget.style.opacity = '1'; }}
                    >
                        Sync Changes
                        {pendingSync > 0 && (
                            <span style={{ background: isDark ? 'rgba(244,11,233,0.15)' : 'rgba(186,151,49,0.15)', color: 'var(--accent)', fontSize: 10, padding: '1px 7px', borderRadius: 20, fontFamily: 'var(--font-code)' }}>
                                {pendingSync}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* AG-Grid — takes all remaining height */}
            <div
                className={gridTheme}
                style={{ flex: 1, minHeight: 0, width: '100%', overflow: 'hidden' }}
            >
                <AgGridReact
                    rowData={rowData}
                    columnDefs={colDefs}
                    defaultColDef={{ sortable: true, filter: true, resizable: true }}
                    onCellValueChanged={onCellValueChanged}
                    pagination
                    paginationPageSize={20}
                    style={{ height: '100%', width: '100%' }}
                />
            </div>
        </div>
    );
};

export default Gradebook;