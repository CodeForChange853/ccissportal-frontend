import React, { useState, useEffect, useRef } from 'react';
import '../../../styles/components/honors-management.css';
import {
    getAdminHonorsList,
    saveDeanNote,
    deleteDeanNote,
    generateAiNote,
} from '../../../api/honorsApi';

// ── Pre-written templates the admin can pick as a starting point
const NOTE_TEMPLATES = [
    {
        label: 'Classic Achievement',
        text: 'Your unwavering commitment to academic excellence is a beacon for every student who walks these halls. Earning {TIER} is not merely a grade — it is a testament to your discipline, your curiosity, and your character. We are immensely proud, and the world awaits everything you will accomplish.',
    },
    {
        label: 'Perseverance',
        text: 'Behind every remarkable GWA is a story of late nights, relentless study, and an unbreakable will to succeed. Your {TIER} distinction reflects not just intelligence, but the kind of tenacity that defines truly great professionals. Go forward knowing that your best days are still ahead of you.',
    },
    {
        label: 'Leadership',
        text: 'Achieving {TIER} while navigating the demands of collegiate life speaks volumes about your character as a future leader. You have set a standard that will inspire generations of students long after you graduate. We could not be more proud to call you one of our own.',
    },
    {
        label: 'Brief & Formal',
        text: 'On behalf of the College, it is my highest honor to recognize your outstanding academic achievement of {TIER}. Your dedication is a source of great pride to this institution and a lasting inspiration to your peers.',
    },
    {
        label: 'Warm & Personal',
        text: 'Words can barely capture how proud we are of what you have achieved. Your {TIER} honor is the result of real sacrifice and genuine love for learning — qualities that will carry you far beyond these walls. Congratulations from the bottom of our hearts.',
    },
];

const TIER_LABELS = {
    SUMMA_CUM_LAUDE: 'Summa Cum Laude',
    MAGNA_CUM_LAUDE: 'Magna Cum Laude',
    CUM_LAUDE:       'Cum Laude',
};

const TIER_COLORS = {
    SUMMA_CUM_LAUDE: '#FFD700',
    MAGNA_CUM_LAUDE: '#C8B560',
    CUM_LAUDE:       '#CD9B5A',
};

// ── Inline CSS


