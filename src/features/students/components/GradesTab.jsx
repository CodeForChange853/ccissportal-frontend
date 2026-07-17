import React, { useMemo } from 'react';

// SE-04 — At-Risk banner
const RISK_CFG = {
    HIGH:     { color: 'var(--student-red)',     bg: 'rgba(239,68,68,0.08)',     border: 'rgba(239,68,68,0.25)',     label: 'HIGH RISK',     icon: '🔴' },
    MODERATE: { color: 'var(--student-warning)', bg: 'rgba(245,158,11,0.08)',    border: 'rgba(245,158,11,0.25)',    label: 'MODERATE RISK', icon: '🟡' },
    LOW:      { color: 'var(--student-green)',   bg: 'rgba(34,197,94,0.06)',     border: 'rgba(34,197,94,0.20)',     label: 'LOW RISK',      icon: '🟢' },
};

const ScorePill = ({ label, value, color }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
        padding: '6px 10px', borderRadius: 8,
        background: `${color}12`, border: `1px solid ${color}28` }}>
        <span style={{ fontFamily: 'var(--student-font-mono)', fontSize: '0.65rem',
            color, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {label}
        </span>
        <span style={{ fontFamily: 'var(--student-font-display)', fontSize: '1.1rem',
            fontWeight: 900, color }}>
            {value}
        </span>
    </div>
);

const AtRiskBanner = ({ atRisk }) => {
    if (!atRisk) return null;
    const cfg = RISK_CFG[atRisk.risk_level] || RISK_CFG.LOW;
    const bd  = atRisk.breakdown;

    return (
        <div style={{ borderRadius: 16, padding: '16px 20px',
            background: cfg.bg, border: `1px solid ${cfg.border}`, marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1.2rem' }}>{cfg.icon}</span>
                    <div>
                        <p style={{ fontFamily: 'var(--student-font-mono)', fontSize: '0.6rem',
                            color: cfg.color, fontWeight: 700, letterSpacing: '0.15em',
                            textTransform: 'uppercase', marginBottom: 2 }}>
                            At-Risk Early Warning
                        </p>
                        <p style={{ fontFamily: 'var(--student-font-display)', fontSize: '1.1rem',
                            fontWeight: 900, color: cfg.color, lineHeight: 1 }}>
                            {cfg.label}
                            <span style={{ fontFamily: 'var(--student-font-mono)', fontSize: '0.85rem',
                                fontWeight: 700, marginLeft: 8, opacity: 0.7 }}>
                                {atRisk.risk_score}/100
                            </span>
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <ScorePill label="Failed Load" value={bd.failed_load_score} color={cfg.color} />
                    <ScorePill label="GWA"         value={bd.gwa_score}         color={cfg.color} />
                    <ScorePill label="Variance"    value={bd.variance_score}    color={cfg.color} />
                    <ScorePill label="Consult"     value={bd.consultation_score} color={cfg.color} />
                </div>
            </div>

            {atRisk.interventions && atRisk.interventions.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <p style={{ fontFamily: 'var(--student-font-mono)', fontSize: '0.58rem',
                        color: 'var(--student-white-dim)', letterSpacing: '0.12em',
                        textTransform: 'uppercase', marginBottom: 2 }}>
                        Recommended Actions
                    </p>
                    {atRisk.interventions.map((msg, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8,
                            padding: '7px 10px', borderRadius: 8,
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <span style={{ color: cfg.color, fontSize: '0.75rem', marginTop: 1, flexShrink: 0 }}>›</span>
                            <p style={{ fontFamily: 'var(--student-font-body)', fontSize: '0.72rem',
                                color: 'var(--student-white-dim)', lineHeight: 1.5, margin: 0 }}>
                                {msg}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const GradeCard = ({ grade }) => {
    const isPassed = grade.completion_status === 'PASSED';
    const isFailed = grade.completion_status === 'FAILED';
    const isEnrolled = grade.completion_status === 'ENROLLED';

    const statusCfg = {
        PASSED: { color: 'var(--student-green)', label: 'Passed' },
        FAILED: { color: 'var(--student-red)', label: 'Failed' },
        ENROLLED: { color: 'var(--student-gold)', label: 'Enrolled' },
    }[grade.completion_status] || { color: 'var(--student-white-dim)', label: grade.completion_status };

    // Senior Logic: Show Final Grade if available, otherwise show the System Calculated Grade
    const rawGrade = (grade.final_grade != null && grade.final_grade !== 'N/A')
        ? grade.final_grade 
        : ((grade.system_grade != null && grade.system_grade !== 'N/A') ? grade.system_grade : null);
    
    const gradeVal = rawGrade || '—';

    return (
        <div className="rounded-xl p-4 flex items-center gap-4 transition-all hover:bg-white/[0.02]"
            style={{ background: 'var(--student-black-4)', border: '1px solid rgba(201, 168, 76, 0.08)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black shrink-0"
                style={{ background: 'var(--student-gold-dim)', color: 'var(--student-gold)', fontFamily: 'var(--student-font-display)' }}>
                {gradeVal}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <p className="font-bold text-white text-base truncate" style={{ fontFamily: 'var(--student-font-display)' }}>{grade.subject_code}</p>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md" 
                        style={{ color: statusCfg.color, background: `${statusCfg.color}15`, border: `1px solid ${statusCfg.color}33` }}>
                        {statusCfg.label}
                    </span>
                </div>
                <p className="text-xs text-student-white-dim truncate mt-0.5">{grade.subject_title}</p>
                <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] text-student-white-dim/60 font-mono">Units: {grade.credit_units || 3}</span>
                    <span className="text-[10px] text-student-white-dim/60 font-mono uppercase tracking-tighter">Semester: {grade.semester_string}</span>
                </div>
            </div>
        </div>
    );
};

const GradesTab = ({ grades, gwa, gwaMeta, passed, failed, earned, academicStanding, atRisk }) => {
    const sortedGrades = useMemo(() => {
        return [...grades].map(g => ({
            ...g,
            semester_string: g.semester_string || `Year ${g.target_year_level} Sem ${g.target_semester}`
        })).sort((a, b) => b.semester_string.localeCompare(a.semester_string));
    }, [grades]);

    const bySem = useMemo(() => {
        const groups = {};
        sortedGrades.forEach(g => {
            const sem = g.semester_string;
            if (!groups[sem]) groups[sem] = [];
            groups[sem].push(g);
        });
        return groups;
    }, [sortedGrades]);

    return (
        <div className="space-y-8">
            <AtRiskBanner atRisk={atRisk} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl p-5" style={{ background: 'var(--student-black-3)', border: '1px solid rgba(201, 168, 76, 0.1)' }}>
                    <p className="text-[10px] uppercase font-bold text-student-white-dim opacity-50 mb-1 tracking-widest font-mono">Cumulative GWA</p>
                    <p className="text-3xl font-black text-student-gold" style={{ fontFamily: 'var(--student-font-display)' }}>{gwa || '—'}</p>
                    <p className="text-[10px] mt-1 font-bold uppercase" style={{ color: gwaMeta.color, fontFamily: 'var(--student-font-mono)' }}>{gwaMeta.label}</p>
                </div>
                <div className="rounded-2xl p-5" style={{ background: 'var(--student-black-3)', border: '1px solid rgba(201, 168, 76, 0.1)' }}>
                    <p className="text-[10px] uppercase font-bold text-student-white-dim opacity-50 mb-1 tracking-widest font-mono">Total Units Earned</p>
                    <p className="text-3xl font-black text-white" style={{ fontFamily: 'var(--student-font-display)' }}>{earned}</p>
                    <p className="text-[10px] mt-1 text-student-white-dim uppercase font-mono">Credits toward degree</p>
                </div>
                <div className="rounded-2xl p-5" style={{ background: 'var(--student-black-3)', border: '1px solid rgba(201, 168, 76, 0.1)' }}>
                    <p className="text-[10px] uppercase font-bold text-student-white-dim opacity-50 mb-1 tracking-widest font-mono">Academic Status</p>
                    {(() => {
                        const retentionStatus = academicStanding?.retention_status?.status;
                        const isIrregular     = academicStanding?.is_irregular;

                        let label = 'REGULAR';
                        let color = 'var(--student-green)';
                        let sub   = 'Current Evaluation';

                        if (retentionStatus === 'DROPOUT_RISK') {
                            label = 'DROPOUT RISK'; color = 'var(--student-red)'; sub = 'Mandatory Counseling Required';
                        } else if (retentionStatus === 'UNDER_RETENTION') {
                            label = 'UNDER RETENTION'; color = 'var(--student-red-light)'; sub = 'Retention Exam Required';
                        } else if (retentionStatus === 'AT_RISK') {
                            label = 'AT RISK'; color = 'var(--student-warning)'; sub = 'Monitor Closely';
                        } else if (isIrregular) {
                            label = 'IRREGULAR'; color = 'var(--student-warning)'; sub = 'Has Back Subjects';
                        }

                        return (
                            <>
                                <p className="text-2xl font-black" style={{ fontFamily: 'var(--student-font-display)', color }}>{label}</p>
                                <p className="text-[10px] mt-1 uppercase font-mono" style={{ color: 'var(--student-white-dim)' }}>{sub}</p>
                            </>
                        );
                    })()}
                </div>
            </div>

            <div className="space-y-6">
                {Object.entries(bySem).map(([sem, items]) => (
                    <div key={sem} className="space-y-3">
                        <div className="flex items-center gap-3 px-1">
                            <h3 className="text-sm font-bold text-student-gold-2 tracking-widest uppercase" style={{ fontFamily: 'var(--student-font-mono)' }}>{sem}</h3>
                            <div className="h-[1px] flex-1 bg-white/5" />
                            <span className="text-[10px] font-mono text-student-white-dim/40">{items.length} Subjects</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {items.map((g, i) => <GradeCard key={i} grade={g} />)}
                        </div>
                    </div>
                ))}

                {grades.length === 0 && (
                    <div className="p-16 text-center rounded-2xl" style={{ background: 'var(--student-black-3)', border: '1px dashed rgba(201, 168, 76, 0.2)' }}>
                        <p className="text-student-white-dim text-sm font-medium">No academic records found.</p>
                    </div>
                )}
            </div>
            
            <div className="p-5 rounded-2xl" style={{ background: 'var(--student-gold-dim2)', border: '1px solid rgba(201, 168, 76, 0.1)' }}>
                <div className="flex items-start gap-4">
                    <span className="text-2xl mt-1">🎓</span>
                    <div>
                        <h4 className="text-white font-bold text-base mb-1" style={{ fontFamily: 'var(--student-font-display)' }}>Academic Integrity Notice</h4>
                        <p className="text-xs text-student-white-dim leading-relaxed">
                            These grades are for viewing purposes only and do not serve as an official Transcript of Records. For official documentation, please visit the Registrar&apos;s Office or request through the Support portal.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GradesTab;