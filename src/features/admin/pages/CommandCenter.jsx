// frontend/src/features/admin/pages/CommandCenter.jsx
//
// Command Center — Unified admin console.
//
// Three sections consolidated into tabs:
//   1. SYSTEM CONTROLS — enrollment gate, teaching load cap, passkey rotation
//   2. USER REGISTRY   — account provisioning, role management, suspension
//   3. FACULTY LOAD    — load balancer, heatmap, bulk subject assignments
//
// Previously ManageFaculty and ManageUsers were separate routes (/portal/admin/users
// and /portal/admin/faculty). They are now embedded here as tab content to reduce
// navigation bloat and centralize admin management actions.

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { adminApi } from '../api/adminApi';
import CyberPanel from '../../../components/ui/CyberPanel';
import StatusBadge from '../../../components/ui/StatusBadge';
import Skeleton from '../../../components/ui/Skeleton';
import { useToast } from '../../../context/ToastContext';
import ManageFaculty from './ManageFaculty';
import ManageUsers from './ManageUsers';

// ── Section tabs ──────────────────────────────────────────────────────────────
const SECTIONS = [
    { id: 'controls', label: 'SYSTEM CONTROLS' },
    { id: 'users', label: 'USER REGISTRY' },
    { id: 'faculty', label: 'FACULTY LOAD' },
];

// ── SectionTabBar ─────────────────────────────────────────────────────────────
const SectionTabBar = ({ active, onChange }) => (
    <div style={{
        display: 'flex', gap: 0,
        borderBottom: '2px solid var(--border-subtle)',
    }}>
        {SECTIONS.map(s => {
            const isActive = active === s.id;
            return (
                <button
                    key={s.id}
                    onClick={() => onChange(s.id)}
                    aria-current={isActive ? 'page' : undefined}
                    style={{
                        padding: '10px 22px',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: isActive
                            ? '2px solid var(--accent)'
                            : '2px solid transparent',
                        marginBottom: -2,
                        fontFamily: 'var(--font-terminal)',
                        fontSize: '0.62rem',
                        fontWeight: isActive ? 700 : 500,
                        letterSpacing: '0.14em',
                        color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        textTransform: 'uppercase',
                    }}
                >
                    {s.label}
                </button>
            );
        })}
    </div>
);

// ── Diff row ──────────────────────────────────────────────────────────────────
const DiffRow = ({ label, from, to, changed }) => (
    <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto auto',
        alignItems: 'center',
        gap: 10,
        padding: '12px 0',
        borderBottom: '1px solid var(--border-subtle)',
    }}>
        <div>
            <p style={{
                fontFamily: "var(--font-terminal)",
                fontSize: '0.54rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginBottom: 4,
            }}>
                {label}
            </p>
            <p style={{
                fontFamily: "var(--font-terminal)",
                fontSize: '0.70rem',
                color: changed ? 'var(--text-muted)' : 'var(--neon-green)',
                textDecoration: changed ? 'line-through' : 'none',
            }}>
                {String(from)}
            </p>
        </div>
        {changed ? (
            <>
                <span style={{ fontFamily: "var(--font-terminal)", fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    →
                </span>
                <p style={{ fontFamily: "var(--font-terminal)", fontSize: '0.75rem', fontWeight: 700, color: 'var(--neon-orange)' }}>
                    {String(to)}
                </p>
            </>
        ) : (
            <span style={{
                fontFamily: "var(--font-terminal)",
                fontSize: '0.55rem',
                color: 'var(--neon-green)',
                letterSpacing: '0.10em',
                gridColumn: 'span 2',
                textAlign: 'right',
            }}>
                NO CHANGE
            </span>
        )}
    </div>
);

// ── Toggle ────────────────────────────────────────────────────────────────────
const Toggle = ({ value, onChange, disabled }) => (
    <button
        onClick={() => !disabled && onChange(!value)}
        disabled={disabled}
        aria-pressed={value}
        style={{
            width: 52, height: 28, borderRadius: 14,
            background: value ? 'var(--neon-cyan)' : 'var(--bg-depth)',
            border: `1px solid ${value ? 'var(--neon-cyan)' : 'var(--border-default)'}`,
            position: 'relative', cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s', flexShrink: 0, outline: 'none',
        }}
    >
        <span style={{
            position: 'absolute', top: 3, left: value ? 26 : 3,
            width: 20, height: 20, borderRadius: '50%',
            background: value ? 'var(--bg-base)' : 'var(--text-muted)',
            transition: 'left 0.2s',
        }} />
    </button>
);

// ── Field label ───────────────────────────────────────────────────────────────
const FieldLabel = ({ children }) => (
    <p style={{
        fontFamily: "var(--font-terminal)", fontSize: '0.54rem',
        letterSpacing: '0.14em', textTransform: 'uppercase',
        color: 'var(--text-muted)', marginBottom: 6,
    }}>
        {children}
    </p>
);

// ── Number input ──────────────────────────────────────────────────────────────
const NumberInput = ({ value, onChange, min, max, disabled, ariaLabel }) => (
    <input
        type="number" min={min} max={max} aria-label={ariaLabel}
        value={value ?? ''} onChange={e => onChange(parseInt(e.target.value, 10))}
        disabled={disabled}
        style={{
            width: 72, background: 'var(--bg-input)',
            border: '1px solid var(--border-default)', borderLeft: '3px solid var(--neon-cyan)',
            borderRadius: 6, padding: '8px 10px',
            fontFamily: "var(--font-display)", fontSize: '1rem', fontWeight: 700,
            color: 'var(--neon-cyan)', textAlign: 'center', outline: 'none',
        }}
        onFocus={e => { e.target.style.borderColor = 'var(--border-focus)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,245,255,0.08)'; }}
        onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'none'; }}
    />
);

