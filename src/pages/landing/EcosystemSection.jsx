import React, { useState, useEffect } from 'react';
import { useReducedMotion, useInView, Reveal, SectionHeading } from './utils';
import { ECO_NODES, ECO_HUB_EDGES, ECO_RING_EDGES } from './data';

const STAGE_IDS = ['students', 'ocr', 'analytics', 'faculty', 'admin', 'secretariat'];

const EcosystemSection = ({ isDesktop }) => {
  const reduced = useReducedMotion();
  const [ref, inView] = useInView(0.2);
  const [stage, setStage] = useState(0);
  const [ops, setOps] = useState(1284);

  useEffect(() => {
    if (!inView || reduced) return;
    const sId = setInterval(() => setStage(s => (s + 1) % STAGE_IDS.length), 900);
    const oId = setInterval(() => setOps(1200 + Math.floor(Math.random() * 180)), 1100);
    return () => { clearInterval(sId); clearInterval(oId); };
  }, [inView, reduced]);

  const hotId = STAGE_IDS[stage];

  return (
    <section id="lp-ecosystem" ref={ref} className="lp-section" style={{ padding: isDesktop ? '7rem 0 5rem' : '5rem 0 4rem', overflow: 'hidden' }}>
      <div style={{ maxWidth: 'var(--content-wide)', margin: '0 auto', padding: '0 3rem' }}>
        <SectionHeading
          eyebrow="PLATFORM ARCHITECTURE"
          title="Seven integrated modules. One AI-coordinated system."
          subtitle="NexEnroll's modular design covers every step — document intake, verification, faculty scheduling, and enrollment confirmation — all coordinated through a unified AI layer."
        />
      </div>

      <Reveal delay={0.15}>
        <div style={{ width: '100%', maxWidth: 580, margin: '3rem auto 0', padding: isDesktop ? '0 2rem' : '0 1rem' }}>
          <svg viewBox="0 0 500 420" width="100%" style={{ display: 'block', overflow: 'visible' }}>
            <defs>
              <pattern id="eco-bg" width="28" height="28" patternUnits="userSpaceOnUse">
                <path d="M28 0L0 0 0 28" fill="none" stroke="rgba(186,151,49,0.04)" strokeWidth="0.35" />
              </pattern>
              <radialGradient id="eco-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(186,151,49,0.2)" />
                <stop offset="60%" stopColor="rgba(186,151,49,0.04)" />
                <stop offset="100%" stopColor="rgba(186,151,49,0)" />
              </radialGradient>
            </defs>

            <rect width="500" height="420" fill="url(#eco-bg)" opacity="0.6" />

            {ECO_RING_EDGES.map((e, i) => (
              <line key={`r${i}`} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                stroke="rgba(186,151,49,0.08)" strokeWidth="1" />
            ))}

            {ECO_HUB_EDGES.map((e, i) => {
              const lit = ECO_NODES[i + 1]?.id === hotId;
              return (
                <line key={`h${i}`} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                  stroke={`rgba(186,151,49,${lit ? 0.5 : 0.16})`} strokeWidth={lit ? 1.5 : 1}
                  style={{ transition: 'stroke 0.35s ease' }} />
              );
            })}

            {inView && !reduced && ECO_HUB_EDGES.map((e, i) => (
              <g key={`pk${i}`}>
                <circle r="3.5" fill="#DACE84" opacity="0.9">
                  <animateMotion dur={e.dur} begin={e.begin} repeatCount="indefinite"
                    path={`M${e.x1},${e.y1} L${e.x2},${e.y2}`} />
                </circle>
                <circle r="2" fill="#BA9731" opacity="0.5">
                  <animateMotion dur={e.dur} begin={e.rBegin} repeatCount="indefinite"
                    path={`M${e.x2},${e.y2} L${e.x1},${e.y1}`} />
                </circle>
              </g>
            ))}

            <circle cx="250" cy="200" r="58" fill="url(#eco-glow)" />
            {inView && !reduced && (
              <circle key={stage} cx="250" cy="200" r="40" fill="none" stroke="rgba(218,206,132,0.6)"
                strokeWidth="1.5" style={{ transformOrigin: '250px 200px', animation: 'ecoIngest 0.9s ease-out' }} />
            )}

            {ECO_NODES.map((node) => {
              const hot = node.isCenter ? false : node.id === hotId;
              return (
                <g key={node.id}>
                  {node.isCenter && !reduced && (
                    <circle cx={node.x} cy={node.y} r={node.r + 12}
                      fill="none" stroke="rgba(186,151,49,0.3)" strokeWidth="1" strokeDasharray="6 5"
                      style={{ animation: 'spinCW 14s linear infinite', transformOrigin: `${node.x}px ${node.y}px` }} />
                  )}
                  <circle cx={node.x} cy={node.y} r={node.r}
                    fill={node.isCenter ? 'rgba(186,151,49,0.12)' : `rgba(186,151,49,${hot ? 0.16 : 0.06})`}
                    stroke={`rgba(186,151,49,${node.isCenter ? 0.6 : hot ? 0.7 : 0.28})`}
                    strokeWidth={node.isCenter ? 1.6 : hot ? 1.6 : 1}
                    style={{
                      transition: 'fill 0.3s ease, stroke 0.3s ease, stroke-width 0.3s ease',
                      filter: (node.isCenter || hot) ? 'drop-shadow(0 0 5px rgba(186,151,49,0.45))' : 'none',
                    }} />
                  {node.isCenter && (
                    <>
                      <circle cx={node.x} cy={node.y} r="6" fill="#DACE84"
                        style={{ animation: reduced ? 'none' : 'pulse 1.8s ease-in-out infinite' }} />
                      <text x={node.x} y={node.y + 17} textAnchor="middle" fontSize="8"
                        fill="rgba(186,151,49,0.85)" fontFamily="'JetBrains Mono', monospace" letterSpacing="2">AI ENGINE</text>
                    </>
                  )}
                  {!node.isCenter && (
                    <text x={node.x} y={node.y + 4} textAnchor="middle" fontSize="7.5"
                      fill={hot ? '#1A1814' : 'rgba(90,68,10,0.75)'} fontFamily="'JetBrains Mono', monospace"
                      letterSpacing="1" style={{ transition: 'fill 0.3s ease' }}>
                      {node.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Live engine readout */}
          <div style={{
            display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : '1fr',
            gap: 12, marginTop: '1.5rem',
          }}>
            {[
              { label: 'Active Stage', value: (ECO_NODES.find(n => n.id === hotId)?.label || '—').toUpperCase(), color: '#7A6010' },
              { label: 'Throughput',   value: `${ops} ops/s`, color: '#BA9731' },
              { label: 'Pipeline',     value: `${stage + 1} / ${STAGE_IDS.length}`, color: '#22c55e' },
            ].map((m, i) => (
              <div key={i} style={{
                padding: '0.75rem 1rem', borderRadius: 10,
                border: '1px solid rgba(163,127,33,0.15)',
                background: 'rgba(255,255,255,0.82)',
                fontFamily: "'JetBrains Mono', monospace",
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.90), 0 2px 8px rgba(0,0,0,0.06)',
              }}>
                <div style={{ fontSize: '0.56rem', color: '#8A8680', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 5 }}>{m.label}</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: m.color, letterSpacing: '-0.01em' }}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* Pipeline pips */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 7, marginTop: 16 }}>
            {STAGE_IDS.map((_, i) => (
              <div key={i} style={{
                width: i === stage ? 22 : 7, height: 7, borderRadius: 4,
                background: i === stage ? '#A37F21' : 'rgba(163,127,33,0.25)',
                boxShadow: i === stage ? '0 0 8px rgba(163,127,33,0.5)' : 'none',
                transition: 'all 0.4s cubic-bezier(0.34,1.2,0.64,1)',
              }} />
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
};

export default EcosystemSection;
