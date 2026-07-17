import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import PublicNav from '../components/public/PublicNav';
import PublicFooter from '../components/public/PublicFooter';
import '../styles/components/announcements.css';



const getBadgeStyle = (type) => {
    switch (type?.toLowerCase()) {
        case 'maintenance':
            return { bg: 'rgba(245,158,11,.1)', border: 'rgba(245,158,11,.3)', color: '#F59E0B', dot: '#F59E0B', label: 'MAINTENANCE' };
        case 'incident':
            return { bg: 'rgba(239,68,68,.1)', border: 'rgba(239,68,68,.3)', color: '#EF4444', dot: '#EF4444', label: 'INCIDENT' };
        default:
            return { bg: 'rgba(186,151,49,.1)', border: 'rgba(186,151,49,.3)', color: '#BA9731', dot: '#BA9731', label: 'ANNOUNCEMENT' };
    }
};

const Announcements = () => {
    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const { data } = await client.getAnnouncements();
                setAnnouncements(data);
            } catch (err) {
                console.error("Failed to fetch announcements", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnnouncements();
        const t1 = setTimeout(() => setShow(true), 60);
        return () => clearTimeout(t1);
    }, []);

    return (
        <>

            <div className="ap" style={{ opacity: show ? 1 : 0, transition: 'opacity .4s' }}>
                <a href="#main-content" className="skip-to-content">Skip to main content</a>
                <div className="ap-noise" aria-hidden="true" />
                
                <PublicNav active="announcements" subtitle="Announcements" />

                <div id="main-content" className="ap-inner">
                    <div
                        className="ap-honors-banner"
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate('/latin-honors')}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/latin-honors'); } }}
                        style={{ marginTop: '1.5rem' }}
                    >
                        <div className="ap-honors-icon">👑</div>
                        <div className="ap-honors-text">
                            <div className="ap-honors-head">Wall of Excellence — Latin Honors</div>
                            <div className="ap-honors-sub">View Summa, Magna &amp; Cum Laude awardees across all departments</div>
                        </div>
                        <div className="ap-honors-arrow">→</div>
                    </div>

                    <div className="ap-hero">
                        <div className="ap-hero-indicator">
                            <div className="ap-indicator-ring">
                                <div className="ap-ring-outer" />
                                <div className="ap-ring-inner" />
                                <div className="ap-ring-dot">
                                    <div className="ap-ring-dot-core" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
                                </div>
                            </div>
                        </div>
                        <div className="ap-hero-text">
                            <div className="ap-hero-label">Official Bulletins</div>
                            <h1 className="ap-hero-h1">System Updates</h1>
                            <p className="ap-hero-sub">
                                Stay informed about enrollment window changes, system protocols, and maintenance schedules. Monitored directly by the CCIS Administration.
                            </p>
                        </div>
                    </div>

                    <div className="ap-timeline" aria-live="polite" aria-atomic="false">
                        {loading ? (
                            <div className="ap-empty">Loading communications channel...</div>
                        ) : announcements.length === 0 ? (
                            <div className="ap-empty">No active announcements at this time.</div>
                        ) : (
                            announcements.map((inc, i) => {
                                const bd = getBadgeStyle(inc.type);
                                return (
                                    <div key={inc.id || i} className="ap-timeline-item" style={{ animationDelay: `${.2 + i * .08}s` }}>
                                        <div className="ap-tl-left">
                                            <div className="ap-tl-dot" style={{ borderColor: bd.dot, background: `${bd.dot}22` }} />
                                            <div className="ap-tl-line" />
                                        </div>
                                        <div className="ap-tl-body">
                                            <div className="ap-tl-date">{inc.created_at}</div>
                                            <div className="ap-tl-title">{inc.title}</div>
                                            <div className="ap-tl-body-text">{inc.body}</div>
                                            <span className="ap-tl-badge" style={{ background: bd.bg, border: `1px solid ${bd.border}`, color: bd.color }}>
                                                <div style={{ width: 5, height: 5, borderRadius: '50%', background: bd.dot }} />
                                                {bd.label}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
                <PublicFooter />
            </div>
        </>
    );
};

export default Announcements;
