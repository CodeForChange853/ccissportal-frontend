import React, { useEffect, useState } from 'react';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,700&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes spin     { to { transform: translate(-50%,-50%) rotate(360deg);  } }
  @keyframes spinRev  { to { transform: translate(-50%,-50%) rotate(-360deg); } }
  @keyframes spinSlow { to { transform: translate(-50%,-50%) rotate(360deg);  } }
  @keyframes fadeUp   { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
  @keyframes fadeIn   { from{opacity:0;} to{opacity:1;} }
  @keyframes noise    { 0%{transform:translate(0,0);}25%{transform:translate(-1px,1px);}50%{transform:translate(1px,-1px);}75%{transform:translate(-1px,-1px);} }
  @keyframes blink    { 0%,100%{opacity:1;} 50%{opacity:.25;} }
  @keyframes goldPulse{ 0%,100%{box-shadow:0 0 0 0 rgba(186,151,49,.5);} 50%{box-shadow:0 0 0 12px rgba(186,151,49,0);} }
  @keyframes countFlip{
    0%  {transform:translateY(0);opacity:1;}
    45% {transform:translateY(-8px);opacity:0;}
    55% {transform:translateY(8px);opacity:0;}
    100%{transform:translateY(0);opacity:1;}
  }
  @keyframes tickerScroll { 0%{transform:translateX(0);} 100%{transform:translateX(-50%);} }
  @keyframes scanline { 0%{top:-10%;} 100%{top:110%;} }

  .mp {
    min-height:100vh; background:#0A0A0A;
    background-image:
      radial-gradient(ellipse 70% 55% at 50% 0%,  rgba(186,151,49,.1) 0%, transparent 60%),
      radial-gradient(ellipse 40% 35% at 10% 100%, rgba(186,151,49,.05) 0%, transparent 50%),
      radial-gradient(ellipse 30% 30% at 90% 80%,  rgba(192,57,43,.04) 0%, transparent 50%);
    color:#F0EDE8; font-family:'DM Sans',sans-serif;
    display:flex; flex-direction:column;
    position:relative; overflow:hidden;
  }
  .mp-noise {
    position:fixed;inset:-50%;width:200%;height:200%;opacity:.022;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    pointer-events:none; animation:noise .2s steps(1) infinite;
  }
  .mp-grid {
    position:fixed;inset:0;pointer-events:none;z-index:0;
    background-image:linear-gradient(rgba(186,151,49,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(186,151,49,.025) 1px,transparent 1px);
    background-size:60px 60px;
    mask-image:radial-gradient(ellipse 80% 60% at 50% 30%,black,transparent 75%);
  }

  .mp-topbar {
    position:relative;z-index:50;
    display:flex;align-items:center;justify-content:space-between;
    padding:.875rem 2rem; border-bottom:1px solid rgba(186,151,49,.1);
    background:rgba(10,10,10,.7); backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
    flex-shrink:0;
  }
  .mp-topbar-brand { display:flex;align-items:center;gap:.625rem; }
  .mp-topbar-logo  { width:28px;height:28px;border-radius:7px;background:linear-gradient(135deg,#BA9731,#9A7D28);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.75rem;color:#0A0A0A;flex-shrink:0; }
  .mp-topbar-name  { font-size:.875rem;font-weight:700;letter-spacing:-.02em; }
  .mp-topbar-name em { color:#BA9731;font-style:normal; }
  .mp-topbar-right { display:flex;align-items:center;gap:.875rem; }
  .mp-topbar-status { display:flex;align-items:center;gap:.4rem;font-family:'JetBrains Mono',monospace;font-size:.6rem;font-weight:600;letter-spacing:.12em;color:#7A6420;text-transform:uppercase; }
  .mp-topbar-status-dot { width:6px;height:6px;border-radius:50%;background:#F59E0B;animation:blink 1.4s ease-in-out infinite; }

  .mp-ticker { background:rgba(186,151,49,.04);border-bottom:1px solid rgba(186,151,49,.08);height:30px;overflow:hidden;position:relative;z-index:40;display:flex;align-items:center;flex-shrink:0; }
  .mp-ticker-inner { display:flex;white-space:nowrap;animation:tickerScroll 28s linear infinite; }
  .mp-ticker-item  { font-family:'JetBrains Mono',monospace;font-size:.58rem;font-weight:500;letter-spacing:.1em;color:#7A6420;padding:0 2.5rem;display:flex;align-items:center;gap:.5rem; }
  .mp-ticker-dot   { width:4px;height:4px;border-radius:50%;background:#BA9731;opacity:.5; }

  .mp-body { flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:3rem 1.5rem 4rem;position:relative;z-index:10; }

  .mp-orbital { position:relative;width:180px;height:180px;margin-bottom:2.5rem;flex-shrink:0;animation:fadeIn .8s ease both; }
  .mp-orb-ring { position:absolute;top:50%;left:50%;border-radius:50%;border-style:solid;border-color:transparent; }
  .mp-orb-ring-1 { width:180px;height:180px;margin:-90px 0 0 -90px;border-width:1.5px;border-top-color:#BA9731;border-right-color:rgba(186,151,49,.25);border-bottom-color:rgba(186,151,49,.1);border-left-color:rgba(186,151,49,.25);animation:spin 14s linear infinite; }
  .mp-orb-ring-2 { width:148px;height:148px;margin:-74px 0 0 -74px;border-width:1px;border-top-color:rgba(186,151,49,.15);border-bottom-color:#BA9731;border-left-color:rgba(186,151,49,.15);border-right-color:rgba(186,151,49,.35);animation:spinRev 9s linear infinite; }
  .mp-orb-ring-3 { width:110px;height:110px;margin:-55px 0 0 -55px;border-width:1px;border-style:dashed;border-color:rgba(186,151,49,.22);animation:spinSlow 22s linear infinite; }
  .mp-orb-core   { position:absolute;top:50%;left:50%;width:72px;height:72px;margin:-36px 0 0 -36px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#1C1A10,#0A0A0A);border:1.5px solid rgba(186,151,49,.4);display:flex;align-items:center;justify-content:center;animation:goldPulse 3s ease-in-out infinite;z-index:2; }
  .mp-orb-icon   { color:#BA9731;opacity:.9; }

  .mp-eyebrow { font-size:.625rem;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:#7A6420;margin-bottom:.75rem;display:flex;align-items:center;gap:.6rem;animation:fadeUp .6s .1s both; }
  .mp-eyebrow::before,.mp-eyebrow::after { content:'';display:block;width:28px;height:1px;background:#7A6420; }

  .mp-h1 { font-family:'Cormorant Garamond',serif;font-size:clamp(2.4rem,6vw,4rem);font-weight:700;line-height:1.05;letter-spacing:-.02em;text-align:center;margin-bottom:.625rem;color:#F0EDE8;animation:fadeUp .6s .15s both; }
  .mp-h1 em { color:#D4AF5A;font-style:italic; }

  .mp-reason { display:inline-flex;align-items:center;gap:.5rem;background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.28);border-radius:6px;padding:.35rem .9rem;font-family:'JetBrains Mono',monospace;font-size:.65rem;font-weight:600;letter-spacing:.12em;color:#F59E0B;text-transform:uppercase;margin-bottom:1.75rem;animation:fadeUp .6s .2s both; }
  .mp-reason-dot { width:6px;height:6px;border-radius:50%;background:#F59E0B;animation:blink 1.4s ease-in-out infinite; }

  .mp-message { max-width:42rem;width:100%;background:#141414;border:1px solid rgba(186,151,49,.15);border-radius:1rem;padding:1.5rem 1.75rem;position:relative;overflow:hidden;margin-bottom:2.75rem;animation:fadeUp .6s .25s both;box-shadow:0 20px 50px rgba(0,0,0,.5),inset 0 1px 0 rgba(186,151,49,.1); }
  .mp-message::before { content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:linear-gradient(to bottom,#BA9731,rgba(186,151,49,.3));border-radius:3px 0 0 3px; }
  .mp-message::after  { content:'';position:absolute;inset:0;border-radius:1rem;padding:1px;background:linear-gradient(135deg,rgba(186,151,49,.35),transparent 50%);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:destination-out;mask-composite:exclude;pointer-events:none; }
  .mp-message-label { font-size:.58rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#7A6420;margin-bottom:.6rem;display:flex;align-items:center;gap:.4rem;font-family:'JetBrains Mono',monospace; }
  .mp-message-text  { font-size:.9rem;color:#B0ADA8;line-height:1.75;font-weight:400; }

  .mp-countdown { display:flex;align-items:flex-start;gap:1rem;margin-bottom:2.75rem;animation:fadeUp .6s .3s both; }
  .mp-countdown-sep { font-family:'Cormorant Garamond',serif;font-size:3rem;font-weight:700;color:rgba(186,151,49,.3);line-height:1;padding-top:.5rem;user-select:none; }
  .mp-time-unit { display:flex;flex-direction:column;align-items:center;gap:.5rem; }
  .mp-time-card {
    width:80px;height:96px;background:#141414;border:1px solid rgba(186,151,49,.18);border-radius:.875rem;
    position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;
    box-shadow:0 12px 32px rgba(0,0,0,.5),inset 0 1px 0 rgba(186,151,49,.12);
  }
  .mp-time-card::after { content:'';position:absolute;inset:0;border-radius:.875rem;padding:1px;background:linear-gradient(160deg,rgba(186,151,49,.3),transparent 55%);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:destination-out;mask-composite:exclude;pointer-events:none; }
  .mp-time-card::before { content:'';position:absolute;left:0;right:0;height:30%;background:linear-gradient(to bottom,transparent,rgba(186,151,49,.04),transparent);z-index:3;animation:scanline 3s ease-in-out infinite; }
  .mp-time-sep-line { position:absolute;top:50%;left:0;right:0;height:1px;background:rgba(186,151,49,.12);z-index:2; }
  .mp-time-val   { font-family:'Cormorant Garamond',serif;font-size:2.75rem;font-weight:700;color:#D4AF5A;letter-spacing:-.03em;line-height:1;position:relative;z-index:4;text-shadow:0 0 20px rgba(186,151,49,.3); }
  .mp-time-label { font-family:'JetBrains Mono',monospace;font-size:.58rem;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:#3E3C3A; }

  .mp-actions { display:flex;flex-direction:column;align-items:center;gap:1.25rem;animation:fadeUp .6s .38s both; }
  .mp-btn-primary { background:linear-gradient(135deg,#BA9731,#9A7D28);color:#0A0A0A;border:none;cursor:pointer;padding:.8125rem 2.5rem;border-radius:.75rem;font-family:'DM Sans',sans-serif;font-size:.875rem;font-weight:700;letter-spacing:.02em;box-shadow:0 6px 24px rgba(186,151,49,.28);transition:all .2s; }
  .mp-btn-primary:hover { background:linear-gradient(135deg,#D4AF5A,#BA9731);box-shadow:0 8px 32px rgba(186,151,49,.42);transform:translateY(-2px); }
  .mp-btn-primary:active { transform:translateY(0); }

  .mp-status-row  { display:flex;align-items:center;gap:1.75rem;flex-wrap:wrap;justify-content:center; }
  .mp-status-chip { font-family:'JetBrains Mono',monospace;font-size:.58rem;font-weight:500;letter-spacing:.1em;color:#3E3C3A;display:flex;align-items:center;gap:.35rem; }
  .mp-status-chip-dot { width:4px;height:4px;border-radius:50%;background:#22C55E; }

  .mp-foot { flex-shrink:0;padding:.875rem 2rem;border-top:1px solid rgba(186,151,49,.08);display:flex;align-items:center;justify-content:space-between;background:rgba(10,10,10,.6);backdrop-filter:blur(12px);position:relative;z-index:40;flex-wrap:wrap;gap:.5rem; }
  .mp-foot-l { font-family:'JetBrains Mono',monospace;font-size:.58rem;color:#2E2C2A; }
  .mp-foot-r { display:flex;align-items:center;gap:.5rem;font-family:'JetBrains Mono',monospace;font-size:.58rem;color:#3E3C3A; }
  .mp-foot-dot { width:5px;height:5px;border-radius:50%;background:#BA9731;opacity:.4; }

  @media (max-width:640px) {
    .mp-topbar { padding:.75rem 1rem; }
    .mp-h1 { font-size:2.2rem; }
    .mp-body { padding:2.5rem 1rem 3rem; }
    .mp-countdown { gap:.5rem; }
    .mp-time-card { width:66px;height:82px; }
    .mp-time-val  { font-size:2.25rem; }
    .mp-countdown-sep { font-size:2.25rem;padding-top:.35rem; }
    .mp-message { padding:1.25rem 1.25rem; }
    .mp-orbital { width:140px;height:140px;margin-bottom:2rem; }
    .mp-orb-ring-1 { width:140px;height:140px;margin:-70px 0 0 -70px; }
    .mp-orb-ring-2 { width:112px;height:112px;margin:-56px 0 0 -56px; }
    .mp-orb-ring-3 { width:82px; height:82px; margin:-41px 0 0 -41px; }
    .mp-orb-core   { width:56px; height:56px; margin:-28px 0 0 -28px; }
    .mp-foot { padding:.75rem 1rem; }
  }
  @media (max-width:400px) {
    .mp-countdown { gap:.35rem; }
    .mp-time-card { width:58px;height:72px; }
    .mp-time-val  { font-size:1.875rem; }
    .mp-countdown-sep { font-size:1.875rem; }
  }
`;

const TICKER_ITEMS = [
    'MAINTENANCE ACTIVE', 'CCIS SYSTEMS OFFLINE', 'TEAM DEPLOYING UPDATES',
    'DATA INTEGRITY PRESERVED', 'ESTIMATED DOWNTIME: SEE TIMER', 'SECURE CHANNEL ACTIVE',
    'AUTO-RECOVERY STANDING BY', 'NEXENROLL v3.4 PENDING', 'APOLOGIES FOR INCONVENIENCE',
    'MAINTENANCE ACTIVE', 'CCIS SYSTEMS OFFLINE', 'TEAM DEPLOYING UPDATES',
    'DATA INTEGRITY PRESERVED', 'ESTIMATED DOWNTIME: SEE TIMER', 'SECURE CHANNEL ACTIVE',
    'AUTO-RECOVERY STANDING BY', 'NEXENROLL v3.4 PENDING', 'APOLOGIES FOR INCONVENIENCE',
];

const pad = (n) => String(n).padStart(2, '0');

const MaintenanceScreen = () => {
    const [reason, setReason] = useState('');
    const [message, setMessage] = useState('');
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 2, minutes: 45, seconds: 0 });
    const [show, setShow] = useState(false);
    const [tick, setTick] = useState(0);

    useEffect(() => {
        setReason(sessionStorage.getItem('maintenance_reason') || '');
        setMessage(sessionStorage.getItem('maintenance_message') || '');
        const t = setTimeout(() => setShow(true), 60);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                let { days, hours, minutes, seconds } = prev;
                if (seconds > 0) { seconds--; }
                else {
                    seconds = 59;
                    if (minutes > 0) { minutes--; }
                    else {
                        minutes = 59;
                        if (hours > 0) { hours--; }
                        else if (days > 0) { days--; hours = 23; }
                    }
                }
                return { days, hours, minutes, seconds };
            });
            setTick(t => t + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const displayReason = reason || 'Neural Infrastructure Recalibration';
    const displayMsg = message || 'NexEnroll is currently undergoing deep-layer synchronization to optimize semestral load balancing and ensure total data integrity. Our team is actively working to restore full service and evolve your academic journey.';

    const now = new Date();
    const ts = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    return (
        <>
            <style>{css}</style>
            <div className="mp" style={{ opacity: show ? 1 : 0, transition: 'opacity .5s' }}>
                <div className="mp-noise" />
                <div className="mp-grid" />

                {/* Topbar */}
                <div className="mp-topbar">
                    <div className="mp-topbar-brand">
                        <div className="mp-topbar-logo">N</div>
                        <span className="mp-topbar-name">NexEnroll <em>System</em></span>
                    </div>
                    <div className="mp-topbar-right">
                        <div className="mp-topbar-status">
                            <div className="mp-topbar-status-dot" />
                            Maintenance Mode
                        </div>
                    </div>
                </div>

                {/* Ticker */}
                <div className="mp-ticker" aria-hidden="true">
                    <div className="mp-ticker-inner">
                        {TICKER_ITEMS.map((item, i) => (
                            <span key={i} className="mp-ticker-item">
                                <span className="mp-ticker-dot" />{item}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Body */}
                <div className="mp-body">

                    {/* Orbital ring visual */}
                    <div className="mp-orbital">
                        <div className="mp-orb-ring mp-orb-ring-1" />
                        <div className="mp-orb-ring mp-orb-ring-2" />
                        <div className="mp-orb-ring mp-orb-ring-3" />
                        <div className="mp-orb-core">
                            <svg className="mp-orb-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                <circle cx="12" cy="12" r="3" />
                                <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                            </svg>
                        </div>
                    </div>

                    <div className="mp-eyebrow">Maintenance Protocol Active</div>

                    <h1 className="mp-h1">We'll be <em>back</em> shortly</h1>

                    <div className="mp-reason">
                        <div className="mp-reason-dot" />
                        {displayReason}
                    </div>

                    <div className="mp-message">
                        <div className="mp-message-label">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
                            </svg>
                            System Notice
                        </div>
                        <p className="mp-message-text">{displayMsg}</p>
                    </div>

                    {/* Countdown */}
                    <div className="mp-countdown">
                        {timeLeft.days > 0 && (
                            <>
                                <div className="mp-time-unit">
                                    <div className="mp-time-card">
                                        <div className="mp-time-sep-line" />
                                        <span className="mp-time-val">{pad(timeLeft.days)}</span>
                                    </div>
                                    <span className="mp-time-label">Days</span>
                                </div>
                                <div className="mp-countdown-sep">:</div>
                            </>
                        )}
                        <div className="mp-time-unit">
                            <div className="mp-time-card">
                                <div className="mp-time-sep-line" />
                                <span className="mp-time-val">{pad(timeLeft.hours)}</span>
                            </div>
                            <span className="mp-time-label">Hours</span>
                        </div>
                        <div className="mp-countdown-sep">:</div>
                        <div className="mp-time-unit">
                            <div className="mp-time-card">
                                <div className="mp-time-sep-line" />
                                <span className="mp-time-val">{pad(timeLeft.minutes)}</span>
                            </div>
                            <span className="mp-time-label">Min</span>
                        </div>
                        <div className="mp-countdown-sep">:</div>
                        <div className="mp-time-unit">
                            <div className="mp-time-card">
                                <div className="mp-time-sep-line" />
                                <span
                                    key={tick}
                                    className="mp-time-val"
                                    style={{ animation: 'countFlip .5s ease both' }}
                                >
                                    {pad(timeLeft.seconds)}
                                </span>
                            </div>
                            <span className="mp-time-label">Sec</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mp-actions">
                        <button className="mp-btn-primary" onClick={() => window.location.reload()}>
                            Refresh System Status
                        </button>
                        <div className="mp-status-row">
                            <span className="mp-status-chip"><div className="mp-status-chip-dot" />Node 01 Active</span>
                            <span className="mp-status-chip"><div className="mp-status-chip-dot" />Secure Channel v4</span>
                            <span className="mp-status-chip"><div className="mp-status-chip-dot" />Data Preserved</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mp-foot">
                    <span className="mp-foot-l">AI-Core Resilience Protocol v2.4 · NwSSU CCIS</span>
                    <div className="mp-foot-r">
                        <div className="mp-foot-dot" />
                        {ts}
                    </div>
                </div>

            </div>
        </>
    );
};

export default MaintenanceScreen;