// ── Dean Note Modal
const NoteModal = ({ student, onClose, onSaved }) => {
    const [note, setNote] = useState(student.current_note || '');
    const [generating, setGenerating] = useState(false);
    const [saving, setSaving] = useState(false);
    const textareaRef = useRef(null);

    const applyTemplate = (tpl) => {
        const tierLabel = TIER_LABELS[student.honor_tier] || student.honor_tier;
        const text = tpl.text.replace('{TIER}', tierLabel);
        setNote(text);
        textareaRef.current?.focus();
    };

    const handleGenerateAI = async () => {
        setGenerating(true);
        try {
            const res = await generateAiNote({
                full_name:  student.full_name,
                gwa:        student.gwa,
                honor_tier: student.honor_tier,
                course:     student.course,
            });
            setNote(res.note);
            textareaRef.current?.focus();
        } catch (e) {
            alert('AI generation failed. Please check that GEMINI_API_KEY is configured, or use a template below.');
        } finally {
            setGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!note.trim()) return;
        setSaving(true);
        try {
            await saveDeanNote(student.student_account_id, note.trim());
            onSaved(student.student_account_id, note.trim());
            onClose();
        } catch (e) {
            alert('Failed to save note. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const tierColor = TIER_COLORS[student.honor_tier] || '#BA9731';
    const tierLabel = TIER_LABELS[student.honor_tier] || student.honor_tier;

    return (
        <div className="hm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="hm-modal">
                <div className="hm-modal-top">
                    <div>
                        <div className="hm-modal-title">
                            Dean&apos;s Note for {student.full_name}
                        </div>
                        <div className="hm-modal-sub">
                            <span
                                className="hm-tier-pill"
                                style={{ color: tierColor, borderColor: `${tierColor}40`, background: `${tierColor}12`, display: 'inline-flex', marginRight: 6 }}
                            >
                                <span style={{ width: 5, height: 5, borderRadius: '50%', background: tierColor }}/>
                                {tierLabel}
                            </span>
                            GWA {student.gwa.toFixed(2)} · {student.course}
                        </div>
                    </div>
                    <button className="hm-modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="hm-modal-body">
                    {/* AI Generation */}
                    <div className="hm-ai-section">
                        <div className="hm-ai-label">
                            ✦ AI-Assisted Note Generation
                        </div>
                        <button
                            className="hm-ai-btn"
                            onClick={handleGenerateAI}
                            disabled={generating}
                        >
                            {generating ? (
                                <><div className="hm-ai-spinner"/> Generating with Gemini AI...</>
                            ) : (
                                <> ✦ Generate Personalized Note</>
                            )}
                        </button>
                        <div style={{ fontSize: '.68rem', color: '#8A7040', marginTop: '.5rem' }}>
                            Gemini writes a personalized 2–3 sentence note based on honor tier, GWA, and program.
                            You can edit it after generation.
                        </div>
                    </div>

                    {/* Templates */}
                    <div className="hm-templates">
                        <div className="hm-tpl-label">Quick Templates</div>
                        <div className="hm-tpl-grid">
                            {NOTE_TEMPLATES.map((tpl, i) => (
                                <button
                                    key={i}
                                    className="hm-tpl-btn"
                                    onClick={() => applyTemplate(tpl)}
                                >
                                    {tpl.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Textarea */}
                    <div style={{ marginBottom: '0' }}>
                        <div className="hm-textarea-label">
                            <span>Note Message</span>
                            <span className="hm-textarea-char">{note.length} chars</span>
                        </div>
                        <textarea
                            ref={textareaRef}
                            className="hm-textarea"
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            placeholder="Write a personalized note for this student, or use AI generation / a template above..."
                            maxLength={800}
                        />
                    </div>
                </div>

                <div className="hm-modal-footer">
                    <button className="hm-footer-cancel" onClick={onClose}>Cancel</button>
                    <button
                        className="hm-footer-save"
                        onClick={handleSave}
                        disabled={saving || !note.trim()}
                    >
                        {saving ? 'Saving…' : '✓ Publish Note'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Main page
const HonorsManagement = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [editingStudent, setEditingStudent] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (msg, ok = true) => {
        setToast({ msg, ok });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        getAdminHonorsList()
            .then(setStudents)
            .catch(() => showToast('Failed to load honors list.', false))
            .finally(() => setLoading(false));
    }, []);

    const handleNoteSaved = (studentId, message) => {
        setStudents(prev => prev.map(s =>
            s.student_account_id === studentId
                ? { ...s, has_note: true, current_note: message }
                : s
        ));
        showToast("Dean's note published successfully.");
    };

    const handleDeleteNote = async (student) => {
        if (!window.confirm(`Remove Dean's note for ${student.full_name}?`)) return;
        try {
            await deleteDeanNote(student.student_account_id);
            setStudents(prev => prev.map(s =>
                s.student_account_id === student.student_account_id
                    ? { ...s, has_note: false, current_note: null }
                    : s
            ));
            showToast('Note removed.');
        } catch {
            showToast('Failed to delete note.', false);
        }
    };

    const filtered = students.filter(s =>
        s.full_name.toLowerCase().includes(search.toLowerCase()) ||
        s.course.toLowerCase().includes(search.toLowerCase()) ||
        TIER_LABELS[s.honor_tier]?.toLowerCase().includes(search.toLowerCase())
    );

    const summaCount    = students.filter(s => s.honor_tier === 'SUMMA_CUM_LAUDE').length;
    const magnaCount    = students.filter(s => s.honor_tier === 'MAGNA_CUM_LAUDE').length;
    const cumLaudeCount = students.filter(s => s.honor_tier === 'CUM_LAUDE').length;
    const withNotes     = students.filter(s => s.has_note).length;

    return (
        <>
            <div className="hm-wrap">
                {/* Header */}
                <div className="hm-header">
                    <div className="hm-title">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ color: '#BA9731' }}>
                            <path d="M2 17H18M2 13L6 4L10 9L14 2L18 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                            <rect x="2" y="14.5" width="16" height="2.5" rx="1.25" fill="currentColor" opacity="0.8"/>
                        </svg>
                        Latin Honors Management
                    </div>
                    <div className="hm-sub">
                        Manage Dean&apos;s notes for 4th-year honors awardees. Notes appear on the public Wall of Excellence.
                    </div>
                </div>

                {/* Stats */}
                <div className="hm-stats">
                    {[
                        { val: summaCount,    lbl: 'Summa Cum Laude',  color: '#FFD700' },
                        { val: magnaCount,    lbl: 'Magna Cum Laude',  color: '#C8B560' },
                        { val: cumLaudeCount, lbl: 'Cum Laude',        color: '#CD9B5A' },
                        { val: withNotes,     lbl: 'Notes Published',  color: '#BA9731' },
                    ].map(({ val, lbl, color }) => (
                        <div className="hm-stat" key={lbl}>
                            <div className="hm-stat-val" style={{ color }}>{val}</div>
                            <div className="hm-stat-lbl">{lbl}</div>
                        </div>
                    ))}
                </div>

                {/* Table */}
                <div className="hm-table-wrap">
                    <div className="hm-table-header">
                        <div className="hm-table-title">Awardees · 4th Year</div>
                        <input
                            className="hm-search"
                            placeholder="Search by name, course, or tier…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    {loading ? (
                        <div className="hm-empty">Loading honors list…</div>
                    ) : filtered.length === 0 ? (
                        <div className="hm-empty">
                            {search ? `No results for "${search}"` : 'No 4th-year honors awardees found. Grades must be marked COMPLETED with a qualifying GWA.'}
                        </div>
                    ) : (
                        <>
                            <div className="hm-row-head">
                                <div className="hm-col-label">Student</div>
                                <div className="hm-col-label">Course</div>
                                <div className="hm-col-label">GWA</div>
                                <div className="hm-col-label">Tier</div>
                                <div className="hm-col-label">Dean&apos;s Note</div>
                                <div className="hm-col-label">Actions</div>
                            </div>
                            {filtered.map(student => {
                                const tierColor = TIER_COLORS[student.honor_tier] || '#BA9731';
                                const tierLabel = TIER_LABELS[student.honor_tier] || student.honor_tier;
                                return (
                                    <div
                                        key={student.student_account_id}
                                        className="hm-row"
                                        style={{ animation: 'hm-fade .3s ease both' }}
                                    >
                                        <div>
                                            <div className="hm-name">{student.full_name}</div>
                                            <div className="hm-course">Year {student.year_level}</div>
                                        </div>
                                        <div style={{ fontSize: '.75rem', color: 'var(--text-secondary,#3A3A3A)' }}>
                                            {student.course}
                                        </div>
                                        <div
                                            className="hm-gwa"
                                            style={{ color: tierColor }}
                                        >
                                            {student.gwa.toFixed(2)}
                                        </div>
                                        <div>
                                            <span
                                                className="hm-tier-pill"
                                                style={{
                                                    color: tierColor,
                                                    borderColor: `${tierColor}40`,
                                                    background: `${tierColor}10`,
                                                }}
                                            >
                                                <span style={{ width: 5, height: 5, borderRadius: '50%', background: tierColor }}/>
                                                {tierLabel}
                                            </span>
                                        </div>
                                        <div className="hm-note-cell">
                                            {student.has_note ? (
                                                <div className="hm-note-preview">&quot;{student.current_note}&quot;</div>
                                            ) : (
                                                <div className="hm-no-note">No note yet</div>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', paddingTop: '2px' }}>
                                            <button
                                                className="hm-btn-edit"
                                                onClick={() => setEditingStudent(student)}
                                            >
                                                {student.has_note ? '✎ Edit Note' : '+ Write Note'}
                                            </button>
                                            {student.has_note && (
                                                <button
                                                    className="hm-btn-del"
                                                    onClick={() => handleDeleteNote(student)}
                                                    title="Remove note"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>

                {/* Note modal */}
                {editingStudent && (
                    <NoteModal
                        student={editingStudent}
                        onClose={() => setEditingStudent(null)}
                        onSaved={handleNoteSaved}
                    />
                )}

                {/* Toast */}
                {toast && (
                    <div
                        className="hm-toast"
                        style={{
                            background: toast.ok ? '#16a34a' : '#dc2626',
                            color: '#fff',
                        }}
                    >
                        {toast.msg}
                    </div>
                )}
            </div>
        </>
    );
};

export default HonorsManagement;
