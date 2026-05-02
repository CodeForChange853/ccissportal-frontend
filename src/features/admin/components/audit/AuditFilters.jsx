// frontend/src/features/admin/components/audit/AuditFilters.jsx

import React, { useRef } from 'react';

const EVENT_TYPES = [
    '', 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'ENROLLMENT_APPROVED', 'ENROLLMENT_REJECTED',
    'GRADE_MODIFIED', 'SETTING_CHANGED', 'FACULTY_ASSIGNED', 'TICKET_RESOLVED',
    'DOCUMENT_SCANNED', 'PASSKEY_ROTATED', 'USER_SUSPENDED',
];

const selectStyle = {
    background: 'var(--bg-input)', border: '1px solid var(--border-default)',
    borderRadius: 6, padding: '8px 12px', fontFamily: 'var(--font-terminal)',
    fontSize: '0.72rem', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer',
};

const AuditFilters = ({ filters, onChange, onReset }) => {
    const debounceRef = useRef(null);

    const handleEmailChange = (e) => {
        const value = e.target.value;
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            onChange({ ...filters, actor_email: value });
        }, 350);
    };

    return (
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
                <label style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.52rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    Event Type
                </label>
                <select
                    value={filters.event_type}
                    onChange={e => onChange({ ...filters, event_type: e.target.value })}
                    style={{ ...selectStyle, minWidth: 180 }}
                >
                    <option value="">All Events</option>
                    {EVENT_TYPES.slice(1).map(t => (
                        <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                    ))}
                </select>
            </div>
            <div>
                <label style={{ fontFamily: 'var(--font-terminal)', fontSize: '0.52rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    Actor Email
                </label>
                <input
                    type="text"
                    placeholder="filter by email…"
                    defaultValue={filters.actor_email}
                    onChange={handleEmailChange}
                    style={{ ...selectStyle, minWidth: 200 }}
                />
            </div>
            <button
                className="btn-ghost"
                style={{ fontSize: '0.62rem', padding: '8px 14px' }}
                onClick={onReset}
            >
                RESET
            </button>
        </div>
    );
};

export default AuditFilters;