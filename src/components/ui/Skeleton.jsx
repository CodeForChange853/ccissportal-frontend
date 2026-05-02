// frontend/src/components/ui/Skeleton.jsx


import React from 'react';

const pulse = {
    background: 'linear-gradient(90deg, var(--bg-depth) 25%, var(--bg-surface) 50%, var(--bg-depth) 75%)',
    backgroundSize: '200% 100%',
    animation: 'skeleton-pulse 1.4s ease-in-out infinite',
    borderRadius: 4,
};

// Inject keyframes once
if (typeof document !== 'undefined' && !document.getElementById('skeleton-style')) {
    const s = document.createElement('style');
    s.id = 'skeleton-style';
    s.textContent = `@keyframes skeleton-pulse { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`;
    document.head.appendChild(s);
}

const Box = ({ w = '100%', h = 12, style = {} }) => (
    <div style={{ ...pulse, width: w, height: h, borderRadius: 4, ...style }} />
);

const Row = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
        <Box w="30%" h={11} />
        <Box w="15%" h={11} />
        <Box w="15%" h={11} />
        <Box w="20%" h={11} />
        <div style={{ marginLeft: 'auto' }}><Box w={60} h={28} style={{ borderRadius: 6 }} /></div>
    </div>
);

const Card = () => (
    <div style={{ background: 'var(--bg-depth)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '16px' }}>
        <Box w="40%" h={13} style={{ marginBottom: 10 }} />
        <Box w="80%" h={10} style={{ marginBottom: 6 }} />
        <Box w="60%" h={10} style={{ marginBottom: 14 }} />
        <Box w="25%" h={9} />
    </div>
);

const KpiTile = () => (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '14px 16px' }}>
        <Box w="55%" h={9} style={{ marginBottom: 8 }} />
        <Box w="40%" h={22} />
    </div>
);

const KpiStrip = ({ count = 4 }) => (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${count}, 1fr)`, gap: 12 }}>
        {Array.from({ length: count }).map((_, i) => <KpiTile key={i} />)}
    </div>
);

const Grid = ({ cols = 3, count = 6 }) => (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12 }}>
        {Array.from({ length: count }).map((_, i) => <Card key={i} />)}
    </div>
);

const Table = ({ rows = 5, cols = 4 }) => (
    <div>
        {/* Header */}
        <div style={{ display: 'flex', gap: 16, padding: '10px 0', borderBottom: '1px solid var(--border-default)', marginBottom: 4 }}>
            {Array.from({ length: cols }).map((_, i) => (
                <Box key={i} w={`${100 / cols}%`} h={9} />
            ))}
        </div>
        {Array.from({ length: rows }).map((_, i) => <Row key={i} />)}
    </div>
);

const PageHeader = () => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
            <Box w={220} h={18} style={{ marginBottom: 10 }} />
            <Box w={320} h={11} />
        </div>
        <Box w={100} h={32} style={{ borderRadius: 6 }} />
    </div>
);

const Skeleton = { Box, Row, Card, KpiTile, KpiStrip, Grid, Table, PageHeader };
export default Skeleton;