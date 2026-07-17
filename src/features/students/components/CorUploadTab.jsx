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
    // needsReview: true when the scan is low-confidence and queued for secretariat verification
    const [needsReview, setNeedsReview] = useState(false);
    const pollRef = useRef(null);
    const isSubmitting = useRef(false);

    const handleFileChange = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        if (f.size > 5 * 1024 * 1024) { setError('Max file size is 5 MB.'); return; }
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
        setNeedsReview(false);
        setStatus('Uploading…');
        try {
            const res = await studentApi.uploadCOR(corFile);
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
                    const task = await studentApi.checkScanStatus(scanToken);
                    const ps = task.processing_status;

                    if (ps === 'ERROR') {
                        clearInterval(pollRef.current);
                        setScanning(false);
                        isSubmitting.current = false;
                        setCorFile(null); setCorPreview(null);
                        setSubjects(null); setConfidence(null); setStatus('');
                        setError('The AI service is currently busy. Please try uploading your document again in a few moments.');
                        return;
                    }

                    if (ps === 'FAILED') {
                        clearInterval(pollRef.current);
                        setScanning(false);
                        isSubmitting.current = false;
                        setError(task.error_message || 'AI scan failed. Please upload a clearer image.');
                        return;
                    }

                    // ── NEEDS_REVIEW: low-confidence scan queued for secretariat ──
                    // The student can still proceed — the registrar will verify subjects.
                    if (ps === 'NEEDS_REVIEW') {
                        clearInterval(pollRef.current);
                        let subs = [];
                        let confScore = null;
                        try {
                            const parsed = JSON.parse(task.extracted_ai_data || '{}');
                            subs = (parsed.extracted_data?.subjects ?? []).filter(s =>
                                s && (s.code || '').trim() && (s.name || '').trim()
                            );
                            confScore = parsed.confidence_score ?? null;
                        } catch { subs = []; }
                        setConfidence(confScore);
                        setSubjects(subs);
                        setNeedsReview(true);
                        setStatus('Pending registrar review');
                        setScanning(false);
                        isSubmitting.current = false;
                        return;
                    }

                    if (ps === 'COMPLETED' || ps === 'MANUALLY_VERIFIED') {
                        clearInterval(pollRef.current);
                        let subs = [];
                        let confScore = null;
                        try {
                            const parsed = JSON.parse(task.extracted_ai_data || '{}');
                            const rawSubs = parsed.extracted_data?.subjects ?? [];
                            confScore = parsed.confidence_score ?? null;
                            subs = rawSubs.filter(s =>
                                s && (s.code || '').trim() && (s.name || '').trim()
                            );
                        } catch { subs = []; }

                        setConfidence(confScore);

                        if (subs.length === 0) {
                            setSubjects([]);
                            setScanning(false);
                            isSubmitting.current = false;
                            setError('Could not read subjects from your COR. Please upload a clearer image.');
                            return;
                        }

                        setSubjects(subs);
                        setStatus(`${subs.length} subjects found`);
                        setScanning(false);
                        isSubmitting.current = false;
                    }
                } catch { /* ignore */ }
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
        setNeedsReview(false);
        if (pollRef.current) clearInterval(pollRef.current);
    };

    return (
        <div className="max-w-md mx-auto space-y-4">
            <p className="text-xs text-student-white-dim mb-6 italic leading-relaxed text-center">
                Upload your Certificate of Registration. NexEnroll AI will extract your subjects for official verification by the registrar.
            </p>

            {error && (
                <div className="text-xs text-student-red bg-student-red/10 border border-student-red/20 rounded-xl px-5 py-3 font-bold font-mono">
                    ⚠️ {error}
                </div>
            )}

            {!corPreview ? (
                <label
                    className="block rounded-3xl p-16 text-center cursor-pointer border-2 border-dashed transition-all hover:bg-student-gold-dim2 group"
                    style={{ borderColor: 'rgba(201, 168, 76, 0.2)', background: 'var(--student-black-3)' }}
                >
                    <div className="w-20 h-20 rounded-full bg-student-gold-dim text-student-gold flex items-center justify-center text-4xl mx-auto mb-6 group-hover:scale-110 transition-transform">
                        📄
                    </div>
                    <p className="font-black text-white text-base" style={{ fontFamily: 'var(--student-font-display)' }}>NexEnroll Secure Upload</p>
                    <p className="text-[10px] text-student-gold font-mono uppercase mt-2 tracking-widest">Tap to browse files</p>
                    <p className="text-[10px] text-student-white-dim/30 mt-4 font-mono">JPG · PNG · PDF · MAX 5MB</p>
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                    />
                </label>
            ) : (
                <div
                    className="rounded-3xl overflow-hidden relative shadow-2xl"
                    style={{ background: 'var(--student-black-3)', border: '1px solid rgba(201, 168, 76, 0.15)' }}
                >
                    <div className="relative">
                        <img
                            src={corPreview}
                            alt="COR preview"
                            className={`w-full max-h-64 object-contain ${scanning ? 'opacity-30' : ''} transition-opacity p-4`}
                            style={{ background: 'var(--student-black)' }}
                        />
                        {scanning && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm">
                                <div className="w-12 h-12 rounded-full border-4 animate-spin mb-4"
                                    style={{ borderColor: 'rgba(201, 168, 76, 0.2)', borderTopColor: 'var(--student-gold)' }} />
                                <p className="text-xs font-bold font-mono tracking-widest" style={{ color: 'var(--student-gold)' }}>{status.toUpperCase()}</p>
                            </div>
                        )}
                    </div>

                    {subjects !== null && (
                        <div className="p-6 border-t border-white/5"
                            style={{ background: needsReview ? 'rgba(217,119,6,0.08)' : 'var(--student-gold-dim2)' }}>

                            {needsReview ? (
                                /* Low-confidence scan — tell the student to wait, not re-upload */
                                <div>
                                    <p className="text-[11px] font-black mb-2 flex items-center gap-2"
                                        style={{ color: '#f59e0b' }}>
                                        <span className="text-base">⏳</span> PENDING REGISTRAR REVIEW
                                    </p>
                                    <p className="text-[10px] font-mono leading-relaxed"
                                        style={{ color: 'rgba(245,240,232,0.65)' }}>
                                        Your COR was uploaded but our AI had low confidence reading it.
                                        A registrar will manually verify your subjects — you&apos;ll be notified.
                                        You can submit now and we&apos;ll process your enrollment once verified.
                                    </p>
                                    {subjects.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {subjects.map((s, i) => (
                                                <span key={i} className="text-[10px] font-mono px-3 py-1 rounded-lg font-bold"
                                                    style={{
                                                        background: 'rgba(245,158,11,0.1)',
                                                        color: '#f59e0b',
                                                        border: '1px solid rgba(245,158,11,0.2)',
                                                    }}>
                                                    {s.code}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* High-confidence scan — show extracted subjects normally */
                                <div>
                                    <p className="text-[11px] font-black mb-3 flex items-center gap-2"
                                        style={{ color: 'var(--student-gold)' }}>
                                        <span className="text-base">💎</span> AI EXTRACTION: {subjects.length} SUBJECTS FOUND
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {subjects.map((s, i) => (
                                            <span key={i} className="text-[10px] font-mono px-3 py-1 rounded-lg font-bold"
                                                style={{
                                                    background: 'var(--student-black-4)',
                                                    color: 'var(--student-gold-3)',
                                                    border: '1px solid rgba(201, 168, 76, 0.15)',
                                                }}>
                                                {s.code}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            <div className="flex flex-col gap-3 mt-6">
                {corPreview && !scanning && subjects === null && (
                    <button
                        onClick={startScan}
                        className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-[0_4px_20px_rgba(201,168,76,0.2)]"
                        style={{ background: 'var(--student-gold)', color: 'var(--student-black)' }}
                    >
                        Initiate AI Analysis
                    </button>
                )}
                {subjects !== null && (
                    <button
                        onClick={submitCor}
                        disabled={scanning}
                        className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-white disabled:opacity-30 transition-all active:scale-95 shadow-[0_4px_20px_rgba(39,174,96,0.2)]"
                        style={{ background: 'linear-gradient(135deg, var(--student-green), var(--color-success))' }}
                    >
                        Submit Official COR
                    </button>
                )}
                {corPreview && (
                    <button
                        onClick={clearAll}
                        className="w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-student-white-dim/40 hover:text-white transition-all font-mono"
                    >
                        Discard Upload
                    </button>
                )}
            </div>
        </div>
    );
};

export default CorUploadTab;