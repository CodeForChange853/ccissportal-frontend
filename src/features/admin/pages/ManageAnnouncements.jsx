import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import client from '../../../api/client';
import { useToast } from '../../../context/ToastContext';
import Skeleton from '../../../components/ui/Skeleton';

const ManageAnnouncements = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        title: '',
        body: '',
        type: 'announcement',
    });

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const { data } = await client.getAnnouncements();
            setAnnouncements(data);
        } catch (err) {
            toast.error('Failed to load announcements');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.body.trim()) {
            toast.warn('Title and body are required.');
            return;
        }

        setIsSubmitting(true);
        try {
            await adminApi.createAnnouncement(formData);
            toast.success('Announcement published successfully');
            setFormData({ title: '', body: '', type: 'announcement' });
            fetchAnnouncements();
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to publish announcement');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this announcement? This action cannot be undone.')) return;
        try {
            await adminApi.deleteAnnouncement(id);
            toast.success('Announcement deleted');
            fetchAnnouncements();
        } catch (err) {
            toast.error('Failed to delete announcement');
        }
    };

    const getBadgeStyle = (type) => {
        switch (type?.toLowerCase()) {
            case 'maintenance': return { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' };
            case 'incident': return { color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' };
            default: return { color: '#BA9731', bg: 'rgba(186,151,49,0.1)', border: 'rgba(186,151,49,0.3)' };
        }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
            {/* Create Form */}
            <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: 'var(--shadow-card)',
            }}>
                <div style={{ marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>Publish New Update</h2>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Broadcast announcements to the public portal.</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Type</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            style={{
                                width: '100%', padding: '10px 14px', borderRadius: '10px',
                                background: 'var(--bg-input)', border: '1px solid var(--border-default)',
                                color: 'var(--text-primary)', fontSize: '0.8rem', outline: 'none'
                            }}
                        >
                            <option value="announcement">Announcement</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="incident">Incident</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g. Enrollment Window Open"
                            disabled={isSubmitting}
                            style={{
                                width: '100%', padding: '10px 14px', borderRadius: '10px',
                                background: 'var(--bg-input)', border: '1px solid var(--border-default)',
                                color: 'var(--text-primary)', fontSize: '0.8rem', outline: 'none'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Message Body</label>
                        <textarea
                            name="body"
                            value={formData.body}
                            onChange={handleChange}
                            placeholder="Write the full announcement here..."
                            rows={6}
                            disabled={isSubmitting}
                            style={{
                                width: '100%', padding: '12px 14px', borderRadius: '10px',
                                background: 'var(--bg-input)', border: '1px solid var(--border-default)',
                                color: 'var(--text-primary)', fontSize: '0.8rem', outline: 'none',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                            padding: '12px', borderRadius: '10px',
                            background: 'var(--neon-cyan)', color: 'var(--bg-base)',
                            fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em',
                            border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            opacity: isSubmitting ? 0.7 : 1, transition: 'all 0.2s', marginTop: '8px',
                            boxShadow: '0 4px 14px rgba(0,245,255,0.2)'
                        }}
                    >
                        {isSubmitting ? 'Publishing...' : 'Publish Update'}
                    </button>
                </form>
            </div>

            {/* Existing Announcements List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Recent Broadcasts</h2>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}><Skeleton.Card /><Skeleton.Card /></div>
                ) : announcements.length === 0 ? (
                    <div style={{ padding: '32px 20px', textAlign: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>✦ No active announcements.</p>
                    </div>
                ) : (
                    announcements.map((ann) => {
                        const style = getBadgeStyle(ann.type);
                        return (
                            <div key={ann.id} style={{
                                padding: '16px 20px',
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border-default)',
                                borderRadius: '12px',
                                display: 'flex', flexDirection: 'column', gap: '10px',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{
                                            padding: '2px 6px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 700,
                                            textTransform: 'uppercase', letterSpacing: '0.1em',
                                            color: style.color, background: style.bg, border: `1px solid ${style.border}`
                                        }}>
                                            {ann.type}
                                        </span>
                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-code)' }}>{ann.created_at}</span>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(ann.id)}
                                        style={{
                                            background: 'transparent', border: 'none', color: 'var(--text-muted)',
                                            fontSize: '1rem', cursor: 'pointer', padding: '4px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            borderRadius: '4px', transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                                        title="Delete Announcement"
                                    >
                                        ×
                                    </button>
                                </div>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{ann.title}</h3>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-sec)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{ann.body}</p>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ManageAnnouncements;
