import React, { useMemo } from 'react';

// ── Helpers 
const parseScanData = (rawJson) => {
    if (!rawJson) return null;
    try {
        return typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;
    } catch {
        return null;
    }
};


const compareField = (studentValue, aiValue) => {
    if (!studentValue && !aiValue) return 'missing';
    if (!aiValue) return 'ai_missing';
    if (!studentValue) return 'student_missing';
    const norm = (v) => String(v).trim().toLowerCase();
    return norm(studentValue) === norm(aiValue) ? 'match' : 'mismatch';
};

const STATUS_CONFIG = {
    match: { icon: '✅', label: 'MATCH', cls: 'text-emerald-400', rowCls: '' },
    mismatch: { icon: '⚠️', label: 'MISMATCH', cls: 'text-rose-400', rowCls: 'bg-rose-900/10' },
    missing: { icon: '—', label: 'BOTH MISSING', cls: 'text-slate-500', rowCls: 'opacity-40' },
    ai_missing: { icon: '❓', label: 'NOT READ', cls: 'text-amber-400', rowCls: 'bg-amber-900/10' },
    student_missing: { icon: '➕', label: 'AI ONLY', cls: 'text-cyan-400', rowCls: 'bg-cyan-900/10' },
};

// ── Sub-components 

const FieldRow = ({ label, studentVal, aiVal }) => {
    const status = compareField(studentVal, aiVal);
    const cfg = STATUS_CONFIG[status];

    return (
        <tr className={`border-b border-slate-800/60 ${cfg.rowCls}`}>
            <td className="py-2.5 px-4 text-[10px] text-slate-500 font-mono uppercase tracking-wider w-32 flex-shrink-0">
                {label}
            </td>
            <td className="py-2.5 px-4 text-sm text-slate-200 max-w-[180px]">
                <span className="truncate block">{studentVal || <span className="text-slate-600 italic">not provided</span>}</span>
            </td>
            <td className="py-2.5 px-4 text-sm max-w-[180px]">
                <span className={`truncate block font-medium ${status === 'mismatch' ? 'text-rose-300' : status === 'match' ? 'text-emerald-300' : 'text-slate-400'}`}>
                    {aiVal || <span className="text-slate-600 italic">not extracted</span>}
                </span>
            </td>
            <td className="py-2.5 px-4 text-right">
                <span className={`text-[10px] font-bold font-mono ${cfg.cls}`}>
                    {cfg.icon} {cfg.label}
                </span>
            </td>
        </tr>
    );
};

