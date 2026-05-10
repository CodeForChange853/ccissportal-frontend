import React, { useRef, useEffect, useCallback, useMemo } from 'react';

const SIZE = 300;
const R = SIZE / 2;

const RING_SCALES = [0.28, 0.52, 0.76, 1.0];
const RING_ALPHA = [0.07, 0.09, 0.11, 0.18];

function buildBlips(stats, tickets, requests) {
    const blips = [];

    const pending = requests.filter(r => r.review_status === 'PENDING').slice(0, 4);
    const openTix = tickets.filter(t => t.ticket_status === 'OPEN').slice(0, 5);
    const critTix = tickets.filter(t => t.ticket_status === 'OPEN' && t.ai_predicted_category?.includes('IT')).slice(0, 2);

    pending.forEach((_, i) => {
        blips.push({
            angle: (i * 72 + 20) * (Math.PI / 180),
            radius: 0.35 + i * 0.08,
            color: '#00f5ff',
            size: 3.5,
        });
    });

    openTix.forEach((t, i) => {
        const isHigh = t.ai_predicted_category?.includes('IT') || t.ai_predicted_category?.includes('FINANCE');
        blips.push({
            angle: (i * 58 + 110) * (Math.PI / 180),
            radius: 0.42 + (i % 3) * 0.14,
            color: isHigh ? '#ff2d55' : '#ff8c00',
            size: isHigh ? 4 : 3,
        });
    });

    if (stats?.total_faculty) {
        blips.push({
            angle: 260 * (Math.PI / 180),
            radius: 0.55,
            color: '#9d4edd',
            size: 3,
        });
    }

    return blips;
}

function drawRadarFrame(ctx) {
    ctx.clearRect(0, 0, SIZE, SIZE);

    RING_SCALES.forEach((scale, i) => {
        ctx.beginPath();
        ctx.arc(R, R, R * scale, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,245,255,${RING_ALPHA[i]})`;
        ctx.lineWidth = scale === 1.0 ? 1 : 0.5;
        ctx.stroke();
    });

    [[R, 0, R, SIZE], [0, R, SIZE, R],
    [0, 0, SIZE, SIZE], [SIZE, 0, 0, SIZE]].forEach(([x1, y1, x2, y2]) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
        ctx.strokeStyle = 'rgba(0,245,255,0.07)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
    });
}

function drawBlips(ctx, blips) {
    blips.forEach(({ angle, radius, color, size }) => {
        const x = R + Math.cos(angle) * R * radius;
        const y = R + Math.sin(angle) * R * radius;

        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.beginPath();
        ctx.arc(x, y, size + 3, 0, Math.PI * 2);
        ctx.strokeStyle = color.replace(')', ',0.25)').replace('rgb(', 'rgba(').replace('#', 'rgba(').slice(0, 4) === 'rgba'
            ? color
            : color + '40';
        ctx.lineWidth = 0.8;
        ctx.stroke();
    });
}

const RadarScanner = ({ stats = null, tickets = [], requests = [] }) => {
    const canvasRef = useRef(null);

    const blips = useMemo(
        () => buildBlips(stats, tickets, requests),
        [stats, tickets, requests]
    );

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        drawRadarFrame(ctx);
        drawBlips(ctx, blips);
    }, [blips]);

    useEffect(() => { draw(); }, [draw]);

    const openCount = tickets.filter(t => t.ticket_status === 'OPEN').length;
    const pendingCount = requests.filter(r => r.review_status === 'PENDING').length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div
                aria-hidden="true"
                role="presentation"
                className="radar-container"
                style={{ width: SIZE, height: SIZE, position: 'relative' }}
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
                    <div className="radar-sweep" />
                </div>
                <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%,-50%)',
                    width: 6, height: 6, borderRadius: '50%',
                    background: 'var(--neon-cyan)',
                    boxShadow: '0 0 8px var(--neon-cyan), 0 0 16px var(--neon-cyan)',
                }} />
            </div>

            <div style={{
                display: 'flex', gap: 16,
                fontFamily: 'var(--font-terminal)',
                fontSize: '0.58rem',
                letterSpacing: '0.10em',
            }}>
                <span style={{ color: '#00f5ff' }}>◆ {pendingCount} ENROLL</span>
                <span style={{ color: '#ff2d55' }}>◆ {openCount} OPEN</span>
                <span style={{ color: '#9d4edd' }}>◆ FACULTY</span>
            </div>
        </div>
    );
};

export default React.memo(RadarScanner);