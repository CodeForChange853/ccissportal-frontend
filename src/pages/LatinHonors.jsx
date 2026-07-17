import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGlobalHonors, getDepartmentHonors, getRunningHonors, rateStudent } from '../api/honorsApi';
import '../styles/components/latin-honors.css';

const getRaterToken = () => {
    let t = sessionStorage.getItem('nx_rater_token');
    if (!t) {
        t = (typeof crypto !== 'undefined' && crypto.randomUUID)
            ? crypto.randomUUID()
            : Math.random().toString(36).slice(2) + Date.now().toString(36);
        sessionStorage.setItem('nx_rater_token', t);
    }
    return t;
};



const getInitials = (name) =>
    name.trim().split(/\s+/).slice(0, 2).map(n => n[0]?.toUpperCase() || '').join('');

// ── Crown SVGs — three distinct shapes ─────────────────────────────────────

/* Summa: Imperial arch crown — dome + crossing arch bands + orb at top */
const CrownSumma = () => (
    <svg width="64" height="48" viewBox="0 0 64 48" fill="none">
        <defs>
            <filter id="cgs" x="-28%" y="-28%" width="156%" height="156%">
                <feGaussianBlur stdDeviation="2.5" result="b"/>
                <feFlood floodColor="#FFD700" floodOpacity=".65" result="c"/>
                <feComposite in="c" in2="b" operator="in" result="s"/>
                <feMerge><feMergeNode in="s"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
        </defs>
        {/* Base band */}
        <rect x="3" y="39" width="58" height="8" rx="4" fill="#FFD700" opacity=".95" filter="url(#cgs)"/>
        {/* Crown body */}
        <path d="M3 39 L3 27 L12 15 L19 23 L27 6 L32 0 L37 6 L45 23 L52 15 L61 27 L61 39Z"
            fill="rgba(255,215,0,.08)" stroke="#FFD700" strokeWidth="2.2"
            strokeLinecap="round" strokeLinejoin="round" filter="url(#cgs)"/>
        {/* Arch band — the imperial distinguishing feature */}
        <path d="M3 27 Q32 43 61 27"
            stroke="#FFD700" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity=".5"/>
        {/* Cross-arch (secondary) */}
        <path d="M12 15 Q32 34 52 15"
            stroke="#FFD700" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity=".3"/>
        {/* Top orb */}
        <circle cx="32" cy="0" r="6" fill="#FFD700" filter="url(#cgs)"/>
        <circle cx="32" cy="-0.5" r="2.2" fill="white" opacity=".8"/>
        {/* Upper gem pair */}
        <circle cx="27" cy="6" r="4" fill="#FFD700" opacity=".9" filter="url(#cgs)"/>
        <circle cx="37" cy="6" r="4" fill="#FFD700" opacity=".9" filter="url(#cgs)"/>
        <circle cx="27" cy="5.2" r="1.4" fill="white" opacity=".72"/>
        <circle cx="37" cy="5.2" r="1.4" fill="white" opacity=".72"/>
        {/* Outer shoulder gems */}
        <circle cx="12" cy="15" r="3.2" fill="#FFD700" opacity=".78"/>
        <circle cx="52" cy="15" r="3.2" fill="#FFD700" opacity=".78"/>
        {/* Base band jewels */}
        <circle cx="17" cy="43" r="2.4" fill="rgba(255,255,255,.52)"/>
        <circle cx="32" cy="43" r="2.8" fill="rgba(255,255,255,.64)"/>
        <circle cx="47" cy="43" r="2.4" fill="rgba(255,255,255,.52)"/>
    </svg>
);

