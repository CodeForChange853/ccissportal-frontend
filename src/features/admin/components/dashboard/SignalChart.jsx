import React, { useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale,
    PointElement, LineElement,
    Filler, Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const CHART_OPTIONS = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 400 },
    elements: {
        point: { radius: 2.5, hoverRadius: 5, borderWidth: 1.5 },
        line: { tension: 0.35, borderWidth: 1.8 },
    },
    plugins: {
        legend: { display: false },
        tooltip: {
            enabled: true,
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(5,8,22,0.95)',
            titleColor: '#00f5ff',
            bodyColor: '#8fb3c8',
            borderColor: 'rgba(0,245,255,0.25)',
            borderWidth: 1,
            bodyFont: { family: "'JetBrains Mono', monospace", size: 11 },
            titleFont: { family: "'JetBrains Mono', monospace", size: 10 },
            callbacks: {
                label: ctx => ` Confidence: ${ctx.raw ?? 0}%`,
            },
        },
    },
    scales: {
        y: {
            min: 0, max: 100,
            grid: { color: 'rgba(0,245,255,0.06)', drawBorder: false },
            ticks: { color: '#4a7a94', font: { family: "'JetBrains Mono', monospace", size: 10 }, stepSize: 25 },
            border: { display: false },
        },
        x: {
            grid: { display: false },
            ticks: { display: false },
            border: { display: false },
        },
    },
};

const SignalChart = ({ tickets = [] }) => {
    const chartData = useMemo(() => {
        const sorted = [...tickets]
            .filter(t => t.confidence_score != null)
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        let labels = sorted.map(t => new Date(t.created_at).toLocaleTimeString('en-US', { hour12: false }));
        let dataPoints = sorted.map(t => Math.round((t.confidence_score ?? 0) * 100));

        if (dataPoints.length < 10) {
            const pad = 10 - dataPoints.length;
            labels = [...Array(pad).fill(''), ...labels];
            dataPoints = [...Array(pad).fill(null), ...dataPoints];
        }

        if (dataPoints.length > 30) {
            labels = labels.slice(-30);
            dataPoints = dataPoints.slice(-30);
        }

        return {
            labels,
            datasets: [{
                label: 'Confidence',
                data: dataPoints,
                borderColor: '#00f5ff',
                pointBackgroundColor: '#050816',
                pointBorderColor: '#00f5ff',
                backgroundColor: (ctx) => {
                    if (!ctx.chart.chartArea) return 'transparent';
                    const { ctx: c, chartArea: { top, bottom } } = ctx.chart;
                    const g = c.createLinearGradient(0, top, 0, bottom);
                    g.addColorStop(0, 'rgba(0,245,255,0.22)');
                    g.addColorStop(1, 'rgba(0,245,255,0.00)');
                    return g;
                },
                fill: true,
                spanGaps: false,
            }],
        };
    }, [tickets]);

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <Line options={CHART_OPTIONS} data={chartData} />
        </div>
    );
};

export default React.memo(SignalChart);