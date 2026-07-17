import React from 'react';
import { RevealCard, SectionHeading } from './utils';
import { VerifyAnimation, ScanDocAnimation, CheckAnimation } from './animations';
import { JOURNEY_STEPS } from './data';
import { Icons } from './utils';

const JourneySection = ({ isDesktop }) => (
  <section id="lp-journey" className="lp-section" style={{ padding: isDesktop ? '7rem 3rem' : '5rem 1.25rem' }}>
    <div style={{ maxWidth: 'var(--content-wide)', margin: '0 auto' }}>
      <SectionHeading
        eyebrow="STUDENT ENROLLMENT FLOW"
        title="From document upload to confirmed enrollment — automated end to end."
        subtitle="A structured AI pipeline guides each student through document submission, verification, and confirmation — with no manual steps, no waiting, and no back-and-forth."
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: isDesktop ? '1fr 1fr 1fr 1.6fr' : '1fr',
        gap: '1.125rem',
        marginTop: '3rem',
        position: 'relative',
      }}>
        {JOURNEY_STEPS.map((step, i) => {
          const AnimComp = i === 0 ? VerifyAnimation : i === 1 ? ScanDocAnimation : i === 2 ? CheckAnimation : null;
          return (
            <RevealCard key={i} delay={i * 0.11} direction={i % 2 === 0 ? 'up' : 'left'}>
              <div className="feature-card" style={{
                position: 'relative',
                border: `1px solid ${step.isComplete ? 'rgba(163,127,33,0.42)' : 'rgba(163,127,33,0.18)'}`,
                borderRadius: '1rem',
                padding: '1.625rem 1.25rem',
                height: '100%',
                overflow: 'hidden',
              }}>
                {step.isComplete && (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(to right, transparent, #BA9731, #DACE84, #BA9731, transparent)' }} />
                )}
                <div style={{
                  fontSize: '0.56rem', fontWeight: 700,
                  color: step.isComplete ? '#A37F21' : '#8A8680',
                  fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.16em', marginBottom: '1rem',
                }}>
                  STEP {step.num}
                </div>
                <div style={{ height: 108, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.125rem', overflow: 'hidden' }}>
                  {step.isComplete ? (
                    <div style={{
                      width: 60, height: 60, borderRadius: '50%',
                      background: 'rgba(186,151,49,0.10)', border: '1.5px solid rgba(186,151,49,0.45)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      animation: 'nodePulse 2.2s ease-in-out infinite',
                    }}>
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="#BA9731" strokeWidth="1.8" strokeLinecap="round" />
                        <path d="M22 4L12 14.01l-3-3" stroke="#BA9731" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  ) : (
                    AnimComp && <AnimComp />
                  )}
                </div>
                <h3 style={{
                  margin: '0 0 0.45rem', fontSize: '1rem', fontWeight: 700,
                  color: '#1A1814', letterSpacing: '-0.01em',
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}>
                  {step.label}
                </h3>
                <p style={{
                  margin: 0, fontSize: '0.81rem',
                  color: '#5C5A56', lineHeight: 1.65,
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}>
                  {step.desc}
                </p>
                {isDesktop && i < JOURNEY_STEPS.length - 1 && (
                  <div style={{
                    position: 'absolute', top: '50%', right: -18, transform: 'translateY(-50%)',
                    color: 'rgba(163,127,33,0.55)', fontSize: '1.1rem', zIndex: 2, pointerEvents: 'none',
                  }}>→</div>
                )}
              </div>
            </RevealCard>
          );
        })}
      </div>
    </div>
  </section>
);

export default JourneySection;
