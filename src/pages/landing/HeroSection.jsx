import React from 'react';
import { Icons } from './utils';
import { HowItWorksCarousel } from './animations';
import DashboardPreview from './DashboardPreview';
import cfcLogoUrl from '../../../logo/CFC_logo.svg';

const HeroSection = ({
  isDesktop, showModal, enrollmentOpen, enrollBtnRef, howItWorksRef,
  carouselStep, carouselAnimKey, onEnroll, onLogin, onNavigate,
}) => (
  <main
    id="main-content"
    style={{
      flex: '1 0 auto',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: isDesktop ? '6rem 3rem 5rem' : '4.5rem 1.25rem 3.5rem',
      position: 'relative', zIndex: 10,
      transition: 'filter 0.5s ease, opacity 0.5s ease',
      ...(showModal ? { filter: 'blur(4px)', opacity: 0.5, pointerEvents: 'none' } : {}),
    }}
  >
    <div style={{
      maxWidth: 'var(--content-wide)', width: '100%', margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: isDesktop ? 'minmax(0, 1fr) 1px minmax(0, 1fr)' : '1fr',
      gap: isDesktop ? '0 3.5rem' : '3rem',
      alignItems: 'center',
    }}>
      {/* Left: Hero copy */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.625rem', animation: 'heroReveal 0.7s ease both', minWidth: 0 }}>
        {/* Brand label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{
            width: 52, height: 52, flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(255,248,235,0.95) 0%, #DACE84 55%, #BA9731 100%)',
            WebkitMask: `url(${cfcLogoUrl}) center / contain no-repeat`,
            mask: `url(${cfcLogoUrl}) center / contain no-repeat`,
          }} />
          <div>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#BA9731', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'Orbitron', sans-serif" }}>NexEnroll System</div>
            <div style={{ fontSize: 'var(--text-small)', color: '#8A8680', marginTop: 2, fontFamily: "'Inter', system-ui, sans-serif" }}>College of Computing &amp; Information Science</div>
          </div>
        </div>

        {/* Headline */}
        <div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontFamily: "'Ethnocentric', 'Cormorant Garamond', serif", fontWeight: 400, letterSpacing: '0.01em', lineHeight: 1.12, margin: 0 }}>
            <span style={{ display: 'block', background: 'linear-gradient(135deg, #1A1814 0%, #7A5F10 50%, #A37F21 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Enrollment.
            </span>
            <span style={{ display: 'block', marginTop: '0.08em', background: 'linear-gradient(135deg, #2A2015 0%, #8B6914 55%, #A37F21 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Without the Chaos.
            </span>
          </h1>
          <p style={{ marginTop: '1.25rem', fontSize: 'clamp(0.93rem, 1.7vw, 1.05rem)', color: '#5C5A56', lineHeight: 1.78, maxWidth: '30rem', fontFamily: "'Inter', system-ui, sans-serif" }}>
            AI-assisted enrollment, document verification, and faculty load balancing — inside one intelligent ecosystem.
          </p>

          {!enrollmentOpen && (
            <div style={{
              background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.22)',
              borderRadius: '0.875rem', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
              padding: isDesktop ? '1rem 1.25rem' : '0.75rem 1rem',
              display: 'flex', alignItems: 'flex-start', gap: isDesktop ? '0.875rem' : '0.6rem',
              maxWidth: isDesktop ? '32rem' : 'auto', marginTop: '1.5rem', animation: 'fadeIn 0.5s ease both',
            }}>
              <div style={{ fontSize: isDesktop ? '1.25rem' : '1rem' }}>📢</div>
              <div>
                <h3 style={{ fontSize: 'var(--text-small)', fontWeight: 700, color: 'rgba(252,165,165,0.90)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Inter', system-ui, sans-serif" }}>
                  Enrollment Window Closed
                </h3>
                <p style={{ fontSize: 'var(--text-small)', color: 'rgba(198,184,158,0.72)', margin: '4px 0 0', lineHeight: 1.5, fontFamily: "'Inter', system-ui, sans-serif" }}>
                  The academic portal is currently locked for new registrations. Monitor official CCIS announcements for schedule updates.
                </p>
                <button onClick={() => onNavigate('/announcements')} className="glass-btn-danger" style={{ marginTop: '0.75rem', padding: '0.45rem 0.875rem', fontSize: 'var(--text-label)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  View Announcements →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '0.25rem' }}>
          <button
            ref={enrollBtnRef}
            onClick={onEnroll}
            disabled={!enrollmentOpen}
            className="glass-btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.9rem 1.875rem', fontSize: 'var(--text-body)' }}
          >
            {enrollmentOpen ? 'Begin Enrollment' : 'Enrollment Closed'} {Icons.arrow}
          </button>
          <button onClick={onLogin} className="glass-btn-ghost" style={{ padding: '0.9rem 1.875rem', fontSize: 'var(--text-body)' }}>
            Login
          </button>
        </div>

        {/* Trust tags */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingTop: 4, flexWrap: 'wrap' }}>
          {['AI-Secured', 'Zero Data Retention', 'Real-Time'].map((tag, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.56rem', fontWeight: 600, color: '#8A8680', letterSpacing: '0.1em', fontFamily: "'Orbitron', sans-serif" }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#BA9731', display: 'inline-block' }} />
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Divider spine — desktop only */}
      {isDesktop && (
        <div style={{
          width: '1px', alignSelf: 'stretch',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(186,151,49,0.30) 20%, rgba(186,151,49,0.55) 50%, rgba(186,151,49,0.30) 80%, transparent 100%)',
        }} />
      )}

      {/* Right: Dashboard Preview */}
      <div style={{ animation: 'heroReveal 0.7s 0.2s ease both', minWidth: 0 }}>
        <DashboardPreview />
      </div>
    </div>
  </main>
);

export default HeroSection;
