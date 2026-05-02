// frontend/src/App.jsx

import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import RegistrationWizard from './components/auth/RegistrationWizard';

// Public pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import MaintenanceScreen from './components/MaintenanceScreen';

// Admin layout + pages
import AdminLayout from './features/admin/layout/AdminLayout';
import AdminOverview from './features/admin/pages/AdminOverview';
import ReviewEnrollments from './features/admin/pages/ReviewEnrollments';
import AdminGrading from './features/admin/pages/AdminGrading';
import ManageCurriculum from './features/admin/pages/ManageCurriculum';
import AdminAdmissions from './features/admin/pages/AdminAdmissions';
import AdminSupport from './features/admin/pages/AdminSupport';
import CommandCenter from './features/admin/pages/CommandCenter';

// Phase 4 — lazy loaded (heavier page with charts)
const AuditIntelligence = lazy(() =>
  import('./features/admin/pages/AuditIntelligence')
);

// Faculty + Student
import FacultyDashboard from './features/faculty/pages/FacultyDashboard';
import StudentDashboard from './features/students/pages/StudentDashboard';

const PortalGuard = () => (
  <ProtectedRoute><Outlet /></ProtectedRoute>
);

// Minimal fallback shown while lazy page loads
const PageLoader = () => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10,
    padding: 40,
    fontFamily: 'var(--font-terminal)',
    fontSize: '0.78rem',
    color: 'var(--neon-cyan)',
    letterSpacing: '0.12em',
  }}>
    <span className="live-dot" />
    LOADING MODULE...
  </div>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <ToastProvider>
        <Routes>
          {/* ── Public routes ──────────────────────────────────── */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegistrationWizard />} />

          {/*
                     * /maintenance is PUBLIC — no auth guard.
                     * The client.js interceptor redirects here on 503.
                     * Must NOT be inside <PortalGuard> or the redirect loop
                     * will send unauthenticated users to /login instead.
                     */}
          <Route path="/maintenance" element={<MaintenanceScreen />} />

          {/* ── Authenticated portal routes ─────────────────────── */}
          <Route path="/portal" element={<PortalGuard />}>
            <Route path="student" element={<StudentDashboard />} />
            <Route path="enrollment" element={<Navigate to="/portal/student" replace />} />
            <Route path="faculty" element={<FacultyDashboard />} />

            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<AdminOverview />} />
              <Route path="enrollments" element={<ReviewEnrollments />} />
              <Route path="grading" element={<AdminGrading />} />
              <Route path="curriculum" element={<ManageCurriculum />} />
              <Route path="admissions" element={<AdminAdmissions />} />
              <Route path="support" element={<AdminSupport />} />
              {/* Faculty + Users consolidated into CommandCenter tabs */}
              <Route path="faculty" element={<Navigate to="/portal/admin/settings" state={{ section: 'faculty' }} replace />} />
              <Route path="users" element={<Navigate to="/portal/admin/settings" state={{ section: 'users' }} replace />} />
              <Route path="settings" element={<CommandCenter />} />
              <Route
                path="audit"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <AuditIntelligence />
                  </Suspense>
                }
              />
            </Route>

            <Route path="support" element={<Navigate to="/portal/student" replace />} />
            <Route path="*" element={<Navigate to="/portal/student" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;