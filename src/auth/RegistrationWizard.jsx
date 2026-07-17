import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from './AuthContext';
import useSystemHealth from '../hooks/useSystemHealth';
import ScannerOverlay from '../components/visuals/ScannerOverlay';
import Toast from '../components/ui/Toast';
import GlassBackground from '../components/public/GlassBackground';

// 2-step flow:
//   Step 1 — COR Upload    : AI extracts name, student ID, subjects automatically
//   Step 2 — Account Setup : Student enters email + password only (+ course select)
const STEPS_META = ['COR Upload', 'Account Setup'];

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

const DocIcon = () => (
  <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
    <rect x="8" y="4" width="26" height="36" rx="3" stroke="rgba(186,151,49,0.5)" strokeWidth="1.5" fill="rgba(186,151,49,0.06)" />
    <rect x="14" y="4" width="20" height="10" rx="2" fill="rgba(186,151,49,0.08)" stroke="rgba(186,151,49,0.3)" strokeWidth="1.2" />
    <path d="M34 14l6 6v20a3 3 0 01-3 3H11a3 3 0 01-3-3V7a3 3 0 013-3h23" stroke="rgba(186,151,49,0.4)" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M34 14h6l-6-6v6z" fill="rgba(186,151,49,0.15)" stroke="rgba(186,151,49,0.35)" strokeWidth="1" />
    <path d="M15 24h18M15 30h12" stroke="rgba(186,151,49,0.4)" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const StepIndicator = ({ current }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: '2rem', position: 'relative', padding: '0 0.5rem',
  }}>
    <div style={{
      position: 'absolute', top: 14, left: '0.5rem', right: '0.5rem',
      height: 1, background: 'rgba(186,151,49,0.12)', zIndex: 0,
    }} />
    <div style={{
      position: 'absolute', top: 14, left: '0.5rem', height: 1, zIndex: 0,
      width: `${((current - 1) / (STEPS_META.length - 1)) * 100}%`,
      maxWidth: 'calc(100% - 1rem)',
      background: 'linear-gradient(90deg, rgba(186,151,49,0.4), #BA9731)',
      transition: 'width 0.5s ease',
    }} />
    {STEPS_META.map((label, idx) => {
      const num = idx + 1;
      const done = num < current;
      const active = num === current;
      return (
        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, zIndex: 1 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.78rem', fontWeight: 700,
            border: `2px solid ${done ? '#BA9731' : active ? '#BA9731' : 'rgba(186,151,49,0.20)'}`,
            background: done ? '#BA9731' : active ? 'rgba(186,151,49,0.12)' : 'rgba(255,248,235,0.04)',
            color: done ? '#06050A' : active ? 'rgba(255,248,235,0.92)' : 'rgba(255,248,235,0.28)',
            transition: 'all 0.3s ease',
            boxShadow: active ? '0 0 0 4px rgba(186,151,49,0.15)' : 'none',
          }}>
            {done ? '✓' : num}
          </div>
          <span style={{
            fontSize: 'var(--text-label)', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.08em',
            color: done ? '#BA9731' : active ? 'rgba(255,248,235,0.92)' : 'rgba(255,248,235,0.28)',
            transition: 'color 0.3s ease',
          }}>
            {label}
          </span>
        </div>
      );
    })}
  </div>
);

