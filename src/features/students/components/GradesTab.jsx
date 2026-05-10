import React, { useMemo } from 'react';

const GradeCard = ({ grade }) => {
    const isPassed = grade.completion_status === 'PASSED';
    const isFailed = grade.completion_status === 'FAILED';
    const isEnrolled = grade.completion_status === 'ENROLLED';

    const statusCfg = {
        PASSED: { color: 'var(--student-green)', label: 'Passed' },
        FAILED: { color: 'var(--student-red)', label: 'Failed' },
        ENROLLED: { color: 'var(--student-gold)', label: 'Enrolled' },
    }[grade.completion_status] || { color: 'var(--student-white-dim)', label: grade.completion_status };

    const gradeVal = grade.final_grade === 'N/A' ? '—' : (grade.final_grade || '—');

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
                    <span className="text-[10px] text-student-white-dim/60 font-mono">Units: {grade.units || 3}</span>
                    <span className="text-[10px] text-student-white-dim/60 font-mono uppercase tracking-tighter">Semester: {grade.semester}</span>
                </div>
            </div>
        </div>
    );
};

const GradesTab = ({ grades, gwa, gwaMeta, passed, failed, earned, academicStanding }) => {
    const sortedGrades = useMemo(() => {
        return [...grades].sort((a, b) => (b.semester || '').localeCompare(a.semester || ''));
    }, [grades]);

    const bySem = useMemo(() => {
        const groups = {};
        sortedGrades.forEach(g => {
            if (!groups[g.semester]) groups[g.semester] = [];
            groups[g.semester].push(g);
        });
        return groups;
    }, [sortedGrades]);

    return (
        <div className="space-y-8">
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
                    <p className="text-3xl font-black text-student-green" style={{ fontFamily: 'var(--student-font-display)' }}>{academicStanding?.standing || 'REGULAR'}</p>
                    <p className="text-[10px] mt-1 text-student-white-dim uppercase font-mono">Current Evaluation</p>
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
                            These grades are for viewing purposes only and do not serve as an official Transcript of Records. For official documentation, please visit the Registrar's Office or request through the Support portal.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GradesTab;