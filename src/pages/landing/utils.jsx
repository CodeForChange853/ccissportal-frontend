import React, { useState, useEffect, useRef } from 'react';

export const useReducedMotion = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);
  return reduced;
};

export const useInView = (threshold = 0.15) => {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      ([entry]) => setShown(entry.isIntersecting),
      { threshold, rootMargin: '0px 0px -10% 0px' }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, shown];
};

export const Reveal = ({ children, delay = 0, direction = 'up' }) => {
  const [ref, shown] = useInView(0.12);
  const reduced = useReducedMotion();
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (!shown) { setSettled(false); return; }
    const t = setTimeout(() => setSettled(true), (delay + 0.9) * 1000);
    return () => clearTimeout(t);
  }, [shown, delay]);
  const hidden = direction === 'left' ? 'translateX(-26px)'
    : direction === 'right' ? 'translateX(26px)'
      : 'translateY(24px)';
  return (
    <div
      ref={ref}
      style={reduced ? undefined : {
        opacity: shown ? 1 : 0,
        transform: shown ? 'translate(0)' : hidden,
        willChange: settled ? 'auto' : 'opacity, transform',
        transition: `opacity 0.6s ease ${delay}s, transform 0.7s cubic-bezier(0.34,1.2,0.64,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
};

export const RevealHeavy = ({ children, delay = 0 }) => {
  const [ref, shown] = useInView(0.12);
  const reduced = useReducedMotion();
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (!shown) { setSettled(false); return; }
    const t = setTimeout(() => setSettled(true), (delay + 1.0) * 1000);
    return () => clearTimeout(t);
  }, [shown, delay]);
  return (
    <div ref={ref} style={reduced ? undefined : {
      opacity: shown ? 1 : 0,
      transform: shown ? 'translateY(0)' : 'translateY(36px)',
      willChange: settled ? 'auto' : 'opacity, transform',
      transition: `opacity 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
    }}>
      {children}
    </div>
  );
};

export const RevealLight = ({ children, delay = 0 }) => {
  const [ref, shown] = useInView(0.08);
  const reduced = useReducedMotion();
  return (
    <div ref={ref} style={reduced ? undefined : {
      opacity: shown ? 1 : 0,
      transform: shown ? 'translateY(0)' : 'translateY(14px)',
      transition: `opacity 0.5s ease-out ${delay}s, transform 0.5s ease-out ${delay}s`,
    }}>
      {children}
    </div>
  );
};

export const RevealCard = ({ children, delay = 0, direction = 'up' }) => {
  const [ref, shown] = useInView(0.1);
  const reduced = useReducedMotion();
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (!shown) { setSettled(false); return; }
    const t = setTimeout(() => setSettled(true), (delay + 0.8) * 1000);
    return () => clearTimeout(t);
  }, [shown, delay]);
  const offset = direction === 'left' ? '-20px, 0' : direction === 'right' ? '20px, 0' : '0, 28px';
  return (
    <div ref={ref} style={reduced ? undefined : {
      opacity: shown ? 1 : 0,
      transform: shown ? 'translate(0,0)' : `translate(${offset})`,
      willChange: settled ? 'auto' : 'opacity, transform',
      transition: `opacity 0.65s cubic-bezier(0.22,0.61,0.36,1) ${delay}s, transform 0.65s cubic-bezier(0.22,0.61,0.36,1) ${delay}s`,
    }}>
      {children}
    </div>
  );
};

export const SectionHeading = ({ eyebrow, title, subtitle }) => (
  <div style={{ textAlign: 'center', maxWidth: '40rem', margin: '0 auto' }}>
    <RevealLight delay={0}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ width: 22, height: 2, background: 'linear-gradient(to right, transparent, #BA9731)', borderRadius: 2 }} />
        <span style={{ fontSize: '0.63rem', fontWeight: 700, color: '#BA9731', letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: "'Orbitron', sans-serif" }}>{eyebrow}</span>
        <span style={{ width: 22, height: 2, background: 'linear-gradient(to left, transparent, #BA9731)', borderRadius: 2 }} />
      </div>
    </RevealLight>
    <RevealHeavy delay={0.1}>
      <h2 style={{
        fontSize: 'clamp(1.3rem, 2.6vw, 2rem)',
        fontFamily: "'Ethnocentric', 'Cormorant Garamond', serif",
        fontWeight: 400, letterSpacing: '0.01em', lineHeight: 1.25, margin: 0,
        background: 'linear-gradient(135deg, #1A1814 0%, #7A5F10 55%, #A37F21 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
      }}>
        {title}
      </h2>
    </RevealHeavy>
    {subtitle && (
      <RevealLight delay={0.22}>
        <p style={{ marginTop: 14, fontSize: 'clamp(0.92rem, 1.6vw, 1.02rem)', color: '#5C5A56', lineHeight: 1.7 }}>
          {subtitle}
        </p>
      </RevealLight>
    )}
  </div>
);

export const NarrativeBridge = ({ lines, isDesktop }) => {
  const reduced = useReducedMotion();
  const [ref, inView] = useInView(0.3);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) { setCount(lines.length); return; }
    setCount(0);
    let i = 0;
    const next = () => {
      i++;
      setCount(i);
      if (i < lines.length) setTimeout(next, 195);
    };
    setTimeout(next, 80);
  }, [inView, reduced, lines.length]);

  return (
    <div ref={ref} aria-hidden="true" style={{
      maxWidth: 620, margin: '0 auto',
      padding: isDesktop ? '0 3rem' : '0 1.5rem',
      fontFamily: "'Orbitron', 'JetBrains Mono', monospace",
      fontSize: isDesktop ? '0.6rem' : '0.56rem',
      letterSpacing: '0.06em',
      lineHeight: 2.1,
      position: 'relative', zIndex: 2,
      userSelect: 'none',
    }}>
      <div style={{ width: 1, height: 36, margin: '0 auto 10px', background: 'linear-gradient(to bottom, transparent, rgba(186,151,49,0.22))' }} />
      {lines.map((line, i) => {
        const isCmd = line.trimStart().startsWith('>');
        return (
          <div key={i} style={{
            opacity: i < count ? 1 : 0,
            transform: i < count ? 'none' : 'translateY(7px)',
            transition: 'opacity 0.32s ease, transform 0.32s ease',
            color: isCmd ? 'rgba(186,151,49,0.78)' : 'rgba(186,151,49,0.40)',
            paddingLeft: isCmd ? 0 : '1.2rem',
            fontWeight: isCmd ? 700 : 400,
          }}>
            {line}
          </div>
        );
      })}
      <div style={{ width: 1, height: 36, margin: '10px auto 0', background: 'linear-gradient(to bottom, rgba(186,151,49,0.22), transparent)' }} />
    </div>
  );
};

export const Icons = {
  crest: (
    <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
      <path d="M24 4L6 14v14c0 10 8 16 18 18 10-2 18-8 18-18V14L24 4z"
        stroke="#BA9731" strokeWidth="1.8" fill="rgba(186,151,49,0.09)" />
      <path d="M24 14v10M19 19h10M16 28c2 3 5 5 8 5s6-2 8-5"
        stroke="#DACE84" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  verify: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#BA9731" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" />
    </svg>
  ),
  scan: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#BA9731" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 17h7M17.5 14v7" />
    </svg>
  ),
  enroll: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#BA9731" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
      <path d="M14 2v6h6M9 15l2 2 4-4" />
    </svg>
  ),
  balance: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#BA9731" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
    </svg>
  ),
  check: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" />
    </svg>
  ),
  eye: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  warning: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />
    </svg>
  ),
  arrow: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  ),
};
