import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { adminApi } from '../api/adminApi';
import CyberPanel from '../../../components/ui/CyberPanel';
import StatusBadge from '../../../components/ui/StatusBadge';
import Skeleton from '../../../components/ui/Skeleton';
import { useToast } from '../../../context/ToastContext';
import ManageFaculty from './ManageFaculty';
import ManageUsers from './ManageUsers';
import { KeyIcon, ShieldIcon, LoadIcon, EnrollmentsIcon } from '../../../components/icons';

// ── Section tabs ──────────────────────────────────────────────────────────
const SECTIONS = [
    { id: 'controls', label: 'SYSTEM CONTROLS' },
    { id: 'users', label: 'USER REGISTRY' },
    { id: 'faculty', label: 'FACULTY LOAD' },
];

// ── SectionTabBar ─────────────────────────────────────────────────────────
const SectionTabBar = ({ active, onChange }) => (
    <div style={{
        display: 'flex',
        gap: 0,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 12,
        padding: 4,
        width: 'fit-content',
    }}>
        {SECTIONS.map(s => {
            const isActive = active === s.id;
            return (
                <button
                    key={s.id}
                    onClick={() => onChange(s.id)}
                    aria-current={isActive ? 'page' : undefined}
                    style={{
                        padding: '8px 20px',
                        background: isActive ? 'var(--accent)' : 'transparent',
                        border: 'none',
                        borderRadius: 10,
                        fontFamily: 'var(--font-terminal)',
                        fontSize: '0.60rem',
                        fontWeight: isActive ? 700 : 500,
                        letterSpacing: '0.12em',
                        color: isActive ? '#fff' : 'var(--text-muted)',
                        cursor: 'pointer',
                        transition: 'all 0.18s ease',
                        textTransform: 'uppercase',
                        boxShadow: isActive ? '0 2px 8px rgba(157,78,221,0.30)' : 'none',
                    }}
                    onMouseEnter={e => {
                        if (!isActive) e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={e => {
                        if (!isActive) e.currentTarget.style.color = 'var(--text-muted)';
                    }}
                >
                    {s.label}
                </button>
            );
        })}
    </div>
);

// ── Diff row ──────────────────────────────────────────────────────────────
const DiffRow = ({ label, from, to, changed }) => (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        padding: '12px 0',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
    }}>
        <p style={{
            fontFamily: 'var(--font-code)',
            fontSize: '0.62rem',
            color: 'var(--text-muted)',
            opacity: 0.6,
        }}>
            # {label}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'var(--font-code)', fontSize: '0.75rem' }}>
            {changed ? (
                <>
                    <span style={{ color: 'var(--neon-red)', background: 'rgba(220,38,38,0.1)', padding: '2px 6px', borderRadius: 4 }}>
                        - {String(from)}
                    </span>
                    <span style={{ color: 'var(--text-muted)', opacity: 0.5 }}>→</span>
                    <span style={{ color: 'var(--neon-green)', background: 'rgba(22,163,74,0.1)', padding: '2px 6px', borderRadius: 4 }}>
                        + {String(to)}
                    </span>
                </>
            ) : (
                <span style={{ color: 'var(--text-muted)', opacity: 0.4 }}>
                    &nbsp;&nbsp; {String(from)} (NO CHANGE)
                </span>
            )}
        </div>
    </div>
);

// ── Toggle ────────────────────────────────────────────────────────────────
// NOTE: The Toggle component uses CSS/span shapes intentionally. Do not replace.
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

// ── Field label ───────────────────────────────────────────────────────────
const FieldLabel = ({ children }) => (
    <p style={{
        fontFamily: 'var(--font-terminal)', fontSize: '0.54rem',
        letterSpacing: '0.14em', textTransform: 'uppercase',
        color: 'var(--text-muted)', marginBottom: 6,
    }}>
        {children}
    </p>
);

// ── Number input ──────────────────────────────────────────────────────────
const NumberInput = ({ value, onChange, min, max, disabled, ariaLabel }) => (
    <input
        type="number" min={min} max={max} aria-label={ariaLabel}
        value={value ?? ''} onChange={e => onChange(parseInt(e.target.value, 10))}
        disabled={disabled}
        style={{
            width: 72, background: 'var(--bg-input)',
            border: '1px solid var(--border-default)', borderLeft: '3px solid var(--neon-cyan)',
            borderRadius: 10, padding: '8px 10px',
            fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700,
            color: 'var(--neon-cyan)', textAlign: 'center', outline: 'none',
        }}
        onFocus={e => { e.target.style.borderColor = 'var(--border-focus)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,245,255,0.08)'; }}
        onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'none'; }}
    />
);

