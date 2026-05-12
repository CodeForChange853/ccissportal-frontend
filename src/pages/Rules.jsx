import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes spinRing { to { transform:rotate(360deg); } }
  @keyframes sealPop  {
    0%   { opacity:0; transform:scale(.65) rotate(-18deg); }
    65%  { opacity:1; transform:scale(1.07) rotate(4deg);  }
    100% { opacity:1; transform:scale(1)   rotate(0deg);   }
  }
  @keyframes goldPulse {
    0%,100% { box-shadow: 0 0 0 0    rgba(186,151,49,.55); }
    50%     { box-shadow: 0 0 0 10px rgba(186,151,49,0);   }
  }
  @keyframes noise   { 0%{transform:translate(0,0);} 25%{transform:translate(-1px,1px);} 50%{transform:translate(1px,-1px);} 75%{transform:translate(-1px,-1px);} }
  @keyframes blockIn { from{opacity:0;transform:translateX(14px);} to{opacity:1;transform:translateX(0);} }

  .bp {
    min-height: 100vh;
    background: #0A0A0A;
    background-image:
      radial-gradient(ellipse 90% 55% at 50% -5%,  rgba(186,151,49,.08) 0%, transparent 55%),
      radial-gradient(ellipse 45% 45% at 5%  95%,  rgba(186,151,49,.05)  0%, transparent 50%),
      radial-gradient(ellipse 35% 35% at 95% 80%,  rgba(186,151,49,.04) 0%, transparent 50%);
    display: flex; align-items: center; justify-content: center;
    padding: 3rem 1.5rem 4rem;
    font-family: 'DM Sans', sans-serif;
    position: relative; overflow-x: hidden;
  }
  .bp-noise {
    position: fixed; inset: -50%; width: 200%; height: 200%; opacity: .02;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    pointer-events: none; animation: noise .2s steps(1) infinite;
  }

  .bp-wrap { width: 100%; max-width: 66rem; animation: fadeIn .45s ease both; }

  .bp-topbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: .7rem 1.5rem;
    border: 1px solid rgba(186,151,49,.14); border-bottom: none;
    border-radius: 1.25rem 1.25rem 0 0;
    background: rgba(186,151,49,.025);
    gap: .75rem; flex-wrap: wrap;
  }
  .bp-topbar-left { display: flex; align-items: center; gap: .55rem; }
  .bp-topbar-dot  { width: 7px; height: 7px; border-radius: 50%; background: #BA9731; opacity: .65; flex-shrink: 0; }
  .bp-topbar-lbl  { font-size: .6rem; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: #7A6420; }
  .bp-topbar-id   { font-size: .6rem; font-weight: 500; letter-spacing: .1em; color: #BA9731; white-space: nowrap; }

  .bp-card {
    background: #111; border: 1px solid rgba(186,151,49,.15);
    border-radius: 0 0 1.25rem 1.25rem; position: relative; overflow: hidden;
    box-shadow: 0 40px 100px rgba(0,0,0,.8), 0 0 0 1px rgba(186,151,49,.06), inset 0 1px 0 rgba(186,151,49,.1);
  }
  .bp-card::before {
    content: ''; position: absolute; inset: 0;
    border-radius: 0 0 1.25rem 1.25rem; padding: 1px;
    background: linear-gradient(135deg, rgba(186,151,49,.45), transparent 38%, rgba(218,206,132,.2) 68%, transparent);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: destination-out; mask-composite: exclude; pointer-events: none;
  }

  .bp-body { display: grid; grid-template-columns: 1fr; }

  .bp-left {
    padding: 2.75rem 2rem 2.25rem;
    display: flex; flex-direction: column; align-items: center; text-align: center;
    border-bottom: 1px solid rgba(186,151,49,.1);
  }

  .seal-wrap { margin-bottom: 1.75rem; animation: sealPop .9s cubic-bezier(.34,1.56,.64,1) .2s both; }
  .seal { width: 90px; height: 90px; position: relative; display: flex; align-items: center; justify-content: center; }
  .seal-ring  { position:absolute;inset:0;border-radius:50%;border:1.5px dashed #7A6420;animation:spinRing 28s linear infinite;opacity:.5; }
  .seal-ring2 { position:absolute;inset:10px;border-radius:50%;border:1px solid rgba(186,151,49,.25); }
  .seal-core  { width:56px;height:56px;border-radius:50%;background:rgba(186,151,49,.14);border:1.5px solid rgba(186,151,49,.5);display:flex;align-items:center;justify-content:center;font-size:1.625rem;animation:goldPulse 2.6s ease-in-out infinite;position:relative;z-index:1; }

  .bp-badge {
    display:inline-flex;align-items:center;gap:.45rem;
    background:rgba(186,151,49,.1);border:1px solid rgba(186,151,49,.32);
    border-radius:5px;padding:.28rem .72rem;
    font-size:.6rem;font-weight:700;letter-spacing:.18em;color:#BA9731;
    text-transform:uppercase;margin-bottom:1.1rem;
  }

  .bp-h1 {
    font-family:'Cormorant Garamond',serif;
    font-size:clamp(1.85rem,5vw,2.6rem);
    font-weight:700;line-height:1.1;color:#F0EDE8;letter-spacing:-.01em;margin-bottom:.65rem;
  }
  .bp-h1 em { color:#D4AF5A;font-style:italic; }
  .bp-sub { font-size:.86rem;color:#555050;line-height:1.72;max-width:28rem;margin-top:.5rem; }

  .bp-right { padding:2.25rem 2rem 2.75rem;display:flex;flex-direction:column;gap:1.25rem; }

  .rblock { background:#161616;border:1px solid rgba(186,151,49,.12);border-radius:.875rem;padding:1.25rem 1.375rem;position:relative;overflow:hidden;animation:blockIn .5s cubic-bezier(.16,1,.3,1) both; }
  .rblock:nth-child(1){animation-delay:.08s;} .rblock:nth-child(2){animation-delay:.2s;} .rblock:nth-child(3){animation-delay:.32s;}
  .rblock::before { content:'';position:absolute;left:0;top:0;bottom:0;width:3px;border-radius:3px 0 0 3px; }
  .rblock.d::before{background:#C0392B;} .rblock.g::before{background:#BA9731;} .rblock.s::before{background:#27AE60;}

  .rl { font-size:.605rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;margin-bottom:.55rem;display:flex;align-items:center;gap:.4rem; }
  .rl.d{color:#E74C3C;} .rl.g{color:#D4AF5A;} .rl.s{color:#27AE60;}
  .rt { font-size:.845rem;color:#D0CDC8;line-height:1.72; }
  .rt strong { font-weight:600;color:#F0EDE8; }

  .vlist { list-style:none;margin-top:.6rem;display:flex;flex-direction:column;gap:.4rem; }
  .vlist li { font-size:.79rem;color:#545050;display:flex;align-items:flex-start;gap:.55rem;line-height:1.55; }
  .vlist li::before { content:'—';color:rgba(186,151,49,.5);flex-shrink:0;margin-top:.05rem; }

  .rdiv { height:1px;background:linear-gradient(to right,transparent,rgba(186,151,49,.18),transparent);margin:.15rem 0; }

  .contact { display:flex;align-items:flex-start;gap:.75rem;padding:1rem 1.125rem;background:rgba(192,57,43,.035);border:1px solid rgba(192,57,43,.13);border-radius:.75rem; }
  .c-icon { width:34px;height:34px;border-radius:8px;flex-shrink:0;background:rgba(192,57,43,.09);border:1px solid rgba(192,57,43,.28);display:flex;align-items:center;justify-content:center;font-size:.875rem;margin-top:.1rem; }
  .c-text { font-size:.8rem;color:#E74C3C;line-height:1.57; }
  .c-text strong { display:block;font-weight:700;color:#C0392B;font-size:.8rem;margin-bottom:.15rem;text-transform:uppercase;letter-spacing:0.02em; }

  .actions { display:flex;gap:.7rem; }
  .btn { flex:1;padding:.8125rem 1rem;border-radius:.75rem;font-family:'DM Sans',sans-serif;font-size:.875rem;font-weight:600;cursor:pointer;transition:all .2s;letter-spacing:.01em;border:none; }
  .btn-ghost { background:transparent;border:1px solid rgba(255,255,255,.08);color:#545050; }
  .btn-ghost:hover { border-color:rgba(255,255,255,.18);color:#F0EDE8;background:rgba(255,255,255,.03); }
  .btn-gold { background:linear-gradient(135deg,#BA9731,#9A7D28);color:#0A0A0A;box-shadow:0 4px 18px rgba(186,151,49,.22); }
  .btn-gold:hover { background:linear-gradient(135deg,#D4AF5A,#BA9731);box-shadow:0 6px 26px rgba(186,151,49,.38);transform:translateY(-1px); }

  .bp-footer { text-align:center;font-size:.69rem;color:#2A2520;line-height:1.7;padding-top:.2rem; }
  .bp-footer span { color:#5A4820; }

  @media (min-width: 768px) {
    .bp { padding: 3rem 2rem; }
    .bp-body { grid-template-columns: 22rem 1px 1fr; }
    .bp-vdiv { background: linear-gradient(to bottom, transparent 4%, rgba(186,151,49,.18) 25%, rgba(186,151,49,.18) 75%, transparent 96%); align-self: stretch; }
    .bp-left { border-bottom: none; padding: 3.25rem 2.5rem; justify-content: center; position: sticky; top: 2rem; align-self: start; }
    .bp-right { padding: 3.25rem 2.5rem 3rem; }
    .bp-h1 { font-size: 2.5rem; }
  }

  @media (max-width: 479px) {
    .bp { padding: 0; align-items: flex-start; }
    .bp-wrap { max-width: 100%; }
    .bp-topbar { border-radius: 0; border-left: none; border-right: none; }
    .bp-card { border-radius: 0; border-left: none; border-right: none; }
    .bp-left  { padding: 2.25rem 1.25rem 2rem; }
    .bp-right { padding: 1.75rem 1.25rem 2.25rem; gap: .875rem; }
    .actions { flex-direction: column; }
    .btn { width: 100%; }
  }
`;

const Rules = () => {
    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    useEffect(() => { const t = setTimeout(() => setShow(true), 60); return () => clearTimeout(t); }, []);

    return (
        <>
            <style>{css}</style>
            <div className="bp">
                <div className="bp-noise" />

                <div className="bp-wrap" style={{ opacity: show ? 1 : 0, transition: 'opacity .4s' }}>

                    <div className="bp-topbar">
                        <div className="bp-topbar-left">
                            <div className="bp-topbar-dot" />
                            <span className="bp-topbar-lbl">NexEnroll · System Protocol v2.0</span>
                        </div>
                        <span className="bp-topbar-id">SECURITY STATUS: ENFORCED</span>
                    </div>

                    <div className="bp-card">
                        <div className="bp-body">

                            <div className="bp-left">
                                <div className="seal-wrap">
                                    <div className="seal">
                                        <div className="seal-ring" />
                                        <div className="seal-ring2" />
                                        <div className="seal-core">⚖</div>
                                    </div>
                                </div>

                                <div className="bp-badge">
                                    Code of Conduct
                                </div>

                                <h1 className="bp-h1">
                                    Rules and<br />Academic<br /><em>Integrity</em>
                                </h1>
                                <p className="bp-sub">
                                    NexEnroll is built on trust, transparency, and the highest standards of academic character. Failure to comply results in permanent digital records.
                                </p>
                            </div>

                            <div className="bp-vdiv" />

                            <div className="bp-right">

                                <div className="rblock g">
                                    <div className="rl g">◈&nbsp;&nbsp;Enrollment & Registration</div>
                                    <p className="rt">
                                        The registration portal is a <strong>secure gateway.</strong> Attempting to circumvent the <strong>Semestral Passkey</strong> or using fraudulent Student IDs will lead to an immediate system flag. New students are restricted to 1st Year, 1st Semester subjects unless a valid <strong>Certificate of Registration (COR)</strong> is scanned and verified by the AI Vision engine.
                                    </p>
                                </div>

                                <div className="rblock g">
                                    <div className="rl g">◈&nbsp;&nbsp;Zero-Tolerance Conduct</div>
                                    <p className="rt">
                                        Interaction within this platform is <strong>monitored for integrity.</strong> Harassment, threatening messages, or the distribution of inappropriate content triggers a <strong>Three-Strike Protocol.</strong> Upon the third strike, your account is permanently deactivated and all academic progress within the system is frozen.
                                    </p>
                                </div>

                                <div className="rblock d">
                                    <div className="rl d">⚠&nbsp;&nbsp;Public Accountability (New)</div>
                                    <p className="rt">
                                        NexEnroll believes in absolute accountability. Users who reach the 3-strike threshold will be listed on the upcoming <strong>Public Violators Leaderboard.</strong> This "Wall of Shame" will be visible to all students, faculty, and administrative staff, permanently associating your name with conduct violations. <strong>Is this the legacy you want to leave at this institution?</strong>
                                    </p>
                                </div>

                                <div className="rdiv" />

                                <div className="contact">
                                    <div className="c-icon">☢</div>
                                    <div className="c-text">
                                        <strong>CRITICAL WARNING: ESCALATION</strong>
                                        Digital misconduct is shared with the University Discipline Committee. Violations are documented in your permanent academic transcript, affecting graduation honors and professional references.
                                    </div>
                                </div>

                                <div className="actions">
                                    <button className="btn btn-ghost" onClick={() => navigate(-1)}>
                                        Go Back
                                    </button>
                                    <button className="btn btn-gold" onClick={() => navigate('/')}>
                                        I Understand
                                    </button>
                                </div>

                                <p className="bp-footer">
                                    NexEnroll AI Core uses cryptographic audit logs for all actions.<br />
                                    Northwest Samar State University · CCIS · {new Date().getFullYear()}
                                </p>

                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

export default Rules;
