import React, { useEffect, useState } from 'react';

const MaintenanceScreen = () => {
    const [reason, setReason] = useState('');
    const [message, setMessage] = useState('');
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 2, minutes: 45, seconds: 0 });

    useEffect(() => {
        const savedReason = sessionStorage.getItem('maintenance_reason');
        const savedMsg = sessionStorage.getItem('maintenance_message');
        setReason(savedReason || '');
        setMessage(savedMsg || '');

        // Simulated Countdown Logic (Decrements every second)
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                let { days, hours, minutes, seconds } = prev;
                if (seconds > 0) seconds--;
                else {
                    seconds = 59;
                    if (minutes > 0) minutes--;
                    else {
                        minutes = 59;
                        if (hours > 0) hours--;
                        else if (days > 0) {
                            days--;
                            hours = 23;
                        }
                    }
                }
                return { days, hours, minutes, seconds };
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const displayReason = reason || 'Neural Infrastructure Recalibration';
    const displayMsg = message || 'Our NexEnroll is currently undergoing deep-layer synchronization to optimize semestral load balancing and ensure total data integrity. We are evolving to provide you with a faster, more intelligent academic journey.';

    const TimeUnit = ({ label, value }) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{
                position: 'relative',
                width: '70px', height: '85px',
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.4), inset 0 0 20px rgba(157, 78, 221, 0.05)',
                overflow: 'hidden'
            }}>
                {/* Horizontal Flip Line */}
                <div style={{
                    position: 'absolute', top: '50%', left: 0, right: 0,
                    height: '1px', background: 'rgba(255,255,255,0.1)', zIndex: 3
                }} />

                <span style={{
                    fontSize: '2.5rem',
                    fontWeight: 800,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: '#9d4edd',
                    textShadow: '0 0 15px rgba(157, 78, 221, 0.4)',
                    letterSpacing: '-0.05em'
                }}>
                    {String(value).padStart(2, '0')}
                </span>
            </div>
            <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(255, 255, 255, 0.4)'
            }}>
                {label}
            </span>
        </div>
    );

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#040508',
            padding: '1rem',
            fontFamily: "'Inter', system-ui, sans-serif",
            color: '#fff',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Background Aesthetics */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(circle at 50% 30%, rgba(157, 78, 221, 0.15) 0%, transparent 70%)',
                zIndex: 0
            }} />
            <div className="mesh-grid" />

            <div style={{
                position: 'relative', zIndex: 10,
                width: '100%', maxWidth: '900px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
            }}>

                {/* AI Core Visual */}
                <div style={{ position: 'relative', marginBottom: '1rem', height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ transform: 'scale(0.65)', position: 'relative' }}>
                        <div className="core-glow" />
                        <div className="ring ring-outer" />
                        <div className="ring ring-inner" />
                        <div className="core-orb">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9d4edd" strokeWidth="1.5">
                                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div style={{ width: '100%' }}>
                    <h2 style={{
                        fontSize: '0.8rem', fontWeight: 800, color: '#9d4edd',
                        letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '0.5rem'
                    }}>
                        Maintenance Protocol
                    </h2>

                    <h1 style={{
                        fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
                        fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1,
                        marginBottom: '0.5rem', color: '#fff'
                    }}>
                        We'll be back soon
                    </h1>

                    {/* Reason Badge */}
                    <div style={{
                        display: 'inline-block',
                        padding: '6px 16px',
                        background: 'rgba(157, 78, 221, 0.1)',
                        border: '1px solid rgba(157, 78, 221, 0.3)',
                        borderRadius: '20px',
                        color: '#c77dff',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        marginBottom: '1rem',
                        boxShadow: '0 0 20px rgba(157, 78, 221, 0.2)'
                    }}>
                        <span style={{ marginRight: '8px', display: 'inline-block', animation: 'pulse 2s infinite' }}>●</span>
                        {displayReason}
                    </div>

                    {/* Message Box */}
                    <div style={{
                        position: 'relative',
                        padding: '1.25rem 2rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        backdropFilter: 'blur(12px)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        marginBottom: '2rem',
                        maxWidth: '700px',
                        margin: '0 auto 2.5rem auto',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3), inset 0 0 20px rgba(157, 78, 221, 0.05)',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            position: 'absolute', top: 0, left: 0, width: '4px', height: '100%',
                            background: 'linear-gradient(to bottom, #9d4edd, #e0aaff)'
                        }} />
                        <p style={{
                            fontSize: '1.1rem',
                            color: 'rgba(255,255,255,0.9)',
                            fontWeight: 300,
                            lineHeight: 1.6,
                            margin: 0,
                            fontFamily: "'Inter', sans-serif"
                        }}>
                            {displayMsg}
                        </p>
                    </div>

                    {/* Countdown Timer Wrapper */}
                    <div style={{
                        display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '2.5rem'
                    }}>
                        <TimeUnit label="Days" value={timeLeft.days} />
                        <TimeUnit label="Hours" value={timeLeft.hours} />
                        <TimeUnit label="Minutes" value={timeLeft.minutes} />
                        <TimeUnit label="Seconds" value={timeLeft.seconds} />
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                background: '#fff', color: '#000', border: 'none',
                                padding: '12px 40px', borderRadius: '12px',
                                fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: '0 10px 30px rgba(255,255,255,0.1)'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 40px rgba(255,255,255,0.2)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(255,255,255,0.1)'; }}
                        >
                            REFRESH SYSTEM STATUS
                        </button>

                        <div style={{
                            display: 'flex', gap: '32px', opacity: 0.3,
                            fontSize: '0.65rem', fontFamily: 'monospace', letterSpacing: '0.1em'
                        }}>
                            <span>● NODE_01_ACTIVE</span>
                            <span>● SECURE_CHANNEL_v4</span>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .core-glow {
                    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                    width: 160px; height: 160px;
                    background: radial-gradient(circle, rgba(157, 78, 221, 0.4) 0%, transparent 70%);
                    filter: blur(30px); animation: pulse 4s ease-in-out infinite;
                }
                .ring {
                    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                    border-radius: 50%; border: 1px solid rgba(157, 78, 221, 0.15);
                }
                .ring-outer { width: 160px; height: 160px; border-top-color: #9d4edd; animation: spin 12s linear infinite; }
                .ring-inner { width: 130px; height: 130px; border-bottom-color: #9d4edd; animation: spin 8s linear infinite reverse; }
                .core-orb {
                    width: 90px; height: 90px; border-radius: 50%;
                    background: linear-gradient(135deg, #10002b 0%, #000 100%);
                    border: 1px solid rgba(255,255,255,0.1);
                    display: flex; alignItems: center; justifyContent: center;
                    position: relative; zIndex: 2;
                }
                @keyframes spin { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }
                @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
                .mesh-grid {
                    position: absolute; inset: 0;
                    background-image: linear-gradient(rgba(157,78,221,0.05) 1px, transparent 1px), 
                                      linear-gradient(90deg, rgba(157,78,221,0.05) 1px, transparent 1px);
                    background-size: 50px 50px;
                    mask-image: radial-gradient(circle at 50% 30%, black, transparent 80%);
                    opacity: 0.4; pointer-events: none;
                }
            `}</style>
        </div>
    );
};

export default MaintenanceScreen;