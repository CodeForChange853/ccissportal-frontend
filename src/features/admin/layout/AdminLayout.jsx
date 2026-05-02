// frontend/src/features/admin/layout/AdminLayout.jsx
// Redesign: Clean Vercel/Linear-inspired light-first theme with dark mode toggle.

import React, {
    useState, useEffect, useRef,
    createContext, useContext,
} from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import CommandPalette from '../../../components/CommandPalette';
import { TabProvider } from '../../../context/TabContext';
import TabBar from '../../../components/TabBar';
import AdminSidebar, { NAV_GROUPS } from './AdminSidebar';
import PortalTopBar from '../../../components/layout/PortalTopBar';

export const AdminRefreshContext = createContext(0);
export const useAdminRefresh = () => useContext(AdminRefreshContext);

const POLL_INTERVAL_MS = 90_000;
const ALL_NAV = NAV_GROUPS.flatMap(g => g.items);

/* ── Icons ─────────────────────────────────────────────────────── */
const SearchIcon = () => (
    <svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="5.5" />
        <path d="M13 13l3 3" />
    </svg>
);

const RefreshIcon = ({ spinning }) => (
    <svg
        width="14" height="14"
        viewBox="0 0 18 18" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={spinning ? { animation: 'spin 1s linear infinite' } : {}}
    >
        <path d="M16 3v5h-5" />
        <path d="M2 15v-5h5" />
        <path d="M15.4 9A7 7 0 1114 5.3L16 3" />
    </svg>
);

/* ── AdminLayout ─────────────────────────────────────────────────── */
const AdminLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const [sidebarOpen, setSidebarOpen] = useState(() => {
        const stored = localStorage.getItem('admin-sidebar-open');
        return stored === null ? true : stored === 'true';
    });

    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        localStorage.setItem('admin-sidebar-open', String(sidebarOpen));
    }, [sidebarOpen]);

    const [refreshTick, setRefreshTick] = useState(0);
    const [logs, setLogs] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [paletteOpen, setPaletteOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);
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

    useEffect(() => {
        const handler = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        if (!document.getElementById('spin-kf')) {
            const s = document.createElement('style');
            s.id = 'spin-kf';
            s.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
            document.head.appendChild(s);
        }
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

    const activeTab = ALL_NAV.find(item => {
        if (item.id === 'overview') {
            return location.pathname === '/portal/admin' || location.pathname === '/portal/admin/';
        }
        return location.pathname.startsWith(item.path);
    })?.id ?? 'overview';

    const activeLabel = ALL_NAV.find(n => n.id === activeTab)?.label || 'Dashboard';
    const breadcrumb = ['Admin', activeLabel];

    return (
        <TabProvider>
            <AdminRefreshContext.Provider value={refreshTick}>

                <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />

                {/* ── Sidebar ────────────────────────────────────────────── */}
                <AdminSidebar
                    activeTab={activeTab}
                    isOpen={sidebarOpen}
                    onToggle={() => setSidebarOpen(v => !v)}
                    onNavigate={(path) => navigate(path)}
                    onLogout={logout}
                    user={user}
                    badges={{}}
                />

                {/* ── Topbar ─────────────────────────────────────────────── */}
                <header
                    className={`admin-topbar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}
                    style={{
                        background: 'var(--bg-topbar)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        borderBottom: '1px solid var(--border-subtle)',
                        boxShadow: '0 1px 0 var(--border-subtle)',
                    }}
                >
                    <PortalTopBar
                        breadcrumb={breadcrumb}
                        onRefresh={forceRefresh}
                        isRefreshing={isRefreshing}
                        rightContent={
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {/* Theme toggle */}
                                <button
                                    onClick={toggleTheme}
                                    aria-label="Toggle theme"
                                    style={{
                                        width: 32, height: 32, borderRadius: 'var(--border-radius-md)',
                                        background: 'transparent', border: '1px solid var(--border-default)',
                                        color: 'var(--text-muted)', cursor: 'pointer', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', fontSize: 14,
                                        transition: 'all 0.15s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-depth)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                                >
                                    {theme === 'light' ? '☽' : '○'}
                                </button>

                                {/* Search / Command Palette */}
                                <button
                                    onClick={() => setPaletteOpen(true)}
                                    aria-label="Open command palette"
                                    aria-keyshortcuts="Control+k Meta+k"
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        padding: '6px 12px',
                                        background: 'var(--bg-surface)',
                                        border: '1px solid var(--border-default)',
                                        borderRadius: 'var(--border-radius-md)',
                                        color: 'var(--text-muted)',
                                        fontSize: '0.72rem',
                                        cursor: 'pointer',
                                        boxShadow: 'var(--shadow-card)',
                                        transition: 'border-color 0.15s, color 0.15s, box-shadow 0.15s',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = 'var(--border-strong)';
                                        e.currentTarget.style.color = 'var(--text-primary)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = 'var(--border-default)';
                                        e.currentTarget.style.color = 'var(--text-muted)';
                                    }}
                                >
                                    <SearchIcon />
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
                        }
                    />
                </header>

                {/* ── Main content ─────────────────────────────────────────── */}
                <main
                    className={`admin-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}
                    style={{ background: 'var(--bg-base)' }}
                >
                    {/* Live feed strip */}
                    {logs.length > 0 && (
                        <div style={{
                            padding: '4px 24px',
                            background: 'var(--bg-depth)',
                            borderBottom: '1px solid var(--border-subtle)',
                            display: 'flex', gap: 16, overflowX: 'auto',
                        }}>
                            {logs.slice(0, 3).map((log, i) => (
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

                    <div style={{ padding: '24px' }}>
                        <TabBar />
                        <Outlet context={{ addLog, forceRefresh }} />
                    </div>
                </main>

            </AdminRefreshContext.Provider>
        </TabProvider>
    );
};

export default AdminLayout;