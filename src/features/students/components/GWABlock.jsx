import React from 'react';
import { Line } from 'react-chartjs-2';

export const computeGWA = (grades = []) => {
    const graded = grades.filter(
        g => g.final_grade != null && g.completion_status !== 'IN PROGRESS'
    );
    if (!graded.length) return null;

    const totalPoints = graded.reduce((sum, g) => sum + parseFloat(g.final_grade) * (g.credit_units || 3), 0);
    const totalUnits = graded.reduce((sum, g) => sum + (g.credit_units || 3), 0);

    return totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : null;
};

export const gwaLabel = (gwa) => {
    if (!gwa) return { label: '—', color: 'var(--student-white-dim)' };
    const v = parseFloat(gwa);
    if (v <= 1.5) return { label: 'Excellent', color: 'var(--student-gold-2)' };
    if (v <= 2.5) return { label: 'Good', color: 'var(--student-gold-3)' };
    if (v <= 3.0) return { label: 'Average', color: 'var(--student-white-dim)' };
    return { label: 'Needs Work', color: 'var(--student-red)' };
};

const Spark = ({ data = [], color = '#C9A84C', height = 60 }) => {
    const pts = data.length < 2 ? [...data, ...data] : data;
    const chartData = {
        labels: pts.map((_, i) => i),
        datasets: [{
            data: pts,
            borderColor: color,
            borderWidth: 2,
            backgroundColor: ctx => {
                if (!ctx.chart.chartArea) return 'transparent';
                const { ctx: c, chartArea: { top, bottom } } = ctx.chart;
                const g = c.createLinearGradient(0, top, 0, bottom);
                g.addColorStop(0, `${color}40`);
                g.addColorStop(1, 'transparent');
                return g;
            },
            fill: true, tension: 0.4, pointRadius: 0,
        }],
    };
    const opts = {
        responsive: true, maintainAspectRatio: false, animation: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: { x: { display: false }, y: { display: false } },
    };
    return <div style={{ height }} className="mt-2"><Line data={chartData} options={opts} /></div>;
};

const GWABlock = ({ profile, gwa, gwaMeta, sparkData, cleared }) => (
    <div
        className="rounded-2xl p-6 overflow-hidden relative"
        style={{ 
            background: 'var(--student-black-3)', 
            border: '1px solid rgba(201, 168, 76, 0.12)' 
        }}
    >
        <div 
            className="absolute top-0 left-0 right-0 h-[2px]" 
            style={{ background: 'linear-gradient(90deg, var(--student-gold), transparent)' }} 
        />
        
        <div className="flex justify-between items-start mb-2">
            <div>
                <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-student-white-dim mb-1" style={{ fontFamily: 'var(--student-font-mono)' }}>
                    Current Academic Standing
                </p>
                <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-black text-student-gold-2" style={{ fontFamily: 'var(--student-font-display)', lineHeight: 1 }}>
                        {gwa ?? '—'}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: gwaMeta.color, fontFamily: 'var(--student-font-mono)' }}>
                        {gwaMeta.label}
                    </span>
                </div>
            </div>
            <div className="text-right">
                <p className="text-[10px] text-student-gold font-mono font-bold tracking-tighter">
                    ID: {profile?.student_id}
                </p>
                <div className={`text-[10px] mt-1.5 px-3 py-0.5 rounded-full inline-block font-bold font-mono ${cleared ? 'bg-student-green/10 text-student-green border border-student-green/30' : 'bg-student-gold/10 text-student-gold border border-student-gold/30'}`}>
                    {cleared ? 'CLEARED' : 'PENDING'}
                </div>
            </div>
        </div>
        
        {sparkData.length > 1 && (
            <Spark data={sparkData} color="var(--student-gold)" height={65} />
        )}

        <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
            <p className="text-[11px] text-student-white-dim font-medium italic">
                {profile?.course} — Year {profile?.year_level}
            </p>
            <div className="flex gap-1">
                {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: i <= 3 ? 'var(--student-gold)' : 'var(--student-black-5)' }} />
                ))}
            </div>
        </div>
    </div>
);

export default GWABlock;