import React, { useState, useMemo } from 'react';
import CorUploadTab from './CorUploadTab';

const CARD = {
    background: 'var(--student-black-3)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 24,
};

const SmartEnrollmentTab = ({ academicStanding, onSuccess }) => {
    const [useSmartEnroll, setUseSmartEnroll] = useState(true);
    const [scheduleBlocks, setScheduleBlocks] = useState({
        blockA: null, blockB: null, blockC: null, blockD: null, blockE: null,
    });
    const [collision, setCollision] = useState(null);

    const recommendedSubjects = useMemo(() => {
        return academicStanding?.next_semester_recommendation?.subject_results?.filter(s => s.status === 'AVAILABLE') ?? [];
    }, [academicStanding]);

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

    const enrolledCount = Object.values(scheduleBlocks).filter(Boolean).length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Mode toggle */}
            <div style={{ display: 'flex', gap: 8, background: 'var(--student-black-3)', padding: 6, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                {[
                    { val: true, label: 'AI Auto-Scheduler' },
                    { val: false, label: 'Manual COR Upload' },
                ].map(({ val, label }) => (
                    <button
                        key={label}
                        onClick={() => setUseSmartEnroll(val)}
                        style={{
                            flex: 1,
                            padding: '10px 0',
                            borderRadius: 12,
                            fontSize: 12,
                            fontWeight: 700,
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontFamily: 'var(--student-font-body)',
                            background: useSmartEnroll === val ? 'var(--student-gold)' : 'transparent',
                            color: useSmartEnroll === val ? 'var(--student-black)' : 'var(--student-white-dim)',
                        }}
                    >{label}</button>
                ))}
            </div>

            {useSmartEnroll ? (
                <>
                    {/* Subjects pool */}
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
                            Our AI has analyzed your curriculum. Drag subjects into the schedule builder slots below.
                        </p>

                        <div style={{
                            display: 'flex', flexWrap: 'wrap', gap: 10, minHeight: 60,
                            padding: 14, background: 'rgba(0,0,0,0.3)', borderRadius: 12,
                            border: '1px solid rgba(255,255,255,0.05)',
                        }}>
                            {recommendedSubjects.length > 0 ? recommendedSubjects.map(sub => {
                                const placed = Object.values(scheduleBlocks).some(b => b?.subject_id === sub.subject_id);
                                if (placed) return null;
                                return (
                                    <div
                                        key={sub.subject_code}
                                        draggable
                                        onDragStart={e => handleDragStart(e, sub)}
                                        style={{
                                            padding: '10px 14px', borderRadius: 12, cursor: 'grab',
                                            background: 'var(--student-gold-dim2)',
                                            border: '1px solid rgba(201,168,76,0.2)',
                                            transition: 'all 0.15s',
                                        }}
                                    >
                                        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--student-gold-2)', margin: 0 }}>{sub.subject_code}</p>
                                        <p style={{ fontSize: 10, color: 'var(--student-gold)', fontFamily: 'var(--student-font-mono)', marginTop: 2 }}>
                                            {sub.credit_units || 3} Units
                                        </p>
                                    </div>
                                );
                            }) : (
                                <p style={{ fontSize: 12, color: 'rgba(245,240,232,0.3)', width: '100%', textAlign: 'center', padding: '12px 0', fontFamily: 'var(--student-font-mono)' }}>
                                    No available subjects based on prerequisites.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Schedule builder */}
                    <div style={CARD}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--student-white)', fontFamily: 'var(--student-font-display)', marginBottom: 20 }}>
                            Conflict-Free Schedule Builder
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
                            {Object.entries(scheduleBlocks).map(([blockId, sub]) => {
                                const isColliding = collision === blockId;
                                return (
                                    <div
                                        key={blockId}
                                        onDrop={e => handleDrop(e, blockId)}
                                        onDragOver={e => e.preventDefault()}
                                        style={{
                                            minHeight: 100, borderRadius: 14, display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                            padding: 14, position: 'relative', transition: 'all 0.2s',
                                            background: isColliding ? 'rgba(192,57,43,0.1)' : sub ? 'var(--student-gold-dim)' : 'rgba(0,0,0,0.2)',
                                            border: isColliding
                                                ? '1px solid rgba(192,57,43,0.5)'
                                                : sub
                                                    ? '1px solid rgba(201,168,76,0.3)'
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
                                                    margin: '0 auto 6px', fontSize: 16,
                                                    color: 'rgba(245,240,232,0.2)',
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
                                ⚠️ Schedule Collision Detected! This slot is already occupied.
                            </div>
                        )}

                        <button
                            disabled={enrolledCount === 0}
                            style={{
                                width: '100%', padding: '14px 0', borderRadius: 12,
                                fontWeight: 900, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase',
                                border: 'none', cursor: enrolledCount === 0 ? 'not-allowed' : 'pointer',
                                opacity: enrolledCount === 0 ? 0.3 : 1, transition: 'all 0.2s',
                                background: 'linear-gradient(135deg, var(--student-gold), var(--student-gold-2))',
                                color: 'var(--student-black)',
                                fontFamily: 'var(--student-font-body)',
                            }}
                        >
                            Complete Enrollment ({enrolledCount} Selected)
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