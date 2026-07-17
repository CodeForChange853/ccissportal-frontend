import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
  withCredentials: true, // needed for HTTP-only refresh token cookie
});

apiClient.interceptors.request.use(
  (config) => {
    if (!window.navigator.onLine) {
      return Promise.reject({ code: 'NETWORK_OFFLINE' });
    }
    const token = localStorage.getItem('token');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Refresh token state ──────────────────────────────────────────────────────
let _isRefreshing = false;
let _refreshQueue = [];

function _drainQueue(token, error) {
  _refreshQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  );
  _refreshQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.code === 'NETWORK_OFFLINE' || !window.navigator.onLine) {
      return Promise.reject('NETWORK_OFFLINE');
    }

    if (error.code === 'ECONNABORTED') {
      return Promise.reject('BACKEND_UNREACHABLE');
    }

    const status = error.response?.status;
    const maintenanceInfo = error.response?.data?.detail?.maintenance
      ? error.response.data.detail
      : error.response?.data;
    const errorDetail = error.response?.data?.detail;

    if (status === 403 && errorDetail?.code === 'ACCOUNT_BANNED') {
      localStorage.removeItem('token');
      window.location.href = '/banned';
      return Promise.reject(error);
    }

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
      const url = error.config?.url || '';
      const isAuthEndpoint =
        url.includes('/authentication/login') ||
        url.includes('/authentication/refresh');

      if (!isAuthEndpoint && !error.config._retry) {
        // Queue concurrent 401s while a refresh is in flight
        if (_isRefreshing) {
          return new Promise((resolve, reject) => {
            _refreshQueue.push({ resolve, reject });
          }).then((token) => {
            error.config.headers['Authorization'] = `Bearer ${token}`;
            return apiClient(error.config);
          }).catch(() => Promise.reject(error));
        }

        error.config._retry = true;
        _isRefreshing = true;

        try {
          const res = await apiClient.post('/authentication/refresh');
          const newToken = res.data.access_token;
          localStorage.setItem('token', newToken);
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          _drainQueue(newToken, null);
          error.config.headers['Authorization'] = `Bearer ${newToken}`;
          return apiClient(error.config);
        } catch (refreshErr) {
          _drainQueue(null, refreshErr);
          localStorage.removeItem('token');
          localStorage.removeItem('user_data');
          window.location.href = '/login';
          return Promise.reject(refreshErr);
        } finally {
          _isRefreshing = false;
        }
      }

      // Login endpoint failed or refresh itself failed — don't redirect from login page
      if (!url.includes('/authentication/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user_data');
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

  checkSystemStatus: () => axios.get(`${BASE_URL}/`),

  // ── Auth
  login: (credentials) => apiClient.post('/authentication/login', credentials),
  logout: () => apiClient.post('/authentication/logout'),
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
  getAnnouncements: () => axios.get(`${BASE_URL}/announcements`),

  // Wall of Shame — public endpoint, uses plain axios (no auth headers)
  getWallOfShame: () => axios.get(`${BASE_URL}/authentication/wall-of-shame`),
  reformViolator: (accountId) => apiClient.post(`/authentication/wall-of-shame/${accountId}/reform`),
  getUnderwatchUsers: () => apiClient.get('/authentication/wall-of-shame/underwatch'),
};

export default client;
