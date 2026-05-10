import React, {
    useState, useEffect, useRef,
    createContext, useContext,
} from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import CommandPalette from '../../../components/CommandPalette';
import { TabProvider } from '../../../context/TabContext';
import TabBar from '../../../components/TabBar';
import PortalLayout from '../../../components/layout/PortalLayout';
import { OverseerCornerBadge } from '../components/dashboard/AISystemOverseer';
import {
    SearchIcon, OverviewIcon, EnrollmentsIcon, GradingIcon,
    CurriculumIcon, AdmissionsIcon, SupportIcon, FacultyIcon,
    UsersIcon, ShieldIcon, SettingsIcon
} from '../../../components/icons';

const NAV_GROUPS = [
    {
        label: 'Command Center',
        items: [
            { id: 'overview', label: 'Intelligence HQ', Icon: OverviewIcon, path: '/portal/admin' },
            { id: 'enrollments', label: 'Enrollment Triage', Icon: EnrollmentsIcon, path: '/portal/admin/enrollments' },
            { id: 'grading', label: 'Academic Records', Icon: GradingIcon, path: '/portal/admin/grading' },
            { id: 'curriculum', label: 'Master Curriculum', Icon: CurriculumIcon, path: '/portal/admin/curriculum' },
            { id: 'admissions', label: 'Direct Admission', Icon: AdmissionsIcon, path: '/portal/admin/admissions' },
        ],
    },
    {
        label: 'Management',
        items: [
            { id: 'support', label: 'Support Triage', Icon: SupportIcon, path: '/portal/admin/support' },
            { id: 'faculty', label: 'Faculty Balancer', Icon: FacultyIcon, path: '/portal/admin/faculty' },
            { id: 'users', label: 'User Registry', Icon: UsersIcon, path: '/portal/admin/users' },
        ],
    },
    {
        label: 'Security',
        items: [
            { id: 'audit', label: 'Audit Intelligence', Icon: ShieldIcon, path: '/portal/admin/audit' },
            { id: 'settings', label: 'System Controls', Icon: SettingsIcon, path: '/portal/admin/settings' },
        ],
    },
];

export const AdminRefreshContext = createContext(0);
export const useAdminRefresh = () => useContext(AdminRefreshContext);

const POLL_INTERVAL_MS = 90_000;
const ALL_NAV = NAV_GROUPS.flatMap(g => g.items);

const AdminLayout = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const [refreshTick, setRefreshTick] = useState(0);
    const [logs, setLogs] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [paletteOpen, setPaletteOpen] = useState(false);
    const intervalRef = useRef(null);

    useEffect(() => {
        intervalRef.current = setInterval(() => setRefreshTick(t => t + 1), POLL_INTERVAL_MS);
        return () => clearInterval(intervalRef.current);
    }, []);

    useEffect(() => {
        const onKey = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setPaletteOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const addLog = (msg) => {
        const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
        setLogs(prev => [`[${ts}] ${msg}`, ...prev].slice(0, 5));
    };

    const forceRefresh = () => {
        setIsRefreshing(true);
        setRefreshTick(t => t + 1);
        addLog('MANUAL: Force refresh triggered.');
        setTimeout(() => setIsRefreshing(false), 800);
    };

    const activeItem = ALL_NAV.find(item => {
        if (item.id === 'overview') {
            return location.pathname === '/portal/admin' || location.pathname === '/portal/admin/';
        }
        return location.pathname.startsWith(item.path);
    });

    const activeTab = activeItem?.id ?? 'overview';
    const activeLabel = activeItem?.label || 'Dashboard';
    const breadcrumb = ['Admin', activeLabel];

    const rightContent = (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
                onClick={() => setPaletteOpen(true)}
                title="Search (⌘K)"
                style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 12px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--border-radius-md)',
                    color: 'var(--text-muted)',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
                <SearchIcon size={14} />
                <span>Search</span>
                <kbd style={{
                    padding: '1px 5px',
                    background: 'var(--bg-depth)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 4, fontSize: '0.6rem',
                    fontFamily: 'var(--font-code)',
                    color: 'var(--text-muted)',
                }}>⌘K</kbd>
            </button>
        </div>
    );

    return (
        <TabProvider>
            <AdminRefreshContext.Provider value={refreshTick}>
                <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />

                <PortalLayout
                    groups={NAV_GROUPS}
                    activeTab={activeTab}
                    breadcrumb={breadcrumb}
                    onNavigate={(path) => navigate(path)}
                    onRefresh={forceRefresh}
                    isRefreshing={isRefreshing}
                    rightContent={rightContent}
                    portalName="NexEnroll"
                    portalSub="Admin Portal"
                    user={user}
                >
                    {/* Live feed strip */}
                    {logs.length > 0 && (
                        <div style={{
                            padding: '4px 24px',
                            background: 'var(--bg-depth)',
                            borderBottom: '1px solid var(--border-subtle)',
                            display: 'flex', gap: 16, overflowX: 'auto',
                            marginBottom: 20,
                        }}>
                            {logs.map((log, i) => (
                                <span key={i} style={{
                                    fontSize: '0.62rem',
                                    fontFamily: 'var(--font-code)',
                                    color: 'var(--text-muted)',
                                    whiteSpace: 'nowrap',
                                }}>
                                    {log}
                                </span>
                            ))}
                        </div>
                    )}

                    <div style={{ padding: '0 24px 24px' }}>
                        <TabBar />
                        <Outlet context={{ addLog, forceRefresh }} />
                    </div>
                </PortalLayout>

                <OverseerCornerBadge systemAlert={false} />
            </AdminRefreshContext.Provider>
        </TabProvider>
    );
};

export default AdminLayout;