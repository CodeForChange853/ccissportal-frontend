import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/* ─── Design tokens ──────────────────────────────────────────────────────── */
const G = '#BA9731';
const GL = '#DACE84';
const MONO = "'JetBrains Mono', monospace";
const SANS = "'Inter', system-ui, sans-serif";
const DARK = '#FAF8F5';

const CYCLE_MS = 3500;   // ms each step stays active
const GRID_GAP = 16;     // px gap between cards

/* ─── Step data ──────────────────────────────────────────────────────────── */
const enrollmentSteps = [
  {
    step: 1,
    num: '01',
    title: 'Verify Identity',
    short: 'AI-powered credential check against official CCIS records.',
    description:
      'Before enrollment begins, the system confirms who you are. Provide your Student ID and a system passkey issued by the CCIS Registrar. Our AI vision engine cross-references your credentials against official records in real-time — no data is stored after verification.',
    tips: [
      'Format your ID as YY-XXXXX (e.g. 23-10045)',
      'Get your active rotating semestral passkey from the CCIS Registrar before starting',
      'Identity is verified in isolated memory — zero retention guaranteed',
    ],
    warning: 'If verification fails repeatedly, contact the Registrar. Never share your passkey with anyone.',
  },
  {
    step: 2,
    num: '02',
    title: 'Scan Documents',
    short: 'Gemini OCR parses COR, grade sheets, and clearances — zero retention.',
    description:
      'Our Gemini-powered document OCR reads your academic documents — COR, grade sheets, and clearances. The AI extracts structured data without storing any raw files. Documents are processed in isolated memory and purged immediately after parsing.',
    tips: [
      'Upload clear, well-lit photos (JPG, PNG, or PDF accepted)',
      'The COR must be from the most recent semester on record',
      'Slightly skewed scans are handled — but straight-on is best',
    ],
    warning: 'Documents are NOT stored. Re-upload if the system asks again — no data is cached.',
  },
  {
    step: 3,
    num: '03',
    title: 'Enroll Subjects',
    short: 'Live prerequisite checks, unit-cap guards, and real-time slot queue.',
    description:
      'The enrollment engine performs live prerequisite validation for every subject you select. It checks your grade history, unit limits, and schedule conflicts simultaneously. A real-time queue prevents double-enrollment and ensures fair slot allocation.',
    tips: [
      'Review available subjects and prerequisites on the Rules page first',
      'Adding a subject holds a provisional slot — confirm before it expires',
      'Slots fill fast — log in early when the enrollment window opens',
    ],
    warning: 'Enrollment is final once confirmed. Schedule changes after submission require an official petition.',
  },
  {
    step: 4,
    num: '04',
    title: 'Load Balanced',
    short: 'Faculty loads auto-distributed within CHED limits by the AI balancer.',
    description:
      'After enrollment is processed, the system automatically distributes teaching loads across available faculty. This ensures no professor exceeds CHED regulation limits (18–21 units). The AI factors in subject specialization, historical loads, and classroom capacity.',
    tips: [
      'Your assigned professor appears in the student portal within 24 hours',
      'If a faculty member exceeds the cap, a substitution triggers automatically',
      'The balancer runs continuously — your assignment may update before semester start',
    ],
    warning: "Faculty assignments are provisional until the Dean's office publishes the final schedule.",
  },
];

/* ─── Per-step icons ─────────────────────────────────────────────────────── */
const StepIcon = ({ index, size = 24, color = G }) => {
  const icons = [
    <svg key="v" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" />
    </svg>,
    <svg key="s" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 17h7M17.5 14v7" />
    </svg>,
    <svg key="e" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
      <path d="M14 2v6h6M9 15l2 2 4-4" />
    </svg>,
    <svg key="b" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
    </svg>,
  ];
  return icons[index] ?? null;
};

/* ─── Node Network Wire ──────────────────────────────────────────────────── */
/**
 * Renders 4 nodes connected by dashed wires.
 * Two data packets travel from node 0 → node 3 over (CYCLE_MS * 4) seconds,
 * so each packet crosses a node precisely when the auto-cycle fires.
 * A second packet is offset by half the total duration for continuous visual flow.
 */
