import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import PortalSidebar from './PortalSidebar';
import PortalTopBar from './PortalTopBar';

const PortalLayout = ({
  groups = [],
  activeTab,
  breadcrumb = [],
  onNavigate,
  onRefresh,
  isRefreshing,
  centerContent,
  rightContent,
  onSearchOpen,
  bannerSlot,
  profileSlot,
  portalName,
  portalSub,
  badges = {},
  children
}) => {
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('portal-sidebar-open');
    return saved === null ? true : saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('portal-sidebar-open', String(sidebarOpen));
  }, [sidebarOpen]);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-base)', position: 'relative' }}>
      <a href="#main-content" className="skip-to-content">Skip to main content</a>
      {/* Sidebar */}
      <PortalSidebar
        groups={groups}
        activeTab={activeTab}
        onNavigate={onNavigate}
        onLogout={logout}
        user={user}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        badges={badges}
        profileSlot={profileSlot}
        portalName={portalName}
        portalSub={portalSub}
      />

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        minWidth: 0,
      }}>
        <PortalTopBar
          breadcrumb={breadcrumb}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
          centerContent={centerContent}
          rightContent={rightContent}
          onSearchOpen={onSearchOpen}
        />

        {/* Incident banner — rendered between topbar and page content */}
        {bannerSlot}

        <main id="main-content" style={{
          flex: 1,
          overflowY: 'auto',
          background: 'var(--bg-base)',
          position: 'relative',
        }} className="scrollbar-hide">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PortalLayout;