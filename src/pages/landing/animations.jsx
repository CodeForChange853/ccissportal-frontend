import React, { useState, useEffect } from 'react';
import { useReducedMotion } from './utils';
import { STEPS, BARCODE_PATTERN } from './data';

export const VerifyAnimation = () => {
  const [extracting, setExtracting] = useState(false);
  useEffect(() => {
    setExtracting(false);
    const t1 = setTimeout(() => setExtracting(true), 800);
    const t2 = setTimeout(() => setExtracting(false), 2600);
    const t3 = setTimeout(() => setExtracting(true), 3400);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, []);
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <div style={{
          position: 'relative', width: 150, height: 95,
          borderRadius: '5px 12px 5px 5px',
          background: '#0A0700', border: '1px solid rgba(186,151,49,0.38)',
          overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', flexShrink: 0,
        }}>
          <div style={{ position: 'absolute', top: 10, left: 10, width: 30, height: 38, borderRadius: 2, background: 'rgba(186,151,49,0.08)', border: '1px solid rgba(186,151,49,0.22)' }}>
            <div style={{ position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%)', width: 11, height: 11, borderRadius: '50%', background: 'rgba(186,151,49,0.25)' }} />
            <div style={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', width: 17, height: 8, borderRadius: '50% 50% 0 0', background: 'rgba(186,151,49,0.15)' }} />
          </div>
          <div style={{ position: 'absolute', top: 13, left: 48, right: 8 }}>
            <div style={{ height: 3, background: 'rgba(186,151,49,0.65)', borderRadius: 2, marginBottom: 4 }} />
            <div style={{ height: 2.5, width: '75%', background: 'rgba(186,151,49,0.38)', borderRadius: 2, marginBottom: 4 }} />
            <div style={{ height: 2, width: '55%', background: 'rgba(186,151,49,0.28)', borderRadius: 2, marginBottom: 4 }} />
            <div style={{ height: 2, width: '65%', background: 'rgba(186,151,49,0.18)', borderRadius: 2 }} />
          </div>
          <div style={{ position: 'absolute', bottom: 6, left: 8, right: 8, height: 12, display: 'flex', gap: '1px', alignItems: 'stretch' }}>
            {BARCODE_PATTERN.map((h, i) => (
              <div key={i} style={{ flex: 1, background: `rgba(186,151,49,${h * 0.65})`, borderRadius: '1px 1px 0 0' }} />
            ))}
          </div>
          <div style={{
            position: 'absolute', left: 0, right: 0, height: 2,
            background: 'linear-gradient(to right, transparent 0%, #BA9731 25%, #DACE84 50%, #BA9731 75%, transparent 100%)',
            animation: 'scanLine 2.2s ease-in-out infinite',
            boxShadow: '0 0 10px #BA9731, 0 0 20px rgba(186,151,49,0.4)',
          }} />
          {[[{ top: 3, left: 3 }, 'Top', 'Left'], [{ top: 3, right: 3 }, 'Top', 'Right'], [{ bottom: 3, left: 3 }, 'Bottom', 'Left'], [{ bottom: 3, right: 3 }, 'Bottom', 'Right']].map(([pos, v, h], idx) => (
            <div key={idx} style={{ position: 'absolute', ...pos, width: 9, height: 9, [`border${v}`]: `1.5px solid #BA9731`, [`border${h}`]: `1.5px solid #BA9731` }} />
          ))}
        </div>
        <div style={{ position: 'relative', width: 56, flexShrink: 0 }}>
          {[
            { label: 'ID', val: '23-10045', delay: '0s', y: -18 },
            { label: 'NAME', val: 'A. Garcia', delay: '0.25s', y: 0 },
            { label: 'YEAR', val: '3rd', delay: '0.5s', y: 18 },
          ].map((item, i) => (
            <div key={i} style={{
              position: 'absolute', left: 0, right: 0, top: '50%',
              background: 'rgba(10,7,0,0.85)',
              border: `1px solid rgba(186,151,49,${extracting ? 0.5 : 0.15})`,
              borderRadius: 4, padding: '2px 5px',
              opacity: extracting ? 1 : 0.25,
              transition: `opacity 0.6s ease ${item.delay}, border-color 0.6s ease ${item.delay}, transform 0.6s ease ${item.delay}`,
              transform: extracting
                ? `translateY(calc(-50% + ${item.y}px)) translateX(0px)`
                : `translateY(calc(-50% + ${item.y}px)) translateX(-6px)`,
            }}>
              <div style={{ fontSize: '0.38rem', color: 'rgba(186,151,49,0.45)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em' }}>{item.label}</div>
              <div style={{ fontSize: '0.5rem', color: '#BA9731', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{item.val}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{
        fontSize: '0.52rem', color: 'rgba(186,151,49,0.65)',
        fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.12em', textTransform: 'uppercase',
        animation: 'blinkText 1.4s ease-in-out infinite',
      }}>
        {extracting ? 'EXTRACTING DATA...' : 'AI SCANNING ID...'}
      </div>
    </div>
  );
};

export const ScanDocAnimation = () => (
  <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
    <div style={{
      position: 'relative', width: 86, height: 100,
      background: '#0A0700', border: '1px solid rgba(186,151,49,0.32)',
      borderRadius: '4px 12px 4px 4px', overflow: 'hidden', flexShrink: 0,
    }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 12, height: 12, background: 'rgba(186,151,49,0.1)', borderLeft: '1px solid rgba(186,151,49,0.28)', borderBottom: '1px solid rgba(186,151,49,0.28)' }} />
      {[{ w: '82%', delay: '0s' }, { w: '60%', delay: '0.35s' }, { w: '92%', delay: '0.1s' }, { w: '50%', delay: '0.45s' }, { w: '74%', delay: '0.2s' }, { w: '66%', delay: '0.55s' }].map((l, i) => (
        <div key={i} style={{ position: 'absolute', top: 18 + i * 12, left: 7, height: 2.5, width: l.w, background: 'rgba(186,151,49,0.32)', borderRadius: 2, animation: `dataLinePulse 2s ${l.delay} ease-in-out infinite`, transformOrigin: 'left' }} />
      ))}
    </div>
    <div style={{ color: 'rgba(186,151,49,0.4)', fontSize: '0.9rem', flexShrink: 0, animation: 'arrowPulse 1.2s ease-in-out infinite' }}>→</div>
    <div style={{ background: '#0A0700', border: '1px solid rgba(186,151,49,0.3)', borderRadius: 6, padding: '7px 10px', flexShrink: 0, minWidth: 70 }}>
      <div style={{ fontSize: '0.42rem', color: 'rgba(186,151,49,0.45)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', marginBottom: 5, textTransform: 'uppercase' }}>PARSED</div>
      {[{ label: 'ID', val: '23-10045' }, { label: 'GWA', val: '1.75' }, { label: 'UNITS', val: '21' }].map((item, i) => (
        <div key={i} style={{ marginBottom: i < 2 ? 5 : 0, animation: `extractUp 0.5s ${0.2 + i * 0.28}s ease both` }}>
          <div style={{ fontSize: '0.38rem', color: 'rgba(186,151,49,0.45)', fontFamily: "'JetBrains Mono', monospace" }}>{item.label}</div>
          <div style={{ fontSize: '0.55rem', color: '#BA9731', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{item.val}</div>
        </div>
      ))}
    </div>
  </div>
);

export const CheckAnimation = () => {
  const [checked, setChecked] = useState(0);
  useEffect(() => {
    setChecked(0);
    const timers = [
      setTimeout(() => setChecked(1), 600),
      setTimeout(() => setChecked(2), 1300),
      setTimeout(() => setChecked(3), 2000),
      setTimeout(() => setChecked(0), 3800),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);
  const subjects = [
    { code: 'CS 301', name: 'Data Structures' },
    { code: 'CS 302', name: 'Database Systems' },
    { code: 'CS 401', name: 'Software Engineering' },
  ];
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 5 }}>
      {subjects.map((s, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 7, padding: '5px 9px',
          background: i < checked ? 'rgba(22,163,74,0.07)' : 'rgba(186,151,49,0.04)',
          border: `1px solid ${i < checked ? 'rgba(22,163,74,0.28)' : 'rgba(186,151,49,0.15)'}`,
          borderRadius: 5, transition: 'all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}>
          <div style={{
            width: 14, height: 14, borderRadius: 3, flexShrink: 0,
            background: i < checked ? 'rgba(22,163,74,0.18)' : 'rgba(186,151,49,0.08)',
            border: `1px solid ${i < checked ? 'rgba(22,163,74,0.45)' : 'rgba(186,151,49,0.25)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.45s ease',
          }}>
            {i < checked && (
              <svg width="7" height="7" viewBox="0 0 10 10" fill="none">
                <path d="M2 5l2.5 2.5L8 3" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span style={{
            fontSize: '0.56rem', fontFamily: "'JetBrains Mono', monospace",
            color: i < checked ? 'rgba(22,163,74,0.90)' : 'rgba(200,185,158,0.45)',
            transition: 'color 0.45s ease', letterSpacing: '0.02em',
          }}>
            {s.code} — {s.name}
          </span>
        </div>
      ))}
    </div>
  );
};

export const BalanceAnimation = () => (
  <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 16, height: 72 }}>
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
      {[34, 52, 28].map((h, i) => (
        <div key={i} style={{
          width: 10, borderRadius: '3px 3px 0 0',
          background: `rgba(186,151,49,${0.28 + i * 0.13})`,
          border: `1px solid rgba(186,151,49,${0.2 + i * 0.1})`,
          transformOrigin: 'bottom',
          animation: `balanceUp ${1.8 + i * 0.25}s ${i * 0.18}s ease-in-out infinite`,
          height: h,
        }} />
      ))}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ color: '#BA9731', fontSize: '1.2rem', lineHeight: 1, textShadow: '0 0 12px #BA9731' }}>⚖</div>
      <div style={{ width: 2, height: 12, background: 'rgba(186,151,49,0.35)' }} />
      <div style={{ width: 20, height: 2, background: 'rgba(186,151,49,0.35)', borderRadius: 1 }} />
    </div>
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
      {[28, 52, 34].map((h, i) => (
        <div key={i} style={{
          width: 10, borderRadius: '3px 3px 0 0',
          background: `rgba(186,151,49,${0.28 + i * 0.13})`,
          border: `1px solid rgba(186,151,49,${0.2 + i * 0.1})`,
          transformOrigin: 'bottom',
          animation: `balanceDown ${1.8 + i * 0.25}s ${i * 0.18}s ease-in-out infinite`,
          height: h,
        }} />
      ))}
    </div>
  </div>
);

export const HowItWorksCarousel = ({ howItWorksRef, externalStep, externalAnimKey }) => {
  const [internalStep, setInternalStep] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [internalKey, setInternalKey] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const activeStep = externalStep != null ? externalStep : internalStep;
  const animKey = externalAnimKey != null ? externalAnimKey : internalKey;

  useEffect(() => {
    if (isHovered) return;
    const t = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setInternalStep(prev => (prev + 1) % STEPS.length);
        setInternalKey(k => k + 1);
        setTransitioning(false);
      }, 300);
    }, 3500);
    return () => clearInterval(t);
  }, [isHovered]);

  useEffect(() => {
    if (externalStep == null) return;
    setTransitioning(true);
    const t = setTimeout(() => setTransitioning(false), 300);
    return () => clearTimeout(t);
  }, [externalStep]);

  const goTo = (i, e) => {
    e.stopPropagation();
    if (i === activeStep) return;
    setTransitioning(true);
    setTimeout(() => { setInternalStep(i); setInternalKey(k => k + 1); setTransitioning(false); }, 280);
  };

  const scrollToGuide = () => { howItWorksRef.current?.scrollIntoView({ behavior: 'smooth' }); };
  const step = STEPS[activeStep];

  return (
    <div
      role="button" tabIndex={0} aria-label="View full enrollment guide"
      onClick={scrollToGuide}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollToGuide(); } }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        background: isHovered ? 'rgba(14,9,28,0.97)' : 'rgba(10,6,22,0.92)',
        backdropFilter: 'blur(28px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(28px) saturate(1.5)',
        border: '1px solid rgba(163,127,33,0.30)',
        borderRadius: '1.375rem',
        padding: '1.75rem 1.75rem 1.375rem',
        boxShadow: isHovered
          ? [
              'inset 0 1px 0 rgba(255,255,255,0.07)',
              '0 0 0 1px rgba(163,127,33,0.18)',
              '0 20px 60px rgba(0,0,0,0.65)',
            ].join(', ')
          : [
              'inset 0 1px 0 rgba(255,255,255,0.05)',
              '0 0 0 1px rgba(163,127,33,0.10)',
              '0 10px 36px rgba(0,0,0,0.55)',
            ].join(', '),
        transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
        overflow: 'hidden', cursor: 'pointer',
        transition: 'background 0.3s ease, box-shadow 0.5s ease, transform 0.35s cubic-bezier(0.34,1.2,0.64,1)',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(to right, transparent, #BA9731, #DACE84, #BA9731, transparent)' }} />
      {[[{ top: 11, left: 11 }, 'Top', 'Left'], [{ top: 11, right: 11 }, 'Top', 'Right'], [{ bottom: 11, left: 11 }, 'Bottom', 'Left'], [{ bottom: 11, right: 11 }, 'Bottom', 'Right']].map(([pos, v, h], idx) => (
        <div key={idx} style={{ position: 'absolute', ...pos, width: 14, height: 14, [`border${v}`]: '1.5px solid rgba(186,151,49,0.40)', [`border${h}`]: '1.5px solid rgba(186,151,49,0.40)', pointerEvents: 'none' }} />
      ))}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(rgba(186,151,49,0.04) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.375rem', position: 'relative', zIndex: 1 }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(163,127,33,0.65)', textTransform: 'uppercase', letterSpacing: '0.14em', fontFamily: "'Inter', system-ui, sans-serif" }}>HOW IT WORKS</span>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {STEPS.map((s, i) => (
            <button key={i} onClick={(e) => goTo(i, e)} aria-label={`Go to step ${i + 1}: ${s.label}`}
              style={{ padding: '9px 0', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 24 }}>
              <span style={{
                display: 'block', width: activeStep === i ? 18 : 6, height: 6, borderRadius: 3,
                background: activeStep === i ? '#BA9731' : 'rgba(186,151,49,0.22)',
                border: `1px solid ${activeStep === i ? '#BA9731' : 'rgba(186,151,49,0.28)'}`,
                boxShadow: activeStep === i ? '0 0 8px #BA9731' : 'none',
                transition: 'all 0.4s cubic-bezier(0.34,1.2,0.64,1)',
              }} />
            </button>
          ))}
        </div>
      </div>
      <div style={{ position: 'relative', width: 64, height: 64, margin: '0 auto 1.125rem', zIndex: 1 }}>
        <div style={{ position: 'absolute', inset: -6, borderRadius: '50%', background: 'conic-gradient(rgba(186,151,49,0.8) 0deg, transparent 120deg, transparent 240deg, rgba(186,151,49,0.8) 360deg)', animation: 'spinCW 3.5s linear infinite' }} />
        <div style={{ position: 'absolute', inset: -2, borderRadius: '50%', background: 'conic-gradient(transparent 0deg, rgba(186,151,49,0.12) 90deg, transparent 180deg, rgba(186,151,49,0.12) 270deg, transparent 360deg)', animation: 'spinCCW 5.5s linear infinite' }} />
        <div style={{ position: 'relative', zIndex: 2, width: 64, height: 64, borderRadius: '50%', background: 'rgba(186,151,49,0.10)', border: '1px solid rgba(186,151,49,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.4s ease' }}>
          {step.icon}
        </div>
      </div>
      <div style={{ position: 'relative', zIndex: 1, opacity: transitioning ? 0 : 1, transform: transitioning ? 'translateY(6px)' : 'translateY(0)', transition: 'opacity 0.3s ease, transform 0.3s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'rgba(163,127,33,0.65)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 3, fontFamily: "'Inter', system-ui, sans-serif" }}>STEP {activeStep + 1} OF {STEPS.length}</div>
          <div style={{ fontSize: '0.96rem', fontWeight: 700, color: 'rgba(240,228,200,0.92)', letterSpacing: '-0.01em', fontFamily: "'Inter', system-ui, sans-serif" }}>{step.label}</div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(198,184,158,0.68)', marginTop: 4, lineHeight: 1.6, maxWidth: '20rem', margin: '5px auto 0', fontFamily: "'Inter', system-ui, sans-serif" }}>{step.desc}</div>
        </div>
        <div style={{ minHeight: 106, height: 106, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.375rem 0' }}>
          {activeStep === 0 && <VerifyAnimation />}
          {activeStep === 1 && <ScanDocAnimation />}
          {activeStep === 2 && <CheckAnimation key={animKey} />}
          {activeStep === 3 && <BalanceAnimation />}
        </div>
      </div>
      <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(186,151,49,0.12)', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <span style={{ fontSize: '0.75rem', color: 'rgba(163,127,33,0.55)', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'Inter', system-ui, sans-serif" }}>↓ TAP TO SEE FULL ENROLLMENT GUIDE ↓</span>
      </div>
    </div>
  );
};
