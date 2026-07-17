import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { SearchIcon, SunIcon, MoonIcon, RefreshIcon } from '../icons';
import '../../styles/components/portal-topbar.css';

// ── Inline chevron (no dep on icons/index for this tiny shape)
const ChevronDown = () => (
  <svg width={8} height={8} viewBox="0 0 10 10" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M2 3.5L5 6.5L8 3.5" />
  </svg>
);

// ── Inline sign-out icon
const SignOutSvg = () => (
  <svg width={14} height={14} viewBox="0 0 18 18" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 3H4a1 1 0 00-1 1v10a1 1 0 001 1h3" />
    <path d="M12 12l3-3-3-3" /><path d="M7 9h8" />
  </svg>
);

// ── Row inside the UserMenu dropdown
function MenuRow({ icon, label, hint, onClick, disabled, danger }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 9, padding: '7px 14px',
        border: 'none', cursor: disabled ? 'default' : 'pointer',
        background: hov && !disabled
          ? (danger ? 'rgba(239,68,68,0.07)' : 'rgba(255,255,255,0.04)') : 'transparent',
        color: disabled ? 'rgba(255,255,255,0.22)'
          : danger ? (hov ? '#EF4444' : 'rgba(239,68,68,0.65)')
          : (hov ? 'rgba(255,255,255,0.90)' : 'rgba(255,255,255,0.52)'),
        fontSize: '0.78rem', fontFamily: 'var(--font-display)', textAlign: 'left',
        transition: 'background 0.12s, color 0.12s',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <span style={{ display: 'flex', flexShrink: 0, opacity: disabled ? 0.35 : 1 }}>{icon}</span>
        {label}
      </span>
      {hint && (
        <span style={{
          fontSize: '0.58rem', fontFamily: 'var(--font-code)',
          color: 'rgba(255,255,255,0.22)', letterSpacing: '0.02em', flexShrink: 0,
        }}>{hint}</span>
      )}
    </button>
  );
}