/* Magna: Classic 5-point zigzag crown with diamond peak embellishments */
const CrownMagna = () => (
    <svg width="52" height="40" viewBox="0 0 52 40" fill="none">
        <defs>
            <filter id="cgm" x="-28%" y="-28%" width="156%" height="156%">
                <feGaussianBlur stdDeviation="2" result="b"/>
                <feFlood floodColor="#C8B560" floodOpacity=".6" result="c"/>
                <feComposite in="c" in2="b" operator="in" result="s"/>
                <feMerge><feMergeNode in="s"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
        </defs>
        {/* Base band */}
        <rect x="3" y="33" width="46" height="6.5" rx="3.25" fill="#C8B560" opacity=".92" filter="url(#cgm)"/>
        {/* Crown zigzag silhouette */}
        <path d="M3 33 L3 22 L11 10 L19 20 L26 4 L33 20 L41 10 L49 22 L49 33Z"
            fill="rgba(200,181,96,.08)" stroke="#C8B560" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" filter="url(#cgm)"/>
        {/* Diamond at center peak */}
        <path d="M26 4 L29.5 9 L26 14 L22.5 9 Z" fill="#C8B560" opacity=".92"/>
        <circle cx="26" cy="4" r="2.8" fill="#C8B560" filter="url(#cgm)"/>
        <circle cx="26" cy="3.4" r="1" fill="white" opacity=".68"/>
        {/* Diamond at left peak */}
        <path d="M11 10 L13.8 14 L11 18 L8.2 14 Z" fill="#C8B560" opacity=".76"/>
        {/* Diamond at right peak */}
        <path d="M41 10 L43.8 14 L41 18 L38.2 14 Z" fill="#C8B560" opacity=".76"/>
        {/* Small accent dots at mid points */}
        <circle cx="19" cy="20" r="2" fill="#C8B560" opacity=".6"/>
        <circle cx="33" cy="20" r="2" fill="#C8B560" opacity=".6"/>
        {/* Base jewels */}
        <circle cx="14" cy="36.5" r="2" fill="rgba(255,255,255,.46)"/>
        <circle cx="26" cy="36.5" r="2.2" fill="rgba(255,255,255,.56)"/>
        <circle cx="38" cy="36.5" r="2" fill="rgba(255,255,255,.46)"/>
    </svg>
);

/* Cum Laude: Laurel wreath — olive branch motif (distinct from both crown shapes above) */
const CrownCum = () => (
    <svg width="46" height="32" viewBox="0 0 46 32" fill="none">
        <defs>
            <filter id="cgc" x="-28%" y="-28%" width="156%" height="156%">
                <feGaussianBlur stdDeviation="1.5" result="b"/>
                <feFlood floodColor="#CD9B5A" floodOpacity=".5" result="c"/>
                <feComposite in="c" in2="b" operator="in" result="s"/>
                <feMerge><feMergeNode in="s"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
        </defs>
        {/* Left stem */}
        <path d="M11 30 Q9 22 11 16 Q9 11 11 7 Q10 3.5 12 1"
            stroke="#CD9B5A" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
        {/* Right stem */}
        <path d="M35 30 Q37 22 35 16 Q37 11 35 7 Q36 3.5 34 1"
            stroke="#CD9B5A" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
        {/* Left leaves — bottom */}
        <ellipse cx="7.5" cy="22" rx="4.8" ry="2.4" fill="#CD9B5A" opacity=".68" transform="rotate(-28 7.5 22)"/>
        {/* Left leaves — mid */}
        <ellipse cx="8.5" cy="14.5" rx="4.4" ry="2.2" fill="#CD9B5A" opacity=".68" transform="rotate(-38 8.5 14.5)"/>
        {/* Left leaves — top */}
        <ellipse cx="11.5" cy="7" rx="3.8" ry="2" fill="#CD9B5A" opacity=".7" transform="rotate(-52 11.5 7)"/>
        {/* Right leaves — bottom */}
        <ellipse cx="38.5" cy="22" rx="4.8" ry="2.4" fill="#CD9B5A" opacity=".68" transform="rotate(28 38.5 22)"/>
        {/* Right leaves — mid */}
        <ellipse cx="37.5" cy="14.5" rx="4.4" ry="2.2" fill="#CD9B5A" opacity=".68" transform="rotate(38 37.5 14.5)"/>
        {/* Right leaves — top */}
        <ellipse cx="34.5" cy="7" rx="3.8" ry="2" fill="#CD9B5A" opacity=".7" transform="rotate(52 34.5 7)"/>
        {/* Base ribbon tie */}
        <path d="M14 30 Q23 27 32 30" stroke="#CD9B5A" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
        {/* Center star */}
        <circle cx="23" cy="1" r="3.2" fill="#CD9B5A" filter="url(#cgc)"/>
        <circle cx="23" cy=".4" r="1.1" fill="white" opacity=".62"/>
    </svg>
);

// ── Star Rater ──────────────────────────────────────────────────────────────

const StarRater = ({ studentId, avgRating, ratingCount, starColor }) => {
    const [hovered, setHovered]       = useState(0);
    const [myRating, setMyRating]     = useState(() => parseInt(sessionStorage.getItem(`nx_r_${studentId}`) || '0', 10));
    const [submitting, setSubmitting] = useState(false);
    const [localAvg, setLocalAvg]     = useState(avgRating);
    const [localCount, setLocalCount] = useState(ratingCount);

    const handleRate = async (star) => {
        if (submitting) return;
        setSubmitting(true);
        const prev = myRating;
        setMyRating(star);
        try {
            const res = await rateStudent(studentId, getRaterToken(), star);
            sessionStorage.setItem(`nx_r_${studentId}`, String(star));
            setLocalAvg(res.avg_rating);
            setLocalCount(res.rating_count);
        } catch {
            setMyRating(prev);
        } finally {
            setSubmitting(false);
        }
    };

    const display = hovered || myRating;
    return (
        <div className="lh-stars">
            <div className="lh-stars-row">
                {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} className="lh-star-btn"
                        onClick={() => handleRate(star)}
                        onMouseEnter={() => setHovered(star)}
                        onMouseLeave={() => setHovered(0)}
                        style={{
                            color: star <= display ? (myRating > 0 ? starColor : '#FFC840') : '#2A2520',
                            transform: star <= display ? 'scale(1.2)' : 'scale(1)',
                        }}
                        title={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                    >★</button>
                ))}
            </div>
            <div className="lh-stars-meta">
                {localAvg.toFixed(1)} · {localCount} {localCount === 1 ? 'supporter' : 'supporters'}
            </div>
        </div>
    );
};