const NodeNetworkWire = ({ activeStep, containerW, visible }) => {
  if (!containerW || !visible) return null;

  const H = 80;
  const Y = 42;
  const n = enrollmentSteps.length;             // 4
  const colW = (containerW - GRID_GAP * (n - 1)) / n;
  const xs = Array.from({ length: n }, (_, i) =>
    Math.round(i * (colW + GRID_GAP) + colW / 2)
  );
  const TOTAL_DUR = (CYCLE_MS / 1000) * n;             // 14 s

  return (
    <svg
      width={containerW}
      height={H}
      style={{ display: 'block', pointerEvents: 'none', overflow: 'visible' }}
    >
      <defs>
        <filter id="nnGlow" x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* ── Wire segments ── */}
      {xs.slice(0, -1).map((x1, i) => {
        const x2 = xs[i + 1];
        const segLit = i === activeStep || i + 1 === activeStep;
        return (
          <g key={i}>
            {/* Dim base line */}
            <line
              x1={x1} y1={Y} x2={x2} y2={Y}
              stroke={segLit ? 'rgba(186,151,49,0.38)' : 'rgba(186,151,49,0.1)'}
              strokeWidth="1.5"
              strokeDasharray="5 9"
              style={{ transition: 'stroke 0.55s ease' }}
            />
            {/* Soft glow on active segments */}
            {segLit && (
              <line
                x1={x1} y1={Y} x2={x2} y2={Y}
                stroke={G}
                strokeWidth="4"
                strokeOpacity="0.07"
                filter="url(#nnGlow)"
              />
            )}
          </g>
        );
      })}

      {/* ── Traveling data packets ──
           Both animate cx from xs[0] to xs[n-1] over TOTAL_DUR.
           Because nodes are equally spaced, each packet crosses node i
           exactly at t = i * CYCLE_MS — synced with the JS timer. */}

      {/* Packet A (primary) */}
      <circle r="4" fill={GL} filter="url(#nnGlow)" opacity="0.95">
        <animate attributeName="cx"
          from={xs[0]} to={xs[n - 1]}
          dur={`${TOTAL_DUR}s`}
          repeatCount="indefinite"
        />
      </circle>
      {/* Packet A trailing dot */}
      <circle r="2" fill={G} opacity="0.5">
        <animate attributeName="cx"
          from={xs[0]} to={xs[n - 1]}
          dur={`${TOTAL_DUR}s`}
          begin="-0.38s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Packet B (half-cycle offset — keeps the wire feeling alive) */}
      <circle r="3" fill={GL} filter="url(#nnGlow)" opacity="0.5">
        <animate attributeName="cx"
          from={xs[0]} to={xs[n - 1]}
          dur={`${TOTAL_DUR}s`}
          begin={`-${TOTAL_DUR / 2}s`}
          repeatCount="indefinite"
        />
      </circle>
      <circle r="1.6" fill={G} opacity="0.3">
        <animate attributeName="cx"
          from={xs[0]} to={xs[n - 1]}
          dur={`${TOTAL_DUR}s`}
          begin={`-${(TOTAL_DUR / 2 + 0.38).toFixed(2)}s`}
          repeatCount="indefinite"
        />
      </circle>

      {/* ── Nodes ── */}
      {xs.map((x, i) => {
        const active = i === activeStep;
        return (
          <g key={i}>
            {/* Pulse rings only on active node */}
            {active && (
              <>
                <circle cx={x} cy={Y} fill="none" stroke={G} strokeWidth="1.5">
                  <animate attributeName="r" values="13;27;13" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.55;0;0.55" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx={x} cy={Y} fill="none" stroke={GL} strokeWidth="1">
                  <animate attributeName="r" values="13;20;13" dur="2s" begin="-0.55s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.38;0;0.38" dur="2s" begin="-0.55s" repeatCount="indefinite" />
                </circle>
              </>
            )}
            {/* Node disc */}
            <circle
              cx={x} cy={Y}
              r={active ? 13 : 9}
              fill={active ? G : '#FFFFFF'}
              stroke={active ? GL : 'rgba(163,127,33,0.45)'}
              strokeWidth={active ? 2 : 1.5}
              filter={active ? 'url(#nnGlow)' : 'none'}
              style={{ transition: 'all 0.5s cubic-bezier(0.34,1.2,0.64,1)' }}
            />
            {/* Label */}
            <text
              x={x} y={Y + 0.5}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={active ? 9 : 8}
              fontWeight="800"
              fill={active ? '#FFFFFF' : 'rgba(163,127,33,0.65)'}
              fontFamily="JetBrains Mono, monospace"
              style={{ transition: 'all 0.4s ease' }}
            >
              {String(i + 1).padStart(2, '0')}
            </text>
          </g>
        );
      })}

      {/* Active-node → card connector: a glowing pointer that slides to the lit
          node and aims down at its card, tying the wire to the grid below. */}
      <g style={{
        transform: `translateX(${xs[activeStep]}px)`,
        transition: 'transform 0.55s cubic-bezier(0.34,1.2,0.64,1)',
      }}>
        <line x1="0" y1="56" x2="0" y2="68" stroke={G} strokeWidth="1.5" strokeOpacity="0.5" />
        <path d="M-5 68 L5 68 L0 76 Z" fill={GL} opacity="0.9" filter="url(#nnGlow)" />
      </g>
    </svg>
  );
};

