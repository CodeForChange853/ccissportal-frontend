import React, { useRef, useEffect, useCallback, useMemo } from 'react';

const SIZE = 280;
const R = SIZE / 2;

const RING_SCALES = [0.28, 0.52, 0.76, 1.0];
const RING_ALPHA = [0.07, 0.09, 0.11, 0.18];

// Infrastructure Blips Configuration
// 1: Backend (API), 2: Database, 3: Frontend (Host)
function buildInfraBlips(health) {
    const { status, frontendStatus, dbStatus } = health || {};
    const blips = [];

    // Blip 1: Backend API (Top Right)
    blips.push({
        id: 'api',
        angle: (320) * (Math.PI / 180),
        radius: 0.65,
        color: status === 'ONLINE' ? 'var(--neon-cyan)' : '#ff2d55',
        size: 5,
        label: 'API',
        active: status === 'ONLINE'
    });

    // Blip 2: Database (Bottom Right)
    blips.push({
        id: 'db',
        angle: (45) * (Math.PI / 180),
        radius: 0.75,
        color: dbStatus === 'ONLINE' ? '#9d4edd' : '#ff2d55',
        size: 5,
        label: 'DB',
        active: dbStatus === 'ONLINE'
    });

    // Blip 3: Frontend Host (Left)
    blips.push({
        id: 'host',
        angle: (200) * (Math.PI / 180),
        radius: 0.55,
        color: frontendStatus === 'ONLINE' ? '#10b981' : '#ff2d55',
        size: 5,
        label: 'HOST',
        active: frontendStatus === 'ONLINE'
    });

    return blips;
}

function drawRadarFrame(ctx, isCritical) {
    ctx.clearRect(0, 0, SIZE, SIZE);
    const accentColor = isCritical ? '255,45,85' : '0,245,255';

    RING_SCALES.forEach((scale, i) => {
        ctx.beginPath();
        ctx.arc(R, R, R * scale, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${accentColor},${RING_ALPHA[i]})`;
        ctx.lineWidth = scale === 1.0 ? 1.5 : 0.5;
        ctx.stroke();
    });

    [[R, 0, R, SIZE], [0, R, SIZE, R],
    [0, 0, SIZE, SIZE], [SIZE, 0, 0, SIZE]].forEach(([x1, y1, x2, y2]) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(${accentColor},0.07)`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
    });
}

function drawBlips(ctx, blips) {
    blips.forEach(({ angle, radius, color, size, label, active }) => {
        const x = R + Math.cos(angle) * R * radius;
        const y = R + Math.sin(angle) * R * radius;

        if (active) {
            ctx.shadowColor = color;
            ctx.shadowBlur = 12;
        }
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label
        ctx.font = '600 8px var(--font-terminal)';
        ctx.fillStyle = color;
        ctx.fillText(label, x + 8, y + 3);

        // Outer pulse for active blips
        if (active) {
            ctx.beginPath();
            ctx.arc(x, y, size + 4, 0, Math.PI * 2);
            ctx.strokeStyle = color.includes('var') ? 'rgba(0,245,255,0.2)' : color + '30';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    });
}

const RadarScanner = ({ health }) => {
    const canvasRef = useRef(null);
    const { status, errorType, latency, frontendStatus, dbStatus } = health || {
        status: 'CHECKING',
        latency: 0,
        frontendStatus: 'ONLINE',
        dbStatus: 'ONLINE'
    };

    const isCritical = status === 'OFFLINE' || status === 'DEPLOYING' || status === 'MAINTENANCE';

    const blips = useMemo(
        () => buildInfraBlips(health),
        [health]
    );

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        drawRadarFrame(ctx, isCritical);
        drawBlips(ctx, blips);
    }, [blips, isCritical]);

    useEffect(() => { draw(); }, [draw]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%' }}>
            <div
                aria-hidden="true"
                role="presentation"
                className={`radar-container ${isCritical ? 'critical' : ''}`}
                style={{ 
                    width: SIZE, 
                    height: SIZE, 
                    position: 'relative',
                    boxShadow: isCritical ? '0 0 40px rgba(255,45,85,0.15)' : 'none',
                    transition: 'all 0.5s ease'
                }}
            >
                <canvas
                    ref={canvasRef}
                    width={SIZE}
                    height={SIZE}
                    style={{ position: 'absolute', inset: 0 }}
                />
                <div
                    className="radar-sweep-container"
                    style={{ position: 'absolute', inset: 0, width: SIZE, height: SIZE }}
                >
                    <div className={`radar-sweep ${isCritical ? 'critical stutter' : ''}`} />
                </div>
                
                {/* Center Core */}
                <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%,-50%)',
                    width: 8, height: 8, borderRadius: '50%',
                    background: isCritical ? '#ff2d55' : 'var(--neon-cyan)',
                    boxShadow: isCritical 
                        ? '0 0 12px #ff2d55, 0 0 24px #ff2d55' 
                        : '0 0 12px var(--neon-cyan), 0 0 24px var(--neon-cyan)',
                    zIndex: 2,
                    transition: 'all 0.5s ease'
                }} />
            </div>

            {/* Server Rack Status Terminal */}
            <div style={{
                width: '100%',
                background: 'rgba(0,0,0,0.25)',
                border: `1px solid ${isCritical ? 'rgba(255,45,85,0.3)' : 'rgba(0,245,255,0.15)'}`,
                borderRadius: 12,
                padding: '12px 16px',
                fontFamily: 'var(--font-terminal)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {isCritical && (
                    <div style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '2px',
                        background: '#ff2d55', animation: 'neural-scan 2s infinite'
                    }} />
                )}
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: status === 'ONLINE' ? 'var(--neon-cyan)' : '#ff2d55', fontSize: '0.62rem', fontWeight: 700 }}>
                            ◆ API {status === 'ONLINE' ? 'CONNECTED' : errorType || 'DISCONNECTED'}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.58rem' }}>
                            {latency > 0 ? `${latency}ms` : '--ms'}
                        </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: dbStatus === 'ONLINE' ? '#9d4edd' : '#ff2d55', fontSize: '0.62rem', fontWeight: 700 }}>
                            ◆ DB {dbStatus === 'ONLINE' ? 'READY' : 'OFFLINE'}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.58rem' }}>
                            SYNC: {dbStatus === 'ONLINE' ? 'ACTIVE' : 'FAILED'}
                        </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: frontendStatus === 'ONLINE' ? '#10b981' : '#ff2d55', fontSize: '0.62rem', fontWeight: 700 }}>
                            ◆ HOST {frontendStatus === 'ONLINE' ? 'STABLE' : 'UNREACHABLE'}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.58rem' }}>
                            VERCEL: {frontendStatus === 'ONLINE' ? 'UP' : 'DOWN'}
                        </span>
                    </div>
                </div>

                {isCritical && (
                    <div style={{ 
                        marginTop: 10, 
                        padding: '4px 8px', 
                        background: 'rgba(255,45,85,0.1)', 
                        border: '1px solid rgba(255,45,85,0.3)',
                        borderRadius: 4,
                        color: '#ff2d55',
                        fontSize: '0.55rem',
                        textAlign: 'center',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        CRITICAL: {status === 'DEPLOYING' ? 'DEPLOYMENT IN PROGRESS' : 'SYSTEM UNREACHABLE'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default React.memo(RadarScanner);