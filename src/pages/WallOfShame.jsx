import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import '../styles/components/wall-of-shame.css';



const WallOfShame = () => {
    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    const [violators, setViolators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const t = setTimeout(() => setShow(true), 60);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await client.getWallOfShame();
                setViolators(data);
            } catch (err) {
                setError('Could not load the Wall of Shame data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatDate = (isoString) => {
        if (!isoString) return 'Unknown';
        try {
            return new Date(isoString).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
            });
        } catch {
            return isoString;
        }
    };

    const COOLDOWN_TOTAL = 60; // visual reference, actual from backend

    return (
        <>

            <div className="ws-page">
                <div className="ws-scanline" aria-hidden="true" />
                <div className="ws-noise" aria-hidden="true" />

                <div className="ws-container" style={{ opacity: show ? 1 : 0, transition: 'opacity .4s' }}>

                    {/* Header */}
                    <div className="ws-header">
                        <div className="ws-icon">☠</div>
                        <div className="ws-badge">⚠ Public Registry · NexEnroll Protocol</div>
                        <h1 className="ws-title">
                            Wall of<br /><em>Shame</em>
                        </h1>
                        <p className="ws-subtitle">
                            This public registry documents users who have violated NexEnroll&apos;s academic integrity
                            and code of conduct policies. Names listed here have reached the three-strike threshold
                            and are serving a mandatory accountability period.
                        </p>
                    </div>

                    {/* Live Counter */}
                    {!loading && (
                        <div className="ws-counter">
                            <div className="ws-counter-dot" />
                            <span className="ws-counter-num">{violators.length}</span>
                            <span className="ws-counter-label">
                                {violators.length === 1 ? 'name currently listed' : 'names currently listed'}
                            </span>
                        </div>
                    )}

                    {/* Disclaimer */}
                    <div className="ws-disclaimer">
                        <div className="ws-disclaimer-icon">⚖</div>
                        <div className="ws-disclaimer-text">
                            <strong>Institutional Accountability Notice</strong>
                            The following individuals have been placed on this registry following repeated, documented
                            violations of academic integrity and professional conduct standards. Listing is automatic
                            upon reaching the three-strike threshold and remains active for the designated cooldown period.
                            Redemption is possible through reformed behavior and administrative review.
                        </div>
                    </div>

                    {/* Content */}
                    <div aria-live="polite" aria-atomic="false">
                    {loading ? (
                        <div className="ws-loading" role="status" aria-label="Loading registry">
                            <div className="ws-spinner" aria-hidden="true" />
                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '.75rem', color: '#C0392B', letterSpacing: '.1em' }}>
                                LOADING REGISTRY...
                            </span>
                        </div>
                    ) : error ? (
                        <div className="ws-empty">
                            <div className="ws-empty-icon">⚠</div>
                            <div className="ws-empty-title" style={{ color: '#E74C3C' }}>Registry Unavailable</div>
                            <p className="ws-empty-desc" style={{ color: '#6A3030' }}>{error}</p>
                        </div>
                    ) : violators.length === 0 ? (
                        <div className="ws-empty">
                            <div className="ws-empty-icon">✦</div>
                            <div className="ws-empty-title">Clean Record</div>
                            <p className="ws-empty-desc">
                                No active violations. The NexEnroll community is currently in full compliance
                                with academic integrity standards. Let&apos;s keep it that way.
                            </p>
                        </div>
                    ) : (
                        <div className="ws-grid">
                            {violators.map((v, i) => {
                                const progress = v.eligible_for_removal
                                    ? 100
                                    : Math.max(0, Math.min(100, ((COOLDOWN_TOTAL - v.days_until_eligible) / COOLDOWN_TOTAL) * 100));

                                return (
                                    <div
                                        key={v.account_id}
                                        className="ws-card"
                                        style={{ animationDelay: `${0.08 + i * 0.12}s` }}
                                    >
                                        {/* Card header */}
                                        <div className="ws-card-head">
                                            <div className="ws-avatar">⚠</div>
                                            <div className="ws-card-info">
                                                <div className="ws-card-name">{v.display_name}</div>
                                                <div className="ws-card-meta">
                                                    <span className={`ws-role-badge ${v.role.toLowerCase()}`}>
                                                        {v.role}
                                                    </span>
                                                    <div
                                                        className="ws-strikes"
                                                        aria-label={`${v.violation_count} violation${v.violation_count !== 1 ? 's' : ''}`}
                                                    >
                                                        {Array.from({ length: Math.min(v.violation_count, 5) }).map((_, j) => (
                                                            <div key={j} className="ws-strike-dot" aria-hidden="true" />
                                                        ))}
                                                        <span aria-hidden="true" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.68rem', color: '#E74C3C', marginLeft: 4 }}>
                                                            ×{v.violation_count}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Offense list */}
                                        {v.violation_log.length > 0 && (
                                            <div className="ws-offenses">
                                                <div className="ws-offenses-title">Recorded Offenses</div>
                                                {v.violation_log.map((offense, k) => (
                                                    <div key={k} className="ws-offense-item">
                                                        <div className="ws-offense-bullet" />
                                                        <div>
                                                            <div>{offense.offense}</div>
                                                            <div className="ws-offense-date">
                                                                {formatDate(offense.detected_at)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Cooldown bar */}
                                        <div className="ws-cooldown">
                                            <div className="ws-cooldown-bar-track">
                                                <div
                                                    className={`ws-cooldown-bar-fill ${v.eligible_for_removal ? 'eligible' : ''}`}
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                            <span className={`ws-cooldown-text ${v.eligible_for_removal ? 'eligible' : ''}`}>
                                                {v.eligible_for_removal
                                                    ? '✓ Eligible'
                                                    : `${v.days_until_eligible}d remaining`
                                                }
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Actions */}
                    </div>
                    <div className="ws-actions">
                        <button className="ws-btn ws-btn-ghost" onClick={() => navigate('/rules')}>
                            ← Back to Rules
                        </button>
                        <button className="ws-btn ws-btn-red" onClick={() => navigate('/')}>
                            Return Home
                        </button>
                    </div>

                    <p className="ws-footer">
                        NexEnroll AI Core — Public Accountability Registry<br />
                        Northwest Samar State University · CCIS · <span>{new Date().getFullYear()}</span>
                    </p>
                </div>
            </div>
        </>
    );
};

export default WallOfShame;
