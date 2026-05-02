import React, { useState, useEffect, useRef } from 'react';

const HEX_CHARS = '0123456789ABCDEF';
const randomHex = (len = 8) =>
  Array.from({ length: len }, () => HEX_CHARS[Math.floor(Math.random() * 16)]).join('');

const DataReadout = () => {
  const [lines, setLines] = useState(() =>
    Array.from({ length: 6 }, () => `${randomHex(4)} ${randomHex(8)} ${randomHex(4)}`)
  );

  useEffect(() => {
    const id = setInterval(() => {
      setLines(prev => {
        const next = [...prev];
        const idx = Math.floor(Math.random() * next.length);
        next[idx] = `${randomHex(4)} ${randomHex(8)} ${randomHex(4)}`;
        return next;
      });
    }, 120);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute right-2 top-2 bottom-2 w-28 flex flex-col justify-end gap-0.5 pointer-events-none">
      {lines.map((l, i) => (
        <p
          key={i}
          className="font-mono text-[7px] leading-tight px-1"
          style={{ color: i === lines.length - 1 ? '#00f2ff' : `rgba(0,242,255,${0.2 + i * 0.1})` }}
        >
          {l}
        </p>
      ))}
    </div>
  );
};

/* Animated scan percentage */
const ScanPercent = ({ active }) => {
  const [pct, setPct] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (!active) { setPct(0); return; }
    let v = 0;
    ref.current = setInterval(() => {
      v += Math.random() * 4;
      if (v >= 99) { v = 99; clearInterval(ref.current); }
      setPct(Math.floor(v));
    }, 80);
    return () => clearInterval(ref.current);
  }, [active]);

  return (
    <span className="tabular-nums" style={{ color: '#00f2ff' }}>
      {pct}%
    </span>
  );
};

/* Corner bracket SVG */
const Corner = ({ position }) => {
  const posClass = {
    'tl': 'top-0 left-0',
    'tr': 'top-0 right-0 rotate-90',
    'bl': 'bottom-0 left-0 -rotate-90',
    'br': 'bottom-0 right-0 rotate-180',
  }[position];

  return (
    <div className={`absolute w-8 h-8 ${posClass}`}>
      <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
        <path d="M2 16 L2 2 L16 2" stroke="#00f2ff" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
};

/* ── Main ScannerOverlay ── */
const ScannerOverlay = ({
  imageSrc,
  isActive,
  label = 'ANALYZING...',
  type = 'ID', // 'ID' | 'COR'
}) => {
  const [glitch, setGlitch] = useState(false);

  /* Random glitch flicker */
  useEffect(() => {
    if (!isActive) { setGlitch(false); return; }
    const scheduleGlitch = () => {
      const delay = 800 + Math.random() * 2000;
      return setTimeout(() => {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 80 + Math.random() * 120);
        scheduleGlitch();
      }, delay);
    };
    const t = scheduleGlitch();
    return () => clearTimeout(t);
  }, [isActive]);

  const typeLabels = {
    ID: { icon: '🪪', title: 'IDENTITY VERIFICATION', sub: 'AI_VISION_MOD v2.1 // FACIAL & TEXT RECOGNITION' },
    COR: { icon: '📄', title: 'DOCUMENT EXTRACTION', sub: 'AI_VISION_MOD v2.1 // SUBJECT & ENROLLMENT PARSING' },
  };
  const meta = typeLabels[type] || typeLabels.ID;

  return (
    <div
      className="relative w-full max-w-lg mx-auto rounded-xl overflow-hidden"
      style={{
        border: `2px solid ${isActive ? 'rgba(0,242,255,0.6)' : 'rgba(0,242,255,0.25)'}`,
        boxShadow: isActive
          ? '0 0 0 1px rgba(0,242,255,0.1), 0 0 30px rgba(0,242,255,0.3), 0 0 60px rgba(0,242,255,0.12), inset 0 0 30px rgba(0,242,255,0.04)'
          : '0 0 20px rgba(0,242,255,0.1)',
        transition: 'box-shadow 0.4s, border-color 0.4s',
        background: '#020c1b',
      }}
    >
      {/* ── Image ── */}
      {imageSrc ? (
        <img
          src={imageSrc}
          alt="Scanning target"
          className="w-full object-cover transition-all duration-300"
          style={{
            height: 240,
            opacity: isActive ? (glitch ? 0.4 : 0.65) : 0.9,
            filter: isActive
              ? `blur(${glitch ? '1.5px' : '0.5px'}) saturate(0.7) ${glitch ? 'hue-rotate(20deg)' : ''}`
              : 'none',
            transform: glitch ? `translateX(${(Math.random() - 0.5) * 4}px)` : 'none',
          }}
        />
      ) : (
        <div
          className="w-full flex items-center justify-center font-mono text-xs uppercase tracking-widest"
          style={{ height: 240, color: 'rgba(0,242,255,0.2)', background: '#020c1b' }}
        >
          Awaiting upload…
        </div>
      )}

      {isActive && (
        <>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'rgba(0,242,255,0.06)', mixBlendMode: 'screen' }}
          />

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(rgba(0,242,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(0,242,255,0.07) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />

          <div className="scanner-line" />

          <div
            className="absolute left-0 right-0 pointer-events-none flex justify-around items-center"
            style={{
              height: 4,
              top: '50%',
              animation: 'neural-scan 2.5s ease-in-out infinite',
              opacity: 0.6,
            }}
          >
            {Array.from({ length: 18 }).map((_, i) => (
              <span
                key={i}
                className="rounded-full"
                style={{
                  width: 3,
                  height: 3,
                  background: '#00f2ff',
                  opacity: Math.random() > 0.4 ? 0.9 : 0.2,
                  boxShadow: '0 0 6px #00f2ff',
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            ))}
          </div>

          {/* ── Corner brackets ── */}
          <Corner position="tl" />
          <Corner position="tr" />
          <Corner position="bl" />
          <Corner position="br" />

          {/* ── Top-left HUD badge ── */}
          <div
            className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded font-mono text-[10px]"
            style={{
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(0,242,255,0.3)',
              color: '#00f2ff',
            }}
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            {label}
          </div>

          {/* ── Scan % bottom center ── */}
          <div
            className="absolute bottom-2 left-1/2 -translate-x-1/2 font-mono text-[10px] flex items-center gap-2"
            style={{ color: 'rgba(0,242,255,0.6)' }}
          >
            <span>SCAN</span>
            <ScanPercent active={isActive} />
          </div>

          <DataReadout />

          <div
            className="absolute bottom-2 left-2 font-mono"
            style={{ fontSize: 7, color: 'rgba(0,242,255,0.45)' }}
          >
            {meta.sub}
          </div>
        </>
      )}

      <div
        className="px-4 py-2.5 flex items-center justify-between"
        style={{
          background: 'rgba(0,0,0,0.7)',
          borderTop: '1px solid rgba(0,242,255,0.15)',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">{meta.icon}</span>
          <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'rgba(0,242,255,0.7)' }}>
            {meta.title}
          </span>
        </div>
        <div
          className="font-mono text-[9px] px-2 py-0.5 rounded"
          style={{
            background: isActive ? 'rgba(0,242,255,0.12)' : 'rgba(255,255,255,0.04)',
            color: isActive ? '#00f2ff' : '#475569',
            border: `1px solid ${isActive ? 'rgba(0,242,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
          }}
        >
          {isActive ? '● SCANNING' : '○ READY'}
        </div>
      </div>
    </div>
  );
};

export default ScannerOverlay;