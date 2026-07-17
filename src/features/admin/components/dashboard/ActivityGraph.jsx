// frontend/src/features/admin/components/dashboard/ActivityGraph.jsx

import React, { useMemo, useState } from 'react';

const W = 380;
const H = 240;

const CATEGORY_CONFIG = {
    'IT SUPPORT': { color: '#00f5ff', label: 'IT' },
    'REGISTRAR': { color: '#9d4edd', label: 'REG' },
    'FINANCE': { color: '#ff8c00', label: 'FIN' },
    'ACADEMIC AFFAIRS': { color: '#00ff88', label: 'ACA' },
};

const HUB_POSITIONS = [
    { x: W * 0.50, y: H * 0.50, key: 'center' },
    { x: W * 0.18, y: H * 0.22, key: 'IT SUPPORT' },
    { x: W * 0.82, y: H * 0.22, key: 'REGISTRAR' },
    { x: W * 0.20, y: H * 0.78, key: 'FINANCE' },
    { x: W * 0.80, y: H * 0.78, key: 'ACADEMIC AFFAIRS' },
];

function buildNodes(tickets) {
    const counts = {};
    tickets.forEach(t => {
        const cat = t.department ?? 'REGISTRAR';
        counts[cat] = (counts[cat] || 0) + 1;
    });

    const recent = tickets
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 8);

    return { counts, recent };
}