// ── Main ──────────────────────────────────────────────────────────────────
const CommandCenter = () => {
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
    const [pendingMaintenance, setPendingMaintenance] = useState(null);
    const [pendingReason, setPendingReason] = useState('');

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
                    setPendingMaintenance(s.value.is_maintenance_mode);
                    setPendingReason(s.value.maintenance_reason || '');
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
            if (pendingMaintenance !== settings.is_maintenance_mode)
                payload.is_maintenance_mode = pendingMaintenance;
            if (pendingReason !== settings.maintenance_reason)
                payload.maintenance_reason = pendingReason;
            if (!Object.keys(payload).length) { flash('No changes to deploy.', 'info'); return; }
            const updated = await adminApi.updateSystemSettings(payload);
            setSettings(updated);
            flash('Settings deployed successfully.');
        } catch (err) {
            flash(err.response?.data?.detail || 'Deploy failed.', 'error');
        } finally { setIsSaving(false); }
    };

    // ── Semestral passkey rotation — CRITICAL security feature.
    // Calls get_active_passkey via rotatePasskey(). Never replace with hardcoded logic.
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
    const maintenanceChanged = pendingMaintenance !== settings?.is_maintenance_mode;
    const reasonChanged = pendingReason !== settings?.maintenance_reason;

    const hasChanges = enrollChanged || loadChanged || maintenanceChanged || reasonChanged;
    const changeCount = [enrollChanged, loadChanged, maintenanceChanged, reasonChanged].filter(Boolean).length;

    const renderControlsSection = () => {
        if (isLoading) return (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                <Skeleton.Card /><Skeleton.Card />
            </div>
        );

        if (loadError) return (
            <div style={{
                padding: 20, fontFamily: 'var(--font-terminal)', fontSize: '0.75rem',
                color: 'var(--neon-red)', background: 'var(--color-danger-bg)',
                border: '1px solid var(--border-critical)', borderRadius: 12,
            }}>
                ⚠ {loadError}
            </div>
        );

        return (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, alignItems: 'start' }}>

                {/* LEFT — Unified system controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        {/* Enrollment gate */}
                        <div style={{
                            padding: 24,
                            background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-depth) 100%)',
                            borderRadius: 20,
                            border: '1px solid var(--border-default)',
                            boxShadow: 'var(--shadow-card)',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            overflow: 'hidden',
                        }}>
                            <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.05 }}>
                                <EnrollmentsIcon size={80} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                <div style={{ 
                                    padding: 10, borderRadius: 12, 
                                    background: pendingEnroll ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
                                    color: pendingEnroll ? 'var(--color-success-tx)' : 'var(--color-danger-tx)',
                                }}>
                                    <EnrollmentsIcon size={20} />
                                </div>
                                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.02em' }}>Enrollment Gate</h3>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
                                <p style={{
                                    fontFamily: 'var(--font-terminal)', fontSize: '0.9rem', fontWeight: 800,
                                    color: pendingEnroll ? 'var(--neon-green)' : 'var(--neon-red)',
                                }}>
                                    {pendingEnroll ? 'SYSTEM OPEN' : 'SYSTEM CLOSED'}
                                </p>
                                <Toggle value={pendingEnroll ?? false} onChange={setPendingEnroll} disabled={isSaving} />
                            </div>
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                Controls public access to the student enrollment portal. Toggle to open/close semestral admissions.
                            </p>
                        </div>

                        {/* Teaching load */}
                        <div style={{
                            padding: 24,
                            background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-depth) 100%)',
                            borderRadius: 20,
                            border: '1px solid var(--border-default)',
                            boxShadow: 'var(--shadow-card)',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            overflow: 'hidden',
                        }}>
                            <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.05 }}>
                                <LoadIcon size={80} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                <div style={{ 
                                    padding: 10, borderRadius: 12, 
                                    background: 'var(--accent-dim)',
                                    color: 'var(--accent)',
                                }}>
                                    <LoadIcon size={20} />
                                </div>
                                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.02em' }}>Academic Load Cap</h3>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                                <NumberInput
                                    value={pendingLoad}
                                    onChange={setPendingLoad}
                                    min={1} max={10}
                                    disabled={isSaving}
                                />
                                <div style={{ lineHeight: 1.2 }}>
                                    <p style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>Classes</p>
                                    <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Per Faculty Member</p>
                                </div>
                            </div>
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                Global restriction for faculty teaching assignments. Prevents over-scheduling and ensures balance.
                            </p>
                        </div>
                    </div>

                    {/* Passkey section — Full width */}
                    <div style={{
                        padding: 24,
                        background: 'var(--bg-sidebar)',
                        color: '#fff',
                        borderRadius: 24,
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: 'var(--shadow-accent)',
                    }}>
                        <div style={{ position: 'absolute', bottom: -20, right: -20, opacity: 0.1, transform: 'rotate(-15deg)' }}>
                            <KeyIcon size={120} />
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ 
                                    padding: 10, borderRadius: 12, 
                                    background: 'rgba(255,255,255,0.08)',
                                    color: 'var(--student-gold)',
                                }}>
                                    <KeyIcon size={20} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>Registration Passkey</h3>
                                    <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Semestral security layer for new student sign-ups</p>
                                </div>
                            </div>
                            <button
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: 12,
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'var(--student-gold)',
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                onClick={handleRotateKey}
                                disabled={isRotating}
                            >
                                {isRotating ? 'GENERATING...' : '⟳ ROTATE PASSKEY'}
                            </button>
                        </div>

                        <div style={{ 
                            background: 'rgba(0,0,0,0.3)',
                            padding: '24px 32px',
                            borderRadius: 16,
                            border: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 20,
                            marginBottom: 10,
                        }}>
                            <code style={{
                                fontFamily: 'var(--font-code)',
                                fontSize: '2.4rem',
                                fontWeight: 800,
                                letterSpacing: '0.4em',
                                color: passkeyVisible ? 'var(--student-gold)' : 'rgba(255,255,255,0.1)',
                                textShadow: passkeyVisible ? '0 0 20px rgba(201,168,76,0.3)' : 'none',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}>
                                {passkeyVisible
                                    ? (settings?.student_registration_passkey ?? '—')
                                    : '••••••••'
                                }
                            </code>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <button
                                    onClick={() => setPasskeyVisible(v => !v)}
                                    style={{
                                        width: 36, height: 36, borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: '#fff', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}
                                    title={passkeyVisible ? 'Hide Key' : 'Reveal Key'}
                                >
                                    {passkeyVisible ? '⊝' : '⊙'}
                                </button>
                                {passkeyVisible && (
                                    <button
                                        onClick={copyPasskey}
                                        style={{
                                            width: 36, height: 36, borderRadius: '50%',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: 'var(--student-gold)', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}
                                        title="Copy to Clipboard"
                                    >
                                        ⎘
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Maintenance Protocol — NEW High Priority Card */}
                    <div style={{
                        padding: 24,
                        background: pendingMaintenance 
                            ? 'linear-gradient(135deg, rgba(157,78,221,0.15) 0%, rgba(13,9,38,1) 100%)' 
                            : 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-depth) 100%)',
                        borderRadius: 24,
                        border: pendingMaintenance 
                            ? '1px solid rgba(157,78,221,0.4)' 
                            : '1px solid var(--border-default)',
                        boxShadow: pendingMaintenance ? '0 0 30px rgba(157,78,221,0.15)' : 'var(--shadow-card)',
                        transition: 'all 0.4s ease',
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                        <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.03 }}>
                            <ShieldIcon size={100} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ 
                                    padding: 10, borderRadius: 12, 
                                    background: pendingMaintenance ? 'rgba(157,78,221,0.2)' : 'var(--bg-depth)',
                                    color: pendingMaintenance ? '#d8b4fe' : 'var(--text-muted)',
                                }}>
                                    <ShieldIcon size={20} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Global Maintenance Protocol</h3>
                                    <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 2 }}>Locks the entire system for non-administrative users</p>
                                </div>
                            </div>
                            <Toggle value={pendingMaintenance ?? false} onChange={setPendingMaintenance} disabled={isSaving} />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <FieldLabel>Status Message / Maintenance Reason</FieldLabel>
                            <input 
                                type="text"
                                placeholder="e.g. Scheduled System Optimization, Database Maintenance..."
                                value={pendingReason}
                                onChange={e => setPendingReason(e.target.value)}
                                disabled={isSaving}
                                style={{
                                    width: '100%',
                                    background: 'rgba(0,0,0,0.2)',
                                    border: '1px solid var(--border-default)',
                                    borderRadius: 12,
                                    padding: '12px 16px',
                                    fontFamily: 'var(--font-terminal)',
                                    fontSize: '0.75rem',
                                    color: pendingMaintenance ? '#d8b4fe' : 'var(--text-primary)',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                }}
                            />
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {[
                                    'Neural Infrastructure Recalibration', 
                                    'AI Core Synchronization', 
                                    'Deep Layer Data Optimization', 
                                    'Quantum Security Patch'
                                ].map(preset => (
                                    <button 
                                        key={preset}
                                        onClick={() => setPendingReason(preset)}
                                        style={{
                                            padding: '4px 12px',
                                            borderRadius: 8,
                                            background: 'rgba(157,78,221,0.05)',
                                            border: '1px solid rgba(157,78,221,0.2)',
                                            fontSize: '0.62rem',
                                            color: '#d8b4fe',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(157,78,221,0.15)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(157,78,221,0.05)'}
                                    >
                                        + {preset}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT — Pre-deploy diff terminal */}
                <div style={{ 
                    position: 'sticky', top: 20,
                    background: '#0D0926', 
                    borderRadius: 16, 
                    border: '1px solid var(--border-default)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-raised)',
                }}>
                    <div style={{ 
                        padding: '10px 16px', 
                        background: 'rgba(255,255,255,0.03)', 
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56' }}></div>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }}></div>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f' }}></div>
                        </div>
                        <p style={{ 
                            fontFamily: 'var(--font-code)', fontSize: '0.62rem', 
                            color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' 
                        }}>
                            Pre-Deploy Diff
                        </p>
                    </div>
                    
                    <div style={{ padding: 20 }}>
                        {!hasChanges ? (
                            <div style={{ padding: '40px 0', textAlign: 'center' }}>
                                <p style={{
                                    fontFamily: 'var(--font-code)', fontSize: '0.68rem',
                                    color: 'var(--color-success)', opacity: 0.8,
                                }}>
                                    // NO CHANGES STAGED
                                </p>
                                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 8 }}>
                                    System is in sync with current baseline.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div style={{ marginBottom: 20 }}>
                                    <DiffRow
                                        label="Enrollment Gate"
                                        from={settings?.is_enrollment_open ? 'OPEN' : 'CLOSED'}
                                        to={pendingEnroll ? 'OPEN' : 'CLOSED'}
                                        changed={enrollChanged}
                                    />
                                    <DiffRow
                                        label="Teaching Load Cap"
                                        from={settings?.global_max_teaching_load}
                                        to={pendingLoad}
                                        changed={loadChanged}
                                    />
                                    <DiffRow
                                        label="Maintenance Mode"
                                        from={settings?.is_maintenance_mode ? 'LOCKED' : 'ONLINE'}
                                        to={pendingMaintenance ? 'LOCKED' : 'ONLINE'}
                                        changed={pendingMaintenance !== settings?.is_maintenance_mode}
                                    />
                                    {pendingReason !== settings?.maintenance_reason && (
                                        <DiffRow
                                            label="Status Reason"
                                            from={settings?.maintenance_reason || 'NONE'}
                                            to={pendingReason || 'NONE'}
                                            changed={true}
                                        />
                                    )}
                                </div>
                                
                                <div style={{ 
                                    background: 'rgba(244,11,233,0.05)', 
                                    padding: 16, borderRadius: 12,
                                    borderLeft: '4px solid var(--accent)',
                                    marginBottom: 24,
                                }}>
                                    <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--accent)', marginBottom: 4 }}>Attention Required</p>
                                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                        Deploying will affect {changeCount} system parameter{changeCount > 1 ? 's' : ''} immediately.
                                    </p>
                                </div>

                                <button
                                    onClick={handleDeploy}
                                    disabled={isSaving || !hasChanges}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        borderRadius: 12,
                                        background: 'var(--accent)',
                                        color: '#fff',
                                        border: 'none',
                                        fontSize: '0.75rem',
                                        fontWeight: 800,
                                        letterSpacing: '0.1em',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        boxShadow: '0 4px 12px rgba(157,78,221,0.3)',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    {isSaving ? 'EXECUTING...' : 'RUN DEPLOY'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <div>
                    <h1 style={{
                        fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 900,
                        letterSpacing: '0.20em', textTransform: 'uppercase',
                        color: 'var(--text-primary)',
                    }}>
                        Command Center
                    </h1>
                    <p style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 5 }}>
                        Unified admin console — settings · accounts · faculty load
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {activeSection === 'controls' && hasChanges && (
                        <StatusBadge variant="warning" label={`${changeCount} STAGED CHANGE${changeCount > 1 ? 'S' : ''}`} showDot />
                    )}
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