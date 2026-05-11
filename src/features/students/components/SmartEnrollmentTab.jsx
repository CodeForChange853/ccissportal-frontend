import React, { useState, useMemo } from 'react';
import CorUploadTab from './CorUploadTab';

const CARD = {
    background: 'var(--student-black-3)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 24,
};

// ── Retention banner ─────────────────────────────────────────────────────────
const RetentionBanner = ({ retentionStatus }) => {
    if (!retentionStatus || retentionStatus.status === 'GOOD') return null;

    const config = {
        AT_RISK:         { bg: 'rgba(230,162,60,0.12)', border: 'rgba(230,162,60,0.3)', color: '#e6a23c', icon: '⚠️', label: 'AT RISK' },
        UNDER_RETENTION: { bg: 'rgba(245,108,108,0.12)', border: 'rgba(245,108,108,0.35)', color: '#f56c6c', icon: '🔴', label: 'UNDER RETENTION' },
        DROPOUT_RISK:    { bg: 'rgba(192,57,43,0.15)', border: 'rgba(192,57,43,0.5)', color: '#c0392b', icon: '🚨', label: 'DROPOUT RISK' },
    };
    const c = config[retentionStatus.status] || config.AT_RISK;

    return (
        <div style={{
            background: c.bg, border: `1px solid ${c.border}`,
            borderRadius: 12, padding: '14px 18px',
            display: 'flex', alignItems: 'flex-start', gap: 12,
        }}>
            <span style={{ fontSize: 18 }}>{c.icon}</span>
            <div>
                <p style={{ fontSize: 11, fontWeight: 900, color: c.color, fontFamily: 'var(--student-font-mono)', letterSpacing: 2, margin: 0 }}>
                    {c.label}
                </p>
                <p style={{ fontSize: 12, color: 'rgba(245,240,232,0.75)', marginTop: 4, lineHeight: 1.6, margin: '4px 0 0' }}>
                    {retentionStatus.message}
                </p>
            </div>
        </div>
    );
};

// ── Subject draggable chip ────────────────────────────────────────────────────
const SubjectChip = ({ sub, onDragStart, variant = 'next' }) => {
    const styles = {
        next: {
            bg: 'var(--student-gold-dim2)',
            border: '1px solid rgba(201,168,76,0.2)',
            codeColor: 'var(--student-gold-2)',
            unitColor: 'var(--student-gold)',
        },
        back: {
            bg: variant === 'back' && sub.subject_type === 'MAJOR'
                ? 'rgba(245,108,108,0.08)' : 'rgba(230,162,60,0.08)',
            border: variant === 'back' && sub.subject_type === 'MAJOR'
                ? '1px solid rgba(245,108,108,0.25)' : '1px solid rgba(230,162,60,0.25)',
            codeColor: sub.subject_type === 'MAJOR' ? '#f56c6c' : '#e6a23c',
            unitColor: sub.subject_type === 'MAJOR' ? '#f56c6c' : '#e6a23c',
        },
    };
    const s = styles[variant] || styles.next;

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, sub)}
            style={{
                padding: '10px 14px', borderRadius: 12, cursor: 'grab',
                background: s.bg, border: s.border, transition: 'all 0.15s',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: s.codeColor, margin: 0 }}>{sub.subject_code}</p>
                {variant === 'back' && (
                    <span style={{
                        fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 8,
                        background: sub.subject_type === 'MAJOR' ? 'rgba(245,108,108,0.15)' : 'rgba(230,162,60,0.15)',
                        color: s.codeColor, fontFamily: 'var(--student-font-mono)', letterSpacing: 1,
                    }}>
                        {sub.subject_type}
                    </span>
                )}
            </div>
            <p style={{ fontSize: 10, color: s.unitColor, fontFamily: 'var(--student-font-mono)', marginTop: 2 }}>
                {sub.credit_units || 3} units {sub.times_failed > 1 ? `· ${sub.times_failed}× failed` : ''}
            </p>
        </div>
    );
};

