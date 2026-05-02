import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import Toast from '../components/ui/Toast';

const statusConfig = {
  OPEN: { label: 'Open', cls: 'bg-stone-100 text-stone-600 border-stone-200' },
  TRIAGED: { label: 'Triaged', cls: 'bg-sky-100 text-sky-700 border-sky-200' },
  TRIASED: { label: 'Triaged', cls: 'bg-sky-100 text-sky-700 border-sky-200' }, // typo in DB
  RESOLVED: { label: 'Resolved', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
};

const categoryIcon = (cat) => {
  const map = { Registrar: '🏛️', Cashier: '💰', 'IT Support': '💻' };
  return map[cat] ?? '📌';
};

const SupportHub = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => setToast({ message: msg, type });

  const fetchTickets = async () => {
    setFetching(true);
    try {
      const res = await client.getMyTickets();
      setTickets(res.data || []);
    } catch {
      showToast('Could not load your tickets.', 'error');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  const submitTicket = async () => {
    if (!description.trim()) {
      showToast('Please describe your concern before submitting.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await client.createTicket({ description });
      setDescription('');
      showToast('Ticket submitted! Our AI triage will respond shortly.');
      fetchTickets();
    } catch (err) {
      showToast('Failed to submit ticket: ' + (err.response?.data?.detail ?? err.message), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-sky-50 to-indigo-50">

      <div className="fixed top-0 right-0 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
      <div className="fixed bottom-0 left-0 w-72 h-72 bg-amber-200/30 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/2" />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="relative max-w-3xl mx-auto px-4 py-8">


        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => navigate('/student/dashboard')}
              className="text-sm text-stone-400 hover:text-sky-600 font-medium transition-colors mb-1 flex items-center gap-1"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-2xl font-extrabold text-stone-800">💬 Support Hub</h1>
            <p className="text-stone-500 text-sm mt-0.5">Submit a concern — our AI triage will route it to the right office.</p>
          </div>
        </div>


        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-white p-6 mb-6">
          <h2 className="text-sm font-bold text-stone-600 uppercase tracking-wider mb-3">New Support Request</h2>
          <textarea
            className="w-full border border-stone-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 bg-stone-50 rounded-xl p-4 text-stone-700 text-sm outline-none resize-none transition-all"
            placeholder="Describe your concern in detail…
                        e.g. Missing grade in CS301, Cannot enroll in Math 10, Payment not reflected"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-stone-400">{description.length}/500 characters</p>
            <button
              onClick={submitTicket}
              disabled={submitting || !description.trim()}
              className="bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-6 py-2.5 rounded-xl transition-colors shadow-md shadow-sky-200 text-sm"
            >
              {submitting ? 'Submitting…' : '🚀 Submit to AI Triage'}
            </button>
          </div>
        </div>

        {/* Tickets list */}
        <h2 className="text-sm font-bold text-stone-600 uppercase tracking-wider mb-3 px-1">My Tickets</h2>

        {fetching ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-stone-400 text-sm">Loading tickets…</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white/80 backdrop-blur rounded-2xl border border-white p-12 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <p className="text-stone-500 font-medium">No tickets yet — everything looks good!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((t) => {
              const sc = statusConfig[t.status] ?? { label: t.status, cls: 'bg-stone-100 text-stone-600 border-stone-200' };
              return (
                <div
                  key={t.id}
                  className="bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-white p-5"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <p className="text-stone-700 text-sm font-medium leading-relaxed flex-1">{t.description}</p>
                    <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${sc.cls}`}>
                      {sc.label}
                    </span>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-3 text-xs text-stone-400 mb-3">
                    <span>#{t.id}</span>
                    {t.category && (
                      <span className="bg-stone-100 text-stone-600 border border-stone-200 px-2 py-0.5 rounded-full">
                        {categoryIcon(t.category)} {t.category}
                      </span>
                    )}
                    {t.confidence_score != null && (
                      <span className="text-stone-400">
                        AI confidence: {Math.round(t.confidence_score * 100)}%
                      </span>
                    )}
                  </div>

                  {/* AI Response */}
                  {t.ai_response && (
                    <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-sm text-sky-800">
                      <p className="text-xs font-bold text-sky-500 uppercase tracking-wider mb-1">🤖 AI Response</p>
                      {t.ai_response}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default SupportHub;