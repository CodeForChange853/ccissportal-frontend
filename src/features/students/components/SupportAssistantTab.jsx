import React, { useState, useEffect } from 'react';
import { studentApi } from '../api/studentApi';
import client from '../../../api/client';

const STATUS_CFG = {
    OPEN: { label: 'Open', color: 'var(--student-gold)', bg: 'var(--student-gold-dim)', border: 'rgba(201,168,76,0.3)' },
    TRIAGED: { label: 'Triaged', color: '#60a5fa', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)' },
    TRIASED: { label: 'Triaged', color: '#60a5fa', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)' },
    RESOLVED: { label: 'Resolved', color: 'var(--student-green)', bg: 'rgba(39,174,96,0.1)', border: 'rgba(39,174,96,0.3)' },
};

const CATEGORY_ICON = { Registrar: '📋', Cashier: '💳', 'IT Support': '💻' };

const inputStyle = {
    width: '100%',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: '14px 18px',
    fontSize: 14,
    color: 'var(--student-white)',
    fontFamily: 'var(--student-font-body)',
    outline: 'none',
    boxSizing: 'border-box',
};

const CARD = {
    background: 'var(--student-black-3)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: 16,
};

const SupportAssistantTab = () => {
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [fetching, setFetching] = useState(true);

    const fetchTickets = async () => {
        setFetching(true);
        try {
            const res = await client.getMyTickets();
            setTickets(res.data || []);
        } catch (err) {
            console.error('Failed to load tickets', err);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => { fetchTickets(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!subject.trim() || !description.trim()) return;
        setSubmitting(true);
        setError(null);
        try {
            await studentApi.submitSupportTicket({ issue_subject: subject, issue_description: description });
            setSuccess(true);
            setSubject('');
            setDescription('');
            fetchTickets();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to submit. Please try again later.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

            {/* Form / Success */}
            {success ? (
                <div style={{ ...CARD, padding: 40, textAlign: 'center', maxWidth: 640, margin: '0 auto', width: '100%' }}>
                    <div style={{ fontSize: 48, marginBottom: 20 }}>✨</div>
                    <h3 style={{ fontSize: 22, fontWeight: 900, color: 'var(--student-green)', fontFamily: 'var(--student-font-display)', marginBottom: 12 }}>
                        Ticket Successfully Routed
                    </h3>
                    <p style={{ fontSize: 13, color: 'var(--student-white-dim)', marginBottom: 28, lineHeight: 1.7, maxWidth: 360, margin: '0 auto 28px' }}>
                        Our AI system has analyzed your request and routed it to the appropriate department. You will receive an update in this portal.
                    </p>
                    <button
                        onClick={() => setSuccess(false)}
                        style={{
                            padding: '12px 32px', borderRadius: 12,
                            background: 'var(--student-black-4)',
                            border: '1px solid rgba(201,168,76,0.2)',
                            color: 'var(--student-gold)',
                            fontSize: 13, fontWeight: 700, cursor: 'pointer',
                            fontFamily: 'var(--student-font-body)',
                        }}
                    >Submit Another Request</button>
                </div>
            ) : (
                <div style={{ ...CARD, padding: 28, maxWidth: 640, margin: '0 auto', width: '100%', position: 'relative', overflow: 'hidden', boxSizing: 'border-box' }}>
                    {/* Gold top bar */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--student-gold)' }} />

                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 28 }}>
                        <div style={{
                            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                            background: 'var(--student-gold-dim)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', fontSize: 26,
                        }}>🤖</div>
                        <div>
                            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--student-white)', fontFamily: 'var(--student-font-display)', marginBottom: 4 }}>
                                NexEnroll Support Concierge
                            </h2>
                            <p style={{ fontSize: 12, color: 'var(--student-white-dim)', lineHeight: 1.6, fontStyle: 'italic' }}>
                                Powered by NLP analysis. Describe your issue and our system will determine urgency and routing.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div style={{
                            background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.2)',
                            color: '#e74c3c', fontSize: 12, padding: 12, borderRadius: 10,
                            marginBottom: 20, fontFamily: 'var(--student-font-mono)', fontWeight: 700,
                        }}>⚠️ {error}</div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        <div>
                            <label style={{
                                display: 'block', fontSize: 10, fontWeight: 700,
                                color: 'var(--student-gold)', textTransform: 'uppercase',
                                letterSpacing: 3, marginBottom: 8, fontFamily: 'var(--student-font-mono)',
                            }}>Issue Subject</label>
                            <input
                                type="text"
                                required
                                maxLength={150}
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                                placeholder="e.g. Discrepancy in semestral billing statement"
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label style={{
                                display: 'block', fontSize: 10, fontWeight: 700,
                                color: 'var(--student-gold)', textTransform: 'uppercase',
                                letterSpacing: 3, marginBottom: 8, fontFamily: 'var(--student-font-mono)',
                            }}>Request Details</label>
                            <textarea
                                required
                                maxLength={300}
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Describe the situation in detail..."
                                style={{ ...inputStyle, minHeight: 120, resize: 'none', lineHeight: 1.6 }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || !subject.trim() || !description.trim()}
                            style={{
                                width: '100%', padding: '14px 0', borderRadius: 12,
                                border: 'none', cursor: submitting || !subject.trim() || !description.trim() ? 'not-allowed' : 'pointer',
                                opacity: submitting || !subject.trim() || !description.trim() ? 0.35 : 1,
                                background: 'var(--student-gold)',
                                color: 'var(--student-black)',
                                fontSize: 13, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase',
                                fontFamily: 'var(--student-font-body)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                transition: 'opacity 0.2s',
                            }}
                        >
                            {submitting ? (
                                <>
                                    <div style={{
                                        width: 14, height: 14, border: '2px solid rgba(0,0,0,0.2)',
                                        borderTop: '2px solid black', borderRadius: '50%',
                                        animation: 'spin 0.6s linear infinite',
                                    }} />
                                    Analyzing Intent...
                                </>
                            ) : 'Submit Request via AI'}
                        </button>
                    </form>
                </div>
            )}

            {/* Ticket history */}
            <div style={{ maxWidth: 640, margin: '0 auto', width: '100%', paddingBottom: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <span style={{
                        fontSize: 10, fontWeight: 900, color: 'rgba(245,240,232,0.3)',
                        textTransform: 'uppercase', letterSpacing: 4, fontFamily: 'var(--student-font-mono)',
                        whiteSpace: 'nowrap',
                    }}>Submission History</span>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
                </div>

                {fetching ? (
                    <div style={{ textAlign: 'center', padding: '48px 0' }}>
                        <div style={{
                            width: 36, height: 36, border: '3px solid rgba(201,168,76,0.2)',
                            borderTop: '3px solid var(--student-gold)', borderRadius: '50%',
                            animation: 'spin 0.7s linear infinite', margin: '0 auto 14px',
                        }} />
                        <p style={{ fontSize: 12, color: 'var(--student-white-dim)', fontFamily: 'var(--student-font-mono)' }}>
                            Synchronizing tickets…
                        </p>
                    </div>
                ) : tickets.length === 0 ? (
                    <div style={{ ...CARD, padding: 48, textAlign: 'center' }}>
                        <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>🥂</div>
                        <p style={{ fontSize: 14, color: 'rgba(245,240,232,0.35)', fontWeight: 700 }}>
                            No active support requests.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {tickets.map(t => {
                            const sc = STATUS_CFG[t.status] ?? { label: t.status, color: '#94a3b8', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' };
                            return (
                                <div
                                    key={t.id}
                                    style={{ ...CARD, padding: 20, transition: 'border-color 0.2s' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                                        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--student-white)', lineHeight: 1.5, flex: 1 }}>
                                            {t.description}
                                        </p>
                                        <span style={{
                                            flexShrink: 0, padding: '3px 10px', borderRadius: 20,
                                            fontSize: 9, fontWeight: 900, letterSpacing: 1.5, textTransform: 'uppercase',
                                            color: sc.color, background: sc.bg, border: `1px solid ${sc.border}`,
                                            fontFamily: 'var(--student-font-mono)',
                                        }}>{sc.label}</span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: t.ai_response ? 12 : 0 }}>
                                        <span style={{ fontSize: 10, color: 'rgba(245,240,232,0.35)', fontFamily: 'var(--student-font-mono)', fontWeight: 700 }}>
                                            REF: {t.id}
                                        </span>
                                        {t.category && (
                                            <span style={{
                                                fontSize: 10, color: 'rgba(201,168,76,0.6)',
                                                background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(201,168,76,0.1)',
                                                padding: '2px 8px', borderRadius: 6, fontFamily: 'var(--student-font-mono)',
                                            }}>
                                                {CATEGORY_ICON[t.category] ?? '📁'} {t.category.toUpperCase()}
                                            </span>
                                        )}
                                        {t.confidence_score != null && (
                                            <span style={{ fontSize: 10, color: 'rgba(245,240,232,0.3)', fontFamily: 'var(--student-font-mono)', fontStyle: 'italic' }}>
                                                AI MATCH: {Math.round(t.confidence_score * 100)}%
                                            </span>
                                        )}
                                    </div>

                                    {t.ai_response && (
                                        <div style={{
                                            background: 'var(--student-gold-dim2)',
                                            border: '1px solid rgba(201,168,76,0.1)',
                                            borderRadius: 10, padding: 14,
                                            position: 'relative', overflow: 'hidden',
                                        }}>
                                            <div style={{ position: 'absolute', top: 0, left: 14, width: 32, height: 2, background: 'var(--student-gold)' }} />
                                            <p style={{
                                                fontSize: 9, fontWeight: 900, color: 'var(--student-gold)',
                                                textTransform: 'uppercase', letterSpacing: 2,
                                                fontFamily: 'var(--student-font-mono)', marginBottom: 6,
                                            }}>🤖 System Response / Action Taken</p>
                                            <p style={{ fontSize: 12, color: 'var(--student-white-dim)', lineHeight: 1.6 }}>
                                                {t.ai_response}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default SupportAssistantTab;