// ── Avatar → dropdown: user identity, theme, refresh, sign-out
function UserMenu({ onRefresh, isRefreshing }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const name     = user?.full_name || user?.username || 'Admin';
  const initials = name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
  const role     = (user?.role || 'administrator').replace(/_/g, ' ');

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger: avatar + chevron */}
      <button
        onClick={() => setOpen(v => !v)}
        title="Account"
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: 'transparent', border: 'none',
          cursor: 'pointer', padding: '2px 4px 2px 2px',
          borderRadius: 20,
          outline: open ? '1px solid var(--border-accent)' : 'none',
          transition: 'outline 0.15s',
        }}
      >
        <div style={{
          width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--portal-accent), var(--accent-light))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: '0.70rem',
          fontFamily: 'var(--font-display)',
          boxShadow: open ? 'var(--shadow-accent)' : 'none',
          transition: 'box-shadow 0.15s',
        }}>{initials}</div>
        <span style={{
          color: 'var(--text-muted)',
          display: 'flex', alignItems: 'center',
          transform: open ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.18s ease',
        }}>
          <ChevronDown />
        </span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          width: 220,
          background: 'rgba(10, 10, 12, 0.97)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(186,151,49,0.14)', borderRadius: 10,
          boxShadow: '0 16px 48px rgba(0,0,0,0.62), 0 0 0 1px rgba(255,255,255,0.04)',
          zIndex: 400, overflow: 'hidden',
          animation: 'userMenuReveal 0.14s cubic-bezier(0.16,1,0.3,1) both',
        }}>
          {/* Identity */}
          <div style={{
            padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, var(--portal-accent), var(--accent-light))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: '0.80rem',
            }}>{initials}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: '0.80rem', fontWeight: 600, color: 'rgba(255,255,255,0.92)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{name}</div>
              <div style={{
                fontSize: '0.58rem', color: 'var(--portal-accent)',
                fontFamily: 'var(--font-code)', marginTop: 1,
                letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>{role}</div>
            </div>
          </div>

          {/* Secondary controls (also accessible as topbar icons) */}
          <div style={{ padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <MenuRow
              icon={isDark ? <SunIcon size={14} /> : <MoonIcon size={14} />}
              label={isDark ? 'Light Mode' : 'Dark Mode'}
              hint="Alt+T"
              onClick={toggleTheme}
            />
            <MenuRow
              icon={<RefreshIcon size={14} spinning={isRefreshing} />}
              label={isRefreshing ? 'Refreshing…' : 'Refresh Data'}
              hint="Alt+R"
              onClick={() => { if (!isRefreshing) onRefresh?.(); }}
              disabled={isRefreshing}
            />
          </div>

          {/* Sign out */}
          <div style={{ padding: '4px 0' }}>
            <MenuRow
              icon={<SignOutSvg />}
              label="Sign Out"
              onClick={() => { setOpen(false); logout(); }}
              danger
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Small icon button for topbar — used for theme toggle and refresh
function TopBarIconBtn({ title, onClick, disabled, children }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      title={title} onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 30, height: 30, borderRadius: 7, flexShrink: 0,
        background: hov && !disabled ? 'var(--bg-depth)' : 'transparent',
        border: '1px solid var(--border-default)',
        color: hov && !disabled ? 'var(--text-primary)' : 'var(--text-muted)',
        cursor: disabled ? 'default' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.15s, color 0.15s',
        padding: 0,
      }}
    >{children}</button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PortalTopBar
//
// Layout  (left → center → right):
//   LEFT   — breadcrumb
//   CENTER — persistent search bar (onSearchOpen) or centerContent slot
//   RIGHT  — rightContent | theme toggle | refresh | separator | UserMenu
// ─────────────────────────────────────────────────────────────────────────────
export default function PortalTopBar({
  breadcrumb    = [],
  onRefresh,
  isRefreshing,
  centerContent,
  rightContent,
  onSearchOpen,
}) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <>
      <div style={{
        width: '100%',
        height: 'var(--topbar-height)',
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '0 16px 0 20px',
        background: 'var(--portal-topbar-bg)',
        backdropFilter: 'blur(var(--portal-topbar-blur))',
        WebkitBackdropFilter: 'blur(var(--portal-topbar-blur))',
        borderBottom: '1px solid var(--border-subtle)',
        zIndex: 50, flexShrink: 0,
      }}>

        {/* ── LEFT: breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {breadcrumb.map((crumb, i) => (
            <React.Fragment key={crumb + i}>
              {i > 0 && (
                <span style={{ color: 'var(--text-muted)', opacity: 0.35, fontSize: '0.65rem' }}>/</span>
              )}
              <span style={{
                fontSize:   i === breadcrumb.length - 1 ? '0.88rem' : '0.74rem',
                fontWeight: i === breadcrumb.length - 1 ? 700 : 400,
                color:      i === breadcrumb.length - 1 ? 'var(--text-primary)' : 'var(--text-muted)',
                fontFamily: i === breadcrumb.length - 1 ? 'var(--font-display)' : 'inherit',
                whiteSpace: 'nowrap',
              }}>{crumb}</span>
            </React.Fragment>
          ))}
        </div>

        {/* ── CENTER: persistent search or custom slot */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 6px', minWidth: 0 }}>
          {onSearchOpen ? (
            <button
              onClick={onSearchOpen}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                width: '100%', maxWidth: 420, height: 30,
                background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
                borderRadius: 7, padding: '0 10px', cursor: 'text',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; }}
            >
              <SearchIcon size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <span style={{
                flex: 1, fontSize: '0.73rem', color: 'var(--text-placeholder)',
                fontFamily: 'var(--font-display)', textAlign: 'left',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                Search students, faculty, subjects…
              </span>
              <kbd style={{
                padding: '1px 5px', background: 'var(--bg-depth)',
                border: '1px solid var(--border-subtle)', borderRadius: 4,
                fontSize: '0.55rem', fontFamily: 'var(--font-code)',
                color: 'var(--text-placeholder)', flexShrink: 0,
              }}>⌘K</kbd>
            </button>
          ) : (centerContent ?? null)}
        </div>

        {/* ── RIGHT: actions + visible controls + user menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>

          {rightContent}

          {/* Divider */}
          <div style={{ width: 1, height: 18, background: 'var(--border-subtle)', flexShrink: 0, margin: '0 2px' }} />

          {/* Theme toggle — always visible */}
          <TopBarIconBtn
            title={isDark ? 'Switch to Light Mode (Alt+T)' : 'Switch to Dark Mode (Alt+T)'}
            onClick={toggleTheme}
          >
            {isDark ? <SunIcon size={13} /> : <MoonIcon size={13} />}
          </TopBarIconBtn>

          {/* Refresh — always visible */}
          {onRefresh && (
            <TopBarIconBtn
              title="Refresh data (Alt+R)"
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              <RefreshIcon size={13} spinning={isRefreshing} />
            </TopBarIconBtn>
          )}

          {/* Divider */}
          <div style={{ width: 1, height: 18, background: 'var(--border-subtle)', flexShrink: 0, margin: '0 2px' }} />

          {/* User menu */}
          <UserMenu onRefresh={onRefresh} isRefreshing={isRefreshing} />
        </div>

      </div>
    </>
  );
}