const ActivityGraph = ({ tickets = [] }) => {
    const { counts, recent } = useMemo(() => buildNodes(tickets), [tickets]);
    const [tooltip, setTooltip] = useState(null);

    const center = HUB_POSITIONS[0];
    const hubs = HUB_POSITIONS.slice(1);

    const showTip = (x, y, line1, line2) => {
        const clampedX = Math.min(Math.max(x, 55), W - 55);
        setTooltip({ x: clampedX, y, line1, line2 });
    };
    const hideTip = () => setTooltip(null);

    return (
        <svg
            viewBox={`0 0 ${W} ${H}`}
            width="100%"
            height="100%"
            aria-hidden="true"
            role="presentation"
            style={{ overflow: 'visible' }}
        >
            <defs>
                {hubs.map(hub => {
                    const cfg = CATEGORY_CONFIG[hub.key] ?? { color: '#4a7a94' };
                    return (
                        <radialGradient key={hub.key} id={`grad-${hub.key.replace(/\s/g, '-')}`} cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor={cfg.color} stopOpacity="0.25" />
                            <stop offset="100%" stopColor={cfg.color} stopOpacity="0" />
                        </radialGradient>
                    );
                })}
            </defs>

            {/* Spoke lines hub → center */}
            {hubs.map(hub => {
                const cfg = CATEGORY_CONFIG[hub.key] ?? { color: '#4a7a94' };
                const count = counts[hub.key] || 0;
                return (
                    <line
                        key={`spoke-${hub.key}`}
                        x1={hub.x} y1={hub.y}
                        x2={center.x} y2={center.y}
                        stroke={cfg.color}
                        strokeWidth={count > 0 ? 1 : 0.4}
                        strokeOpacity={count > 0 ? 0.35 : 0.12}
                        strokeDasharray={count > 0 ? 'none' : '3,4'}
                    />
                );
            })}

            {/* Ticket nodes along spokes */}
            {recent.map((t, i) => {
                const cat = t.department ?? 'REGISTRAR';
                const hub = hubs.find(h => h.key === cat) ?? hubs[1];
                const cfg = CATEGORY_CONFIG[cat] ?? { color: '#4a7a94' };
                const pct = 0.25 + (i % 3) * 0.22;
                const x = center.x + (hub.x - center.x) * pct;
                const y = center.y + (hub.y - center.y) * pct;
                const isOpen = t.ticket_status === 'OPEN';
                const subject = t.issue_subject || cat;

                return (
                    <g
                        key={t.ticket_id ?? i}
                        style={{ cursor: 'default' }}
                        onMouseEnter={() => showTip(x, y - 14, subject.length > 22 ? subject.slice(0, 22) + '…' : subject, t.ticket_status)}
                        onMouseLeave={hideTip}
                    >
                        <title>{subject} — {t.ticket_status}</title>
                        <circle
                            cx={x} cy={y} r={isOpen ? 5 : 3.5}
                            fill={cfg.color}
                            fillOpacity={isOpen ? 0.9 : 0.4}
                            stroke={cfg.color}
                            strokeWidth={1}
                            strokeOpacity={0.6}
                        />
                        {isOpen && (
                            <circle
                                cx={x} cy={y} r={8}
                                fill="none"
                                stroke={cfg.color}
                                strokeWidth={0.8}
                                strokeOpacity={0.3}
                            />
                        )}
                    </g>
                );
            })}

            {/* Category hub circles */}
            {hubs.map(hub => {
                const cfg = CATEGORY_CONFIG[hub.key] ?? { color: '#4a7a94', label: '—' };
                const count = counts[hub.key] || 0;
                const r = count > 0 ? 20 : 14;

                return (
                    <g
                        key={`hub-${hub.key}`}
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => showTip(hub.x, hub.y - r - 14, hub.key, `${count} ticket${count !== 1 ? 's' : ''}`)}
                        onMouseLeave={hideTip}
                    >
                        <circle
                            cx={hub.x} cy={hub.y} r={r + 8}
                            fill={`url(#grad-${hub.key.replace(/\s/g, '-')})`}
                        />
                        <circle
                            cx={hub.x} cy={hub.y} r={r}
                            fill="var(--bg-surface)"
                            stroke={cfg.color}
                            strokeWidth={count > 0 ? 1.5 : 0.8}
                            strokeOpacity={count > 0 ? 0.8 : 0.3}
                        />
                        <text
                            x={hub.x} y={hub.y - 3}
                            textAnchor="middle"
                            fontFamily="var(--font-terminal)"
                            fontSize="8"
                            fontWeight="600"
                            fill={cfg.color}
                            fillOpacity={count > 0 ? 1 : 0.4}
                        >
                            {cfg.label}
                        </text>
                        <text
                            x={hub.x} y={hub.y + 9}
                            textAnchor="middle"
                            fontFamily="var(--font-terminal)"
                            fontSize="9"
                            fontWeight="700"
                            fill={cfg.color}
                        >
                            {count}
                        </text>
                    </g>
                );
            })}

            {/* Central node */}
            <circle
                cx={center.x} cy={center.y} r={22}
                fill="var(--bg-surface)"
                stroke="var(--accent-light)"
                strokeWidth={1.5}
                strokeOpacity={0.5}
            />
            <circle
                cx={center.x} cy={center.y} r={30}
                fill="none"
                stroke="var(--accent-light)"
                strokeWidth={0.5}
                strokeOpacity={0.15}
                strokeDasharray="3,5"
            />
            <text
                x={center.x} y={center.y - 4}
                textAnchor="middle"
                fontFamily="var(--font-terminal)"
                fontSize="7"
                letterSpacing="1"
                fill="var(--accent-light)"
            >
                TRIAGE
            </text>
            <text
                x={center.x} y={center.y + 8}
                textAnchor="middle"
                fontFamily="var(--font-terminal)"
                fontSize="11"
                fontWeight="700"
                fill="var(--accent-light)"
            >
                {tickets.length}
            </text>

            {/* Hover tooltip */}
            {tooltip && (
                <g style={{ pointerEvents: 'none' }}>
                    <rect
                        x={tooltip.x - 54} y={tooltip.y - 24}
                        width={108} height={30}
                        rx={4}
                        fill="rgba(5,8,22,0.95)"
                        stroke="rgba(0,245,255,0.3)"
                        strokeWidth={0.8}
                    />
                    <text
                        x={tooltip.x} y={tooltip.y - 11}
                        textAnchor="middle"
                        fontFamily="var(--font-terminal)"
                        fontSize="8"
                        fontWeight="600"
                        fill="#00f5ff"
                    >
                        {tooltip.line1}
                    </text>
                    <text
                        x={tooltip.x} y={tooltip.y + 1}
                        textAnchor="middle"
                        fontFamily="var(--font-terminal)"
                        fontSize="7"
                        fill="#8fb3c8"
                    >
                        {tooltip.line2}
                    </text>
                </g>
            )}
        </svg>
    );
};

export default React.memo(ActivityGraph);