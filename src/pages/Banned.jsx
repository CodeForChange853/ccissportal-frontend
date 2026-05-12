import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const INCIDENT_ID = `NW-${Math.floor(100000 + Math.random() * 900000)}`;

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
  @keyframes redPulse {
    0%,100% { box-shadow: 0 0 0 0    rgba(192,57,43,.55); }
    50%     { box-shadow: 0 0 0 10px rgba(192,57,43,0);   }
  }
  @keyframes blink   { 0%,100%{opacity:1;} 50%{opacity:.3;} }
  @keyframes noise   { 0%{transform:translate(0,0);} 25%{transform:translate(-1px,1px);} 50%{transform:translate(1px,-1px);} 75%{transform:translate(-1px,-1px);} }
  @keyframes blockIn { from{opacity:0;transform:translateX(14px);} to{opacity:1;transform:translateX(0);} }

  .bp {
    min-height: 100vh;
    background: #0A0A0A;
    background-image:
      radial-gradient(ellipse 90% 55% at 50% -5%,  rgba(186,151,49,.08) 0%, transparent 55%),
      radial-gradient(ellipse 45% 45% at 5%  95%,  rgba(192,57,43,.05)  0%, transparent 50%),
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

  .bp-wrap { width: 100%; max-width: 62rem; animation: fadeIn .45s ease both; }

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
  .bp-topbar-id   { font-size: .6rem; font-weight: 500; letter-spacing: .1em; color: #3A3530; white-space: nowrap; }

  .bp-card {
    background: #111; border: 1px solid rgba(186,151,49,.15);
    border-radius: 0 0 1.25rem 1.25rem; position: relative; overflow: hidden;
    box-shadow: 0 40px 100px rgba(0,0,0,.8), 0 0 0 1px rgba(186,151,49,.06), inset 0 1px 0 rgba(186,151,49,.1);
  }
  .bp-card::before {
    content: ''; position: absolute; inset: 0;
    border-radius: 0 0 1.25rem 1.25rem; padding: 1px;
    background: linear-gradient(135deg, rgba(186,151,49,.45), transparent 38%, rgba(192,57,43,.28) 68%, transparent);
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
  .seal-core  { width:56px;height:56px;border-radius:50%;background:rgba(192,57,43,.14);border:1.5px solid rgba(192,57,43,.5);display:flex;align-items:center;justify-content:center;font-size:1.625rem;animation:redPulse 2.6s ease-in-out infinite;position:relative;z-index:1; }

  .bp-badge {
    display:inline-flex;align-items:center;gap:.45rem;
    background:rgba(192,57,43,.1);border:1px solid rgba(192,57,43,.32);
    border-radius:5px;padding:.28rem .72rem;
    font-size:.6rem;font-weight:700;letter-spacing:.18em;color:#E74C3C;
    text-transform:uppercase;margin-bottom:1.1rem;
  }
  .bp-badge-dot { width:5px;height:5px;border-radius:50%;background:#E74C3C;animation:blink 1.5s ease-in-out infinite; }

  .bp-h1 {
    font-family:'Cormorant Garamond',serif;
    font-size:clamp(1.85rem,5vw,2.6rem);
    font-weight:700;line-height:1.1;color:#F0EDE8;letter-spacing:-.01em;margin-bottom:.65rem;
  }
  .bp-h1 em { color:#D4AF5A;font-style:italic; }
  .bp-sub { font-size:.86rem;color:#555050;line-height:1.72;max-width:28rem;margin-top:.5rem; }

  .bp-stats-div { display:none;width:100%;height:1px;background:linear-gradient(to right,transparent,rgba(186,151,49,.22),transparent);margin:1.75rem 0; }
  .bp-stats { display:none;gap:.875rem;width:100%; }
  .bp-stat  { flex:1;background:#161616;border:1px solid rgba(186,151,49,.12);border-radius:.75rem;padding:.875rem .75rem;text-align:center; }
  .bp-stat-v { font-family:'Cormorant Garamond',serif;font-size:1.375rem;font-weight:700;color:#BA9731;line-height:1;margin-bottom:.2rem; }
  .bp-stat-k { font-size:.58rem;font-weight:700;letter-spacing:.14em;color:#3A3530;text-transform:uppercase; }

  .bp-right { padding:2.25rem 2rem 2.75rem;display:flex;flex-direction:column;gap:1rem; }

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
  .vlist li::before { content:'—';color:rgba(192,57,43,.5);flex-shrink:0;margin-top:.05rem; }

  .rdiv { height:1px;background:linear-gradient(to right,transparent,rgba(186,151,49,.18),transparent);margin:.15rem 0; }

  .contact { display:flex;align-items:flex-start;gap:.75rem;padding:1rem 1.125rem;background:rgba(186,151,49,.035);border:1px solid rgba(186,151,49,.13);border-radius:.75rem; }
  .c-icon { width:34px;height:34px;border-radius:8px;flex-shrink:0;background:rgba(186,151,49,.09);border:1px solid rgba(186,151,49,.28);display:flex;align-items:center;justify-content:center;font-size:.875rem;margin-top:.1rem; }
  .c-text { font-size:.8rem;color:#545050;line-height:1.57; }
  .c-text strong { display:block;font-weight:600;color:#D4AF5A;font-size:.8rem;margin-bottom:.15rem; }

  .actions { display:flex;gap:.7rem; }
  .btn { flex:1;padding:.8125rem 1rem;border-radius:.75rem;font-family:'DM Sans',sans-serif;font-size:.875rem;font-weight:600;cursor:pointer;transition:all .2s;letter-spacing:.01em;border:none; }
  .btn-ghost { background:transparent;border:1px solid rgba(255,255,255,.08);color:#545050; }
  .btn-ghost:hover { border-color:rgba(255,255,255,.18);color:#F0EDE8;background:rgba(255,255,255,.03); }
  .btn-gold { background:linear-gradient(135deg,#BA9731,#9A7D28);color:#0A0A0A;box-shadow:0 4px 18px rgba(186,151,49,.22); }
  .btn-gold:hover { background:linear-gradient(135deg,#D4AF5A,#BA9731);box-shadow:0 6px 26px rgba(186,151,49,.38);transform:translateY(-1px); }
  .btn-gold:active { transform:translateY(0); }

  .bp-footer { text-align:center;font-size:.69rem;color:#2A2520;line-height:1.7;padding-top:.2rem; }
  .bp-footer span { color:#5A4820; }

  @media (min-width: 768px) {
    .bp { padding: 3rem 2rem; }
    .bp-body { grid-template-columns: 22rem 1px 1fr; }
    .bp-vdiv { background: linear-gradient(to bottom, transparent 4%, rgba(186,151,49,.18) 25%, rgba(186,151,49,.18) 75%, transparent 96%); align-self: stretch; }
    .bp-left { border-bottom: none; padding: 3.25rem 2.5rem; justify-content: center; position: sticky; top: 2rem; align-self: start; }
    .bp-right { padding: 3.25rem 2.5rem 3rem; }
    .bp-stats-div { display: block; }
    .bp-stats     { display: flex;  }
    .bp-h1 { font-size: 2.5rem; }
    .bp-topbar-lbl, .bp-topbar-id { font-size: .6875rem; }
  }

  @media (min-width: 1100px) {
    .bp-body { grid-template-columns: 24rem 1px 1fr; }
    .bp-left  { padding: 3.75rem 3rem; }
    .bp-right { padding: 3.75rem 3rem 3.5rem; }
    .bp-h1 { font-size: 2.75rem; }
  }

  @media (max-width: 479px) {
    .bp { padding: 0; align-items: flex-start; }
    .bp-wrap { max-width: 100%; }
    .bp-topbar { border-radius: 0; border-left: none; border-right: none; padding: .6rem 1rem; }
    .bp-card { border-radius: 0; border-left: none; border-right: none; }
    .bp-card::before { border-radius: 0; }
    .bp-left  { padding: 2.25rem 1.25rem 2rem; }
    .bp-right { padding: 1.75rem 1.25rem 2.25rem; gap: .875rem; }
    .bp-h1 { font-size: 1.85rem; }
    .bp-sub { font-size: .8125rem; }
    .rblock { padding: 1.125rem 1.1rem; }
    .actions { flex-direction: column; }
    .btn { flex: unset; width: 100%; }
  }

  @media (min-width: 480px) and (max-width: 767px) {
    .bp { padding: 1.5rem 1rem 3rem; align-items: flex-start; }
    .bp-left  { padding: 2.5rem 1.75rem 2.25rem; }
    .bp-right { padding: 2rem 1.75rem 2.5rem; }
    .bp-h1 { font-size: 2.1rem; }
  }
`;

const Banned = () => {
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
                            <span className="bp-topbar-lbl">NwSSU · College of Computing &amp; Information Sciences</span>
                        </div>
                        <span className="bp-topbar-id">Incident&nbsp;{INCIDENT_ID}</span>
                    </div>

                    <div className="bp-card">
                        <div className="bp-body">

                            <div className="bp-left">
                                <div className="seal-wrap">
                                    <div className="seal">
                                        <div className="seal-ring" />
                                        <div className="seal-ring2" />
                                        <div className="seal-core">🚫</div>
                                    </div>
                                </div>

                                <div className="bp-badge">
                                    <div className="bp-badge-dot" /> Account Suspended
                                </div>

                                <h1 className="bp-h1">
                                    Your Access<br />Has Been<br /><em>Restricted</em>
                                </h1>
                                <p className="bp-sub">
                                    This action reflects a serious breach of conduct standards. It is not the end — but it demands your full attention.
                                </p>

                                <div className="bp-stats-div" />
                                <div className="bp-stats">
                                    <div className="bp-stat">
                                        <div className="bp-stat-v">3</div>
                                        <div className="bp-stat-k">Violations</div>
                                    </div>
                                    <div className="bp-stat">
                                        <div className="bp-stat-v" style={{ color: '#E74C3C' }}>Active</div>
                                        <div className="bp-stat-k">Status</div>
                                    </div>
                                    <div className="bp-stat">
                                        <div className="bp-stat-v" style={{ color: '#27AE60' }}>Open</div>
                                        <div className="bp-stat-k">Appeal</div>
                                    </div>
                                </div>
                            </div>

                            <div className="bp-vdiv" />

                            <div className="bp-right">

                                <div className="rblock d">
                                    <div className="rl d">⚠&nbsp;&nbsp;Reason for Restriction</div>
                                    <p className="rt" style={{ marginBottom: '.6rem' }}>
                                        Your account was flagged and suspended following <strong>repeated violations</strong> of the CCIS community conduct policy:
                                    </p>
                                    <ul className="vlist">
                                        <li>Sending harassing or threatening messages to other users</li>
                                        <li>Sharing or distributing explicit and inappropriate content</li>
                                        <li>Disregarding multiple prior warnings issued by the system</li>
                                    </ul>
                                </div>

                                <div className="rblock g">
                                    <div className="rl g">◆&nbsp;&nbsp;A Moment to Reflect</div>
                                    <p className="rt">
                                        Every message you send within this platform <strong>reflects directly on your academic character.</strong> The relationships you build — or damage — here follow you well beyond graduation. Ask yourself honestly: <strong>is this the reputation you want to carry?</strong> Your academic standing, scholarship eligibility, and professional references may all be affected by how this matter is resolved.
                                    </p>
                                </div>

                                <div className="rblock s">
                                    <div className="rl s">↗&nbsp;&nbsp;Path Forward</div>
                                    <p className="rt">
                                        This institution believes in <strong>accountability and earned second chances.</strong> By visiting the Admin Office, acknowledging your actions, and committing to better conduct, you take the first step toward restoring your access — and your standing — within this community.
                                    </p>
                                </div>

                                <div className="rdiv" />

                                <div className="contact">
                                    <div className="c-icon">🏛</div>
                                    <div className="c-text">
                                        <strong>CCIS Admin Office — CCIS GROUND FLOOR</strong>
                                        Bring a valid student ID and your student number to begin the formal appeal process. Office hours: Monday–Friday, 8:00 AM – 5:00 PM.
                                    </div>
                                </div>

                                <div className="actions">
                                    <button className="btn btn-ghost" onClick={() => navigate('/')}>
                                        Return to Home
                                    </button>
                                    <button className="btn btn-gold" onClick={() => navigate('/appeal')}>
                                        Begin Appeal
                                    </button>
                                </div>

                                <p className="bp-footer">
                                    Further circumvention attempts will be escalated to the&nbsp;<span>University Discipline Committee.</span><br />
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

export default Banned;