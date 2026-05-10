import React, { useState } from 'react';
import {
  LogoutIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '../icons';

const PortalSidebar = ({
  groups = [],
  activeTab,
  onNavigate,
  onLogout,
  user,
  isOpen,
  onToggle,
  badges = {},
  profileSlot, // For the Faculty load card or similar
  portalName = 'NexEnroll',
  portalSub = 'Portal'
}) => {
  return (
    <aside
      className={`portal-sidebar ${isOpen ? 'open' : 'closed'}`}
      style={{
        width: isOpen ? 'var(--sidebar-w-open)' : 'var(--sidebar-w-closed)',
        flexShrink: 0,
        background: 'var(--portal-sidebar-bg)',
        borderRight: '1px solid var(--portal-sidebar-border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        transition: 'width 0.22s cubic-bezier(.4,0,.2,1)',
        position: 'relative',
        zIndex: 100,
      }}
    >
      <div style={{
        padding: isOpen ? '14px 12px' : '14px 0',
        borderBottom: '1px solid var(--portal-sidebar-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isOpen ? 'space-between' : 'center',
        minHeight: 54,
        flexShrink: 0,
      }}>
        {isOpen && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 6, flexShrink: 0,
              background: 'linear-gradient(135deg, var(--portal-accent), var(--accent-light))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 15, color: '#fff',
              fontFamily: 'var(--font-display)',
            }}>{portalName[0]}</div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--portal-sidebar-active)', whiteSpace: 'nowrap' }}>{portalName}</div>
              <div style={{ fontSize: 8, color: 'var(--portal-sidebar-text)', letterSpacing: 2, textTransform: 'uppercase' }}>{portalSub}</div>
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          title={isOpen ? 'Collapse' : 'Expand'}
          style={{
            width: 24, height: 24, borderRadius: 6, flexShrink: 0,
            background: 'transparent', border: '1px solid var(--portal-sidebar-border)',
            color: 'var(--portal-sidebar-text)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--portal-sidebar-active)'; e.currentTarget.style.borderColor = 'var(--portal-sidebar-active)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--portal-sidebar-text)'; e.currentTarget.style.borderColor = 'var(--portal-sidebar-border)'; }}
        >
          {isOpen ? <ChevronLeftIcon size={14} /> : <ChevronRightIcon size={14} />}
        </button>
      </div>

      {profileSlot && (
        <div style={{ flexShrink: 0 }}>
          {profileSlot}
        </div>
      )}

      <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }} className="scrollbar-hide">
        {groups.map((group, idx) => (
          <div key={group.label || idx} style={{ marginBottom: 12 }}>
            {isOpen && group.label && (
              <div style={{ fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--portal-sidebar-text)', padding: '0 16px 6px', opacity: 0.6, fontFamily: 'var(--font-code)' }}>
                {group.label}
              </div>
            )}
            {group.items.map(item => {
              const isActive = activeTab === item.id;
              const { Icon } = item;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.path || item.id)}
                  title={!isOpen ? item.label : undefined}
                  style={{
                    display: 'flex', alignItems: 'center',
                    gap: isOpen ? 10 : 0,
                    justifyContent: isOpen ? 'flex-start' : 'center',
                    width: '100%',
                    padding: isOpen ? '9px 16px' : '10px 0',
                    background: isActive ? 'var(--portal-sidebar-active-bg)' : 'transparent',
                    borderTop: 'none',
                    borderRight: 'none',
                    borderBottom: 'none',
                    borderLeft: `3px solid ${isActive ? 'var(--portal-accent)' : 'transparent'}`,
                    color: isActive ? 'var(--portal-sidebar-active)' : 'var(--portal-sidebar-text)',
                    fontSize: 13, fontWeight: isActive ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    position: 'relative',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'var(--portal-sidebar-hover)';
                      e.currentTarget.style.color = 'var(--portal-sidebar-active)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--portal-sidebar-text)';
                    }
                  }}
                >
                  <span style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: isActive ? 1 : 0.7 }}>
                    <Icon />
                  </span>
                  {isOpen && <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
                  {badges[item.id] > 0 && (
                    <span style={{
                      position: isOpen ? 'static' : 'absolute',
                      top: isOpen ? 'auto' : 6,
                      right: isOpen ? 'auto' : 6,
                      background: 'var(--color-danger)',
                      color: '#fff',
                      fontSize: isOpen ? 9 : 6,
                      minWidth: isOpen ? 16 : 6,
                      height: isOpen ? 16 : 6,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: 10,
                      fontFamily: 'var(--font-code)'
                    }}>
                      {isOpen ? badges[item.id] : ''}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div style={{
        padding: isOpen ? '12px 14px' : '12px 0',
        borderTop: '1px solid var(--portal-sidebar-border)',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        alignItems: isOpen ? 'flex-start' : 'center',
      }}>
        {isOpen && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9, color: 'var(--portal-sidebar-text)', fontFamily: 'var(--font-code)', marginBottom: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-success)', flexShrink: 0 }} />
            System Online
          </div>
        )}
        <button
          onClick={onLogout}
          title="Sign out"
          style={{
            width: isOpen ? '100%' : 32, height: 32, borderRadius: 8,
            border: 'none', cursor: 'pointer', background: 'transparent',
            color: 'var(--portal-sidebar-text)',
            display: 'flex', alignItems: 'center', gap: 8,
            justifyContent: isOpen ? 'flex-start' : 'center',
            padding: isOpen ? '0 8px' : 0,
            fontSize: 12, transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-danger)'; e.currentTarget.style.background = 'var(--color-danger-bg)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--portal-sidebar-text)'; e.currentTarget.style.background = 'transparent'; }}
        >
          <span style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><LogoutIcon /></span>
          {isOpen && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
};

export default PortalSidebar;
