import React, { useState } from 'react';
import { studentApi } from '../api/studentApi';

const SupportAssistantTab = () => {
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!subject.trim() || !description.trim()) return;

        setSubmitting(true);
        setError(null);
        
        try {
            await studentApi.submitSupportTicket({
                issue_subject: subject,
                issue_description: description
            });
            setSuccess(true);
            setSubject('');
            setDescription('');
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to submit the ticket. Please try again later.');
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="bg-[#1e2246] border border-emerald-500/30 p-8 rounded-2xl text-center fade-in">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-xl font-bold text-emerald-400 mb-2">Ticket Submitted!</h3>
                <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">
                    Our AI has successfully analyzed your request and routed it to the correct department. You will receive an update in the portal soon.
                </p>
                <button 
                    onClick={() => setSuccess(false)}
                    className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-sm font-bold transition-colors"
                >
                    Submit Another Request
                </button>
            </div>
        );
    }

    return (
        <div className="bg-[#1e2246] border border-white/5 p-6 rounded-2xl max-w-2xl mx-auto fade-in">
            <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-cyan-900/30 text-cyan-400 flex items-center justify-center text-2xl flex-shrink-0">
                    🤖
                </div>
                <div>
                    <h2 className="text-lg font-bold text-white mb-1">AI Support Desk</h2>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Describe your issue below. Our NLP system will analyze the text to predict the urgency and automatically route it to the correct department (IT, Registrar, Finance, or Academic Affairs).
                    </p>
                </div>
            </div>

            {error && (
                <div className="bg-rose-900/20 border border-rose-800/30 text-rose-400 text-xs p-3 rounded-xl mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-1">
                        Issue Subject
                    </label>
                    <input 
                        type="text"
                        required
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        placeholder="e.g. Cannot view my grades for last semester"
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-1">
                        Detailed Description
                    </label>
                    <textarea 
                        required
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Please provide as much detail as possible so the AI can accurately extract keywords and route your context..."
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all min-h-[120px] resize-y"
                    />
                </div>

                <button 
                    type="submit"
                    disabled={submitting || !subject.trim() || !description.trim()}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {submitting ? (
                        <>
                            <span className="w-4 h-4 rounded-full border-2 border-slate-900/20 border-t-slate-900 animate-spin"></span>
                            Analyzing & Routing...
                        </>
                    ) : (
                        'Submit Ticket via AI'
                    )}
                </button>
            </form>
        </div>
    );
};

export default SupportAssistantTab;
