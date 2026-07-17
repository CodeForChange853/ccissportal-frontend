import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSecretaryRefresh } from '../layout/SecretaryLayout';
import { secretaryApi } from '../api/secretaryApi';
import { useToast } from '../../../context/ToastContext';
import PageHeader from '../../../components/ui/PageHeader';
import EmptyState from '../../../components/ui/EmptyState';

// ─────────────────────────────────────────────────────────────────────────────
// Style helpers (inline CSS — consistent with secretary portal conventions)
// ─────────────────────────────────────────────────────────────────────────────

const S = {
    page:    { display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 24 },
    split:   { display: 'grid', gridTemplateColumns: '340px 1fr', gap: 16, alignItems: 'start' },
    panel:   {
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 14,
        overflow: 'hidden',
    },
    panelHd: {
        padding: '14px 18px',
        borderBottom: '1px solid var(--border-default)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    },
    panelTitle: {
        fontFamily: 'var(--font-code)', fontSize: '0.62rem', fontWeight: 700,
        letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)',
    },
    row: (selected) => ({
        padding: '14px 18px', cursor: 'pointer', borderBottom: '1px solid var(--border-subtle)',
        background: selected ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent',
        borderLeft: selected ? '3px solid var(--accent)' : '3px solid transparent',
        transition: 'all 0.12s',
    }),
    badge: (score) => {
        const pct = Math.round((score ?? 0) * 100);
        const bg  = pct >= 70 ? 'color-mix(in srgb,#f59e0b 15%,transparent)'
                  : pct >= 50 ? 'color-mix(in srgb,#f97316 15%,transparent)'
                  :             'color-mix(in srgb,#ef4444 15%,transparent)';
        const col = pct >= 70 ? '#f59e0b' : pct >= 50 ? '#f97316' : '#ef4444';
        return {
            display: 'inline-block', padding: '2px 8px', borderRadius: 100,
            background: bg, color: col,
            fontFamily: 'var(--font-code)', fontSize: '0.6rem', fontWeight: 700,
        };
    },
    label: {
        fontFamily: 'var(--font-code)', fontSize: '0.58rem', color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4,
    },
    input: {
        width: '100%', boxSizing: 'border-box',
        background: 'var(--bg-surface-alt, #1a1a2e)',
        border: '1px solid var(--border-default)',
        borderRadius: 8, padding: '8px 12px',
        color: 'var(--text-primary)', fontFamily: 'var(--font-code)',
        fontSize: '0.78rem',
    },
    btn: (accent) => ({
        padding: '9px 22px', borderRadius: 8, border: 'none', cursor: 'pointer',
        fontFamily: 'var(--font-code)', fontSize: '0.68rem', fontWeight: 700,
        letterSpacing: '0.06em',
        background: accent ? 'var(--accent)' : 'var(--bg-surface-alt, #1a1a2e)',
        color: accent ? '#fff' : 'var(--text-secondary)',
        boxShadow: accent ? 'var(--shadow-accent)' : 'none',
        transition: 'opacity 0.15s',
    }),
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

const ConfidenceBar = ({ value, label }) => {
    const pct   = Math.round((value ?? 0) * 100);
    const color = pct >= 80 ? '#22c55e' : pct >= 60 ? '#eab308' : pct >= 40 ? '#f97316' : '#ef4444';
    return (
        <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', fontFamily: 'var(--font-code)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
                <span style={{ fontSize: '0.6rem', fontWeight: 700, color, fontFamily: 'var(--font-code)' }}>{pct}%</span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: 'var(--border-default)' }}>
                <div style={{ height: 4, borderRadius: 2, width: `${pct}%`, background: color, transition: 'width 0.6s ease' }} />
            </div>
        </div>
    );
};

