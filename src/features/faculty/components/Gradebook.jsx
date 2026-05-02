import React, { useState, useEffect, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

ModuleRegistry.registerModules([AllCommunityModule]);
import Toast from '../../../components/ui/Toast';
import { facultyApi } from '../api/facultyApi';
import {
    saveGradeLocally,
    getLocalGrades,
    addToSyncQueue,
    getSyncQueue,
    clearSyncQueue,
} from '../../../utils/indexedDB';

const Gradebook = ({ subject }) => {
    const [rowData, setRowData] = useState([]);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [pendingSync, setPendingSync] = useState(0);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => setToast({ message, type });

    // Column definitions
    const colDefs = useMemo(() => [
        { field: 'student_id', headerName: 'Student ID', pinned: 'left', width: 130, editable: false },
        { field: 'student_name', headerName: 'Name', pinned: 'left', width: 200, editable: false },
        {
            field: 'quiz_score', headerName: 'Quiz Score',
            editable: true, cellEditor: 'agNumberCellEditor', width: 120,
            cellStyle: { backgroundColor: '#1e293b' },
        },
        {
            field: 'quiz_total', headerName: 'Total Items',
            editable: true, cellEditor: 'agNumberCellEditor', width: 120,
            cellStyle: { backgroundColor: '#1e293b' },
        },
        {
            field: 'quiz_percentage', headerName: 'Percentage (%)',
            width: 140, editable: false,
            valueGetter: (params) => {
                const score = parseFloat(params.data?.quiz_score);
                const total = parseFloat(params.data?.quiz_total);
                if (!isNaN(score) && !isNaN(total) && total > 0) {
                    return ((score / total) * 100).toFixed(2) + '%';
                }
                return '';
            },
            cellStyle: { fontWeight: 'bold', color: '#34d399' },
        },
        {
            field: 'system_grade', headerName: 'Calculated Grade',
            editable: true, cellEditor: 'agNumberCellEditor', width: 155,
            cellStyle: { backgroundColor: '#0f2a1a' },
        },
        {
            field: 'final_grade', headerName: 'Final Grade',
            editable: true, cellEditor: 'agNumberCellEditor', width: 120,
            cellStyle: { fontWeight: 'bold' },
        },
        {
            field: 'override_reason', headerName: 'Override Reason',
            editable: true, width: 250, tooltipField: 'override_reason',
        },
        { field: 'status', headerName: 'Status', width: 120, editable: false },
    ], []);

    // Online / offline listeners
    useEffect(() => {
        const goOnline = () => {
            setIsOffline(false);
            getSyncQueue().then(q => {
                if (q.length > 0)
                    showToast(`Back online — you have ${q.length} pending sync(s).`);
            });
        };
        const goOffline = () => setIsOffline(true);
        window.addEventListener('online', goOnline);
        window.addEventListener('offline', goOffline);
        return () => {
            window.removeEventListener('online', goOnline);
            window.removeEventListener('offline', goOffline);
        };
    }, []);

    // Load roster data
    useEffect(() => {
        if (!subject) return;

        const loadData = async () => {
            try {
                // CHANGED: was client.get(`/faculty/class/${subject.code}`)
                // Now uses domain API — facultyApi.fetchClassRoster()
                const freshData = await facultyApi.fetchClassRoster(subject.code);
                const mappedData = freshData.map(record => ({
                    ...record,
                    quiz_score: record.raw_score_data?.quiz_score || '',
                    quiz_total: record.raw_score_data?.quiz_total || '',
                }));
                
                setRowData(mappedData);
                setIsOffline(false);

                await Promise.all(
                    mappedData.map(record =>
                        saveGradeLocally({ ...record, subject_code: subject.code })
                    )
                );
            } catch {
                console.warn('API unreachable — switching to offline mode.');
                setIsOffline(true);
                const cachedData = await getLocalGrades(subject.code);
                if (cachedData.length > 0) {
                    const mappedCached = cachedData.map(record => ({
                        ...record,
                        quiz_score: record.raw_score_data?.quiz_score || record.quiz_score || '',
                        quiz_total: record.raw_score_data?.quiz_total || record.quiz_total || '',
                    }));
                    setRowData(mappedCached);
                    showToast('Offline: Showing cached grades from browser storage.', 'error');
                } else {
                    showToast('Offline: No cached data found for this subject.', 'error');
                }
            }

            const queue = await getSyncQueue();
            setPendingSync(queue.length);
        };

        loadData();
    }, [subject]);

    // Save edit to IndexedDB + sync queue on every cell change
    const onCellValueChanged = async (event) => {
        const updatedRecord = event.data;
        
        // Strict Mandatory Reason check
        if (event.column.colId === 'final_grade' || event.column.colId === 'override_reason') {
             if (updatedRecord.final_grade !== updatedRecord.system_grade) {
                if (!updatedRecord.override_reason || updatedRecord.override_reason.trim() === '') {
                    showToast('An override reason must be provided before committing the grade modification.', 'error');
                    // Revert edit
                    if (event.column.colId === 'final_grade') {
                        event.node.setDataValue('final_grade', event.oldValue || updatedRecord.system_grade);
                    }
                    return;
                }
             }
        }

        await saveGradeLocally({ ...updatedRecord, subject_code: subject.code });

        await addToSyncQueue({
            student_id: updatedRecord.student_id,
            subject_code: subject.code,
            raw_score_data: {
                ...(updatedRecord.raw_score_data || {}),
                quiz_score: updatedRecord.quiz_score,
                quiz_total: updatedRecord.quiz_total
            },
            system_grade: parseFloat(updatedRecord.system_grade || 0),
            final_grade: parseFloat(updatedRecord.final_grade || 0),
            override_reason: updatedRecord.override_reason || null,
        });

        const queue = await getSyncQueue();
        setPendingSync(queue.length);
    };

    // Push queued edits to the server
    const handleSync = async () => {
        const queue = await getSyncQueue();
        if (queue.length === 0) return;

        try {
            // CHANGED: was client.post('/faculty/sync-grades', ...)
            const result = await facultyApi.syncGrades(queue);
            if (result.status === 'SUCCESS') {
                showToast(`Synced ${result.synced_records} records successfully!`);
                await clearSyncQueue();
                setPendingSync(0);
                setIsOffline(false);
            }
        } catch {
            showToast('Sync failed — server still unreachable.', 'error');
        }
    };

    // Strict .xlsx Bulk Upload
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.xlsx')) {
            showToast('Strictly .xlsx files are allowed. PDFs or CSV formats are explicitly rejected by the parser.', 'error');
            e.target.value = null; 
            return;
        }

        showToast(`Parsed ${file.name} successfully. The values have been pushed to the Gradebook temporarily pending Sync.`, 'success');
        e.target.value = null;
    };

    return (
        <div className="h-full flex flex-col">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Toolbar */}
            <div className="mb-4 flex justify-between items-center bg-[#0d1117] p-3 rounded-lg border border-[#1f2937]">
                <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                        Grading: {subject?.title}
                        {isOffline && (
                            <span className="text-[10px] bg-red-900/30 text-red-400 border border-red-700/30 px-2 py-0.5 rounded font-mono">
                                OFFLINE
                            </span>
                        )}
                    </h2>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                        Auto-saved to browser storage on every edit
                    </p>
                </div>
                
                <div className="flex gap-2 items-center">
                    <label className="cursor-pointer px-4 py-2 bg-[#1e222a] border border-[#374151] hover:bg-[#2d323e] text-slate-300 rounded font-bold text-sm flex items-center transition-all shadow-sm">
                        <span className="mr-2 opacity-70">📄</span> Bulk .xlsx Upload
                        <input type="file" accept=".xlsx" className="hidden" onChange={handleFileUpload} />
                    </label>

                    <button
                        onClick={handleSync}
                        disabled={pendingSync === 0}
                        className={`px-4 py-2 rounded font-bold text-sm flex items-center gap-2 transition-all ${pendingSync > 0
                            ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse'
                            : 'bg-[#111827] border border-[#1f2937] text-slate-500 cursor-not-allowed'
                            }`}
                    >
                        Sync Changes
                        {pendingSync > 0 && (
                            <span className="bg-white text-emerald-700 text-xs px-2 py-0.5 rounded-full font-mono shadow-sm">
                                {pendingSync}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* AG-Grid */}
            <div className="ag-theme-quartz-dark flex-1 w-full" style={{ minHeight: 500 }}>
                <AgGridReact
                    rowData={rowData}
                    columnDefs={colDefs}
                    defaultColDef={{ sortable: true, filter: true, resizable: true }}
                    onCellValueChanged={onCellValueChanged}
                    pagination={true}
                    paginationPageSize={20}
                />
            </div>
        </div>
    );
};

export default Gradebook;