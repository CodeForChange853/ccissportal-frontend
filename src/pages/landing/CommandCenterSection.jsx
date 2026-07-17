import React, { useState, useEffect } from 'react';
import { useReducedMotion, useInView, Reveal, SectionHeading } from './utils';

const CommandCenterSection = ({ isDesktop }) => {
  const reduced = useReducedMotion();
  const [ref, active] = useInView(0.28);
  const [counts, setCounts] = useState([0, 0, 0]);
  const [logIdx, setLogIdx] = useState(0);

  const TARGETS = [247, 18, 99];
  const LOG_LINES = [
    'Load balancing optimal.',
    'No schedule conflict detected.',
    'Prerequisite engine: 247 checks passed.',
    'Faculty caps within CHED limits.',
    'Queue integrity verified.',
  ];

  useEffect(() => {
    if (!active) { setCounts([0, 0, 0]); return; }
    if (reduced) { setCounts(TARGETS); return; }
    let tick = 0;
    const id = setInterval(() => {
      tick++;
      setCounts(TARGETS.map(t => Math.min(Math.floor(t * tick / 48), t)));
      if (tick >= 48) clearInterval(id);
    }, 22);
    return () => clearInterval(id);
  }, [active, reduced]);

  useEffect(() => {
    if (!active || reduced) return;
    const id = setInterval(() => setLogIdx(i => (i + 1) % LOG_LINES.length), 1900);
    return () => clearInterval(id);
  }, [active, reduced]);

  const STATS = [
    { label: 'Active Enrollments', value: counts[0], suffix: '',  color: '#DACE84' },
    { label: 'Faculty Balanced',   value: counts[1], suffix: '',  color: '#22c55e' },
    { label: 'AI Checks Passed',   value: counts[2], suffix: '%', color: '#BA9731' },
  ];
  const BLIPS = [{ x: 34, y: -48 }, { x: -58, y: 24 }, { x: 44, y: 58 }, { x: -22, y: -38 }];
  const feed = [0, 1, 2].map(o => LOG_LINES[(logIdx + o) % LOG_LINES.length]);

  return (
    <section ref={ref} className="lp-section" style={{ padding: isDesktop ? '7rem 3rem' : '5rem 1.25rem' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <SectionHeading
          eyebrow="ADMIN COMMAND CENTER"
          title="Campus-wide enrollment oversight in a single dashboard."
          subtitle="Every active enrollment, faculty assignment, document status, and system alert — monitored and actionable in real time from one centralized interface."
        />

        <Reveal delay={0.15}>
          <div style={{
            marginTop: '2.75rem', padding: '1px', borderRadius: 19,
            background: 'linear-gradient(135deg, rgba(186,151,49,0.40) 0%, rgba(163,127,33,0.08) 40%, transparent 60%, rgba(186,151,49,0.22) 100%)',
          }}>
            <div style={{
              borderRadius: 18,
              background: 'rgba(8,4,18,0.92)',
              overflow: 'hidden', position: 'relative',
              boxShadow: [
                'inset 0 1px 0 rgba(255,255,255,0.06)',
                '0 2px 1px rgba(0,0,0,0.04)',
                '0 12px 32px rgba(0,0,0,0.50)',
                '0 40px 90px rgba(163,127,33,0.06)',
              ].join(', '),
            }}>
              {active && !reduced && (
                <>
                  <div key={`scan-1-${active}`} style={{
                    position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'none',
                    background: 'linear-gradient(105deg, transparent 42%, rgba(186,151,49,0.10) 50%, transparent 58%)',
                    animation: 'cmdScan 1.8s ease-out 1',
                  }} />
                  <div key={`scan-2-${active}`} style={{
                    position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
                    background: 'linear-gradient(105deg, transparent 44%, rgba(186,151,49,0.05) 50%, transparent 56%)',
                    animation: 'cmdScan 1.8s 0.7s ease-out 1',
                  }} />
                </>
              )}

              {/* Terminal title bar */}
              <div style={{
                padding: '0.625rem 1.25rem',
                borderBottom: '1px solid rgba(163,127,33,0.12)',
                background: 'rgba(163,127,33,0.04)',
                display: 'flex', alignItems: 'center', gap: 7,
              }}>
                {['rgba(220,38,38,0.55)', 'rgba(251,191,36,0.55)', 'rgba(34,197,94,0.55)'].map((c, i) => (
                  <div key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />
                ))}
                <span style={{ marginLeft: 10, fontSize: '0.67rem', color: 'rgba(186,151,49,0.55)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em' }}>
                  NEXENROLL // SYSTEM COMMAND HUB{' '}
                  <span style={{ animation: reduced ? 'none' : 'commandBlink 1s step-end infinite' }}>█</span>
                </span>
              </div>

              {/* Dashboard body */}
              <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr' }}>
                {/* Radar panel */}
                <div style={{
                  padding: isDesktop ? '2.5rem' : '2rem',
                  borderRight: isDesktop ? '1px solid rgba(186,151,49,0.08)' : 'none',
                  borderBottom: !isDesktop ? '1px solid rgba(186,151,49,0.08)' : 'none',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                }}>
                  <div style={{ fontSize: '0.55rem', color: 'rgba(186,151,49,0.38)', fontFamily: "'Orbitron', sans-serif", letterSpacing: '0.16em', marginBottom: '1.5rem' }}>
                    ACTIVE RADAR SCAN
                  </div>
                  <div style={{ position: 'relative', width: 200, height: 200, flexShrink: 0 }}>
                    {[100, 74, 50, 28].map((r, i) => (
                      <div key={i} style={{
                        position: 'absolute', top: '50%', left: '50%',
                        width: r * 2, height: r * 2,
                        transform: 'translate(-50%, -50%)',
                        borderRadius: '50%',
                        border: `1px solid rgba(186,151,49,${0.05 + i * 0.03})`,
                      }} />
                    ))}
                    <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(186,151,49,0.06)', transform: 'translateY(-0.5px)', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'rgba(186,151,49,0.06)', transform: 'translateX(-0.5px)', pointerEvents: 'none' }} />
                    <div style={{
                      position: 'absolute', inset: 0, borderRadius: '50%',
                      background: 'conic-gradient(rgba(186,151,49,0) 0deg, rgba(186,151,49,0.38) 48deg, rgba(186,151,49,0.05) 96deg, transparent 96deg)',
                      animation: active && !reduced ? 'radarSweep 3.5s linear infinite' : 'none',
                    }} />
                    <div style={{
                      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                      width: 8, height: 8, borderRadius: '50%',
                      background: '#BA9731', boxShadow: '0 0 8px rgba(186,151,49,0.8)',
                      animation: reduced ? 'none' : 'pulse 2s ease-in-out infinite',
                    }} />
                    {BLIPS.map((blip, i) => (
                      <div key={i} style={{
                        position: 'absolute',
                        top: `calc(50% + ${blip.y}px)`, left: `calc(50% + ${blip.x}px)`,
                        width: 4, height: 4, borderRadius: '50%',
                        background: '#DACE84', boxShadow: '0 0 5px #DACE84',
                        animation: reduced ? 'none' : `pulse ${1.4 + i * 0.3}s ${i * 0.4}s ease-in-out infinite`,
                      }} />
                    ))}
                  </div>
                </div>

                {/* Stats panel */}
                <div style={{ padding: isDesktop ? '2.5rem' : '2rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {STATS.map((stat, i) => (
                    <div key={i} style={{
                      padding: '1rem 1.25rem',
                      border: '1px solid rgba(163,127,33,0.18)',
                      borderRadius: 10,
                      background: 'rgba(12,7,24,0.88)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      display: 'flex', alignItems: 'center', gap: 14,
                    }}>
                      <div style={{ width: 3, height: 38, background: stat.color, borderRadius: 2, flexShrink: 0, opacity: 0.9 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.6rem', color: 'rgba(198,184,158,0.60)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 5 }}>
                          {stat.label}
                        </div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: stat.color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1, letterSpacing: '-0.02em' }}>
                          {stat.value}{stat.suffix}
                        </div>
                      </div>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: reduced ? 'none' : 'pulse 2s infinite', opacity: 0.85, flexShrink: 0 }} />
                    </div>
                  ))}
                  {/* Live AI log feed */}
                  <div style={{
                    padding: '0.75rem 1.125rem',
                    border: '1px solid rgba(163,127,33,0.14)',
                    borderRadius: 10, background: 'rgba(163,127,33,0.05)',
                    fontFamily: "'JetBrains Mono', monospace", fontSize: '0.67rem',
                    color: 'rgba(198,184,158,0.68)', lineHeight: 1.7, minHeight: 64,
                  }}>
                    {feed.map((line, i) => (
                      <div key={`${logIdx}-${i}`} style={{ opacity: 1 - i * 0.28, animation: reduced ? 'none' : 'extractUp 0.4s ease both' }}>
                        <span style={{ color: i === 0 ? '#A37F21' : 'rgba(163,127,33,0.55)', fontWeight: 700 }}>AI▸</span> {line}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default CommandCenterSection;
