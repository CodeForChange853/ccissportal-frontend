import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NAV_LINKS = [
  { key: 'status',        label: 'System Status', path: '/status' },
  { key: 'rules',         label: 'Rules',          path: '/rules' },
  { key: 'announcements', label: 'Announcements',  path: '/announcements' },
  { key: 'honors',        label: 'Latin Honors',   path: '/latin-honors' },
];

const PublicNav = ({ active = '', subtitle, rightSlot }) => {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '.75rem 1.5rem', gap: '1rem',
      backdropFilter: 'blur(28px) saturate(160%)',
      WebkitBackdropFilter: 'blur(28px) saturate(160%)',
      background: 'rgba(250,248,245,.94)',
      borderBottom: '1px solid rgba(163,127,33,.18)',
      boxShadow: '0 2px 12px rgba(0,0,0,.06), inset 0 1px 0 rgba(255,255,255,.80)',
    }}>

      {/* Brand */}
      <button
        onClick={() => navigate('/')}
        style={{
          display: 'flex', alignItems: 'center', gap: '.625rem',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          flexShrink: 0,
        }}
      >
        <div style={{
          width: 28, height: 28, borderRadius: 7, flexShrink: 0,
          background: 'linear-gradient(135deg,#BA9731,#9A7D28)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: '.8rem', color: '#FEFEFE',
          boxShadow: '0 2px 8px rgba(163,127,33,.30)',
        }}>N</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span style={{
            fontSize: '.875rem', fontWeight: 700, letterSpacing: '-.02em',
            color: '#1A1814', lineHeight: 1.1,
          }}>
            Nex<em style={{ color: '#A37F21', fontStyle: 'normal' }}>Enroll</em>
          </span>
          {subtitle && (
            <span style={{
              fontSize: 'var(--text-label)', color: 'rgba(163,127,33,.70)',
              letterSpacing: '.06em', lineHeight: 1,
            }}>{subtitle}</span>
          )}
        </div>
      </button>

      {/* Nav links — hidden on mobile */}
      {!mobile && (
        <div style={{ display: 'flex', gap: '.25rem', alignItems: 'center' }}>
          {NAV_LINKS.map(link => {
            const isActive = active === link.key;
            return (
              <button
                key={link.key}
                onClick={() => navigate(link.path)}
                style={{
                  background: isActive
                    ? 'linear-gradient(135deg,rgba(163,127,33,.12),rgba(163,127,33,.06))'
                    : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(163,127,33,.40)' : 'rgba(163,127,33,.18)'}`,
                  borderRadius: '.5rem',
                  color: isActive ? '#1A1814' : 'rgba(26,24,20,.55)',
                  fontSize: 'var(--text-label)',
                  fontWeight: isActive ? 700 : 500,
                  letterSpacing: '.04em',
                  padding: '.375rem .875rem',
                  cursor: 'pointer',
                  transition: 'all .2s',
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = 'rgba(163,127,33,.35)';
                    e.currentTarget.style.color = 'rgba(26,24,20,.82)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = 'rgba(163,127,33,.18)';
                    e.currentTarget.style.color = 'rgba(26,24,20,.55)';
                  }
                }}
              >
                {link.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Right slot or back button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexShrink: 0 }}>
        {rightSlot}
        {!rightSlot && (
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'transparent',
              border: '1px solid rgba(163,127,33,.25)',
              borderRadius: '.5rem',
              color: '#5C5A56',
              fontSize: 'var(--text-label)',
              fontWeight: 600,
              padding: '.375rem .875rem',
              cursor: 'pointer',
              transition: 'all .2s',
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(163,127,33,.50)';
              e.currentTarget.style.color = '#1A1814';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(163,127,33,.25)';
              e.currentTarget.style.color = '#5C5A56';
            }}
          >
            ← Home
          </button>
        )}
      </div>
    </nav>
  );
};

export default PublicNav;
