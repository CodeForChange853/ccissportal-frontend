import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSecretaryRefresh } from '../layout/SecretaryLayout';
import { secretaryApi } from '../api/secretaryApi';

const S = {
    page: { display: 'flex', flexDirection: 'column', gap: 24, paddingTop: 24 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 },
    card: {
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 16,
        padding: '20px 22px',
        cursor: 'pointer',
        transition: 'all 0.18s',
        position: 'relative',
        overflow: 'hidden',
    },
    header: {
        fontFamily: 'var(--font-display)',
        fontSize: '1.35rem',
        fontWeight: 800,
        color: 'var(--text-primary)',
        letterSpacing: '-0.02em',
    },
    sub: {
        fontSize: '0.72rem',
        color: 'var(--text-muted)',
        marginTop: 4,
        fontFamily: 'var(--font-code)',
        letterSpacing: '0.05em',
    },
    count: {
        fontSize: '2.4rem',
        fontWeight: 800,
        fontFamily: 'var(--font-display)',
        color: 'var(--accent)',
        letterSpacing: '-0.03em',
        lineHeight: 1,
    },
    label: {
        fontSize: '0.68rem',
        color: 'var(--text-secondary)',
        fontFamily: 'var(--font-code)',
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        marginTop: 6,
    },
    glow: {
        position: 'absolute',
        top: -20, right: -20,
        width: 80, height: 80,
        borderRadius: '50%',
        background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
        pointerEvents: 'none',
    },
};

const StatCard = ({ count, label, path, urgent = false, loading }) => {
    const navigate = useNavigate();
    const [hovered, setHovered] = useState(false);

    return (
        <div
            style={{
                ...S.card,
                borderColor: urgent && count > 0 ? 'var(--border-accent)' : 'var(--border-default)',
                boxShadow: hovered ? 'var(--shadow-accent)' : 'none',
                transform: hovered ? 'translateY(-2px)' : 'none',
            }}
            onClick={() => navigate(path)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div style={S.glow} />
            {loading ? (
                <div style={{ height: 40, background: 'var(--border-default)', borderRadius: 8, animation: 'pulse 1.5s infinite' }} />
            ) : (
                <div style={{ ...S.count, color: urgent && count > 0 ? 'var(--accent)' : 'var(--text-secondary)' }}>
                    {count ?? '—'}
                </div>
            )}
            <div style={S.label}>{label}</div>
        </div>
    );
};

const SecretaryDashboard = () => {
    const tick = useSecretaryRefresh();
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        Promise.allSettled([
            secretaryApi.fetchOJTSubmissions('PENDING'),
            secretaryApi.fetchCompletionRequests('SUBMITTED'),
            secretaryApi.fetchPetitions('PENDING'),
            secretaryApi.fetchMappingDrafts('DRAFT'),
            secretaryApi.fetchActiveCheckouts(),
            secretaryApi.fetchDocumentRequests('PENDING'),
            secretaryApi.fetchOrganizations('PENDING'),
            secretaryApi.fetchBookings('PENDING'),
        ]).then(results => {
            if (cancelled) return;
            const [ojt, inc, pet, map, equip, docs, orgs, bookings] = results;
            setData({
                ojt:      ojt.status      === 'fulfilled' ? ojt.value.length      : null,
                inc:      inc.status      === 'fulfilled' ? inc.value.length      : null,
                petitions:pet.status      === 'fulfilled' ? pet.value.length      : null,
                mapping:  map.status      === 'fulfilled' ? map.value.length      : null,
                equipment:equip.status    === 'fulfilled' ? equip.value.length    : null,
                documents:docs.status     === 'fulfilled' ? docs.value.length     : null,
                orgs:     orgs.status     === 'fulfilled' ? orgs.value.length     : null,
                bookings: bookings.status === 'fulfilled' ? bookings.value.length : null,
            });
            setLoading(false);
        });

        return () => { cancelled = true; };
    }, [tick]);

    const totalPending = Object.values(data).reduce((s, v) => s + (v ?? 0), 0);

    return (
        <div style={S.page}>
            {/* Header */}
            <div>
                <h1 style={S.header}>Secretariat Dashboard</h1>
                <p style={S.sub}>
                    {loading
                        ? 'Loading pending queues…'
                        : `${totalPending} item${totalPending !== 1 ? 's' : ''} pending across all modules`}
                </p>
            </div>

            {/* Pink accent divider */}
            <div style={{
                height: 2,
                background: 'linear-gradient(to right, var(--accent), var(--accent-light), transparent)',
                borderRadius: 2,
            }} />

            {/* Stat cards */}
            <div style={S.grid}>
                <StatCard count={data.ojt}       label="OJT Pending"          path="/portal/secretary/ojt"       urgent loading={loading} />
                <StatCard count={data.inc}        label="INC Requests"         path="/portal/secretary/inc"       urgent loading={loading} />
                <StatCard count={data.petitions}  label="Petitions"            path="/portal/secretary/petitions" urgent loading={loading} />
                <StatCard count={data.mapping}    label="Mapping Drafts"       path="/portal/secretary/mapping"         loading={loading} />
                <StatCard count={data.equipment}  label="Active Checkouts"     path="/portal/secretary/equipment"       loading={loading} />
                <StatCard count={data.documents}  label="Doc Requests"         path="/portal/secretary/documents" urgent loading={loading} />
                <StatCard count={data.orgs}       label="Org Registrations"    path="/portal/secretary/orgs"      urgent loading={loading} />
                <StatCard count={data.bookings}   label="Booking Requests"     path="/portal/secretary/orgs"      urgent loading={loading} />
            </div>

            {/* Accent watermark */}
            <div style={{
                marginTop: 8,
                padding: '16px 20px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 12,
                fontFamily: 'var(--font-code)',
                fontSize: '0.68rem',
                color: 'var(--text-muted)',
                letterSpacing: '0.08em',
            }}>
                SECRETARIAT OPERATIONS PORTAL · NexEnroll v2 · Auto-refreshes every 90 s · Press Alt+R to refresh now
            </div>
        </div>
    );
};

export default SecretaryDashboard;
