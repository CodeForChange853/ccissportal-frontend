import React, { useEffect, useState } from 'react';
import '../styles/components/maintenance.css';

const TICKER_ITEMS = [
    'MAINTENANCE ACTIVE', 'CCIS SYSTEMS OFFLINE', 'TEAM DEPLOYING UPDATES',
    'DATA INTEGRITY PRESERVED', 'ESTIMATED DOWNTIME: SEE TIMER', 'SECURE CHANNEL ACTIVE',
    'AUTO-RECOVERY STANDING BY', 'NEXENROLL v3.4 PENDING', 'APOLOGIES FOR INCONVENIENCE',
    'MAINTENANCE ACTIVE', 'CCIS SYSTEMS OFFLINE', 'TEAM DEPLOYING UPDATES',
    'DATA INTEGRITY PRESERVED', 'ESTIMATED DOWNTIME: SEE TIMER', 'SECURE CHANNEL ACTIVE',
    'AUTO-RECOVERY STANDING BY', 'NEXENROLL v3.4 PENDING', 'APOLOGIES FOR INCONVENIENCE',
];

const pad = (n) => String(n).padStart(2, '0');

const MaintenanceScreen = () => {
    const [reason, setReason] = useState('');
    const [message, setMessage] = useState('');
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 2, minutes: 45, seconds: 0 });
    const [show, setShow] = useState(false);
    const [tick, setTick] = useState(0);

    useEffect(() => {
        setReason(sessionStorage.getItem('maintenance_reason') || '');
        setMessage(sessionStorage.getItem('maintenance_message') || '');
        const t = setTimeout(() => setShow(true), 60);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                let { days, hours, minutes, seconds } = prev;
                if (seconds > 0) { seconds--; }
                else {
                    seconds = 59;
                    if (minutes > 0) { minutes--; }
                    else {
                        minutes = 59;
                        if (hours > 0) { hours--; }
                        else if (days > 0) { days--; hours = 23; }
                    }
                }
                return { days, hours, minutes, seconds };
            });
            setTick(t => t + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const displayReason = reason || 'Neural Infrastructure Recalibration';
    const displayMsg = message || 'NexEnroll is currently undergoing deep-layer synchronization to optimize semestral load balancing and ensure total data integrity. Our team is actively working to restore full service and evolve your academic journey.';

    const now = new Date();
    const ts = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    return (
        <div className="mp" style={{ opacity: show ? 1 : 0, transition: 'opacity .5s' }}>
            <div className="mp-noise" />
            <div className="mp-grid" />

            <div className="mp-topbar">
                <div className="mp-topbar-brand">
                    <div className="mp-topbar-logo">N</div>
                    <span className="mp-topbar-name">NexEnroll <em>System</em></span>
                </div>
                <div className="mp-topbar-right">
                    <div className="mp-topbar-status">
                        <div className="mp-topbar-status-dot" />
                        Maintenance Mode
                    </div>
                </div>
            </div>

            <div className="mp-ticker" aria-hidden="true">
                <div className="mp-ticker-inner">
                    {TICKER_ITEMS.map((item, i) => (
                        <span key={i} className="mp-ticker-item">
                            <span className="mp-ticker-dot" />{item}
                        </span>
                    ))}
                </div>
            </div>

            <div className="mp-body">

                <div className="mp-orbital">
                    <div className="mp-orb-ring mp-orb-ring-1" />
                    <div className="mp-orb-ring mp-orb-ring-2" />
                    <div className="mp-orb-ring mp-orb-ring-3" />
                    <div className="mp-orb-core">
                        <svg className="mp-orb-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                        </svg>
                    </div>
                </div>

                <div className="mp-eyebrow">Maintenance Protocol Active</div>

                <h1 className="mp-h1">We&apos;ll be <em>back</em> shortly</h1>

                <div className="mp-reason">
                    <div className="mp-reason-dot" />
                    {displayReason}
                </div>

                <div className="mp-message">
                    <div className="mp-message-label">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
                        </svg>
                        System Notice
                    </div>
                    <p className="mp-message-text">{displayMsg}</p>
                </div>

                <div className="mp-countdown">
                    {timeLeft.days > 0 && (
                        <>
                            <div className="mp-time-unit">
                                <div className="mp-time-card">
                                    <div className="mp-time-sep-line" />
                                    <span className="mp-time-val">{pad(timeLeft.days)}</span>
                                </div>
                                <span className="mp-time-label">Days</span>
                            </div>
                            <div className="mp-countdown-sep">:</div>
                        </>
                    )}
                    <div className="mp-time-unit">
                        <div className="mp-time-card">
                            <div className="mp-time-sep-line" />
                            <span className="mp-time-val">{pad(timeLeft.hours)}</span>
                        </div>
                        <span className="mp-time-label">Hours</span>
                    </div>
                    <div className="mp-countdown-sep">:</div>
                    <div className="mp-time-unit">
                        <div className="mp-time-card">
                            <div className="mp-time-sep-line" />
                            <span className="mp-time-val">{pad(timeLeft.minutes)}</span>
                        </div>
                        <span className="mp-time-label">Min</span>
                    </div>
                    <div className="mp-countdown-sep">:</div>
                    <div className="mp-time-unit">
                        <div className="mp-time-card">
                            <div className="mp-time-sep-line" />
                            <span key={tick} className="mp-time-val" style={{ animation: 'countFlip .5s ease both' }}>
                                {pad(timeLeft.seconds)}
                            </span>
                        </div>
                        <span className="mp-time-label">Sec</span>
                    </div>
                </div>

                <div className="mp-actions">
                    <button className="mp-btn-primary" onClick={() => window.location.reload()}>
                        Refresh System Status
                    </button>
                    <div className="mp-status-row">
                        <span className="mp-status-chip"><div className="mp-status-chip-dot" />Node 01 Active</span>
                        <span className="mp-status-chip"><div className="mp-status-chip-dot" />Secure Channel v4</span>
                        <span className="mp-status-chip"><div className="mp-status-chip-dot" />Data Preserved</span>
                    </div>
                </div>
            </div>

            <div className="mp-foot">
                <span className="mp-foot-l">AI-Core Resilience Protocol v2.4 · NwSSU CCIS</span>
                <div className="mp-foot-r">
                    <div className="mp-foot-dot" />
                    {ts}
                </div>
            </div>
        </div>
    );
};

export default MaintenanceScreen;