const SubjectRow = ({ subject, index, onChange, onRemove }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 60px 32px', gap: 6, marginBottom: 6, alignItems: 'center' }}>
        <input
            style={S.input} value={subject.code}
            onChange={e => onChange(index, 'code', e.target.value)}
            placeholder="CS 101"
        />
        <input
            style={S.input} value={subject.name}
            onChange={e => onChange(index, 'name', e.target.value)}
            placeholder="Intro to Computing"
        />
        <input
            style={{ ...S.input, textAlign: 'center' }} value={subject.units}
            type="number" step="0.5" min="0"
            onChange={e => onChange(index, 'units', parseFloat(e.target.value) || 0)}
        />
        <button
            onClick={() => onRemove(index)}
            style={{ ...S.btn(false), padding: '6px 8px', color: '#ef4444', fontSize: '0.75rem' }}
        >✕</button>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Detail / Correction panel
// ─────────────────────────────────────────────────────────────────────────────

const DetailPanel = ({ item, onVerified }) => {
    const { toast } = useToast();
    const [aiData,      setAiData]      = useState(null);
    const [imageUrl,    setImageUrl]    = useState(null);
    const [imageLoading, setImageLoading] = useState(false);
    const [submitting,  setSubmitting]  = useState(false);

    // Editable correction state
    const [fullName,    setFullName]    = useState('');
    const [studentId,   setStudentId]   = useState('');
    const [subjects,    setSubjects]    = useState([]);
    const [totalUnits,  setTotalUnits]  = useState('');
    const [notes,       setNotes]       = useState('');

    const imageUrlRef = useRef(null);

    // Parse stored AI data and populate form on selection
    useEffect(() => {
        if (!item) { setAiData(null); setImageUrl(null); return; }

        try {
            const parsed = typeof item.extracted_ai_data === 'string'
                ? JSON.parse(item.extracted_ai_data)
                : (item.extracted_ai_data ?? {});
            setAiData(parsed);
            const ed = parsed.extracted_data ?? {};
            setFullName(ed.full_name   ?? '');
            setStudentId(ed.student_id ?? '');
            setSubjects((ed.subjects ?? []).map(s => ({
                code:  s.code  ?? '',
                name:  s.name  ?? '',
                units: s.units ?? 0,
            })));
            setTotalUnits(ed.total_units != null ? String(ed.total_units) : '');
        } catch {
            setAiData(null);
        }

        setNotes('');
    }, [item?.secure_scan_token]);

    // Fetch retained source image (blob URL — requires Bearer token)
    useEffect(() => {
        if (!item?.has_review_image) { setImageUrl(null); return; }

        setImageLoading(true);
        secretaryApi.fetchReviewImageBlob(item.secure_scan_token).then(url => {
            // Revoke previous blob URL to avoid memory leak
            if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current);
            imageUrlRef.current = url;
            setImageUrl(url);
        }).finally(() => setImageLoading(false));

        return () => {
            if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current);
        };
    }, [item?.secure_scan_token, item?.has_review_image]);

    const addSubject = () => setSubjects(prev => [...prev, { code: '', name: '', units: 3 }]);

    const updateSubject = (idx, field, val) => setSubjects(prev =>
        prev.map((s, i) => i === idx ? { ...s, [field]: val } : s)
    );

    const removeSubject = (idx) => setSubjects(prev => prev.filter((_, i) => i !== idx));

    const handleVerify = async () => {
        if (submitting) return;
        setSubmitting(true);
        try {
            const correctedSubjects = subjects
                .filter(s => s.code.trim())
                .map(s => ({ code: s.code.trim(), name: s.name.trim(), units: Number(s.units) }));

            const payload = {
                corrected_data: {
                    full_name:   fullName   || undefined,
                    student_id:  studentId  || undefined,
                    total_units: totalUnits ? parseFloat(totalUnits) : undefined,
                    subjects:    correctedSubjects.length ? correctedSubjects : undefined,
                },
                reviewer_notes: notes || undefined,
            };

            await secretaryApi.correctScanData(item.secure_scan_token, payload);
            toast.success('Document verified and marked as MANUALLY_VERIFIED.');
            onVerified(item.secure_scan_token);
        } catch (err) {
            const msg = err?.response?.data?.detail ?? 'Verification failed. Please try again.';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (!item) {
        return (
            <div style={{ ...S.panel, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: '2rem', marginBottom: 12 }}>🔍</div>
                    <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-code)', fontSize: '0.72rem' }}>
                        Select a document from the queue to review
                    </p>
                </div>
            </div>
        );
    }

    const breakdown = aiData?.confidence_breakdown ?? {};
    const pct       = Math.round((item.confidence_score ?? 0) * 100);

    return (
        <div style={S.panel}>
            {/* Header */}
            <div style={S.panelHd}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={S.panelTitle}>Review — {item.document_type ?? 'DOC'}</span>
                    <span style={S.badge(item.confidence_score)}>AI Confidence: {pct}%</span>
                </div>
                <span style={{ fontFamily: 'var(--font-code)', fontSize: '0.58rem', color: 'var(--text-muted)' }}>
                    Token: {item.secure_scan_token.slice(0, 8)}…
                </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>

                {/* ── Left: Source Image ────────────────────────────────── */}
                <div style={{ padding: 18, borderRight: '1px solid var(--border-default)' }}>
                    <div style={S.label}>Source Document</div>
                    <div style={{
                        background: '#0a0a0f', borderRadius: 10, minHeight: 280,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden', border: '1px solid var(--border-subtle)',
                    }}>
                        {imageLoading ? (
                            <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-code)', fontSize: '0.68rem' }}>Loading image…</p>
                        ) : imageUrl ? (
                            <img src={imageUrl} alt="Uploaded document" style={{ maxWidth: '100%', maxHeight: 400, objectFit: 'contain' }} />
                        ) : (
                            <div style={{ textAlign: 'center', padding: 24 }}>
                                <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>🖼️</div>
                                <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-code)', fontSize: '0.65rem' }}>
                                    Source image not available<br />
                                    <span style={{ color: 'var(--text-subtle)', fontSize: '0.58rem' }}>
                                        It may have been cleaned up already
                                    </span>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Confidence breakdown bars */}
                    {Object.keys(breakdown).length > 0 && (
                        <div style={{ marginTop: 16 }}>
                            <div style={{ ...S.label, marginBottom: 10 }}>Confidence Breakdown</div>
                            <ConfidenceBar value={breakdown.completeness}  label="Completeness (30%)" />
                            <ConfidenceBar value={breakdown.format_valid}  label="Format Valid (30%)" />
                            <ConfidenceBar value={breakdown.consistency}   label="Consistency (25%)" />
                            <ConfidenceBar value={breakdown.richness}      label="Richness (15%)" />
                            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border-subtle)' }}>
                                <ConfidenceBar value={item.confidence_score} label="Overall Composite" />
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Right: Editable Correction Form ──────────────────── */}
                <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                        <div style={S.label}>Full Name</div>
                        <input
                            style={S.input} value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            placeholder="As printed on the COR"
                        />
                    </div>
                    <div>
                        <div style={S.label}>Student ID</div>
                        <input
                            style={S.input} value={studentId}
                            onChange={e => setStudentId(e.target.value)}
                            placeholder="e.g. 2021-00123"
                        />
                    </div>

                    {/* Subjects table */}
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <div style={S.label}>Subjects</div>
                            <button onClick={addSubject} style={{ ...S.btn(false), padding: '4px 10px', fontSize: '0.62rem' }}>
                                + Add Row
                            </button>
                        </div>

                        {/* Column headers */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 60px 32px', gap: 6, marginBottom: 4 }}>
                            {['Code', 'Name', 'Units', ''].map(h => (
                                <div key={h} style={{ ...S.label, marginBottom: 0, fontSize: '0.56rem' }}>{h}</div>
                            ))}
                        </div>

                        <div style={{ maxHeight: 220, overflowY: 'auto', paddingRight: 2 }}>
                            {subjects.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-code)', fontSize: '0.65rem', textAlign: 'center', padding: '20px 0' }}>
                                    No subjects — add rows manually or check the source image
                                </p>
                            ) : subjects.map((s, i) => (
                                <SubjectRow key={i} subject={s} index={i} onChange={updateSubject} onRemove={removeSubject} />
                            ))}
                        </div>
                    </div>

                    <div>
                        <div style={S.label}>Total Units</div>
                        <input
                            style={{ ...S.input, width: 100 }} value={totalUnits}
                            type="number" step="0.5" min="0"
                            onChange={e => setTotalUnits(e.target.value)}
                            placeholder="21"
                        />
                    </div>

                    <div>
                        <div style={S.label}>Reviewer Notes (optional)</div>
                        <textarea
                            style={{ ...S.input, minHeight: 64, resize: 'vertical' }}
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="e.g. Subject code CS 101A corrected — partial smudge on original"
                        />
                    </div>

                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
                        <button
                            onClick={handleVerify}
                            disabled={submitting}
                            style={{ ...S.btn(true), opacity: submitting ? 0.6 : 1 }}
                        >
                            {submitting ? 'Saving…' : '✓ Mark as Verified'}
                        </button>
                    </div>

                    <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-code)', fontSize: '0.58rem', lineHeight: 1.6 }}>
                        ⚠️ Marking as verified will clear the prerequisite check results. The system will re-run them automatically when the student submits their enrollment form.
                    </p>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main page component
