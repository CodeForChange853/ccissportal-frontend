import React, { useState, useEffect } from 'react';
import { useReducedMotion, useInView, Reveal, SectionHeading } from './utils';
import { SECURITY_LAYERS } from './data';

const SecurityVaultSection = ({ isDesktop }) => {
  const reduced = useReducedMotion();
  const [ref, inView] = useInView(0.32);
  const N = SECURITY_LAYERS.length;
  const [unlocked, setUnlocked] = useState(0);

  useEffect(() => {
    if (reduced) { setUnlocked(N); return; }
    if (!inView) { setUnlocked(0); return; }
    const timers = SECURITY_LAYERS.map((_, i) =>
      setTimeout(() => setUnlocked(u => Math.max(u, i + 1)), 350 + i * 420)
    );
    return () => timers.forEach(clearTimeout);
  }, [inView, reduced, N]);

  const opened = unlocked >= N;
  const TICK_COUNT = 24;
  const RING_R = [114, 94, 73, 52];

  return (
    <section ref={ref} className="lp-section" style={{ padding: isDesktop ? '7rem 3rem' : '5rem 1.25rem' }}>
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        <SectionHeading
          eyebrow="SECURITY & ACCESS CONTROL"
          title="Role-based access, immutable audit logs, and anomaly detection."
          subtitle="Every session is scoped to a verified role. Every action is recorded to an immutable audit trail. Suspicious activity is surfaced automatically — no manual review needed."
        />

        <Reveal delay={0.12}>
          <div style={{
            marginTop: '3.25rem',
            display: isDesktop ? 'grid' : 'flex',
            gridTemplateColumns: '1fr 1fr',
            flexDirection: 'column',
            gap: isDesktop ? '4rem' : '2.5rem',
            alignItems: 'center',
          }}>
            {/* Vault dial SVG */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <svg viewBox="0 0 240 240" width={isDesktop ? 230 : 200} style={{ display: 'block', overflow: 'visible' }}>
                {RING_R.map((r, i) => {
                  const lit = i < unlocked;
                  return (
                    <circle key={i} cx="120" cy="120" r={r}
                      fill="none"
                      stroke={lit ? 'rgba(186,151,49,0.55)' : 'rgba(186,151,49,0.10)'}
                      strokeWidth={lit ? 1.6 : 1}
                      strokeDasharray={i % 2 === 0 ? '5 6' : undefined}
                      style={{
                        transition: 'stroke 0.5s ease, stroke-width 0.5s ease',
                        filter: lit ? 'drop-shadow(0 0 4px rgba(186,151,49,0.5))' : 'none',
                      }}
                    />
                  );
                })}
                <g style={{
                  transformOrigin: '120px 120px',
                  transform: `rotate(${unlocked * 78}deg)`,
                  transition: 'transform 0.85s cubic-bezier(0.34,1.25,0.5,1)',
                }}>
                  {Array.from({ length: TICK_COUNT }, (_, i) => {
                    const a = (i / TICK_COUNT) * Math.PI * 2 - Math.PI / 2;
                    const on = i / TICK_COUNT < unlocked / N;
                    return (
                      <line key={i}
                        x1={120 + 105 * Math.cos(a)} y1={120 + 105 * Math.sin(a)}
                        x2={120 + 114 * Math.cos(a)} y2={120 + 114 * Math.sin(a)}
                        stroke={`rgba(186,151,49,${on ? 0.7 : 0.16})`} strokeWidth={on ? 1.6 : 1}
                        style={{ transition: 'stroke 0.4s ease' }}
                      />
                    );
                  })}
                  <circle cx="120" cy="15" r="3" fill="rgba(218,206,132,0.85)" />
                </g>
                {!opened && !reduced && (
                  <circle cx="120" cy="120" r="84" fill="none" stroke="rgba(218,206,132,0.5)"
                    strokeWidth="1.5" strokeDasharray="40 490" strokeLinecap="round"
                    style={{ transformOrigin: '120px 120px', animation: 'radarSweep 1.6s linear infinite' }} />
                )}
                <path d="M 108 128 L 108 120 a 12 12 0 0 1 24 0 L 132 128"
                  fill="none" stroke="rgba(186,151,49,0.7)" strokeWidth="1.5" strokeLinecap="round"
                  style={{ transformOrigin: '120px 120px', transform: opened ? 'translateY(-13px)' : 'translateY(0)', transition: 'transform 0.6s cubic-bezier(0.34,1.4,0.5,1)' }} />
                <rect x="104" y="128" width="32" height="26" rx="3.5"
                  fill={`rgba(186,151,49,${opened ? 0.16 : 0.08})`}
                  stroke={`rgba(186,151,49,${opened ? 0.75 : 0.5})`} strokeWidth="1.2"
                  style={{ transition: 'all 0.5s ease' }} />
                {opened ? (
                  <path d="M112 141 l5 5 9 -10" fill="none" stroke="#DACE84" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                ) : (
                  <>
                    <circle cx="120" cy="139" r="4.5" fill="rgba(186,151,49,0.22)" stroke="rgba(186,151,49,0.5)" strokeWidth="1" />
                    <line x1="120" y1="143.5" x2="120" y2="150" stroke="rgba(186,151,49,0.5)" strokeWidth="1.5" strokeLinecap="round" />
                  </>
                )}
                <text x="120" y="200" textAnchor="middle" fontSize="6"
                  fill={opened ? 'rgba(218,206,132,0.85)' : 'rgba(186,151,49,0.42)'}
                  letterSpacing="2" fontFamily="'Orbitron', sans-serif"
                  style={{ transition: 'fill 0.4s ease' }}>
                  {opened ? 'ALL LAYERS SECURED' : `DECRYPTING ${unlocked}/${N}`}
                </text>
              </svg>
            </div>

            {/* Layer list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {SECURITY_LAYERS.map((layer, i) => {
                const isOpen = i < unlocked;
                return (
                  <div key={i} style={{
                    padding: '1rem 1.25rem', borderRadius: 12,
                    border: `1px solid ${isOpen ? 'rgba(163,127,33,0.40)' : 'rgba(163,127,33,0.12)'}`,
                    background: isOpen ? 'rgba(163,127,33,0.07)' : 'rgba(255,255,255,0.55)',
                    opacity: isOpen ? 1 : 0.55,
                    transform: isOpen ? 'translateX(0)' : 'translateX(-12px)',
                    transition: 'all 0.55s cubic-bezier(0.34,1.2,0.64,1)',
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                  }}>
                    <div style={{ marginTop: 2, flexShrink: 0 }}>
                      {isOpen ? (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                          <path d="M9 12l2 2 4-4M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#BA9731" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <div style={{ width: 15, height: 15, borderRadius: 3, border: '1px solid rgba(186,151,49,0.16)' }} />
                      )}
                    </div>
                    <div>
                      <div style={{
                        fontSize: '0.9rem', fontWeight: 700,
                        color: isOpen ? '#1A1814' : 'rgba(26,24,20,0.38)',
                        transition: 'color 0.42s', marginBottom: 3,
                        fontFamily: "'Inter', system-ui, sans-serif",
                      }}>
                        {layer.label}
                      </div>
                      <div style={{
                        fontSize: '0.79rem',
                        color: isOpen ? '#5C5A56' : 'rgba(26,24,20,0.28)',
                        lineHeight: 1.55, transition: 'color 0.42s',
                        fontFamily: "'Inter', system-ui, sans-serif",
                      }}>
                        {layer.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default SecurityVaultSection;