/* ─── StepCard (auto-cycle, no hover) ───────────────────────────────────── */
/**
 * Desktop (showAccordion=false): all content always in DOM, opacity-only — zero reflow.
 * Tablet/mobile (showAccordion=true): active card expands via max-height, inactive collapses.
 */
const StepCard = ({ step, index, isActive, inView, delay, showAccordion }) => (
  <div
    style={{
      position: 'relative',
      background: isActive
        ? 'radial-gradient(ellipse at 20% 20%, rgba(163,127,33,0.10) 0%, rgba(255,255,255,0.98) 65%)'
        : 'rgba(255,255,255,0.88)',
      border: `1px solid ${isActive ? 'rgba(163,127,33,0.55)' : 'rgba(163,127,33,0.16)'}`,
      borderRadius: 16,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      overflow: 'hidden',
      boxShadow: isActive
        ? '0 8px 40px rgba(0,0,0,0.12), 0 0 32px rgba(163,127,33,0.18)'
        : '0 2px 16px rgba(0,0,0,0.06)',
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(30px)',
      transition: [
        `opacity 0.6s ${delay}s ease`,
        `transform 0.6s ${delay}s cubic-bezier(0.34,1.1,0.64,1)`,
        'border-color 0.5s ease',
        'box-shadow 0.5s ease',
        'background 0.5s ease',
      ].join(', '),
    }}
  >
    {/* Top accent bar */}
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 2,
      background: isActive
        ? `linear-gradient(to right, transparent, ${G}, ${GL}, ${G}, transparent)`
        : 'linear-gradient(to right, transparent, rgba(186,151,49,0.15), transparent)',
      transition: 'background 0.5s ease',
    }} />

    {/* Scan-line sweep (active only) */}
    {isActive && (
      <div style={{
        position: 'absolute', top: 0, left: '-100%', right: 0, bottom: 0,
        background: 'linear-gradient(90deg, transparent, rgba(186,151,49,0.04), transparent)',
        animation: 'scanSweep 2.8s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
    )}

    {/* One-shot specular shimmer on each activation */}
    {isActive && (
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.55) 50%, transparent 65%)',
        animation: 'activeShimmer 0.9s ease-out 1',
        pointerEvents: 'none', borderRadius: 'inherit',
      }} />
    )}

    {/* Outer glow ring (active only) */}
    {isActive && (
      <div style={{
        position: 'absolute', inset: -1, borderRadius: 18,
        background: 'linear-gradient(135deg, rgba(186,151,49,0.35), rgba(218,206,132,0.18), rgba(186,151,49,0.35))',
        animation: 'cardRingPulse 2s ease-in-out infinite',
        zIndex: -1,
      }} />
    )}

    {/* Watermark step number — desktop inactive cards only (collapsed cards have no empty space) */}
    {!isActive && !showAccordion && (
      <div style={{
        position: 'absolute', bottom: -18, right: -6,
        fontSize: '7.5rem', fontWeight: 900,
        color: 'rgba(163,127,33,0.05)',
        fontFamily: MONO, lineHeight: 1,
        userSelect: 'none', pointerEvents: 'none',
        letterSpacing: '-0.05em',
      }}>
        {step.num}
      </div>
    )}

    <div style={{ padding: '18px 20px 20px' }}>
      {/* Badge row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: isActive ? 'rgba(186,151,49,0.12)' : 'rgba(186,151,49,0.05)',
          border: `1px solid ${isActive ? 'rgba(186,151,49,0.4)' : 'rgba(186,151,49,0.14)'}`,
          borderRadius: 6, padding: '3px 9px',
          transition: 'all 0.4s ease',
        }}>
          <span style={{
            fontSize: '0.75rem', fontWeight: 800,
            color: isActive ? '#A37F21' : 'rgba(163,127,33,0.50)',
            fontFamily: MONO, letterSpacing: '0.15em',
          }}>
            {step.num}
          </span>
        </div>
        <div style={{
          width: 7, height: 7, borderRadius: '50%',
          background: isActive ? G : 'transparent',
          border: `1px solid ${isActive ? G : 'rgba(186,151,49,0.18)'}`,
          boxShadow: isActive ? `0 0 8px ${G}, 0 0 14px rgba(186,151,49,0.5)` : 'none',
          animation: isActive ? 'pulse 1.8s ease-in-out infinite' : 'none',
          transition: 'all 0.4s ease',
        }} />
      </div>

      {/* Icon + title row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
          background: isActive ? 'rgba(186,151,49,0.15)' : 'rgba(186,151,49,0.05)',
          border: `1.5px solid ${isActive ? 'rgba(186,151,49,0.55)' : 'rgba(186,151,49,0.14)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: isActive ? '0 0 22px rgba(186,151,49,0.3)' : 'none',
          transition: 'all 0.4s ease',
        }}>
          <StepIcon index={index} size={22} color={isActive ? '#A37F21' : 'rgba(163,127,33,0.50)'} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '1rem', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.01em',
            color: isActive ? '#1A1814' : 'rgba(26,24,20,0.45)',
            transition: 'color 0.4s ease',
          }}>
            {step.title}
          </div>
          {!isActive && !showAccordion && (
            <div style={{
              fontSize: '0.75rem', color: 'rgba(163,127,33,0.55)',
              marginTop: 4, letterSpacing: '0.06em',
            }}>
              AWAITING SIGNAL
            </div>
          )}
        </div>
      </div>

      {/* Short tagline */}
      <p style={{
        fontSize: '0.75rem', lineHeight: 1.65, margin: 0,
        color: isActive ? 'rgba(26,24,20,0.70)' : 'rgba(26,24,20,0.38)',
        transition: 'color 0.4s ease',
      }}>
        {step.short}
      </p>

      {/* ── Expanded detail ──────────────────────────────────────────────────
           Desktop (cols=4): opacity-only reveal of the active card — content
           always in flow, equal column heights, zero reflow.
           Tablet/phone: ALWAYS fully expanded (no max-height accordion). The
           auto-cycle only changes emphasis, never layout height, so the page
           no longer resizes on its own while scrolling on mobile. ── */}
      <div style={showAccordion ? {
        opacity: 1,
      } : {
        opacity: isActive ? 1 : 0,
        transform: isActive ? 'translateY(0)' : 'translateY(6px)',
        transition: 'opacity 0.5s 0.12s ease, transform 0.5s 0.12s ease',
        pointerEvents: isActive ? 'auto' : 'none',
      }}>
        <div style={{ paddingTop: 14 }}>
          {/* Divider */}
          <div style={{
            height: 1,
            background: 'linear-gradient(to right, transparent, rgba(186,151,49,0.25), transparent)',
            marginBottom: 12,
          }} />

          {/* Full description */}
          <p style={{ fontSize: '0.75rem', color: 'rgba(26,24,20,0.65)', lineHeight: 1.75, margin: '0 0 14px' }}>
            {step.description}
          </p>

          {/* Tips header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(186,151,49,0.15)' }} />
            <span style={{
              fontSize: '0.75rem', fontWeight: 700, color: G,
              textTransform: 'uppercase', letterSpacing: '0.14em',
            }}>
              Protocol Tips
            </span>
            <div style={{ flex: 1, height: 1, background: 'rgba(186,151,49,0.15)' }} />
          </div>

          {/* Tips list */}
          <ul style={{ listStyle: 'none', margin: '0 0 12px', padding: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
            {step.tips.map((tip, j) => (
              <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                  <circle cx="8" cy="8" r="7" stroke={G} strokeWidth="1.2" fill="rgba(186,151,49,0.1)" />
                  <path d="M5 8l2.5 2.5L11 5.5" stroke={G} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontSize: '0.75rem', color: 'rgba(26,24,20,0.65)', lineHeight: 1.6 }}>{tip}</span>
              </li>
            ))}
          </ul>

          {/* Warning banner */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 8,
            background: 'rgba(186,151,49,0.07)',
            border: '1px solid rgba(186,151,49,0.18)',
            borderRadius: 8, padding: '8px 10px',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />
            </svg>
            <span style={{ fontSize: '0.8125rem', color: 'rgba(186,151,49,0.72)', lineHeight: 1.6, letterSpacing: '0.02em' }}>
              {step.warning}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ─── Floating AI assistant ──────────────────────────────────────────────── */
export const FloatingAIAssistant = () => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{
        position: 'absolute', bottom: 'calc(100% + 14px)', right: 0,
        whiteSpace: 'nowrap',
        background: 'rgba(7,6,4,0.96)', border: '1px solid rgba(186,151,49,0.5)',
        borderRadius: 7, padding: '7px 14px',
        fontSize: '0.75rem', fontWeight: 700, color: G,
        letterSpacing: '0.1em', textTransform: 'uppercase',
        opacity: hovered ? 1 : 0,
        transform: hovered ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.22s ease, transform 0.22s ease',
        pointerEvents: 'none',
        boxShadow: '0 6px 28px rgba(0,0,0,0.5)',
      }}>
        Initialize Assistant
        <div style={{
          position: 'absolute', bottom: -5, right: 20,
          width: 8, height: 8,
          background: 'rgba(7,6,4,0.96)', border: '1px solid rgba(186,151,49,0.5)',
          borderTop: 'none', borderLeft: 'none', transform: 'rotate(45deg)',
        }} />
      </div>
      <div
        onClick={() => navigate('/ai-assistant')}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'relative', width: 64, height: 64, cursor: 'pointer',
          transform: hovered ? 'scale(1.1)' : 'scale(1)',
          transition: 'transform 0.3s cubic-bezier(0.34,1.4,0.64,1)',
        }}
      >
        <div style={{ position: 'absolute', inset: -16, borderRadius: '50%', border: '1px solid rgba(186,151,49,0.22)', animation: 'sgRingPulse 2s ease-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: -10, borderRadius: '50%', border: '1px solid rgba(186,151,49,0.35)', animation: 'sgRingPulse 2s 0.5s ease-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', background: `conic-gradient(rgba(186,151,49,0.85) 0deg,transparent 110deg,transparent 250deg,rgba(186,151,49,0.85) 360deg)`, animation: 'spinCW 3.5s linear infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 2, borderRadius: '50%', background: `conic-gradient(transparent 0deg,rgba(186,151,49,0.12) 90deg,transparent 180deg,rgba(186,151,49,0.12) 270deg,transparent 360deg)`, animation: 'spinCCW 6s linear infinite', pointerEvents: 'none' }} />
        <div style={{
          position: 'absolute', inset: 5, borderRadius: '50%',
          background: 'radial-gradient(circle at 36% 34%,rgba(186,151,49,0.35) 0%,#070604 62%)',
          border: '1.5px solid rgba(186,151,49,0.65)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
          animation: 'orbGlow 3.5s ease-in-out infinite',
          boxShadow: hovered ? '0 0 56px rgba(186,151,49,0.65),0 0 90px rgba(186,151,49,0.28)' : '0 0 22px rgba(186,151,49,0.28),0 0 44px rgba(186,151,49,0.1)',
          transition: 'box-shadow 0.3s ease',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill={G} xmlns="http://www.w3.org/2000/svg">
            <path d="m10.708 10.955.63 2.045h-1.274zm11.889 7.655c-.596.902-1.746 1.369-3.353 1.369-.293 0-.602-.016-.924-.047-.275-.026-.477-.271-.45-.545.027-.276.275-.475.546-.45 1.684.163 2.866-.15 3.347-.878.257-.39.318-.904.182-1.529-.392-1.795-2.301-4.138-5.002-6.266.576 4.531-.944 13.737-4.944 13.737-1.101 0-2.128-.779-2.971-2.251-.138-.24-.055-.545.186-.683.236-.138.544-.055.682.186.457.798 1.192 1.749 2.104 1.749 1.491 0 3.113-2.815 3.734-7.18-3.01 2.159-7.911 4.236-10.974 4.179-1.311.025-2.821-.387-3.42-1.489-.638-1.108-.383-2.635.735-4.417.149-.234.46-.301.689-.157.234.147.305.456.158.689-.897 1.427-1.151 2.629-.716 3.385.232.405.665.69 1.284.848 1.69.433 4.441-.144 7.382-1.455-.609-.331-1.291-.713-1.763-1.006-4.307-2.682-7.461-6.102-8.032-8.715-.196-.898-.087-1.67.325-2.293.722-1.09 2.246-1.542 4.405-1.309.274.03.473.276.443.551-.029.275-.277.475-.551.443-1.739-.189-2.97.12-3.464.867-.257.389-.318.903-.182 1.528.392 1.795 2.3 4.138 5.002 6.266-.574-4.533 1.362-14.073 4.945-13.737 1.1 0 2.127.778 2.969 2.25 0 0 0 0 .001.001.366.638.688 1.401.967 2.261 2.684-.628 5.249-1.086 6.722.977.651 1.133.373 2.698-.806 4.525-.15.234-.463.297-.69.149-.232-.15-.3-.459-.149-.691.948-1.471 1.225-2.708.778-3.485-.232-.404-.665-.689-1.284-.848-1.689-.429-4.434.143-7.37 1.45.59.324 1.256.704 1.751 1.011 4.31 2.681 7.463 6.102 8.034 8.714.196.898.087 1.67-.325 2.293zm-14.331-10.43c.366-.246.721-.502 1.099-.733 1.903-1.165 3.824-2.047 5.61-2.635-.256-.784-.544-1.489-.872-2.062 0 0 0 0 0-.001-.645-1.127-1.391-1.747-2.102-1.747-1.491 0-3.113 2.815-3.734 7.18zm4.535 6.173-1.518-4.932c-.077-.25-.308-.421-.57-.421-.26 0-.491.169-.569.417l-1.552 4.933c-.101.322.139.65.477.65.218 0 .411-.142.477-.35l.205-.65h1.896l.199.647c.065.21.258.353.478.353.336 0 .577-.325.478-.647zm2.199-4.853c0-.276-.224-.5-.5-.5s-.5.224-.5.5v5c0 .276.224.5.5.5s.5-.224.5-.5z" />
          </svg>
          <span style={{ fontSize: '0.39rem', fontWeight: 800, color: G, fontFamily: MONO, letterSpacing: '0.1em', textTransform: 'uppercase', lineHeight: 1 }}>AI</span>
        </div>
      </div>
    </div>
  );
};