// ─────────────────────────────────────────────────────────────────────────────

const DocumentVerificationQueue = () => {
    const { toast }   = useToast();
    const tick        = useSecretaryRefresh();

    const [queue,     setQueue]     = useState([]);
    const [total,     setTotal]     = useState(0);
    const [loading,   setLoading]   = useState(true);
    const [selected,  setSelected]  = useState(null);   // full item object including extracted_ai_data
    const [skip,      setSkip]      = useState(0);
    const LIMIT = 30;

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { items, total: t } = await secretaryApi.fetchVerificationQueue(skip, LIMIT);
            // For each item, we also need extracted_ai_data for the detail panel.
            // The queue endpoint returns summary rows — fetch full detail lazily (on selection).
            setQueue(items);
            setTotal(t);
        } catch {
            toast.error('Failed to load verification queue.');
        } finally {
            setLoading(false);
        }
    }, [skip, tick]);

    useEffect(() => { load(); }, [load]);

    // When the user selects a queue item, fetch the full scan detail via apiClient
    // (the queue list endpoint returns summary rows only; we need extracted_ai_data
    // for the confidence breakdown bars and pre-populated form fields)
    const handleSelect = async (item) => {
        try {
            const detail = await secretaryApi.fetchScanDetail(item.secure_scan_token);
            // Merge: queue item metadata + the detail endpoint's full extracted payload
            setSelected({
                ...item,
                extracted_ai_data: detail.extracted_data
                    ? JSON.stringify({
                        extracted_data:       detail.extracted_data,
                        confidence_breakdown: detail.confidence_breakdown,
                        confidence_score:     detail.confidence_score,
                        model_used:           detail.model_used,
                    })
                    : null,
            });
        } catch {
            toast.error('Could not load scan detail.');
            setSelected(item);
        }
    };

    const handleVerified = (token) => {
        setQueue(prev => prev.filter(i => i.secure_scan_token !== token));
        setTotal(prev => Math.max(0, prev - 1));
        setSelected(null);
    };

    const formatDate = (iso) => {
        if (!iso) return '—';
        return new Date(iso).toLocaleDateString('en-PH', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div style={S.page}>
            <PageHeader
                title="AI Document Verification Queue"
                subtitle={loading ? 'Loading…' : `${total} document${total !== 1 ? 's' : ''} awaiting manual review`}
            />

            {!loading && queue.length === 0 ? (
                <EmptyState
                    icon="✅"
                    title="Queue is clear"
                    message="All AI scans met the confidence threshold. No documents need manual review right now."
                />
            ) : (
                <div style={S.split}>
                    {/* ── Left: Queue list ─────────────────────── */}
                    <div style={S.panel}>
                        <div style={S.panelHd}>
                            <span style={S.panelTitle}>Pending Review ({total})</span>
                            {loading && (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem', fontFamily: 'var(--font-code)' }}>
                                    Loading…
                                </span>
                            )}
                        </div>

                        {queue.map(item => {
                            const isSelected = selected?.secure_scan_token === item.secure_scan_token;
                            const pct = Math.round((item.confidence_score ?? 0) * 100);
                            return (
                                <div
                                    key={item.secure_scan_token}
                                    style={S.row(isSelected)}
                                    onClick={() => handleSelect(item)}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                        <span style={{ fontFamily: 'var(--font-code)', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                            {item.document_type ?? 'UNKNOWN'}
                                        </span>
                                        <span style={S.badge(item.confidence_score)}>{pct}%</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontFamily: 'var(--font-code)', fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                                            {item.secure_scan_token.slice(0, 12)}…
                                        </span>
                                        <span style={{ fontFamily: 'var(--font-code)', fontSize: '0.58rem', color: 'var(--text-subtle, #555)' }}>
                                            {formatDate(item.date_scanned)}
                                        </span>
                                    </div>
                                    {item.has_review_image && (
                                        <span style={{ fontFamily: 'var(--font-code)', fontSize: '0.56rem', color: '#22c55e', marginTop: 2, display: 'block' }}>
                                            📎 Image available
                                        </span>
                                    )}
                                </div>
                            );
                        })}

                        {/* Pagination */}
                        {total > LIMIT && (
                            <div style={{ padding: '12px 18px', display: 'flex', gap: 8, justifyContent: 'center', borderTop: '1px solid var(--border-default)' }}>
                                <button
                                    style={{ ...S.btn(false), padding: '6px 14px', fontSize: '0.62rem' }}
                                    disabled={skip === 0}
                                    onClick={() => setSkip(prev => Math.max(0, prev - LIMIT))}
                                >← Prev</button>
                                <button
                                    style={{ ...S.btn(false), padding: '6px 14px', fontSize: '0.62rem' }}
                                    disabled={skip + LIMIT >= total}
                                    onClick={() => setSkip(prev => prev + LIMIT)}
                                >Next →</button>
                            </div>
                        )}
                    </div>

                    {/* ── Right: Detail / correction panel ─────── */}
                    <DetailPanel item={selected} onVerified={handleVerified} />
                </div>
            )}
        </div>
    );
};

export default DocumentVerificationQueue;
