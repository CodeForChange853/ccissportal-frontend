import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

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
  dangerBd: 'rgba(220,38,38,0.25)',
  font: "'Plus Jakarta Sans', system-ui, sans-serif",
  fontMono: "'JetBrains Mono', monospace",
};

const Icons = {
  crest: (
    <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
      <path d="M24 4L6 14v14c0 10 8 16 18 18 10-2 18-8 18-18V14L24 4z"
        stroke={P.gold} strokeWidth="1.8" fill={P.goldDim} />
      <path d="M24 14v10M19 19h10M16 28c2 3 5 5 8 5s6-2 8-5"
        stroke={P.goldLight} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  verify: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={P.gold} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  scan: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={P.gold} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 17h7M17.5 14v7" />
    </svg>
  ),
  enroll: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={P.gold} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
      <path d="M14 2v6h6M9 15l2 2 4-4" />
    </svg>
  ),
  balance: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={P.gold} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  check: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" />
    </svg>
  ),
  eye: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  cube: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M7.5 4.21l4.5 2.6 4.5-2.6M12 22.08V12" />
    </svg>
  ),
  warning: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />
    </svg>
  ),
  arrow: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  ),
};

const STEPS = [
  { icon: Icons.verify, label: 'Verify Identity', desc: 'Upload your School ID for AI-powered identity verification.' },
  { icon: Icons.scan, label: 'Scan Documents', desc: 'Zero-retention AI parses your academic records securely.' },
  { icon: Icons.enroll, label: 'Enroll Subjects', desc: 'Smart prerequisite checks & real-time queue management.' },
  { icon: Icons.balance, label: 'Load Balanced', desc: 'Faculty assignments auto-balanced within regulation limits.' },
];

const FEATURES = [
  { icon: Icons.check, label: 'Intelligent Enrollment' },
  { icon: Icons.eye, label: 'Zero-Retention AI' },
  { icon: Icons.users, label: 'Faculty Load Balancing' },
  { icon: Icons.cube, label: 'ML Support Triage' },
];

