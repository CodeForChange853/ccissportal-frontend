import React from 'react';
import Toast from '../ui/Toast';
const ROLE_ACCENT = {
  admin: {
    active: '#a855f7',
    activeBg: 'rgba(168,85,247,0.18)',
    badgeBg: 'linear-gradient(90deg,#ec4899,#a855f7)',
    title: 'ADMIN PORTAL',
    sub: 'v20.25',
  },
  faculty: {
    active: '#22d3ee',
    activeBg: 'rgba(34,211,238,0.14)',
    badgeBg: 'linear-gradient(90deg,#22d3ee,#6366f1)',
    title: 'FACULTY PORTAL',
    sub: 'CCIS SPORTAL',
  },
  student: {
    active: '#34d399',
    activeBg: 'rgba(52,211,153,0.14)',
    badgeBg: 'linear-gradient(90deg,#34d399,#059669)',
    title: 'STUDENT PORTAL',
    sub: 'CCIS SPORTAL',
  },
};

const PortalLayout = ({
  accent = 'student',
  navItems = [],
  activeTab,
  onTabChange,
  user,
  onLogout,
  feedLogs = [],
  toast,
  onToastClose,
  extraTopBarContent,
  children,
}) => {
  const th = ROLE_ACCENT[accent] || ROLE_ACCENT.student;

  return (
    <div
      className="min-h-screen flex relative overflow-hidden"
      style={{ background: 'var(--bg-base)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(var(--border-subtle) 1px,transparent 1px),' +
            'linear-gradient(90deg,var(--border-subtle) 1px,transparent 1px)',
          backgroundSize: '3rem 3rem',
          opacity: 0.4,
        }}
      />

      <div
        className="fixed pointer-events-none rounded-full"
        style={{
          top: '-15%', left: '-5%', width: 420, height: 420,
          background: `radial-gradient(circle, ${th.active}12 0%, transparent 70%)`,
        }}
      />
      <div
        className="fixed pointer-events-none rounded-full"
        style={{
          bottom: '-10%', right: '-5%', width: 340, height: 340,
          background: `radial-gradient(circle, ${th.active}0e 0%, transparent 70%)`,
        }}
      />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={onToastClose} />
      )}

      <div
        className="w-56 flex-shrink-0 flex flex-col z-20"
        style={{
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--sidebar-border)',
        }}
      >
        <div
          className="px-6 py-5"
          style={{ borderBottom: '1px solid var(--sidebar-border)' }}
        >
          <p
            className="font-black text-sm tracking-tight mb-0.5"
            style={{ color: 'var(--sidebar-logo-text)' }}
          >
            {th.title}
          </p>
          <p
            className="text-[10px] font-mono tracking-widest uppercase"
            style={{ color: 'var(--sidebar-logo-sub)' }}
          >
            {th.sub}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="relative flex h-1.5 w-1.5">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ background: th.active }}
              />
              <span
                className="relative rounded-full h-1.5 w-1.5"
                style={{ background: th.active }}
              />
            </span>
            <span
              className="text-[9px] font-mono"
              style={{ color: th.active }}
            >
              ONLINE
            </span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange?.(item.id)}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all flex justify-between items-center"
                style={
                  isActive
                    ? {
                      background: th.activeBg,
                      color: th.active,
                      borderLeft: `3px solid ${th.active}`,
                      paddingLeft: 9,
                    }
                    : {
                      color: 'var(--sidebar-text-inactive)',
                      borderLeft: '3px solid transparent',
                    }
                }
              >
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <span
                    className="text-[9px] text-white px-1.5 py-0.5 rounded-full font-bold"
                    style={{ background: th.badgeBg }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div
          className="px-4 py-3"
          style={{
            borderTop: '1px solid var(--sidebar-border)',
            background: 'rgba(0,0,0,0.15)',
          }}
        >
          <p
            className="text-[9px] uppercase font-bold tracking-widest mb-2"
            style={{ color: `${th.active}80` }}
          >
            Live Feed
          </p>
          <div
            className="space-y-0.5 font-mono text-[9px]"
            style={{ color: 'var(--sidebar-text-inactive)' }}
          >
            {feedLogs.length === 0
              ? <div>Awaiting activity…</div>
              : feedLogs.map((l, i) => (
                <div key={i} className="truncate">{l}</div>
              ))
            }
          </div>
        </div>

        <div
          className="px-4 py-3"
          style={{ borderTop: '1px solid var(--sidebar-border)' }}
        >
          <p
            className="text-[10px] truncate mb-1"
            style={{ color: 'var(--sidebar-text-inactive)' }}
          >
            {user?.email || user?.username || 'USER'}
          </p>
          <button
            onClick={onLogout}
            className="text-[10px] font-mono uppercase tracking-widest transition-colors"
            style={{ color: 'var(--sidebar-text-inactive)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-danger)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--sidebar-text-inactive)'; }}
          >
            ⏻ Logout
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        <div
          className="h-12 flex justify-between items-center px-7"
          style={{
            background: 'var(--bg-topbar)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <h2
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: 'var(--text-primary)' }}
          >
            {navItems.find(n => n.id === activeTab)?.label || activeTab}
          </h2>
          <div className="flex items-center gap-3">
            {extraTopBarContent}
            <span
              className="font-mono text-[10px]"
              style={{ color: 'var(--text-muted)' }}
            >
              {user?.email?.split('@')[0] || 'USER'}
              <span
                className="ml-1.5"
                style={{ color: th.active }}
              >
                [{accent.toUpperCase()}]
              </span>
            </span>
          </div>
        </div>

        <div
          className="flex-1 overflow-y-auto p-6"
          style={{ background: 'var(--bg-base)' }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default PortalLayout;