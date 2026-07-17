import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const INCIDENT_ID = `NW-${Math.floor(100000 + Math.random() * 900000)}`;



const Banned = () => {
    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    useEffect(() => { const t = setTimeout(() => setShow(true), 60); return () => clearTimeout(t); }, []);

    return (
        <>

            <div className="bp">
                <div className="bp-noise" aria-hidden="true" />

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