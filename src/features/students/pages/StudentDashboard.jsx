import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthContext';
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
import { useNotificationPoller } from '../../../hooks/useNotificationPoller';
import OnboardingWizard from '../../../components/ui/OnboardingWizard';
import {
    Chart as ChartJS, CategoryScale, LinearScale,
    PointElement, LineElement, Filler, Tooltip,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const STUDENT_ONBOARDING_STEPS = [
    {
        icon: '🎓',
        title: 'Welcome, {name}!',
        subtitle: 'NexEnroll Student Portal',
        body: 'Everything you need for your academic journey is right here — enroll in subjects, track grades, upload your COR, and get AI-powered support.',
    },
    {
        icon: '✨',
        title: 'Smart Enrollment',
        subtitle: 'Powered by AI',
        body: 'The Enroll tab uses AI to recommend subjects based on your prerequisites and academic standing. Drag subjects into the schedule builder to create your load.',
        highlight: 'Enroll tab → drag & drop',
    },
    {
        icon: '📊',
        title: 'Grades & Support',
        subtitle: 'Track your progress',
        body: 'View your academic records by semester in the Grades tab. The Support Assistant automatically routes your concern to the right office.',
        highlight: 'Grades · Support tabs',
    },
    {
        icon: '🚀',
        title: "You're all set!",
        subtitle: 'Ready to begin',
        body: 'Start by checking your overview or heading to Enroll. Your academic advisor is just a support ticket away if you need help.',
        cta: 'Start Exploring',
    },
];

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

// ── Clearance status pill
const ClearancePill = ({ status }) => {
    const cfg = {
        CLEARED:       { color: 'var(--student-green)',    bg: 'var(--student-green-dim)',  label: 'Cleared' },
        VERIFIED:      { color: 'var(--student-green)',    bg: 'var(--student-green-dim)',  label: 'Verified' },
        PENDING:       { color: 'var(--student-gold)',     bg: 'var(--student-gold-dim)',   label: 'Pending' },
        NOT_SUBMITTED: { color: 'var(--student-gold)',     bg: 'var(--student-gold-dim)',   label: 'Not Submitted' },
        UNCLEARED:     { color: 'var(--student-red)',      bg: 'rgba(192,57,43,0.12)',      label: 'Uncleared' },
        REJECTED:      { color: 'var(--student-red)',      bg: 'rgba(192,57,43,0.12)',      label: 'Rejected' },
    }[status] ?? { color: 'rgba(245,240,232,0.3)', bg: 'rgba(245,240,232,0.05)', label: status ?? '—' };

    return (
        <span
            className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
            style={{ color: cfg.color, background: cfg.bg, fontFamily: 'var(--student-font-mono)', letterSpacing: '0.04em' }}
        >
            {cfg.label}
        </span>
    );
};

// ── Inline clearance block (home tab)
const ClearanceBlock = ({ profile, ojtClearance, equipClearance }) => {
    const enrollStatus = profile?.clearance?.status ?? 'PENDING';

    const rows = [
        {
            icon: '📋',
            label: 'Enrollment Clearance',
            status: enrollStatus,
            detail: enrollStatus === 'CLEARED' ? 'No outstanding enrollment holds' : 'Enrollment request pending review',
        },
        {
            icon: '🏢',
            label: 'OJT Clearance',
            status: ojtClearance?.ojt_clearance_status ?? null,
            detail: ojtClearance
                ? ojtClearance.ojt_clearance_status === 'VERIFIED'
                    ? 'OJT documents verified'
                    : ojtClearance.ojt_clearance_status === 'NOT_SUBMITTED'
                    ? 'No OJT documents submitted yet'
                    : ojtClearance.ojt_clearance_status === 'REJECTED'
                    ? 'OJT documents rejected — resubmit required'
                    : 'OJT documents under review'
                : 'Loading…',
        },
        {
            icon: '🖥️',
            label: 'Equipment Clearance',
            status: equipClearance?.equipment_clearance_status ?? null,
            detail: equipClearance
                ? equipClearance.equipment_clearance_status === 'CLEARED'
                    ? 'No unreturned equipment'
                    : `${equipClearance.active_checkouts} active, ${equipClearance.overdue_checkouts} overdue checkout${equipClearance.overdue_checkouts !== 1 ? 's' : ''}`
                : 'Loading…',
            badge: equipClearance?.overdue_checkouts > 0
                ? `${equipClearance.overdue_checkouts} overdue`
                : null,
        },
    ];

    return (
        <div
            className="rounded-2xl p-5"
            style={{ background: 'var(--student-black-3)', border: '1px solid rgba(201,168,76,0.08)' }}
        >
            <p
                className="text-[10px] uppercase tracking-widest font-bold mb-4"
                style={{ color: 'var(--student-white-dim)', fontFamily: 'var(--student-font-mono)' }}
            >
                Clearance Status
            </p>
            <div className="space-y-3">
                {rows.map(row => (
                    <div
                        key={row.label}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                        style={{ background: 'var(--student-black-4)', border: '1px solid rgba(201,168,76,0.06)' }}
                    >
                        <span className="text-base flex-shrink-0">{row.icon}</span>
                        <div className="flex-1 min-w-0">
                            <p
                                className="text-xs font-semibold leading-none mb-1"
                                style={{ color: 'var(--student-white)', fontFamily: 'var(--student-font-body)' }}
                            >
                                {row.label}
                            </p>
                            <p
                                className="text-[10px] leading-none"
                                style={{ color: 'var(--student-white-dim)', fontFamily: 'var(--student-font-mono)' }}
                            >
                                {row.detail}
                                {row.badge && (
                                    <span
                                        className="ml-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                                        style={{ background: 'rgba(192,57,43,0.15)', color: 'var(--student-red)' }}
                                    >
                                        {row.badge}
                                    </span>
                                )}
                            </p>
                        </div>
                        {row.status
                            ? <ClearancePill status={row.status} />
                            : <span className="text-[10px]" style={{ color: 'rgba(245,240,232,0.2)', fontFamily: 'var(--student-font-mono)' }}>—</span>
                        }
                    </div>
                ))}
            </div>
        </div>
    );
};

// ── Enrollment status banner (persistent, dismissable)
const EnrollmentStatusBanner = ({ status, onDismiss }) => {
    const isApproved = status === 'APPROVED';
    return (
        <div
            className="rounded-2xl p-4 flex items-start gap-4"
            style={{
                background: isApproved ? 'rgba(39,174,96,0.08)' : 'rgba(192,57,43,0.08)',
                border: `1px solid ${isApproved ? 'rgba(39,174,96,0.28)' : 'rgba(192,57,43,0.28)'}`,
                position: 'relative',
            }}
        >
            {/* Left accent stripe */}
            <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, borderRadius: '12px 0 0 12px',
                background: isApproved ? 'var(--student-green)' : 'var(--student-red)',
            }} />
            <span className="text-2xl flex-shrink-0" style={{ marginLeft: 4 }}>
                {isApproved ? '🎉' : '⚠️'}
            </span>
            <div className="flex-1 min-w-0">
                <p
                    className="text-[10px] uppercase tracking-widest font-bold mb-1"
                    style={{ color: isApproved ? 'var(--student-green)' : 'var(--student-red)', fontFamily: 'var(--student-font-mono)' }}
                >
                    Enrollment {isApproved ? 'Approved' : 'Not Approved'}
                </p>
                <p
                    className="text-sm font-semibold mb-0.5"
                    style={{ color: 'var(--student-white)', fontFamily: 'var(--student-font-display)' }}
                >
                    {isApproved
                        ? 'Your enrollment has been approved!'
                        : 'Your enrollment was not approved.'}
                </p>
                <p
                    className="text-xs"
                    style={{ color: 'var(--student-white-dim)', fontFamily: 'var(--student-font-body)' }}
                >
                    {isApproved
                        ? 'Check the Enrollment Status tab for your confirmed subjects.'
                        : 'See the Enrollment Status tab for reviewer notes, then resubmit.'}
                </p>
            </div>
            <button
                onClick={onDismiss}
                className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-xs transition-colors"
                style={{ background: 'rgba(255,255,255,0.07)', color: 'var(--student-white-dim)' }}
                aria-label="Dismiss notification"
            >✕</button>
        </div>
    );
};

