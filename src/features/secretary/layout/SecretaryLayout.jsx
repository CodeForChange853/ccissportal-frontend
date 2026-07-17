import React, {
    useState, useEffect, useRef,
    createContext, useContext,
} from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthContext';
import PortalLayout from '../../../components/layout/PortalLayout';
import {
    OverviewIcon,
    OJTIcon, INCIcon, PetitionIcon, MappingIcon,
    EquipmentIcon, DocumentsIcon, OrgsIcon, CORIcon,
    ScanReviewIcon,
} from '../../../components/icons';

// ─────────────────────────────────────────────────────────────────────────────
// Secretary refresh context — 90 s auto-tick shared across all child pages
// ─────────────────────────────────────────────────────────────────────────────
export const SecretaryRefreshContext = createContext(0);
export const useSecretaryRefresh = () => useContext(SecretaryRefreshContext);

// ─────────────────────────────────────────────────────────────────────────────
// Navigation groups
// ─────────────────────────────────────────────────────────────────────────────
const NAV_GROUPS = [
    {
        label: 'Overview',
        items: [
            { id: 'dashboard', label: 'Dashboard',          Icon: OverviewIcon,   path: '/portal/secretary' },
        ],
    },
    {
        label: 'Student Services',
        items: [
            { id: 'ojt',        label: 'OJT Clearance',     Icon: OJTIcon,        path: '/portal/secretary/ojt' },
            { id: 'inc',        label: 'INC Completions',   Icon: INCIcon,        path: '/portal/secretary/inc' },
            { id: 'petitions',  label: 'Subject Petitions', Icon: PetitionIcon,   path: '/portal/secretary/petitions' },
            { id: 'mapping',    label: 'Curriculum Maps',   Icon: MappingIcon,    path: '/portal/secretary/mapping' },
        ],
    },
    {
        label: 'Operations',
        items: [
            { id: 'equipment',  label: 'Equipment',          Icon: EquipmentIcon,  path: '/portal/secretary/equipment' },
            { id: 'documents',  label: 'Document Requests',  Icon: DocumentsIcon,  path: '/portal/secretary/documents' },
            { id: 'orgs',       label: 'Orgs & Facilities',  Icon: OrgsIcon,       path: '/portal/secretary/orgs' },
            { id: 'cor',        label: 'COR Release',        Icon: CORIcon,        path: '/portal/secretary/cor' },
            { id: 'scan-review', label: 'Scan Review Queue', Icon: ScanReviewIcon, path: '/portal/secretary/scan-review' },
        ],
    },
];

const ALL_NAV = NAV_GROUPS.flatMap(g => g.items);
const POLL_MS  = 90_000;

// ─────────────────────────────────────────────────────────────────────────────
// Layout
// ─────────────────────────────────────────────────────────────────────────────
const SecretaryLayout = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // ── Refresh tick
    const [refreshTick,  setRefreshTick]  = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const intervalRef = useRef(null);

    useEffect(() => {
        intervalRef.current = setInterval(() => setRefreshTick(t => t + 1), POLL_MS);
        return () => clearInterval(intervalRef.current);
    }, []);

    const forceRefresh = () => {
        setIsRefreshing(true);
        setRefreshTick(t => t + 1);
        setTimeout(() => setIsRefreshing(false), 800);
    };

    // ── Keyboard shortcut: Alt+R
    useEffect(() => {
        const onKey = (e) => {
            if (e.altKey && e.key.toUpperCase() === 'R') {
                e.preventDefault();
                forceRefresh();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    // ── Active route
    const activeItem = ALL_NAV.find(item => {
        if (item.id === 'dashboard') {
            return location.pathname === '/portal/secretary' || location.pathname === '/portal/secretary/';
        }
        return location.pathname.startsWith(item.path);
    });
    const activeTab   = activeItem?.id ?? 'dashboard';
    const activeLabel = activeItem?.label || 'Dashboard';
    const breadcrumb  = ['Secretariat', activeLabel];

    return (
        <SecretaryRefreshContext.Provider value={refreshTick}>
            <PortalLayout
                groups={NAV_GROUPS}
                activeTab={activeTab}
                breadcrumb={breadcrumb}
                onNavigate={(path) => navigate(path)}
                onRefresh={forceRefresh}
                isRefreshing={isRefreshing}
                portalName="NexEnroll"
                portalSub="Secretariat"
                user={user}
            >
                <div style={{ padding: '0 24px 24px' }}>
                    <Outlet context={{ forceRefresh }} />
                </div>
            </PortalLayout>
        </SecretaryRefreshContext.Provider>
    );
};

export default SecretaryLayout;