// ── Card: Summa Cum Laude — Horizontal Feature Card ─────────────────────────

const SummaCard = ({ student, index }) => (
    <div className="lh-card-summa" style={{ animationDelay: `${index * 0.08}s` }}>
        <div className="lh-cs-left-bar" />
        <div className="lh-cs-shine" />

        {/* Left: avatar + crown */}
        <div className="lh-cs-avatar-col">
            <div className="lh-cs-crown-wrap"><CrownSumma /></div>
            <div className="lh-cs-avatar">{getInitials(student.full_name)}</div>
        </div>

        {/* Right: all content */}
        <div className="lh-cs-content">
            <div className="lh-cs-top">
                <div className="lh-cs-badge">
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#FFD700', display: 'inline-block', boxShadow: '0 0 6px #FFD700' }} />
                    Summa Cum Laude
                </div>
                <StarRater
                    studentId={student.student_account_id}
                    avgRating={student.avg_rating}
                    ratingCount={student.rating_count}
                    starColor="#FFD700"
                />
            </div>
            <div className="lh-cs-name">{student.full_name}</div>
            <div className="lh-cs-course">{student.course} · Year {student.year_level}</div>
            <div className="lh-cs-gwa-pill">
                <div className="lh-cs-gwa-n">{student.gwa.toFixed(2)}</div>
                <div className="lh-cs-gwa-l">GWA</div>
            </div>
            {student.dean_note && (
                <div className="lh-cs-note">&quot;{student.dean_note}&quot;</div>
            )}
        </div>
    </div>
);

// ── Card: Magna Cum Laude — Premium Vertical Card ───────────────────────────

const MagnaCard = ({ student, index }) => (
    <div className="lh-card-magna" style={{ animationDelay: `${index * 0.07}s` }}>
        <div className="lh-cm-bar" />

        {/* Hero: crown + double-orbit avatar + badge */}
        <div className="lh-cm-hero">
            <div className="lh-cm-crown-wrap"><CrownMagna /></div>
            <div className="lh-cm-avatar-ring">
                <div className="lh-cm-avatar">{getInitials(student.full_name)}</div>
            </div>
            <div className="lh-cm-badge">
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#C8B560', display: 'inline-block' }} />
                Magna Cum Laude
            </div>
        </div>

        {/* Content */}
        <div className="lh-cm-content">
            <div className="lh-cm-name">{student.full_name}</div>
            <div className="lh-cm-course">{student.course} · Year {student.year_level}</div>
            <div className="lh-cm-gwa">GWA {student.gwa.toFixed(2)}</div>
            <div className="lh-cm-stars-wrap">
                <StarRater
                    studentId={student.student_account_id}
                    avgRating={student.avg_rating}
                    ratingCount={student.rating_count}
                    starColor="#C8B560"
                />
            </div>
        </div>

        {student.dean_note && (
            <div className="lh-cm-note">&quot;{student.dean_note}&quot;</div>
        )}
    </div>
);

// ── Card: Cum Laude — Refined Horizontal + Dean's Note ──────────────────────

const CumCard = ({ student, index }) => (
    <div className="lh-card-cum" style={{ animationDelay: `${index * 0.05}s` }}>
        <div className="lh-cc-row">
            <div className="lh-cc-accent" />
            <div className="lh-cc-left">
                <div className="lh-cc-crown-wrap"><CrownCum /></div>
                <div className="lh-cc-avatar">{getInitials(student.full_name)}</div>
            </div>
            <div className="lh-cc-info">
                <div className="lh-cc-tier">Cum Laude</div>
                <div className="lh-cc-name">{student.full_name}</div>
                <div className="lh-cc-course">{student.course} · Year {student.year_level}</div>
                <div className="lh-cc-stats">
                    <div>
                        <div className="lh-cc-stat-n">{student.gwa.toFixed(2)}</div>
                        <div className="lh-cc-stat-l">GWA</div>
                    </div>
                    <div>
                        <div className="lh-cc-stat-n">{student.rating_count}</div>
                        <div className="lh-cc-stat-l">Support</div>
                    </div>
                </div>
            </div>
            <div className="lh-cc-stars">
                <StarRater
                    studentId={student.student_account_id}
                    avgRating={student.avg_rating}
                    ratingCount={student.rating_count}
                    starColor="#CD9B5A"
                />
            </div>
        </div>
        {student.dean_note && (
            <div className="lh-cc-note" style={{ paddingLeft: '2rem' }}>{student.dean_note}”</div>
        )}
    </div>
);

// ── Tier section wrapper ────────────────────────────────────────────────────

const TierSection = ({ tier, students, animDelay }) => {
    const config = {
        SUMMA_CUM_LAUDE: { label: 'Summa Cum Laude', color: '#FFD700', Grid: ({ students }) => (
            <div className="lh-grid-summa">
                {students.map((s, i) => <SummaCard key={s.student_account_id} student={s} index={i} />)}
            </div>
        )},
        MAGNA_CUM_LAUDE: { label: 'Magna Cum Laude', color: '#C8B560', Grid: ({ students }) => (
            <div className="lh-grid-magna">
                {students.map((s, i) => <MagnaCard key={s.student_account_id} student={s} index={i} />)}
            </div>
        )},
        CUM_LAUDE: { label: 'Cum Laude', color: '#CD9B5A', Grid: ({ students }) => (
            <div className="lh-grid-cum">
                {students.map((s, i) => <CumCard key={s.student_account_id} student={s} index={i} />)}
            </div>
        )},
    };

    const { label, color, Grid } = config[tier];

    return (
        <div className="lh-section" style={{ animationDelay: `${animDelay}s` }}>
            <div className="lh-section-head">
                <div className="lh-section-title" style={{ color }}>{label}</div>
                <div className="lh-section-ct">{students.length} {students.length === 1 ? 'awardee' : 'awardees'}</div>
                <div className="lh-section-line" />
            </div>
            {students.length === 0
                ? <div className="lh-empty">◦ No {label} awardees in this view</div>
                : <Grid students={students} />
            }
        </div>
    );
};

