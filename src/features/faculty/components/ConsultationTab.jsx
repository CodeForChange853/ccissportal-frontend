import React, { useState } from 'react';

const ConsultationTab = () => {
    const [slots, setSlots] = useState([
        { id: 1, day: 'Monday', time: '14:00 - 16:00', status: 'Active' },
        { id: 2, day: 'Wednesday', time: '10:00 - 12:00', status: 'Active' }
    ]);
    const [requests, setRequests] = useState([
        { id: 101, student: 'Jane Doe', issue: 'CS102 Project Clarification', time: 'Mon 14:30', status: 'Pending' },
        { id: 102, student: 'John Smith', issue: 'Grade Dispute Review', time: 'Wed 10:15', status: 'Pending' }
    ]);

    const handleApprove = (id) => {
        setRequests(requests.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
    };

    const handleDecline = (id) => {
        setRequests(requests.map(r => r.id === id ? { ...r, status: 'Declined' } : r));
    };

    return (
        <div className="animate-fade-in-up">
            <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                Faculty Consultations
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 24 }}>
                Manage your available advising hours and approve/decline student booking requests.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Available Slots */}
                <div>
                    <div className="flex justify-between items-end mb-4">
                        <h3 className="text-lg font-bold text-white">Active Time Slots</h3>
                        <button className="px-3 py-1.5 bg-[#34d399] hover:bg-[#10b981] text-black font-bold text-xs rounded-lg transition-colors">
                            + Add Slot
                        </button>
                    </div>
                    <div className="space-y-3">
                        {slots.map(slot => (
                            <div key={slot.id} className="p-4 rounded-xl flex items-center justify-between" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
                                <div>
                                    <p className="text-sm font-bold text-[#e2e8f0]">{slot.day}</p>
                                    <p className="text-xs font-mono text-[#34d399] mt-0.5">{slot.time}</p>
                                </div>
                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-[#34d399]/20 text-[#34d399]">
                                    {slot.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pending Requests */}
                <div>
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-white">Pending Requests</h3>
                    </div>
                    <div className="space-y-3">
                        {requests.filter(r => r.status === 'Pending').length === 0 ? (
                            <p className="text-xs text-slate-500 font-mono">NO PENDING REQUESTS</p>
                        ) : (
                            requests.map(req => (
                                req.status === 'Pending' && (
                                    <div key={req.id} className="p-4 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-sm font-bold text-white">{req.student}</p>
                                            <p className="text-xs font-mono text-[#34d399]">{req.time}</p>
                                        </div>
                                        <p className="text-xs text-slate-400 mb-4">{req.issue}</p>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleApprove(req.id)}
                                                className="flex-1 py-1.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-bold transition-colors">
                                                Approve
                                            </button>
                                            <button 
                                                onClick={() => handleDecline(req.id)}
                                                className="flex-1 py-1.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-xs font-bold transition-colors">
                                                Decline
                                            </button>
                                        </div>
                                    </div>
                                )
                            ))
                        )}
                        
                        {/* Recently Handled */}
                        {requests.some(r => r.status !== 'Pending') && (
                            <div className="mt-6">
                                <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Recently Handled</p>
                                <div className="space-y-2">
                                    {requests.filter(r => r.status !== 'Pending').map(req => (
                                        <div key={req.id} className="p-3 rounded-lg flex justify-between items-center" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                                            <div>
                                                <p className="text-xs font-bold text-slate-300">{req.student}</p>
                                                <p className="text-[10px] text-slate-500">{req.issue} · <span className="font-mono">{req.time}</span></p>
                                            </div>
                                            <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${req.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                                {req.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConsultationTab;