const Field = ({ label, hint, error, children }) => (
  <div>
    <label style={{
      display: 'block', fontSize: 'var(--text-label)', fontWeight: 700,
      letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 6,
      color: error ? 'rgba(255,100,100,0.85)' : 'var(--glass-text-label)',
    }}>
      {label}
      {hint && (
        <span style={{ marginLeft: 6, textTransform: 'none', fontWeight: 400, color: 'var(--glass-text-muted)' }}>
          {hint}
        </span>
      )}
    </label>
    {children}
    {error && (
      <p style={{ fontSize: 'var(--text-small)', color: 'rgba(255,100,100,0.85)', marginTop: 4 }}>
        {error}
      </p>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

const RegistrationWizard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession } = useAuth();
  const { enrollmentOpen, loading: systemLoading } = useSystemHealth(30000);

  const [step,           setStep]           = useState(1);
  const [loading,        setLoading]        = useState(false);
  const [statusMsg,      setStatus]         = useState('');
  const [error,          setError]          = useState('');
  const [fieldErrs,      setFieldErrs]      = useState({});
  const [toast,          setToast]          = useState(null);
  const [previewImg,     setPreview]        = useState(null);
  const [failCount,      setFailCount]      = useState(0);
  const [corNeedsReview, setCorNeedsReview] = useState(false);

  const [regData, setRegData] = useState({
    studentId:       '',
    fullName:        '',
    course:          'BSCS',
    email:           '',
    password:        '',
    confirmPassword: '',
    scannedSubjects: [],
    corToken:        '',
  });

  const enteredPasskey = location.state?.enteredPasskey || '';

  useEffect(() => {
    if (systemLoading) return;
    if (!location.state?.claimedId) {
      navigate('/', { replace: true });
    } else if (!enrollmentOpen) {
      navigate('/', { replace: true });
    } else {
      setRegData(prev => ({ ...prev, studentId: location.state.claimedId }));
    }
  }, [location, navigate, enrollmentOpen, systemLoading]);

  const showToast = (msg, type = 'success') => setToast({ message: msg, type });
  const set = (k, v) => setRegData(prev => ({ ...prev, [k]: v }));

  const passwordStrength = (pw) => ({
    length:    pw.length >= 8,
    uppercase: /[A-Z]/.test(pw),
    number:    /\d/.test(pw),
    special:   /[^a-zA-Z0-9]/.test(pw),
  });

  const validatePassword = (pw) => {
    if (pw.length < 8)          return 'Minimum 8 characters required.';
    if (!/[A-Z]/.test(pw))      return 'Must include at least one uppercase letter.';
    if (!/\d/.test(pw))         return 'Must include at least one number.';
    if (!/[^a-zA-Z0-9]/.test(pw)) return 'Must include at least one special character.';
    return null;
  };

  const pollScan = async (scanToken, max = 30) => {
    for (let i = 0; i < max; i++) {
      const res = await client.get(`/documents/status/${scanToken}`);
      const { processing_status, error_message } = res.data;
      if (processing_status === 'COMPLETED' || processing_status === 'MANUALLY_VERIFIED') return { ...res.data, needsReview: false };
      if (processing_status === 'NEEDS_REVIEW') return { ...res.data, needsReview: true };
      if (processing_status === 'FAILED' || processing_status === 'ERROR')
        throw new Error(error_message || 'AI scan failed. Please upload a clearer image.');
      await new Promise(r => setTimeout(r, 2000));
    }
    throw new Error('Document analysis timed out. Please try again.');
  };

  const handleCORScan = async (file) => {
    if (!enrollmentOpen) { setError('Enrollment is currently closed.'); return; }
    if (failCount >= 3)  { setError('Too many failed attempts. Please wait a few minutes.'); return; }
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('File too large — max 5 MB.'); return; }

    setPreview(URL.createObjectURL(file));
    setLoading(true); setStatus('UPLOADING…'); setError(''); setCorNeedsReview(false);

    try {
      const { data: scanInit } = await client.scanDocument(file, 'COR');
      setStatus('AI READING SUBJECTS…');
      const result = await pollScan(scanInit.secure_scan_token);
      setFailCount(0);

      let subjects = [], extractedName = '', extractedStudentId = '';

      if (result?.extracted_ai_data) {
        let parsed = {};
        try { parsed = JSON.parse(result.extracted_ai_data); } catch { /* ignore */ }
        const ed = parsed.extracted_data || {};
        subjects = ed.subjects ?? [];
        extractedName = ed.full_name ?? '';
        extractedStudentId = ed.student_id ?? '';
      }

      if (extractedStudentId) {
        const norm = s => s.replace(/[^a-zA-Z0-9]/g, '');
        if (norm(extractedStudentId) !== norm(regData.studentId)) {
          setError(
            `ID note: COR shows "${extractedStudentId}" but you entered "${regData.studentId}". ` +
            `The registrar will verify — proceed if this is your COR.`
          );
        }
      }

      setCorNeedsReview(result.needsReview);
      setRegData(prev => ({
        ...prev,
        corToken:        scanInit.secure_scan_token,
        scannedSubjects: subjects,
        fullName:        extractedName || prev.fullName,
      }));

      showToast(result.needsReview
        ? 'COR uploaded — a registrar will verify your subjects.'
        : `${subjects.length} subjects extracted!`,
        result.needsReview ? 'info' : 'success'
      );
      setStep(2);
    } catch (err) {
      setFailCount(prev => prev + 1);
      setError(`COR scan failed: ${err.message}. You can still complete registration — a registrar will assign subjects.`);
      setStep(2);
    } finally {
      setLoading(false); setPreview(null);
    }
  };

  const handleSubmit = async () => {
    const e = {};
    if (!regData.email.includes('@'))                   e.email           = 'Enter a valid email address.';
    const pwErr = validatePassword(regData.password);
    if (pwErr)                                          e.password        = pwErr;
    if (regData.password !== regData.confirmPassword)   e.confirmPassword = 'Passwords do not match.';
    if (Object.keys(e).length) { setFieldErrs(e); return; }

    setFieldErrs({}); setLoading(true); setStatus('CREATING ACCOUNT…'); setError('');
    try {
      const nameParts = (regData.fullName || 'Student').trim().split(' ');
      const response = await client.submitRegistration({
        email_address:          regData.email,
        plain_text_password:    regData.password,
        passkey_code:           enteredPasskey,
        account_role:           'STUDENT',
        id_verification_token:  null,
        cor_verification_token: regData.corToken || null,
        first_name:             nameParts[0] || 'Student',
        last_name:              nameParts.slice(1).join(' ') || '',
        student_number:         regData.studentId || null,
        course:                 regData.course || 'BSCS',
      });

      const success = setSession(response.data);
      if (success) {
        showToast('Account created! Welcome aboard.');
        setTimeout(() => navigate('/portal/student', { replace: true }), 1500);
      } else {
        showToast('Account created! Please log in.', 'info');
        setTimeout(() => navigate('/login', { replace: true }), 1500);
      }
    } catch (err) {
      setError(`Registration failed: ${err.response?.data?.detail ?? err.message}`);
      setLoading(false);
    }
  };

  return (
    <GlassBackground style={{ padding: '2rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div id="main-content" style={{ width: '100%', maxWidth: '44rem', position: 'relative' }}>
        <div className="glass-panel-elevated glass-slide-up" style={{ overflow: 'hidden' }}>

          <div className="glass-accent-bar" />

          <div style={{
            padding: '1.5rem 2rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderBottom: '1px solid rgba(186,151,49,0.10)',
          }}>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: 'var(--glass-text-primary)' }}>
                Student <span style={{ color: '#BA9731' }}>Enrollment</span>
              </h2>
              <p style={{ fontSize: 'var(--text-label)', color: 'var(--glass-text-label)', margin: '3px 0 0', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                AI-Powered Registration
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 'var(--text-label)', color: 'var(--glass-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 2px' }}>
                Student ID
              </p>
              <p style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#BA9731', fontFamily: "'JetBrains Mono', monospace" }}>
                {regData.studentId}
              </p>
            </div>
          </div>

          <div style={{ padding: '1.75rem 2rem 0' }}>
            <StepIndicator current={step} />
          </div>

          <div style={{ padding: '0 2rem 2rem', minHeight: '22rem' }}>

            {error && (
              <div className="glass-alert-danger" style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 'var(--text-small)', marginBottom: '1.25rem' }}>
                <span style={{ flexShrink: 0, marginTop: 1 }}>⚠</span>
                <span>{error}</span>
              </div>
            )}

            {step === 1 && (
              <div style={{ textAlign: 'center' }}>
                {loading || previewImg ? (
                  <ScannerOverlay imageSrc={previewImg} isActive={loading} label={statusMsg} type="COR" />
                ) : (
                  <>
                    <p style={{ fontSize: 'var(--text-body)', color: 'var(--glass-text-secondary)', marginBottom: '1.25rem', lineHeight: 1.7, textAlign: 'left' }}>
                      Upload your <strong style={{ color: 'var(--glass-text-primary)' }}>Certificate of Registration (COR)</strong>.
                      The AI will automatically extract your name, student ID, and enrolled subjects.
                      You will only need to create your email and password in the next step.
                    </p>

                    <label
                      style={{
                        display: 'block', borderRadius: '0.875rem', padding: '2.5rem 2rem',
                        textAlign: 'center', cursor: 'pointer',
                        border: '2px dashed rgba(186,151,49,0.25)',
                        background: 'rgba(186,151,49,0.04)',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'rgba(186,151,49,0.55)';
                        e.currentTarget.style.background = 'rgba(186,151,49,0.09)';
                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(186,151,49,0.15)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'rgba(186,151,49,0.25)';
                        e.currentTarget.style.background = 'rgba(186,151,49,0.04)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                        <DocIcon />
                      </div>
                      <p style={{ fontWeight: 700, color: 'var(--glass-text-primary)', marginBottom: 4, fontSize: 'var(--text-heading)' }}>
                        Upload Certificate of Registration
                      </p>
                      <p style={{ fontSize: 'var(--text-small)', color: 'var(--glass-text-muted)', marginBottom: '1rem', letterSpacing: '0.06em' }}>
                        AI extracts your name · student ID · subjects · JPG / PNG / PDF · max 5 MB
                      </p>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        fontSize: 'var(--text-label)', fontWeight: 600,
                        padding: '0.35rem 0.875rem', borderRadius: '100px',
                        background: 'rgba(186,151,49,0.09)', color: '#BA9731',
                        border: '1px solid rgba(186,151,49,0.28)', letterSpacing: '0.06em',
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#BA9731', display: 'inline-block', animation: 'glass-pulse-dot 2s ease-in-out infinite' }} />
                        DOCUMENT AI READY
                      </span>
                      <input type="file" style={{ display: 'none' }} accept="image/*,application/pdf" onChange={e => handleCORScan(e.target.files[0])} />
                    </label>
                  </>
                )}

                {!loading && !previewImg && (
                  <button
                    onClick={() => setStep(2)}
                    style={{
                      marginTop: '1.25rem', background: 'transparent', border: 'none',
                      fontSize: 'var(--text-small)', color: 'var(--glass-text-muted)', cursor: 'pointer',
                      fontFamily: "'Inter', system-ui, sans-serif", transition: 'color 0.15s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,100,100,0.75)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--glass-text-muted)'; }}
                  >
                    <span>⚠</span>
                    Skip COR Upload — info will be filled manually by the registrar
                  </button>
                )}
              </div>
            )}

            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                <div style={{
                  borderRadius: '0.875rem', padding: '1rem 1.25rem',
                  background: 'rgba(255,248,235,0.05)', border: '1px solid rgba(186,151,49,0.12)',
                  backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                }}>
                  <p style={{ fontSize: 'var(--text-label)', color: 'var(--glass-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
                    Extracted from COR
                  </p>

                  {[
                    ['Student ID', regData.studentId || '—'],
                    ['Full Name',  regData.fullName  || 'Not extracted — registrar will confirm'],
                    ['Subjects',   regData.scannedSubjects.length > 0
                      ? `${regData.scannedSubjects.length} subject(s) found`
                      : 'None — registrar will assign'],
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.45rem 0', borderBottom: '1px solid rgba(186,151,49,0.08)' }}>
                      <span style={{ fontSize: 'var(--text-small)', color: 'var(--glass-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>{label}</span>
                      <span style={{ fontSize: 'var(--text-body)', color: 'var(--glass-text-primary)', fontWeight: 600, maxWidth: '60%', textAlign: 'right' }}>{value}</span>
                    </div>
                  ))}

                  {regData.scannedSubjects.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: '0.625rem' }}>
                      {regData.scannedSubjects.map((s, i) => (
                        <span key={i} style={{ fontSize: 'var(--text-label)', fontFamily: "'JetBrains Mono', monospace", padding: '0.2rem 0.55rem', borderRadius: '100px', background: 'rgba(186,151,49,0.10)', color: '#DACE84', border: '1px solid rgba(186,151,49,0.30)', fontWeight: 600 }}>
                          {s.code}
                        </span>
                      ))}
                    </div>
                  )}

                  {corNeedsReview && (
                    <div className="glass-alert-warning" style={{ marginTop: '0.75rem', fontSize: 'var(--text-small)', lineHeight: 1.6 }}>
                      ⚠ Low AI confidence — a registrar will manually verify your subjects before enrollment is finalised.
                    </div>
                  )}
                </div>

                <Field label="Course / Program">
                  <select className="glass-input" value={regData.course} onChange={e => set('course', e.target.value)} style={{ colorScheme: 'dark' }}>
                    <option value="BSCS">BSCS — Computer Science</option>
                    <option value="BSIT">BSIT — Information Technology</option>
                    <option value="BSIS">BSIS — Information Systems</option>
                  </select>
                </Field>

                <Field label="Email Address" error={fieldErrs.email}>
                  <input className="glass-input" type="email" value={regData.email} placeholder="student@university.edu.ph" maxLength={150} onChange={e => set('email', e.target.value)} style={fieldErrs.email ? { borderColor: 'rgba(220,38,38,0.50)' } : {}} />
                </Field>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <Field label="Create Password" hint="(8+ chars)" error={fieldErrs.password}>
                      <input className="glass-input" type="password" value={regData.password} maxLength={100} onChange={e => set('password', e.target.value)} style={fieldErrs.password ? { borderColor: 'rgba(220,38,38,0.50)' } : {}} />
                    </Field>
                    {regData.password && (() => {
                      const s = passwordStrength(regData.password);
                      return (
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 6 }}>
                          {[
                            { key: 'length',    label: '8+ chars' },
                            { key: 'uppercase', label: 'Uppercase' },
                            { key: 'number',    label: 'Number' },
                            { key: 'special',   label: 'Special' },
                          ].map(({ key, label }) => (
                            <span key={key} style={{
                              fontSize: 'var(--text-label)', padding: '2px 7px', borderRadius: 100, fontWeight: 600,
                              background: s[key] ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.09)',
                              color: s[key] ? 'rgba(134,239,172,0.9)' : 'rgba(252,165,165,0.7)',
                              border: `1px solid ${s[key] ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.18)'}`,
                            }}>
                              {s[key] ? '✓' : '✗'} {label}
                            </span>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                  <Field label="Confirm Password" error={fieldErrs.confirmPassword}>
                    <input className="glass-input" type="password" value={regData.confirmPassword} maxLength={100} onChange={e => set('confirmPassword', e.target.value)} style={fieldErrs.confirmPassword ? { borderColor: 'rgba(220,38,38,0.50)' } : {}} />
                  </Field>
                </div>

                <button className="glass-btn-primary" onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: '0.975rem', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  {loading ? (
                    <>
                      <span style={{ width: 16, height: 16, border: '2px solid rgba(186,151,49,0.25)', borderTopColor: '#BA9731', borderRadius: '50%', display: 'inline-block', animation: 'glass-spin-ring 0.8s linear infinite' }} />
                      {statusMsg || 'Creating account…'}
                    </>
                  ) : '✓ Complete Registration'}
                </button>

                <p style={{ textAlign: 'center', fontSize: 'var(--text-small)', color: 'var(--glass-text-muted)', marginTop: 4 }}>
                  You will be automatically logged in after registration.
                </p>

                <button
                  onClick={() => setStep(1)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'var(--text-small)', color: 'var(--glass-text-muted)', fontFamily: "'Inter', system-ui, sans-serif", textAlign: 'center', transition: 'color 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--glass-text-secondary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--glass-text-muted)'; }}
                >
                  ← Re-upload COR
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </GlassBackground>
  );
};

export default RegistrationWizard;