const ConfidenceBar = ({ value, label }) => {
    const pct = Math.round((value ?? 0) * 100);
    const color = pct >= 80 ? 'bg-emerald-500'
        : pct >= 60 ? 'bg-yellow-500'
            : pct >= 40 ? 'bg-orange-500'
                : 'bg-rose-500';
    return (
        <div>
            <div className="flex justify-between mb-0.5">
                <span className="text-[9px] text-slate-500 font-mono uppercase">{label}</span>
                <span className={`text-[9px] font-bold font-mono ${pct >= 80 ? 'text-emerald-400' : pct >= 60 ? 'text-yellow-400' : 'text-rose-400'}`}>
                    {pct}%
                </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5">
                <div className={`h-1.5 rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
};

// ── Main component 

const ScanDiffViewer = ({ enrollment, onClose }) => {
    const scanData = useMemo(
        () => parseScanData(enrollment?.extracted_scan_data || enrollment?.extracted_ai_data),
        [enrollment]
    );

    if (!scanData) {
        return (
            <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-5 mt-3">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Verification Score Card
                    </h4>
                    <button onClick={onClose} className="text-slate-600 hover:text-slate-400 text-xs">✕ Close</button>
                </div>
                <p className="text-slate-600 font-mono text-xs text-center py-4">
                    No AI scan data available for this enrollment.
                </p>
            </div>
        );
    }

    const extracted = scanData.extracted_data || {};
    const breakdown = scanData.confidence_breakdown || {};
    const overallScore = scanData.confidence_score ?? 0;
    const docType = scanData.doc_type || 'COR';
    const modelUsed = scanData.model_used || 'gemini';
    const overallPct = Math.round(overallScore * 100);

    // ── Build field comparisons 
    // For ID scans
    const idFields = docType === 'ID' ? [
        { label: 'Student ID', studentVal: enrollment.student_id_submitted, aiVal: extracted.student_id },
        { label: 'Full Name', studentVal: enrollment.full_name, aiVal: extracted.full_name },
        { label: 'Course', studentVal: enrollment.course_submitted, aiVal: extracted.course },
    ] : [];

    // For COR scans — compare year/semester and subject count
    const corSummaryFields = docType === 'COR' ? [
        {
            label: 'Year Level',
            studentVal: enrollment.target_year_level ? `Year ${enrollment.target_year_level}` : null,
            aiVal: null,
        },
        {
            label: 'Semester',
            studentVal: enrollment.target_semester ? `Sem ${enrollment.target_semester}` : null,
            aiVal: null,
        },
        {
            label: 'Total Units',
            studentVal: null,
            aiVal: extracted.total_units != null ? `${extracted.total_units} units` : null,
        },
    ] : [];

    const subjects = extracted.subjects || [];

    const fieldStatuses = idFields.map(f => compareField(f.studentVal, f.aiVal));
    const matchCount = fieldStatuses.filter(s => s === 'match').length;
    const mismatchCount = fieldStatuses.filter(s => s === 'mismatch').length;

    return (
        <div className="bg-[#080e1c] border border-cyan-900/40 rounded-xl mt-3 overflow-hidden">

            {/* ── Header  */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-cyan-900/30 bg-cyan-950/20">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
                        🔍 Verification Score Card
                    </span>
                    <span className={`text-[9px] px-2 py-0.5 rounded border font-mono font-bold ${overallPct >= 80 ? 'bg-emerald-900/30 text-emerald-400 border-emerald-700/40'
                        : overallPct >= 60 ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700/40'
                            : 'bg-rose-900/30 text-rose-400 border-rose-700/40'
                        }`}>
                        AI CONFIDENCE: {overallPct}%
                    </span>
                    {docType === 'ID' && matchCount > 0 && (
                        <span className="text-[9px] text-slate-500 font-mono">
                            {matchCount}/{idFields.length} fields match
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[9px] text-slate-600 font-mono">{modelUsed}</span>
                    <button onClick={onClose} className="text-slate-600 hover:text-slate-400 text-xs transition-colors">
                        ✕ Close
                    </button>
                </div>
            </div>

            <div className="p-5 space-y-5">

                {/*  Split-screen column headers  */}
                {(idFields.length > 0 || corSummaryFields.length > 0) && (
                    <div>
                        <div className="grid grid-cols-3 text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1 px-4">
                            <span>Field</span>
                            <span>Student Submitted</span>
                            <span>AI Read from Document</span>
                        </div>
                        <div className="bg-slate-900/60 border border-slate-800 rounded-lg overflow-hidden">
                            <table className="w-full">
                                <tbody>
                                    {idFields.map((f, i) => (
                                        <FieldRow key={i} {...f} />
                                    ))}
                                    {corSummaryFields.map((f, i) => (
                                        <FieldRow key={`cor-${i}`} {...f} />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/*  Extracted subjects (COR only)  */}
                {docType === 'COR' && subjects.length > 0 && (
                    <div>
                        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-2">
                            Subjects Extracted by AI — {subjects.length} found
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                            {subjects.map((s, i) => (
                                <div key={i} className="flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2">
                                    <div className="min-w-0">
                                        <span className="text-[10px] font-mono font-bold text-cyan-400">{s.code}</span>
                                        <p className="text-[10px] text-slate-400 truncate">{s.name}</p>
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-mono ml-2 flex-shrink-0">
                                        {s.units}u
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Confidence breakdown  */}
                {Object.keys(breakdown).length > 0 && (
                    <div>
                        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-3">
                            Confidence Breakdown (4-Factor Analysis)
                        </p>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                            {/* ID document factors */}
                            {breakdown.field_completeness != null && (
                                <ConfidenceBar value={breakdown.field_completeness} label="Field Completeness (40%)" />
                            )}
                            {breakdown.format_validation != null && (
                                <ConfidenceBar value={breakdown.format_validation} label="Format Validation (35%)" />
                            )}
                            {breakdown.semantic_coherence != null && (
                                <ConfidenceBar value={breakdown.semantic_coherence} label="Semantic Coherence (25%)" />
                            )}
                            {/* COR document factors */}
                            {breakdown.subject_count_validity != null && (
                                <ConfidenceBar value={breakdown.subject_count_validity} label="Subject Count (40%)" />
                            )}
                            {breakdown.units_consistency != null && (
                                <ConfidenceBar value={breakdown.units_consistency} label="Units Consistency (35%)" />
                            )}
                            {breakdown.subject_code_format != null && (
                                <ConfidenceBar value={breakdown.subject_code_format} label="Code Format (25%)" />
                            )}
                        </div>
                        {/* Overall composite */}
                        <div className="mt-3 pt-3 border-t border-slate-800">
                            <ConfidenceBar value={overallScore} label="Overall Composite Score" />
                        </div>
                    </div>
                )}

                {/* ── Decision hint  */}
                <div className={`rounded-lg px-4 py-2.5 text-xs font-mono border ${overallPct >= 80
                    ? 'bg-emerald-900/15 border-emerald-800/40 text-emerald-400'
                    : overallPct >= 60
                        ? 'bg-yellow-900/15 border-yellow-800/40 text-yellow-400'
                        : 'bg-rose-900/15 border-rose-800/40 text-rose-400'
                    }`}>
                    {overallPct >= 80 && '✅ High confidence — document appears authentic and well-extracted. Safe to approve.'}
                    {overallPct >= 60 && overallPct < 80 && '⚠️  Moderate confidence — review mismatched fields carefully before deciding.'}
                    {overallPct < 60 && '❌ Low confidence — document may be unclear, damaged, or mismatched. Consider rejecting.'}
                </div>

            </div>
        </div>
    );
};

export default ScanDiffViewer;