import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useSystemHealth } from '../hooks/useSystemHealth';
import GlassBackground from '../components/public/GlassBackground';

const CrestIcon = () => (
  <svg width="34" height="34" viewBox="0 0 48 48" fill="none">
    <path d="M24 4L6 14v14c0 10 8 16 18 18 10-2 18-8 18-18V14L24 4z"
      stroke="#BA9731" strokeWidth="1.8" fill="rgba(186,151,49,0.09)" />
    <path d="M24 14v10M19 19h10M16 28c2 3 5 5 8 5s6-2 8-5"
      stroke="#DACE84" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const AlertIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
  </svg>
);

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { status } = useSystemHealth();
  const isBlocked = status === 'OFFLINE' || status === 'DEPLOYING';

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
      const routes = { ADMIN: '/portal/admin', FACULTY: '/portal/faculty', SECRETARY: '/portal/secretary' };
      navigate(routes[result.role] ?? '/portal/student');
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <GlassBackground centered>
      <style>{`.login-text-btn:hover{color:#BA9731!important}`}</style>
      <div id="main-content" style={{ width: '100%', maxWidth: '24rem', position: 'relative' }}>
        {/* Card */}
        <div
          className="glass-panel-elevated glass-slide-up"
          style={{ overflow: 'hidden' }}
        >
          {/* Gold accent bar */}
          <div className="glass-accent-bar" />

          <div style={{ padding: '2.25rem 2rem 2rem' }}>

            {/* Logo row */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '0.75rem', marginBottom: '0.625rem',
            }}>
              <CrestIcon />
              <span style={{
                fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em',
                color: 'var(--glass-text-primary)',
              }}>
                Nex<span style={{ color: '#BA9731' }}>Enroll</span>
              </span>
            </div>

            <p style={{
              textAlign: 'center',
              fontSize: 'var(--text-small)',
              color: 'var(--glass-text-secondary)',
              marginBottom: '1.75rem',
              lineHeight: 1.5,
            }}>
              Sign in to your student, faculty, or admin account
            </p>

            {/* Error banner */}
            {error && (
              <div
                role="alert"
                aria-live="assertive"
                className="glass-alert-danger"
                style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-small)', marginBottom: '1rem' }}
              >
                <AlertIcon /> {error}
              </div>
            )}

            {/* System status banner */}
            {status !== 'CHECKING' && status !== 'ONLINE' && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(186,151,49,0.07)',
                border: '1px solid rgba(186,151,49,0.22)',
                borderRadius: '0.625rem',
                color: 'rgba(218,206,132,0.85)',
                padding: '0.75rem 0.875rem',
                fontSize: 'var(--text-small)',
                marginBottom: '1rem',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}>
                <AlertIcon />
                {status === 'MAINTENANCE'
                  ? 'System maintenance in progress — admin access still available.'
                  : status === 'DEPLOYING'
                    ? 'System is restarting, please wait a moment.'
                    : 'Network connection lost.'}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* Email */}
              <div style={{ marginBottom: '1.125rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-label)',
                  fontWeight: 700,
                  color: 'var(--glass-text-label)',
                  letterSpacing: '0.09em',
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}>
                  Email / Username
                </label>
                <input
                  className="glass-input"
                  type="text"
                  required
                  placeholder="you@nwssu.edu.ph"
                  maxLength={150}
                  value={formData.email}
                  onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-label)',
                  fontWeight: 700,
                  color: 'var(--glass-text-label)',
                  letterSpacing: '0.09em',
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="glass-input"
                    type={showPw ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    maxLength={100}
                    value={formData.password}
                    onChange={e => setFormData(f => ({ ...f, password: e.target.value }))}
                    style={{ paddingRight: '3.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    style={{
                      position: 'absolute', right: '0.75rem', top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent', border: 'none',
                      color: 'var(--glass-text-muted)',
                      fontSize: 'var(--text-label)',
                      fontWeight: 700,
                      letterSpacing: '0.07em',
                      cursor: 'pointer',
                      fontFamily: "'Inter', system-ui, sans-serif",
                      padding: '0.2rem 0.4rem',
                      borderRadius: 4,
                      transition: 'color 0.15s',
                    }}
                    className="login-text-btn"
                  >
                    {showPw ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="glass-btn-primary"
                disabled={loading || isBlocked}
                style={{ width: '100%', padding: '0.875rem' }}
              >
                {loading ? 'Authenticating…' : isBlocked ? 'System Offline' : 'Sign In'}
              </button>
            </form>

            {/* Divider */}
            <div style={{
              height: 1,
              background: 'rgba(186,151,49,0.10)',
              margin: '1.5rem 0 1.25rem',
            }} />

            {/* Back link */}
            <button
              onClick={() => navigate('/')}
              style={{
                display: 'block', width: '100%', textAlign: 'center',
                fontSize: 'var(--text-small)',
                color: 'var(--glass-text-muted)',
                background: 'transparent', border: 'none',
                cursor: 'pointer',
                fontFamily: "'Inter', system-ui, sans-serif",
                transition: 'color 0.15s',
              }}
              className="login-text-btn"
            >
              ← Back to home
            </button>

          </div>
        </div>
      </div>
    </GlassBackground>
  );
};

export default Login;
