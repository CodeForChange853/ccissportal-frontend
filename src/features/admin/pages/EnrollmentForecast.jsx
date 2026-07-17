// frontend/src/features/admin/pages/EnrollmentForecast.jsx
// SE-01: Predictive Enrollment Demand Analytics dashboard

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import '../../../styles/components/enrollment-forecast.css';
import { adminApi } from '../api/adminApi';
import { useAdminRefresh } from '../layout/AdminLayout';
import Skeleton from '../../../components/ui/Skeleton';

/* ─── CSS ─────────────────────────────────────────────────────────────────── */


/* ─── Icons ───────────────────────────────────────────────────────────────── */
const IconChart = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 20h14v2H5v-2zM5 10h4v8H5v-8zm6-4h4v12h-4V6zm6-4h4v16h-4V2z"/>
  </svg>
);
const IconAlert = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
  </svg>
);
const IconSurge = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 14l3-3 3 3 5-5-1.4-1.4L13 11 10 8 5.6 12.4 7 14zM19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
  </svg>
);
const IconCapacity = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
);
const IconSpinner = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>
);
const IconSubjects = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
  </svg>
);
const IconSections = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z"/>
  </svg>
);
const IconFaculty = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
  </svg>
);

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const fmtDate = iso => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const semLabel = (yl, sem) => `Year ${yl} · Sem ${sem}`;
const semKey   = (yl, sem) => `${yl}-${sem}`;

const modelBadge = type => {
  if (type === 'LINEAR_REGRESSION')     return <span className="model-badge model-lr">Linear Reg</span>;
  if (type === 'SINGLE_POINT_HEURISTIC') return <span className="model-badge model-sp">Heuristic</span>;
  return <span className="model-badge model-nb">No Data</span>;
};

const trendInfo = (forecast) => {
  const hist = forecast.historical_data ?? [];
  if (hist.length < 2) return { dir: 'flat', pct: null };
  const sorted = [...hist].sort((a, b) => a.year - b.year);
  const last = sorted[sorted.length - 1].count;
  if (last === 0) return { dir: 'flat', pct: null };
  const pct = Math.round(((forecast.predicted_demand - last) / last) * 100);
  if (pct > 5) return { dir: 'up', pct };
  if (pct < -5) return { dir: 'down', pct };
  return { dir: 'flat', pct };
};

const TrendCell = ({ forecast }) => {
  const { dir, pct } = trendInfo(forecast);
  if (dir === 'up')   return <div className="tbl-trend tbl-trend-up">▲ +{pct}%</div>;
  if (dir === 'down') return <div className="tbl-trend tbl-trend-down">▼ {pct}%</div>;
  return <div className="tbl-trend tbl-trend-flat">— stable</div>;
};

const MiniHist = ({ data }) => {
  if (!data || data.length === 0) return <span className="tbl-hist">—</span>;
  const vals = data.map(d => d.count);
  const max  = Math.max(...vals) || 1;
  return (
    <div className="mini-hist">
      {vals.map((v, i) => (
        <div
          key={i}
          className="mini-bar"
          style={{
            height: `${Math.max(2, (v / max) * 16)}px`,
            background: i === vals.length - 1 ? '#D4AF5A' : '#3E3C3A',
          }}
          title={`${data[i].year}: ${v}`}
        />
      ))}
    </div>
  );
};

/* ─── KpiCard ─────────────────────────────────────────────────────────────── */
const KpiCard = ({ label, value, sub, icon, color = '#BA9731', badgeText, badgeClass = 'badge-gold' }) => (
  <div className="kpi-card">
    <div className="kpi-top">
      <div className="kpi-icon" style={{ background: `${color}18`, border: `1px solid ${color}22`, color }}>
        {icon}
      </div>
      {badgeText && <span className={`badge ${badgeClass}`}><span className="badge-dot"/>{badgeText}</span>}
    </div>
    <div className="kpi-val" style={{ color }}>{value ?? '—'}</div>
    <div>
      <div className="kpi-label">{label}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  </div>
);

