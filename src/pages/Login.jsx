import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSystemHealth } from '../hooks/useSystemHealth';

const P = {
  page: '#F2F2F2',
  depth: '#E8E4DC',
  surface: '#FEFEFE',
  black: '#0D0D0D',
  blackSoft: '#1A1A1A',
  gold: '#BA9731',
  goldLight: '#DACE84',
  goldDim: 'rgba(186,151,49,0.09)',
  goldGlow: 'rgba(186,151,49,0.22)',
  goldBorder: 'rgba(186,151,49,0.28)',
  text: '#0D0D0D',
  textSec: '#3A3A3A',
  textMuted: '#7A7A7A',
  border: 'rgba(0,0,0,0.09)',
  borderSoft: 'rgba(0,0,0,0.05)',
  danger: '#dc2626',
  dangerBg: 'rgba(220,38,38,0.07)',
  dangerBd: 'rgba(220,38,38,0.22)',
  font: "'Plus Jakarta Sans', system-ui, sans-serif",
  fontMono: "'JetBrains Mono', monospace",
};

const CrestIcon = () => (
  <svg width="34" height="34" viewBox="0 0 48 48" fill="none">
    <path d="M24 4L6 14v14c0 10 8 16 18 18 10-2 18-8 18-18V14L24 4z"
      stroke={P.gold} strokeWidth="1.8" fill={P.goldDim} />
    <path d="M24 14v10M19 19h10M16 28c2 3 5 5 8 5s6-2 8-5"
      stroke={P.goldLight} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const AlertIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
  </svg>
);

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { isSystemUp, status, errorType } = useSystemHealth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);

    if (result.success) {
      const routes = { ADMIN: '/portal/admin', FACULTY: '/portal/faculty' };
      navigate(routes[result.role] ?? '/portal/student');
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  const inputFocus = (e) => {
    e.target.style.borderColor = P.gold;
    e.target.style.boxShadow = `0 0 0 3px rgba(186,151,49,0.12)`;
  };
  const inputBlur = (e) => {
    e.target.style.borderColor = P.border;
    e.target.style.boxShadow = 'none';
  };

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    background: P.page,
    border: `1px solid ${P.border}`,
    borderRadius: '0.5rem',
    padding: '0.75rem 1rem',
    color: P.text, fontSize: '0.875rem',
    fontFamily: P.font, outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      background: P.page,
      fontFamily: P.font,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      overflow: 'hidden',
    }}>

      {/* Static ambient dot grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `radial-gradient(${P.goldBorder} 1px, transparent 1px)`,
        backgroundSize: '36px 36px',
        opacity: 0.55,
      }} />
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse 70% 60% at 50% 40%, rgba(186,151,49,0.06) 0%, transparent 70%)`,
      }} />

      {/* Card */}
      <div style={{
        position: 'relative', zIndex: 10,
        width: '100%', maxWidth: '24rem',
        background: P.surface,
        border: `1px solid ${P.border}`,
        borderRadius: '1.125rem',
        boxShadow: `0 2px 8px rgba(0,0,0,0.06), 0 16px 48px rgba(0,0,0,0.08), 0 0 0 1px ${P.goldBorder}`,
        overflow: 'hidden',
        animation: 'slideUp 0.3s ease',
      }}>
        <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>

        {/* Gold accent bar */}
        <div style={{ height: 3, background: `linear-gradient(to right, ${P.black}, ${P.gold}, ${P.goldLight}, ${P.gold}, ${P.black})` }} />

        <div style={{ padding: '2.25rem 2rem 2rem' }}>

          {/* Logo row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.625rem' }}>
            <CrestIcon />
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: P.black, letterSpacing: '-0.03em' }}>
              Nex<span style={{ color: P.gold }}>Enroll</span>
            </span>
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: P.textMuted, marginBottom: '1.75rem', lineHeight: 1.5 }}>
            Sign in to your student, faculty, or admin account
          </p>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: P.dangerBg, border: `1px solid ${P.dangerBd}`,
              color: P.danger, padding: '0.625rem 0.875rem',
              borderRadius: '0.5rem', fontSize: '0.82rem', marginBottom: '1rem',
            }}>
              <AlertIcon /> {error}
            </div>
          )}

          {!isSystemUp && status !== 'CHECKING' && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(186,151,49,0.08)', border: `1px solid ${P.goldBorder}`,
              color: P.gold, padding: '0.625rem 0.875rem',
              borderRadius: '0.5rem', fontSize: '0.82rem', marginBottom: '1rem',
            }}>
              <AlertIcon /> 
              {status === 'MAINTENANCE' ? 'Server is updating... Please wait.' : 'Network connection lost.'}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div style={{ marginBottom: '1.125rem' }}>
              <label style={{
                display: 'block', fontSize: '0.65rem', fontWeight: 700,
                color: P.gold, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 6,
              }}>
                Email / Username
              </label>
              <input
                type="text"
                required
                placeholder="you@nwssu.edu.ph"
                maxLength={150}
                value={formData.email}
                onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                style={inputStyle}
                onFocus={inputFocus}
                onBlur={inputBlur}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block', fontSize: '0.65rem', fontWeight: 700,
                color: P.gold, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 6,
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  maxLength={100}
                  value={formData.password}
                  onChange={e => setFormData(f => ({ ...f, password: e.target.value }))}
                  style={{ ...inputStyle, paddingRight: '4rem' }}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'transparent', border: 'none',
                    color: P.textMuted, fontSize: '0.6rem', fontWeight: 700,
                    letterSpacing: '0.07em', cursor: 'pointer',
                    fontFamily: P.fontMono, padding: '0.2rem 0.4rem',
                    borderRadius: 4, transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = P.gold; }}
                  onMouseLeave={e => { e.currentTarget.style.color = P.textMuted; }}
                >
                  {showPw ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isSystemUp}
              style={{
                width: '100%', padding: '0.875rem',
                background: (loading || !isSystemUp) ? P.depth : P.black,
                color: (loading || !isSystemUp) ? P.textMuted : P.surface,
                fontWeight: 700, fontSize: '0.875rem',
                fontFamily: P.font, borderRadius: '0.625rem',
                border: `1px solid ${(loading || !isSystemUp) ? P.border : P.black}`,
                cursor: (loading || !isSystemUp) ? 'not-allowed' : 'pointer',
                boxShadow: (loading || !isSystemUp) ? 'none' : `0 4px 20px ${P.goldGlow}`,
                transition: 'all 0.2s ease',
                letterSpacing: '0.02em',
              }}
              onMouseEnter={e => {
                if (!loading && isSystemUp) {
                  e.currentTarget.style.background = P.blackSoft;
                  e.currentTarget.style.boxShadow = `0 6px 28px rgba(186,151,49,0.30)`;
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = (loading || !isSystemUp) ? P.depth : P.black;
                e.currentTarget.style.boxShadow = (loading || !isSystemUp) ? 'none' : `0 4px 20px ${P.goldGlow}`;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {loading ? 'Authenticating…' : !isSystemUp ? 'System Offline' : 'Sign In'}
            </button>
          </form>

          <div style={{ height: 1, background: P.borderSoft, margin: '1.5rem 0 1.25rem' }} />

          <button
            onClick={() => navigate('/')}
            style={{
              display: 'block', width: '100%', textAlign: 'center',
              fontSize: '0.78rem', color: P.textMuted,
              background: 'transparent', border: 'none',
              cursor: 'pointer', fontFamily: P.font,
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = P.gold; }}
            onMouseLeave={e => { e.currentTarget.style.color = P.textMuted; }}
          >
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;