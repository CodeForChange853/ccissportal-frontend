import React, { useState, useEffect, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { openDB } from 'idb';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

ModuleRegistry.registerModules([AllCommunityModule]);
import Toast from '../../../components/ui/Toast';
import { facultyApi } from '../api/facultyApi';
import { useTheme } from '../../../context/ThemeContext';
import {
    saveGradeLocally, getLocalGrades,
    addToSyncQueue, getSyncQueue, clearSyncQueue, clearSyncedExceptSkipped,
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
        const getPeriodChildren = (periodPrefix, periodName) => [
            ...Array.from({ length: quizCount }, (_, i) => ([
                { field: `${periodPrefix}_quiz_${i + 1}_score`, headerName: `Q${i + 1} Score`, editable: true, width: 100 },
                { field: `${periodPrefix}_quiz_${i + 1}_total`, headerName: `Q${i + 1} Total`, editable: true, width: 100 },
            ])).flat(),
            { field: `${periodPrefix}_assign_score`, headerName: 'Assign Score', editable: true, width: 110 },
            { field: `${periodPrefix}_assign_total`, headerName: 'Assign Total', editable: true, width: 110 },
            { field: `${periodPrefix}_exam_score`, headerName: 'Exam Score', editable: true, width: 110 },
            { field: `${periodPrefix}_exam_total`, headerName: 'Exam Total', editable: true, width: 110 },
            { 
                headerName: `${periodName} %`, width: 110, editable: false,
                cellStyle: { background: 'rgba(52, 152, 219, 0.1)', fontWeight: 'bold' },
                valueGetter: (params) => {
                    const data = params.data || {};
                    let qScore = 0, qTotal = 0;
                    for (let i = 1; i <= quizCount; i++) {
                        qScore += parseFloat(data[`${periodPrefix}_quiz_${i}_score`] || 0);
                        qTotal += parseFloat(data[`${periodPrefix}_quiz_${i}_total`] || 0);
                    }
                    const aScore = parseFloat(data[`${periodPrefix}_assign_score`] || 0);
                    const aTotal = parseFloat(data[`${periodPrefix}_assign_total`] || 100);
                    const eScore = parseFloat(data[`${periodPrefix}_exam_score`] || 0);
                    const eTotal = parseFloat(data[`${periodPrefix}_exam_total`] || 100);
                    
                    const qPct = qTotal > 0 ? (qScore / qTotal * 100) : 0;
                    const aPct = aTotal > 0 ? (aScore / aTotal * 100) : 0;
                    const ePct = eTotal > 0 ? (eScore / eTotal * 100) : 0;
                    return ((qPct * 0.4) + (aPct * 0.2) + (ePct * 0.4)).toFixed(2) + '%';
                }
            },
        ];

        return [
            {
                headerName: 'Student Information',
                children: [
                    { field: 'student_id', headerName: 'Student ID', pinned: 'left', width: 130, editable: false },
                    { field: 'student_name', headerName: 'Name', pinned: 'left', width: 200, editable: false },
                ]
            },
            {
                headerName: 'Midterm Period (40% Weight)',
                children: getPeriodChildren('mid', 'Midterm')
            },
            {
                headerName: 'Final Period (60% Weight)',
                children: getPeriodChildren('fin', 'Final')
            },
            {
                headerName: 'Official Academic Record',
                children: [
                    { 
                        field: 'system_grade', headerName: 'Calculated Grade', width: 150, editable: false,
                        cellStyle: { color: 'var(--accent)', fontWeight: 'bold' }
                    },
                    { 
                        field: 'final_grade', headerName: 'Override Grade', editable: true, width: 130,
                    },
                    { field: 'override_reason', headerName: 'Reason', editable: true, width: 200 },
                    { field: 'status', headerName: 'Status', width: 120 },
                ]
            }
        ];
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
                const mapped = fresh.map(r => {
                    const raw = r.raw_scores ? (typeof r.raw_scores === 'string' ? JSON.parse(r.raw_scores) : r.raw_scores) : {};
                    const res = { ...r };
                    // Map Midterm
                    const mid = raw.midterm || {};
                    (mid.quizzes || []).forEach((q, i) => {
                        res[`mid_quiz_${i + 1}_score`] = q.score || '';
                        res[`mid_quiz_${i + 1}_total`] = q.total || '';
                    });
                    res.mid_assign_score = mid.assignment?.score || '';
                    res.mid_assign_total = mid.assignment?.total || '';
                    res.mid_exam_score = mid.exam?.score || '';
                    res.mid_exam_total = mid.exam?.total || '';
                    // Map Final
                    const fin = raw.final || {};
                    (fin.quizzes || []).forEach((q, i) => {
                        res[`fin_quiz_${i + 1}_score`] = q.score || '';
                        res[`fin_quiz_${i + 1}_total`] = q.total || '';
                    });
                    res.fin_assign_score = fin.assignment?.score || '';
                    res.fin_assign_total = fin.assignment?.total || '';
                    res.fin_exam_score = fin.exam?.score || '';
                    res.fin_exam_total = fin.exam?.total || '';
                    return res;
                });
                setRowData(mapped);
                setIsOffline(false);
                await Promise.all(mapped.map(r => saveGradeLocally({ ...r, subject_code: subject.code })));
            } catch (err) {
                console.error("Fetch failed:", err);
                setIsOffline(true);
                const cached = await getLocalGrades(subject.code);
                if (cached.length > 0) {
                    const mapped = cached.map(r => {
                        const raw = r.raw_scores ? (typeof r.raw_scores === 'string' ? JSON.parse(r.raw_scores) : r.raw_scores) : {};
                        const res = { ...r };
                        // Repeat mapping for cache
                        const mid = raw.midterm || {};
                        (mid.quizzes || []).forEach((q, i) => {
                            res[`mid_quiz_${i + 1}_score`] = q.score || '';
                            res[`mid_quiz_${i + 1}_total`] = q.total || '';
                        });
                        res.mid_assign_score = mid.assignment?.score || '';
                        res.mid_assign_total = mid.assignment?.total || '';
                        res.mid_exam_score = mid.exam?.score || '';
                        res.mid_exam_total = mid.exam?.total || '';
                        const fin = raw.final || {};
                        (fin.quizzes || []).forEach((q, i) => {
                            res[`fin_quiz_${i + 1}_score`] = q.score || '';
                            res[`fin_quiz_${i + 1}_total`] = q.total || '';
                        });
                        res.fin_assign_score = fin.assignment?.score || '';
                        res.fin_assign_total = fin.assignment?.total || '';
                        res.fin_exam_score = fin.exam?.score || '';
                        res.fin_exam_total = fin.exam?.total || '';
                        return res;
                    });
                    setRowData(mapped);
                    showToast('Offline: Showing cached grades.', 'error');
                }
            }
            const queue = await getSyncQueue();
            setPendingSync(queue.length);
        })();
    }, [subject]);

    const onCellValueChanged = async (event) => {
        const rec = event.data;
        
        // Build the raw_scores object with Score/Total pairs
        const midQuizzes = [];
        const finQuizzes = [];
        for (let i = 1; i <= quizCount; i++) {
            midQuizzes.push({
                score: parseFloat(rec[`mid_quiz_${i}_score`]) || 0,
                total: parseFloat(rec[`mid_quiz_${i}_total`]) || 0
            });
            finQuizzes.push({
                score: parseFloat(rec[`fin_quiz_${i}_score`]) || 0,
                total: parseFloat(rec[`fin_quiz_${i}_total`]) || 0
            });
        }

        const raw_scores = {
            midterm: {
                quizzes: midQuizzes,
                assignment: {
                    score: parseFloat(rec.mid_assign_score) || 0,
                    total: parseFloat(rec.mid_assign_total) || 0
                },
                exam: {
                    score: parseFloat(rec.mid_exam_score) || 0,
                    total: parseFloat(rec.mid_exam_total) || 0
                }
            },
            final: {
                quizzes: finQuizzes,
                assignment: {
                    score: parseFloat(rec.fin_assign_score) || 0,
                    total: parseFloat(rec.fin_assign_total) || 0
                },
                exam: {
                    score: parseFloat(rec.fin_exam_score) || 0,
                    total: parseFloat(rec.fin_exam_total) || 0
                }
            }
        };

        await saveGradeLocally({ ...rec, raw_scores, subject_code: subject.code });

        const syncItem = {
            student_account_id: parseInt(rec.student_account_id || rec.student_id),
            curriculum_subject_id: parseInt(rec.curriculum_subject_id),
            subject_code: subject.code,
            raw_scores: raw_scores,
            final_grade: rec.final_grade !== undefined && rec.final_grade !== '' ? parseFloat(rec.final_grade) : null,
            override_reason: rec.override_reason || null,
            completion_status: rec.status || 'IN PROGRESS'
        };

        if (!isNaN(syncItem.student_account_id)) {
            await addToSyncQueue(syncItem);
            const queue = await getSyncQueue();
            setPendingSync(queue.length);
        }
    };

    const handleSync = async () => {
        const queue = await getSyncQueue();
        if (!queue.length) return;
        try {
            const result = await facultyApi.syncGrades(queue);
            if (result.status === 'SUCCESS') {
                showToast(`Synced ${result.synced_records || result.synced_count || 0} records!`);
                if (result.skipped_records > 0 || result.skipped_count > 0) {
                    showToast(`${result.skipped_records || result.skipped_count} records skipped due to conflict.`, 'warning');
                }
                await clearSyncedExceptSkipped(result.skipped_keys || []);
                const remaining = await getSyncQueue();
                setPendingSync(remaining.length);
                setIsOffline(false);
            }
        } catch (err) { 
            console.error('[ERROR] Sync failed:', err);
            const is422 = err.response?.status === 422;
            showToast(is422 ? 'Sync failed: Data format mismatch (422).' : 'Sync failed — server unreachable.', 'error'); 
            
            if (is422) {
                // If the queue is poisoned with bad data, we might need to clear it
                console.warn('[FIX] If sync persists in failing, try clearing the browser cache or sync queue.');
            }
        }
    };

    const handleClearQueue = async () => {
        if (window.confirm('This will delete all unsynced grade changes. Proceed?')) {
            await clearSyncQueue();
            setPendingSync(0);
            showToast('Sync queue cleared.');
        }
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

                    <button 
                        style={ghostBtn({ color: '#3498db', borderColor: '#3498db' })}
                        onClick={async () => {
                            if (window.confirm('This will refresh your local student list to fix connection issues. Continue?')) {
                                await clearSyncQueue();
                                const db = await openDB('enrollmate', 4);
                                await db.clear('grades');
                                window.location.reload();
                            }
                        }}
                    >
                        🔧 Repair
                    </button>

                    <div style={{ width: 1, height: 20, background: 'var(--border-subtle)', margin: '0 2px' }} />

                    <label style={{ ...ghostBtn(), cursor: 'pointer' }}>
                        <span style={{ opacity: 0.7 }}>📄</span> Bulk .xlsx
                        <input type="file" accept=".xlsx" style={{ display: 'none' }} onChange={handleFileUpload} />
                    </label>

                    {pendingSync > 0 && (
                        <button style={ghostBtn({ color: 'var(--color-danger)', borderColor: 'var(--color-danger-bd)' })}
                            onClick={handleClearQueue}
                        >
                            🗑️ Clear Queue
                        </button>
                    )}

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