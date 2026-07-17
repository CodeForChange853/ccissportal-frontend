import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../features/admin/api/adminApi';
import { useToast } from '../context/ToastContext';
import '../styles/components/command-palette.css';

const ACTION_LABELS = {
    SUSPEND_USER:    { verb: 'Suspend',  color: '#ef4444' },
    ACTIVATE_USER:   { verb: 'Activate', color: '#22c55e' },
    MAINTENANCE_ON:  { verb: 'Enable',   color: '#f59e0b' },
    MAINTENANCE_OFF: { verb: 'Disable',  color: '#22c55e' },
};

const TYPE_ORDER = ['ACTION', 'STUDENT', 'FACULTY', 'SUBJECT'];
const TYPE_LABEL = { ACTION: 'Actions', STUDENT: 'Students', FACULTY: 'Faculty', SUBJECT: 'Subjects' };

const resolveDestination = (result) => {
    switch (result.result_type) {
        case 'STUDENT': return `/portal/admin/grading?studentId=${result.result_id}`;
        case 'FACULTY': return `/portal/admin/faculty`;
        case 'SUBJECT': return `/portal/admin/curriculum`;
        default:        return `/portal/admin`;
    }
};

const RelevanceBar = ({ score }) => (
    <div className="cp-relevance">
        <div className="cp-relevance-track">
            <div className="cp-relevance-fill" style={{ width: `${Math.round(score * 100)}%` }} />
        </div>
    </div>
);

