import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import Toast from '../../../components/ui/Toast';
import { studentApi } from '../api/studentApi';
import GWABlock, { computeGWA, gwaLabel } from '../components/GWABlock';
import GradesTab from '../components/GradesTab';
import CorUploadTab from '../components/CorUploadTab';
import SmartEnrollmentTab from '../components/SmartEnrollmentTab';
import SupportAssistantTab from '../components/SupportAssistantTab';
import ConsultationBookingTab from '../components/ConsultationBookingTab';
import {
    OverviewIcon, CurriculumIcon, GradebookIcon,
    AdmissionsIcon, ShieldIcon, SupportIcon, LogoutIcon,
} from '../../../components/icons';
import {
    Chart as ChartJS, CategoryScale, LinearScale,
    PointElement, LineElement, Filler, Tooltip,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

// ── Tab config split: primary (bottom nav) + overflow (settings sheet)
const PRIMARY_TABS = [
    { id: 'sched', icon: <CurriculumIcon />, label: 'Schedule' },
    { id: 'grades', icon: <GradebookIcon />, label: 'Grades' },
    { id: 'home', icon: <OverviewIcon />, label: 'Overview' }, // center FAB
    { id: 'enrollment', icon: <AdmissionsIcon />, label: 'Enroll' },
    { id: 'settings', icon: null, label: 'Settings' }, // opens sheet
];

const SETTINGS_TABS = [
    { id: 'consult', icon: <SupportIcon />, label: 'Book Consultation' },
    { id: 'status', icon: <ShieldIcon />, label: 'Enrollment Status' },
    { id: 'support', icon: <SupportIcon />, label: 'Support Assistant' },
];

const ALL_TABS = [...PRIMARY_TABS.filter(t => t.id !== 'settings'), ...SETTINGS_TABS];

const NAV_PREF_KEY = 'student_nav_pref';

// ── Shared block
const Block = ({ children, className = '', style = {}, onClick }) => (
    <div
        className={`rounded-2xl ${className}`}
        style={{ background: 'var(--student-black-3)', border: '1px solid rgba(201,168,76,0.08)', ...style }}
        onClick={onClick}
    >
        {children}
    </div>
);

const StatMini = ({ label, value, unit, color = 'var(--student-gold)' }) => (
    <div
        className="flex flex-col items-center gap-0.5 px-2 py-3 rounded-xl flex-1"
        style={{ background: 'var(--student-gold-dim2)', border: `1px solid ${color}22` }}
    >
        <span className="text-lg font-black leading-none" style={{ color: 'var(--student-white)', fontFamily: 'var(--student-font-display)' }}>{value}</span>
        <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color, fontFamily: 'var(--student-font-mono)' }}>{label}</span>
        {unit && <span className="text-[9px] opacity-60" style={{ color: 'var(--student-white-dim)', fontFamily: 'var(--student-font-mono)' }}>{unit}</span>}
    </div>
);

// ── Sidebar nav item (desktop)
const SideNavItem = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all"
        style={active
            ? { background: 'var(--student-gold-dim)', color: 'var(--student-gold)', borderLeft: '3px solid var(--student-gold)', paddingLeft: '13px' }
            : { color: 'var(--student-white-dim)', borderLeft: '3px solid transparent' }
        }
    >
        <span className="w-5 h-5 flex shrink-0 items-center justify-center">{icon}</span>
        <span style={{ fontFamily: 'var(--student-font-body)' }}>{label}</span>
    </button>
);

// ── Dot slider indicator
const DotSlider = ({ tabs, activeId, onSelect }) => {
    const dotTabs = tabs.filter(t => t.id !== 'settings');
    const activeIndex = dotTabs.findIndex(t => t.id === activeId);

    return (
        <div className="flex items-center justify-center gap-1.5 py-2">
            {dotTabs.map((t, i) => (
                <button
                    key={t.id}
                    onClick={() => onSelect(t.id)}
                    className="flex items-center justify-center transition-all duration-300"
                    style={{
                        width: i === activeIndex ? 20 : 6,
                        height: 6,
                        borderRadius: 999,
                        background: i === activeIndex
                            ? 'var(--student-gold)'
                            : 'rgba(201,168,76,0.2)',
                        transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1), background 0.2s',
                    }}
                    aria-label={t.label}
                />
            ))}
        </div>
    );
};

