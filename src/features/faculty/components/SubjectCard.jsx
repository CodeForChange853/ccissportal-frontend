import React from 'react';

const SubjectCard = ({ subject, onClick }) => (
    <div
        onClick={onClick}
        style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 12,
            padding: 18,
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
            boxShadow: 'var(--shadow-card)',
        }}
        onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--border-accent)';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-raised)';
        }}
        onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border-default)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-card)';
        }}
    >
        {/* Gold top accent bar */}
        <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 2,
            background: 'linear-gradient(90deg, var(--accent), var(--accent-light, #e2c27d), transparent)',
        }} />

        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
                <span style={{
                    fontFamily: 'var(--font-code)', fontSize: 11, letterSpacing: 1,
                    color: 'var(--accent)', display: 'block', marginBottom: 4,
                }}>{subject.code}</span>
                <h3 style={{
                    fontFamily: 'var(--font-display, serif)', fontSize: 17, fontWeight: 600,
                    color: 'var(--text-primary)', margin: 0, lineHeight: 1.3,
                }}>{subject.title}</h3>
                {subject.section && (
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                        {subject.section}
                    </p>
                )}
            </div>
            <span style={{
                background: 'var(--accent-dim)', border: '1px solid var(--border-accent)',
                color: 'var(--accent)', fontFamily: 'var(--font-code)', fontSize: 11,
                padding: '3px 8px', borderRadius: 4, flexShrink: 0,
            }}>{subject.units || 3}u</span>
        </div>

        {/* Meta rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
            {subject.schedule && subject.schedule !== 'TBA' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                    <span style={{ fontSize: 13, width: 18, textAlign: 'center' }}>🕐</span>
                    {subject.schedule}
                </div>
            )}
            {subject.room && subject.room !== 'TBA' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                    <span style={{ fontSize: 13, width: 18, textAlign: 'center' }}>📍</span>
                    {subject.room}
                </div>
            )}
            {(subject.enrolled_count != null || subject.students != null) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                    <span style={{ fontSize: 13, width: 18, textAlign: 'center' }}>👥</span>
                    {subject.enrolled_count ?? subject.students} students enrolled
                </div>
            )}
        </div>

        {/* Gradebook CTA */}
        <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>
                Open Gradebook →
            </span>
        </div>

        {/* Triage chip if subject has alert */}
        {subject.has_alert && (
            <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8,
                background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-bd)',
                color: 'var(--color-danger)', fontSize: 10, padding: '2px 8px',
                borderRadius: 20, fontFamily: 'var(--font-code)',
            }}>⚠ Grade Dispute Alert</div>
        )}
    </div>
);

export default SubjectCard;