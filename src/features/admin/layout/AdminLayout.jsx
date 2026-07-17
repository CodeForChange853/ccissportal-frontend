import React, {
    useState, useEffect, useRef,
    createContext, useContext,
} from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthContext';
import CommandPalette from '../../../components/CommandPalette';
import { TabProvider } from '../../../context/TabContext';
import TabBar from '../../../components/TabBar';
import PortalLayout from '../../../components/layout/PortalLayout';
import { OverseerCornerBadge } from '../components/dashboard/AISystemOverseer';
import {
    OverviewIcon, EnrollmentsIcon, GradingIcon,
    CurriculumIcon, AdmissionsIcon, SupportIcon, FacultyIcon,
    UsersIcon, ShieldIcon, SettingsIcon, ForecastIcon, StudentRecordsIcon,
    HonorsIcon,
} from '../../../components/icons';
import AdminQuickNav from '../components/AdminQuickNav';
import IncidentBanner from '../components/IncidentBanner';
import EmergencyBar from '../components/EmergencyBar';
import { adminApi } from '../api/adminApi';

// ─────────────────────────────────────────────────────────────────────────────
// Navigation groups — ordered by operational frequency + criticality
// ─────────────────────────────────────────────────────────────────────────────
const NAV_GROUPS = [
    {
        label: 'Command Center',
        items: [
            { id: 'overview',    label: 'Intelligence HQ',   Icon: OverviewIcon,    path: '/portal/admin' },
            { id: 'enrollments', label: 'Enrollment Triage', Icon: EnrollmentsIcon, path: '/portal/admin/enrollments' },
            { id: 'support',     label: 'Support Triage',    Icon: SupportIcon,     path: '/portal/admin/support' },
        ],
    },
    {
        label: 'Academic',
        items: [
            { id: 'grading',     label: 'Academic Records',  Icon: GradingIcon,          path: '/portal/admin/grading' },
            { id: 'curriculum',  label: 'Master Curriculum', Icon: CurriculumIcon,        path: '/portal/admin/curriculum' },
            { id: 'forecast',    label: 'Demand Forecast',   Icon: ForecastIcon,          path: '/portal/admin/forecast' },
            { id: 'admissions',  label: 'Direct Admission',  Icon: AdmissionsIcon,        path: '/portal/admin/admissions' },
            { id: 'students',    label: 'Student Records',   Icon: StudentRecordsIcon,    path: '/portal/admin/students' },
            { id: 'honors',      label: 'Latin Honors',      Icon: HonorsIcon,            path: '/portal/admin/honors' },
        ],
    },
    {
        label: 'People',
        items: [
            { id: 'faculty', label: 'Faculty Balancer', Icon: FacultyIcon, path: '/portal/admin/faculty' },
            { id: 'users',   label: 'User Registry',    Icon: UsersIcon,   path: '/portal/admin/users'   },
        ],
    },
    {
        label: 'Security',
        variant: 'security',
        items: [
            { id: 'audit',    label: 'Audit Intelligence', Icon: ShieldIcon,   path: '/portal/admin/audit'    },
            { id: 'settings', label: 'System Controls',    Icon: SettingsIcon, path: '/portal/admin/settings' },
        ],
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// AdminRefreshContext — shared 90 s tick for all child pages
// ─────────────────────────────────────────────────────────────────────────────
export const AdminRefreshContext = createContext(0);
export const useAdminRefresh = () => useContext(AdminRefreshContext);

// ─────────────────────────────────────────────────────────────────────────────
// IncidentContext — derived from /audit/summary; drives banner + emergency bar
// Level: 'none' | 'elevated' | 'critical'
// ─────────────────────────────────────────────────────────────────────────────
export const IncidentContext = createContext({
    incidentLevel: 'none',
    anomalyScore:  0,
    eventCount:    0,
    isActive:      false,
    dismiss:       () => {},
});
export const useIncident = () => useContext(IncidentContext);

const POLL_INTERVAL_MS = 90_000;
const ALL_NAV = NAV_GROUPS.flatMap(g => g.items);

const AdminLayout = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // ── Refresh tick (90 s auto-poll)
    const [refreshTick,  setRefreshTick]  = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [logs,         setLogs]         = useState([]);
    const [paletteOpen,  setPaletteOpen]  = useState(false);
    const intervalRef = useRef(null);

    // ── Incident state
    const [incidentLevel, setIncidentLevel] = useState('none');
    const [anomalyScore,  setAnomalyScore]  = useState(0);
    const [eventCount,    setEventCount]    = useState(0);
    const [isDismissed,   setIsDismissed]   = useState(() => {
        const until = Number(localStorage.getItem('incident-dismiss-until') || 0);
        return Date.now() < until;
    });
    const [dismissUntil, setDismissUntil] = useState(() => {
        return Number(localStorage.getItem('incident-dismiss-until') || 0);
    });
    // Countdown re-checker — runs every second when dismissed
    useEffect(() => {
        if (!isDismissed || !dismissUntil) return;
        const id = setInterval(() => {
            if (Date.now() >= dismissUntil) {
                setIsDismissed(false);
                setDismissUntil(0);
                localStorage.removeItem('incident-dismiss-until');
                clearInterval(id);
            }
        }, 1000);
        return () => clearInterval(id);
    }, [isDismissed, dismissUntil]);

    const dismissIncident = () => {
        const until = Date.now() + 15 * 60 * 1000;
        setIsDismissed(true);
        setDismissUntil(until);
        localStorage.setItem('incident-dismiss-until', String(until));
    };

    const isIncidentActive = incidentLevel !== 'none' && !isDismissed;

    // ── 90 s auto-poll
    useEffect(() => {
        intervalRef.current = setInterval(() => setRefreshTick(t => t + 1), POLL_INTERVAL_MS);
        return () => clearInterval(intervalRef.current);
    }, []);

    // ── Poll audit summary on each tick to derive incident level
    useEffect(() => {
        let cancelled = false;
        adminApi.fetchAuditSummary()
            .then(data => {
                if (cancelled) return;
                const score  = data?.anomaly_score ?? data?.score ?? 0;
                const events = data?.high_anomaly_events ?? data?.flagged_events ?? data?.suspicious_events ?? 0;
                setAnomalyScore(score);
                setEventCount(events);
                if      (score >= 70) setIncidentLevel('critical');
                else if (score >= 40) setIncidentLevel('elevated');
                else                  setIncidentLevel('none');
            })
            .catch(() => { /* silent — never false-alarm on API error */ });
        return () => { cancelled = true; };
    }, [refreshTick]);

    // ── Global keyboard shortcuts
    useEffect(() => {
        const onKey = (e) => {
            // ⌘K / Ctrl+K — Command Palette
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setPaletteOpen(prev => !prev);
                return;
            }
            // Alt+Shift+A — jump to Audit Intelligence
            if (e.altKey && e.shiftKey && e.key.toUpperCase() === 'A') {
                e.preventDefault();
                navigate('/portal/admin/audit');
                return;
            }
            // Alt+Shift+L — Lock Down confirm (navigate to settings with flag)
            if (e.altKey && e.shiftKey && e.key.toUpperCase() === 'L') {
                e.preventDefault();
                navigate('/portal/admin/settings');
                return;
            }
            // Alt+R — force refresh
            if (e.altKey && e.key.toUpperCase() === 'R') {
                e.preventDefault();
                forceRefresh();
                return;
            }
            // Alt+T — theme toggle (handled inside PortalTopBar directly)
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [navigate]);

    const addLog = (msg) => {
        const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
        setLogs(prev => [`[${ts}] ${msg}`, ...prev].slice(0, 8));
    };

    const forceRefresh = () => {
        setIsRefreshing(true);
        setRefreshTick(t => t + 1);
        addLog('MANUAL: Force refresh triggered.');
        setTimeout(() => setIsRefreshing(false), 800);
    };

    // ── Active route detection
    const activeItem = ALL_NAV.find(item => {
        if (item.id === 'overview') {
            return location.pathname === '/portal/admin' || location.pathname === '/portal/admin/';
        }
        return location.pathname.startsWith(item.path);
    });
    const activeTab   = activeItem?.id ?? 'overview';
    const activeLabel = activeItem?.label || 'Dashboard';
    const breadcrumb  = ['Admin', activeLabel];

    // ── Dynamic sidebar badges: audit item shows incident level dot
    const sidebarBadges = {
        ...(isIncidentActive ? { audit: incidentLevel } : {}),
    };

    // ── Right-slot content (AdminQuickNav — search button removed, lives in topbar now)
    const rightContent = (
        <AdminQuickNav
            logs={logs}
            onSearchOpen={() => setPaletteOpen(true)}
            onNavigate={(path) => navigate(path)}
        />
    );

    // ── IncidentBanner is passed as a bannerSlot — renders between topbar and content
    const bannerSlot = isIncidentActive ? (
        <IncidentBanner onNavigateAudit={() => navigate('/portal/admin/audit')} />
    ) : null;

    // ── IncidentContext value
    const incidentValue = {
        incidentLevel,
        anomalyScore,
        eventCount,
        isActive:  isIncidentActive,
        isDismissed,
        dismiss:   dismissIncident,
    };

    return (
        <>
            <div className="admin-gold-impact" aria-hidden="true" />
            <TabProvider>
                <AdminRefreshContext.Provider value={refreshTick}>
                    <IncidentContext.Provider value={incidentValue}>

                        <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />

                        <PortalLayout
                            groups={NAV_GROUPS}
                            activeTab={activeTab}
                            breadcrumb={breadcrumb}
                            onNavigate={(path) => navigate(path)}
                            onRefresh={forceRefresh}
                            isRefreshing={isRefreshing}
                            rightContent={rightContent}
                            onSearchOpen={() => setPaletteOpen(true)}
                            bannerSlot={bannerSlot}
                            badges={sidebarBadges}
                            portalName="NexEnroll"
                            portalSub="Admin Portal"
                            user={user}
                        >
                            <div style={{ padding: '0 24px 24px', position: 'relative', zIndex: 2 }}>
                                <TabBar />
                                <Outlet context={{ addLog, forceRefresh }} />
                            </div>
                        </PortalLayout>

                        {/* Fixed bottom emergency bar — renders outside layout flow */}
                        <EmergencyBar />

                        <OverseerCornerBadge systemAlert={isIncidentActive} />

                    </IncidentContext.Provider>
                </AdminRefreshContext.Provider>
            </TabProvider>
        </>
    );
};

export default AdminLayout;
