const s = { viewBox: '0 0 18 18', fill: 'none', stroke: 'currentColor', strokeWidth: '1.5', strokeLinecap: 'round', strokeLinejoin: 'round' };
const s2 = { ...s, strokeWidth: '2' };

const iconProps = (size, className) => ({
    ...s,
    width: size,
    height: size,
    className
});

const iconProps2 = (size, className) => ({
    ...s2,
    width: size,
    height: size,
    className
});

// ── Navigation / system 
export const OverviewIcon = ({ size = 18, className = '' }) => (
    <svg {...iconProps(size, className)}>
        <rect x="2" y="2" width="6" height="6" rx="1.5" />
        <rect x="10" y="2" width="6" height="6" rx="1.5" />
        <rect x="2" y="10" width="6" height="6" rx="1.5" />
        <rect x="10" y="10" width="6" height="6" rx="1.5" />
    </svg>
);

export const EnrollmentsIcon = ({ size = 18, className = '' }) => (
    <svg {...iconProps(size, className)}>
        <path d="M9 2L11.5 7H16L12 10.5L13.5 16L9 13L4.5 16L6 10.5L2 7H6.5L9 2Z" />
    </svg>
);

export const GradingIcon = ({ size = 18, className = '' }) => (
    <svg {...iconProps(size, className)}>
        <path d="M4 9l3 3 7-7" />
        <rect x="2" y="2" width="14" height="14" rx="3" />
    </svg>
);

export const UsersIcon = ({ size = 18, className = '' }) => (
    <svg {...iconProps(size, className)}>
        <circle cx="7" cy="6" r="2.5" />
        <path d="M2 16c0-3 2.2-5 5-5s5 2 5 5" />
        <path d="M13 8c1.4 0 2.5 1.1 2.5 2.5 0 .6-.2 1.1-.5 1.5M15.5 16c0-1.8-1-3-2.5-3.5" />
    </svg>
);

export const FacultyIcon = ({ size = 18, className = '' }) => (
    <svg {...iconProps(size, className)}>
        <path d="M9 2L16 5.5V9c0 3.5-2.8 6.5-7 7-4.2-.5-7-3.5-7-7V5.5L9 2Z" />
        <path d="M6.5 9l2 2 3-3" />
    </svg>
);

export const CurriculumIcon = ({ size = 18, className = '' }) => (
    <svg {...iconProps(size, className)}>
        <path d="M3 4h12M3 9h8M3 14h10" />
        <rect x="13" y="12" width="3" height="4" rx="0.5" />
    </svg>
);

export const AdmissionsIcon = ({ size = 18, className = '' }) => (
    <svg {...iconProps(size, className)}>
        <path d="M9 2v7M9 9l-3-3M9 9l3-3" />
        <path d="M3 13v1a2 2 0 002 2h8a2 2 0 002-2v-1" />
    </svg>
);

export const SupportIcon = ({ size = 18, className = '' }) => (
    <svg {...iconProps(size, className)}>
        <path d="M3 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H7l-4 3V5Z" />
    </svg>
);

export const SettingsIcon = ({ size = 18, className = '' }) => (
    <svg {...iconProps(size, className)}>
        <circle cx="9" cy="9" r="2.2" />
        <path d="M9 2v1.5M9 14.5V16M2 9h1.5M14.5 9H16M4.1 4.1l1.1 1.1M12.8 12.8l1.1 1.1M4.1 13.9l1.1-1.1M12.8 5.2l1.1-1.1" />
    </svg>
);

export const ShieldIcon = ({ size = 18, className = '' }) => (
    <svg {...iconProps(size, className)}>
        <path d="M9 2L16 5.5V9c0 3.5-2.8 6.5-7 7-4.2-.5-7-3.5-7-7V5.5L9 2Z" />
        <path d="M9 7v3M9 12h.01" />
    </svg>
);

