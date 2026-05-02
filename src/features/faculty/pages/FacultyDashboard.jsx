// frontend/src/features/faculty/pages/FacultyDashboard.jsx
// Icons imported from shared components/icons/index.jsx — local Icons{} object removed.

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { useToast } from '../../../context/ToastContext';
import Gradebook from '../components/Gradebook';
import SubjectCard from '../components/SubjectCard';
import FacultyProfile from '../components/FacultyProfile';
import { facultyApi } from '../api/facultyApi';
import {
    LoadIcon, GradebookIcon, ProfileIcon,
    LogoutIcon, ChevronLeftIcon, ChevronRightIcon,
    SunIcon, MoonIcon, UsersIcon
} from '../../../components/icons';
import ConsultationTab from '../components/ConsultationTab';
import { UserAvatar } from '../../admin/layout/AdminSidebar';

// ── Nav definition ────────────────────────────────────────────────────────────
const NAV_ITEMS = [
    { id: 'load', label: 'My Load', Icon: LoadIcon },
    { id: 'gradebook', label: 'Gradebook', Icon: GradebookIcon },
    { id: 'consultations', label: 'Consultations', Icon: UsersIcon },
    { id: 'profile', label: 'My Profile', Icon: ProfileIcon },
];

// Faculty accent colour — green, matching the student/faculty role token
const ACCENT = '#34d399';

