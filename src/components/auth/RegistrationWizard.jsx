import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import ScannerOverlay from '../visuals/ScannerOverlay';
import Toast from '../ui/Toast';

const P = {
  page: '#F2F2F2',
  depth: '#E8E4DC',
  surface: '#FEFEFE',
  black: '#0D0D0D',
  blackSoft: '#1A1A1A',
  gold: '#BA9731',
  goldLight: '#DACE84',
  goldDim: 'rgba(186,151,49,0.09)',
  goldBorder: 'rgba(186,151,49,0.28)',
  goldGlow: 'rgba(186,151,49,0.22)',
  text: '#0D0D0D',
  textSec: '#3A3A3A',
  textMuted: '#7A7A7A',
  border: 'rgba(0,0,0,0.09)',
  borderSoft: 'rgba(0,0,0,0.05)',
  danger: '#dc2626',
  dangerBg: 'rgba(220,38,38,0.07)',
  dangerBd: 'rgba(220,38,38,0.22)',
  success: '#16a34a',
  successBg: 'rgba(22,163,74,0.07)',
  successBd: 'rgba(22,163,74,0.22)',
  font: "'Plus Jakarta Sans', system-ui, sans-serif",
  fontMono: "'JetBrains Mono', monospace",
};

const STEPS_META = ['ID Scan', 'Personal Info', 'COR Upload', 'Review'];

const StepIndicator = ({ current }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', position: 'relative', padding: '0 0.5rem' }}>
    <div style={{
      position: 'absolute', top: 14, left: '0.5rem', right: '0.5rem', height: 1,
      background: P.border, zIndex: 0,
    }} />
    <div style={{
      position: 'absolute', top: 14, left: '0.5rem', height: 1, zIndex: 0,
      width: `${((current - 1) / (STEPS_META.length - 1)) * 100}%`,
      maxWidth: 'calc(100% - 1rem)',
      background: `linear-gradient(90deg, ${P.black}, ${P.gold})`,
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
            fontSize: '0.72rem', fontWeight: 700,
            border: `2px solid ${done ? P.gold : active ? P.black : P.border}`,
            background: done ? P.gold : active ? P.black : P.surface,
            color: done ? P.surface : active ? P.surface : P.textMuted,
            transition: 'all 0.3s ease',
            boxShadow: active ? `0 0 0 4px rgba(186,151,49,0.15)` : 'none',
          }}>
            {done ? '✓' : num}
          </div>
          <span style={{
            fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: done ? P.gold : active ? P.black : P.textMuted,
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
      display: 'block', fontSize: '0.65rem', fontWeight: 700,
      letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 6,
      color: error ? P.danger : P.gold,
      fontFamily: P.font,
    }}>
      {label}
      {hint && <span style={{ marginLeft: 6, textTransform: 'none', fontWeight: 400, color: P.textMuted }}>{hint}</span>}
    </label>
    {children}
    {error && (
      <p style={{ fontSize: '0.7rem', color: P.danger, marginTop: 4, fontFamily: P.fontMono }}>{error}</p>
    )}
  </div>
);

