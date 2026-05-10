import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../features/admin/api/adminApi';

const resolveDestination = (result) => {
    switch (result.result_type) {
        case 'STUDENT': return `/portal/admin/users`;
        case 'FACULTY': return `/portal/admin/faculty`;
        case 'SUBJECT': return `/portal/admin/curriculum`;
        default: return `/portal/admin`;
    }
};

const CommandPalette = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const inputRef = useRef(null);
    const listRef = useRef(null);
    const debounceRef = useRef(null);
    const queryCache = useRef(new Map());

    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeIdx, setActiveIdx] = useState(0);
    const [searched, setSearched] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setQuery(''); setResults([]); setSearched(false); setActiveIdx(0);
            setTimeout(() => inputRef.current?.focus(), 80);
        }
    }, [isOpen]);

    const handleQueryChange = useCallback((e) => {
        const value = e.target.value;
        setQuery(value); setActiveIdx(0);
        clearTimeout(debounceRef.current);

        if (!value.trim()) {
            setResults([]); setSearched(false); setLoading(false); return;
        }

        setLoading(true);
        debounceRef.current = setTimeout(async () => {
            const key = value.trim();
            const cached = queryCache.current.get(key);
            const CACHE_TTL_MS = 60_000; // 60 seconds

            if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
                setResults(cached.results);
                setSearched(true);
                setLoading(false);
                return;
            }

            try {
                const data = await adminApi.omniSearch(key);
                const results = data ?? [];
                queryCache.current.set(key, { results, ts: Date.now() });
                setResults(results); setSearched(true);
            } catch {
                setResults([]); setSearched(true);
            } finally { setLoading(false); }
        }, 300);
    }, []);

    // ── THE DEEP LINK ──
    const handleSelect = useCallback((result) => {
        const dest = resolveDestination(result);
        // Pushes the exact name/code into the URL so the target page can catch it
        navigate(`${dest}?q=${encodeURIComponent(result.primary_text)}`);
        onClose();
    }, [navigate, onClose]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') { onClose(); return; }
        if (!results.length) return;

        if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
        else if (e.key === 'Enter') { e.preventDefault(); if (results[activeIdx]) handleSelect(results[activeIdx]); }
    }, [results, activeIdx, handleSelect, onClose]);

    useEffect(() => {
        const activeEl = listRef.current?.children[activeIdx];
        activeEl?.scrollIntoView({ block: 'nearest' });
    }, [activeIdx]);

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '15vh' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
            <div style={{ position: 'relative', width: '100%', maxWidth: 540, background: 'var(--bg-surface)', border: '1px solid var(--border-accent)', borderRadius: '12px', boxShadow: 'var(--shadow-modal)', overflow: 'hidden' }} className="animate-fade-in-up">

                <div style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '1.2rem', marginRight: 12 }}>⚡</span>
                    <input
                        ref={inputRef} value={query} onChange={handleQueryChange} onKeyDown={handleKeyDown}
                        placeholder="Type a command (e.g. 'Suspend John' or 'Manage CS101')..."
                        style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '1.1rem', fontFamily: 'var(--font-sans)' }}
                    />
                    <kbd style={{ fontFamily: 'var(--font-code)', fontSize: '0.65rem', background: 'var(--bg-depth)', border: '1px solid var(--border-default)', padding: '2px 6px', borderRadius: 4, color: 'var(--text-muted)' }}>ESC</kbd>
                </div>

                <div style={{ maxHeight: 340, overflowY: 'auto', padding: '8px 0' }}>
                    {loading && <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'var(--font-terminal)' }}>SCANNING DATABASES...</div>}
                    {!loading && searched && results.length === 0 && <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'var(--font-terminal)' }}>NO MATCHES FOR "{query.toUpperCase()}"</div>}

                    {!loading && results.length > 0 && (
                        <ul ref={listRef} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                            {results.map((r, i) => {
                                const active = i === activeIdx;
                                return (
                                    <li key={`${r.result_type}-${r.result_id}`} onClick={() => handleSelect(r)} onMouseEnter={() => setActiveIdx(i)}
                                        style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: active ? 'var(--bg-elevated)' : 'transparent', borderLeft: active ? '3px solid var(--neon-cyan)' : '3px solid transparent' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ color: active ? 'var(--neon-cyan)' : 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>{r.primary_text}</span>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'var(--font-terminal)' }}>{r.secondary_text}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-terminal)', padding: '2px 6px', border: '1px solid var(--border-subtle)', borderRadius: 4, color: 'var(--text-secondary)' }}>{r.result_type}</span>
                                            {active && <kbd style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>↵</kbd>}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;