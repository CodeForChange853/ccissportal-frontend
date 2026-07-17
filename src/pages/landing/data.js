import { Icons } from './utils';

// ── Three-Act gradient definitions (warm alabaster theme) ─────────────────────
export const ACT_1 = [
  'radial-gradient(ellipse 72% 52% at 85% 12%, rgba(163,127,33,0.10) 0%, transparent 58%)',
  'radial-gradient(ellipse 58% 44% at 14% 88%, rgba(163,127,33,0.07) 0%, transparent 54%)',
  'radial-gradient(ellipse 40% 30% at 50% 100%, rgba(120,80,20,0.05) 0%, transparent 50%)',
  '#FAF8F5',
].join(', ');

export const ACT_2 = [
  'radial-gradient(ellipse 80% 54% at 50% 50%, rgba(163,127,33,0.09) 0%, transparent 62%)',
  'radial-gradient(ellipse 54% 40% at 22% 68%, rgba(163,127,33,0.06) 0%, transparent 54%)',
  '#F8F5F0',
].join(', ');

export const ACT_3 = [
  'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(163,127,33,0.08) 0%, transparent 55%)',
  'radial-gradient(ellipse 30% 40% at 90% 90%,  rgba(163,127,33,0.05) 0%, transparent 50%)',
  '#FAF8F5',
].join(', ');

export const STEPS = [
  { icon: Icons.verify, label: 'Verify Identity', desc: 'Upload your School ID for AI-powered identity verification.', animType: 'scan' },
  { icon: Icons.scan, label: 'Scan Documents', desc: 'Zero-retention AI parses your academic records securely.', animType: 'data' },
  { icon: Icons.enroll, label: 'Enroll Subjects', desc: 'Smart prerequisite checks & real-time queue management.', animType: 'check' },
  { icon: Icons.balance, label: 'Load Balanced', desc: 'Faculty assignments auto-balanced within regulation limits.', animType: 'balance' },
];

export const JOURNEY_STEPS = [
  { num: '01', label: 'Upload ID', desc: 'Student submits their School ID. AI scanning begins immediately.', animType: 'scan' },
  { num: '02', label: 'OCR Extracts Data', desc: 'Gemini Vision reads name, ID number, and year level in seconds.', animType: 'data' },
  { num: '03', label: 'AI Validates', desc: 'Smart prerequisite engine checks eligibility across all subject slots.', animType: 'check' },
  { num: '04', label: 'Enrolled', desc: 'Confirmed, logged, and faculty-balanced. Zero manual encoding required.', isComplete: true },
];

export const PROBLEM_ITEMS = [
  'Manual Encoding',
  'Long Queues',
  'Incorrect Subject Assignment',
  'Faculty Overload',
  'Delayed Enrollment',
];

export const SECURITY_LAYERS = [
  { label: 'Identity Verification', desc: 'Student ID scanned by Gemini Vision AI — zero manual data entry' },
  { label: 'Role Authorization', desc: 'JWT tokens scope every API request to the correct user role' },
  { label: 'Audit Monitoring', desc: 'Every critical action is logged and traceable for full accountability' },
  { label: 'Anomaly Detection', desc: 'ML engine surfaces unusual system behavior for immediate review' },
];

export const ECO_NODES = [
  { id: 'ai', label: 'AI ENGINE', x: 250, y: 200, r: 32, isCenter: true },
  { id: 'students', label: 'Students', x: 250, y: 70, r: 24 },
  { id: 'faculty', label: 'Faculty', x: 363, y: 135, r: 24 },
  { id: 'admin', label: 'Admin', x: 363, y: 265, r: 24 },
  { id: 'secretariat', label: 'Secretariat', x: 250, y: 330, r: 24 },
  { id: 'ocr', label: 'OCR', x: 137, y: 265, r: 24 },
  { id: 'analytics', label: 'Analytics', x: 137, y: 135, r: 24 },
];

export const ECO_HUB_EDGES = [
  { x1: 250, y1: 200, x2: 250, y2: 70,  dur: '2.2s', begin: '0.0s',  rBegin: '1.1s'  },
  { x1: 250, y1: 200, x2: 363, y2: 135, dur: '2.0s', begin: '0.35s', rBegin: '1.35s' },
  { x1: 250, y1: 200, x2: 363, y2: 265, dur: '2.2s', begin: '0.7s',  rBegin: '1.8s'  },
  { x1: 250, y1: 200, x2: 250, y2: 330, dur: '2.0s', begin: '1.05s', rBegin: '2.05s' },
  { x1: 250, y1: 200, x2: 137, y2: 265, dur: '2.2s', begin: '1.4s',  rBegin: '2.5s'  },
  { x1: 250, y1: 200, x2: 137, y2: 135, dur: '2.0s', begin: '1.75s', rBegin: '2.75s' },
];

export const ECO_RING_EDGES = [
  { x1: 250, y1: 70,  x2: 363, y2: 135 },
  { x1: 363, y1: 135, x2: 363, y2: 265 },
  { x1: 363, y1: 265, x2: 250, y2: 330 },
  { x1: 250, y1: 330, x2: 137, y2: 265 },
  { x1: 137, y1: 265, x2: 137, y2: 135 },
  { x1: 137, y1: 135, x2: 250, y2: 70  },
];

export const BARCODE_PATTERN = [0.7, 0.3, 0.9, 0.4, 0.6, 0.8, 0.3, 0.7, 0.5, 0.9, 0.4, 0.6, 0.8, 0.3, 0.5, 0.7, 0.4, 0.9, 0.6, 0.3, 0.8, 0.5];