// ── Main component ────────────────────────────────────────────────────────────
const FacultyDashboard = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { toast } = useToast();

    const [activeTab, setActiveTab] = useState('load');
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [fetching, setFetching] = useState(true);

    // Sidebar collapse — persisted separately from admin sidebar
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        const stored = localStorage.getItem('faculty-sidebar-open');
        return stored === null ? true : stored === 'true';
    });

    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);

    useEffect(() => {
        localStorage.setItem('faculty-sidebar-open', String(sidebarOpen));
    }, [sidebarOpen]);

    // Close user menu on outside click
    useEffect(() => {
        const handler = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Load faculty subjects on mount
    useEffect(() => {
        (async () => {
            setFetching(true);
            try {
                const data = await facultyApi.fetchLoad();
                setSubjects(data);
            } catch {
                toast.error('Could not fetch faculty load.');
            } finally {
                setFetching(false);
            }
        })();
    }, []);

    const openGradebook = (sub) => {
        setSelectedSubject(sub);
        setActiveTab('gradebook');
    };

    const handleTabChange = (id) => {
        if (id === 'gradebook' && !selectedSubject) {
            toast.warn('Select a subject from "My Load" first.');
            return;
        }
        setActiveTab(id);
    };

    const activeLabel = NAV_ITEMS.find(n => n.id === activeTab)?.label || 'Dashboard';

    // ── Sidebar width ────────────────────────────────────────────────────────
    const sidebarW = sidebarOpen ? 240 : 64;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex' }}>

            {/* ── Sidebar ─────────────────────────────────────────────────── */}
            <aside style={{
                position: 'fixed', top: 0, left: 0, height: '100vh',
                width: sidebarW, background: 'var(--bg-sidebar)',
                borderRight: '1px solid var(--sidebar-border)',
                display: 'flex', flexDirection: 'column', zIndex: 50,
                transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
                overflow: 'hidden',
            }}>

                {/* Brand */}
                <div style={{
                    padding: sidebarOpen ? '18px 20px 16px' : '18px 0 16px',
                    borderBottom: '1px solid var(--sidebar-border)',
                    display: 'flex', alignItems: 'center',
                    justifyContent: sidebarOpen ? 'space-between' : 'center',
                    minHeight: 64, flexShrink: 0,
                    transition: 'padding 0.25s',
                }}>
                    {sidebarOpen && (
                        <div style={{ overflow: 'hidden' }}>
                            <p style={{ color: 'var(--sidebar-logo-text)', fontWeight: 900, fontSize: '0.875rem', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
                                FACULTY PORTAL
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                <span className="live-dot" style={{ background: ACCENT, boxShadow: `0 0 6px ${ACCENT}80` }} />
                                <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', letterSpacing: '0.12em', color: ACCENT, textTransform: 'uppercase' }}>
                                    Online
                                </span>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={() => setSidebarOpen(v => !v)}
                        className="sidebar-toggle"
                        title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                        style={{ flexShrink: 0 }}
                    >
                        {sidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                    </button>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto', overflowX: 'hidden' }}>
                    {NAV_ITEMS.map(({ id, label, Icon }) => {
                        const isActive = activeTab === id;
                        const displayLabel = id === 'gradebook' && selectedSubject
                            ? `Gradebook · ${selectedSubject.code}`
                            : label;
                        return (
                            <button
                                key={id}
                                onClick={() => handleTabChange(id)}
                                title={!sidebarOpen ? displayLabel : undefined}
                                style={{
                                    display: 'flex', alignItems: 'center',
                                    gap: 10, padding: sidebarOpen ? '9px 12px' : '9px',
                                    borderRadius: 10, margin: '1px 8px',
                                    fontSize: '0.78125rem', fontWeight: isActive ? 700 : 600,
                                    color: isActive ? ACCENT : 'var(--sidebar-text-inactive)',
                                    cursor: 'pointer', border: 'none',
                                    textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden',
                                    transition: 'background 0.12s, color 0.12s',
                                    borderLeft: isActive ? `2px solid ${ACCENT}` : '2px solid transparent',
                                    background: isActive ? `${ACCENT}18` : 'transparent',
                                    width: sidebarOpen ? 'calc(100% - 16px)' : 'calc(100% - 16px)',
                                    justifyContent: sidebarOpen ? 'flex-start' : 'center',
                                    position: 'relative',
                                }}
                                onMouseEnter={e => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                        e.currentTarget.style.color = '#e2e8f0';
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = 'var(--sidebar-text-inactive)';
                                    }
                                }}
                            >
                                <span style={{ flexShrink: 0, width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isActive ? 1 : 0.75 }}>
                                    <Icon />
                                </span>
                                {sidebarOpen && (
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                                        {displayLabel}
                                    </span>
                                )}
                                {!sidebarOpen && (
                                    <span style={{
                                        position: 'absolute', left: 72, whiteSpace: 'nowrap',
                                        background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                                        color: 'var(--text-primary)', fontSize: '0.72rem', fontWeight: 600,
                                        padding: '5px 10px', borderRadius: 7,
                                        boxShadow: 'var(--shadow-raised)', zIndex: 100,
                                        pointerEvents: 'none', opacity: 0, transition: 'opacity 0.15s',
                                    }}
                                        className="nav-tooltip"
                                    >
                                        {displayLabel}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* User + logout */}
                <div style={{
                    borderTop: '1px solid var(--sidebar-border)',
                    padding: sidebarOpen ? '12px 16px' : '12px 8px',
                    flexShrink: 0,
                }}>
                    {sidebarOpen ? (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                <UserAvatar email={user?.username || user?.email || 'F'} size={30} />
                                <div style={{ overflow: 'hidden', flex: 1 }}>
                                    <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--sidebar-logo-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {user?.username?.split('@')[0] || user?.email?.split('@')[0] || 'Faculty'}
                                    </p>
                                    <p style={{ fontSize: '0.6rem', color: 'var(--sidebar-text-inactive)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                        Faculty Member
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={logout}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    width: '100%', padding: '7px 8px', borderRadius: 8,
                                    background: 'transparent', border: 'none',
                                    color: 'var(--color-danger)', fontSize: '0.72rem',
                                    cursor: 'pointer', opacity: 0.8, transition: 'opacity 0.12s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                                onMouseLeave={e => { e.currentTarget.style.opacity = '0.8'; e.currentTarget.style.background = 'transparent'; }}
                            >
                                <LogoutIcon />
                                <span>Log Out</span>
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={logout}
                            title="Log out"
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '100%', padding: '9px', borderRadius: 8,
                                background: 'transparent', border: 'none',
                                color: 'var(--color-danger)', cursor: 'pointer',
                                opacity: 0.8, transition: 'opacity 0.12s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
                            onMouseLeave={e => { e.currentTarget.style.opacity = '0.8'; }}
                        >
                            <LogoutIcon />
                        </button>
                    )}
                </div>
            </aside>

            {/* ── Top bar ─────────────────────────────────────────────────── */}
            <header style={{
                position: 'fixed', top: 0, right: 0,
                left: sidebarW, height: 52,
                background: 'var(--bg-topbar)',
                backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 24px', zIndex: 40,
                transition: 'left 0.25s cubic-bezier(0.4,0,0.2,1)',
            }}>
                {/* Breadcrumb */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {['Faculty', activeLabel].map((crumb, i) => (
                        <React.Fragment key={crumb}>
                            {i > 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>›</span>}
                            <span style={{
                                fontSize: '0.78rem',
                                fontWeight: i === 1 ? 700 : 500,
                                color: i === 1 ? 'var(--text-primary)' : 'var(--text-muted)',
                                letterSpacing: '0.02em',
                            }}>
                                {crumb}
                            </span>
                        </React.Fragment>
                    ))}
                </div>

                {/* Right controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                        onClick={toggleTheme}
                        className="theme-toggle"
                        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                    </button>

                    <div style={{ width: 1, height: 20, background: 'var(--border-subtle)', flexShrink: 0 }} />

                    {/* User avatar dropdown */}
                    <div ref={userMenuRef} style={{ position: 'relative' }}>
                        <button
                            onClick={() => setUserMenuOpen(v => !v)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '4px 8px 4px 4px',
                                background: userMenuOpen ? 'var(--bg-elevated)' : 'transparent',
                                border: `1px solid ${userMenuOpen ? 'var(--border-default)' : 'transparent'}`,
                                borderRadius: 10, cursor: 'pointer',
                                transition: 'background 0.12s, border-color 0.12s',
                            }}
                        >
                            <UserAvatar email={user?.username || user?.email || 'F'} size={28} />
                            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {user?.username?.split('@')[0] || user?.email?.split('@')[0] || 'Faculty'}
                            </span>
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round">
                                <path d="M2 4l3 3 3-3" />
                            </svg>
                        </button>

                        {userMenuOpen && (
                            <div className="animate-fade-in-up" style={{
                                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                                minWidth: 160, background: 'var(--bg-elevated)',
                                border: '1px solid var(--border-default)', borderRadius: 12,
                                boxShadow: 'var(--shadow-raised)', padding: 6, zIndex: 200,
                            }}>
                                <div style={{ padding: '8px 10px 10px', borderBottom: '1px solid var(--border-subtle)', marginBottom: 4 }}>
                                    <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                        {user?.username?.split('@')[0] || 'Faculty'}
                                    </p>
                                    <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: 1 }}>Faculty Member</p>
                                </div>
                                <button
                                    onClick={() => { logout(); setUserMenuOpen(false); }}
                                    style={{
                                        display: 'block', width: '100%', textAlign: 'left',
                                        padding: '7px 10px', borderRadius: 7,
                                        background: 'transparent', border: 'none',
                                        color: 'var(--color-danger)', fontSize: '0.75rem',
                                        cursor: 'pointer', opacity: 0.85, transition: 'background 0.1s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.opacity = '1'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.opacity = '0.85'; }}
                                >
                                    Log Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* ── Main content ─────────────────────────────────────────────── */}
            <main style={{
                marginLeft: sidebarW, paddingTop: 52,
                minHeight: '100vh', flex: 1,
                background: 'var(--bg-base)',
                transition: 'margin-left 0.25s cubic-bezier(0.4,0,0.2,1)',
                overflowY: 'auto',
            }}>
                <div style={{ padding: 24 }}>

                    {/* ── MY LOAD ───────────────────────────────────────── */}
                    {activeTab === 'load' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                                    My Teaching Load
                                </h2>
                                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 24 }}>
                                    {subjects.length} subject{subjects.length !== 1 ? 's' : ''} assigned — click any card to open the gradebook.
                                </p>

                                {fetching ? (
                                    <div style={{ textAlign: 'center', padding: '80px 0', fontFamily: 'monospace', fontSize: '0.78rem', color: ACCENT, letterSpacing: '0.12em' }} className="animate-pulse">
                                        FETCHING LOAD…
                                    </div>
                                ) : subjects.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                                        NO SUBJECTS ASSIGNED — Contact your administrator.
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
                                        {subjects.map(sub => (
                                            <SubjectCard
                                                key={sub.code}
                                                subject={sub}
                                                onClick={() => openGradebook(sub)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="lg:col-span-1">
                                <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                                    Triage Alerts
                                </h2>
                                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 24 }}>
                                    Requires attention
                                </p>
                                
                                <div className="space-y-3">
                                    <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 transition-transform hover:-translate-y-1 cursor-pointer">
                                        <div className="flex justify-between items-center mb-1.5">
                                            <p className="text-[10px] uppercase tracking-wider font-bold text-red-500">Grade Rectification</p>
                                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                        </div>
                                        <p className="text-xs text-slate-300 font-bold mb-1">CS101 - Introduction to Computing</p>
                                        <p className="text-[10px] text-slate-400 leading-relaxed">A student has filed a dispute regarding their Midterm Grade calculation.</p>
                                    </div>

                                    <div className="p-4 rounded-xl border border-orange-500/20 bg-orange-500/5 transition-transform hover:-translate-y-1 cursor-pointer">
                                        <div className="flex justify-between items-center mb-1.5">
                                            <p className="text-[10px] uppercase tracking-wider font-bold text-orange-500">Advising Alert</p>
                                            <span className="w-2 h-2 rounded-full bg-orange-500"></span> 
                                        </div>
                                        <p className="text-[10px] text-slate-400 leading-relaxed">3 of your advisees are at risk of failing prerequisites for next semester.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── GRADEBOOK ─────────────────────────────────────── */}
                    {activeTab === 'gradebook' && selectedSubject && (
                        <div style={{ height: 700 }}>
                            <Gradebook subject={selectedSubject} />
                        </div>
                    )}
                    {activeTab === 'gradebook' && !selectedSubject && (
                        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                            SELECT A SUBJECT FROM "MY LOAD" FIRST
                        </div>
                    )}

                    {/* ── PROFILE ───────────────────────────────────────── */}
                    {activeTab === 'profile' && (
                        <FacultyProfile user={user} subjectCount={subjects.length} />
                    )}

                    {/* ── CONSULTATIONS ─────────────────────────────────── */}
                    {activeTab === 'consultations' && (
                        <ConsultationTab />
                    )}

                </div>
            </main>

        </div>
    );
};

export default FacultyDashboard;