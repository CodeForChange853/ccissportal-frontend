import React, { useState, useRef, useEffect, useCallback } from 'react';

const InlineConfirm = ({
    trigger,
    message,
    confirmLabel = 'CONFIRM',
    cancelLabel = 'CANCEL',
    variant = 'danger',
    onConfirm,
    loading = false,
}) => {
    const [open, setOpen] = useState(false);
    const confirmRef = useRef(null);
    const cancelRef = useRef(null);
    const triggerRef = useRef(null);

    const color = variant === 'danger' ? 'var(--neon-red)' : 'var(--neon-orange)';
    const border = variant === 'danger' ? 'var(--border-critical)' : 'rgba(255,140,0,0.35)';
    const bg = variant === 'danger' ? 'var(--color-danger-bg)' : 'rgba(255,140,0,0.08)';

    useEffect(() => {
        if (open) confirmRef.current?.focus();
    }, [open]);

    const close = useCallback(() => {
        setOpen(false);
        triggerRef.current?.querySelector('button,a,[tabindex]')?.focus();
    }, []);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') { close(); return; }
        if (e.key === 'Tab') {
            const focusable = [cancelRef.current, confirmRef.current].filter(Boolean);
            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey) {
                if (document.activeElement === first) { e.preventDefault(); last.focus(); }
            } else {
                if (document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        }
    }, [close]);

    const handleConfirm = async () => {
        await onConfirm();
        setOpen(false);
    };

    return (
        <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
            <div
                ref={triggerRef}
                onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }}
                aria-haspopup="dialog"
                aria-expanded={open}
            >
                {trigger}
            </div>

            {open && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={message}
                    onKeyDown={handleKeyDown}
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
                            ref={cancelRef}
                            className="btn-ghost"
                            style={{ fontSize: '0.58rem', padding: '4px 10px' }}
                            onClick={close}
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
                            aria-busy={loading}
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
