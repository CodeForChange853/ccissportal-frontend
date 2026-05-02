// frontend/src/features/admin/components/dashboard/AlertFeed.jsx

import React, { useMemo } from 'react';

const SEVERITY_MAP = {
    OPEN: { variant: 'critical', label: 'OPEN', color: 'var(--color-danger)', border: 'var(--border-critical)' },
    PENDING: { variant: 'warning', label: 'PEND', color: 'var(--color-warning)', border: 'rgba(255,140,0,0.35)' },
    RESOLVED: { variant: 'normal', label: 'OK  ', color: 'var(--color-success)', border: 'rgba(0,255,136,0.25)' },
};

const CATEGORY_COLORS = {
    'IT SUPPORT': '#00f5ff',
    'REGISTRAR': '#9d4edd',
    'FINANCE': '#ff8c00',
    'ACADEMIC AFFAIRS': '#00ff88',
};

function fmtTime(iso) {
    if (!iso) return '--:--:--';
    const d = new Date(iso);
    return [d.getHours(), d.getMinutes(), d.getSeconds()]
        .map(n => String(n).padStart(2, '0'))
        .join(':');
}

const AlertEntry = ({ ticket }) => {
    const sev = SEVERITY_MAP[ticket.ticket_status] ?? SEVERITY_MAP.PENDING;
    const catColor = CATEGORY_COLORS[ticket.ai_predicted_category] ?? 'var(--text-muted)';

    return (
        <div
            role="listitem"
            aria-label={`${ticket.ticket_status} alert: ${ticket.issue_subject}`}
            style={{
                display: 'grid',
                gridTemplateColumns: '34px 52px 1fr auto',
                alignItems: 'start',
                gap: 8,
                padding: '8px 0',
                borderBottom: '1px solid var(--border-subtle)',
                borderLeft: `2px solid ${sev.border}`,
                paddingLeft: 10,
            }}
        >
            <span style={{
                fontFamily: 'var(--font-terminal)',
                fontSize: '0.58rem',
                fontWeight: 700,
                color: sev.color,
                letterSpacing: '0.02em',
                paddingTop: 1,
            }}>
                {sev.label}
            </span>

            <span style={{
                fontFamily: 'var(--font-terminal)',
                fontSize: '0.60rem',
                color: 'var(--text-muted)',
                paddingTop: 1,
                whiteSpace: 'nowrap',
            }}>
                {fmtTime(ticket.created_at)}
            </span>

            <span style={{
                fontFamily: 'var(--font-terminal)',
                fontSize: '0.70rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
            }}>
                {ticket.issue_subject}
            </span>

            <span style={{
                fontFamily: 'var(--font-terminal)',
                fontSize: '0.55rem',
                color: catColor,
                letterSpacing: '0.06em',
                whiteSpace: 'nowrap',
                paddingTop: 1,
                textAlign: 'right',
            }}>
                {ticket.ai_predicted_category?.split(' ')[0] ?? '—'}
            </span>
        </div>
    );
};

const AlertFeed = ({ tickets = [], maxDisplay = 50 }) => {
    const sorted = useMemo(() => {
        const priority = { OPEN: 0, PENDING: 1, RESOLVED: 2 };
        return [...tickets]
            .sort((a, b) => {
                const pDiff = (priority[a.ticket_status] ?? 1) - (priority[b.ticket_status] ?? 1);
                if (pDiff !== 0) return pDiff;
                return new Date(b.created_at) - new Date(a.created_at);
            })
            .slice(0, maxDisplay);
    }, [tickets, maxDisplay]);

    if (sorted.length === 0) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                fontFamily: 'var(--font-terminal)',
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                letterSpacing: '0.02em',
            }}>
                NO ALERTS DETECTED
            </div>
        );
    }

    return (
        <section
            aria-label="System Alert Feed"
            aria-live="polite"
            aria-atomic="false"
            role="log"
            style={{
                height: '100%',
                overflowY: 'auto',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(0,245,255,0.15) transparent',
            }}
        >
            <div
                role="list"
                style={{
                    fontFamily: 'var(--font-terminal)',
                    fontSize: '0.68rem',
                    color: 'var(--text-muted)',
                    marginBottom: 4,
                    letterSpacing: '0.02em',
                    display: 'grid',
                    gridTemplateColumns: '34px 52px 1fr auto',
                    gap: 8,
                    paddingLeft: 12,
                    paddingBottom: 6,
                    borderBottom: '1px solid var(--border-subtle)',
                }}
            >
                <span>SEV</span>
                <span>TIME</span>
                <span>SUBJECT</span>
                <span style={{ textAlign: 'right' }}>DEPT</span>
            </div>

            {sorted.map(t => (
                <AlertEntry key={t.ticket_id} ticket={t} />
            ))}
        </section>
    );
};

export default React.memo(AlertFeed);