export const LogoutIcon = ({ size = 18, className = '' }) => (
    <svg {...iconProps(size, className)}>
        <path d="M7 3H4a1 1 0 00-1 1v10a1 1 0 001 1h3" />
        <path d="M12 12l3-3-3-3" />
        <path d="M7 9h8" />
    </svg>
);

export const ChevronLeftIcon = ({ size = 18, className = '' }) => (
    <svg {...iconProps2(size, className)}>
        <path d="M11 13L7 9l4-4" />
    </svg>
);

export const ChevronRightIcon = ({ size = 18, className = '' }) => (
    <svg {...iconProps2(size, className)}>
        <path d="M7 5l4 4-4 4" />
    </svg>
);

// ── Faculty-specific 
export const LoadIcon = ({ size = 18, className = '' }) => (
    <svg {...iconProps(size, className)}>
        <path d="M9 2L16 5.5V9c0 3.5-2.8 6.5-7 7-4.2-.5-7-3.5-7-7V5.5L9 2Z" />
        <path d="M6.5 9l2 2 3-3" />
    </svg>
);

export const GradebookIcon = ({ size = 18, className = '' }) => (
    <svg {...iconProps(size, className)}>
        <rect x="3" y="2" width="12" height="14" rx="2" />
        <path d="M6 6h6M6 9h6M6 12h4" />
    </svg>
);

export const ProfileIcon = ({ size = 18, className = '' }) => (
    <svg {...iconProps(size, className)}>
        <circle cx="9" cy="6" r="3" />
        <path d="M3 16c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    </svg>
);

// ── Theme toggle 
export const SunIcon = ({ size = 18, className = '' }) => (
    <svg {...{ ...s, strokeWidth: '1.8' }} width={size} height={size} className={className}>
        <circle cx="9" cy="9" r="3.5" />
        <path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.1 3.1l1.4 1.4M13.5 13.5l1.4 1.4M13.5 4.5l-1.4 1.4M4.5 13.5l-1.4 1.4" />
    </svg>
);

export const MoonIcon = ({ size = 18, className = '' }) => (
    <svg {...{ ...s, strokeWidth: '1.8' }} width={size} height={size} className={className}>
        <path d="M14.5 10.5A6.5 6.5 0 017.5 3.5a6.5 6.5 0 100 11 6.5 6.5 0 007-4z" />
    </svg>
);

// ── Search & Refresh
export const SearchIcon = ({ size = 18, className = '' }) => (
    <svg {...iconProps2(size, className)}>
        <circle cx="8" cy="8" r="5.5" />
        <path d="M13 13l3 3" />
    </svg>
);

export const KeyIcon = ({ size = 18, className = '' }) => (
    <svg {...iconProps(size, className)}>
        <path d="M13.5 4.5a3.5 3.5 0 10-5 5L3 15v1h1v1h1v1h2l4.5-4.5a3.5 3.5 0 102-6z" />
        <circle cx="13.5" cy="4.5" r="0.8" fill="currentColor" />
    </svg>
);

export const RefreshIcon = ({ spinning, size = 18, className = '' }) => (
    <svg
        {...iconProps2(size, className)}
        style={spinning ? { animation: 'spin 1s linear infinite' } : {}}
    >
        <path d="M16 3v5h-5" />
        <path d="M2 15v-5h5" />
        <path d="M15.4 9A7 7 0 1114 5.3L16 3" />
    </svg>
);

export const ForecastIcon = ({ size = 18, className = '' }) => (
    <svg {...iconProps(size, className)}>
        <polyline points="2,13 6,8 10,10 14,5" />
        <path d="M14 5h2v2" />
        <line x1="2" y1="16" x2="16" y2="16" />
    </svg>
);

// ── Secretary-specific icons ──────────────────────────────────────────────────
export const OJTIcon = ({ size = 18, className = '' }) => (
    <svg {...iconProps(size, className)}>
        <rect x="3" y="3" width="12" height="12" rx="2" />
        <path d="M7 9l2 2 4-4" />
        <path d="M3 7h12" />
    </svg>
);

