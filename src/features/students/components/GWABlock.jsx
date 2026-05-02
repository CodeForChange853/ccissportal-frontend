// frontend/src/features/student/components/GWABlock.jsx
// PHASE 4: Sliced from StudentDashboard — GWA display block with sparkline.

import React from 'react';
import { Line } from 'react-chartjs-2';

export const computeGWA = (grades = []) => {
    const graded = grades.filter(
        g => g.final_grade != null && g.completion_status !== 'IN PROGRESS'
    );
    if (!graded.length) return null;

    const totalPoints = graded.reduce((sum, g) => sum + g.final_grade * (g.credit_units || 3), 0);
    const totalUnits = graded.reduce((sum, g) => sum + (g.credit_units || 3), 0);

    return totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : null;
};

export const gwaLabel = (gwa) => {
    if (!gwa) return { label: '—', color: '#64748b' };
    const v = parseFloat(gwa);
    if (v <= 1.5) return { label: 'Excellent', color: '#00c9b1' };
    if (v <= 2.5) return { label: 'Good', color: '#22d3ee' };
    if (v <= 3.0) return { label: 'Average', color: '#fbbf24' };
    return { label: 'Needs Work', color: '#ff5c6e' };
};

const Spark = ({ data = [], color = '#00c9b1', height = 40 }) => {
    const pts = data.length < 2 ? [...data, ...data] : data;
    const chartData = {
        labels: pts.map((_, i) => i),
        datasets: [{
            data: pts,
            borderColor: color,
            borderWidth: 1.5,
            backgroundColor: ctx => {
                if (!ctx.chart.chartArea) return 'transparent';
                const { ctx: c, chartArea: { top, bottom } } = ctx.chart;
                const g = c.createLinearGradient(0, top, 0, bottom);
                g.addColorStop(0, `${color}50`);
                g.addColorStop(1, `${color}00`);
                return g;
            },
            fill: true, tension: 0.45, pointRadius: 0,
        }],
    };
    const opts = {
        responsive: true, maintainAspectRatio: false, animation: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: { x: { display: false }, y: { display: false } },
    };
    return <div style={{ height }}><Line data={chartData} options={opts} /></div>;
};

const GWABlock = ({ profile, gwa, gwaMeta, sparkData, cleared }) => (
    <div
        className="rounded-2xl p-4"
        style={{ background: '#1e2246', border: '1px solid rgba(255,255,255,0.06)' }}
    >
        <div className="flex justify-between items-start mb-1">
            <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                    GWA · {profile?.course}
                </p>
                <div className="flex items-end gap-1.5 mt-0.5">
                    <span className="text-4xl font-black leading-none text-white">
                        {gwa ?? '—'}
                    </span>
                    <span className="text-xs font-bold pb-1" style={{ color: gwaMeta.color }}>
                        {gwaMeta.label}
                    </span>
                </div>
            </div>
            <div className="text-right">
                <p className="text-[10px] text-slate-500">
                    Yr {profile?.year_level} · {profile?.student_id}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: cleared ? '#00c9b1' : '#fbbf24' }}>
                    {cleared ? '✅ Cleared' : '⏳ Pending'}
                </p>
            </div>
        </div>
        {sparkData.length > 1 && (
            <Spark data={sparkData} color={gwaMeta.color} height={50} />
        )}
    </div>
);

export default GWABlock;