// ── Back Subject Prompt ───────────────────────────────────────────────────────
const BackSubjectPrompt = ({ backSubjects, onAddAll, onSkip }) => {
    if (!backSubjects || backSubjects.length === 0) return null;

    return (
        <div style={{
            background: 'rgba(230,162,60,0.08)',
            border: '1px solid rgba(230,162,60,0.25)',
            borderRadius: 12, padding: '14px 18px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
            <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#e6a23c', fontFamily: 'var(--student-font-mono)', margin: 0 }}>
                    📚 You have {backSubjects.length} back subject{backSubjects.length > 1 ? 's' : ''} to retake
                </p>
                <p style={{ fontSize: 11, color: 'rgba(245,240,232,0.6)', marginTop: 4, margin: '4px 0 0' }}>
                    Do you want to add them to your schedule before enrolling?
                </p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                    onClick={onAddAll}
                    style={{
                        padding: '8px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                        border: '1px solid rgba(230,162,60,0.5)', cursor: 'pointer',
                        background: 'rgba(230,162,60,0.15)', color: '#e6a23c',
                        fontFamily: 'var(--student-font-mono)',
                    }}
                >Add All</button>
                <button
                    onClick={onSkip}
                    style={{
                        padding: '8px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                        border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer',
                        background: 'transparent', color: 'rgba(245,240,232,0.4)',
                        fontFamily: 'var(--student-font-mono)',
                    }}
                >Skip</button>
            </div>
        </div>
    );
};


// ── Main component ────────────────────────────────────────────────────────────
const SmartEnrollmentTab = ({ academicStanding, onSuccess }) => {
    const [useSmartEnroll, setUseSmartEnroll] = useState(true);
    const [scheduleBlocks, setScheduleBlocks] = useState({
        blockA: null, blockB: null, blockC: null, blockD: null, blockE: null,
        blockF: null, blockG: null,
    });
    const [collision, setCollision] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [promptDismissed, setPromptDismissed] = useState(false);

    const isIrregular      = academicStanding?.is_irregular ?? false;
    const retentionStatus  = academicStanding?.retention_status ?? null;
    const backSubjects     = useMemo(() => academicStanding?.back_subjects ?? [], [academicStanding]);

    const recommendedSubjects = useMemo(() =>
        academicStanding?.next_semester_recommendation?.subject_results?.filter(s => s.status === 'AVAILABLE') ?? []
    , [academicStanding]);

    // Handle "Add All" back subjects → fill empty slots
    const handleAddAllBackSubjects = () => {
        setScheduleBlocks(prev => {
            const updated = { ...prev };
            const emptySlots = Object.keys(updated).filter(k => !updated[k]);
            let slotIdx = 0;
            for (const sub of backSubjects) {
                if (slotIdx >= emptySlots.length) break;
                const alreadyPlaced = Object.values(updated).some(b => b?.subject_id === sub.subject_id);
                if (!alreadyPlaced) {
                    updated[emptySlots[slotIdx]] = sub;
                    slotIdx++;
                }
            }
            return updated;
        });
        setPromptDismissed(true);
    };

    const handleSmartEnrollSubmit = async () => {
        if (enrolledCount === 0 || isSubmitting) return;
        setIsSubmitting(true);
        try {
            let nextSem = (academicStanding?.student_semester || 1) + 1;
            let nextYear = academicStanding?.student_year_level || 1;
            if (nextSem > 2) { nextSem = 1; nextYear++; }

            const selectedSubjects = Object.values(scheduleBlocks)
                .filter(Boolean)
                .map(sub => sub.subject_code);

            const { studentApi } = await import('../api/studentApi');
            await studentApi.submitSmartEnrollment({
                target_year_level: nextYear,
                target_semester: nextSem,
                extracted_subjects: selectedSubjects,
            });
            onSuccess?.();
        } catch (err) {
            console.error('Smart Enrollment Failed', err);
            alert('Submission failed. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDragStart = (e, subject) => e.dataTransfer.setData('subject', JSON.stringify(subject));

    const handleDrop = (e, blockId) => {
        e.preventDefault();
        const subjectStr = e.dataTransfer.getData('subject');
        if (!subjectStr) return;
        const subject = JSON.parse(subjectStr);

        if (scheduleBlocks[blockId]) {
            setCollision(blockId);
            setTimeout(() => setCollision(null), 600);
            return;
        }

        const alreadyIn = Object.keys(scheduleBlocks).find(k => scheduleBlocks[k]?.subject_id === subject.subject_id);
        const newBlocks = { ...scheduleBlocks };
        if (alreadyIn) newBlocks[alreadyIn] = null;
        newBlocks[blockId] = subject;
        setScheduleBlocks(newBlocks);
    };

    const removeSubject = (blockId) => setScheduleBlocks(prev => ({ ...prev, [blockId]: null }));

    const enrolledCount  = Object.values(scheduleBlocks).filter(Boolean).length;
    const backCount      = Object.values(scheduleBlocks).filter(b => b && backSubjects.some(bs => bs.subject_id === b.subject_id)).length;
    const totalUnits     = Object.values(scheduleBlocks).filter(Boolean).reduce((s, b) => s + (b.credit_units || 3), 0);

    const showPrompt = isIrregular && backSubjects.length > 0 && !promptDismissed
        && Object.values(scheduleBlocks).every(b => !b || !backSubjects.some(bs => bs.subject_id === b.subject_id));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Mode toggle */}
            <div style={{ display: 'flex', gap: 8, background: 'var(--student-black-3)', padding: 6, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                {[
                    { val: true,  label: 'AI Auto-Scheduler' },
                    { val: false, label: 'Manual COR Upload' },
                ].map(({ val, label }) => (
                    <button
                        key={label}
                        onClick={() => setUseSmartEnroll(val)}
                        style={{
                            flex: 1, padding: '10px 0', borderRadius: 12, fontSize: 12,
                            fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                            fontFamily: 'var(--student-font-body)',
                            background: useSmartEnroll === val ? 'var(--student-gold)' : 'transparent',
                            color: useSmartEnroll === val ? 'var(--student-black)' : 'var(--student-white-dim)',
                        }}
                    >{label}</button>
                ))}
            </div>

            {useSmartEnroll ? (
                <>
                    {/* Irregular student badge */}
                    {isIrregular && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            background: 'rgba(230,162,60,0.08)', border: '1px solid rgba(230,162,60,0.2)',
                            borderRadius: 10, padding: '10px 16px',
                        }}>
                            <span style={{ fontSize: 16 }}>📋</span>
                            <div>
                                <p style={{ fontSize: 11, fontWeight: 900, color: '#e6a23c', fontFamily: 'var(--student-font-mono)', letterSpacing: 2, margin: 0 }}>
                                    IRREGULAR STUDENT
                                </p>
                                <p style={{ fontSize: 11, color: 'rgba(245,240,232,0.55)', marginTop: 2, margin: '2px 0 0' }}>
                                    You have failed or back subjects. Back subjects are shown below — you may add them to your schedule.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Retention warning */}
                    <RetentionBanner retentionStatus={retentionStatus} />

                    {/* Back subject prompt */}
                    {showPrompt && (
                        <BackSubjectPrompt
                            backSubjects={backSubjects}
                            onAddAll={handleAddAllBackSubjects}
                            onSkip={() => setPromptDismissed(true)}
                        />
                    )}

                    {/* Next semester subjects pool */}
                    <div style={{ ...CARD, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: 'var(--student-gold)' }} />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--student-white)', fontFamily: 'var(--student-font-display)', margin: 0 }}>
                                <span style={{ color: 'var(--student-gold)' }}>✨</span> AI-Recommended Subjects
                            </h3>
                            <span style={{
                                fontSize: 10, fontWeight: 700, padding: '3px 12px', borderRadius: 20,
                                background: 'var(--student-gold-dim)', color: 'var(--student-gold)',
                                border: '1px solid rgba(201,168,76,0.2)', fontFamily: 'var(--student-font-mono)',
                            }}>NEXT SEMESTER</span>
                        </div>

                        <p style={{ fontSize: 12, color: 'var(--student-white-dim)', marginBottom: 16, lineHeight: 1.6 }}>
                            Our AI analyzed your prerequisites. Drag available subjects into the schedule builder slots below.
                        </p>

                        <div style={{
                            display: 'flex', flexWrap: 'wrap', gap: 10, minHeight: 60,
                            padding: 14, background: 'rgba(0,0,0,0.3)', borderRadius: 12,
                            border: '1px solid rgba(255,255,255,0.05)',
                        }}>
                            {recommendedSubjects.length > 0 ? recommendedSubjects.map(sub => {
                                const placed = Object.values(scheduleBlocks).some(b => b?.subject_id === sub.subject_id);
                                if (placed) return null;
                                return <SubjectChip key={sub.subject_code} sub={sub} onDragStart={handleDragStart} variant="next" />;
                            }) : (
                                <p style={{ fontSize: 12, color: 'rgba(245,240,232,0.3)', width: '100%', textAlign: 'center', padding: '12px 0', fontFamily: 'var(--student-font-mono)' }}>
                                    No available subjects based on your prerequisites.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Back subjects pool (only for irregular students) */}
                    {isIrregular && backSubjects.length > 0 && (
                        <div style={{ ...CARD, position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: '#e6a23c' }} />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--student-white)', fontFamily: 'var(--student-font-display)', margin: 0 }}>
                                    <span style={{ color: '#e6a23c' }}>🔁</span> Back Subjects (Retake)
                                </h3>
                                <span style={{
                                    fontSize: 10, fontWeight: 700, padding: '3px 12px', borderRadius: 20,
                                    background: 'rgba(230,162,60,0.1)', color: '#e6a23c',
                                    border: '1px solid rgba(230,162,60,0.2)', fontFamily: 'var(--student-font-mono)',
                                }}>{backSubjects.length} PENDING RETAKE</span>
                            </div>

                            <p style={{ fontSize: 12, color: 'var(--student-white-dim)', marginBottom: 16, lineHeight: 1.6 }}>
                                These are your failed subjects. <strong style={{ color: '#f56c6c' }}>MAJOR</strong> back subjects must be resolved — drag them into your schedule or they will block further advancement.
                                <strong style={{ color: '#e6a23c' }}> MINOR</strong> subjects can be retaken as extra load.
                            </p>

                            <div style={{
                                display: 'flex', flexWrap: 'wrap', gap: 10, minHeight: 60,
                                padding: 14, background: 'rgba(0,0,0,0.3)', borderRadius: 12,
                                border: '1px dashed rgba(230,162,60,0.2)',
                            }}>
                                {backSubjects.map(sub => {
                                    const placed = Object.values(scheduleBlocks).some(b => b?.subject_id === sub.subject_id);
                                    if (placed) return null;
                                    return <SubjectChip key={sub.subject_code} sub={sub} onDragStart={handleDragStart} variant="back" />;
                                })}
                                {backSubjects.every(sub => Object.values(scheduleBlocks).some(b => b?.subject_id === sub.subject_id)) && (
                                    <p style={{ fontSize: 12, color: 'rgba(230,162,60,0.4)', width: '100%', textAlign: 'center', padding: '12px 0', fontFamily: 'var(--student-font-mono)' }}>
                                        All back subjects have been added to the schedule.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Schedule builder */}
                    <div style={CARD}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--student-white)', fontFamily: 'var(--student-font-display)', marginBottom: 20 }}>
                            Conflict-Free Schedule Builder
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
                            {Object.entries(scheduleBlocks).map(([blockId, sub]) => {
                                const isColliding = collision === blockId;
                                const isBackSub   = sub && backSubjects.some(bs => bs.subject_id === sub.subject_id);
                                return (
                                    <div
                                        key={blockId}
                                        onDrop={e => handleDrop(e, blockId)}
                                        onDragOver={e => e.preventDefault()}
                                        style={{
                                            minHeight: 100, borderRadius: 14, display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                            padding: 14, position: 'relative', transition: 'all 0.2s',
                                            background: isColliding ? 'rgba(192,57,43,0.1)'
                                                : sub ? (isBackSub ? 'rgba(230,162,60,0.08)' : 'var(--student-gold-dim)')
                                                : 'rgba(0,0,0,0.2)',
                                            border: isColliding ? '1px solid rgba(192,57,43,0.5)'
                                                : sub ? (isBackSub ? '1px solid rgba(230,162,60,0.3)' : '1px solid rgba(201,168,76,0.3)')
                                                : '2px dashed rgba(255,255,255,0.1)',
                                        }}
                                    >
                                        <span style={{
                                            position: 'absolute', top: 10, left: 12,
                                            fontSize: 9, fontFamily: 'var(--student-font-mono)',
                                            fontWeight: 700, color: 'rgba(245,240,232,0.25)',
                                            textTransform: 'uppercase', letterSpacing: 2,
                                        }}>{blockId.replace('block', 'Slot ')}</span>

                                        {!sub ? (
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{
                                                    width: 28, height: 28, borderRadius: '50%',
                                                    border: '1px dashed rgba(245,240,232,0.2)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    margin: '0 auto 6px', fontSize: 16, color: 'rgba(245,240,232,0.2)',
                                                }}>+</div>
                                                <span style={{ fontSize: 10, color: 'rgba(245,240,232,0.25)', fontFamily: 'var(--student-font-mono)', fontWeight: 700 }}>
                                                    Empty Slot
                                                </span>
                                            </div>
                                        ) : (
                                            <div style={{ textAlign: 'center', width: '100%' }}>
                                                <button
                                                    onClick={() => removeSubject(blockId)}
                                                    style={{
                                                        position: 'absolute', top: 8, right: 10,
                                                        background: 'none', border: 'none', cursor: 'pointer',
                                                        color: 'rgba(245,240,232,0.35)', fontSize: 12,
                                                    }}
                                                >✕</button>
                                                {isBackSub && (
                                                    <span style={{
                                                        display: 'block', fontSize: 8, fontWeight: 900,
                                                        color: '#e6a23c', fontFamily: 'var(--student-font-mono)',
                                                        letterSpacing: 1.5, marginBottom: 4,
                                                    }}>BACK SUBJECT</span>
                                                )}
                                                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--student-white)', fontFamily: 'var(--student-font-display)', margin: 0 }}>
                                                    {sub.subject_code}
                                                </p>
                                                <p style={{ fontSize: 11, color: 'var(--student-white-dim)', marginTop: 4 }}>
                                                    {sub.subject_title}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {collision && (
                            <div style={{
                                background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.2)',
                                color: '#e74c3c', fontSize: 11, padding: 12, borderRadius: 12,
                                textAlign: 'center', fontFamily: 'var(--student-font-mono)', fontWeight: 700, marginBottom: 16,
                            }}>
                                Schedule Collision Detected! This slot is already occupied.
                            </div>
                        )}

                        {/* Load summary */}
                        {enrolledCount > 0 && (
                            <div style={{
                                display: 'flex', gap: 16, marginBottom: 16,
                                padding: '10px 14px', background: 'rgba(0,0,0,0.25)',
                                borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)',
                            }}>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: 10, color: 'rgba(245,240,232,0.4)', fontFamily: 'var(--student-font-mono)', margin: 0 }}>SUBJECTS</p>
                                    <p style={{ fontSize: 18, fontWeight: 900, color: 'var(--student-gold)', margin: 0 }}>{enrolledCount}</p>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: 10, color: 'rgba(245,240,232,0.4)', fontFamily: 'var(--student-font-mono)', margin: 0 }}>UNITS</p>
                                    <p style={{ fontSize: 18, fontWeight: 900, color: 'var(--student-gold)', margin: 0 }}>{totalUnits}</p>
                                </div>
                                {backCount > 0 && (
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ fontSize: 10, color: 'rgba(230,162,60,0.6)', fontFamily: 'var(--student-font-mono)', margin: 0 }}>BACK SUBJECTS</p>
                                        <p style={{ fontSize: 18, fontWeight: 900, color: '#e6a23c', margin: 0 }}>{backCount}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            disabled={enrolledCount === 0 || isSubmitting}
                            onClick={handleSmartEnrollSubmit}
                            style={{
                                width: '100%', padding: '14px 0', borderRadius: 12,
                                fontWeight: 900, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase',
                                border: 'none', cursor: (enrolledCount === 0 || isSubmitting) ? 'not-allowed' : 'pointer',
                                opacity: (enrolledCount === 0 || isSubmitting) ? 0.3 : 1, transition: 'all 0.2s',
                                background: 'linear-gradient(135deg, var(--student-gold), var(--student-gold-2))',
                                color: 'var(--student-black)',
                                fontFamily: 'var(--student-font-body)',
                            }}
                        >
                            {isSubmitting ? 'Submitting...' : `Complete Enrollment (${enrolledCount} Selected · ${totalUnits} Units)`}
                        </button>
                    </div>
                </>
            ) : (
                <CorUploadTab onSuccess={onSuccess} />
            )}
        </div>
    );
};

export default SmartEnrollmentTab;