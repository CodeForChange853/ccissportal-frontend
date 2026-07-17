import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../auth/AuthContext';
import { useToast } from '../../../context/ToastContext';
import Gradebook from '../components/Gradebook';
import SubjectCard from '../components/SubjectCard';
import FacultyProfile from '../components/FacultyProfile';
import { facultyApi } from '../api/facultyApi';
import ConsultationTab from '../components/ConsultationTab';
import INCQueueTab from '../components/INCQueueTab';
import FacultyLayout from '../layout/FacultyLayout';
import FacultySidebarCard from '../components/FacultySidebarCard';
import OnboardingWizard from '../../../components/ui/OnboardingWizard';

const FACULTY_ONBOARDING_STEPS = [
    {
        icon: '👋',
        title: 'Welcome, {name}!',
        subtitle: 'Faculty Portal',
        body: 'Manage your teaching load, update student grades, and handle consultation requests — all from one place.',
    },
    {
        icon: '📚',
        title: 'My Load & Gradebook',
        subtitle: 'Your teaching assignments',
        body: 'My Load shows every subject assigned to you this semester. Click a subject card to open its Gradebook and manage grades directly.',
        highlight: 'My Load → click any card',
    },
    {
        icon: '💬',
        title: 'Student Consultations',
        subtitle: 'Stay connected',
        body: 'The Consultations tab shows all scheduled meetings with students. Review, confirm, or decline requests and keep communication organized.',
    },
    {
        icon: '📋',
        title: 'INC Completion Queue',
        subtitle: 'Grade INC students',
        body: 'When a student\'s INC request is routed to you by the secretariat, it appears here. Submit the final grade so the admin can post it to the official gradebook.',
        cta: "Let's Go",
    },
];

const FacultyDashboard = () => {
    const { user } = useAuth();
    const { toast } = useToast();

    const [activeTab, setActiveTab] = useState('load');
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [fetching, setFetching] = useState(true);
    const [alerts, setAlerts] = useState([]);
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        (async () => {
            setFetching(true);
            try {
                const [loadData, alertData] = await Promise.all([
                    facultyApi.fetchLoad(),
                    facultyApi.fetchTriageAlerts().catch(() => []),
                ]);
                setSubjects(loadData);
                setAlerts(alertData);
            } catch {
                toast?.error?.('Could not fetch faculty load.');
            } finally {
                setFetching(false);
            }
        })();
    }, []);

    useEffect(() => {
        if (!fetching && user?.id) {
            const key = `nexenroll_onboarded_faculty_${user.id}`;
            if (!localStorage.getItem(key)) setShowOnboarding(true);
        }
    }, [fetching]);

    const openGradebook = (sub) => {
        setSelectedSubject(sub);
        setActiveTab('gradebook');
    };

    const handleTabChange = (id) => {
        if (id === 'gradebook' && !selectedSubject) {
            toast?.warn?.('Select a subject first from "My Load".');
            return;
        }
        setActiveTab(id);
    };

    const totalUnits = subjects.reduce((s, sub) => s + (sub.units || 3), 0);
    const loadPct = Math.min(100, Math.round((totalUnits / 21) * 100));
    const totalStudents = subjects.reduce((s, sub) => s + (sub.enrolled_count || sub.students || 0), 0);

    const profileCard = (
        <FacultySidebarCard
            user={user}
            subjects={subjects}
            totalUnits={totalUnits}
            totalStudents={totalStudents}
            loadPct={loadPct}
        />
    );

    return (
        <>
        {showOnboarding && (
            <OnboardingWizard
                steps={FACULTY_ONBOARDING_STEPS}
                variant="portal"
                userName={user?.username}
                onComplete={() => {
                    localStorage.setItem(`nexenroll_onboarded_faculty_${user.id}`, '1');
                    setShowOnboarding(false);
                }}
            />
        )}
        <FacultyLayout
            activeTab={activeTab}
            onTabChange={handleTabChange}
            profileSlot={profileCard}
        >
            <div style={{ padding: 24 }}>
                {/* MY LOAD */}
                {activeTab === 'load' && (
                    <div className="fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                            <div>
                                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: 4 }}>My Teaching Load</h2>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{subjects.length} subject{subjects.length !== 1 ? 's' : ''} assigned — click any card to open gradebook</p>
                            </div>
                            {alerts.length > 0 && (
                                <span style={{ background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-bd)', color: 'var(--color-danger)', fontSize: 11, padding: '4px 12px', borderRadius: 6, fontFamily: 'var(--font-code)' }}>
                                    🚨 {alerts.length} Triage Alert{alerts.length > 1 ? 's' : ''}
                                </span>
                            )}
                        </div>

                        {fetching ? (
                            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--portal-accent)', fontFamily: 'var(--font-code)', fontSize: 13, letterSpacing: 2 }}>FETCHING LOAD…</div>
                        ) : subjects.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)', fontFamily: 'var(--font-code)', fontSize: 13 }}>NO SUBJECTS ASSIGNED — Contact your administrator.</div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                                {subjects.map(sub => <SubjectCard key={sub.code} subject={sub} onClick={() => openGradebook(sub)} />)}
                            </div>
                        )}

                        {alerts.length > 0 && (
                            <div style={{ marginTop: 28 }}>
                                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Triage Alerts</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
                                    {alerts.map((alert, idx) => (
                                        <div key={idx} style={{ padding: 14, borderRadius: 10, background: alert.alert_type === 'GRADE_DISPUTE' ? 'var(--color-danger-bg)' : 'var(--color-warning-bg)', border: `1px solid ${alert.alert_type === 'GRADE_DISPUTE' ? 'var(--color-danger-bd)' : 'var(--color-warning-bd)'}` }}>
                                            <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, color: alert.alert_type === 'GRADE_DISPUTE' ? 'var(--color-danger)' : 'var(--color-warning)', fontFamily: 'var(--font-code)', marginBottom: 4 }}>{alert.title}</p>
                                            {alert.subject_code && <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{alert.subject_code}</p>}
                                            <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{alert.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* GRADEBOOK */}
                {activeTab === 'gradebook' && (
                    <div style={{ height: 'calc(100vh - var(--topbar-height) - 96px)', display: 'flex', flexDirection: 'column' }}>
                        {selectedSubject ? (
                            <Gradebook subject={selectedSubject} />
                        ) : (
                            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)', fontFamily: 'var(--font-code)', fontSize: 13 }}>
                                SELECT A SUBJECT FROM &quot;MY LOAD&quot; FIRST
                            </div>
                        )}
                    </div>
                )}

                {/* CONSULTATIONS */}
                {activeTab === 'consultations' && <ConsultationTab />}

                {/* INC QUEUE */}
                {activeTab === 'inc-queue' && <INCQueueTab />}

                {/* PROFILE */}
                {activeTab === 'profile' && <FacultyProfile user={user} subjectCount={subjects.length} />}
            </div>
        </FacultyLayout>
        </>
    );
};

export default FacultyDashboard;