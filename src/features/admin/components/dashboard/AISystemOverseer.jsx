import React, { useState, useEffect } from 'react';

const STATUS = {
    good: { 
        label: 'STABLE', 
        color: '#4ade80', 
        glow: 'rgba(74,222,128,0.4)', 
        bg: 'rgba(74,222,128,0.05)',
        accent: 'var(--color-success)'
    },
    warning: { 
        label: 'DEGRADED', 
        color: '#fbbf24', 
        glow: 'rgba(251,191,36,0.4)', 
        bg: 'rgba(251,191,36,0.05)',
        accent: 'var(--color-warning)'
    },
    critical: { 
        label: 'CRITICAL', 
        color: '#f87171', 
        glow: 'rgba(248,113,113,0.6)', 
        bg: 'rgba(248,113,113,0.08)',
        accent: 'var(--color-danger)'
    },
};

const MetricRow = ({ label, value, color, icon }) => (
    <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '8px 0', 
        borderBottom: '1px solid var(--border-subtle)' 
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {icon && <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{icon}</span>}
            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</span>
        </div>
        <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-terminal)', fontWeight: 800, color: color || 'var(--text-primary)' }}>{value}</span>
    </div>
);

export default function AISystemOverseer({ systemAlert, stats, tickets = [], telemetry }) {
    const [isHovered, setIsHovered] = useState(false);
    const [pulse, setPulse] = useState(1);

    useEffect(() => {
        const interval = setInterval(() => {
            setPulse(p => p === 1 ? 1.04 : 1);
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    const statusKey = systemAlert ? 'critical' : (stats?.pendingEnrollments > 20 ? 'warning' : 'good');
    const s = STATUS[statusKey];
    
    const openTickets = tickets.filter(t => t.status !== 'closed' && t.ticket_status !== 'CLOSED').length;
    const confidence = telemetry?.accuracy_percentage || 98.4;
    
    // Smooth interaction logic: 
    // We use a "bridge" div to prevent the hover from breaking when moving from orb to panel
    return (
        <div 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ 
                position: 'relative', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                width: '100%',
                padding: '20px 0',
                perspective: '1000px'
            }}
        >
            {/* ── AI Core Orb (Luxury Watch / Tesla Aesthetic) ────────────────── */}
            <div 
                style={{
                    position: 'relative',
                    width: 160,
                    height: 160,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 10,
                    transition: 'transform 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
                    transform: isHovered ? 'translateY(-40px) rotateX(10deg)' : 'translateY(0) rotateX(0)'
                }}
            >
                {/* Outer Dial (Watch Face Ticks) */}
                <svg width="160" height="160" style={{ position: 'absolute' }}>
                    {[...Array(12)].map((_, i) => (
                        <line 
                            key={i}
                            x1="80" y1="10" x2="80" y2="18"
                            stroke="rgba(255,255,255,0.15)"
                            strokeWidth="2"
                            transform={`rotate(${i * 30} 80 80)`}
                        />
                    ))}
                    <circle 
                        cx="80" cy="80" r="74" 
                        fill="none" 
                        stroke="rgba(255,255,255,0.03)" 
                        strokeWidth="1" 
                    />
                </svg>

                {/* AI Confidence Ring */}
                <svg width="160" height="160" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
                    <circle 
                        cx="80" cy="80" r="70" 
                        fill="none" 
                        stroke="var(--bg-depth)" 
                        strokeWidth="6" 
                        opacity="0.3"
                    />
                    <circle 
                        cx="80" cy="80" r="70" 
                        fill="none" 
                        stroke={s.color} 
                        strokeWidth="6" 
                        strokeDasharray={440}
                        strokeDashoffset={440 - (440 * (confidence / 100))}
                        strokeLinecap="round"
                        style={{ 
                            transition: 'stroke-dashoffset 2s cubic-bezier(0.19, 1, 0.22, 1)',
                            filter: `drop-shadow(0 0 8px ${s.glow})` 
                        }}
                    />
                </svg>

                {/* Inner Glassmorphic Layers */}
                <div style={{
                    width: 110,
                    height: 110,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isHovered ? `0 0 50px ${s.glow}60` : `0 0 20px ${s.glow}20`,
                    transition: 'all 0.4s cubic-bezier(0.19, 1, 0.22, 1)',
                    transform: `scale(${isHovered ? 1.05 : pulse})`
                }}>
                    {/* Multi-layered refraction effect */}
                    <div style={{
                        position: 'absolute',
                        inset: 4,
                        borderRadius: '50%',
                        border: '1px solid rgba(255,255,255,0.05)',
                        background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 70%)'
                    }} />

                    {/* Central Pulsing Heart */}
                    <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${s.color} 0%, ${s.bg} 100%)`,
                        boxShadow: `0 0 30px ${s.glow}, inset 0 0 10px rgba(255,255,255,0.2)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: statusKey === 'critical' ? 'core-alarm 0.5s infinite' : 'none'
                    }}>
                        <div style={{ 
                            width: 10, height: 10, borderRadius: '50%', background: '#fff', 
                            boxShadow: '0 0 12px #fff',
                            animation: 'core-eye 5s infinite' 
                        }} />
                    </div>
                    
                    <div style={{
                        position: 'absolute',
                        bottom: '18%',
                        fontFamily: 'var(--font-terminal)',
                        fontSize: '0.7rem',
                        fontWeight: 900,
                        color: '#fff',
                        textShadow: `0 0 10px ${s.glow}`,
                        letterSpacing: '0.05em'
                    }}>{Math.round(confidence)}%</div>
                </div>

                {/* Hover Bridge (Invisible connector to prevent flicker) */}
                {isHovered && <div style={{ position: 'absolute', bottom: -50, width: '100%', height: 60 }} />}
            </div>

            {/* ── Status Info (Hidden on hover) ─────────────────────── */}
            <div style={{ 
                marginTop: 20, 
                textAlign: 'center',
                opacity: isHovered ? 0 : 1,
                transform: isHovered ? 'translateY(10px)' : 'translateY(0)',
                transition: 'all 0.3s'
            }}>
                <div style={{ 
                    fontFamily: 'var(--font-terminal)', 
                    fontSize: '0.7rem', 
                    fontWeight: 900, 
                    color: s.color,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase'
                }}>
                    AI {s.label}
                </div>
                <div style={{ 
                    fontSize: '0.52rem', 
                    color: 'var(--text-muted)', 
                    marginTop: 4,
                    letterSpacing: '0.05em'
                }}>
                    SCANNING TELEMETRY...
                </div>
            </div>

            {/* ── Holographic Telemetry Panel (Tesla-style) ─────────── */}
            <div style={{
                position: 'absolute',
                bottom: 20,
                width: '100%',
                background: 'linear-gradient(to bottom, rgba(20,20,25,0.95), rgba(10,10,15,0.98))',
                borderRadius: 24,
                border: `1px solid ${s.color}30`,
                padding: '24px',
                zIndex: 5,
                boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 20px ${s.glow}15`,
                pointerEvents: isHovered ? 'auto' : 'none',
                opacity: isHovered ? 1 : 0,
                transform: isHovered ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
                transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
                backdropFilter: 'blur(20px)',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h4 style={{ 
                        fontFamily: 'var(--font-terminal)', 
                        fontSize: '0.75rem', 
                        fontWeight: 900, 
                        margin: 0,
                        color: 'var(--text-primary)',
                        letterSpacing: '0.1em'
                    }}>SYSTEM_TELEMETRY.LOG</h4>
                    <div style={{ 
                        padding: '3px 8px', borderRadius: 4, 
                        background: `${s.color}20`, 
                        color: s.color, 
                        fontSize: '0.55rem', 
                        fontWeight: 900,
                        fontFamily: 'var(--font-terminal)'
                    }}>V2.0.4</div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <MetricRow label="AI CONFIDENCE" value={`${confidence}%`} color="var(--color-success)" />
                    <MetricRow label="ACTIVE TICKETS" value={openTickets} color={openTickets > 0 ? 'var(--color-warning)' : 'var(--color-success)'} />
                    <MetricRow label="PENDING QUEUE" value={stats?.pendingEnrollments || 0} />
                    <MetricRow label="PROCESSOR LOAD" value={systemAlert ? 'CRITICAL' : 'OPTIMAL'} color={systemAlert ? 'var(--color-danger)' : 'var(--color-success)'} />
                    <MetricRow label="SYNC LATENCY" value="12ms" color="var(--color-success)" />
                </div>
                
                <div style={{ 
                    marginTop: 16, 
                    padding: '8px',
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.03)',
                    fontSize: '0.55rem',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-terminal)',
                    textAlign: 'center',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    {statusKey === 'good' ? '>> All modules operating within normal parameters.' : '>> Warning: Anomalies detected in ticket backlog.'}
                </div>
            </div>

            <style>{`
                @keyframes core-eye {
                    0%, 85%, 100% { transform: scale(1); opacity: 1; }
                    90%, 95% { transform: scale(1.3, 0.05); opacity: 0.6; }
                }
                @keyframes core-alarm {
                    0%, 100% { filter: brightness(1) drop-shadow(0 0 20px ${s.glow}); transform: scale(1); }
                    50% { filter: brightness(1.6) drop-shadow(0 0 40px ${s.color}); transform: scale(1.05); }
                }
            `}</style>
        </div>
    );
}

export function OverseerCornerBadge({ systemAlert, stats }) {
    const statusKey = systemAlert ? 'critical' : (stats?.pendingEnrollments > 20 ? 'warning' : null);
    if (!statusKey) return null;

    const s = STATUS[statusKey];
    return (
        <div style={{
            position: 'fixed',
            bottom: 24, right: 24,
            zIndex: 9999,
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 16px',
            background: 'var(--bg-sidebar)',
            border: `1px solid ${s.color}`,
            borderRadius: 16,
            boxShadow: `0 0 30px ${s.glow}40`,
            backdropFilter: 'blur(12px)',
            animation: 'corner-float 3s ease-in-out infinite',
            cursor: 'default',
        }}>
            <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: s.color,
                boxShadow: `0 0 10px ${s.color}`,
                animation: 'pulse-dot 1s infinite'
            }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.65rem', fontWeight: 900, color: s.color }}>AI.{s.label}</span>
                <span style={{ fontSize: '0.5rem', color: 'var(--text-muted)' }}>Action Required</span>
            </div>
            <style>{`
                @keyframes corner-float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                @keyframes pulse-dot {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
            `}</style>
        </div>
    );
}