const inputBase = {
  width: '100%', boxSizing: 'border-box',
  background: P.page, border: `1px solid ${P.border}`,
  borderRadius: '0.5rem', padding: '0.7rem 0.875rem',
  color: P.text, fontSize: '0.875rem',
  fontFamily: P.font, outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

const inputFocus = (e) => {
  e.target.style.borderColor = P.gold;
  e.target.style.boxShadow = `0 0 0 3px rgba(186,151,49,0.12)`;
};
const inputBlur = (e) => {
  e.target.style.borderColor = P.border;
  e.target.style.boxShadow = 'none';
};

const UploadZone = ({ icon, title, sub, badge, accent = P.gold, accept, onChange }) => {
  const borderColor = `${accent}44`;
  const hoverBorder = `${accent}88`;
  const bg = `${accent}08`;

  return (
    <label
      style={{
        display: 'block', borderRadius: '0.875rem', padding: '2.5rem 2rem',
        textAlign: 'center', cursor: 'pointer',
        border: `2px dashed ${borderColor}`,
        background: bg,
        transition: 'all 0.2s ease',
        fontFamily: P.font,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = hoverBorder;
        e.currentTarget.style.background = `${accent}12`;
        e.currentTarget.style.boxShadow = `0 8px 32px ${accent}18`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = borderColor;
        e.currentTarget.style.background = bg;
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{icon}</div>
      <p style={{ fontWeight: 700, color: P.text, marginBottom: 4, fontSize: '0.95rem' }}>{title}</p>
      <p style={{ fontSize: '0.72rem', color: P.textMuted, marginBottom: '1rem', fontFamily: P.fontMono }}>{sub}</p>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontSize: '0.65rem', fontFamily: P.fontMono, fontWeight: 600,
        padding: '0.35rem 0.875rem', borderRadius: '100px',
        background: `${accent}12`, color: accent, border: `1px solid ${accent}40`,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: accent, display: 'inline-block', animation: 'pulse 2s infinite' }} />
        {badge}
      </span>
      <input type="file" style={{ display: 'none' }} accept={accept} onChange={onChange} />
    </label>
  );
};

const RegistrationWizard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatus] = useState('');
  const [error, setError] = useState('');
  const [fieldErrs, setFieldErrs] = useState({});
  const [toast, setToast] = useState(null);
  const [previewImg, setPreview] = useState(null);
  const [scanType, setScanType] = useState('ID');

  const [regData, setRegData] = useState({
    studentId: '', fullName: '', course: 'BSCS',
    email: '', password: '', confirmPassword: '',
    idFile: null, corFile: null,
    scannedSubjects: [], verificationToken: '',
  });

  const enteredPasskey = location.state?.enteredPasskey || '';

  useEffect(() => {
    if (!location.state?.claimedId) {
      navigate('/', { replace: true });
    } else {
      setRegData(prev => ({ ...prev, studentId: location.state.claimedId }));
    }
  }, [location, navigate]);

  const showToast = (msg, type = 'success') => setToast({ message: msg, type });
  const set = (k, v) => setRegData(prev => ({ ...prev, [k]: v }));

  const checkSize = (file) => {
    if (file.size > 10 * 1024 * 1024) { setError('File too large — max 10 MB.'); return false; }
    return true;
  };

  const pollScan = async (scanToken, max = 30) => {
    for (let i = 0; i < max; i++) {
      const res = await client.get(`/documents/status/${scanToken}`);
      const { processing_status, error_message } = res.data;
      if (processing_status === 'COMPLETED') return res.data;
      if (processing_status === 'FAILED' || processing_status === 'ERROR')
        throw new Error(error_message || 'AI scan failed. Please try again.');
      await new Promise(r => setTimeout(r, 2000));
    }
    throw new Error('Document analysis timed out.');
  };

  const handleIDScan = async (file) => {
    if (!file || !checkSize(file)) return;
    setScanType('ID');
    setPreview(URL.createObjectURL(file));
    setLoading(true); setStatus('INITIALIZING AI SCAN…'); setError('');
    try {
      const { data: scanInit } = await client.scanDocument(file, 'ID');
      setStatus('VERIFYING IDENTITY…');
      const result = await pollScan(scanInit.secure_scan_token);
      if (result?.extracted_ai_data) {
        let parsed = {};
        try { parsed = JSON.parse(result.extracted_ai_data); } catch { /* ignore */ }
        const ex = parsed.extracted_data || {};
        setRegData(prev => ({
          ...prev, idFile: file,
          fullName: ex.full_name || prev.fullName,
          course: ex.course || prev.course,
          verificationToken: scanInit.secure_scan_token,
        }));
        showToast('Identity scan complete!');
      }
      setStep(2);
    } catch (err) {
      setError(`Scan unavailable: ${err.message}. Fill in manually.`);
      setStep(2);
    } finally {
      setLoading(false); setPreview(null);
    }
  };

  const handleCORScan = async (file) => {
    if (!file || !checkSize(file)) return;
    setScanType('COR');
    setPreview(URL.createObjectURL(file));
    setLoading(true); setStatus('READING SUBJECTS…'); setError('');
    try {
      const { data: scanInit } = await client.scanDocument(file, 'COR');
      setStatus('EXTRACTING ENROLLMENT DATA…');
      const result = await pollScan(scanInit.secure_scan_token);
      if (result?.extracted_ai_data) {
        let parsed = {};
        try { parsed = JSON.parse(result.extracted_ai_data); } catch { /* ignore */ }
        const subjects = parsed.extracted_data?.subjects ?? [];
        setRegData(prev => ({ ...prev, corFile: file, scannedSubjects: subjects, verificationToken: scanInit.secure_scan_token }));
        showToast(`${subjects.length} subjects extracted from COR!`);
      }
      setStep(4);
    } catch (err) {
      setError(`COR scan failed: ${err.message}. Proceeding manually.`);
      setStep(4);
    } finally {
      setLoading(false); setPreview(null);
    }
  };

  const handleConfirmInfo = () => {
    const e = {};
    if (!regData.fullName.trim()) e.fullName = 'Required.';
    if (!regData.course.trim()) e.course = 'Required.';
    if (!regData.email.includes('@')) e.email = 'Invalid email.';
    if (regData.password.length < 8) e.password = 'Min 8 characters.';
    if (regData.password !== regData.confirmPassword) e.confirmPassword = 'Passwords do not match.';
    if (Object.keys(e).length) { setFieldErrs(e); return; }
    setFieldErrs({}); setError(''); setStep(3);
  };

  const handleSubmit = async () => {
    setLoading(true); setStatus('CREATING STUDENT RECORD…'); setError('');
    try {
      const nameParts = regData.fullName.trim().split(' ');
      await client.submitRegistration({
        email_address: regData.email,
        plain_text_password: regData.password,
        passkey_code: enteredPasskey,
        account_role: 'STUDENT',
        document_verification_token: regData.verificationToken || null,
        first_name: nameParts[0] || 'Student',
        last_name: nameParts.slice(1).join(' ') || '',
        student_number: regData.studentId || null,
        course: regData.course || 'BSCS',
      });
      setStatus('AUTHENTICATING…');
      const loginResult = await login(regData.email, regData.password);
      showToast('Welcome to the system!');
      setTimeout(() => navigate(loginResult.success ? '/portal/student' : '/login', { replace: true }), 1200);
    } catch (err) {
      setError(`Registration failed: ${err.response?.data?.detail ?? err.message}`);
      setLoading(false);
    }
  };

  const inputFieldStyle = (hasErr) => ({
    ...inputBase,
    ...(hasErr ? { borderColor: 'rgba(220,38,38,0.50)' } : {}),
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: P.page,
      fontFamily: P.font,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1rem',
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Ambient dot grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `radial-gradient(${P.goldBorder} 1px, transparent 1px)`,
        backgroundSize: '36px 36px', opacity: 0.5,
      }} />
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse 70% 60% at 50% 30%, rgba(186,151,49,0.06) 0%, transparent 70%)`,
      }} />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div style={{
        position: 'relative', zIndex: 10,
        width: '100%', maxWidth: '42rem',
        background: P.surface,
        border: `1px solid ${P.border}`,
        borderRadius: '1.25rem',
        boxShadow: `0 4px 12px rgba(0,0,0,0.06), 0 24px 60px rgba(0,0,0,0.09), 0 0 0 1px ${P.goldBorder}`,
        overflow: 'hidden',
      }}>

        {/* Top accent bar */}
        <div style={{ height: 3, background: `linear-gradient(to right, ${P.black}, ${P.gold}, ${P.goldLight}, ${P.gold}, ${P.black})` }} />

        {/* Header */}
        <div style={{
          padding: '1.5rem 2rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: `1px solid ${P.borderSoft}`,
        }}>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: P.black, margin: 0, letterSpacing: '-0.02em' }}>
              Student <span style={{ color: P.gold }}>Enrollment</span>
            </h2>
            <p style={{ fontSize: '0.65rem', color: P.textMuted, margin: '3px 0 0', fontFamily: P.fontMono, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              AI-Powered Registration
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.6rem', color: P.textMuted, fontFamily: P.fontMono, textTransform: 'uppercase', margin: '0 0 2px' }}>Student ID</p>
            <p style={{ fontSize: '1.05rem', fontWeight: 700, color: P.gold, fontFamily: P.fontMono, margin: 0 }}>{regData.studentId}</p>
          </div>
        </div>

        {/* Step indicator */}
        <div style={{ padding: '1.75rem 2rem 0' }}>
          <StepIndicator current={step} />
        </div>

        {/* Body */}
        <div style={{ padding: '0 2rem 2rem', minHeight: '22rem' }}>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 8,
              background: P.dangerBg, border: `1px solid ${P.dangerBd}`,
              color: P.danger, padding: '0.75rem 1rem',
              borderRadius: '0.5rem', fontSize: '0.82rem', marginBottom: '1.25rem',
            }}>
              <span style={{ flexShrink: 0, marginTop: 1 }}>⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1 — ID Scan */}
          {step === 1 && (
            <div style={{ textAlign: 'center' }}>
              {loading || previewImg ? (
                <ScannerOverlay imageSrc={previewImg} isActive={loading} label={statusMsg} type="ID" />
              ) : (
                <UploadZone
                  icon="🪪"
                  title="Upload School ID"
                  sub="AI EXTRACTS YOUR NAME & COURSE · MAX 10 MB"
                  badge="NEURAL OCR READY"
                  accent={P.gold}
                  accept="image/*"
                  onChange={e => handleIDScan(e.target.files[0])}
                />
              )}
              <button
                onClick={() => setStep(2)}
                style={{
                  marginTop: '1.25rem', background: 'transparent', border: 'none',
                  fontSize: '0.75rem', color: P.textMuted, cursor: 'pointer',
                  fontFamily: P.fontMono, transition: 'color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = P.gold; }}
                onMouseLeave={e => { e.currentTarget.style.color = P.textMuted; }}
              >
                Skip — enter details manually →
              </button>
            </div>
          )}

          {/* STEP 2 — Personal Info */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Field label="Full Name" error={fieldErrs.fullName}>
                  <input type="text" value={regData.fullName} placeholder="Juan dela Cruz"
                    onChange={e => set('fullName', e.target.value)}
                    style={inputFieldStyle(fieldErrs.fullName)}
                    onFocus={inputFocus} onBlur={inputBlur} />
                </Field>
                <Field label="Course / Program" error={fieldErrs.course}>
                  <select value={regData.course} onChange={e => set('course', e.target.value)}
                    style={inputFieldStyle(fieldErrs.course)}
                    onFocus={inputFocus} onBlur={inputBlur}>
                    <option value="BSCS">BSCS</option>
                    <option value="BSIT">BSIT</option>
                    <option value="BSIS">BSIS</option>
                  </select>
                </Field>
              </div>
              <Field label="Email Address" error={fieldErrs.email}>
                <input type="email" value={regData.email} placeholder="student@university.edu.ph"
                  onChange={e => set('email', e.target.value)}
                  style={inputFieldStyle(fieldErrs.email)}
                  onFocus={inputFocus} onBlur={inputBlur} />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Field label="Create Password" hint="(min. 8 chars)" error={fieldErrs.password}>
                  <input type="password" value={regData.password}
                    onChange={e => set('password', e.target.value)}
                    style={inputFieldStyle(fieldErrs.password)}
                    onFocus={inputFocus} onBlur={inputBlur} />
                </Field>
                <Field label="Confirm Password" error={fieldErrs.confirmPassword}>
                  <input type="password" value={regData.confirmPassword}
                    onChange={e => set('confirmPassword', e.target.value)}
                    style={inputFieldStyle(fieldErrs.confirmPassword)}
                    onFocus={inputFocus} onBlur={inputBlur} />
                </Field>
              </div>
              <button
                onClick={handleConfirmInfo}
                style={{
                  width: '100%', padding: '0.875rem',
                  background: P.black, color: P.surface,
                  fontWeight: 700, fontSize: '0.875rem',
                  fontFamily: P.font, borderRadius: '0.625rem',
                  border: 'none', cursor: 'pointer', marginTop: 8,
                  boxShadow: `0 4px 20px ${P.goldGlow}`,
                  letterSpacing: '0.02em', transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = P.blackSoft;
                  e.currentTarget.style.boxShadow = `0 6px 28px rgba(186,151,49,0.30)`;
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = P.black;
                  e.currentTarget.style.boxShadow = `0 4px 20px ${P.goldGlow}`;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Confirm &amp; Next →
              </button>
            </div>
          )}

          {/* STEP 3 — COR Upload */}
          {step === 3 && (
            <div style={{ textAlign: 'center' }}>
              {loading || previewImg ? (
                <ScannerOverlay imageSrc={previewImg} isActive={loading} label={statusMsg} type="COR" />
              ) : (
                <UploadZone
                  icon="📄"
                  title="Upload Certificate of Registration"
                  sub="AI EXTRACTS & AUTO-ENROLLS SUBJECTS · JPG / PNG / PDF · MAX 10 MB"
                  badge="DOCUMENT AI READY"
                  accent={P.goldLight}
                  accept="image/*,application/pdf"
                  onChange={e => handleCORScan(e.target.files[0])}
                />
              )}
              <button
                onClick={() => setStep(4)}
                style={{
                  marginTop: '1.25rem', background: 'transparent', border: 'none',
                  fontSize: '0.75rem', color: P.textMuted, cursor: 'pointer',
                  fontFamily: P.fontMono, transition: 'color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = P.gold; }}
                onMouseLeave={e => { e.currentTarget.style.color = P.textMuted; }}
              >
                Skip — first-year student or enroll later →
              </button>
            </div>
          )}

          {/* STEP 4 — Review & Submit */}
          {step === 4 && (
            <div>
              <div style={{
                borderRadius: '0.875rem', padding: '1.25rem',
                background: P.depth, border: `1px solid ${P.border}`,
                marginBottom: '1.25rem',
              }}>
                {[
                  ['Student ID', regData.studentId],
                  ['Full Name', regData.fullName || '—'],
                  ['Course', regData.course || '—'],
                  ['Email', regData.email || '—'],
                  ['Subjects', regData.scannedSubjects.length > 0
                    ? `${regData.scannedSubjects.length} subject(s) from COR`
                    : 'Default Year-1 curriculum'],
                  ['AI Scan', regData.verificationToken ? '✅ Document scanned' : '⚠ No document scanned'],
                ].map(([label, value]) => (
                  <div key={label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.6rem 0',
                    borderBottom: `1px solid ${P.borderSoft}`,
                  }}>
                    <span style={{ fontSize: '0.65rem', color: P.textMuted, fontFamily: P.fontMono, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</span>
                    <span style={{ fontSize: '0.82rem', color: P.text, fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
              </div>

              {regData.scannedSubjects.length > 0 && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <p style={{ fontSize: '0.65rem', color: P.textMuted, fontFamily: P.fontMono, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
                    Extracted Subjects
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {regData.scannedSubjects.map((s, i) => (
                      <span key={i} style={{
                        fontSize: '0.65rem', fontFamily: P.fontMono,
                        padding: '0.25rem 0.625rem', borderRadius: '100px',
                        background: P.goldDim, color: P.gold,
                        border: `1px solid ${P.goldBorder}`,
                        fontWeight: 600,
                      }}>
                        {s.code}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  width: '100%', padding: '0.975rem',
                  background: loading ? P.depth : P.black,
                  color: loading ? P.textMuted : P.surface,
                  fontWeight: 700, fontSize: '0.875rem',
                  fontFamily: P.font, borderRadius: '0.625rem',
                  border: `1px solid ${loading ? P.border : P.black}`,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : `0 4px 20px ${P.goldGlow}`,
                  transition: 'all 0.2s ease',
                  letterSpacing: '0.02em',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                }}
                onMouseEnter={e => {
                  if (!loading) {
                    e.currentTarget.style.background = P.blackSoft;
                    e.currentTarget.style.boxShadow = `0 6px 28px rgba(186,151,49,0.30)`;
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = loading ? P.depth : P.black;
                  e.currentTarget.style.boxShadow = loading ? 'none' : `0 4px 20px ${P.goldGlow}`;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {loading ? (
                  <>
                    <span style={{ width: 16, height: 16, border: `2px solid rgba(0,0,0,0.15)`, borderTopColor: P.gold, borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                    {statusMsg || 'Processing…'}
                  </>
                ) : '✓ Complete Registration'}
              </button>

              <p style={{ textAlign: 'center', fontSize: '0.68rem', color: P.textMuted, marginTop: 12, fontFamily: P.fontMono }}>
                You will be automatically logged in after registration.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrationWizard;