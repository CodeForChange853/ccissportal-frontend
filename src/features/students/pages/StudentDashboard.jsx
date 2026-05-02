// frontend/src/features/student/pages/StudentDashboard.jsx
// PHASE 4 FSD REFACTOR:
//   - Replaces pages/StudentDashboard.jsx (was 38,063 bytes)
//   - This smart page handles state + fetching only
//   - All rendering delegated to focused components:
//       GWABlock, GradesTab, CorUploadTab
//   - Schedule and EnrollmentStatus remain inline (simple enough to not warrant splitting)
//   - All client.get calls replaced with studentApi

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import Toast from '../../../components/ui/Toast';
import { studentApi } from '../api/studentApi';
import GWABlock, { computeGWA, gwaLabel } from '../components/GWABlock';
import GradesTab from '../components/GradesTab';
import CorUploadTab from '../components/CorUploadTab';
import SmartEnrollmentTab from '../components/SmartEnrollmentTab';
import SupportAssistantTab from '../components/SupportAssistantTab';
import {
    OverviewIcon, CurriculumIcon, GradebookIcon,
    AdmissionsIcon, ShieldIcon, SupportIcon
} from '../../../components/icons';
import {
    Chart as ChartJS, CategoryScale, LinearScale,
    PointElement, LineElement, Filler, Tooltip,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const TABS = [
    { id: 'home', icon: <OverviewIcon />, label: 'Overview' },
    { id: 'sched', icon: <CurriculumIcon />, label: 'Schedule' },
    { id: 'grades', icon: <GradebookIcon />, label: 'Grades' },
    { id: 'enrollment', icon: <AdmissionsIcon />, label: 'Smart Enroll' },
    { id: 'status', icon: <ShieldIcon />, label: 'Status' },
    { id: 'support', icon: <SupportIcon />, label: 'Support' },
];

const StatMini = ({ icon, label, value, unit, color = 'var(--accent)' }) => (
    <div
        className="flex flex-col items-center gap-0.5 px-2 py-3 rounded-xl flex-1 min-w-0"
        style={{ background: 'rgba(0,201,177,0.06)', border: `1px solid ${color}22` }}
    >
        {icon && <span className="text-base mb-0.5">{icon}</span>}
        <span className="text-base font-black text-white leading-none">{value}</span>
        <span className="text-[9px] uppercase tracking-wider font-semibold" style={{ color }}>{label}</span>
        {unit && <span className="text-[9px] text-slate-600">{unit}</span>}
    </div>
);

const Block = ({ children, className = '', style = {} }) => (
    <div
        className={`rounded-2xl ${className}`}
        style={{ background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.06)', ...style }}
    >
        {children}
    </div>
);

const BottomNavItem = ({ icon, label, active, onClick }) => (
    <button onClick={onClick} className="flex-1 flex flex-col items-center justify-center py-3 gap-1 relative text-[#94a3b8]">
        {active && <div className="absolute top-0 w-8 h-1 rounded-b-full" style={{ background: 'var(--accent)' }} />}
        <span className="w-5 h-5 flex items-center justify-center opacity-90 transition-transform duration-300"
            style={{ filter: active ? 'drop-shadow(0 0 8px var(--accent))' : 'none', transform: active ? 'scale(1.15) translateY(-2px)' : 'scale(1)', color: active ? 'var(--accent)' : 'inherit' }}>
            {icon}
        </span>
        <span className="text-[10px] font-bold tracking-wide"
            style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }}>
            {label}
        </span>
    </button>
);

const StudentDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [grades, setGrades] = useState([]);
    const [schedule, setSchedule] = useState([]);
    const [enrollment, setEnrollment] = useState([]);
    const [academicStanding, setAcademicStanding] = useState(null);
    const [tab, setTab] = useState('home');
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [clearanceModal, setClearanceModal] = useState(false);

    const showToast = (msg, type = 'success') => setToast({ message: msg, type });

    const fetchAll = async () => {
        setLoading(true);
        try { setProfile(await studentApi.fetchProfile()); }
        catch { showToast('Could not load profile.', 'error'); }
        try { setGrades(await studentApi.fetchGrades()); } catch { /* silent */ }
        try { setSchedule(await studentApi.fetchSchedule()); } catch { /* silent */ }
        try { setEnrollment(await studentApi.fetchEnrollmentStatus()); } catch { /* silent */ }
        try { setAcademicStanding(await studentApi.fetchAcademicStanding()); } catch { /* silent */ }
        setLoading(false);
    };

    useEffect(() => { fetchAll(); }, []);

    // ── Derived stats (useMemo prevents recompute on every render) ──
    const gwa = useMemo(() => computeGWA(grades), [grades]);
    const gwaMeta = useMemo(() => gwaLabel(gwa), [gwa]);

    const { earned, enrolled: enrolledUnits, passed, failed, cleared, gwaHistory, sparkData } =
        useMemo(() => {
            const earned = grades.filter(g => g.completion_status === 'PASSED').reduce((s, g) => s + (g.units || 3), 0);
            const enrolledUnits = grades.filter(g => g.completion_status === 'ENROLLED').reduce((s, g) => s + (g.units || 3), 0);
            const passed = grades.filter(g => g.completion_status === 'PASSED').length;
            const failed = grades.filter(g => g.completion_status === 'FAILED').length;
            const cleared = profile?.clearance?.status === 'CLEARED';

            const bySem = {};
            grades
                .filter(g => g.final_grade && g.final_grade !== 'N/A' && g.completion_status !== 'ENROLLED')
                .forEach(g => {
                    if (!bySem[g.semester]) bySem[g.semester] = [];
                    bySem[g.semester].push({ grade: parseFloat(g.final_grade), units: g.units || 3 });
                });
            const gwaHistory = Object.entries(bySem)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([sem, arr]) => {
                    const pts = arr.reduce((s, x) => s + x.grade * x.units, 0);
                    const u = arr.reduce((s, x) => s + x.units, 0);
                    return { sem, gwa: u > 0 ? (pts / u).toFixed(2) : null };
                })
                .filter(x => x.gwa);
            const sparkData = gwaHistory.map(x => parseFloat(x.gwa));
            return { earned, enrolledUnits, passed, failed, cleared, gwaHistory, sparkData };
        }, [grades, profile]);

    const activeSchedule = useMemo(() => {
        if (!schedule || schedule.length === 0) return null;
        // Mock active schedule item as the first one for the "Next Class" widget
        return schedule[0];
    }, [schedule]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center"
            style={{ background: 'linear-gradient(160deg,#12142a 0%,#1a1c34 100%)' }}>
            <div className="text-center">
                <div className="w-10 h-10 rounded-full mx-auto mb-4 animate-spin border-4"
                    style={{ borderColor: 'rgba(0,201,177,0.2)', borderTopColor: 'var(--accent)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--accent)' }}>Loading…</p>
            </div>
        </div>
    );

    if (!profile) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#12142a' }}>
            <Block className="p-8 text-center max-w-xs mx-4">
                <p className="text-white font-medium mb-4 text-sm">Could not load your profile.</p>
                <button onClick={fetchAll} className="px-5 py-2 rounded-full text-white font-bold text-sm"
                    style={{ background: 'var(--accent)' }}>Retry</button>
            </Block>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col relative"
            style={{ background: 'linear-gradient(160deg,#12142a 0%,#181a32 60%,#12142a 100%)' }}>
            <div className="fixed inset-0 pointer-events-none opacity-[0.04]"
                style={{ backgroundImage: 'radial-gradient(rgba(0,201,177,0.8) 1px,transparent 1px)', backgroundSize: '28px 28px' }} />

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="flex flex-1 min-h-0 max-w-5xl w-full mx-auto">

                {/* Desktop sidebar */}
                <div className="hidden lg:flex w-52 flex-shrink-0 flex-col pt-6 pl-4 pr-2 border-r border-white/5">
                    <div className="flex items-center gap-3 mb-8 px-2">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-base flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, var(--accent), #6366f1)' }}>
                            {profile.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-white font-bold text-sm truncate">{profile.name?.split(' ')[0]}</p>
                            <p className="text-[10px] font-mono truncate" style={{ color: 'var(--accent)' }}>{profile.course}</p>
                        </div>
                    </div>
                    <nav className="flex-1 space-y-0.5">
                        {TABS.map(t => (
                            <button key={t.id} onClick={() => setTab(t.id)}
                                className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2.5 transition-all"
                                style={tab === t.id
                                    ? { background: 'rgba(0,201,177,0.15)', color: 'var(--accent)', borderLeft: '3px solid var(--accent)', paddingLeft: '9px' }
                                    : { color: '#475569', borderLeft: '3px solid transparent' }}>
                                <span className="w-4 h-4 flex shrink-0 items-center justify-center">{t.icon}</span><span>{t.label}</span>
                            </button>
                        ))}
                    </nav>
                    <div className="pb-6 px-2">
                        <button onClick={() => setTab('support')} className="w-full text-left text-xs py-2 px-3 rounded-xl text-slate-600 hover:text-white transition-colors">Support Center</button>
                        <button onClick={logout} className="w-full text-left text-xs py-2 px-3 rounded-xl text-slate-600 hover:text-rose-400 transition-colors">Sign out</button>
                    </div>
                </div>

                {/* Scroll area */}
                <div className="flex-1 overflow-y-auto pb-20 lg:pb-6">
                    <div className="flex items-center justify-between px-4 pt-5 pb-3 lg:px-6">
                        <div>
                            <p className="text-xs font-mono text-slate-500">
                                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                            <h1 className="text-base font-black text-white mt-0.5">
                                {TABS.find(t => t.id === tab)?.label}
                            </h1>
                        </div>
                        <div className="flex items-center gap-2 lg:hidden">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm"
                                style={{ background: 'linear-gradient(135deg, var(--accent), #6366f1)' }}>
                                {profile.name?.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>

                    <div className="px-4 lg:px-6">

                        {/* HOME */}
                        {tab === 'home' && (
                            <div className="space-y-4">
                                <GWABlock
                                    profile={profile} gwa={gwa} gwaMeta={gwaMeta}
                                    sparkData={sparkData} cleared={cleared}
                                />
                                {activeSchedule && (
                                    <Block className="p-4" style={{ background: 'linear-gradient(135deg, rgba(0,201,177,0.1), rgba(0,201,177,0.02))', borderColor: 'rgba(0,201,177,0.2)' }}>
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 text-teal-400">Next Class</p>
                                            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-900/30 px-2 py-0.5 rounded-full">{activeSchedule.time !== 'TBA' ? activeSchedule.time : 'TBA'}</span>
                                        </div>
                                        <h3 className="text-sm font-bold text-white mb-1.5 leading-tight">{activeSchedule.title}</h3>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-slate-400 flex items-center gap-1"><span className="text-sm">🚪</span>{activeSchedule.room !== 'TBA' ? activeSchedule.room : 'Room TBA'}</span>
                                            <span className="text-xs text-slate-400 flex items-center gap-1"><span className="text-sm">👨‍🏫</span>{activeSchedule.instructor || 'TBA'}</span>
                                        </div>
                                    </Block>
                                )}
                                <Block className="p-4">
                                    <p className="text-[10px] uppercase tracking-wider font-semibold mb-3 text-slate-500">Academic Stats</p>
                                    <div className="flex gap-2">
                                        <StatMini icon="📘" label="Earned" value={earned} unit="units" color="var(--accent)" />
                                        <StatMini icon="📗" label="This Sem" value={enrolledUnits} unit="units" color="#22d3ee" />
                                        <StatMini icon="✅" label="Passed" value={passed} unit="subjs" color="#10b981" />
                                    </div>
                                </Block>
                                <div className="grid grid-cols-2 gap-3">
                                    <Block className="p-4 relative cursor-pointer hover:bg-white/[0.02] transition-colors" onClick={() => setClearanceModal(true)}>
                                        <p className="text-xs font-bold text-white mb-1">Clearance</p>
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-xl font-black leading-none"
                                                style={{ color: cleared ? 'var(--accent)' : '#fbbf24' }}>
                                                {cleared ? 'Clear' : 'Pending'}
                                            </p>
                                            <span className="text-[10px] text-slate-500 underline decoration-dotted">Details</span>
                                        </div>
                                        {failed > 0 && (
                                            <p className="text-[9px] text-rose-400 font-mono mt-1">
                                                {failed} failed subject{failed > 1 ? 's' : ''}
                                            </p>
                                        )}
                                    </Block>
                                    <Block className="p-4">
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Quick Actions</p>
                                        <button onClick={() => setTab('enrollment')}
                                            className="w-full py-2 rounded-xl text-xs font-bold text-white mb-2"
                                            style={{ background: 'var(--accent)', color: 'var(--bg-base)' }}>
                                            Smart Enroll
                                        </button>
                                        <button onClick={() => setTab('support')}
                                            className="w-full py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                                            style={{ background: 'rgba(255,255,255,0.05)' }}>
                                            Support
                                        </button>
                                    </Block>
                                </div>
                            </div>
                        )}

                        {/* SCHEDULE */}
                        {tab === 'sched' && (
                            <div className="space-y-3">
                                {schedule.length > 0 ? schedule.map((sub, i) => (
                                    <Block key={i} className="p-4 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold font-mono flex-shrink-0"
                                            style={{ background: 'rgba(0,201,177,0.12)', color: 'var(--accent)', border: '1px solid rgba(0,201,177,0.25)' }}>
                                            {sub.code?.split(/\d/)[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <p className="font-bold text-white text-sm truncate">{sub.code}</p>
                                                <span className="text-[10px] font-mono flex-shrink-0 ml-2" style={{ color: 'var(--accent)' }}>
                                                    {sub.time !== 'TBA' ? sub.time : 'TBA'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 truncate mt-0.5">{sub.title}</p>
                                            <p className="text-[10px] text-slate-600 mt-0.5">
                                                {sub.room !== 'TBA' ? sub.room : 'Room TBA'}
                                            </p>
                                        </div>
                                    </Block>
                                )) : (
                                    <Block className="p-10 text-center">
                                        <p className="text-slate-500 text-sm">No enrolled subjects this semester.</p>
                                    </Block>
                                )}
                            </div>
                        )}

                        {/* GRADES */}
                        {tab === 'grades' && (
                            <GradesTab
                                        grades={grades} gwa={gwa} gwaMeta={gwaMeta}
                                        passed={passed} failed={failed} earned={earned}
                                        academicStanding={academicStanding}
                                    />
                                )}
        
                                {/* SMART ENROLLMENT */}
                                {tab === 'enrollment' && (
                                    <SmartEnrollmentTab
                                        academicStanding={academicStanding}
                                        onSuccess={() => { fetchAll(); setTab('status'); }}
                                    />
                                )}
        
                                {/* SUPPORT TAB */}
                                {tab === 'support' && (
                                    <SupportAssistantTab />
                                )}

                        {/* ENROLLMENT STATUS */}
                        {tab === 'status' && (
                            <div className="space-y-3">
                                {enrollment.length > 0 ? enrollment.map(req => {
                                    const cfg = {
                                        PENDING_REVIEW: { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', label: 'Pending Review' },
                                        APPROVED: { color: 'var(--accent)', bg: 'rgba(0,201,177,0.08)', label: 'Approved' },
                                        REJECTED: { color: '#ff5c6e', bg: 'rgba(255,92,110,0.08)', label: 'Rejected' },
                                    }[req.review_status] ?? { color: '#64748b', bg: 'rgba(255,255,255,0.04)', label: req.review_status };
                                    return (
                                        <Block key={req.request_id} className="p-4" style={{ background: cfg.bg }}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-sm font-bold" style={{ color: cfg.color }}>{cfg.label}</p>
                                                    <p className="text-[10px] text-slate-500 font-mono mt-1">
                                                        {req.date_submitted ? new Date(req.date_submitted).toLocaleDateString() : 'N/A'}
                                                    </p>
                                                    {req.admin_review_notes && (
                                                        <p className="text-xs text-slate-400 mt-1 italic">{req.admin_review_notes}</p>
                                                    )}
                                                </div>
                                                <span className="text-[10px] font-mono text-slate-600">#{req.request_id}</span>
                                            </div>
                                        </Block>
                                    );
                                }) : (
                                    <Block className="p-10 text-center">
                                        <p className="text-slate-500 text-sm mb-4">No enrollment requests yet.</p>
                                        <button onClick={() => setTab('enrollment')}
                                            className="text-xs font-bold px-4 py-2 rounded-full"
                                            style={{ background: 'var(--accent)', color: 'var(--bg-base)' }}>
                                            Smart Enroll →
                                        </button>
                                    </Block>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* Mobile bottom nav */}
            <div className="fixed bottom-0 left-0 right-0 z-30 flex lg:hidden border-t"
                style={{ background: 'var(--bg-surface)', backdropFilter: 'blur(16px)', borderColor: 'var(--border-subtle)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
                {TABS.map(t => (
                    <BottomNavItem key={t.id} icon={t.icon} label={t.label}
                        active={tab === t.id} onClick={() => setTab(t.id)} />
                ))}
            </div>

            {/* Clearance Modal */}
            {clearanceModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setClearanceModal(false)}>
                    <Block className="p-6 max-w-sm w-full" style={{ border: `1px solid ${cleared ? 'rgba(0,201,177,0.3)' : 'rgba(251,191,36,0.3)'}` }} onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold text-white">Clearance Status</h3>
                            <button onClick={() => setClearanceModal(false)} className="text-slate-400 hover:text-white">✕</button>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl mb-4" style={{ background: cleared ? 'rgba(0,201,177,0.1)' : 'rgba(251,191,36,0.1)' }}>
                            <span className="text-2xl">{cleared ? '✅' : '⏳'}</span>
                            <div>
                                <p className="font-bold text-sm" style={{ color: cleared ? '#00c9b1' : '#fbbf24' }}>{cleared ? 'Cleared for Enrollment' : 'Hold / Pending'}</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed mb-4">
                            {profile?.clearance?.details || (cleared ? "You have no outstanding obligations and are ready to enroll." : "Your account is currently under review or has pending holds. Please contact the registrar or your adviser.")}
                        </p>
                        <button onClick={() => setClearanceModal(false)} className="w-full py-2.5 rounded-xl font-semibold text-sm text-center" style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>
                            Close
                        </button>
                    </Block>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;