/* ─── Main component ─────────────────────────────────────────────────────── */
/**
 * SimulationGuideSection
 *
 * Props:
 *   howItWorksRef  – forwarded scroll-anchor ref
 *   isDesktop      – boolean media-query flag
 *   showModal      – blur/dim when identity modal is open
 *   onPreviewStep  – (stepIndex: number) => void
 */
/* ── Column count: 4 cols ≥1024px · 2 cols ≥640px · 1 col <640px ── */
const getColCount = () => {
  if (typeof window === 'undefined') return 4;
  if (window.innerWidth >= 1024) return 4;
  if (window.innerWidth >= 640) return 2;
  return 1;
};

/* prefers-reduced-motion flag — pauses involuntary content cycling */
const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

const SimulationGuideSection = ({ howItWorksRef, isDesktop, showModal, onPreviewStep }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [cycleKey, setCycleKey] = useState(0);   // increment to reset the interval
  const [visible, setVisible] = useState(false);
  const [containerW, setContainerW] = useState(0);
  const [cols, setCols] = useState(getColCount);
  const [reduced, setReduced] = useState(prefersReducedMotion);

  const sectionRef = useRef(null);
  const gridRef = useRef(null);

  const setContainerRef = (el) => {
    sectionRef.current = el;
    if (howItWorksRef) howItWorksRef.current = el;
  };

  /* Column count — responds to window resize */
  useEffect(() => {
    const onResize = () => setCols(getColCount());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* Track reduced-motion preference changes */
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  /* Section entrance */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.04 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* Auto-cycle — resets when cycleKey changes (manual dot click); paused when the
     user prefers reduced motion so content never advances on its own. */
  useEffect(() => {
    if (!visible || reduced) return;
    const id = setInterval(() => {
      setActiveStep(prev => (prev + 1) % enrollmentSteps.length);
    }, CYCLE_MS);
    return () => clearInterval(id);
  }, [visible, cycleKey, reduced]);

  /* Sync parent carousel */
  useEffect(() => {
    if (onPreviewStep) onPreviewStep(activeStep);
  }, [activeStep, onPreviewStep]);

  /* Measure grid container width for the wire SVG */
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setContainerW(el.clientWidth));
    ro.observe(el);
    setContainerW(el.clientWidth);
    return () => ro.disconnect();
  }, [visible]);

  /* Manual step jump — also resets the cycle timer */
  const handleStepClick = useCallback((i) => {
    setActiveStep(i);
    setCycleKey(k => k + 1);
  }, []);

  /* ── Render ────────────────────────────────────────────────────────────── */
  return (
    <section
      ref={setContainerRef}
      style={{
        background: 'rgba(250,248,245,0.94)',
        borderTop: '1px solid rgba(163,127,33,0.15)',
        position: 'relative', overflow: 'hidden',
        transition: 'filter 0.5s ease, opacity 0.5s ease',
        ...(showModal ? { filter: 'blur(4px)', opacity: 0.5, pointerEvents: 'none' } : {}),
      }}
    >
      {/* ── Keyframes ── */}
      <style>{`
        @keyframes pulse         { 0%,100%{opacity:1} 50%{opacity:0.55} }
        @keyframes scanSweep     { 0%{left:-100%} 100%{left:200%} }
        @keyframes cardRingPulse { 0%,100%{opacity:0.6} 50%{opacity:1} }
        @keyframes spinCW        { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes spinCCW       { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
        @keyframes orbGlow       { 0%,100%{box-shadow:0 0 22px rgba(186,151,49,0.28),0 0 44px rgba(186,151,49,0.1)} 50%{box-shadow:0 0 38px rgba(186,151,49,0.45),0 0 70px rgba(186,151,49,0.18)} }
        @keyframes sgRingPulse   { 0%{transform:scale(1);opacity:0.55} 100%{transform:scale(1.85);opacity:0} }
        @keyframes labelSweep    { 0%,100%{transform:translateX(-100%)} 50%{transform:translateX(200%)} }
        @keyframes activeShimmer { 0%{transform:translateX(-120%) skewX(-8deg)} 100%{transform:translateX(220%) skewX(-8deg)} }
      `}</style>

      {/* ── Background dot grid ── */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="sgGrid2" width="44" height="44" patternUnits="userSpaceOnUse">
            <circle cx="22" cy="22" r="0.9" fill="rgba(186,151,49,0.06)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#sgGrid2)" />
      </svg>

      {/* ── Content ── */}
      <div style={{
        maxWidth: '72rem', margin: '0 auto',
        padding: cols === 4 ? '4rem 2rem 5rem' : cols === 2 ? '2.5rem 1.5rem 3rem' : '2rem 1rem 2.5rem',
        position: 'relative', zIndex: 1,
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: cols === 4 ? '3rem' : '1.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '0.3rem 0.875rem',
            background: 'rgba(186,151,49,0.07)', border: '1px solid rgba(186,151,49,0.2)',
            borderRadius: '2rem', marginBottom: '0.875rem',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(90deg,transparent,rgba(186,151,49,0.1),transparent)',
              animation: 'labelSweep 3s ease-in-out infinite', pointerEvents: 'none',
            }} />
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: G, boxShadow: `0 0 6px ${G}` }} />
            <span style={{
              fontSize: '0.75rem', fontWeight: 700, color: G,
              textTransform: 'uppercase', letterSpacing: '0.12em', position: 'relative',
            }}>
              Enrollment Protocol
            </span>
          </div>

          <h2 style={{
            fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 800,
            letterSpacing: '-0.03em', margin: '0 0 0.5rem',
            color: '#1A1814', fontFamily: SANS,
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(36px)',
            transition: 'opacity 0.9s cubic-bezier(0.16,1,0.3,1) 0.1s, transform 0.9s cubic-bezier(0.16,1,0.3,1) 0.1s',
          }}>
            How to Use NexEnroll
          </h2>
          <p style={{
            fontSize: '0.85rem', color: 'rgba(26,24,20,0.55)', margin: 0, fontFamily: SANS,
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(14px)',
            transition: 'opacity 0.5s ease-out 0.22s, transform 0.5s ease-out 0.22s',
          }}>
            Four sequential data operations — auto-cycling through each phase.
          </p>

          {/* Desktop phase readout — reflects the active step as the cycle advances */}
          {cols === 4 && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              marginTop: '1rem', padding: '0.4rem 1rem',
              background: 'rgba(186,151,49,0.05)', border: '1px solid rgba(186,151,49,0.18)',
              borderRadius: '0.5rem', fontFamily: MONO,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: G, boxShadow: `0 0 8px ${G}`, animation: 'pulse 1.6s ease-in-out infinite' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#A37F21', letterSpacing: '0.14em' }}>
                PHASE {enrollmentSteps[activeStep].num}
              </span>
              <span style={{ width: 1, height: 12, background: 'rgba(163,127,33,0.28)' }} />
              <span style={{ fontSize: '0.7rem', color: 'rgba(26,24,20,0.70)', letterSpacing: '0.06em' }}>
                {enrollmentSteps[activeStep].title}
              </span>
            </div>
          )}
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: '1.75rem' }}>
          {enrollmentSteps.map((_, i) => (
            <button
              key={i}
              onClick={() => handleStepClick(i)}
              aria-label={`Go to step ${i + 1}`}
              style={{
                width: activeStep === i ? 28 : 8, height: 8, borderRadius: 4,
                background: activeStep === i ? G : 'rgba(186,151,49,0.2)',
                border: `1px solid ${activeStep === i ? G : 'rgba(186,151,49,0.28)'}`,
                boxShadow: activeStep === i ? `0 0 10px ${G}` : 'none',
                cursor: 'pointer', padding: 0,
                transition: 'all 0.4s cubic-bezier(0.34,1.2,0.64,1)',
              }}
            />
          ))}
        </div>

        {/* Wire + card grid — specular border ring shell (desktop only) */}
        <div style={cols === 4 ? {
          padding: '1px',
          borderRadius: 21,
          background: 'linear-gradient(135deg, rgba(186,151,49,0.38) 0%, rgba(163,127,33,0.07) 35%, transparent 55%, rgba(186,151,49,0.20) 100%)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.7s ease 0.35s, transform 0.7s cubic-bezier(0.16,1,0.3,1) 0.35s',
        } : { opacity: visible ? 1 : 0, transition: 'opacity 0.7s ease 0.35s' }}>
          <div style={cols === 4 ? {
            borderRadius: 20,
            background: 'rgba(250,248,245,0.97)',
            padding: '20px 20px 12px',
          } : {}}>
            <div ref={gridRef}>
              {/* Node network wire — 4-column desktop only */}
              {cols === 4 && containerW > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <NodeNetworkWire
                    activeStep={activeStep}
                    containerW={containerW}
                    visible={visible}
                  />
                </div>
              )}

              {/* Card grid.
                  Desktop (cols=4): opacity-only expand, zero reflow.
                  Tablet (cols=2) / phone (cols=1): accordion max-height, cards collapse when inactive. */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: cols === 4 ? '1fr 1fr 1fr 1.6fr' : `repeat(${cols}, 1fr)`,
                gap: GRID_GAP,
              }}>
                {enrollmentSteps.map((step, i) => (
                  <StepCard
                    key={i}
                    step={step}
                    index={i}
                    isActive={activeStep === i}
                    inView={visible}
                    delay={i * 0.1}
                    showAccordion={cols < 4}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom hint bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
          marginTop: '2rem',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.8s 0.8s ease',
        }}>
          <div style={{ height: 1, width: 60, background: 'linear-gradient(to right, transparent, rgba(186,151,49,0.2))' }} />
          <span style={{ fontSize: '0.75rem', color: 'rgba(163,127,33,0.60)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            AUTO-CYCLING · CLICK ANY STEP TO PREVIEW
          </span>
          <div style={{ height: 1, width: 60, background: 'linear-gradient(to left, transparent, rgba(186,151,49,0.2))' }} />
        </div>
      </div>
    </section>
  );
};

export default SimulationGuideSection;