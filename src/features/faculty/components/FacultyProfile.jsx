import React from 'react';
import { useTheme } from '../../../context/ThemeContext';

const Row = ({ label, value }) => (
    <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '11px 0', borderBottom: '1px solid var(--border-subtle)',
    }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-code)' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{value ?? '—'}</span>
    </div>
);

const Section = ({ title, children }) => (
    <div style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-default)',
        borderRadius: 12, overflow: 'hidden',
        boxShadow: 'var(--shadow-card)',
    }}>
        <div style={{
            padding: '13px 20px', borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface)',
        }}>
            <span style={{
                fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: 2, fontFamily: 'var(--font-code)',
            }}>{title}</span>
        </div>
        <div style={{ padding: '0 20px' }}>{children}</div>
    </div>
);

const StatBox = ({ value, label, accent = false }) => (
    <div style={{
        flex: 1, textAlign: 'center', padding: '16px 8px',
        background: accent ? 'var(--accent-dim)' : 'var(--bg-surface)',
        border: `1px solid ${accent ? 'var(--border-accent)' : 'var(--border-subtle)'}`,
        borderRadius: 8,
    }}>
        <div style={{
            fontSize: 22, fontWeight: 700,
            fontFamily: 'var(--font-display, serif)',
            color: accent ? 'var(--accent)' : 'var(--text-primary)',
        }}>{value}</div>
        <div style={{
            fontSize: 10, color: 'var(--text-muted)', marginTop: 4,
            textTransform: 'uppercase', letterSpacing: 1.5, fontFamily: 'var(--font-code)',
        }}>{label}</div>
    </div>
);

const FacultyProfile = ({ user, subjectCount = 0 }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const displayName = user?.full_name || user?.username?.split('@')[0] || 'Faculty Member';
    const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const role = (user?.role || 'FACULTY').replace(/_/g, ' ');
    const dept = user?.department || 'College of Information Technology';
    const empId = user?.employee_id || user?.id || '—';

    return (
        <div>
            <div style={{ marginBottom: 20 }}>
                <h2 style={{
                    fontSize: 20, fontWeight: 700, color: 'var(--text-primary)',
                    fontFamily: 'var(--font-display, serif)', marginBottom: 4,
                }}>My Profile</h2>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Your faculty account information and teaching summary
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, alignItems: 'start' }}>

                {/* LEFT — Identity card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                    {/* Avatar card */}
                    <div style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 12, overflow: 'hidden',
                        boxShadow: 'var(--shadow-card)',
                    }}>
                        {/* Gold top bar */}
                        <div style={{ height: 3, background: 'linear-gradient(90deg, var(--accent), var(--accent-light, #e2c27d), transparent)' }} />

                        <div style={{ padding: '24px 20px', textAlign: 'center' }}>
                            {/* Avatar */}
                            <div style={{
                                width: 72, height: 72, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #5a3800, var(--accent))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontFamily: 'var(--font-display, serif)', fontSize: 28, fontWeight: 700,
                                color: '#0d0d0d', margin: '0 auto 14px',
                                boxShadow: '0 0 0 3px var(--border-accent)',
                            }}>{initials}</div>

                            <h3 style={{
                                fontSize: 18, fontWeight: 600, color: 'var(--text-primary)',
                                fontFamily: 'var(--font-display, serif)', marginBottom: 4,
                            }}>{displayName}</h3>
                            <p style={{
                                fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--font-code)',
                                textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6,
                            }}>{role}</p>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{dept}</p>

                            {/* Status chip */}
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                marginTop: 14, padding: '4px 14px', borderRadius: 20,
                                background: 'var(--color-success-bg)',
                                border: '1px solid var(--color-success-bd)',
                                fontSize: 11, color: 'var(--color-success)', fontFamily: 'var(--font-code)',
                            }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-success)' }} />
                                Active Faculty
                            </div>
                        </div>
                    </div>

                    {/* Stats row */}
                    <div style={{ display: 'flex', gap: 8 }}>
                        <StatBox value={subjectCount} label="Subjects" accent />
                        <StatBox value={user?.years_of_service ?? '—'} label="Yrs. Service" />
                        <StatBox value={user?.students_total ?? '—'} label="Students" />
                    </div>
                </div>

                {/* RIGHT — Details sections */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                    <Section title="Account Information">
                        <Row label="Full Name" value={displayName} />
                        <Row label="Email" value={user?.email} />
                        <Row label="Employee ID" value={empId} />
                        <Row label="Role" value={role} />
                        <div style={{ padding: '11px 0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-code)' }}>Department</span>
                                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{dept}</span>
                            </div>
                        </div>
                    </Section>

                    <Section title="Academic Load">
                        <Row label="Subjects Assigned" value={subjectCount} />
                        <Row label="Academic Year" value={user?.academic_year ?? '2024–2025'} />
                        <Row label="Semester" value={user?.semester ?? '2nd Semester'} />
                        <div style={{ padding: '11px 0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-code)' }}>Workload Status</span>
                                <span style={{
                                    fontSize: 11, padding: '3px 10px', borderRadius: 20,
                                    fontFamily: 'var(--font-code)', fontWeight: 700,
                                    background: subjectCount >= 6
                                        ? 'var(--color-danger-bg)'
                                        : subjectCount >= 4
                                            ? 'var(--color-warning-bg)'
                                            : 'var(--color-success-bg)',
                                    border: `1px solid ${subjectCount >= 6 ? 'var(--color-danger-bd)' : subjectCount >= 4 ? 'var(--color-warning-bd)' : 'var(--color-success-bd)'}`,
                                    color: subjectCount >= 6
                                        ? 'var(--color-danger)'
                                        : subjectCount >= 4
                                            ? 'var(--color-warning)'
                                            : 'var(--color-success)',
                                }}>
                                    {subjectCount >= 6 ? 'Full Load' : subjectCount >= 4 ? 'Near Full' : 'Available'}
                                </span>
                            </div>
                        </div>
                    </Section>

                    {/* Permissions */}
                    <Section title="Portal Permissions">
                        {[
                            { label: 'View Class Roster', granted: true },
                            { label: 'Edit & Submit Grades', granted: true },
                            { label: 'Offline Grade Editing', granted: true },
                            { label: 'Grade Override', granted: !!user?.can_override_grades },
                            { label: 'Admin Panel Access', granted: false },
                        ].map(({ label, granted }) => (
                            <div key={label} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '10px 0', borderBottom: '1px solid var(--border-subtle)',
                            }}>
                                <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{label}</span>
                                <span style={{
                                    fontSize: 10, padding: '2px 10px', borderRadius: 20,
                                    fontFamily: 'var(--font-code)', fontWeight: 700,
                                    background: granted ? 'var(--color-success-bg)' : 'var(--bg-surface)',
                                    border: `1px solid ${granted ? 'var(--color-success-bd)' : 'var(--border-subtle)'}`,
                                    color: granted ? 'var(--color-success)' : 'var(--text-muted)',
                                }}>{granted ? 'Granted' : 'Not Granted'}</span>
                            </div>
                        ))}
                        {/* last row no border */}
                        <div style={{ height: 12 }} />
                    </Section>
                </div>
            </div>
        </div>
    );
};

export default FacultyProfile;