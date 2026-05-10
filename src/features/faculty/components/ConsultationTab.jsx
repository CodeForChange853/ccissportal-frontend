import React, { useState, useEffect } from 'react';
import { facultyApi } from '../api/facultyApi';
import { useToast } from '../../../context/ToastContext';
import { useTheme } from '../../../context/ThemeContext';

// ── Shared styles ──
const inputStyle = {
    background: 'var(--bg-input, rgba(255,255,255,0.05))',
    border: '1px solid var(--border-default, rgba(255,255,255,0.1))',
    color: 'var(--text-primary)',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 13,
    fontFamily: 'var(--font-body)',
    outline: 'none',
    transition: 'all 0.2s ease',
};

const Card = ({ children, style = {}, className = "" }) => (
    <div 
        className={`fade-in ${className}`}
        style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            ...style,
        }}
    >{children}</div>
);

const CardHeader = ({ title, subtitle, action }) => (
    <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
        <div>
            <h3 style={{ fontFamily: 'var(--font-display, serif)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {title}
            </h3>
            {subtitle && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, margin: 0 }}>{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
    </div>
);

const ConsultationTab = () => {
    const { toast } = useToast();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [slots, setSlots] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingSlot, setEditingSlot] = useState(null);
    const [newSlot, setNewSlot] = useState({ 
        available_date: new Date().toISOString().split('T')[0], 
        start_time: '08:00', 
        end_time: '09:00' 
    });

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const [slotData, reqData] = await Promise.all([
                    facultyApi.fetchConsultationSlots(),
                    facultyApi.fetchConsultationRequests(),
                ]);
                setSlots(slotData);
                setRequests(reqData);
            } catch {
                toast.error?.('Could not fetch consultation data.');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleAddSlot = async () => {
        try {
            const created = await facultyApi.addConsultationSlot(newSlot);
            setSlots(prev => [...prev, created]);
            setShowAddForm(false);
            setNewSlot({ 
                available_date: new Date().toISOString().split('T')[0], 
                start_time: '08:00', 
                end_time: '09:00' 
            });
            toast.success?.('Availability slot created!');
        } catch {
            toast.error?.('Failed to create slot.');
        }
    };

    const handleUpdateSlot = async (slotId, data) => {
        try {
            const updated = await facultyApi.updateConsultationSlot(slotId, data);
            setSlots(prev => prev.map(s => s.slot_id === slotId ? updated : s));
            setEditingSlot(null);
            toast.success?.('Slot updated successfully.');
        } catch {
            toast.error?.('Failed to update slot.');
        }
    };

    const handleDeleteSlot = async (slotId) => {
        if (!window.confirm('Are you sure you want to remove this availability slot?')) return;
        try {
            await facultyApi.deleteConsultationSlot(slotId);
            setSlots(prev => prev.filter(s => s.slot_id !== slotId));
            toast.success?.('Slot removed.');
        } catch {
            toast.error?.('Failed to delete slot.');
        }
    };

    const handleApprove = async (id) => {
        try {
            await facultyApi.updateConsultationStatus(id, 'APPROVED');
            setRequests(prev => prev.map(r => r.request_id === id ? { ...r, status: 'APPROVED' } : r));
            toast.success?.('Consultation approved.');
        } catch {
            toast.error?.('Failed to approve request.');
        }
    };

    const handleDecline = async (id) => {
        try {
            await facultyApi.updateConsultationStatus(id, 'DECLINED');
            setRequests(prev => prev.map(r => r.request_id === id ? { ...r, status: 'DECLINED' } : r));
            toast.success?.('Consultation declined.');
        } catch {
            toast.error?.('Failed to decline request.');
        }
    };

    if (loading) return (
        <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--accent)', fontFamily: 'var(--font-code)', fontSize: 13, letterSpacing: 2 }}>
            SYNCHRONIZING CONSULTATION DATA...
        </div>
    );

    // Group slots by date
    const groupedSlots = slots.reduce((acc, slot) => {
        if (!acc[slot.available_date]) acc[slot.available_date] = [];
        acc[slot.available_date].push(slot);
        return acc;
    }, {});

    const sortedDates = Object.keys(groupedSlots).sort();

    const pendingRequests = requests.filter(r => r.status === 'PENDING');
    const handledRequests = requests.filter(r => r.status !== 'PENDING');

    return (
        <div className="fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                <div>
                    <h1 style={{ fontSize: 32, fontWeight: 800, fontFamily: 'var(--font-display, serif)', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' }}>
                        Consultation Core
                    </h1>
                    <p style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 8, margin: 0 }}>
                        Manage your availability and respond to student meeting requests.
                    </p>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    style={{
                        padding: '12px 24px', borderRadius: 12, border: 'none', cursor: 'pointer',
                        background: 'var(--portal-accent)', color: '#fff',
                        fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-body)',
                        boxShadow: '0 8px 20px rgba(var(--accent-rgb), 0.25)',
                        transition: 'all 0.3s ease',
                        display: 'flex', alignItems: 'center', gap: 8
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <span style={{ fontSize: 18 }}>+</span> DECLARE AVAILABILITY
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT: Availability Management */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    
                    {/* Add/Edit Form Overlay-ish */}
                    {(showAddForm || editingSlot) && (
                        <Card style={{ 
                            border: '1px solid var(--portal-accent)', 
                            background: 'var(--bg-elevated)',
                            padding: 0,
                            marginBottom: 0
                        }}>
                            <div style={{ 
                                padding: '16px 24px', 
                                background: 'linear-gradient(90deg, var(--portal-accent) 0%, rgba(var(--accent-rgb), 0.8) 100%)',
                                color: '#fff',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'var(--font-code)' }}>
                                    {editingSlot ? 'Refine Availability' : 'Establish New Slot'}
                                </span>
                                <button onClick={() => { setShowAddForm(false); setEditingSlot(null); }} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                            </div>
                            
                            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                                <div className="flex flex-col gap-2">
                                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Select Date</label>
                                    <input 
                                        type="date"
                                        value={editingSlot ? editingSlot.available_date : newSlot.available_date}
                                        onChange={e => editingSlot
                                            ? setEditingSlot(s => ({ ...s, available_date: e.target.value }))
                                            : setNewSlot(s => ({ ...s, available_date: e.target.value }))}
                                        style={inputStyle}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Start Time</label>
                                    <input 
                                        type="time"
                                        value={editingSlot ? editingSlot.start_time : newSlot.start_time}
                                        onChange={e => editingSlot
                                            ? setEditingSlot(s => ({ ...s, start_time: e.target.value }))
                                            : setNewSlot(s => ({ ...s, start_time: e.target.value }))}
                                        style={inputStyle}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>End Time</label>
                                    <input 
                                        type="time"
                                        value={editingSlot ? editingSlot.end_time : newSlot.end_time}
                                        onChange={e => editingSlot
                                            ? setEditingSlot(s => ({ ...s, end_time: e.target.value }))
                                            : setNewSlot(s => ({ ...s, end_time: e.target.value }))}
                                        style={inputStyle}
                                    />
                                </div>
                                <div className="md:col-span-3 flex justify-end gap-4 mt-2">
                                    <button
                                        onClick={() => { setShowAddForm(false); setEditingSlot(null); }}
                                        style={{ padding: '10px 20px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                                    >Cancel</button>
                                    <button
                                        onClick={editingSlot ? () => handleUpdateSlot(editingSlot.slot_id, editingSlot) : handleAddSlot}
                                        style={{ 
                                            padding: '10px 30px', borderRadius: 8, background: 'var(--portal-accent)', color: '#fff', border: 'none', 
                                            fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(var(--accent-rgb), 0.2)' 
                                        }}
                                    >
                                        {editingSlot ? 'Update Availability' : 'Commit Availability'}
                                    </button>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Timeline View of Slots */}
                    <Card>
                        <CardHeader 
                            title="Availability Schedule" 
                            subtitle="Chronological log of your open consultation windows" 
                        />
                        <div className="p-6">
                            {sortedDates.length === 0 ? (
                                <div className="py-20 text-center">
                                    <div style={{ fontSize: 40, marginBottom: 16 }}>🗓️</div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: 15, fontFamily: 'var(--font-body)' }}>
                                        No upcoming availability slots declared.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-10">
                                    {sortedDates.map(date => (
                                        <div key={date} className="relative pl-8 border-l-2 border-dashed border-accent-dim">
                                            {/* Date indicator circle */}
                                            <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-portal-accent border-4 border-bg-elevated" />
                                            
                                            <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--portal-accent)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16, fontFamily: 'var(--font-code)' }}>
                                                {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                            </h4>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {groupedSlots[date].map(slot => (
                                                    <div 
                                                        key={slot.slot_id}
                                                        className="group relative flex items-center justify-between p-4 rounded-xl border border-default bg-surface hover:border-portal-accent transition-all duration-200"
                                                        style={{ background: 'var(--bg-surface)' }}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div style={{ 
                                                                width: 40, height: 40, borderRadius: 10, 
                                                                background: slot.is_active ? 'rgba(var(--accent-rgb), 0.1)' : 'var(--bg-depth)',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                fontSize: 16
                                                            }}>
                                                                {slot.is_active ? '⚡' : '💤'}
                                                            </div>
                                                            <div>
                                                                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                                                                    {slot.start_time} — {slot.end_time}
                                                                </p>
                                                                <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 }}>
                                                                    {slot.is_active ? 'Open for Booking' : 'Temporarily Closed'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button 
                                                                onClick={() => setEditingSlot(slot)}
                                                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-depth hover:bg-portal-accent hover:text-white transition-colors"
                                                                title="Edit Slot"
                                                            >
                                                                ✏️
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteSlot(slot.slot_id)}
                                                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-depth hover:bg-red-500 hover:text-white transition-colors"
                                                                title="Delete Slot"
                                                            >
                                                                🗑️
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* RIGHT: Request Queue */}
                <div className="lg:col-span-4 flex flex-col gap-8">
                    
                    <Card>
                        <CardHeader 
                            title="Request Queue" 
                            subtitle={`${pendingRequests.length} pending submissions`}
                        />
                        <div className="p-4 flex flex-col gap-4">
                            {pendingRequests.length === 0 ? (
                                <div className="py-12 text-center">
                                    <div style={{ fontSize: 32, marginBottom: 12 }}>✨</div>
                                    <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-code)' }}>
                                        CLEAR QUEUE
                                    </p>
                                </div>
                            ) : pendingRequests.map(req => (
                                <div 
                                    key={req.request_id}
                                    style={{
                                        background: 'var(--bg-surface)',
                                        border: '1px solid var(--border-default)',
                                        borderRadius: 14,
                                        padding: 20,
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                        <div style={{ 
                                            width: 36, height: 36, borderRadius: '50%', 
                                            background: 'linear-gradient(135deg, var(--portal-accent), var(--accent-light))',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#fff', fontWeight: 800, fontSize: 14
                                        }}>
                                            {req.student_name[0]}
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{req.student_name}</p>
                                            <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-code)' }}>ID: {req.student_id}</p>
                                        </div>
                                    </div>

                                    <div style={{ 
                                        background: 'var(--bg-depth)', 
                                        borderRadius: 10, 
                                        padding: '10px 14px', 
                                        marginBottom: 16,
                                        border: '1px solid var(--border-subtle)'
                                    }}>
                                        <p style={{ margin: 0, fontSize: 12, color: 'var(--portal-accent)', fontWeight: 700 }}>
                                            📅 {new Date(req.booking_date).toLocaleDateString()}
                                        </p>
                                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>
                                            {req.start_time} — {req.end_time}
                                        </p>
                                    </div>

                                    <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, fontStyle: 'italic', marginBottom: 20 }}>
                                        "{req.reason}"
                                    </p>

                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => handleApprove(req.request_id)}
                                            style={{
                                                flex: 1, padding: '10px 0', borderRadius: 10,
                                                background: 'var(--color-success)', color: '#fff',
                                                border: 'none', fontSize: 12, fontWeight: 700,
                                                cursor: 'pointer', transition: 'all 0.2s'
                                            }}
                                        >APPROVE</button>
                                        <button 
                                            onClick={() => handleDecline(req.request_id)}
                                            style={{
                                                flex: 1, padding: '10px 0', borderRadius: 10,
                                                background: 'transparent', color: 'var(--color-danger)',
                                                border: '1px solid var(--color-danger)', fontSize: 12, fontWeight: 700,
                                                cursor: 'pointer', transition: 'all 0.2s'
                                            }}
                                        >DECLINE</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* History */}
                    <Card>
                        <CardHeader title="Recent Activity" />
                        <div className="p-4 flex flex-col gap-3">
                            {handledRequests.slice(0, 5).map(req => (
                                <div 
                                    key={req.request_id}
                                    style={{ 
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '12px 16px', borderRadius: 12, background: 'var(--bg-surface)',
                                        border: '1px solid var(--border-subtle)'
                                    }}
                                >
                                    <div className="min-w-0">
                                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{req.student_name}</p>
                                        <p style={{ margin: 0, fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                                            {req.booking_date} • {req.status}
                                        </p>
                                    </div>
                                    <div style={{ 
                                        width: 8, height: 8, borderRadius: '50%',
                                        background: req.status === 'APPROVED' ? 'var(--color-success)' : 'var(--color-danger)'
                                    }} />
                                </div>
                            ))}
                        </div>
                    </Card>
                    
                </div>
            </div>
        </div>
    );
};

export default ConsultationTab;