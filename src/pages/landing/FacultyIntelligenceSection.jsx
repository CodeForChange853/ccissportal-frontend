import React, { useState, useEffect, memo } from 'react';
import { useReducedMotion, useInView, Reveal, SectionHeading } from './utils';

const OverloadCardInner = ({ settled, reduced, items }) => (
  <div style={{
    padding: '1.875rem', borderRadius: '1.125rem',
    border: `1px solid rgba(220,38,38,${settled ? 0.18 : 0.32})`,
    background: `rgba(220,38,38,${settled ? 0.05 : 0.09})`,
    opacity: settled ? 0.6 : 1,
    transition: 'all 0.7s ease',
  }}>
    <div style={{ fontSize: '0.56rem', fontWeight: 700, color: 'rgba(220,38,38,0.72)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '1.375rem', fontFamily: "'Orbitron', sans-serif" }}>
      ⚠ Overloaded
    </div>
    {items.map((item, i) => (
      <div key={i} style={{ marginBottom: i < 2 ? '1rem' : 0 }}>
        <div style={{ fontSize: '0.6rem', color: 'rgba(198,184,158,0.60)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', marginBottom: 3 }}>{item.label}</div>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'rgba(252,165,165,0.90)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '-0.02em' }}>{item.value}</div>
      </div>
    ))}
    <div style={{
      marginTop: '1.375rem', padding: '0.5rem 0.875rem', borderRadius: 7, display: 'inline-block',
      background: 'rgba(220,38,38,0.10)', border: '1px solid rgba(220,38,38,0.32)',
      fontSize: '0.68rem', fontWeight: 700, color: 'rgba(252,165,165,0.82)',
      textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: "'Orbitron', sans-serif",
      animation: settled || reduced ? 'none' : 'pulse 2s ease-in-out infinite',
    }}>
      Conflict Detected
    </div>
  </div>
);
const OverloadCard = memo(OverloadCardInner);

const FacultyIntelligenceSection = ({ isDesktop }) => {
  const reduced = useReducedMotion();
  const [ref, inView] = useInView(0.3);
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (reduced) { setSettled(true); return; }
    if (!inView) { setSettled(false); return; }
    const t = setTimeout(() => setSettled(true), 650);
    return () => clearTimeout(t);
  }, [inView, reduced]);

  const OVERLOADED = [{ label: 'Units', value: '26' }, { label: 'Subjects', value: '8' }, { label: 'Status', value: 'Conflict' }];
  const OPTIMAL    = [{ label: 'Units', value: '18' }, { label: 'Subjects', value: '5' }, { label: 'Status', value: 'Optimal' }];

  return (
    <section id="lp-faculty" ref={ref} className="lp-section" style={{ padding: isDesktop ? '7rem 3rem' : '5rem 1.25rem' }}>
      <div style={{ maxWidth: 'var(--content-wide)', margin: '0 auto' }}>
        <SectionHeading
          eyebrow="FACULTY LOAD MANAGEMENT"
          title="Intelligent faculty assignment — balanced and conflict-free."
          subtitle="As students enroll, the system recalculates faculty loads in real time, distributes sections equitably, and resolves scheduling conflicts before they reach the registrar."
        />

        <Reveal delay={0.15}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isDesktop ? '1fr auto 1fr' : '1fr',
            gap: isDesktop ? '2rem' : '1.5rem',
            alignItems: 'center',
            maxWidth: 860, margin: '3rem auto 0',
          }}>
            <OverloadCard settled={settled} reduced={reduced} items={OVERLOADED} />

            {/* Balance scale */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: isDesktop ? '1rem 0.5rem' : '0.5rem 0' }}>
              <svg viewBox="0 0 100 116" width={isDesktop ? 96 : 76} style={{ overflow: 'visible', display: 'block' }}>
                <circle cx="50" cy="52" r="46" fill="none" stroke="rgba(186,151,49,0.1)" strokeWidth="0.8" strokeDasharray="2 4" />
                <path d="M14 88 Q50 102 86 88" fill="none" stroke="rgba(186,151,49,0.22)" strokeWidth="1" strokeLinecap="round" />
                <line x1="50" y1="52" x2="50" y2="82" stroke="rgba(186,151,49,0.5)" strokeWidth="2.5" strokeLinecap="round" />
                <polygon points="40,82 60,82 50,68" fill="rgba(186,151,49,0.18)" stroke="rgba(186,151,49,0.35)" strokeWidth="1" />
                <g style={{
                  transformOrigin: '50px 52px',
                  transform: settled ? 'rotate(0deg)' : 'rotate(-11deg)',
                  transition: 'transform 1.1s cubic-bezier(0.34,1.3,0.5,1)',
                }}>
                  <line x1="8" y1="52" x2="92" y2="52" stroke="rgba(186,151,49,0.62)" strokeWidth="2" strokeLinecap="round" />
                  <line x1="8" y1="52" x2="8" y2="66" stroke="rgba(220,38,38,0.45)" strokeWidth="1.2" strokeLinecap="round" />
                  <ellipse cx="8" cy="66" rx="12" ry="4.5" fill={`rgba(220,38,38,${settled ? 0.07 : 0.14})`} stroke="rgba(220,38,38,0.42)" strokeWidth="1" style={{ transition: 'fill 0.7s ease' }} />
                  <line x1="92" y1="52" x2="92" y2="66" stroke="rgba(34,197,94,0.45)" strokeWidth="1.2" strokeLinecap="round" />
                  <ellipse cx="92" cy="66" rx="12" ry="4.5" fill={`rgba(34,197,94,${settled ? 0.16 : 0.08})`} stroke="rgba(34,197,94,0.42)" strokeWidth="1" style={{ transition: 'fill 0.7s ease' }} />
                </g>
                <circle cx="50" cy="52" r="4" fill="rgba(186,151,49,0.28)" stroke="rgba(186,151,49,0.65)" strokeWidth="1" />
                <text x="50" y="110" textAnchor="middle" fontSize="6" fill="rgba(186,151,49,0.4)" letterSpacing="2" fontFamily="'JetBrains Mono', monospace">AI BALANCE</text>
              </svg>
              <div style={{
                fontSize: '0.58rem', letterSpacing: '0.16em', textTransform: 'uppercase',
                fontFamily: "'JetBrains Mono', monospace", textAlign: 'center',
                color: settled ? '#A37F21' : 'rgba(163,127,33,0.55)', transition: 'color 0.5s ease',
              }}>
                {settled ? '✓ Equilibrium' : 'Calculating…'}
              </div>
            </div>

            {/* Optimal card */}
            <div style={{
              padding: '1.875rem', borderRadius: '1.125rem',
              border: `1px solid rgba(163,127,33,${settled ? 0.5 : 0.30})`,
              background: `rgba(163,127,33,${settled ? 0.09 : 0.03})`,
              boxShadow: settled ? '0 0 36px rgba(163,127,33,0.14)' : 'none',
              transition: 'all 0.7s ease',
            }}>
              <div style={{ fontSize: '0.56rem', fontWeight: 700, color: '#A37F21', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '1.375rem', fontFamily: "'Orbitron', sans-serif" }}>
                ✦ AI Balanced
              </div>
              {OPTIMAL.map((item, i) => (
                <div key={i} style={{ marginBottom: i < 2 ? '1rem' : 0 }}>
                  <div style={{ fontSize: '0.6rem', color: '#8A8680', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', marginBottom: 3 }}>{item.label}</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#A37F21', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '-0.02em' }}>{item.value}</div>
                </div>
              ))}
              <div style={{
                marginTop: '1.375rem', padding: '0.5rem 0.875rem', borderRadius: 7, display: 'inline-block',
                background: 'rgba(163,127,33,0.08)', border: '1px solid rgba(163,127,33,0.35)',
                fontSize: '0.56rem', fontWeight: 700, color: '#A37F21',
                textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: "'Orbitron', sans-serif",
                opacity: settled ? 1 : 0.5, transition: 'opacity 0.6s ease',
              }}>
                ✓ Verdict: Balanced
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default FacultyIntelligenceSection;