export const INCIcon = ({ size = 18, className = '' }) => (
    <svg {...iconProps(size, className)}>
        <circle cx="9" cy="9" r="7" />
        <path d="M9 6v3l2 2" />
    </svg>
);

export const PetitionIcon = ({ size = 18, className = '' }) => (
    <svg {...iconProps(size, className)}>
        <path d="M4 4h10a1 1 0 011 1v1H4V4z" />
        <rect x="3" y="6" width="12" height="9" rx="1" />
        <path d="M6 10h6M6 13h4" />
    </svg>
);

export const MappingIcon = ({ size = 18, className = '' }) => (
    <svg {...iconProps(size, className)}>
        <rect x="2" y="3" width="5" height="5" rx="1" />
        <rect x="11" y="3" width="5" height="5" rx="1" />
        <rect x="2" y="11" width="5" height="5" rx="1" />
        <rect x="11" y="11" width="5" height="5" rx="1" />
        <path d="M7 5.5h4M7 13.5h4M4.5 8v3M13.5 8v3" />
    </svg>
);

export const EquipmentIcon = ({ size = 18, className = '' }) => (
    <svg {...iconProps(size, className)}>
        <rect x="3" y="6" width="12" height="9" rx="1.5" />
        <path d="M6 6V4.5a1 1 0 011-1h4a1 1 0 011 1V6" />
        <path d="M3 10h12" />
    </svg>
);

export const DocumentsIcon = ({ size = 18, className = '' }) => (
    <svg {...iconProps(size, className)}>
        <path d="M11 2H5a1 1 0 00-1 1v12a1 1 0 001 1h8a1 1 0 001-1V6l-3-4z" />
        <path d="M11 2v4h4" />
        <path d="M7 9h4M7 12h3" />
    </svg>
);

export const OrgsIcon = ({ size = 18, className = '' }) => (
    <svg {...iconProps(size, className)}>
        <circle cx="9" cy="5" r="2" />
        <circle cx="4" cy="13" r="2" />
        <circle cx="14" cy="13" r="2" />
        <path d="M9 7v2M7 12l-1.5-1.5M11 12l1.5-1.5M7 9H5M11 9h2" />
    </svg>
);

export const CORIcon = ({ size = 18, className = '' }) => (
    <svg {...iconProps(size, className)}>
        <rect x="3" y="2" width="12" height="14" rx="2" />
        <path d="M6 6h6M6 9h6M6 12h3" />
        <circle cx="13" cy="13" r="3" fill="none" />
        <path d="M11.8 13l.9.9 1.5-1.5" />
    </svg>
);

export const HonorsIcon = ({ size = 18, className = '' }) => (
    <svg {...iconProps(size, className)}>
        <path d="M3 15h12M3 11l4-8 3 5 3-7 4 8" />
        <rect x="3" y="12.5" width="12" height="2.8" rx="1.4" fill="currentColor" stroke="none" opacity="0.7"/>
        <circle cx="7" cy="3" r="1.1" fill="currentColor" stroke="none"/>
        <circle cx="13" cy="4" r="1.1" fill="currentColor" stroke="none"/>
    </svg>
);

export const StudentRecordsIcon = ({ size = 18, className = '' }) => (
    <svg {...iconProps(size, className)}>
        <circle cx="7" cy="5.5" r="2.5" />
        <path d="M2 15c0-2.8 2.2-5 5-5" />
        <rect x="10" y="10" width="6" height="6" rx="1.5" />
        <path d="M11.5 13h3M11.5 11.5h3" />
    </svg>
);

// Document scan review — used for the HITL Verification Queue nav item
export const ScanReviewIcon = ({ size = 18, className = '' }) => (
    <svg {...iconProps(size, className)}>
        <rect x="3" y="2" width="12" height="14" rx="2" />
        <path d="M6 6h6M6 9h6M6 12h3" />
        <circle cx="13.5" cy="13.5" r="3.5" fill="none" />
        <path d="M12.2 13.5l1 1 2-2" />
    </svg>
);