const CommandPalette = ({ isOpen, onClose }) => {
    const navigate   = useNavigate();
    const { toast }  = useToast();
    const inputRef   = useRef(null);
    const listRef    = useRef(null);
    const debounceRef = useRef(null);
    const queryCache = useRef(new Map());

    const [query,         setQuery]         = useState('');
    const [results,       setResults]       = useState([]);
    const [loading,       setLoading]       = useState(false);
    const [activeIdx,     setActiveIdx]     = useState(0);
    const [searched,      setSearched]      = useState(false);
    const [confirmTarget, setConfirmTarget] = useState(null);
    const [executing,     setExecuting]     = useState(false);

    useEffect(() => {
        if (isOpen) {
            setQuery(''); setResults([]); setSearched(false);
            setActiveIdx(0); setConfirmTarget(null); setExecuting(false);
            setTimeout(() => inputRef.current?.focus(), 80);
        }
    }, [isOpen]);

    const handleQueryChange = useCallback((e) => {
        const value = e.target.value;
        setQuery(value);
        setActiveIdx(0);
        setConfirmTarget(null);
        clearTimeout(debounceRef.current);

        if (!value.trim()) {
            setResults([]); setSearched(false); setLoading(false); return;
        }

        setLoading(true);
        debounceRef.current = setTimeout(async () => {
            const key = value.trim();
            const cached = queryCache.current.get(key);
            const CACHE_TTL_MS = 60_000;

            if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
                setResults(cached.results); setSearched(true); setLoading(false); return;
            }

            try {
                const data = await adminApi.omniSearch(key);
                const fresh = data ?? [];
                queryCache.current.set(key, { results: fresh, ts: Date.now() });
                setResults(fresh); setSearched(true);
            } catch {
                setResults([]); setSearched(true);
            } finally { setLoading(false); }
        }, 150);
    }, []);

    const flatResults = TYPE_ORDER.flatMap(type => results.filter(r => r.result_type === type));

    const handleSelect = useCallback((result) => {
        if (result.result_type === 'ACTION') { setConfirmTarget(result); return; }
        const dest = resolveDestination(result);
        const withQuery = result.result_type === 'STUDENT'
            ? dest
            : `${dest}?q=${encodeURIComponent(result.primary_text)}`;
        navigate(withQuery);
        onClose();
    }, [navigate, onClose]);

    const executeAction = useCallback(async (result) => {
        setExecuting(true);
        try {
            if (result.action_type === 'SUSPEND_USER') {
                await adminApi.setUserActiveStatus(result.result_id, false);
                toast.success(`${result.primary_text} suspended.`);
            } else if (result.action_type === 'ACTIVATE_USER') {
                await adminApi.setUserActiveStatus(result.result_id, true);
                toast.success(`${result.primary_text} activated.`);
            } else if (result.action_type === 'MAINTENANCE_ON') {
                await adminApi.updateSystemSettings({ is_maintenance_mode: true });
                toast.success('Maintenance mode enabled.');
            } else if (result.action_type === 'MAINTENANCE_OFF') {
                await adminApi.updateSystemSettings({ is_maintenance_mode: false });
                toast.success('Maintenance mode disabled.');
            }
            onClose();
        } catch {
            toast.error('Action failed. Please try again.');
            setExecuting(false);
            setConfirmTarget(null);
        }
    }, [onClose, toast]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') {
            if (confirmTarget) { setConfirmTarget(null); return; }
            onClose(); return;
        }
        if (!flatResults.length) return;
        if (e.key === 'ArrowDown')      { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, flatResults.length - 1)); }
        else if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
        else if (e.key === 'Enter')     { e.preventDefault(); if (flatResults[activeIdx]) handleSelect(flatResults[activeIdx]); }
    }, [flatResults, activeIdx, handleSelect, onClose, confirmTarget]);

    useEffect(() => {
        const activeEl = listRef.current?.querySelector('[data-active="true"]');
        activeEl?.scrollIntoView({ block: 'nearest' });
    }, [activeIdx]);

    if (!isOpen) return null;

    const grouped = TYPE_ORDER
        .map(type => ({ type, items: results.filter(r => r.result_type === type) }))
        .filter(g => g.items.length > 0);

    let flatIdx = 0;

    return (
        <div className="cp-overlay">
            <div className="cp-backdrop" onClick={onClose} />
            <div className="cp-panel animate-fade-in-up">

                <div className="cp-input-bar">
                    <span className="cp-input-icon">⚡</span>
                    <input
                        ref={inputRef} value={query}
                        onChange={handleQueryChange} onKeyDown={handleKeyDown}
                        className="cp-input"
                        placeholder="Search or command — 'suspend John', 'maintenance on', 'CS101'..."
                    />
                    <kbd className="cp-esc">ESC</kbd>
                </div>

                {confirmTarget && (
                    <div className="cp-confirm">
                        <p className="cp-confirm-label">Confirm Action</p>
                        <p className="cp-confirm-text">
                            <span style={{ color: ACTION_LABELS[confirmTarget.action_type]?.color }}>
                                {ACTION_LABELS[confirmTarget.action_type]?.verb}
                            </span>
                            {' '}{confirmTarget.primary_text}
                            {confirmTarget.secondary_text && (
                                <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.8rem' }}>
                                    {' '}— {confirmTarget.secondary_text}
                                </span>
                            )}
                        </p>
                        <div className="cp-confirm-btns">
                            <button
                                onClick={() => executeAction(confirmTarget)}
                                disabled={executing}
                                className="cp-confirm-btn"
                                style={{
                                    background: ACTION_LABELS[confirmTarget.action_type]?.color,
                                    color: '#fff', border: 'none',
                                    cursor: executing ? 'wait' : 'pointer',
                                    opacity: executing ? 0.7 : 1,
                                }}>
                                {executing ? 'EXECUTING...' : 'CONFIRM'}
                            </button>
                            <button
                                onClick={() => setConfirmTarget(null)}
                                disabled={executing}
                                className="cp-confirm-btn cp-confirm-btn-cancel">
                                CANCEL
                            </button>
                        </div>
                    </div>
                )}

                {!confirmTarget && (
                    <div className="cp-results" ref={listRef}>
                        {loading && <div className="cp-state-msg">SCANNING...</div>}

                        {!loading && searched && results.length === 0 && (
                            <div className="cp-state-msg">NO MATCHES FOR &quot;{query.toUpperCase()}&quot;</div>
                        )}

                        {!loading && !searched && (
                            <div className="cp-hint">
                                Try:{' '}
                                <span className="cp-hint-example">&quot;suspend [name]&quot;</span> ·{' '}
                                <span className="cp-hint-example">&quot;maintenance on&quot;</span> ·{' '}
                                <span className="cp-hint-example">&quot;CS101&quot;</span>
                            </div>
                        )}

                        {!loading && grouped.map(({ type, items }) => (
                            <div key={type}>
                                <div className="cp-section-header">{TYPE_LABEL[type]}</div>

                                {items.map((r) => {
                                    const thisIdx  = flatIdx++;
                                    const active   = thisIdx === activeIdx;
                                    const isAction = r.result_type === 'ACTION';
                                    const actionMeta = isAction ? ACTION_LABELS[r.action_type] : null;
                                    const accentColor = isAction
                                        ? (actionMeta?.color ?? 'var(--accent-gold)')
                                        : 'var(--neon-cyan)';

                                    return (
                                        <div
                                            key={`${r.result_type}-${r.result_id}-${r.action_type}`}
                                            data-active={active}
                                            onClick={() => handleSelect(r)}
                                            onMouseEnter={() => setActiveIdx(thisIdx)}
                                            className="cp-result-item"
                                            style={{
                                                background: active ? 'var(--bg-elevated)' : 'transparent',
                                                borderLeft: active ? `3px solid ${accentColor}` : '3px solid transparent',
                                            }}>
                                            <div className="cp-result-primary">
                                                <span className="cp-result-name" style={{ color: active ? accentColor : 'var(--text-primary)' }}>
                                                    {isAction && actionMeta && (
                                                        <span style={{ color: actionMeta.color, marginRight: 6 }}>{actionMeta.verb}</span>
                                                    )}
                                                    {r.primary_text}
                                                </span>
                                                {r.secondary_text && (
                                                    <span className="cp-result-sub" style={{ color: 'var(--text-muted)' }}>
                                                        {r.secondary_text}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="cp-result-meta">
                                                {!isAction && <RelevanceBar score={r.relevance_score ?? 1} />}
                                                <span className="cp-result-tag" style={{
                                                    border: `1px solid ${isAction ? (actionMeta?.color ?? 'var(--border-subtle)') : 'var(--border-subtle)'}`,
                                                    color: isAction ? (actionMeta?.color ?? 'var(--text-secondary)') : 'var(--text-secondary)',
                                                }}>
                                                    {isAction ? r.action_type?.replace('_', ' ') : r.result_type}
                                                </span>
                                                {active && <kbd style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>↵</kbd>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommandPalette;
