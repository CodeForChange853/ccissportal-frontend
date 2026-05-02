import React, { useState, useMemo } from 'react';
import CorUploadTab from './CorUploadTab';

const SmartEnrollmentTab = ({ academicStanding, onSuccess }) => {
    const [useSmartEnroll, setUseSmartEnroll] = useState(true);
    const [scheduleBlocks, setScheduleBlocks] = useState({
        blockA: null, blockB: null, blockC: null, blockD: null, blockE: null
    });
    const [collision, setCollision] = useState(null);

    const recommendedSubjects = useMemo(() => {
        if (!academicStanding?.next_semester_recommendation?.subject_results) return [];
        return academicStanding.next_semester_recommendation.subject_results.filter(s => s.status === 'AVAILABLE');
    }, [academicStanding]);

    const handleDragStart = (e, subject) => {
        e.dataTransfer.setData('subject', JSON.stringify(subject));
    };

    const handleDrop = (e, blockId) => {
        e.preventDefault();
        const subjectStr = e.dataTransfer.getData('subject');
        if (!subjectStr) return;
        
        const subject = JSON.parse(subjectStr);
        
        if (scheduleBlocks[blockId]) {
            // Collision Repulsion!
            setCollision(blockId);
            setTimeout(() => setCollision(null), 600); // Remove animation after 600ms
            return;
        }

        // Prevent adding same subject twice
        const alreadyInSchedule = Object.keys(scheduleBlocks).find(k => scheduleBlocks[k]?.subject_id === subject.subject_id);
        
        let newBlocks = { ...scheduleBlocks };
        if (alreadyInSchedule) {
            newBlocks[alreadyInSchedule] = null;
        }
        newBlocks[blockId] = subject;
        setScheduleBlocks(newBlocks);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const removeSubject = (blockId) => {
        setScheduleBlocks(prev => ({ ...prev, [blockId]: null }));
    };

    const enrolledCount = Object.values(scheduleBlocks).filter(Boolean).length;

    return (
        <div className="space-y-4">
            <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
                <button 
                    onClick={() => setUseSmartEnroll(true)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${useSmartEnroll ? 'bg-cyan-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}
                >
                    Auto-Scheduler AI
                </button>
                <button 
                    onClick={() => setUseSmartEnroll(false)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${!useSmartEnroll ? 'bg-cyan-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}
                >
                    Manual Upload (COR)
                </button>
            </div>

            {useSmartEnroll ? (
                <div className="space-y-4 fade-in">
                    <div className="bg-[#1e2246] border border-white/5 p-4 rounded-2xl">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <span className="text-cyan-400">🧠</span> Auto-Recommended Subjects
                            </h3>
                            <span className="bg-cyan-900/30 text-cyan-400 border border-cyan-800/30 text-[10px] px-2 py-0.5 rounded-full font-mono">
                                Next Semester
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                            Drag these subjects into an available schedule block. The system will alert you to any timing collisions.
                        </p>
                        
                        <div className="flex flex-wrap gap-2 min-h-12 p-2 bg-black/20 rounded-xl border border-white/5">
                            {recommendedSubjects.length > 0 ? recommendedSubjects.map(sub => {
                                const isPlaced = Object.values(scheduleBlocks).some(b => b?.subject_id === sub.subject_id);
                                if (isPlaced) return null;
                                return (
                                    <div 
                                        key={sub.subject_code} 
                                        draggable 
                                        onDragStart={(e) => handleDragStart(e, sub)}
                                        className="bg-cyan-600/20 border border-cyan-500/30 px-3 py-2 rounded-lg cursor-grab active:cursor-grabbing hover:bg-cyan-600/30 transition-colors"
                                    >
                                        <p className="text-xs font-bold text-cyan-100">{sub.subject_code}</p>
                                        <p className="text-[9px] text-cyan-300 font-mono mt-0.5">{sub.credit_units} units</p>
                                    </div>
                                )
                            }) : (
                                <p className="text-xs font-mono text-slate-500 p-2 text-center w-full">No available subjects to schedule.</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-[#1e2246] border border-white/5 p-4 rounded-2xl">
                        <h3 className="text-sm font-bold text-white mb-4">Conflict-Free Schedule Builder</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                            {Object.entries(scheduleBlocks).map(([blockId, sub]) => {
                                const isColliding = collision === blockId;
                                return (
                                    <div 
                                        key={blockId}
                                        onDrop={(e) => handleDrop(e, blockId)}
                                        onDragOver={handleDragOver}
                                        className={`min-h-[80px] rounded-xl flex items-center justify-center p-3 relative transition-all duration-300
                                            ${sub ? 'bg-cyan-900/20 border-cyan-500/30 border' : 'bg-white/[0.02] border-dashed border-white/10 border-2'}
                                            ${isColliding ? 'bg-rose-900/40 border-rose-500/50 shake-animation' : ''}
                                        `}
                                    >
                                        <span className="absolute top-2 left-3 text-[9px] font-mono font-bold text-slate-500 uppercase">{blockId}</span>
                                        
                                        {!sub ? (
                                            <span className="text-xs font-mono text-slate-600">Drop Subject Here</span>
                                        ) : (
                                            <div className="text-center w-full fade-in">
                                                <button onClick={() => removeSubject(blockId)} className="absolute top-2 right-2 text-slate-500 hover:text-rose-400 text-xs">✕</button>
                                                <p className="text-sm font-bold text-white">{sub.subject_code}</p>
                                                <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{sub.subject_title}</p>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                        
                        {collision && (
                            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-2 rounded-lg text-center font-mono fade-in mb-4">
                                ⚠️ Schedule Collision Detected! Slot already occupied.
                            </div>
                        )}

                        <button 
                            disabled={enrolledCount === 0}
                            className="w-full py-3 rounded-xl font-bold text-sm text-cyan-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            style={{ background: 'linear-gradient(135deg, var(--accent), #10b981)' }}
                        >
                            Finalize Enrollment ({enrolledCount} selected)
                        </button>
                    </div>

                    <style dangerouslySetInnerHTML={{__html: `
                        .shake-animation {
                            animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
                            border-color: #f43f5e !important;
                            background: rgba(244, 63, 94, 0.1) !important;
                        }
                        @keyframes shake {
                            10%, 90% { transform: translate3d(-1px, 0, 0); }
                            20%, 80% { transform: translate3d(2px, 0, 0); }
                            30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                            40%, 60% { transform: translate3d(4px, 0, 0); }
                        }
                        .fade-in {
                            animation: fadeIn 0.3s ease-in-out;
                        }
                        @keyframes fadeIn {
                            from { opacity: 0; transform: translateY(5px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                    `}} />
                </div>
            ) : (
                <div className="fade-in">
                    <CorUploadTab onSuccess={onSuccess} />
                </div>
            )}
        </div>
    );
};

export default SmartEnrollmentTab;