// ── Settings bottom sheet
const SettingsSheet = ({ open, onClose, onNavTab, navPref, saveNavPref, profile, logout }) => {
    const sheetRef = useRef(null);

    return (
        <>
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                    style={{ transition: 'opacity 0.2s' }}
                />
            )}
            <div
                ref={sheetRef}
                className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
                style={{
                    background: 'var(--student-black-2)',
                    borderTop: '1px solid rgba(201,168,76,0.15)',
                    borderRadius: '20px 20px 0 0',
                    transform: open ? 'translateY(0)' : 'translateY(100%)',
                    transition: 'transform 0.32s cubic-bezier(0.4,0,0.2,1)',
                    paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)',
                    maxHeight: '85vh',
                    overflowY: 'auto',
                }}
            >
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(201,168,76,0.25)' }} />
                </div>

                {/* Profile strip */}
                <div className="flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0"
                        style={{
                            background: 'linear-gradient(135deg, var(--student-gold), var(--student-gold-2))',
                            color: 'var(--student-black)',
                            fontFamily: 'var(--student-font-display)',
                        }}
                    >
                        {profile?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-sm truncate" style={{ color: 'var(--student-white)', fontFamily: 'var(--student-font-display)' }}>
                            {profile?.name}
                        </p>
                        <p className="text-[11px] truncate" style={{ color: 'var(--student-gold)', fontFamily: 'var(--student-font-mono)' }}>
                            {profile?.course}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-auto w-7 h-7 flex items-center justify-center rounded-lg text-xs"
                        style={{ background: 'var(--student-black-4)', color: 'var(--student-white-dim)' }}
                    >✕</button>
                </div>

                {/* Overflow nav tabs */}
                <div className="px-4 pt-4 pb-2">
                    <p className="text-[10px] uppercase tracking-widest font-bold mb-3 px-2" style={{ color: 'var(--student-white-dim)', fontFamily: 'var(--student-font-mono)' }}>
                        More Features
                    </p>
                    <div className="space-y-1">
                        {SETTINGS_TABS.map(t => (
                            <button
                                key={t.id}
                                onClick={() => { onNavTab(t.id); onClose(); }}
                                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
                                style={{
                                    background: 'var(--student-black-4)',
                                    color: 'var(--student-white)',
                                    border: '1px solid rgba(201,168,76,0.07)',
                                    fontFamily: 'var(--student-font-body)',
                                }}
                            >
                                <span className="w-5 h-5 flex items-center justify-center" style={{ color: 'var(--student-gold)' }}>
                                    {t.icon}
                                </span>
                                {t.label}
                                <svg className="ml-auto w-4 h-4 opacity-30" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <path d="M6 4l4 4-4 4" />
                                </svg>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Preferences */}
                <div className="px-4 pt-4 pb-2">
                    <p className="text-[10px] uppercase tracking-widest font-bold mb-3 px-2" style={{ color: 'var(--student-white-dim)', fontFamily: 'var(--student-font-mono)' }}>
                        Preferences
                    </p>
                    <div
                        className="flex items-center justify-between px-4 py-3.5 rounded-xl"
                        style={{ background: 'var(--student-black-4)', border: '1px solid rgba(201,168,76,0.07)' }}
                    >
                        <span className="text-sm font-semibold" style={{ color: 'var(--student-white)', fontFamily: 'var(--student-font-body)' }}>
                            Navigation Style
                        </span>
                        <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--student-black-3)' }}>
                            {['bottom', 'sidebar'].map(p => (
                                <button
                                    key={p}
                                    onClick={() => saveNavPref(p)}
                                    className="px-3 py-1 rounded-md text-xs font-bold transition-all"
                                    style={{
                                        background: navPref === p ? 'var(--student-gold)' : 'transparent',
                                        color: navPref === p ? 'var(--student-black)' : 'var(--student-white-dim)',
                                        fontFamily: 'var(--student-font-mono)',
                                    }}
                                >
                                    {p === 'bottom' ? '⊟ Bottom' : '☰ Side'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sign out */}
                <div className="px-4 pt-3 pb-4">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all"
                        style={{
                            background: 'rgba(192,57,43,0.07)',
                            color: 'var(--student-red)',
                            border: '1px solid rgba(192,57,43,0.15)',
                            fontFamily: 'var(--student-font-body)',
                        }}
                    >
                        <span className="w-5 h-5"><LogoutIcon /></span>
                        Sign out
                    </button>
                </div>
            </div>
        </>
    );
};

// ── Mobile collapsible sidebar (sidebar nav mode)
const MobileSidebar = ({ open, onClose, tab, setTab, profile, logout, navPref, saveNavPref }) => (
    <>
        {open && <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" onClick={onClose} />}
        <div
            className="fixed top-0 left-0 h-full z-50 flex flex-col pt-8 pb-8 w-64 transition-transform duration-300"
            style={{
                background: 'var(--student-black-2)',
                borderRight: '1px solid rgba(201,168,76,0.12)',
                transform: open ? 'translateX(0)' : 'translateX(-100%)',
            }}
        >
            <div className="flex items-center gap-3 px-6 mb-8">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0"
                    style={{
                        background: 'linear-gradient(135deg, var(--student-gold), var(--student-gold-2))',
                        color: 'var(--student-black)',
                        fontFamily: 'var(--student-font-display)',
                    }}
                >
                    {profile?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                    <p className="font-bold text-base truncate" style={{ color: 'var(--student-white)', fontFamily: 'var(--student-font-display)' }}>
                        {profile?.name?.split(' ')[0]}
                    </p>
                    <p className="text-[11px] truncate" style={{ color: 'var(--student-gold)', fontFamily: 'var(--student-font-mono)' }}>
                        {profile?.course}
                    </p>
                </div>
                <button onClick={onClose} className="ml-auto p-1" style={{ color: 'var(--student-white-dim)' }}>✕</button>
            </div>

            <nav className="flex-1 space-y-1 px-4 overflow-y-auto">
                {ALL_TABS.map(t => (
                    <SideNavItem
                        key={t.id}
                        icon={t.icon} label={t.label}
                        active={tab === t.id}
                        onClick={() => { setTab(t.id); onClose(); }}
                    />
                ))}
            </nav>

            <div className="px-6 pt-4 space-y-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <div
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                    style={{ background: 'var(--student-black-4)', border: '1px solid rgba(201,168,76,0.07)' }}
                >
                    <span className="text-xs font-semibold" style={{ color: 'var(--student-white-dim)', fontFamily: 'var(--student-font-body)' }}>
                        Nav Style
                    </span>
                    <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: 'var(--student-black-3)' }}>
                        {['bottom', 'sidebar'].map(p => (
                            <button
                                key={p}
                                onClick={() => saveNavPref(p)}
                                className="px-2.5 py-1 rounded-md text-[10px] font-bold transition-all"
                                style={{
                                    background: navPref === p ? 'var(--student-gold)' : 'transparent',
                                    color: navPref === p ? 'var(--student-black)' : 'var(--student-white-dim)',
                                    fontFamily: 'var(--student-font-mono)',
                                }}
                            >
                                {p === 'bottom' ? '⊟ Bottom' : '☰ Side'}
                            </button>
                        ))}
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full text-left text-xs py-2 px-3 rounded-xl flex items-center gap-2 transition-colors"
                    style={{ color: 'var(--student-white-dim)', fontFamily: 'var(--student-font-body)' }}
                >
                    <span className="w-4 h-4"><LogoutIcon /></span>
                    Sign out
                </button>
            </div>
        </div>
    </>
);

// ── Settings gear icon (inline SVG, no import needed)
const GearIcon = () => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <circle cx="10" cy="10" r="2.5" />
        <path d="M10 2v1.5M10 16.5V18M2 10h1.5M16.5 10H18M4.1 4.1l1.1 1.1M14.8 14.8l1.1 1.1M4.1 15.9l1.1-1.1M14.8 5.2l1.1-1.1" />
    </svg>
);

// ── Main dashboard
const StudentDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [grades, setGrades] = useState([]);
    const [schedule, setSchedule] = useState([]);
    const [enrollment, setEnrollment] = useState([]);
    const [academicStanding, setAcademicStanding] = useState(null);
    const [tab, setTab] = useState('home');
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [clearanceModal, setClearanceModal] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);

    const [navPref, setNavPref] = useState(() => localStorage.getItem(NAV_PREF_KEY) || 'bottom');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, [tab]);

    const showToast = (msg, type = 'success') => setToast({ message: msg, type });

    const saveNavPref = (pref) => {
        setNavPref(pref);
        localStorage.setItem(NAV_PREF_KEY, pref);
    };

    const handleTabSelect = (id) => {
        if (id === 'settings') {
            setSettingsOpen(true);
            return;
        }
        setTab(id);
    };

    const fetchAll = async () => {
        setLoading(true);
        try { setProfile(await studentApi.fetchProfile()); } catch { showToast('Could not load profile.', 'error'); }
        try { setGrades(await studentApi.fetchGrades()); } catch { /* silent */ }
        try { setSchedule(await studentApi.fetchSchedule()); } catch { /* silent */ }
        try { setEnrollment(await studentApi.fetchEnrollmentStatus()); } catch { /* silent */ }
        try { setAcademicStanding(await studentApi.fetchAcademicStanding()); } catch { /* silent */ }
        setLoading(false);
    };

    useEffect(() => { fetchAll(); }, []);

    const gwa = useMemo(() => computeGWA(grades), [grades]);
    const gwaMeta = useMemo(() => gwaLabel(gwa), [gwa]);

    const { earned, enrolledUnits, passed, failed, cleared, sparkData } = useMemo(() => {
        const earned = grades.filter(g => g.completion_status === 'PASSED').reduce((s, g) => s + (g.credit_units || 3), 0);
        const enrolledUnits = grades.filter(g => g.completion_status === 'ENROLLED').reduce((s, g) => s + (g.credit_units || 3), 0);
        const passed = grades.filter(g => g.completion_status === 'PASSED').length;
        const failed = grades.filter(g => g.completion_status === 'FAILED').length;
        const cleared = profile?.clearance?.status === 'CLEARED';

        const bySem = {};
        grades
            .filter(g => g.final_grade != null && g.final_grade !== 'N/A' && g.completion_status !== 'ENROLLED')
            .forEach(g => {
                const semStr = `Year ${g.target_year_level} Sem ${g.target_semester}`;
                if (!bySem[semStr]) bySem[semStr] = [];
                bySem[semStr].push({ grade: parseFloat(g.final_grade), units: g.credit_units || 3 });
            });
        const sparkData = Object.entries(bySem)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([, arr]) => {
                const pts = arr.reduce((s, x) => s + x.grade * x.units, 0);
                const u = arr.reduce((s, x) => s + x.units, 0);
                return u > 0 ? parseFloat((pts / u).toFixed(2)) : null;
            })
            .filter(Boolean);

        return { earned, enrolledUnits, passed, failed, cleared, sparkData };
    }, [grades, profile]);

    const activeSchedule = useMemo(() => schedule?.[0] ?? null, [schedule]);

    const currentTabLabel = ALL_TABS.find(t => t.id === tab)?.label ?? 'Overview';

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--student-black)' }}>
            <div className="text-center">
                <div className="w-10 h-10 rounded-full mx-auto mb-4 animate-spin border-4"
                    style={{ borderColor: 'rgba(201,168,76,0.15)', borderTopColor: 'var(--student-gold)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--student-gold)', fontFamily: 'var(--student-font-mono)' }}>Loading…</p>
            </div>
        </div>
    );

    if (!profile) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--student-black)' }}>
            <Block className="p-8 text-center max-w-xs mx-4">
                <p className="font-medium mb-4 text-sm" style={{ color: 'var(--student-white)', fontFamily: 'var(--student-font-body)' }}>
                    Could not load your profile.
                </p>
                <button onClick={fetchAll} className="px-5 py-2 rounded-full text-sm font-bold"
                    style={{ background: 'var(--student-gold)', color: 'var(--student-black)' }}>
                    Retry
                </button>
            </Block>
        </div>
    );

    const useSidebar = navPref === 'sidebar';

    return (
        <div
            className="min-h-screen flex flex-col relative"
            style={{ background: 'var(--student-black)', fontFamily: 'var(--student-font-body)' }}
        >
            {/* Dot grid bg */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.025]"
                style={{ backgroundImage: 'radial-gradient(var(--student-gold) 1px,transparent 1px)', backgroundSize: '28px 28px' }}
            />

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {useSidebar && (
                <MobileSidebar
                    open={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    tab={tab} setTab={setTab}
                    profile={profile} logout={logout}
                    navPref={navPref} saveNavPref={saveNavPref}
                />
            )}

            {/* Settings bottom sheet */}
            {!useSidebar && (
                <SettingsSheet
                    open={settingsOpen}
                    onClose={() => setSettingsOpen(false)}
                    onNavTab={(id) => setTab(id)}
                    navPref={navPref}
                    saveNavPref={saveNavPref}
                    profile={profile}
                    logout={logout}
                />
            )}

            <div className="flex flex-1 min-h-0 max-w-6xl w-full mx-auto">

                {/* Desktop sidebar */}
                <div
                    className="hidden lg:flex w-64 flex-shrink-0 flex-col pt-8 pl-6 pr-4 sticky top-0 h-screen overflow-y-auto"
                    style={{ background: 'var(--student-black-2)', borderRight: '1px solid rgba(255,255,255,0.05)' }}
                >
                    <div className="flex items-center gap-3 mb-10 px-2">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0"
                            style={{
                                background: 'linear-gradient(135deg, var(--student-gold), var(--student-gold-2))',
                                color: 'var(--student-black)',
                                fontFamily: 'var(--student-font-display)',
                            }}
                        >{profile.name?.charAt(0).toUpperCase()}</div>
                        <div className="min-w-0">
                            <p className="font-bold text-base truncate" style={{ color: 'var(--student-white)', fontFamily: 'var(--student-font-display)' }}>
                                {profile.name?.split(' ')[0]}
                            </p>
                            <p className="text-[11px] truncate" style={{ color: 'var(--student-gold)', fontFamily: 'var(--student-font-mono)' }}>
                                {profile.course}
                            </p>
                        </div>
                    </div>

                    <nav className="flex-1 space-y-1">
                        {ALL_TABS.map(t => (
                            <SideNavItem
                                key={t.id}
                                icon={t.icon} label={t.label}
                                active={tab === t.id}
                                onClick={() => setTab(t.id)}
                            />
                        ))}
                    </nav>

                    <div className="pb-8 px-2 space-y-1 border-t pt-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                        <button
                            onClick={logout}
                            className="w-full text-left text-xs py-2 px-4 rounded-xl transition-colors hover:text-rose-400"
                            style={{ color: 'var(--student-white-dim)', fontFamily: 'var(--student-font-body)' }}
                        >Sign out</button>
                    </div>
                </div>

                {/* Main column */}
                <div className="flex-1 flex flex-col min-h-0">

                    {/* ── Fixed topbar — sits outside scroll area */}
                    <div
                        className="sticky top-0 z-20 flex items-center justify-between px-5 py-4 lg:px-10"
                        style={{
                            background: 'rgba(8,8,8,0.88)',
                            backdropFilter: 'blur(18px)',
                            borderBottom: '1px solid rgba(201,168,76,0.08)',
                        }}
                    >
                        <div className="flex items-center gap-3">
                            {/* Hamburger: sidebar mode only */}
                            {useSidebar && (
                                <button
                                    className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl"
                                    onClick={() => setSidebarOpen(true)}
                                    style={{ background: 'var(--student-black-4)', color: 'var(--student-gold)' }}
                                >
                                    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="w-4 h-4">
                                        <path d="M2 5h14M2 9h14M2 13h14" />
                                    </svg>
                                </button>
                            )}
                            <div>
                                <p
                                    className="text-[10px] uppercase tracking-widest"
                                    style={{ color: 'var(--student-white-dim)', fontFamily: 'var(--student-font-mono)' }}
                                >
                                    {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                                <h1
                                    className="text-xl font-black mt-0.5"
                                    style={{ color: 'var(--student-white)', fontFamily: 'var(--student-font-display)' }}
                                >
                                    {currentTabLabel}
                                </h1>
                            </div>
                        </div>

                        {/* Avatar */}
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
                            style={{
                                background: 'linear-gradient(135deg, var(--student-gold), var(--student-gold-2))',
                                color: 'var(--student-black)',
                                fontFamily: 'var(--student-font-display)',
                            }}
                        >{profile.name?.charAt(0).toUpperCase()}</div>
                    </div>

                    {/* Scrollable content */}
                    <div ref={scrollRef} className={`flex-1 overflow-y-auto ${useSidebar ? 'pb-8' : 'pb-28'} lg:pb-8`}>
                        <div className="px-5 pt-5 lg:px-10">

                            {/* HOME */}
                            {tab === 'home' && (
                                <div className="space-y-5">
                                    <GWABlock profile={profile} gwa={gwa} gwaMeta={gwaMeta} sparkData={sparkData} cleared={cleared} />

                                    {activeSchedule && (
                                        <Block
                                            className="p-5"
                                            style={{
                                                background: 'linear-gradient(135deg, var(--student-gold-dim), rgba(201,168,76,0.02))',
                                                borderColor: 'rgba(201,168,76,0.2)',
                                            }}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--student-gold)', fontFamily: 'var(--student-font-mono)' }}>
                                                    Next Class
                                                </p>
                                                <span className="text-[11px] px-3 py-0.5 rounded-full" style={{ color: 'var(--student-gold-2)', background: 'var(--student-gold-dim)', fontFamily: 'var(--student-font-mono)' }}>
                                                    {activeSchedule.time !== 'TBA' ? activeSchedule.time : 'TBA'}
                                                </span>
                                            </div>
                                            <h3 className="text-base font-bold mb-2 leading-snug" style={{ color: 'var(--student-white)', fontFamily: 'var(--student-font-display)' }}>
                                                {activeSchedule.title}
                                            </h3>
                                            <div className="flex gap-4">
                                                <span className="text-xs flex items-center gap-1.5" style={{ color: 'var(--student-white-dim)' }}>🏛️ {activeSchedule.room !== 'TBA' ? activeSchedule.room : 'Room TBA'}</span>
                                                <span className="text-xs flex items-center gap-1.5" style={{ color: 'var(--student-white-dim)' }}>👔 {activeSchedule.instructor || 'TBA'}</span>
                                            </div>
                                        </Block>
                                    )}

                                    <Block className="p-5">
                                        <p className="text-[10px] uppercase tracking-widest font-bold mb-3" style={{ color: 'var(--student-white-dim)', fontFamily: 'var(--student-font-mono)' }}>
                                            Academic Performance
                                        </p>
                                        <div className="flex gap-3">
                                            <StatMini label="Earned" value={earned} unit="units" color="var(--student-gold)" />
                                            <StatMini label="This Sem" value={enrolledUnits} unit="units" color="var(--student-gold-2)" />
                                            <StatMini label="Passed" value={passed} unit="subjs" color="var(--student-green)" />
                                        </div>
                                    </Block>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Block className="p-5 cursor-pointer" onClick={() => setClearanceModal(true)}>
                                            <p className="text-sm font-bold mb-2" style={{ color: 'var(--student-white)', fontFamily: 'var(--student-font-display)' }}>Clearance Status</p>
                                            <div className="flex items-center gap-3 mb-1">
                                                <p className="text-2xl font-black leading-none" style={{ color: cleared ? 'var(--student-green)' : 'var(--student-gold)', fontFamily: 'var(--student-font-display)' }}>
                                                    {cleared ? 'Cleared' : 'Pending'}
                                                </p>
                                                <span className="text-[10px] underline decoration-dotted" style={{ color: 'var(--student-white-dim)', fontFamily: 'var(--student-font-mono)' }}>
                                                    View Details
                                                </span>
                                            </div>
                                            {failed > 0 && (
                                                <p className="text-[10px] mt-1" style={{ color: 'var(--student-red)', fontFamily: 'var(--student-font-mono)' }}>
                                                    ⚠ {failed} failed subject{failed > 1 ? 's' : ''} detected
                                                </p>
                                            )}
                                        </Block>

                                        <Block className="p-5">
                                            <p className="text-[10px] uppercase tracking-widest font-bold mb-3" style={{ color: 'var(--student-white-dim)', fontFamily: 'var(--student-font-mono)' }}>
                                                Quick Actions
                                            </p>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => setTab('enrollment')}
                                                    className="py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95"
                                                    style={{ background: 'var(--student-gold)', color: 'var(--student-black)', fontFamily: 'var(--student-font-body)' }}
                                                >Enroll Now</button>
                                                <button
                                                    onClick={() => setTab('support')}
                                                    className="py-2.5 rounded-xl text-xs font-bold transition-all"
                                                    style={{ background: 'var(--student-black-4)', color: 'var(--student-white-dim)', border: '1px solid rgba(201,168,76,0.15)', fontFamily: 'var(--student-font-body)' }}
                                                >Support</button>
                                            </div>
                                        </Block>
                                    </div>
                                </div>
                            )}

                            {/* SCHEDULE */}
                            {tab === 'sched' && (
                                <div className="space-y-3">
                                    {schedule.length > 0 ? schedule.map((sub, i) => (
                                        <Block key={i} className="p-5 flex items-center gap-5">
                                            <div
                                                className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                                                style={{ background: 'var(--student-gold-dim)', color: 'var(--student-gold)', border: '1px solid rgba(201,168,76,0.2)', fontFamily: 'var(--student-font-mono)' }}
                                            >{sub.code?.substring(0, 3)}</div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start gap-2">
                                                    <p className="font-bold text-base truncate" style={{ color: 'var(--student-white)', fontFamily: 'var(--student-font-display)' }}>{sub.code}</p>
                                                    <span className="text-[11px] font-bold flex-shrink-0" style={{ color: 'var(--student-gold)', fontFamily: 'var(--student-font-mono)' }}>
                                                        {sub.time !== 'TBA' ? sub.time : 'TBA'}
                                                    </span>
                                                </div>
                                                <p className="text-xs truncate mt-1" style={{ color: 'var(--student-white-dim)' }}>{sub.title}</p>
                                                <div className="flex gap-3 mt-1.5">
                                                    <span className="text-[10px]" style={{ color: 'rgba(245,240,232,0.4)', fontFamily: 'var(--student-font-mono)' }}>📍 {sub.room !== 'TBA' ? sub.room : 'Room TBA'}</span>
                                                    <span className="text-[10px]" style={{ color: 'rgba(245,240,232,0.4)', fontFamily: 'var(--student-font-mono)' }}>👤 {sub.instructor || 'TBA'}</span>
                                                </div>
                                            </div>
                                        </Block>
                                    )) : (
                                        <Block className="p-16 text-center">
                                            <p className="text-sm font-medium" style={{ color: 'var(--student-white-dim)' }}>No enrolled subjects found for this term.</p>
                                        </Block>
                                    )}
                                </div>
                            )}

                            {/* GRADES */}
                            {tab === 'grades' && (
                                <GradesTab grades={grades} gwa={gwa} gwaMeta={gwaMeta} passed={passed} failed={failed} earned={earned} academicStanding={academicStanding} />
                            )}

                            {/* SMART ENROLLMENT */}
                            {tab === 'enrollment' && (
                                <SmartEnrollmentTab academicStanding={academicStanding} onSuccess={() => { fetchAll(); setTab('status'); }} />
                            )}

                            {/* SUPPORT */}
                            {tab === 'support' && <SupportAssistantTab />}

                            {/* CONSULT */}
                            {tab === 'consult' && <ConsultationBookingTab />}

                            {/* STATUS */}
                            {tab === 'status' && (
                                <div className="space-y-3">
                                    {enrollment.length > 0 ? enrollment.map(req => {
                                        const cfg = {
                                            PENDING_REVIEW: { color: 'var(--student-gold)', bg: 'rgba(201,168,76,0.08)', label: 'Pending Review' },
                                            APPROVED: { color: 'var(--student-green)', bg: 'rgba(39,174,96,0.08)', label: 'Approved' },
                                            REJECTED: { color: 'var(--student-red)', bg: 'rgba(192,57,43,0.08)', label: 'Rejected' },
                                        }[req.review_status] ?? { color: '#64748b', bg: 'rgba(255,255,255,0.04)', label: req.review_status };

                                        return (
                                            <Block key={req.request_id} className="p-5" style={{ background: cfg.bg, border: `1px solid ${cfg.color}33` }}>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="text-base font-bold" style={{ color: cfg.color, fontFamily: 'var(--student-font-display)' }}>{cfg.label}</p>
                                                        <p className="text-[11px] mt-1.5 uppercase tracking-wider" style={{ color: 'var(--student-white-dim)', fontFamily: 'var(--student-font-mono)' }}>
                                                            Submitted: {req.date_submitted ? new Date(req.date_submitted).toLocaleDateString() : 'N/A'}
                                                        </p>
                                                        {req.admin_review_notes && (
                                                            <div className="mt-3 p-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                                <p className="text-[10px] uppercase font-bold mb-1 opacity-40" style={{ color: 'var(--student-white-dim)', fontFamily: 'var(--student-font-mono)' }}>Reviewer Notes</p>
                                                                <p className="text-xs italic leading-relaxed" style={{ color: 'var(--student-white-dim)' }}>{req.admin_review_notes}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] font-bold" style={{ color: 'rgba(245,240,232,0.3)', fontFamily: 'var(--student-font-mono)' }}>REQ-{req.request_id}</span>
                                                </div>
                                            </Block>
                                        );
                                    }) : (
                                        <Block className="p-16 text-center">
                                            <p className="text-sm mb-6 font-medium" style={{ color: 'var(--student-white-dim)' }}>No enrollment applications found.</p>
                                            <button
                                                onClick={() => setTab('enrollment')}
                                                className="text-xs font-bold px-8 py-3 rounded-full transition-all active:scale-95"
                                                style={{ background: 'var(--student-gold)', color: 'var(--student-black)', fontFamily: 'var(--student-font-body)' }}
                                            >Start New Application</button>
                                        </Block>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>

            {/* ── Mobile bottom nav — bottom nav mode only */}
            {!useSidebar && (
                <div
                    className="fixed bottom-0 left-0 right-0 z-30 lg:hidden"
                    style={{
                        background: 'rgba(8,8,8,0.97)',
                        backdropFilter: 'blur(24px)',
                        borderTop: '1px solid rgba(201,168,76,0.1)',
                        paddingBottom: 'env(safe-area-inset-bottom)',
                    }}
                >
                    {/* Dot slider */}
                    <DotSlider
                        tabs={PRIMARY_TABS}
                        activeId={tab}
                        onSelect={handleTabSelect}
                    />

                    {/* 5-slot nav bar */}
                    <div className="flex items-end px-2 pb-2">

                        {/* Slot 1 — Schedule */}
                        <BottomNavItem
                            icon={<CurriculumIcon />}
                            label="Schedule"
                            active={tab === 'sched'}
                            onClick={() => handleTabSelect('sched')}
                        />

                        {/* Slot 2 — Grades */}
                        <BottomNavItem
                            icon={<GradebookIcon />}
                            label="Grades"
                            active={tab === 'grades'}
                            onClick={() => handleTabSelect('grades')}
                        />

                        {/* Slot 3 — Overview FAB (center, elevated) */}
                        <div className="flex-1 flex flex-col items-center justify-end pb-1 relative" style={{ marginTop: -18 }}>
                            <button
                                onClick={() => handleTabSelect('home')}
                                className="flex flex-col items-center gap-1 group"
                            >
                                <div
                                    className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 active:scale-95"
                                    style={{
                                        background: tab === 'home'
                                            ? 'linear-gradient(135deg, var(--student-gold), var(--student-gold-2))'
                                            : 'var(--student-black-4)',
                                        boxShadow: tab === 'home'
                                            ? '0 0 24px rgba(201,168,76,0.45), 0 4px 16px rgba(0,0,0,0.5)'
                                            : '0 4px 12px rgba(0,0,0,0.4)',
                                        border: tab === 'home'
                                            ? 'none'
                                            : '1px solid rgba(201,168,76,0.2)',
                                        color: tab === 'home' ? 'var(--student-black)' : 'var(--student-gold)',
                                        transform: tab === 'home' ? 'translateY(-2px) scale(1.05)' : 'translateY(0) scale(1)',
                                        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                                    }}
                                >
                                    <span className="w-6 h-6 flex items-center justify-center">
                                        <OverviewIcon />
                                    </span>
                                </div>
                                <span
                                    className="text-[10px] font-bold"
                                    style={{
                                        color: tab === 'home' ? 'var(--student-gold)' : 'var(--student-white-dim)',
                                        fontFamily: 'var(--student-font-body)',
                                    }}
                                >Overview</span>
                            </button>
                        </div>

                        {/* Slot 4 — Enroll */}
                        <BottomNavItem
                            icon={<AdmissionsIcon />}
                            label="Enroll"
                            active={tab === 'enrollment'}
                            onClick={() => handleTabSelect('enrollment')}
                        />

                        {/* Slot 5 — Settings */}
                        <button
                            onClick={() => setSettingsOpen(true)}
                            className="flex-1 flex flex-col items-center justify-center py-3 gap-1"
                        >
                            <span
                                className="w-5 h-5 flex items-center justify-center transition-all duration-200"
                                style={{
                                    color: settingsOpen ? 'var(--student-gold)' : 'var(--student-white-dim)',
                                    filter: settingsOpen ? 'drop-shadow(0 0 6px var(--student-gold))' : 'none',
                                }}
                            >
                                <GearIcon />
                            </span>
                            <span
                                className="text-[10px] font-semibold"
                                style={{
                                    color: settingsOpen ? 'var(--student-gold)' : 'var(--student-white-dim)',
                                    fontFamily: 'var(--student-font-body)',
                                }}
                            >Settings</span>
                        </button>

                    </div>
                </div>
            )}

            {/* Clearance modal */}
            {clearanceModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
                    style={{ background: 'rgba(0,0,0,0.8)' }}
                    onClick={() => setClearanceModal(false)}
                >
                    <Block
                        className="p-8 max-w-sm w-full"
                        style={{ border: `1px solid ${cleared ? 'var(--student-green)' : 'var(--student-gold)'}66` }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-start mb-5">
                            <h3 className="text-xl font-bold" style={{ color: 'var(--student-white)', fontFamily: 'var(--student-font-display)' }}>Clearance Details</h3>
                            <button onClick={() => setClearanceModal(false)} style={{ color: 'var(--student-white-dim)' }}>✕</button>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-xl mb-5" style={{ background: cleared ? 'rgba(39,174,96,0.1)' : 'rgba(201,168,76,0.1)' }}>
                            <span className="text-3xl">{cleared ? '📜' : '⏳'}</span>
                            <div>
                                <p className="font-bold text-base" style={{ color: cleared ? 'var(--student-green)' : 'var(--student-gold)', fontFamily: 'var(--student-font-display)' }}>
                                    {cleared ? 'Account Cleared' : 'Hold Status'}
                                </p>
                                <p className="text-[10px] mt-0.5 uppercase" style={{ color: 'rgba(245,240,232,0.3)', fontFamily: 'var(--student-font-mono)' }}>
                                    Updated: {new Date().toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <p className="text-sm leading-relaxed mb-7" style={{ color: 'var(--student-white-dim)' }}>
                            {profile?.clearance?.details || (
                                cleared
                                    ? 'Your account is in good standing. You are cleared for all semestral enrollment activities.'
                                    : 'There are pending requirements on your account. Please settle these with the respective offices.'
                            )}
                        </p>

                        <button
                            onClick={() => setClearanceModal(false)}
                            className="w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95"
                            style={{ background: 'var(--student-black-4)', color: 'var(--student-gold)', border: '1px solid rgba(201,168,76,0.2)', fontFamily: 'var(--student-font-body)' }}
                        >Acknowledge</button>
                    </Block>
                </div>
            )}
        </div>
    );
};

// ── Bottom nav item (for non-center slots)
const BottomNavItem = ({ icon, label, active, onClick }) => (
    <button onClick={onClick} className="flex-1 flex flex-col items-center justify-center py-3 gap-1 relative">
        {active && (
            <div className="absolute top-0 w-8 h-0.5 rounded-b-full" style={{ background: 'var(--student-gold)' }} />
        )}
        <span
            className="w-5 h-5 flex items-center justify-center transition-all duration-200"
            style={{
                filter: active ? 'drop-shadow(0 0 6px var(--student-gold))' : 'none',
                transform: active ? 'scale(1.1) translateY(-1px)' : 'scale(1)',
                color: active ? 'var(--student-gold)' : 'var(--student-white-dim)',
            }}
        >{icon}</span>
        <span
            className="text-[10px] font-semibold"
            style={{ color: active ? 'var(--student-gold)' : 'var(--student-white-dim)', fontFamily: 'var(--student-font-body)' }}
        >{label}</span>
    </button>
);

export default StudentDashboard;