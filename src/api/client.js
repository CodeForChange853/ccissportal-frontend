import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000, // Instructional Guardrail #1: 10s Timeout
});

apiClient.interceptors.request.use(
  (config) => {
    // Check network status before sending
    if (!window.navigator.onLine) {
      return Promise.reject({ code: 'NETWORK_OFFLINE' });
    }
    const token = localStorage.getItem('token');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Instructional Guardrail #2: Error Categorization
    if (error.code === 'NETWORK_OFFLINE' || !window.navigator.onLine) {
       return Promise.reject('NETWORK_OFFLINE');
    }

    if (error.code === 'ECONNABORTED') {
      return Promise.reject('BACKEND_UNREACHABLE');
    }

    const status = error.response?.status;
    const maintenanceInfo = error.response?.data?.detail?.maintenance ? error.response.data.detail : error.response?.data;
    const errorDetail = error.response?.data?.detail;
    
    // Handle Banned Account
    if (status === 403 && errorDetail?.code === 'ACCOUNT_BANNED') {
      localStorage.removeItem('token');
      window.location.href = '/banned';
      return Promise.reject(error);
    }

    // Handle 502, 503, 504 (Server Maintenance or Restarting)
    if ([502, 503, 504].includes(status)) {
      if (status === 503 && maintenanceInfo?.maintenance) {
        const isStatusPage = window.location.pathname === '/status';
        if (!isStatusPage) {
          sessionStorage.setItem('maintenance_reason', maintenanceInfo.reason || '');
          sessionStorage.setItem('maintenance_message', maintenanceInfo.message || '');
          window.location.href = '/maintenance';
        }
      }
      return Promise.reject('SERVER_MAINTENANCE_OR_RESTARTING');
    }

    if (status === 401) {
      const isLoginEndpoint = error.config?.url?.includes('/authentication/login');
      if (!isLoginEndpoint) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const client = {
  get: (url, config) => apiClient.get(url, config),
  post: (url, data, config) => apiClient.post(url, data, config),
  put: (url, data, config) => apiClient.put(url, data, config),
  patch: (url, data, config) => apiClient.patch(url, data, config),
  delete: (url, config) => apiClient.delete(url, config),
  
  checkSystemStatus: () => axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/`),

  // ── Auth 
  login: (credentials) => apiClient.post('/authentication/login', credentials),
  register: (data) => apiClient.post('/authentication/register', data),
  validatePreReg: (student_number, passkey_code) => 
    apiClient.post('/authentication/validate-pre-reg', { student_number, passkey_code }),

  scanDocument: (file, docType) => {
    const fd = new FormData();
    fd.append('uploaded_file', file);
    return apiClient.post(`/documents/scan/${docType}`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  submitRegistration: (data) => apiClient.post('/authentication/register', data),

  getStudentProfile: () => apiClient.get('/student/profile'),
  getMyGrades: () => apiClient.get('/student/my-grades'),
  getSchedule: () => apiClient.get('/student/schedule'),
  getEnrollmentStatus: () => apiClient.get('/student/enrollment-status'),

  uploadNextSemCOR: (file) => {
    const fd = new FormData();
    fd.append('uploaded_file', file);
    return apiClient.post('/student/register/upload-cor', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  finalizeCorEnrollment: (data) => apiClient.post('/student/register/finalize-cor', data),

  submitEnrollment: (data) => apiClient.post('/enrollment/submit', data),

  getAllSubjects: () => apiClient.get('/enrollment/curriculum'),
  addSubject: (data) => apiClient.post('/enrollment/curriculum/add', data),
  deleteSubject: (subjectId) => apiClient.delete(`/enrollment/curriculum/${subjectId}/remove`),

  getMyTickets: () => apiClient.get('/support/my-tickets'),
  createTicket: (t) => apiClient.post('/support/submit', t),
  getAllTickets: () => apiClient.get('/support/all'),
  resolveTicket: (id) => apiClient.patch(`/support/${id}/resolve`),

  getFacultyLoad: () => apiClient.get('/faculty/load'),
  getAnnouncements: () => axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/announcements`),
};

export default client;