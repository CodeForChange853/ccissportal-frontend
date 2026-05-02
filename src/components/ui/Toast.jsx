import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); 
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgStyles = type === 'success' 
    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
    : 'bg-rose-500/10 border-rose-500 text-rose-400';

  const icon = type === 'success' ? '✅' : '⚠️';

  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-6 py-4 rounded-xl border backdrop-blur-md shadow-2xl animate-slide-in ${bgStyles}`}>
      <span className="text-xl">{icon}</span>
      <div>
        <p className="font-bold text-sm uppercase tracking-wider">{type}</p>
        <p className="text-sm font-medium opacity-90">{message}</p>
      </div>
      <button onClick={onClose} className="ml-4 hover:opacity-70">✕</button>
    </div>
  );
};

export default Toast;