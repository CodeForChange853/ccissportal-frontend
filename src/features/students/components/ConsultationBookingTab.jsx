import React, { useState, useEffect } from 'react';
import { studentApi } from '../api/studentApi';
import { useToast } from '../../../context/ToastContext';

// ── Block Component ──
const Block = ({ children, className = '', style = {} }) => (
    <div
        className={`rounded-2xl ${className}`}
        style={{
            background: 'var(--student-black-3)',
            border: '1px solid rgba(201,168,76,0.08)',
            ...style
        }}
    >
        {children}
    </div>
);

// ── Shared input style ──
const inputStyle = {
    background: 'var(--student-black-4)',
    border: '1px solid rgba(201,168,76,0.15)',
    color: 'var(--student-white)',
    borderRadius: 12,
    padding: '12px 16px',
    fontSize: 13,
    fontFamily: 'var(--student-font-body)',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
};

const ConsultationBookingTab = () => {
    const { toast } = useToast();

    const [facultyList, setFacultyList] = useState([]);
    const [selectedFacultyId, setSelectedFacultyId] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [timeChunks, setTimeChunks] = useState([]);
    const [selectedChunk, setSelectedChunk] = useState(null);
    const [reason, setReason] = useState('');
    
    const [myRequests, setMyRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchingChunks, setFetchingChunks] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                const [faculties, requests] = await Promise.all([
                    studentApi.fetchAvailableFaculty(),
                    studentApi.fetchMyConsultations()
                ]);
                setFacultyList(faculties);
                setMyRequests(requests);
            } catch (err) {
                toast?.error?.('Failed to load consultation data');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    useEffect(() => {
        if (!selectedFacultyId || !selectedDate) {
            setTimeChunks([]);
            setSelectedChunk(null);
            return;
        }

        const fetchChunks = async () => {
            setFetchingChunks(true);
            setSelectedChunk(null);
            try {
                const chunks = await studentApi.fetchFacultyTimeChunks(selectedFacultyId, selectedDate);
                setTimeChunks(chunks);
            } catch (err) {
                toast?.error?.('Failed to fetch available time slots');
            } finally {
                setFetchingChunks(false);
            }
        };

        fetchChunks();
    }, [selectedFacultyId, selectedDate]);

    const handleBook = async () => {
        if (!selectedFacultyId || !selectedDate || !selectedChunk || !reason.trim()) {
            toast?.warn?.('Please complete all fields to book a consultation.');
            return;
        }

        setSubmitting(true);
        try {
            const newReq = await studentApi.bookConsultation({
                faculty_account_id: parseInt(selectedFacultyId),
                booking_date: selectedDate,
                start_time: selectedChunk.start_time,
                end_time: selectedChunk.end_time,
                reason: reason.trim()
            });
            
            toast?.success?.('Consultation requested successfully!');
            setMyRequests(prev => [newReq, ...prev]);
            
            // Reset form
            setSelectedChunk(null);
            setReason('');
            
            // Refresh chunks
            const chunks = await studentApi.fetchFacultyTimeChunks(selectedFacultyId, selectedDate);
            setTimeChunks(chunks);
        } catch (err) {
            toast?.error?.(err.response?.data?.detail || 'Failed to submit booking.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--student-gold)', fontFamily: 'var(--student-font-mono)', fontSize: 13, letterSpacing: 2 }}>
            LOADING SYSTEM...
        </div>
    );

    const pendingRequests = myRequests.filter(r => r.status === 'PENDING');
    const pastRequests = myRequests.filter(r => r.status !== 'PENDING');

    return (
        <div className="fade-in space-y-6">
            <Block className="p-6 md:p-8 relative overflow-hidden">
                {/* Decorative background flare */}
                <div 
                    className="absolute top-0 right-0 w-64 h-64 opacity-20 pointer-events-none" 
                    style={{ background: 'radial-gradient(circle, var(--student-gold) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} 
                />
                
                <h2 style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--student-font-display)', color: 'var(--student-white)', marginBottom: 8, letterSpacing: '-0.5px' }}>
                    Consultation Network
                </h2>
                <p style={{ fontSize: 14, color: 'var(--student-white-dim)', maxWidth: 500, lineHeight: 1.6 }}>
                    Connect with your professors by reserving dedicated 30-minute time slots. Choose an available slot that works for both of you.
                </p>
            </Block>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* LEFT: Booking Form */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <Block className="p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <span style={{ fontSize: 20 }}>📝</span>
                            <h3 style={{ fontFamily: 'var(--student-font-display)', fontSize: 18, fontWeight: 700, color: 'var(--student-white)' }}>
                                Request Booking
                            </h3>
                        </div>
                        
                        <div className="flex flex-col gap-6">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Faculty Selection */}
                                <div className="flex flex-col gap-2">
                                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--student-gold)', textTransform: 'uppercase', letterSpacing: 1.5, fontFamily: 'var(--student-font-mono)' }}>Target Faculty</label>
                                    <select 
                                        value={selectedFacultyId} 
                                        onChange={e => setSelectedFacultyId(e.target.value)}
                                        style={inputStyle}
                                        onFocus={e => e.target.style.borderColor = 'var(--student-gold)'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.15)'}
                                    >
                                        <option value="" style={{ background: 'var(--student-black-3)' }}>-- Select Professor --</option>
                                        {facultyList.map(f => (
                                            <option key={f.account_id} value={f.account_id} style={{ background: 'var(--student-black-3)' }}>
                                                {f.faculty_name} ({f.academic_department})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Date Selection */}
                                <div className="flex flex-col gap-2">
                                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--student-gold)', textTransform: 'uppercase', letterSpacing: 1.5, fontFamily: 'var(--student-font-mono)' }}>Select Date</label>
                                    <input 
                                        type="date" 
                                        value={selectedDate}
                                        onChange={e => setSelectedDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        style={{...inputStyle, opacity: !selectedFacultyId ? 0.5 : 1, cursor: !selectedFacultyId ? 'not-allowed' : 'auto'}}
                                        disabled={!selectedFacultyId}
                                        onFocus={e => e.target.style.borderColor = 'var(--student-gold)'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.15)'}
                                    />
                                </div>
                            </div>

                            {/* Time Chunks Grid */}
                            <div className="flex flex-col gap-2">
                                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--student-gold)', textTransform: 'uppercase', letterSpacing: 1.5, fontFamily: 'var(--student-font-mono)' }}>Available 30-Min Blocks</label>
                                
                                <div style={{ 
                                    background: 'var(--student-black-4)', 
                                    border: '1px solid rgba(201,168,76,0.08)', 
                                    borderRadius: 12, 
                                    padding: 20,
                                    minHeight: 140,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: (!selectedFacultyId || !selectedDate || fetchingChunks || timeChunks.length === 0) ? 'center' : 'flex-start'
                                }}>
                                    {!selectedFacultyId || !selectedDate ? (
                                        <div style={{ textAlign: 'center', color: 'var(--student-white-dim)', fontSize: 13 }}>
                                            Select a professor and date to view their availability.
                                        </div>
                                    ) : fetchingChunks ? (
                                        <div style={{ textAlign: 'center', color: 'var(--student-gold)', fontSize: 13, fontFamily: 'var(--student-font-mono)', letterSpacing: 1 }}>
                                            SCANNING SLOTS...
                                        </div>
                                    ) : timeChunks.length === 0 ? (
                                        <div style={{ textAlign: 'center', color: 'var(--student-red)', fontSize: 13 }}>
                                            The professor has no open slots on this date.
                                        </div>
                                    ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
                                            {timeChunks.map((chunk, idx) => {
                                                const isSelected = selectedChunk && selectedChunk.start_time === chunk.start_time;
                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setSelectedChunk(chunk)}
                                                        style={{
                                                            padding: '12px 10px',
                                                            borderRadius: 8,
                                                            border: `1px solid ${isSelected ? 'var(--student-gold)' : 'rgba(201,168,76,0.2)'}`,
                                                            background: isSelected ? 'var(--student-gold-dim)' : 'transparent',
                                                            color: isSelected ? 'var(--student-gold)' : 'var(--student-white)',
                                                            fontSize: 13,
                                                            fontFamily: 'var(--student-font-mono)',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                            fontWeight: isSelected ? 700 : 400,
                                                            boxShadow: isSelected ? '0 0 15px rgba(201,168,76,0.1)' : 'none'
                                                        }}
                                                        onMouseEnter={e => { if(!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}}
                                                        onMouseLeave={e => { if(!isSelected) e.currentTarget.style.background = 'transparent'}}
                                                    >
                                                        {chunk.start_time} - {chunk.end_time}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Reason & Submit */}
                            <div className="flex flex-col gap-2">
                                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--student-gold)', textTransform: 'uppercase', letterSpacing: 1.5, fontFamily: 'var(--student-font-mono)' }}>State your Agenda</label>
                                <textarea 
                                    value={reason}
                                    onChange={e => setReason(e.target.value)}
                                    placeholder="Briefly describe what you'd like to discuss..."
                                    style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }}
                                    onFocus={e => e.target.style.borderColor = 'var(--student-gold)'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(201,168,76,0.15)'}
                                />
                            </div>

                            <button 
                                onClick={handleBook}
                                disabled={submitting || !selectedChunk || !reason.trim()}
                                style={{
                                    padding: '16px',
                                    borderRadius: 12,
                                    background: submitting || !selectedChunk || !reason.trim() ? 'var(--student-black-4)' : 'var(--student-gold)',
                                    color: submitting || !selectedChunk || !reason.trim() ? 'rgba(255,255,255,0.2)' : 'var(--student-black)',
                                    border: submitting || !selectedChunk || !reason.trim() ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                    fontWeight: 800,
                                    fontSize: 14,
                                    fontFamily: 'var(--student-font-body)',
                                    textTransform: 'uppercase',
                                    letterSpacing: 1,
                                    cursor: submitting || !selectedChunk || !reason.trim() ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.3s',
                                    marginTop: 8,
                                    boxShadow: submitting || !selectedChunk || !reason.trim() ? 'none' : '0 4px 14px rgba(201,168,76,0.3)'
                                }}
                            >
                                {submitting ? 'TRANSMITTING REQUEST...' : 'CONFIRM BOOKING'}
                            </button>

                        </div>
                    </Block>
                </div>

                {/* RIGHT: My Requests */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <Block className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 style={{ fontFamily: 'var(--student-font-display)', fontSize: 16, fontWeight: 700, color: 'var(--student-white)' }}>
                                Pending Requests
                            </h3>
                            <div style={{ padding: '4px 8px', borderRadius: 20, background: 'var(--student-gold-dim)', color: 'var(--student-gold)', fontSize: 11, fontWeight: 700, fontFamily: 'var(--student-font-mono)' }}>
                                {pendingRequests.length}
                            </div>
                        </div>
                        
                        <div className="flex flex-col gap-3">
                            {pendingRequests.length === 0 ? (
                                <div style={{ textAlign: 'center', py: 20, fontSize: 12, color: 'var(--student-white-dim)', fontFamily: 'var(--student-font-mono)' }}>
                                    NO PENDING REQUESTS
                                </div>
                            ) : pendingRequests.map(req => (
                                <div key={req.request_id} style={{
                                    padding: 16, borderRadius: 12,
                                    background: 'var(--student-black-4)', 
                                    border: '1px solid rgba(201,168,76,0.2)',
                                }}>
                                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--student-white)', marginBottom: 6 }}>{req.faculty_name}</p>
                                    <div style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 6,
                                        background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: 6,
                                        fontSize: 11, color: 'var(--student-gold)', fontFamily: 'var(--student-font-mono)',
                                        marginBottom: 10, border: '1px solid rgba(255,255,255,0.05)'
                                    }}>
                                        📅 {req.booking_date} ({req.start_time} - {req.end_time})
                                    </div>
                                    <p style={{ fontSize: 12, color: 'var(--student-white-dim)', fontStyle: 'italic', lineHeight: 1.5 }}>"{req.reason}"</p>
                                </div>
                            ))}
                        </div>
                    </Block>

                    <Block className="p-6">
                        <h3 style={{ fontFamily: 'var(--student-font-display)', fontSize: 16, fontWeight: 700, color: 'var(--student-white)', marginBottom: 6 }}>
                            History Log
                        </h3>
                        <div className="flex flex-col gap-2 mt-4">
                            {pastRequests.length === 0 ? (
                                <div style={{ textAlign: 'center', py: 10, fontSize: 12, color: 'var(--student-white-dim)' }}>No past history.</div>
                            ) : pastRequests.map(req => (
                                <div key={req.request_id} style={{
                                    padding: '12px 14px', borderRadius: 10,
                                    background: 'var(--student-black-4)', border: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}>
                                    <div style={{ minWidth: 0 }}>
                                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--student-white)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{req.faculty_name}</p>
                                        <p style={{ fontSize: 10, color: 'var(--student-white-dim)', fontFamily: 'var(--student-font-mono)', marginTop: 2 }}>{req.booking_date}</p>
                                    </div>
                                    <span style={{
                                        fontSize: 10, fontWeight: 700, padding: '4px 8px', borderRadius: 6, fontFamily: 'var(--student-font-mono)',
                                        background: req.status === 'APPROVED' ? 'rgba(39,174,96,0.1)' : 'rgba(231,76,60,0.1)',
                                        color: req.status === 'APPROVED' ? 'var(--student-green)' : 'var(--student-red)',
                                        border: `1px solid ${req.status === 'APPROVED' ? 'rgba(39,174,96,0.2)' : 'rgba(231,76,60,0.2)'}`
                                    }}>
                                        {req.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Block>
                </div>
            </div>
        </div>
    );
};

export default ConsultationBookingTab;