// ── Running for Honors row ──────────────────────────────────────────────────

const RunningRow = ({ student, index }) => {
    const isS = student.gwa <= 1.20;
    const isM = student.gwa <= 1.45;
    const color   = isS ? '#FFD700' : isM ? '#C8B560' : '#CD9B5A';
    const colorBg = isS ? 'rgba(255,215,0,.05)' : isM ? 'rgba(200,181,96,.05)' : 'rgba(205,155,90,.05)';
    const label   = isS ? '→ SUMMA' : isM ? '→ MAGNA' : '→ CUM LAUDE';
    const pct     = isS ? Math.min(99, ((1.20 - student.gwa) / 0.20) * 100 + 70)
                  : isM ? Math.min(99, ((1.45 - student.gwa) / 0.25) * 100 + 40)
                  :        Math.min(99, ((1.75 - student.gwa) / 0.30) * 100 + 10);

    return (
        <div className="lh-running-row" style={{ animation: `lh-fade-up .4s ease ${index * 0.05}s both` }}>
            <div className="lh-rr-idx">{String(index + 1).padStart(2, '0')}</div>
            <div>
                <div className="lh-rr-name">{student.full_name}</div>
                <div className="lh-rr-course">{student.course} · Year {student.year_level}</div>
            </div>
            <div className="lh-rr-bar-wrap">
                <div className="lh-rr-bar-track">
                    <div className="lh-rr-bar-fill" style={{ '--w': `${pct.toFixed(0)}%`, width: `${pct.toFixed(0)}%`, background: color }} />
                </div>
                <div className="lh-rr-bar-label">GWA {student.gwa.toFixed(2)}</div>
            </div>
            <div className="lh-rr-projected" style={{ color, borderColor: `${color}28`, background: colorBg }}>{label}</div>
        </div>
    );
};

// ── Main page ───────────────────────────────────────────────────────────────