// ── Main ──────────────────────────────────────────────────────────────────────
const CommandCenter = () => {
    // Section routing — supports deep-links from Navigate state (old /users, /faculty URLs)
    const location = useLocation();
    const [activeSection, setActiveSection] = useState(
        location.state?.section || 'controls'
    );

    const [settings, setSettings] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isRotating, setIsRotating] = useState(false);
    const [passkeyVisible, setPasskeyVisible] = useState(false);
    const [pendingLoad, setPendingLoad] = useState(null);
    const [pendingEnroll, setPendingEnroll] = useState(null);

    const { toast } = useToast();
    const flash = (text, type = 'success') => {
        if (type === 'error') toast.error(text);
        else if (type === 'info') toast.warn(text);
        else toast.success(text);
    };

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            try {
                const [s] = await Promise.allSettled([
                    adminApi.fetchSystemSettings(),
                ]);
                if (s.status === 'fulfilled') {
                    setSettings(s.value);
                    setPendingLoad(s.value.global_max_teaching_load);
                    setPendingEnroll(s.value.is_enrollment_open);
                } else {
                    setLoadError(s.reason?.response?.data?.detail || 'Failed to load settings.');
                }
            } finally { setIsLoading(false); }
        })();
    }, []);

    const handleDeploy = async () => {
        if (!settings) return;
        setIsSaving(true);
        try {
            const payload = {};
            if (pendingEnroll !== settings.is_enrollment_open)
                payload.is_enrollment_open = pendingEnroll;
            if (pendingLoad !== settings.global_max_teaching_load)
                payload.global_max_teaching_load = pendingLoad;
            if (!Object.keys(payload).length) { flash('No changes to deploy.', 'info'); return; }
            const updated = await adminApi.updateSystemSettings(payload);
            setSettings(updated);
            flash('Settings deployed successfully.');
        } catch (err) {
            flash(err.response?.data?.detail || 'Deploy failed.', 'error');
        } finally { setIsSaving(false); }
    };

    const handleRotateKey = async () => {
        setIsRotating(true);
        try {
            const updated = await adminApi.rotatePasskey();
            setSettings(updated);
            setPasskeyVisible(true);
            flash('Passkey rotated — new key is now active.');
        } catch (err) {
            flash(err.response?.data?.detail || 'Rotation failed.', 'error');
        } finally { setIsRotating(false); }
    };

    const copyPasskey = async () => {
        try {
            await navigator.clipboard.writeText(settings?.student_registration_passkey ?? '');
            toast.success('Passkey copied to clipboard.');
        } catch { toast.warn('Copy failed — please select manually.'); }
    };

    const enrollChanged = pendingEnroll !== settings?.is_enrollment_open;
    const loadChanged = pendingLoad !== settings?.global_max_teaching_load;
    const hasChanges = enrollChanged || loadChanged;
    const changeCount = [enrollChanged, loadChanged].filter(Boolean).length;

    // ── Controls section content ──────────────────────────────────────────
    const renderControlsSection = () => {
        if (isLoading) return (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
                <Skeleton.Card /><Skeleton.Card />
            </div>
        );

        if (loadError) return (
            <div style={{ padding: 20, fontFamily: "var(--font-terminal)", fontSize: '0.75rem', color: 'var(--neon-red)', background: 'var(--color-danger-bg)', border: '1px solid var(--border-critical)', borderRadius: 8 }}>
                ⚠ {loadError}
            </div>
        );

        return (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, alignItems: 'start' }}>

                {/* LEFT — Pre-deploy diff */}
                <CyberPanel
                    title="Pre-Deploy Diff"
                    subtitle="Review before applying"
                    variant={hasChanges ? 'warning' : 'default'}
                    headerRight={<StatusBadge variant={hasChanges ? 'warning' : 'normal'} label={hasChanges ? `${changeCount} CHANGE${changeCount > 1 ? 'S' : ''}` : 'SYNCED'} />}
                >
                    {!hasChanges ? (
                        <p style={{ fontFamily: "var(--font-terminal)", fontSize: '0.68rem', color: 'var(--neon-green)', letterSpacing: '0.10em', padding: '20px 0', textAlign: 'center' }}>
                            ✓ ALL SETTINGS ARE CURRENT
                        </p>
                    ) : (
                        <>
                            <DiffRow
                                label="Enrollment Portal"
                                from={settings?.is_enrollment_open ? 'OPEN' : 'CLOSED'}
                                to={pendingEnroll ? 'OPEN' : 'CLOSED'}
                                changed={enrollChanged}
                            />
                            <DiffRow
                                label="Max Teaching Load"
                                from={`${settings?.global_max_teaching_load} classes`}
                                to={`${pendingLoad} classes`}
                                changed={loadChanged}
                            />
                            <p style={{ fontFamily: "var(--font-terminal)", fontSize: '0.57rem', color: 'var(--text-muted)', marginTop: 14, lineHeight: 1.7, letterSpacing: '0.04em' }}>
                                Changes apply system-wide immediately on deploy. Students and faculty are affected in real time.
                            </p>
                        </>
                    )}
                </CyberPanel>

                {/* RIGHT — Unified system controls */}
                <CyberPanel
                    title="System Controls"
                    subtitle="Enrollment gate · teaching load cap · registration passkey"
                    variant={hasChanges ? 'warning' : 'default'}
                    headerRight={hasChanges
                        ? <StatusBadge variant="warning" label="UNSAVED CHANGES" showDot />
                        : <StatusBadge variant="normal" label="SYNCED" />
                    }
                >
                    {/* 3-column controls grid with dividers */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        borderTop: '1px solid var(--border-subtle)',
                        borderLeft: '1px solid var(--border-subtle)',
                        borderRadius: 6,
                        overflow: 'hidden',
                        marginBottom: 16,
                    }}>
                        {/* Enrollment gate */}
                        <div style={{ padding: 16, borderRight: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-depth)' }}>
                            <FieldLabel>Enrollment portal</FieldLabel>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                                <p style={{
                                    fontFamily: "var(--font-terminal)", fontSize: '0.75rem', fontWeight: 600,
                                    color: pendingEnroll ? 'var(--neon-green)' : 'var(--neon-red)',
                                    transition: 'color 0.3s',
                                }}>
                                    {pendingEnroll ? 'PORTAL OPEN' : 'PORTAL CLOSED'}
                                </p>
                                <Toggle value={pendingEnroll ?? false} onChange={setPendingEnroll} disabled={isSaving} />
                            </div>
                            <p style={{ fontFamily: "var(--font-terminal)", fontSize: '0.56rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                Students can submit enrollment forms when open.
                            </p>
                        </div>

                        {/* Teaching load */}
                        <div style={{ padding: 16, borderRight: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-depth)' }}>
                            <FieldLabel>Max teaching load</FieldLabel>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                <NumberInput
                                    value={pendingLoad}
                                    onChange={setPendingLoad}
                                    min={1} max={10}
                                    disabled={isSaving}
                                    ariaLabel="Maximum teaching load per faculty"
                                />
                                <span style={{ fontFamily: "var(--font-terminal)", fontSize: '0.57rem', color: 'var(--text-muted)' }}>
                                    classes /<br />faculty
                                </span>
                            </div>
                            <p style={{ fontFamily: "var(--font-terminal)", fontSize: '0.56rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                Faculty at or above this limit cannot be assigned new subjects.
                            </p>
                        </div>

                        {/* Passkey */}
                        <div style={{ padding: 16, borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-depth)' }}>
                            <FieldLabel>Registration passkey</FieldLabel>
                            <code style={{
                                fontFamily: "var(--font-terminal)", fontSize: '0.85rem', fontWeight: 700,
                                color: 'var(--neon-cyan)', letterSpacing: '0.12em',
                                background: 'var(--bg-surface)', padding: '7px 10px', borderRadius: 5,
                                border: '1px solid var(--border-subtle)', borderLeft: '3px solid var(--neon-cyan)',
                                display: 'block', textAlign: 'center', marginBottom: 8, wordBreak: 'break-all',
                            }}>
                                {passkeyVisible
                                    ? (settings?.student_registration_passkey ?? '—')
                                    : '•'.repeat(settings?.student_registration_passkey?.length ?? 8)
                                }
                            </code>
                            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                                <button className="btn-ghost" style={{ fontSize: '0.55rem', padding: '4px 8px' }} onClick={() => setPasskeyVisible(v => !v)}>
                                    {passkeyVisible ? 'HIDE' : 'REVEAL'}
                                </button>
                                {passkeyVisible && (
                                    <button className="btn-ghost" style={{ fontSize: '0.55rem', padding: '4px 8px', color: 'var(--neon-cyan)' }} onClick={copyPasskey}>
                                        ⎘ COPY
                                    </button>
                                )}
                                <button className="btn-ghost" style={{ fontSize: '0.55rem', padding: '4px 8px', color: 'var(--neon-orange)', borderColor: 'rgba(255,140,0,0.35)' }} onClick={handleRotateKey} disabled={isRotating}>
                                    {isRotating ? 'GENERATING...' : '⟳ ROTATE KEY'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Deploy footer */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
                        <p style={{ fontFamily: "var(--font-terminal)", fontSize: '0.57rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                            {hasChanges
                                ? `${changeCount} setting${changeCount > 1 ? 's' : ''} staged — review diff before deploying.`
                                : 'All settings are current. No deploy needed.'}
                        </p>
                        <button
                            className={hasChanges ? 'btn-primary' : 'btn-ghost'}
                            style={{ padding: '10px 22px', fontSize: '0.68rem', letterSpacing: '0.16em', whiteSpace: 'nowrap' }}
                            onClick={handleDeploy}
                            disabled={isSaving || !hasChanges}
                        >
                            {isSaving ? 'DEPLOYING...' : hasChanges ? '⬆ DEPLOY CHANGES' : '— NO CHANGES —'}
                        </button>
                    </div>
                </CyberPanel>

            </div>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <div>
                    <h1 style={{ fontFamily: "var(--font-display)", fontSize: '1rem', fontWeight: 900, letterSpacing: '0.20em', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                        Command Center
                    </h1>
                    <p style={{ fontFamily: "var(--font-terminal)", fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 5 }}>
                        Unified admin console — settings · accounts · faculty load
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {activeSection === 'controls' && hasChanges && <StatusBadge variant="warning" label={`${changeCount} STAGED CHANGE${changeCount > 1 ? 'S' : ''}`} showDot />}
                    <StatusBadge variant="normal" label="SYSTEM ONLINE" />
                </div>
            </div>

            {/* Section tabs */}
            <SectionTabBar active={activeSection} onChange={setActiveSection} />

            {/* Section content */}
            {activeSection === 'controls' && renderControlsSection()}
            {activeSection === 'users' && <ManageUsers />}
            {activeSection === 'faculty' && <ManageFaculty />}
        </div>
    );
};

export default CommandCenter;