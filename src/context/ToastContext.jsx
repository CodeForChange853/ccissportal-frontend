import React, {
    createContext, useContext, useState, useCallback, useRef,
} from 'react';

const ToastContext = createContext({ toast: {} });
export const useToast = () => useContext(ToastContext);

const VARIANTS = {
    success: { color: 'var(--neon-green)', bg: 'var(--color-success-bg)', border: 'var(--color-success-bd)' },
    error: { color: 'var(--neon-red)', bg: 'var(--color-danger-bg)', border: 'var(--border-critical)' },
    warn: { color: 'var(--neon-orange)', bg: 'rgba(255,140,0,0.08)', border: 'rgba(255,140,0,0.35)' },
    info: { color: 'var(--neon-cyan)', bg: 'var(--accent-dim)', border: 'var(--border-accent)' },
};

let _nextId = 0;

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const timers = useRef({});

    const dismiss = useCallback((id) => {
        clearTimeout(timers.current[id]);
        delete timers.current[id];
        // Fade out first then remove
        setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
    }, []);

    const add = useCallback((message, type = 'info', duration = 4000) => {
        const id = ++_nextId;
        setToasts(prev => [...prev.slice(-4), { id, message, type, exiting: false }]);
        timers.current[id] = setTimeout(() => dismiss(id), duration);
        return id;
    }, [dismiss]);

    const toast = {
        success: (msg, ms) => add(msg, 'success', ms),
        error: (msg, ms) => add(msg, 'error', ms ?? 6000),
        warn: (msg, ms) => add(msg, 'warn', ms),
        info: (msg, ms) => add(msg, 'info', ms),
    };

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}

            <div
                role="status"
                aria-live="polite"
                aria-atomic="false"
                style={{
                    position: 'fixed', top: 72, right: 20,
                    zIndex: 9999,
                    display: 'flex', flexDirection: 'column', gap: 8,
                    width: 340, pointerEvents: 'none',
                }}>
                {toasts.map(({ id, message, type, exiting }) => {
                    const v = VARIANTS[type] ?? VARIANTS.info;
                    return (
                        <div
                            key={id}
                            style={{
                                background: v.bg,
                                border: `1px solid ${v.border}`,
                                borderLeft: `3px solid ${v.color}`,
                                borderRadius: 8,
                                padding: '12px 14px',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 10,
                                pointerEvents: 'all',
                                opacity: exiting ? 0 : 1,
                                transform: exiting ? 'translateX(20px)' : 'translateX(0)',
                                transition: 'opacity 0.3s, transform 0.3s',
                                boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                            }}
                        >
                            <span style={{
                                width: 7, height: 7, borderRadius: '50%',
                                background: v.color, flexShrink: 0, marginTop: 4,
                                boxShadow: `0 0 6px ${v.color}`,
                            }} />

                            <p style={{
                                fontFamily: 'var(--font-terminal)',
                                fontSize: '0.72rem',
                                color: v.color,
                                lineHeight: 1.5,
                                flex: 1,
                                margin: 0,
                            }}>
                                {message}
                            </p>

                            <button
                                onClick={() => dismiss(id)}
                                style={{
                                    background: 'none', border: 'none',
                                    color: v.color, opacity: 0.6,
                                    cursor: 'pointer', padding: 0,
                                    fontFamily: 'var(--font-terminal)',
                                    fontSize: '0.65rem', flexShrink: 0,
                                    lineHeight: 1,
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
};