import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from '../NotificationBell';
import { RefreshIcon, SunIcon, MoonIcon } from '../icons';

export default function PortalTopBar({
  breadcrumb = [],
  onRefresh,
  isRefreshing,
  rightContent,
  showThemeToggle = true
}) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div style={{
      width: '100%',
      height: 'var(--topbar-height)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      background: 'var(--portal-topbar-bg)',
      backdropFilter: 'blur(var(--portal-topbar-blur))',
      WebkitBackdropFilter: 'blur(var(--portal-topbar-blur))',
      borderBottom: '1px solid var(--border-subtle)',
      zIndex: 50,
    }}>
      {/* Left: Breadcrumbs / Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
        {breadcrumb.map((crumb, i) => (
          <React.Fragment key={crumb + i}>
            {i > 0 && <span style={{ color: 'var(--text-muted)', opacity: 0.5, fontSize: '0.70rem' }}>/</span>}
            <span style={{
              fontSize: i === breadcrumb.length - 1 ? '0.90rem' : '0.80rem',
              fontWeight: i === breadcrumb.length - 1 ? 700 : 400,
              color: i === breadcrumb.length - 1 ? 'var(--text-primary)' : 'var(--text-muted)',
              fontFamily: i === breadcrumb.length - 1 ? 'var(--font-display)' : 'inherit',
              whiteSpace: 'nowrap',
            }}>
              {crumb}
            </span>
          </React.Fragment>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

        {rightContent && rightContent}

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh data"
            style={{
              background: 'transparent', border: 'none',
              color: isRefreshing ? 'var(--portal-accent)' : 'var(--text-muted)',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', width: 32, height: 32,
              borderRadius: 'var(--border-radius-md)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { if (!isRefreshing) { e.currentTarget.style.background = 'var(--bg-depth)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; if (!isRefreshing) e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <RefreshIcon spinning={isRefreshing} size={12} />
          </button>
        )}

        {showThemeToggle && (
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{
              width: 32, height: 32, borderRadius: 'var(--border-radius-md)',
              background: 'transparent', border: '1px solid var(--border-default)',
              color: 'var(--text-muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-depth)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            {isDark ? <SunIcon size={12} /> : <MoonIcon size={12} />}
          </button>
        )}

        <div style={{ width: '1px', height: '20px', background: 'var(--border-default)', margin: '0 4px' }}></div>

        <NotificationBell />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 4 }}>
          <div style={{ textAlign: 'right', display: 'none', md: 'block' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 }}>
              {user?.full_name || user?.username || 'User'}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--portal-accent)', fontFamily: 'var(--font-code)', marginTop: 2 }}>
              {user?.role?.replace('_', ' ') || 'Member'}
            </div>
          </div>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--portal-accent), var(--accent-light))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: '0.8rem',
            boxShadow: 'var(--shadow-accent)',
          }}>
            {(user?.full_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}