/* ─── Alert Panel ────────────────────────────────────────────────────────── */
const AlertPanel = ({ alerts, onDismiss, dismissing }) => {
  if (!alerts.length) return null;
  return (
    <div className="panel" style={{ animation: 'fadeUp .5s .09s ease both' }}>
      <div className="panel-head">
        <div>
          <div className="panel-title">Capacity &amp; Demand Alerts</div>
          <div className="panel-sub">Auto-generated from latest forecast run</div>
        </div>
        <span className={`badge ${alerts.length > 2 ? 'badge-alert' : 'badge-warn'}`}>
          <span className="badge-dot"/>{alerts.length} ACTIVE
        </span>
      </div>
      <div className="panel-body">
        <div className="alert-grid">
          {alerts.map(a => {
            const isCapacity = a.alert_type === 'CAPACITY_EXCEEDED';
            return (
              <div key={a.alert_id} className={`alert-card ${isCapacity ? 'alert-card-capacity' : 'alert-card-surge'}`}>
                <div
                  className="alert-icon"
                  style={{ background: isCapacity ? 'rgba(239,68,68,.12)' : 'rgba(245,158,11,.12)', color: isCapacity ? '#EF4444' : '#F59E0B' }}
                >
                  {isCapacity ? <IconCapacity/> : <IconSurge/>}
                </div>
                <div className="alert-body">
                  <div className="alert-type" style={{ color: isCapacity ? '#EF4444' : '#F59E0B' }}>
                    {isCapacity ? 'Capacity Exceeded' : 'Demand Surge'}
                    {a.subject_code && <span style={{ marginLeft: '.5rem', opacity: .7 }}>· {a.subject_code}</span>}
                  </div>
                  <div className="alert-msg">{a.message}</div>
                </div>
                <button
                  className="dismiss-btn"
                  onClick={() => onDismiss(a.alert_id)}
                  disabled={dismissing === a.alert_id}
                  title="Dismiss alert"
                >
                  {dismissing === a.alert_id ? '…' : '✕'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ─── Demand Chart ───────────────────────────────────────────────────────── */
const YEAR_COLORS = ['#BA9731', '#D4AF5A', '#9A7D28', '#22C55E', '#63B3ED', '#F59E0B', '#E879F9', '#F472B6'];

const DemandChart = ({ forecasts, semFilter }) => {
  const [hovered, setHovered] = useState(null);

  const sorted = useMemo(() => {
    const filtered = semFilter === 'ALL'
      ? forecasts
      : forecasts.filter(f => semKey(f.target_year_level, f.target_semester) === semFilter);
    return [...filtered]
      .sort((a, b) => b.predicted_demand - a.predicted_demand)
      .slice(0, 15);
  }, [forecasts, semFilter]);

  if (!sorted.length) return (
    <div className="ef-empty">
      <div className="ef-empty-icon">📊</div>
      <div className="ef-empty-text">No forecast data. Run the forecast first.</div>
    </div>
  );

  const maxDemand = Math.max(...sorted.map(f => f.upper_bound || f.predicted_demand), 1);

  return (
    <div className="chart-container">
      {sorted.map((f, i) => {
        const pct    = (f.predicted_demand / maxDemand) * 100;
        const ciLo   = (f.lower_bound / maxDemand) * 100;
        const ciHi   = (f.upper_bound / maxDemand) * 100;
        const color  = YEAR_COLORS[(f.target_year_level - 1) % YEAR_COLORS.length];
        const isHov  = hovered === i;

        return (
          <div
            key={f.forecast_id}
            className="chart-row"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{ opacity: hovered !== null && !isHov ? .5 : 1, transition: 'opacity .15s' }}
          >
            <div className="chart-label" title={f.subject_code}>{f.subject_code}</div>
            <div className="chart-bar-area">
              {/* CI band */}
              {f.lower_bound !== f.upper_bound && (
                <div
                  className="chart-ci-band"
                  style={{
                    left: `${ciLo}%`,
                    width: `${Math.max(ciHi - ciLo, 0.5)}%`,
                    background: color,
                  }}
                />
              )}
              {/* Main bar */}
              <div
                className="chart-bar"
                style={{
                  width: `${pct}%`,
                  '--w': `${pct}%`,
                  background: `linear-gradient(to right, ${color}cc, ${color})`,
                  animationDelay: `${i * 0.04}s`,
                  boxShadow: isHov ? `0 0 12px ${color}55` : 'none',
                  transition: 'box-shadow .15s',
                }}
              />
              {/* Hover tooltip */}
              {isHov && (
                <div style={{
                  position: 'absolute', bottom: '100%', left: `${Math.min(pct, 70)}%`,
                  marginBottom: 4, transform: 'translateX(-50%)',
                  background: 'rgba(10,10,10,.95)', border: `1px solid ${color}55`,
                  borderTop: `2px solid ${color}`, borderRadius: 5,
                  padding: '5px 10px', whiteSpace: 'nowrap', zIndex: 20,
                  boxShadow: `0 4px 16px rgba(0,0,0,.5)`,
                }}>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.62rem', fontWeight: 700, color, marginBottom: 2 }}>
                    {f.subject_title}
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.58rem', color: '#B8B4AC' }}>
                    Predicted: <strong style={{ color }}>{f.predicted_demand}</strong> · CI: {f.lower_bound}–{f.upper_bound}
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.54rem', color: '#5A5550', marginTop: 2 }}>
                    {semLabel(f.target_year_level, f.target_semester)} · {f.forecast_academic_year}
                  </div>
                </div>
              )}
            </div>
            <div className="chart-val">{f.predicted_demand}</div>
            <div className="chart-ci-label">{f.lower_bound}–{f.upper_bound}</div>
          </div>
        );
      })}

      {/* Legend */}
      <div style={{ display: 'flex', gap: '.875rem', marginTop: '.875rem', flexWrap: 'wrap' }}>
        {[1, 2, 3, 4].map(yr => (
          <div key={yr} style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: YEAR_COLORS[yr - 1] }}/>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.58rem', color: '#5A5550' }}>Year {yr}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem', marginLeft: 'auto' }}>
          <div style={{ width: 20, height: 5, borderRadius: 3, background: 'rgba(186,151,49,.3)' }}/>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.56rem', color: '#5A5550' }}>90% CI band</span>
        </div>
      </div>
    </div>
  );
};

/* ─── Forecast Table ─────────────────────────────────────────────────────── */
const ForecastTable = ({ forecasts, semFilter }) => {
  const grouped = useMemo(() => {
    const filtered = semFilter === 'ALL'
      ? forecasts
      : forecasts.filter(f => semKey(f.target_year_level, f.target_semester) === semFilter);

    const map = {};
    filtered.forEach(f => {
      const k = semKey(f.target_year_level, f.target_semester);
      if (!map[k]) map[k] = { label: semLabel(f.target_year_level, f.target_semester), items: [] };
      map[k].items.push(f);
    });
    Object.values(map).forEach(g => g.items.sort((a, b) => b.predicted_demand - a.predicted_demand));

    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v);
  }, [forecasts, semFilter]);

  if (!grouped.length) return (
    <div className="ef-empty">
      <div className="ef-empty-icon">🔍</div>
      <div className="ef-empty-text">No subjects match the selected filter.</div>
    </div>
  );

  return (
    <table className="forecast-table">
      <thead>
        <tr>
          <th>Subject</th>
          <th>Title</th>
          <th>Year / Sem</th>
          <th>Predicted</th>
          <th>History</th>
          <th>Trend</th>
          <th>Model</th>
          <th>For Year</th>
        </tr>
      </thead>
      <tbody>
        {grouped.map(group => (
          <React.Fragment key={group.label}>
            <tr>
              <td colSpan={8} style={{ padding: 0 }}>
                <div className="sem-group-head">
                  <span className="sem-group-title">{group.label}</span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.52rem', color: '#5A5550', marginLeft: '.75rem' }}>
                    {group.items.length} subject{group.items.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </td>
            </tr>
            {group.items.map(f => (
              <tr key={f.forecast_id}>
                <td><span className="tbl-code">{f.subject_code}</span></td>
                <td><span className="tbl-title" title={f.subject_title}>{f.subject_title}</span></td>
                <td><span className="tbl-sem">{semLabel(f.target_year_level, f.target_semester)}</span></td>
                <td>
                  <div className="tbl-demand">{f.predicted_demand}</div>
                  <div className="tbl-ci">{f.lower_bound} – {f.upper_bound}</div>
                </td>
                <td><MiniHist data={f.historical_data}/></td>
                <td><TrendCell forecast={f}/></td>
                <td>{modelBadge(f.model_type)}</td>
                <td><span className="tbl-sem">{f.forecast_academic_year}</span></td>
              </tr>
            ))}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
};

/* ─── Main Page ──────────────────────────────────────────────────────────── */
const EnrollmentForecast = () => {
  const refreshTick = useAdminRefresh();

  const [summary,    setSummary]    = useState(null);
  const [alerts,     setAlerts]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [running,    setRunning]    = useState(false);
  const [runResult,  setRunResult]  = useState(null);
  const [dismissing, setDismissing] = useState(null);
  const [semFilter,  setSemFilter]  = useState('ALL');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumR, alertR] = await Promise.allSettled([
        adminApi.fetchEnrollmentForecast(),
        adminApi.fetchDemandAlerts(),
      ]);
      if (sumR.status   === 'fulfilled') setSummary(sumR.value);
      if (alertR.status === 'fulfilled') setAlerts(alertR.value ?? []);
    } catch {
      setError('Failed to load forecast data. The analytics tables may not exist yet — click "Run Forecast" to initialise them.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load, refreshTick]);

  const handleRunForecast = async () => {
    setRunning(true);
    setRunResult(null);
    try {
      const res = await adminApi.runForecast();
      setRunResult(res);
      await load();
    } catch {
      setRunResult({ status: 'ERROR', forecasts_generated: 0, data_points_used: 0, alerts_generated: 0 });
    } finally {
      setRunning(false);
    }
  };

  const handleDismiss = async (alertId) => {
    setDismissing(alertId);
    try {
      await adminApi.dismissDemandAlert(alertId);
      setAlerts(prev => prev.filter(a => a.alert_id !== alertId));
    } finally {
      setDismissing(null);
    }
  };

  const forecasts = summary?.forecasts ?? [];

  const semOptions = useMemo(() => {
    const keys = new Set(forecasts.map(f => semKey(f.target_year_level, f.target_semester)));
    return ['ALL', ...Array.from(keys).sort()];
  }, [forecasts]);

  const capacityPct = summary
    ? Math.round((summary.available_faculty_capacity / Math.max(summary.total_sections_needed, 1)) * 100)
    : null;
  const capacityOk = capacityPct === null ? null : capacityPct >= 100;

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Skeleton.PageHeader/>
      <Skeleton.KpiStrip count={5}/>
      <Skeleton.Card/>
    </div>
  );

  return (
    <div className="ef">

      {/* ── Header ── */}
      <div className="ef-header">
        <div>
          <div className="ef-sub">
            {summary?.last_updated
              ? `Last run: ${fmtDate(summary.last_updated)}`
              : 'No forecast data yet — run the model to generate predictions.'}
          </div>
        </div>
        <div className="ef-header-right">
          {runResult && (
            <span className={`badge ${runResult.status === 'SUCCESS' ? 'badge-ok' : 'badge-alert'}`}>
              <span className="badge-dot"/>
              {runResult.status === 'SUCCESS'
                ? `${runResult.forecasts_generated} subjects · ${runResult.alerts_generated} alert(s)`
                : 'Run failed'}
            </span>
          )}
          <button
            className={`run-btn${running ? ' run-btn--spinning' : ''}`}
            onClick={handleRunForecast}
            disabled={running}
          >
            {running ? <IconSpinner/> : <IconChart/>}
            {running ? 'Running…' : 'Run Forecast'}
          </button>
        </div>
      </div>

      <div className="ef-div"/>

      {error && <div className="ef-error">⚠ {error}</div>}

      {/* ── KPI Strip ── */}
      <div className="kpi-strip">
        <KpiCard
          label="Subjects Forecasted"
          value={summary?.total_subjects ?? 0}
          sub={`across all semesters`}
          icon={<IconSubjects/>}
          color="#BA9731"
        />
        <KpiCard
          label="Total Predicted Demand"
          value={summary?.total_predicted_demand?.toLocaleString() ?? '0'}
          sub="sum of all predicted enrollments"
          icon={<IconChart/>}
          color="#D4AF5A"
        />
        <KpiCard
          label="Sections Needed"
          value={summary?.total_sections_needed ?? 0}
          sub={`at ${40} students/section`}
          icon={<IconSections/>}
          color={summary?.total_sections_needed > (summary?.available_faculty_capacity ?? 0) ? '#EF4444' : '#F59E0B'}
          badgeText={summary?.total_sections_needed != null ? `${summary.total_sections_needed} sec` : null}
          badgeClass={summary?.total_sections_needed > (summary?.available_faculty_capacity ?? 0) ? 'badge-alert' : 'badge-warn'}
        />
        <KpiCard
          label="Faculty Capacity Left"
          value={summary?.available_faculty_capacity ?? '—'}
          sub="remaining teaching slots"
          icon={<IconFaculty/>}
          color={capacityOk === null ? '#5A5550' : capacityOk ? '#22C55E' : '#EF4444'}
          badgeText={capacityOk === null ? null : capacityOk ? 'COVERED' : 'SHORTFALL'}
          badgeClass={capacityOk ? 'badge-ok' : 'badge-alert'}
        />
        <KpiCard
          label="Active Alerts"
          value={alerts.length}
          sub="capacity + surge alerts"
          icon={<IconAlert/>}
          color={alerts.length > 2 ? '#EF4444' : alerts.length > 0 ? '#F59E0B' : '#22C55E'}
          badgeText={alerts.length > 0 ? `${alerts.length} open` : 'Clear'}
          badgeClass={alerts.length > 2 ? 'badge-alert' : alerts.length > 0 ? 'badge-warn' : 'badge-ok'}
        />
      </div>

      {/* ── Alerts ── */}
      <AlertPanel alerts={alerts} onDismiss={handleDismiss} dismissing={dismissing}/>

      {/* ── Demand Chart ── */}
      {forecasts.length > 0 && (
        <div className="panel" style={{ animation: 'fadeUp .5s .15s ease both' }}>
          <div className="panel-head">
            <div>
              <div className="panel-title">Predicted Demand by Subject</div>
              <div className="panel-sub">Top 15 · bars show predicted demand · shaded band = 90% confidence interval</div>
            </div>
            <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
              {semOptions.map(k => (
                <button
                  key={k}
                  className={`filter-btn${semFilter === k ? ' filter-btn--active' : ''}`}
                  onClick={() => setSemFilter(k)}
                >
                  {k === 'ALL' ? 'All' : `Y${k.split('-')[0]}S${k.split('-')[1]}`}
                </button>
              ))}
            </div>
          </div>
          <DemandChart forecasts={forecasts} semFilter={semFilter}/>
        </div>
      )}

      {/* ── Forecast Table ── */}
      <div className="panel" style={{ animation: 'fadeUp .5s .21s ease both' }}>
        <div className="panel-head">
          <div>
            <div className="panel-title">Full Forecast Table</div>
            <div className="panel-sub">
              Grouped by semester · sorted by predicted demand
              {summary?.last_updated && ` · generated ${fmtDate(summary.last_updated)}`}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
            {semOptions.map(k => (
              <button
                key={k}
                className={`filter-btn${semFilter === k ? ' filter-btn--active' : ''}`}
                onClick={() => setSemFilter(k)}
              >
                {k === 'ALL' ? 'All' : `Y${k.split('-')[0]}S${k.split('-')[1]}`}
              </button>
            ))}
          </div>
        </div>

        {forecasts.length === 0 ? (
          <div className="ef-empty">
            <div className="ef-empty-icon">📋</div>
            <div className="ef-empty-text">
              NO FORECAST DATA YET<br/>
              Click &quot;Run Forecast&quot; to generate predictions from enrollment history.
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <ForecastTable forecasts={forecasts} semFilter={semFilter}/>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnrollmentForecast;
