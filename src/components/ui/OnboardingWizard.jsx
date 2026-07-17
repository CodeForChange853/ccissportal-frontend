import React, { useState } from 'react';

const OnboardingWizard = ({ steps = [], onComplete, variant = 'portal', userName = '' }) => {
    const [step, setStep] = useState(0);
    const current = steps[step];
    const isLast = step === steps.length - 1;
    const isStudent = variant === 'student';

    if (!steps.length || !current) return null;

    const S = isStudent ? STUDENT_STYLE : PORTAL_STYLE;

    const advance = () => {
        if (isLast) { onComplete(); return; }
        setStep(s => s + 1);
    };

    return (
        <div style={S.backdrop}>
            <div style={S.card} role="dialog" aria-modal="true" aria-label="Onboarding wizard">

                {/* Progress dots */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 28 }}>
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            style={{
                                height: 5,
                                borderRadius: 999,
                                transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1), background 0.2s',
                                width: i === step ? 24 : 6,
                                background: i <= step ? S.accent : S.dotInactive,
                            }}
                        />
                    ))}
                </div>

                {/* Icon */}
                <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 20, lineHeight: 1 }}>
                    {current.icon}
                </div>

                {/* Text */}
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    {current.subtitle && (
                        <p style={{ ...S.subtitle, marginBottom: 6 }}>{current.subtitle}</p>
                    )}
                    <h2 style={S.title}>
                        {current.title.includes('{name}')
                            ? current.title.replace('{name}', userName?.split(' ')[0] || 'there')
                            : current.title}
                    </h2>
                    <p style={S.body}>{current.body}</p>
                </div>

                {/* Highlight badge */}
                {current.highlight && (
                    <div style={{ ...S.highlightBadge, marginBottom: 28 }}>
                        <span style={S.highlightDot} />
                        {current.highlight}
                    </div>
                )}

                {/* Actions */}
                <button onClick={advance} style={S.primaryBtn}>
                    {isLast ? (current.cta || 'Get Started') : 'Next →'}
                </button>

                {!isLast && (
                    <button onClick={onComplete} style={S.skipBtn}>
                        Skip tour
                    </button>
                )}
            </div>
        </div>
    );
};

/* ── Student variant styles (always-dark portal) ── */
const STUDENT_STYLE = {
    accent: 'var(--student-gold)',
    dotInactive: 'rgba(201,168,76,0.18)',
    backdrop: {
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(8,8,8,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
    },
    card: {
        background: 'var(--student-black-2)',
        border: '1px solid rgba(201,168,76,0.18)',
        borderRadius: 24,
        padding: '36px 32px',
        maxWidth: 420,
        width: '100%',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,0.08)',
    },
    title: {
        fontSize: 24, fontWeight: 900, lineHeight: 1.2, margin: '0 0 12px',
        color: 'var(--student-white)',
        fontFamily: 'var(--student-font-display)',
    },
    subtitle: {
        fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
        color: 'var(--student-gold)', fontFamily: 'var(--student-font-mono)', margin: 0,
    },
    body: {
        fontSize: 13, lineHeight: 1.7, margin: 0,
        color: 'var(--student-white-dim)',
        fontFamily: 'var(--student-font-body)',
    },
    highlightBadge: {
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '8px 18px', borderRadius: 999,
        background: 'var(--student-gold-dim)', border: '1px solid rgba(201,168,76,0.25)',
        fontSize: 12, fontWeight: 700, color: 'var(--student-gold)',
        fontFamily: 'var(--student-font-mono)', letterSpacing: '0.05em',
        textTransform: 'uppercase',
    },
    highlightDot: {
        width: 6, height: 6, borderRadius: '50%', background: 'var(--student-gold)', flexShrink: 0,
    },
    primaryBtn: {
        display: 'block', width: '100%', padding: '14px 0', borderRadius: 12,
        background: 'linear-gradient(135deg, var(--student-gold), var(--student-gold-2))',
        color: 'var(--student-black)', border: 'none', cursor: 'pointer',
        fontSize: 13, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase',
        fontFamily: 'var(--student-font-body)', marginBottom: 10,
        transition: 'opacity 0.15s',
    },
    skipBtn: {
        display: 'block', width: '100%', padding: '10px 0', borderRadius: 12,
        background: 'transparent', border: 'none', cursor: 'pointer',
        fontSize: 11, fontWeight: 600, color: 'var(--student-white-faint)',
        fontFamily: 'var(--student-font-body)',
        transition: 'color 0.15s',
    },
};

/* ── Portal variant styles (respects light/dark theme) ── */
const PORTAL_STYLE = {
    accent: 'var(--accent)',
    dotInactive: 'var(--border-strong)',
    backdrop: {
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'var(--bg-overlay)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
    },
    card: {
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--border-radius-xl)',
        padding: '36px 32px',
        maxWidth: 420,
        width: '100%',
        boxShadow: 'var(--shadow-modal)',
    },
    title: {
        fontSize: 22, fontWeight: 700, lineHeight: 1.2, margin: '0 0 10px',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-display)',
    },
    subtitle: {
        fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
        color: 'var(--accent)', fontFamily: 'var(--font-code)', margin: 0,
    },
    body: {
        fontSize: 13, lineHeight: 1.7, margin: 0,
        color: 'var(--text-secondary)',
        fontFamily: 'var(--font-body)',
    },
    highlightBadge: {
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '7px 16px', borderRadius: 999,
        background: 'var(--accent-dim)', border: '1px solid var(--border-accent)',
        fontSize: 11, fontWeight: 600, color: 'var(--accent)',
        fontFamily: 'var(--font-code)', letterSpacing: '0.05em',
        textTransform: 'uppercase',
    },
    highlightDot: {
        width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0,
    },
    primaryBtn: {
        display: 'block', width: '100%', padding: '12px 0', borderRadius: 'var(--border-radius-md)',
        background: 'var(--accent)', color: 'var(--text-on-accent)',
        border: 'none', cursor: 'pointer',
        fontSize: 13, fontWeight: 600,
        fontFamily: 'var(--font-display)', marginBottom: 8,
        transition: 'background 0.15s',
    },
    skipBtn: {
        display: 'block', width: '100%', padding: '8px 0', borderRadius: 'var(--border-radius-md)',
        background: 'transparent', border: 'none', cursor: 'pointer',
        fontSize: 11, fontWeight: 500, color: 'var(--text-muted)',
        fontFamily: 'var(--font-body)',
        transition: 'color 0.15s',
    },
};

export default OnboardingWizard;
