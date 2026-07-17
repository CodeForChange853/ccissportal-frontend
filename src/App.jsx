import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import client from './api/client';
import { AuthProvider } from './auth/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './auth/ProtectedRoute';
import RegistrationWizard from './auth/RegistrationWizard';
import OfflineBanner from './components/ui/OfflineBanner';

// Public pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Banned from './pages/Banned';
import Rules from './pages/Rules';
import WallOfShame from './pages/WallOfShame';
import Status from './pages/Status';
import Announcements from './pages/Announcements';
import LatinHonors from './pages/LatinHonors';
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

// Lazy-loaded heavier admin pages
const AuditIntelligence  = lazy(() => import('./features/admin/pages/AuditIntelligence'));
const EnrollmentForecast = lazy(() => import('./features/admin/pages/EnrollmentForecast'));
const StudentRecords     = lazy(() => import('./features/admin/pages/StudentRecords'));
const HonorsManagement   = lazy(() => import('./features/admin/pages/HonorsManagement'));

// Faculty + Student
import FacultyDashboard from './features/faculty/pages/FacultyDashboard';
import StudentDashboard from './features/students/pages/StudentDashboard';

// Secretary
import SecretaryLayout from './features/secretary/layout/SecretaryLayout';
import SecretaryDashboard from './features/secretary/pages/SecretaryDashboard';
import OJTClearance from './features/secretary/pages/OJTClearance';
import INCCompletions from './features/secretary/pages/INCCompletions';
import SubjectPetitions from './features/secretary/pages/SubjectPetitions';
import CurriculumMapping from './features/secretary/pages/CurriculumMapping';
import EquipmentInventory from './features/secretary/pages/EquipmentInventory';
import DocumentRequests from './features/secretary/pages/DocumentRequests';
import OrgsAndFacilities from './features/secretary/pages/OrgsAndFacilities';
import CORRelease from './features/secretary/pages/CORRelease';
import DocumentVerificationQueue from './features/secretary/pages/DocumentVerificationQueue';

const PortalGuard = () => (
  <ProtectedRoute><Outlet /></ProtectedRoute>
);

const PageLoader = () => (
  <div className="page-loader">
    <span className="live-dot" />
    LOADING MODULE...
  </div>
);

const SystemGuard = ({ children }) => {
  const [checking, setChecking] = React.useState(true);
  const location = window.location.pathname;

  React.useEffect(() => {
    const exempt = ['/', '/login', '/register', '/maintenance', '/status', '/rules', '/banned', '/wall-of-shame', '/announcements', '/latin-honors'];
    if (exempt.includes(location)) { setChecking(false); return; }

    const verifyStatus = async () => {
      try {
        const { data } = await client.checkSystemStatus();
        if (data.maintenance_mode) {
          const token    = localStorage.getItem('token');
          const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
          const role     = userData.account_role;
          if (!token || (role !== 'ADMIN' && role !== 'SECRETARY')) {
            sessionStorage.setItem('maintenance_reason', data.maintenance_reason || '');
            window.location.href = '/maintenance';
            return;
          }
        }
      } catch (err) {
        console.error('System health check failed', err);
      } finally {
        setChecking(false);
      }
    };

    verifyStatus();
  }, [location]);

  if (checking && location !== '/maintenance') return <PageLoader />;
  return children;
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <ToastProvider>
        <OfflineBanner />
        <SystemGuard>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegistrationWizard />} />
            <Route path="/maintenance" element={<MaintenanceScreen />} />
            <Route path="/banned" element={<Banned />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/wall-of-shame" element={<WallOfShame />} />
            <Route path="/status" element={<Status />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/latin-honors" element={<LatinHonors />} />

            <Route path="/portal" element={<PortalGuard />}>
              <Route path="student" element={<ProtectedRoute role="STUDENT"><StudentDashboard /></ProtectedRoute>} />
              <Route path="enrollment" element={<Navigate to="/portal/student" replace />} />
              <Route path="faculty" element={<ProtectedRoute role="FACULTY"><FacultyDashboard /></ProtectedRoute>} />

              <Route path="admin" element={<ProtectedRoute role="ADMIN"><AdminLayout /></ProtectedRoute>}>
                <Route index element={<AdminOverview />} />
                <Route path="enrollments" element={<ReviewEnrollments />} />
                <Route path="grading" element={<AdminGrading />} />
                <Route path="curriculum" element={<ManageCurriculum />} />
                <Route path="admissions" element={<AdminAdmissions />} />
                <Route path="support" element={<AdminSupport />} />
                <Route path="faculty" element={<Navigate to="/portal/admin/settings" state={{ section: 'faculty' }} replace />} />
                <Route path="users"   element={<Navigate to="/portal/admin/settings" state={{ section: 'users'   }} replace />} />
                <Route path="settings" element={<CommandCenter />} />
                <Route path="forecast" element={<Suspense fallback={<PageLoader />}><EnrollmentForecast /></Suspense>} />
                <Route path="audit"    element={<Suspense fallback={<PageLoader />}><AuditIntelligence /></Suspense>} />
                <Route path="students" element={<Suspense fallback={<PageLoader />}><StudentRecords /></Suspense>} />
                <Route path="honors"   element={<Suspense fallback={<PageLoader />}><HonorsManagement /></Suspense>} />
              </Route>

              <Route path="secretary" element={<ProtectedRoute roles={['SECRETARY', 'ADMIN']}><SecretaryLayout /></ProtectedRoute>}>
                <Route index element={<SecretaryDashboard />} />
                <Route path="ojt"         element={<OJTClearance />} />
                <Route path="inc"         element={<INCCompletions />} />
                <Route path="petitions"   element={<SubjectPetitions />} />
                <Route path="mapping"     element={<CurriculumMapping />} />
                <Route path="equipment"   element={<EquipmentInventory />} />
                <Route path="documents"   element={<DocumentRequests />} />
                <Route path="orgs"        element={<OrgsAndFacilities />} />
                <Route path="cor"         element={<CORRelease />} />
                <Route path="scan-review" element={<DocumentVerificationQueue />} />
              </Route>

              <Route path="support" element={<Navigate to="/portal/student" replace />} />
              <Route path="*"       element={<Navigate to="/portal/student" replace />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SystemGuard>
      </ToastProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