// ── Main dashboard
const StudentDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [grades, setGrades] = useState([]);
    const [schedule, setSchedule] = useState([]);
    const [enrollment, setEnrollment] = useState([]);
    const [academicStanding, setAcademicStanding] = useState(null);
    const [atRisk, setAtRisk] = useState(null);
    const [tab, setTab] = useState('home');
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [ojtClearance, setOjtClearance] = useState(null);
    const [equipClearance, setEquipClearance] = useState(null);
    const [enrollmentBanner, setEnrollmentBanner] = useState(null); // { status, isNew }
    const [settingsOpen, setSettingsOpen] = useState(false);

    const [navPref, setNavPref] = useState(() => localStorage.getItem(NAV_PREF_KEY) || 'bottom');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const scrollRef = useRef(null);

    // ── Notification bell state ───────────────────────────────────────────────
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [bellOpen, setBellOpen] = useState(false);
    const bellRef = useRef(null);

    const refreshNotifications = useCallback(async () => {
        try {
            const data = await studentApi.fetchNotifications();
            setNotifications(data.notifications ?? []);
            setUnreadCount(data.unread_count ?? 0);
        } catch { /* silent */ }
    }, []);

    useEffect(() => { refreshNotifications(); }, []);

    const handleMarkRead = async (id) => {
        setNotifications(prev => prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
        try { await studentApi.markNotificationRead(id); } catch { /* silent */ }
    };

    const handleMarkAllRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
        try { await studentApi.markAllNotificationsRead(); } catch { /* silent */ }
    };

    useNotificationPoller({
        onNewNotification: (notif) => {
            showToast(`${notif.title}: ${notif.message}`, 'success');
            refreshNotifications();
        },
    });

    // Close bell dropdown on outside click
    useEffect(() => {
        if (!bellOpen) return;
        const handler = (e) => {
            if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [bellOpen]);

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
        try {
            const enrollData = await studentApi.fetchEnrollmentStatus();
            setEnrollment(enrollData);
            // Compute enrollment banner from most recent request
            const latest = enrollData?.[0];
            if (latest && (latest.review_status === 'APPROVED' || latest.review_status === 'REJECTED')) {
                const seenKey = `nexenroll_enrollment_seen_${user?.id}`;
                const seen = localStorage.getItem(seenKey);
                const bannerKey = `${latest.request_id}_${latest.review_status}`;
                if (seen !== bannerKey) {
                    setEnrollmentBanner({ status: latest.review_status, bannerKey });
                }
            }
        } catch { /* silent */ }
        try { setAcademicStanding(await studentApi.fetchAcademicStanding()); } catch { /* silent */ }
        try { setAtRisk(await studentApi.fetchAtRisk()); } catch { /* silent */ }
        try { setOjtClearance(await studentApi.fetchMyOJTClearance()); } catch { /* silent */ }
        try { setEquipClearance(await studentApi.fetchMyEquipmentClearance()); } catch { /* silent */ }
        setLoading(false);
    };

    useEffect(() => { fetchAll(); }, []);

    useEffect(() => {
        if (!loading && profile && user?.id) {
            const key = `nexenroll_onboarded_student_${user.id}`;
            if (!localStorage.getItem(key)) setShowOnboarding(true);
        }
    }, [loading, profile]);

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

            {showOnboarding && (
                <OnboardingWizard
                    steps={STUDENT_ONBOARDING_STEPS}
                    variant="student"
                    userName={profile?.name}
                    onComplete={() => {
                        localStorage.setItem(`nexenroll_onboarded_student_${user.id}`, '1');
                        setShowOnboarding(false);
                    }}
                />
            )}

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

                        {/* Notification Bell + Avatar */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {/* Bell */}
                            <div ref={bellRef} style={{ position: 'relative' }}>
                                <button
                                    id="notification-bell-btn"
                                    onClick={() => setBellOpen(v => !v)}
                                    style={{
                                        position: 'relative', width: 36, height: 36,
                                        borderRadius: 10, border: '1px solid rgba(201,168,76,0.15)',
                                        background: bellOpen ? 'var(--student-gold-dim)' : 'var(--student-black-4)',
                                        color: 'var(--student-gold)', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'all 0.15s',
                                    }}
                                    aria-label="Notifications"
                                >
                                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
                                        <path d="M10 2a6 6 0 0 1 6 6c0 3 1.5 4 2 5H2c.5-1 2-2 2-5a6 6 0 0 1 6-6z" />
                                        <path d="M8.5 17a1.5 1.5 0 0 0 3 0" />
                                    </svg>
                                    {unreadCount > 0 && (
                                        <span style={{
                                            position: 'absolute', top: -4, right: -4,
                                            minWidth: 16, height: 16, borderRadius: 999,
                                            background: 'var(--student-red)',
                                            color: '#fff', fontSize: 9, fontWeight: 800,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            padding: '0 3px', fontFamily: 'var(--student-font-mono)',
                                            border: '2px solid var(--student-black)',
                                        }}>
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Dropdown */}
                                {bellOpen && (
                                    <div id="notification-dropdown" style={{
                                        position: 'absolute', top: 44, right: 0,
                                        width: 320, maxHeight: 420, overflowY: 'auto',
                                        background: 'var(--student-black-2)',
                                        border: '1px solid rgba(201,168,76,0.15)',
                                        borderRadius: 14, boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                                        zIndex: 100,
                                    }}>
                                        {/* Header */}
                                        <div style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '12px 16px 10px',
                                            borderBottom: '1px solid rgba(201,168,76,0.08)',
                                        }}>
                                            <span style={{ fontFamily: 'var(--student-font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--student-white-dim)', textTransform: 'uppercase' }}>
                                                Notifications
                                            </span>
                                            {unreadCount > 0 && (
                                                <button
                                                    id="mark-all-read-btn"
                                                    onClick={handleMarkAllRead}
                                                    style={{
                                                        background: 'transparent', border: 'none', cursor: 'pointer',
                                                        fontFamily: 'var(--student-font-mono)', fontSize: 9, fontWeight: 700,
                                                        color: 'var(--student-gold)', letterSpacing: '0.08em', textTransform: 'uppercase',
                                                    }}
                                                >
                                                    Mark all read
                                                </button>
                                            )}
                                        </div>

                                        {/* Items */}
                                        {notifications.length === 0 ? (
                                            <div style={{ padding: '24px 16px', textAlign: 'center', fontFamily: 'var(--student-font-mono)', fontSize: 11, color: 'var(--student-white-dim)' }}>
                                                No notifications yet
                                            </div>
                                        ) : notifications.slice(0, 10).map(n => (
                                            <button
                                                key={n.notification_id}
                                                onClick={() => handleMarkRead(n.notification_id)}
                                                style={{
                                                    width: '100%', textAlign: 'left', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'flex-start', gap: 10,
                                                    padding: '11px 16px',
                                                    background: n.is_read ? 'transparent' : 'rgba(201,168,76,0.04)',
                                                    border: 'none',
                                                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                                                    transition: 'background 0.12s',
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.07)'}
                                                onMouseLeave={e => e.currentTarget.style.background = n.is_read ? 'transparent' : 'rgba(201,168,76,0.04)'}
                                            >
                                                {/* Unread dot */}
                                                <span style={{
                                                    flexShrink: 0, marginTop: 5,
                                                    width: 6, height: 6, borderRadius: 999,
                                                    background: n.is_read ? 'transparent' : 'var(--student-gold)',
                                                }} />
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{ margin: 0, fontFamily: 'var(--student-font-body)', fontSize: 12, fontWeight: n.is_read ? 500 : 700, color: 'var(--student-white)', lineHeight: 1.3 }}>
                                                        {n.title}
                                                    </p>
                                                    <p style={{ margin: '2px 0 0', fontFamily: 'var(--student-font-body)', fontSize: 11, color: 'var(--student-white-dim)', lineHeight: 1.4 }}>
                                                        {n.message}
                                                    </p>
                                                    <p style={{ margin: '4px 0 0', fontFamily: 'var(--student-font-mono)', fontSize: 9, color: 'rgba(201,168,76,0.5)', letterSpacing: '0.05em' }}>
                                                        {n.age}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
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
                    </div>

                    {/* Scrollable content */}
                    <div ref={scrollRef} className={`flex-1 overflow-y-auto ${useSidebar ? 'pb-8' : 'pb-28'} lg:pb-8`}>
                        <div className="px-5 pt-5 lg:px-10">

                            {/* HOME */}
                            {tab === 'home' && (
                                <div className="space-y-5">
                                    {enrollmentBanner && (
                                        <EnrollmentStatusBanner
                                            status={enrollmentBanner.status}
                                            onDismiss={() => {
                                                localStorage.setItem(`nexenroll_enrollment_seen_${user?.id}`, enrollmentBanner.bannerKey);
                                                setEnrollmentBanner(null);
                                            }}
                                        />
                                    )}
                                    <GWABlock profile={profile} gwa={gwa} gwaMeta={gwaMeta} sparkData={sparkData} cleared={cleared} />

                                    {/* Reformed Student Guidance Banner */}
                                    {profile?.was_reformed && (
                                        <Block
                                            className="p-5"
                                            style={{
                                                background: 'linear-gradient(135deg, rgba(39,174,96,0.06), rgba(39,174,96,0.02))',
                                                border: '1px solid rgba(39,174,96,0.2)',
                                                position: 'relative',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            {/* Subtle left accent */}
                                            <div style={{
                                                position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
                                                background: 'linear-gradient(to bottom, var(--student-green), var(--student-green-2))',
                                                borderRadius: '3px 0 0 3px',
                                            }} />

                                            <div className="flex items-start gap-4">
                                                <div
                                                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                                                    style={{
                                                        background: 'var(--student-green-dim2)',
                                                        border: '1px solid rgba(39,174,96,0.3)',
                                                        fontSize: '1.25rem',
                                                    }}
                                                >🌱</div>
                                                <div className="flex-1 min-w-0">
                                                    <p
                                                        className="text-[10px] uppercase tracking-widest font-bold mb-1"
                                                        style={{ color: 'var(--student-green)', fontFamily: 'var(--student-font-mono)' }}
                                                    >
                                                        A Message for You — Second Chance
                                                    </p>
                                                    <p
                                                        className="text-sm leading-relaxed mb-3"
                                                        style={{ color: 'var(--student-white)', fontFamily: 'var(--student-font-body)' }}
                                                    >
                                                        Welcome back, <strong style={{ color: 'var(--student-green-2)' }}>{profile.name?.split(' ')[0]}</strong>. We all make mistakes — that&apos;s part of growing up. But what truly defines you is not the fall, it&apos;s the <strong>decision to stand back up and do better.</strong>
                                                    </p>
                                                    <p
                                                        className="text-xs leading-relaxed mb-3"
                                                        style={{ color: 'var(--student-white-dim)', fontFamily: 'var(--student-font-body)' }}
                                                    >
                                                        Your account has been restored because we believe in you. This institution — your professors, your classmates, and the people who built this system — all want to see you succeed. Academic integrity isn&apos;t just a rule; it&apos;s a promise you make to yourself and to everyone who believes in your future. Treat every interaction here with <strong style={{ color: 'var(--student-white)' }}>respect, honesty, and professionalism</strong>, and you&apos;ll never have to see that wall again.
                                                    </p>
                                                    <div
                                                        className="flex items-center gap-2 px-3 py-2 rounded-lg"
                                                        style={{
                                                            background: 'var(--student-green-dim)',
                                                            border: '1px solid rgba(39,174,96,0.15)',
                                                            display: 'inline-flex',
                                                        }}
                                                    >
                                                        <span style={{ fontSize: '.75rem' }}>✦</span>
                                                        <span
                                                            className="text-[11px] font-semibold"
                                                            style={{ color: 'var(--student-green)', fontFamily: 'var(--student-font-mono)', letterSpacing: '.03em' }}
                                                        >
                                                            Make this chapter count. We&apos;re rooting for you.
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Block>
                                    )}

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

                                    <ClearanceBlock
                                        profile={profile}
                                        ojtClearance={ojtClearance}
                                        equipClearance={equipClearance}
                                    />

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
                                <GradesTab grades={grades} gwa={gwa} gwaMeta={gwaMeta} passed={passed} failed={failed} earned={earned} academicStanding={academicStanding} atRisk={atRisk} />
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