import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import client from '../../api/client';
import useSystemHealth from '../../hooks/useSystemHealth';
import SimulationGuideSection, { FloatingAIAssistant } from '../SimulationGuideSection';
import { useReducedMotion } from './utils';
import { Icons } from './utils';
import { ACT_1, ACT_2, ACT_3 } from './data';
import HeroSection from './HeroSection';
import ProblemSection from './ProblemSection';
import JourneySection from './JourneySection';
import CommandCenterSection from './CommandCenterSection';
import FacultyIntelligenceSection from './FacultyIntelligenceSection';
import SecurityVaultSection from './SecurityVaultSection';
import EcosystemSection from './EcosystemSection';
import EnrollmentPortalSection from './EnrollmentPortalSection';
import '../../styles/components/landing.css';

gsap.registerPlugin(ScrollTrigger);

const Landing = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ studentId: '', passkey: '' });
  const [error, setError] = useState('');
  const { enrollmentOpen, status } = useSystemHealth();
  const isOnline = status === 'ONLINE';
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
  );
  const howItWorksRef = useRef(null);
  const enrollBtnRef = useRef(null);
  const modalRef = useRef(null);
  const heroRef = useRef(null);
  const act1Ref = useRef(null);
  const act2Ref = useRef(null);
  const reduced = useReducedMotion();

  const [carouselStep, setCarouselStep] = useState(null);
  const [carouselAnimKey, setCarouselAnimKey] = useState(0);

  const handlePreviewStep = useCallback((idx) => {
    setCarouselStep(idx);
    setCarouselAnimKey(k => k + 1);
  }, []);

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!showModal) return;
    const el = modalRef.current?.querySelector('input:not([disabled]), button:not([disabled])');
    el?.focus();
  }, [showModal]);

  useEffect(() => {
    if (!showModal) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') { setShowModal(false); enrollBtnRef.current?.focus(); return; }
      if (e.key !== 'Tab') return;
      const focusable = [...(modalRef.current?.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ) ?? [])];
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

  // ACT_3 is the persistent base. ACT_1 greets at hero then fades out; ACT_2 warms the mid arc.
  useEffect(() => {
    if (reduced || !act1Ref.current || !act2Ref.current) return;
    const tween1 = gsap.fromTo(act1Ref.current, { opacity: 1 }, {
      opacity: 0, ease: 'none',
      scrollTrigger: { trigger: '#lp-problem', start: 'top 65%', end: 'bottom 20%', scrub: 1.4 },
    });
    const tween2 = gsap.fromTo(act2Ref.current, { opacity: 0 }, {
      opacity: 0.82, ease: 'none',
      scrollTrigger: { trigger: '#lp-journey', start: 'top 75%', end: 'top 15%', scrub: 1.4 },
    });
    const rafId = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      tween1.scrollTrigger?.kill();
      tween2.scrollTrigger?.kill();
      cancelAnimationFrame(rafId);
    };
  }, [reduced]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const idRegex = /^\d{2}-\d{5,6}$/;
    if (!idRegex.test(formData.studentId.trim())) {
      setError('Invalid format. Please use XX-XXXXX (e.g., 23-10045).');
      return;
    }
    if (!formData.passkey.trim()) { setError('Please enter the system passkey.'); return; }
    try {
      await client.validatePreReg(formData.studentId, formData.passkey);
      navigate('/register', { state: { claimedId: formData.studentId, enteredPasskey: formData.passkey } });
    } catch (err) {
      setError(err.response?.data?.detail || 'Identity verification failed. Please check your credentials.');
    }
  };

  const statusDotColor = isOnline ? '#16a34a' : (status === 'MAINTENANCE' ? '#ca8a04' : '#dc2626');

  // Single page-content wrapper for modal blur — one repaint instead of four
  const blurStyle = showModal ? { filter: 'blur(4px)', opacity: 0.5, pointerEvents: 'none' } : {};

  return (
    <div style={{ overflowX: 'hidden', fontFamily: "'Inter', system-ui, sans-serif", color: '#1A1814', position: 'relative' }}>
      <a href="#main-content" className="skip-to-content">Skip to main content</a>

      {/* Fixed gradient stage — ACT_3 always as base; ACT_1 greets then fades; ACT_2 warms mid-arc */}
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', inset: 0, background: ACT_3 }} />
        <div ref={act2Ref} style={{ position: 'absolute', inset: 0, background: ACT_2, opacity: 0, willChange: 'opacity' }} />
        <div ref={act1Ref} style={{ position: 'absolute', inset: 0, background: ACT_1, opacity: 1, willChange: 'opacity' }} />
      </div>

      {/* Liquid Glass Top Bar */}
      <div style={{
        position: 'fixed',
        top: isDesktop ? 14 : 10,
        left: '50%',
        transform: 'translateX(-50%)',
        width: isDesktop ? 'min(calc(100% - 48px), 1080px)' : 'calc(100% - 24px)',
        height: isDesktop ? 46 : 40,
        zIndex: 300, borderRadius: 13, overflow: 'hidden',
        border: '1px solid rgba(163,127,33,0.18)',
        boxShadow: [
          '0 4px 24px rgba(0,0,0,0.08)',
          '0 1px 4px rgba(0,0,0,0.04)',
          'inset 0 1px 0 rgba(255,255,255,0.90)',
          'inset 0 -1px 0 rgba(163,127,33,0.06)',
        ].join(', '),
        animation: 'glassBreath 8s ease-in-out infinite',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: [
            enrollmentOpen
              ? 'radial-gradient(ellipse 38% 100% at 6% 50%, rgba(22,163,74,0.06) 0%, transparent 100%)'
              : 'radial-gradient(ellipse 38% 100% at 6% 50%, rgba(220,38,38,0.05) 0%, transparent 100%)',
            'radial-gradient(ellipse 42% 100% at 88% 50%, rgba(163,127,33,0.05) 0%, transparent 100%)',
            'rgba(250,248,245,0.92)',
          ].join(', '),
          backdropFilter: 'blur(24px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
        }} />
        <div style={{ position: 'absolute', top: 0, left: '6%', right: '6%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(163,127,33,0.25) 22%, rgba(163,127,33,0.35) 50%, rgba(163,127,33,0.25) 78%, transparent)', pointerEvents: 'none' }} />
        <div className={showModal ? undefined : 'nav-shimmer-active'} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.06) 50%, rgba(163,127,33,0.04) 54%, rgba(255,255,255,0.04) 60%, transparent 72%)' }} />
        <div style={{ position: 'relative', zIndex: 2, height: '100%', padding: isDesktop ? '0 1.25rem' : '0 0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
              background: enrollmentOpen ? '#16a34a' : '#dc2626',
              boxShadow: enrollmentOpen ? '0 0 0 2.5px rgba(22,163,74,0.20), 0 0 6px rgba(22,163,74,0.45)' : '0 0 0 2.5px rgba(220,38,38,0.20), 0 0 6px rgba(220,38,38,0.45)',
              animation: 'pulse 2s infinite',
            }} />
            <span style={{ fontSize: isDesktop ? '0.59rem' : '0.54rem', fontWeight: 700, color: enrollmentOpen ? '#16a34a' : '#dc2626', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap', fontFamily: "'Orbitron', sans-serif" }}>
              {isDesktop ? `Enrollment ${enrollmentOpen ? 'Active' : 'Closed'}` : (enrollmentOpen ? 'Active' : 'Closed')}
            </span>
          </div>
          {isDesktop && (
            <div style={{ flex: 1, height: 1, minWidth: 24, background: 'linear-gradient(to right, transparent, rgba(163,127,33,0.15) 30%, rgba(163,127,33,0.15) 70%, transparent)' }} />
          )}
          <div style={{ display: 'flex', gap: isDesktop ? '0.15rem' : '0.08rem', flexShrink: 0, marginLeft: isDesktop ? 0 : 'auto' }}>
            {[
              { label: isDesktop ? 'System Status' : 'Status', onClick: () => navigate('/status'), hasDot: true },
              { label: 'Rules', onClick: () => navigate('/rules') },
              { label: isDesktop ? 'Announcements' : 'News', onClick: () => navigate('/announcements') },
            ].map((btn, i) => (
              <button
                key={i} onClick={btn.onClick} className="liquid-nav-btn"
                style={{ padding: isDesktop ? '0.28rem 0.8rem' : '0.2rem 0.5rem', fontSize: isDesktop ? '0.71rem' : '0.62rem', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: btn.hasDot ? 6 : 0, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 600, color: '#5C5A56', transition: 'color 0.18s ease, background 0.18s ease' }}
              >
                {btn.hasDot && <span style={{ width: 5, height: 5, borderRadius: '50%', flexShrink: 0, background: statusDotColor, animation: 'pulse 2s infinite' }} />}
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Single blur wrapper for all page content */}
      <div style={{ transition: 'filter 0.5s ease, opacity 0.5s ease', ...blurStyle }}>
        {/* § 1 — HERO */}
        <div
          ref={heroRef}
          className="glass-canvas"
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'transparent',
            backgroundImage: [
              'radial-gradient(ellipse 65% 55% at 20% 10%, rgba(163,127,33,0.11) 0%, transparent 60%)',
              'radial-gradient(ellipse 45% 45% at 80% 75%, rgba(163,127,33,0.08) 0%, transparent 55%)',
              'radial-gradient(ellipse 80% 40% at 50% 110%, rgba(140,80,20,0.08) 0%, transparent 50%)',
            ].join(', '),
            overflowX: 'visible',
          }}
        >
          <div className="glass-noise" aria-hidden="true" />
          <HeroSection
            isDesktop={isDesktop}
            showModal={showModal}
            enrollmentOpen={enrollmentOpen}
            enrollBtnRef={enrollBtnRef}
            howItWorksRef={howItWorksRef}
            carouselStep={carouselStep}
            carouselAnimKey={carouselAnimKey}
            onEnroll={() => { if (!enrollmentOpen) return; setShowModal(true); }}
            onLogin={() => navigate('/login')}
            onNavigate={navigate}
          />
        </div>

        {/* §§ 2–7 — Feature Sections */}
        <ProblemSection isDesktop={isDesktop} />
        <JourneySection isDesktop={isDesktop} />
        <FacultyIntelligenceSection isDesktop={isDesktop} />
        <CommandCenterSection isDesktop={isDesktop} />
        <EcosystemSection isDesktop={isDesktop} />
        <SecurityVaultSection isDesktop={isDesktop} />

        {/* SimulationGuideSection */}
        <SimulationGuideSection
          howItWorksRef={howItWorksRef}
          isDesktop={isDesktop}
          showModal={showModal}
          onPreviewStep={handlePreviewStep}
        />

        {/* § 8 — Enrollment Portal */}
        <EnrollmentPortalSection
          isDesktop={isDesktop}
          enrollmentOpen={enrollmentOpen}
          onEnroll={() => { if (enrollmentOpen) setShowModal(true); else navigate('/announcements'); }}
          onLogin={() => navigate('/login')}
          onStatus={() => navigate('/status')}
        />

        {/* Footer */}
        <footer style={{
          textAlign: 'center', padding: '1.125rem 1.25rem',
          fontSize: 'var(--text-small)', color: '#8A8680',
          borderTop: '1px solid rgba(163,127,33,0.12)',
          background: 'transparent', letterSpacing: '0.03em',
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          <span>CCIS — NWSSU System</span>
          <span style={{ margin: '0 10px', color: 'rgba(163,127,33,0.25)' }}>|</span>
          <button onClick={() => navigate('/status')} style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', color: '#A37F21', font: 'inherit', padding: 0 }}>
            System Status
          </button>
          <span style={{ margin: '0 10px', color: 'rgba(163,127,33,0.25)' }}>|</span>
          <span>Secured by AI Vision · © 2025 · Garcia, Adrian</span>
        </footer>
      </div>

      {/* Floating AI Assistant (outside blur wrapper) */}
      <FloatingAIAssistant />

      {/* Identity Verification Modal */}
      {showModal && (
        <div
          role="dialog" aria-modal="true" aria-labelledby="modal-title"
          onClick={(e) => { if (e.target === e.currentTarget) { setShowModal(false); enrollBtnRef.current?.focus(); } }}
          style={{
            position: 'fixed', inset: 0, zIndex: 500,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(4,2,10,0.80)',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            padding: '0 1rem', animation: 'fadeIn 0.25s ease',
          }}
        >
          <div ref={modalRef} className="glass-panel-elevated" style={{ width: '100%', maxWidth: '26rem', overflow: 'hidden', animation: 'slideUp 0.3s cubic-bezier(0.34,1.2,0.64,1)' }}>
            <div className="glass-accent-bar" />
            <div style={{ padding: '1.75rem 2rem 2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 id="modal-title" style={{ fontSize: 'var(--text-heading)', fontWeight: 700, color: 'var(--glass-text-primary)', margin: 0, fontFamily: "'Inter', system-ui, sans-serif" }}>Identity Verification</h2>
                  <p style={{ fontSize: 'var(--text-small)', color: 'var(--glass-text-muted)', marginTop: 3, fontFamily: "'Inter', system-ui, sans-serif" }}>Confirm your student credentials to begin</p>
                </div>
                <button
                  aria-label="Close dialog"
                  onClick={() => { setShowModal(false); enrollBtnRef.current?.focus(); }}
                  style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(26,24,20,0.05)', border: '1px solid rgba(163,127,33,0.20)', color: 'var(--glass-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', lineHeight: 1, fontFamily: "'Inter', system-ui, sans-serif", transition: 'all 0.2s' }}
                  className="modal-close-btn"
                >×</button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
                {[
                  { key: 'studentId', label: 'Student ID', type: 'text', placeholder: 'e.g. 23-12345' },
                  { key: 'passkey', label: 'System Passkey', type: 'password', placeholder: '••••••••' },
                ].map(({ key, label, type, placeholder }) => (
                  <div key={key}>
                    <label style={{ display: 'block', fontSize: 'var(--text-label)', fontWeight: 700, color: 'var(--glass-text-label)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6, fontFamily: "'Inter', system-ui, sans-serif" }}>
                      {label}
                    </label>
                    <input
                      className="glass-input" type={type} placeholder={placeholder}
                      value={formData[key]}
                      onChange={e => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
                    />
                  </div>
                ))}

                {error && (
                  <div role="alert" aria-live="assertive" className="glass-alert-danger" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-small)' }}>
                    {Icons.warning} {error}
                  </div>
                )}

                <p style={{ fontSize: 'var(--text-small)', color: 'var(--glass-text-muted)', textAlign: 'center', margin: '0.25rem 0', fontFamily: "'Inter', system-ui, sans-serif" }}>
                  By continuing, you acknowledge that you have read and agree to the system&apos;s{' '}
                  <button type="button" onClick={() => navigate('/rules')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#BA9731', fontWeight: 600, textDecoration: 'underline', font: 'inherit', padding: 0, display: 'inline' }}>
                    Rules &amp; Regulations
                  </button>.
                </p>

                <button type="submit" className="glass-btn-primary" style={{ width: '100%', padding: '0.875rem', marginTop: 4 }}>
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