const LatinHonors = () => {
    const navigate = useNavigate();
    const [show, setShow]               = useState(false);
    const [loading, setLoading]         = useState(true);
    const [activeDept, setActiveDept]   = useState('__global__');
    const [data, setData]               = useState({ summa: [], magna: [], cum_laude: [], departments: [] });
    const [running, setRunning]         = useState([]);
    const [deptLoading, setDeptLoading] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setShow(true), 60);
        Promise.all([getGlobalHonors(), getRunningHonors()])
            .then(([honorsData, runningData]) => {
                setData(honorsData);
                setRunning(runningData);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
        return () => clearTimeout(t);
    }, []);

    const handleDeptChange = useCallback(async (dept) => {
        if (dept === activeDept) return;
        setActiveDept(dept);
        setDeptLoading(true);
        try {
            if (dept === '__global__') {
                setData(await getGlobalHonors());
            } else {
                const d = await getDepartmentHonors(dept);
                setData(prev => ({ ...d, departments: prev.departments }));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setDeptLoading(false);
        }
    }, [activeDept]);

    const total = data.summa.length + data.magna.length + data.cum_laude.length;

    return (
        <>

            <div className="lh-page" style={{ opacity: show ? 1 : 0, transition: 'opacity .4s' }}>

                {/* Background layers */}
                <div className="lh-bg-base" />
                <div className="lh-bg-orb-a" />
                <div className="lh-bg-orb-b" />
                <div className="lh-bg-shimmer" />
                <div className="lh-bg-noise" />

                {/* Topbar */}
                <div className="lh-topbar">
                    <button className="lh-brand" onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit', color: 'inherit' }}>
                        <div className="lh-logo">N</div>
                        <span className="lh-brand-name">NexEnroll <em>Wall of Excellence</em></span>
                    </button>
                    <button className="lh-nav-btn" onClick={() => navigate('/announcements')}>← Announcements</button>
                </div>

                {/* Hero */}
                <div className="lh-inner">
                    <div className="lh-hero">
                        <div className="lh-hero-eyebrow">CCIS Academic Honors · {new Date().getFullYear()}</div>
                        <h1 className="lh-hero-title">Wall of<br /><em>Excellence</em></h1>
                        <div className="lh-hero-rule" />
                        <div className="lh-hero-stats">
                            <div className="lh-hero-stat">
                                <div className="lh-hero-stat-n">{data.summa.length}</div>
                                <div className="lh-hero-stat-l">Summa</div>
                            </div>
                            <div className="lh-hero-stat-div" />
                            <div className="lh-hero-stat">
                                <div className="lh-hero-stat-n">{data.magna.length}</div>
                                <div className="lh-hero-stat-l">Magna</div>
                            </div>
                            <div className="lh-hero-stat-div" />
                            <div className="lh-hero-stat">
                                <div className="lh-hero-stat-n">{data.cum_laude.length}</div>
                                <div className="lh-hero-stat-l">Cum Laude</div>
                            </div>
                            <div className="lh-hero-stat-div" />
                            <div className="lh-hero-stat">
                                <div className="lh-hero-stat-n">{total}</div>
                                <div className="lh-hero-stat-l">Total Awardees</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dept tab rail */}
                <div className="lh-tabs">
                    <div className="lh-tabs-inner">
                        <button
                            className={`lh-tab${activeDept === '__global__' ? ' active' : ''}`}
                            onClick={() => handleDeptChange('__global__')}
                        >◆ All Departments</button>
                        {data.departments.map(dept => (
                            <button
                                key={dept}
                                className={`lh-tab${activeDept === dept ? ' active' : ''}`}
                                onClick={() => handleDeptChange(dept)}
                            >{dept}</button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="lh-inner" style={{ paddingTop: '2.5rem' }} aria-live="polite" aria-atomic="false">
                    {loading ? (
                        <div className="lh-loading">LOADING HONOR ROLL...</div>
                    ) : deptLoading ? (
                        <div className="lh-loading">FILTERING...</div>
                    ) : total === 0 ? (
                        <div className="lh-loading" style={{ color: '#3A3530' }}>No honors awardees found for this selection.</div>
                    ) : (
                        <>
                            <TierSection tier="SUMMA_CUM_LAUDE" students={data.summa}     animDelay={0.1} />
                            <TierSection tier="MAGNA_CUM_LAUDE" students={data.magna}     animDelay={0.2} />
                            <TierSection tier="CUM_LAUDE"       students={data.cum_laude} animDelay={0.3} />
                        </>
                    )}

                    {/* Running for Honors */}
                    {!loading && running.length > 0 && (
                        <div className="lh-section" style={{ animationDelay: '.4s' }}>
                            <div className="lh-section-head">
                                <div className="lh-section-title" style={{ color: 'rgba(186,151,49,.65)' }}>Running for Honors</div>
                                <div className="lh-section-ct">{running.length} students</div>
                                <div className="lh-section-line" />
                            </div>
                            <div className="lh-running">
                                <div className="lh-running-head">
                                    <div className="lh-running-title">Future Excellence</div>
                                    <div className="lh-running-sub">1st–3rd year · on-track students</div>
                                </div>
                                {running.map((s, i) => (
                                    <RunningRow key={`${s.full_name}-${i}`} student={s} index={i} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default LatinHonors;
