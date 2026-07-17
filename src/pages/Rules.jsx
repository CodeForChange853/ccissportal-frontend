import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/components/rules.css';



const Rules = () => {
    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    useEffect(() => { const t = setTimeout(() => setShow(true), 60); return () => clearTimeout(t); }, []);

    return (
        <>

            <div className="bp">
                <a href="#main-content" className="skip-to-content">Skip to main content</a>
                <div className="bp-noise" aria-hidden="true" />

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

                            <div id="main-content" className="bp-right">

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
                                        NexEnroll believes in absolute accountability. Users who reach the 3-strike threshold will be listed on the <strong>Public Violators Registry.</strong> This &quot;Wall of Shame&quot; is visible to all students, faculty, and administrative staff, permanently associating your name with conduct violations. <strong>Is this the legacy you want to leave at this institution?</strong>
                                    </p>
                                    <button
                                        onClick={() => navigate('/wall-of-shame')}
                                        style={{
                                            marginTop: '.85rem',
                                            padding: '.5rem 1.1rem',
                                            background: 'rgba(192,57,43,.1)',
                                            border: '1px solid rgba(192,57,43,.3)',
                                            borderRadius: '8px',
                                            color: '#E74C3C',
                                            fontSize: '.75rem',
                                            fontWeight: 700,
                                            fontFamily: "'Inter', sans-serif",
                                            letterSpacing: '.03em',
                                            cursor: 'pointer',
                                            transition: 'all .2s',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '.4rem',
                                        }}
                                        onMouseOver={e => { e.currentTarget.style.background = 'rgba(192,57,43,.18)'; e.currentTarget.style.borderColor = 'rgba(192,57,43,.5)'; }}
                                        onMouseOut={e => { e.currentTarget.style.background = 'rgba(192,57,43,.1)'; e.currentTarget.style.borderColor = 'rgba(192,57,43,.3)'; }}
                                    >
                                        ☠ View Wall of Shame →
                                    </button>
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
