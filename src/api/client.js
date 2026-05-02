// frontend/src/api/client.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://ccissportal-backend.onrender.com',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {

    if (error.response?.status === 503 && error.response?.data?.maintenance) {
      window.location.href = '/maintenance';
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
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

  // ── Auth 
  login: (credentials) => apiClient.post('/authentication/login', credentials),
  register: (data) => apiClient.post('/authentication/register', data),

  // ── Document scanning (Registration wizard) 
  scanDocument: (file, docType) => {
    const fd = new FormData();
    fd.append('uploaded_file', file);
    return apiClient.post(`/documents/scan/${docType}`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  submitRegistration: (data) => apiClient.post('/authentication/register', data),

  // ── Student Dashboard 
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

  // ── Enrollment (student-facing) 
  submitEnrollment: (data) => apiClient.post('/enrollment/submit', data),

  // ── Curriculum 
  // NOTE: use adminApi.js for admin operations — these are kept for
  getAllSubjects: () => apiClient.get('/enrollment/curriculum'),
  addSubject: (data) => apiClient.post('/enrollment/curriculum/add', data),
  deleteSubject: (subjectId) => apiClient.delete(`/enrollment/curriculum/${subjectId}/remove`),

  // ── Support Tickets 
  getMyTickets: () => apiClient.get('/support/my-tickets'),
  createTicket: (t) => apiClient.post('/support/submit', t),
  // Admin-only
  getAllTickets: () => apiClient.get('/support/all'),
  resolveTicket: (id) => apiClient.patch(`/support/${id}/resolve`),

  // ── Faculty 
  getFacultyLoad: () => apiClient.get('/faculty/load'),
};

export default client;