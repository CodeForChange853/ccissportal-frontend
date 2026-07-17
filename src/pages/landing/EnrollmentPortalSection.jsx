import React, { useState } from 'react';
import { useReducedMotion, Reveal } from './utils';
import { Icons } from './utils';

const PORTAL_FEATURES = [
  {
    icon: Icons.enroll,
    label: 'AI Document Clearance',
    desc: 'Upload your COR once. The AI reads, validates, and clears it in seconds — no manual review, no waiting line.',
  },
  {
    icon: Icons.balance,
    label: 'Smart Faculty Match',
    desc: 'Every enrollment triggers instant load recalculation. Every professor stays balanced, every section optimal.',
  },
  {
    icon: Icons.verify,
    label: 'Vault-Grade Security',
    desc: 'JWT-scoped sessions, immutable audit trails, and real-time anomaly detection on every transaction.',
  },
];

const EnrollmentPortalSection = ({ isDesktop, enrollmentOpen, onEnroll, onLogin, onStatus }) => {
  const reduced = useReducedMotion();
  const [hot, setHot] = useState(false);

  const PORTAL_DOTS = [0, 72, 144, 216, 288].map(deg => ({
    left: `calc(50% + ${149 * Math.cos((deg - 90) * Math.PI / 180)}px - 3px)`,
    top:  `calc(50% + ${149 * Math.sin((deg - 90) * Math.PI / 180)}px - 3px)`,
  }));

  const INTAKE = [20, 92, 164, 236, 308].map(deg => {
    const a = (deg - 90) * Math.PI / 180;
    return { x1: 150 + 140 * Math.cos(a), y1: 150 + 140 * Math.sin(a) };
  });

  return (
    <section className="lp-section" style={{
      padding: isDesktop ? '8rem 3rem 7rem' : '6rem 1.25rem 5rem',
      position: 'relative', zIndex: 2,
      textAlign: 'center', overflow: 'hidden',
    }}>
      {/* Soft gold ambient light — light theme */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: [
          'radial-gradient(ellipse 90% 55% at 50% 0%, rgba(163,127,33,0.07) 0%, transparent 62%)',
          'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(163,127,33,0.04) 0%, transparent 72%)',
        ].join(', '),
      }} />

      {/* Portal ring ambient glow */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: '22%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 580, height: 580, borderRadius: '50%',
        background: 'radial-gradient(ellipse at center, rgba(163,127,33,0.10) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Eyebrow */}
      <Reveal>
        <div style={{
          fontSize: '0.58rem', fontWeight: 700,
          color: '#7A6010', letterSpacing: '0.22em',
          textTransform: 'uppercase', marginBottom: 20,
          position: 'relative', zIndex: 1,
          fontFamily: "'Orbitron', sans-serif",
        }}>
          STUDENT PORTAL
        </div>
      </Reveal>

      {/* Portal ring */}
      <Reveal delay={0.1}>
        <div
          onMouseEnter={() => setHot(true)}
          onMouseLeave={() => setHot(false)}
          style={{ position: 'relative', width: 300, height: 300, margin: '0 auto 3rem', zIndex: 1 }}
        >
          {!reduced && (
            <svg viewBox="0 0 300 300" width="300" height="300" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}>
              {INTAKE.map((p, i) => (
                <circle key={i} r="2.5" fill="#DACE84" opacity="0.7">
                  <animateMotion dur={`${2 + i * 0.4}s`} begin={`${i * 0.5}s`} repeatCount="indefinite"
                    path={`M${p.x1},${p.y1} L150,150`} />
                </circle>
              ))}
            </svg>
          )}

          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '1.5px solid rgba(186,151,49,0.22)',
            borderTopColor: 'rgba(240,184,64,0.90)',
            borderRightColor: 'rgba(212,160,48,0.50)',
            animation: reduced ? 'none' : `portalRing ${hot ? 3.5 : 9}s linear infinite`,
            transition: 'border-color 0.3s ease',
          }} />
          <div style={{
            position: 'absolute', inset: 20, borderRadius: '50%',
            border: '1px solid rgba(186,151,49,0.16)',
            borderBottomColor: 'rgba(212,160,48,0.70)',
            borderLeftColor: 'rgba(186,151,49,0.40)',
            animation: reduced ? 'none' : `portalRingCCW ${hot ? 3 : 7}s linear infinite`,
          }} />
          <div style={{
            position: 'absolute', inset: 40, borderRadius: '50%',
            border: '1px solid rgba(186,151,49,0.12)',
            borderTopColor: 'rgba(212,160,48,0.55)',
            animation: reduced ? 'none' : `portalRing ${hot ? 2.2 : 5}s linear infinite`,
          }} />
          <div style={{
            position: 'absolute', inset: 58, borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(212,160,48,0.18) 0%, transparent 70%)',
            animation: reduced ? 'none' : 'portalPulse 3s ease-in-out infinite',
          }} />

          {PORTAL_DOTS.map((pos, i) => (
            <div key={i} style={{
              position: 'absolute', width: 5, height: 5, borderRadius: '50%',
              background: 'rgba(186,151,49,0.48)',
              left: pos.left, top: pos.top,
              animation: reduced ? 'none' : `pulse ${1.5 + i * 0.2}s ${i * 0.3}s ease-in-out infinite`,
            }} />
          ))}

          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              fontSize: '0.5rem', letterSpacing: '0.3em',
              color: 'rgba(163,127,33,0.75)', textTransform: 'uppercase',
              marginBottom: 8, fontFamily: "'Orbitron', sans-serif",
            }}>ENTER</div>
            <div style={{
              fontSize: 'clamp(1.5rem, 3.5vw, 1.9rem)', fontWeight: 800, letterSpacing: '-0.03em',
              background: 'linear-gradient(135deg, #7A5F10 0%, #A37F21 50%, #D4A030 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              fontFamily: "'Ethnocentric', 'Cormorant Garamond', serif",
            }}>
              NexEnroll
            </div>
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%', display: 'inline-block',
                background: enrollmentOpen ? '#22c55e' : '#ef4444',
                boxShadow: enrollmentOpen ? '0 0 8px rgba(34,197,94,0.5)' : '0 0 8px rgba(239,68,68,0.5)',
                animation: reduced ? 'none' : 'pulse 2s infinite',
              }} />
              <span style={{
                fontSize: '0.64rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                color: enrollmentOpen ? '#16a34a' : '#dc2626',
                fontFamily: "'Inter', system-ui, sans-serif",
              }}>
                {enrollmentOpen ? 'Open' : 'Closed'}
              </span>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Feature cards */}
      <Reveal delay={0.2}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : '1fr',
          gap: isDesktop ? '1rem' : '0.75rem',
          maxWidth: 860, margin: '0 auto 2.75rem',
          position: 'relative', zIndex: 1,
        }}>
          {PORTAL_FEATURES.map((feat, i) => (
            <div key={i} className="feature-card" style={{
              padding: '1.5rem 1.25rem',
              borderRadius: 14,
              border: '1px solid rgba(186,151,49,0.16)',
              position: 'relative',
              textAlign: 'left',
            }}>
              <div style={{ marginBottom: 12, opacity: 0.84 }}>{feat.icon}</div>
              <div style={{
                fontSize: '0.84rem', fontWeight: 700,
                color: '#1A1814', marginBottom: 6,
                fontFamily: "'Inter', system-ui, sans-serif",
              }}>
                {feat.label}
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: '#5C5A56',
                lineHeight: 1.65,
                fontFamily: "'Inter', system-ui, sans-serif",
              }}>
                {feat.desc}
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* CTAs */}
      <Reveal delay={0.32}>
        <div style={{
          display: 'flex', justifyContent: 'center',
          gap: '0.75rem', flexWrap: 'wrap',
          position: 'relative', zIndex: 1,
        }}>
          <button
            onClick={onEnroll} disabled={!enrollmentOpen} className="glass-btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.9rem 2rem', fontSize: 'var(--text-body)' }}
          >
            Begin Enrollment {Icons.arrow}
          </button>
          <button onClick={onLogin} className="glass-btn-ghost" style={{
            padding: '0.9rem 1.625rem', fontSize: 'var(--text-body)',
          }}>
            Login
          </button>
          <button onClick={onStatus} className="glass-btn-ghost" style={{
            padding: '0.9rem 1.625rem', fontSize: 'var(--text-body)',
          }}>
            System Status
          </button>
        </div>
      </Reveal>
    </section>
  );
};

export default EnrollmentPortalSection;
