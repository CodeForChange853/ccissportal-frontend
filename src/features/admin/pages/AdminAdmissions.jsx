// frontend/src/features/admin/pages/AdminAdmissions.jsx
// Direct Admission — full-width two-column layout.
// Left: student info + credentials form. Right: what this does + quick reference.

import React, { useState } from 'react';
import { adminApi } from '../api/adminApi';
import CyberPanel from '../../../components/ui/CyberPanel';
import StatusBadge from '../../../components/ui/StatusBadge';
import PageHeader from '../../../components/ui/PageHeader';
import { useToast } from '../../../context/ToastContext';

const EMPTY = { full_name: '', student_number: '', course: 'BSCS', year_level: 1, email: '', password: '' };

const inp = {
    width: '100%', background: 'var(--bg-input)',
    border: '1px solid var(--border-default)', borderRadius: 6,
    padding: '9px 12px', fontFamily: 'var(--font-terminal)',
    fontSize: '0.78rem', color: 'var(--text-primary)', outline: 'none',
};
const lbl = {
    fontFamily: 'var(--font-terminal)', fontSize: '0.55rem',
    letterSpacing: '0.16em', textTransform: 'uppercase',
    color: 'var(--text-muted)', display: 'block', marginBottom: 5,
};

const COURSES = [
    { value: 'BSCS', label: 'BSCS — Bachelor of Science in Computer Science' },
    { value: 'BSIT', label: 'BSIT — Bachelor of Science in Information Technology' },
    { value: 'BSIS', label: 'BSIS — Bachelor of Science in Information Systems' },
];

const AdminAdmissions = () => {
    const [form, setForm] = useState(EMPTY);
    const [submitting, setSubmitting] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const [admitted, setAdmitted] = useState([]);

    // ✅ Use shared ToastContext — removed stale local useState toast
    const { toast } = useToast();

    const f = (key) => ({
        value: form[key],
        onChange: e => setForm(p => ({ ...p, [key]: e.target.value })),
        style: inp,
        onFocus: e => { e.target.style.borderColor = 'var(--border-focus)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,245,255,0.08)'; },
        onBlur: e => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'none'; },
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await adminApi.createStudentDirect(form);
            toast.success(`${form.full_name || form.email} admitted and account created.`);
            setAdmitted(prev => [{ ...form, ts: new Date().toLocaleTimeString() }, ...prev.slice(0, 4)]);
            setForm(EMPTY);
        } catch (err) {
            toast.error('Admission failed: ' + (err.response?.data?.detail ?? 'Unknown error'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* ✅ Shared PageHeader replaces copy-pasted h1 block */}
            <PageHeader
                title="Direct Admission"
                subtitle="Manual enrollment bypass — provisions a student account without the registration wizard."
                badge={<StatusBadge variant="warning" label="ADMIN OVERRIDE" showDot={false} />}
            />

            {/* Two-column layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, alignItems: 'start' }}>

                {/* LEFT — Admission form */}
                <CyberPanel title="Student Details" subtitle="All fields required unless noted">
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <label style={lbl}>Full Name</label>
                                <input required placeholder="Juan Dela Cruz" aria-label="Student full name" {...f('full_name')} />
                            </div>
                            <div>
                                <label style={lbl}>Student Number</label>
                                <input required placeholder="2024-00001" aria-label="Student number" {...f('student_number')} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                            <div>
                                <label style={lbl}>Program</label>
                                <select required {...f('course')} style={inp}>
                                    {COURSES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={lbl}>Year Level</label>
                                <select required value={form.year_level} onChange={e => setForm(p => ({ ...p, year_level: parseInt(e.target.value) }))} style={inp}>
                                    {[1, 2, 3, 4].map(y => <option key={y} value={y}>{y}{['st', 'nd', 'rd', 'th'][y - 1]} Year</option>)}
                                </select>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
                            <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.58rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent-light)', marginBottom: 14 }}>
                                System Credentials
                            </p>
                        </div>

                        <div>
                            <label style={lbl}>University Email</label>
                            <input required type="email" placeholder="student@university.edu" aria-label="University email address" {...f('email')} />
                        </div>

                        <div>
                            <label style={lbl}>Temporary Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    required
                                    type={showPw ? 'text' : 'password'}
                                    placeholder="Min. 8 characters"
                                    aria-label="Temporary password"
                                    {...f('password')}
                                    style={{ ...inp, paddingRight: 72 }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(v => !v)}
                                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-terminal)', fontSize: '0.62rem', letterSpacing: '0.02em' }}
                                >
                                    {showPw ? 'HIDE' : 'SHOW'}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={submitting}
                            style={{ marginTop: 4, padding: '12px', fontSize: '0.70rem', letterSpacing: '0.16em' }}
                        >
                            {submitting ? 'DEPLOYING ACCOUNT...' : '⬆ DEPLOY STUDENT ACCOUNT'}
                        </button>
                    </form>
                </CyberPanel>

                {/* RIGHT — Info + session log */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                    <CyberPanel title="About Direct Admission" variant="warning">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {[
                                { icon: '⚡', text: 'Bypasses the student self-registration wizard entirely.' },
                                { icon: '🔑', text: 'No passkey required — admin authority only.' },
                                { icon: '📋', text: 'Creates the user account and student profile in one action.' },
                                { icon: '⚠', text: 'Student must change their temporary password on first login.' },
                                { icon: '📩', text: 'Notify the student of their credentials via official channels.' },
                            ].map(({ icon, text }) => (
                                <div key={text} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                    <span style={{ fontSize: '0.80rem', flexShrink: 0, marginTop: 1 }}>{icon}</span>
                                    <p style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.68rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{text}</p>
                                </div>
                            ))}
                        </div>
                    </CyberPanel>

                    <CyberPanel
                        title="This Session"
                        subtitle={admitted.length === 0 ? 'No admissions yet' : `${admitted.length} student${admitted.length !== 1 ? 's' : ''} admitted`}
                    >
                        {admitted.length === 0 ? (
                            <p style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.65rem', color: 'var(--text-muted)', padding: '10px 0', textAlign: 'center', letterSpacing: '0.02em' }}>
                                NONE YET
                            </p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {admitted.map((a, i) => (
                                    <div key={i} style={{ background: 'var(--bg-depth)', border: '1px solid var(--border-subtle)', borderLeft: '2px solid var(--color-success)', borderRadius: 6, padding: '10px 12px' }}>
                                        <p style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.72rem', color: 'var(--text-primary)', fontWeight: 600 }}>{a.full_name || a.email}</p>
                                        <p style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.60rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                            {a.course} · Year {a.year_level} · {a.ts}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CyberPanel>
                </div>
            </div>
        </div>
    );
};

export default AdminAdmissions;