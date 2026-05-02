// frontend/src/features/student/components/CorUploadTab.jsx
// PHASE 4: Sliced COR upload flow from StudentDashboard (~120 lines extracted).

import React, { useState, useRef } from 'react';
import { studentApi } from '../api/studentApi';

const CorUploadTab = ({ onSuccess }) => {
    const [corFile, setCorFile] = useState(null);
    const [corPreview, setCorPreview] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [status, setStatus] = useState('');
    const [taskId, setTaskId] = useState(null);
    const [subjects, setSubjects] = useState(null);
    const [error, setError] = useState(null);
    const [confidence, setConfidence] = useState(null);
    const pollRef = useRef(null);
    const isSubmitting = useRef(false);

    const handleFileChange = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        if (f.size > 10 * 1024 * 1024) { setError('Max file size is 10 MB.'); return; }
        setCorFile(f);
        setCorPreview(URL.createObjectURL(f));
        setSubjects(null);
        setConfidence(null);
        setStatus('');
        setError(null);
    };

    const startScan = async () => {
        if (!corFile || isSubmitting.current) return;
        isSubmitting.current = true;
        setScanning(true);
        setStatus('Uploading…');
        try {
            const res = await studentApi.uploadCOR(corFile);
            // FIX: backend returns secure_scan_token, not task_id
            const scanToken = res.secure_scan_token;
            setTaskId(scanToken);
            setStatus('AI scanning COR…');
            let attempts = 0;
            pollRef.current = setInterval(async () => {
                if (++attempts > 30) {
                    clearInterval(pollRef.current);
                    setScanning(false);
                    isSubmitting.current = false;
                    setError('Scan timed out. Please try again.');
                    return;
                }
                try {
                    // FIX: use checkScanStatus with secure_scan_token
                    const task = await studentApi.checkScanStatus(scanToken);
                    
                    if (task.processing_status === 'ERROR' || task.status === 'ERROR') {
                        clearInterval(pollRef.current);
                        setScanning(false);
                        isSubmitting.current = false;
                        setCorFile(null);
                        setCorPreview(null);
                        setSubjects(null);
                        setConfidence(null);
                        setStatus('');
                        setError('The AI service is currently busy. Please try uploading your document again in a few moments.');
                        return;
                    }

                    if (task.processing_status === 'COMPLETED') {
                        clearInterval(pollRef.current);
                        // FIX: parse the JSON string stored in extracted_ai_data
                        let subs = [];
                        let confScore = null;
                        try {
                            const parsed = JSON.parse(task.extracted_ai_data || '{}');
                            const rawSubs = parsed.extracted_data?.subjects ?? [];
                            confScore = parsed.confidence_score ?? null;

                            // ── OCR Resilience: filter out subjects with null/empty code or name ──
                            subs = rawSubs.filter(s =>
                                s && (s.code || '').trim() && (s.name || '').trim()
                            );
                        } catch { subs = []; }

                        setConfidence(confScore);

                        // ── OCR Resilience: reject if all subjects were filtered out ──
                        if (subs.length === 0) {
                            setSubjects([]);
                            setScanning(false);
                            isSubmitting.current = false;
                            setError('Could not read subjects from your COR. Please upload a clearer image.');
                            return;
                        }

                        // ── OCR Resilience: warn on low confidence (<0.3) ──
                        if (confScore !== null && confScore < 0.3) {
                            setError('⚠️ Low scan quality detected. Results may be inaccurate — consider re-uploading a clearer image.');
                        }

                        setSubjects(subs);
                        setStatus(`${subs.length} subjects found`);
                        setScanning(false);
                        isSubmitting.current = false;
                    } else if (task.processing_status === 'FAILED') {
                        clearInterval(pollRef.current);
                        setScanning(false);
                        isSubmitting.current = false;
                        setSubjects([]);
                        setError('AI scan failed. Please try a clearer image.');
                    }
                } catch { /* polling errors are silent */ }
            }, 2000);
        } catch {
            setError('Upload failed. Please try again.');
            setScanning(false);
            isSubmitting.current = false;
        }
    };

    const submitCor = async () => {
        if (!subjects) return;
        setScanning(true);
        try {
            await studentApi.finalizeCOR(taskId);
            setCorFile(null);
            setCorPreview(null);
            setSubjects(null);
            setStatus('');
            onSuccess?.();
        } catch {
            setError('Submission failed. Please try again.');
        } finally {
            setScanning(false);
        }
    };

    const clearAll = () => {
        setCorFile(null);
        setCorPreview(null);
        setSubjects(null);
        setStatus('');
        setError(null);
        if (pollRef.current) clearInterval(pollRef.current);
    };

    return (
        <div className="max-w-sm mx-auto space-y-3">
            <p className="text-xs text-slate-500 mb-4">
                Upload your next-semester COR — AI extracts enrolled subjects for admin review.
            </p>

            {error && (
                <div className="text-xs text-rose-400 bg-rose-900/20 border border-rose-800/30 rounded-xl px-4 py-2">
                    {error}
                </div>
            )}

            {!corPreview ? (
                <label
                    className="block rounded-2xl p-10 text-center cursor-pointer border-2 border-dashed transition-colors"
                    style={{ borderColor: 'rgba(0,201,177,0.3)', background: 'rgba(0,201,177,0.04)' }}
                >
                    <p className="text-3xl mb-2">📄</p>
                    <p className="font-bold text-white text-sm">Tap to upload COR</p>
                    <p className="text-xs text-slate-500 mt-1">JPG · PNG · PDF · Max 10 MB</p>
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                    />
                </label>
            ) : (
                <div
                    className="rounded-2xl overflow-hidden"
                    style={{ background: '#1e2246', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                    <div className="relative">
                        <img
                            src={corPreview}
                            alt="COR preview"
                            className={`w-full max-h-48 object-contain ${scanning ? 'opacity-40' : ''} transition-opacity`}
                            style={{ background: '#0f172a' }}
                        />
                        {scanning && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center"
                                style={{ background: 'rgba(0,0,0,0.5)' }}>
                                <div className="w-8 h-8 rounded-full border-4 animate-spin mb-2"
                                    style={{ borderColor: 'rgba(0,201,177,0.2)', borderTopColor: '#00c9b1' }} />
                                <p className="text-xs" style={{ color: '#00c9b1' }}>{status}</p>
                            </div>
                        )}
                    </div>

                    {subjects !== null && (
                        <div className="p-3 border-t border-white/5">
                            <p className="text-[10px] font-bold mb-2" style={{ color: '#00c9b1' }}>
                                ✅ {subjects.length} subjects detected
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {subjects.map((s, i) => (
                                    <span
                                        key={i}
                                        className="text-[9px] font-mono px-2 py-0.5 rounded-full"
                                        style={{
                                            background: 'rgba(0,201,177,0.15)',
                                            color: '#00c9b1',
                                            border: '1px solid rgba(0,201,177,0.3)',
                                        }}
                                    >
                                        {s.code}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="flex flex-col gap-2 mt-2">
                {corPreview && !scanning && subjects === null && (
                    <button
                        onClick={startScan}
                        className="w-full py-3 rounded-2xl font-bold text-sm"
                        style={{ background: '#00c9b1', color: '#0f172a' }}
                    >
                        Scan with AI
                    </button>
                )}
                {subjects !== null && (
                    <button
                        onClick={submitCor}
                        disabled={scanning}
                        className="w-full py-3 rounded-2xl font-bold text-white text-sm disabled:opacity-50"
                        style={{ background: 'linear-gradient(90deg,#059669,#0d9488)' }}
                    >
                        Submit Enrollment Request
                    </button>
                )}
                {corPreview && (
                    <button
                        onClick={clearAll}
                        className="w-full py-2.5 rounded-2xl text-sm text-slate-500 hover:text-white transition-colors"
                        style={{ background: 'rgba(255,255,255,0.04)' }}
                    >
                        Clear
                    </button>
                )}
            </div>
        </div>
    );
};

export default CorUploadTab;