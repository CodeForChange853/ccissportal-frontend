import React, { useState, useEffect, useRef } from 'react';
import { useReducedMotion, SectionHeading } from './utils';
import { PROBLEM_ITEMS } from './data';

const ProblemSection = ({ isDesktop }) => {
  const reduced = useReducedMotion();
  const sectionRef = useRef(null);
  const N = PROBLEM_ITEMS.length;
  const [resolved, setResolved] = useState(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (reduced) { setResolved(N); return; }

    const compute = () => {
      rafRef.current = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const p = (vh * 0.78 - r.top) / (vh * 0.5);
      const count = Math.max(0, Math.min(N, Math.round(p * N)));
      setResolved(prev => (prev === count ? prev : count));
    };
    const onScroll = () => { if (!rafRef.current) rafRef.current = requestAnimationFrame(compute); };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { window.addEventListener('scroll', onScroll, { passive: true }); compute(); }
      else window.removeEventListener('scroll', onScroll);
    }, { threshold: 0 });
    io.observe(el);
    return () => { io.disconnect(); window.removeEventListener('scroll', onScroll); cancelAnimationFrame(rafRef.current); };
  }, [reduced, N]);

  return (
    <section id="lp-problem" ref={sectionRef} className="lp-section" style={{ padding: isDesktop ? '7rem 3rem' : '5rem 1.25rem' }}>
      <div style={{ maxWidth: 'var(--content-wide)', margin: '0 auto' }}>
        <SectionHeading
          eyebrow="THE CHALLENGE"
          title="Enrollment delays are systemic — not accidental."
          subtitle="Manual document reviews, scheduling conflicts, and disconnected processes create bottlenecks that affect every student every semester. Below is what NexEnroll was built to resolve."
        />

        <div style={{
          marginTop: '3.5rem',
          display: isDesktop ? 'grid' : 'flex',
          gridTemplateColumns: '1fr 1fr',
          flexDirection: 'column',
          gap: isDesktop ? '4rem' : '2.5rem',
          alignItems: 'flex-start',
          maxWidth: 820, margin: '3.5rem auto 0',
        }}>
          {/* Scan rail */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: '0.56rem', color: '#7A6010', fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.18em', marginBottom: 6 }}>
              DIAGNOSTIC SWEEP
            </div>
            <div style={{ position: 'relative', paddingLeft: 28 }}>
              {/* Rail track */}
              <div style={{
                position: 'absolute', left: 8, top: 0, bottom: 0, width: 2,
                background: 'rgba(186,151,49,0.12)', borderRadius: 1,
              }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0,
                  height: `${(resolved / N) * 100}%`,
                  background: 'linear-gradient(to bottom, rgba(186,151,49,0.70), rgba(218,206,132,0.50))',
                  borderRadius: 1, transition: 'height 0.5s ease',
                }} />
                {resolved < N && (
                  <div style={{
                    position: 'absolute', left: '50%', transform: 'translateX(-50%)',
                    top: `${(resolved / N) * 100}%`, marginTop: -5,
                    width: 10, height: 10, borderRadius: '50%',
                    background: '#BA9731', boxShadow: '0 0 10px rgba(186,151,49,0.8)',
                    transition: 'top 0.5s ease',
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }} />
                )}
              </div>

              {PROBLEM_ITEMS.map((item, i) => {
                const isResolved = i < resolved;
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    marginBottom: i < N - 1 ? 16 : 0,
                    opacity: isResolved ? 1 : 0.55,
                    transition: 'opacity 0.4s ease',
                  }}>
                    <div style={{
                      width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                      background: isResolved ? 'rgba(186,151,49,0.18)' : 'rgba(220,38,38,0.12)',
                      border: `1.5px solid ${isResolved ? 'rgba(186,151,49,0.60)' : 'rgba(220,38,38,0.45)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.4s ease',
                    }}>
                      {isResolved && (
                        <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2.5 2.5L8 3" stroke="#BA9731" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span style={{
                      fontSize: '0.88rem', fontWeight: 600,
                      color: isResolved ? '#7A6010' : '#dc2626',
                      textDecoration: isResolved ? 'line-through' : 'none',
                      transition: 'all 0.4s ease',
                      fontFamily: "'Inter', system-ui, sans-serif",
                    }}>
                      {item}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resolution card */}
          <div style={{
            padding: '1.875rem',
            borderRadius: '1.125rem',
            border: `1px solid rgba(163,127,33,${resolved >= N ? 0.45 : 0.14})`,
            background: `rgba(163,127,33,${resolved >= N ? 0.09 : 0.03})`,
            boxShadow: resolved >= N ? '0 0 40px rgba(163,127,33,0.12)' : 'none',
            transition: 'all 0.7s ease',
          }}>
            <div style={{
              fontSize: '0.56rem', fontWeight: 700, color: resolved >= N ? '#BA9731' : 'rgba(90,68,10,0.35)',
              letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 14,
              transition: 'color 0.5s ease', fontFamily: "'Orbitron', sans-serif",
            }}>
              {resolved >= N ? '✦ AI RESOLUTION' : 'PROCESSING...'}
            </div>
            <div style={{
              fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: 10,
              background: resolved >= N
                ? 'linear-gradient(135deg, #1A1814 0%, #7A5F10 50%, #A37F21 100%)'
                : 'linear-gradient(135deg, rgba(26,24,20,0.35) 0%, rgba(163,127,33,0.25) 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              transition: 'all 0.5s ease',
              fontFamily: "'Ethnocentric', 'Cormorant Garamond', serif",
            }}>
              NexEnroll<br />handles it.
            </div>
            <p style={{
              fontSize: '0.82rem', color: resolved >= N ? '#5C5A56' : 'rgba(26,24,20,0.30)',
              lineHeight: 1.65, transition: 'color 0.5s ease',
              fontFamily: "'Inter', system-ui, sans-serif",
            }}>
              AI-automated enrollment eliminates every manual bottleneck — in real time, every semester.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
