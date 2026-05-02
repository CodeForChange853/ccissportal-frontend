// frontend/src/components/ui/InlineConfirm.jsx


import React, { useState, useRef, useEffect } from 'react';

const InlineConfirm = ({
    trigger,
    message,
    confirmLabel = 'CONFIRM',
    cancelLabel = 'CANCEL',
    variant = 'danger',   // 'danger' | 'warning'
    onConfirm,
    loading = false,
}) => {
    const [open, setOpen] = useState(false);
    const confirmRef = useRef(null);

    const color = variant === 'danger' ? 'var(--neon-red)' : 'var(--neon-orange)';
    const border = variant === 'danger' ? 'var(--border-critical)' : 'rgba(255,140,0,0.35)';
    const bg = variant === 'danger' ? 'var(--color-danger-bg)' : 'rgba(255,140,0,0.08)';

    // Auto-focus confirm button when panel opens
    useEffect(() => {
        if (open) confirmRef.current?.focus();
    }, [open]);

    const handleConfirm = async () => {
        await onConfirm();
        setOpen(false);
    };

    return (
        <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
            {/* Trigger — cloned to intercept onClick */}
            <div onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }}>
                {trigger}
            </div>

            {/* Confirmation panel */}
            {open && (
                <div
                    style={{
                        background: bg,
                        border: `1px solid ${border}`,
                        borderRadius: 8,
                        padding: '10px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        maxWidth: 260,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                        zIndex: 10,
                    }}
                    onClick={e => e.stopPropagation()}
                >
                    <p style={{
                        fontFamily: 'var(--font-terminal)',
                        fontSize: '0.65rem',
                        color,
                        lineHeight: 1.5,
                        margin: 0,
                        letterSpacing: '0.04em',
                    }}>
                        {message}
                    </p>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                            className="btn-ghost"
                            style={{ fontSize: '0.58rem', padding: '4px 10px' }}
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            {cancelLabel}
                        </button>
                        <button
                            ref={confirmRef}
                            className="btn-danger"
                            style={{ fontSize: '0.58rem', padding: '4px 10px', background: color, borderColor: color }}
                            onClick={handleConfirm}
                            disabled={loading}
                        >
                            {loading ? '...' : confirmLabel}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InlineConfirm;