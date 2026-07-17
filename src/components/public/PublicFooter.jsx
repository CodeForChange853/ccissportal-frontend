import React from 'react';
import { useNavigate } from 'react-router-dom';

const PublicFooter = ({ year = 2025 }) => {
  const navigate = useNavigate();

  return (
    <footer style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexWrap: 'wrap', gap: '.5rem',
      padding: '1.125rem 1.5rem',
      borderTop: '1px solid rgba(163,127,33,.15)',
      background: '#F3EFE9',
      fontSize: 'var(--text-small)',
      color: '#5C5A56',
      letterSpacing: '.03em',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <span>CCIS — NWSSU System</span>

      <span style={{ color: 'rgba(26,24,20,.25)' }}>|</span>

      <button
        onClick={() => navigate('/status')}
        style={{
          background: 'none', border: 'none', padding: 0,
          color: '#A37F21', cursor: 'pointer',
          fontSize: 'inherit', letterSpacing: 'inherit',
          fontFamily: 'inherit',
          transition: 'color .15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#8B6914'; }}
        onMouseLeave={e => { e.currentTarget.style.color = '#A37F21'; }}
      >
        System Status
      </button>

      <span style={{ color: 'rgba(26,24,20,.25)' }}>|</span>

      <button
        onClick={() => navigate('/rules')}
        style={{
          background: 'none', border: 'none', padding: 0,
          color: '#5C5A56', cursor: 'pointer',
          fontSize: 'inherit', letterSpacing: 'inherit',
          fontFamily: 'inherit',
          transition: 'color .15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#1A1814'; }}
        onMouseLeave={e => { e.currentTarget.style.color = '#5C5A56'; }}
      >
        Rules
      </button>

      <span style={{ color: 'rgba(26,24,20,.25)' }}>|</span>

      <span>NexEnroll · AI-Powered Enrollment · © {year}</span>
    </footer>
  );
};

export default PublicFooter;