const Landing = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ studentId: '', passkey: '' });
  const [error, setError] = useState('');
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
  );

  React.useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.studentId.trim()) { setError('Please enter a valid Student ID.'); return; }
    if (!formData.passkey.trim()) { setError('Please enter the system passkey.'); return; }
    
    try {
      await client.validatePreReg(formData.studentId, formData.passkey);
      navigate('/register', { state: { claimedId: formData.studentId, enteredPasskey: formData.passkey } });
    } catch (err) {
      setError(err.response?.data?.detail || 'Identity verification failed. Please check your credentials.');
    }
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      background: P.page,
      fontFamily: P.font,
      color: P.text,
      overflow: 'hidden',
    }}>

      <div style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `radial-gradient(${P.goldBorder} 1px, transparent 1px)`,
        backgroundSize: '36px 36px',
        opacity: 0.6,
      }} />
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse 80% 60% at 70% 40%, rgba(186,151,49,0.07) 0%, transparent 70%),
                     radial-gradient(ellipse 50% 50% at 20% 80%, rgba(186,151,49,0.05) 0%, transparent 60%)`,
      }} />

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        <div style={{ height: 3, background: `linear-gradient(to right, ${P.black}, ${P.gold}, ${P.goldLight}, ${P.gold}, ${P.black})`, flexShrink: 0 }} />

        <main style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: isDesktop ? '5rem 3rem' : '3.5rem 1.25rem',
          transition: 'filter 0.4s ease, opacity 0.4s ease',
          ...(showModal ? { filter: 'blur(4px)', opacity: 0.5, pointerEvents: 'none' } : {}),
        }}>
          <div style={{
            maxWidth: '72rem', width: '100%', margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr',
            gap: isDesktop ? '5rem' : '2.5rem',
            alignItems: 'center',
          }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                {Icons.crest}
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: P.gold, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    NWSSU System
                  </div>
                  <div style={{ fontSize: '0.7rem', color: P.textMuted, marginTop: 2 }}>
                    College of Computing &amp; Information Science
                  </div>
                </div>
              </div>

              <div>
                <h1 style={{
                  fontSize: 'clamp(2.4rem, 5.5vw, 3.6rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.05,
                  margin: 0,
                  background: `linear-gradient(135deg, ${P.black} 0%, ${P.blackSoft} 40%, ${P.gold} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  NexEnroll
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                  <div style={{ width: 32, height: 2, background: `linear-gradient(to right, ${P.gold}, ${P.goldLight})` }} />
                  <span style={{ fontSize: '0.68rem', fontWeight: 600, color: P.gold, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    AI-Powered Enrollment
                  </span>
                </div>
                <p style={{
                  marginTop: '1rem',
                  fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)',
                  color: P.textSec,
                  fontWeight: 400,
                  lineHeight: 1.7,
                  maxWidth: '32rem',
                }}>
                  Semestral enrollment &amp; faculty load balancing — secure, intelligent, and built for the modern university.
                </p>
              </div>

              {/* CTAs */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '0.25rem' }}>
                <button
                  onClick={() => setShowModal(true)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '0.875rem 1.75rem',
                    background: P.black,
                    color: P.surface,
                    fontWeight: 700, fontSize: '0.875rem',
                    fontFamily: P.font,
                    borderRadius: '0.625rem', border: `1px solid ${P.black}`,
                    cursor: 'pointer',
                    boxShadow: `0 4px 24px ${P.goldGlow}, 0 1px 4px rgba(0,0,0,0.12)`,
                    transition: 'all 0.2s ease',
                    letterSpacing: '0.01em',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = P.blackSoft;
                    e.currentTarget.style.boxShadow = `0 6px 32px rgba(186,151,49,0.32), 0 2px 8px rgba(0,0,0,0.16)`;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = P.black;
                    e.currentTarget.style.boxShadow = `0 4px 24px ${P.goldGlow}, 0 1px 4px rgba(0,0,0,0.12)`;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  Begin Enrollment {Icons.arrow}
                </button>
                <button
                  onClick={() => navigate('/login')}
                  style={{
                    padding: '0.875rem 1.75rem',
                    background: 'transparent',
                    color: P.text,
                    fontWeight: 600, fontSize: '0.875rem',
                    fontFamily: P.font,
                    borderRadius: '0.625rem',
                    border: `1px solid ${P.border}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    letterSpacing: '0.01em',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = P.gold;
                    e.currentTarget.style.color = P.gold;
                    e.currentTarget.style.background = P.goldDim;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = P.border;
                    e.currentTarget.style.color = P.text;
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  Login
                </button>
              </div>


              <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingTop: 4 }}>
                {['AI-Secured', 'Zero Data Retention', 'Real-Time'].map((tag, i) => (
                  <span key={i} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    fontSize: '0.68rem', fontWeight: 600, color: P.textMuted,
                    letterSpacing: '0.03em',
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: P.gold, display: 'inline-block' }} />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {isDesktop && (
              <div style={{
                background: P.surface,
                border: `1px solid ${P.border}`,
                borderRadius: '1.25rem',
                padding: '2rem 2rem 1.5rem',
                boxShadow: `0 2px 4px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.06), 0 0 0 1px ${P.goldBorder}`,
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                  background: `linear-gradient(to right, ${P.black}, ${P.gold}, ${P.goldLight})`,
                }} />
                <p style={{
                  fontSize: '0.6rem', fontWeight: 700, color: P.gold,
                  textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1.75rem',
                }}>
                  How It Works
                </p>
                <div>
                  {STEPS.map((step, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', position: 'relative', marginBottom: i < STEPS.length - 1 ? 0 : 0 }}>
                      {i < STEPS.length - 1 && (
                        <div style={{
                          position: 'absolute', left: 17, top: 38, width: 1,
                          height: 'calc(100% - 4px)',
                          background: `linear-gradient(to bottom, ${P.goldBorder}, transparent)`,
                        }} />
                      )}
                      <div style={{
                        flexShrink: 0, width: 36, height: 36, borderRadius: '50%',
                        background: P.goldDim,
                        border: `1px solid ${P.goldBorder}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        position: 'relative', zIndex: 1,
                      }}>
                        {step.icon}
                      </div>
                      <div style={{ paddingBottom: '1.75rem' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: P.text }}>{step.label}</div>
                        <div style={{ fontSize: '0.73rem', color: P.textMuted, marginTop: 3, lineHeight: 1.55 }}>{step.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        {!isDesktop && (
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            gap: '0.75rem', padding: '0 1.25rem 1.75rem',
            transition: 'filter 0.4s ease, opacity 0.4s ease',
            ...(showModal ? { filter: 'blur(4px)', opacity: 0.5, pointerEvents: 'none' } : {}),
          }}>
            {STEPS.map((step, i) => (
              <React.Fragment key={i}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: P.goldDim, border: `1px solid ${P.goldBorder}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto',
                  }}>
                    {step.icon}
                  </div>
                  <div style={{ marginTop: 4, fontSize: '0.62rem', color: P.textMuted, fontWeight: 600 }}>
                    {step.label.split(' ')[0]}
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ height: 1, width: '1.75rem', background: P.goldBorder, flexShrink: 0 }} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        <div style={{
          borderTop: `1px solid ${P.border}`,
          background: P.depth,
          transition: 'filter 0.4s ease, opacity 0.4s ease',
          ...(showModal ? { filter: 'blur(4px)', opacity: 0.5, pointerEvents: 'none' } : {}),
        }}>
          <div style={{
            maxWidth: '64rem', margin: '0 auto',
            padding: '1.125rem 1.5rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: '0.75rem',
          }}>
            {FEATURES.map((feat, i) => (
              <React.Fragment key={i}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  color: P.textSec, fontSize: '0.82rem', fontWeight: 600,
                  flex: '1 1 auto', minWidth: 140,
                }}>
                  <span style={{ color: P.gold, flexShrink: 0 }}>{feat.icon}</span>
                  {feat.label}
                </div>
                {i < FEATURES.length - 1 && isDesktop && (
                  <div style={{ width: 1, height: '1.125rem', background: P.border, flexShrink: 0 }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <footer style={{
          textAlign: 'center', padding: '1.125rem 1.25rem',
          fontSize: '0.72rem', color: P.textMuted,
          borderTop: `1px solid ${P.borderSoft}`,
          fontFamily: P.fontMono, letterSpacing: '0.03em',
        }}>
          <span>CCIS — NWSSU System</span>
          <span style={{ margin: '0 10px', opacity: 0.4 }}>|</span>
          <span>Secured by AI Vision · © 2025 · Garcia, Adrian</span>
        </footer>
      </div>

      {showModal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(13,13,13,0.55)',
            backdropFilter: 'blur(6px)',
            padding: '0 1rem',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
          <div style={{
            width: '100%', maxWidth: '26rem',
            background: P.surface,
            border: `1px solid ${P.border}`,
            borderRadius: '1.125rem',
            boxShadow: `0 20px 60px rgba(0,0,0,0.14), 0 0 0 1px ${P.goldBorder}`,
            overflow: 'hidden',
            animation: 'slideUp 0.25s ease',
          }}>
            <div style={{ height: 3, background: `linear-gradient(to right, ${P.black}, ${P.gold}, ${P.goldLight})` }} />

            <div style={{ padding: '1.75rem 2rem 2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: P.text, margin: 0 }}>Identity Verification</h2>
                  <p style={{ fontSize: '0.72rem', color: P.textMuted, marginTop: 3 }}>Confirm your student credentials to begin</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: P.depth, border: `1px solid ${P.border}`,
                    color: P.textMuted, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.1rem', lineHeight: 1, fontFamily: P.font,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = P.border; e.currentTarget.style.color = P.text; }}
                  onMouseLeave={e => { e.currentTarget.style.background = P.depth; e.currentTarget.style.color = P.textMuted; }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
                {[
                  { key: 'studentId', label: 'Student ID', type: 'text', placeholder: 'e.g. 23-12345' },
                  { key: 'passkey', label: 'System Passkey', type: 'password', placeholder: '••••••••' },
                ].map(({ key, label, type, placeholder }) => (
                  <div key={key}>
                    <label style={{
                      display: 'block', fontSize: '0.68rem', fontWeight: 700,
                      color: P.gold, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6,
                    }}>{label}</label>
                    <input
                      type={type}
                      placeholder={placeholder}
                      value={formData[key]}
                      onChange={e => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        background: P.page, border: `1px solid ${P.border}`,
                        borderRadius: '0.5rem', padding: '0.75rem 1rem',
                        color: P.text, fontSize: '0.875rem',
                        fontFamily: P.font, outline: 'none',
                        transition: 'border-color 0.15s, box-shadow 0.15s',
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = P.gold;
                        e.target.style.boxShadow = `0 0 0 3px rgba(186,151,49,0.12)`;
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = P.border;
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                ))}

                {error && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: P.dangerBg, border: `1px solid ${P.dangerBd}`,
                    color: P.danger, padding: '0.625rem 0.875rem',
                    borderRadius: '0.5rem', fontSize: '0.82rem',
                  }}>
                    {Icons.warning} {error}
                  </div>
                )}

                <button
                  type="submit"
                  style={{
                    width: '100%', padding: '0.875rem',
                    background: P.black, color: P.surface,
                    fontWeight: 700, fontSize: '0.875rem',
                    fontFamily: P.font, borderRadius: '0.625rem',
                    border: 'none', cursor: 'pointer',
                    boxShadow: `0 4px 20px ${P.goldGlow}`,
                    transition: 'all 0.2s ease', marginTop: 4,
                    letterSpacing: '0.02em',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = P.blackSoft;
                    e.currentTarget.style.boxShadow = `0 6px 28px rgba(186,151,49,0.30)`;
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = P.black;
                    e.currentTarget.style.boxShadow = `0 4px 20px ${P.goldGlow}`;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  Verify &amp; Continue
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;