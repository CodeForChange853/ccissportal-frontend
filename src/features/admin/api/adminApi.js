import apiClient from '../../../api/client';

export const adminApi = {


    // ── Dashboard 
    fetchDashboardStats: async () => {
        const res = await apiClient.get('/admin/stats');
        return res.data;
    },

    // ── Enrollments 
    fetchPendingEnrollments: async (skip = 0, limit = 100) => {
        const res = await apiClient.get(`/enrollment/pending?skip=${skip}&limit=${limit}&status_filter=ALL`);
        return res.data;
    },

    submitEnrollmentDecision: async (requestId, decisionData) => {
        const res = await apiClient.post(`/enrollment/${requestId}/decide`, decisionData);
        return res.data;
    },

    submitBulkEnrollmentDecision: async (decisionData) => {
        const res = await apiClient.post(`/enrollment/bulk-decide`, decisionData);
        return res.data;
    },

    // ── Curriculum 
    fetchCurriculum: async () => {
        const res = await apiClient.get('/enrollment/curriculum');
        return res.data;
    },

    addSubject: async (subjectData) => {
        const res = await apiClient.post('/enrollment/curriculum/add', subjectData);
        return res.data;
    },

    deleteSubject: async (subjectId) => {
        const res = await apiClient.delete(`/enrollment/curriculum/${subjectId}/remove`);
        return res.data;
    },

    updateSubject: async (subjectId, updateData) => {
        const response = await apiClient.patch(`/enrollment/curriculum/${subjectId}/update`, updateData);
        return response.data;
    },

    // ── Grading (READ-ONLY) 

    fetchStudentGrades: async (studentAccountId) => {
        const res = await apiClient.get(`/admin/students/${studentAccountId}/grades`);
        return res.data;
    },
    // updateStudentGrade intentionally removed — admin has no write access to grades.

    // ── Admissions 
    createStudentDirect: async (studentData) => {
        const res = await apiClient.post('/admin/students/create', studentData);
        return res.data;
    },

    // ── Faculty management 
    fetchFacultyList: async () => {
        const res = await apiClient.get('/admin/faculty');
        return res.data;
    },

    assignFacultyLoad: async (assignmentData) => {
        const res = await apiClient.post('/admin/faculty/assign', assignmentData);
        return res.data;
    },

    assignBulkFacultyLoad: async (data) => {
        const response = await apiClient.post('/admin/faculty/bulk-assign', data);
        return response.data;
    },

    // ── User management 
    fetchAllUsers: async ({ role = 'ALL', skip = 0, limit = 200 } = {}) => {
        const params = new URLSearchParams({ role, skip, limit });
        const res = await apiClient.get(`/admin/users?${params.toString()}`);
        return res.data;
    },

    searchUsers: async (query) => {
        const res = await apiClient.get(`/admin/users/search?q=${encodeURIComponent(query)}`);
        return res.data;
    },


    createUser: async (userData) => {
        const res = await apiClient.post('/authentication/register', userData);
        return res.data;
    },

    setUserActiveStatus: async (accountId, isActive) => {
        const res = await apiClient.patch(`/admin/users/${accountId}/status`, { is_active: isActive });
        return res.data;
    },

    // ── Support 
    fetchAllTickets: async (skip = 0, limit = 100) => {
        const res = await apiClient.get(`/support/all?skip=${skip}&limit=${limit}`);
        return res.data;
    },

    resolveTicket: async (ticketId, note = null) => {
        const res = await apiClient.patch(`/support/${ticketId}/resolve`, { resolution_note: note });
        return res.data;
    },

    rerouteTicket: async (ticketId, correctCategory, note = null) => {
        const res = await apiClient.patch(`/support/${ticketId}/reroute`, {
            correct_category: correctCategory,
            resolution_note: note,
        });
        return res.data;
    },

    // ── Settings (Mission Control) 
    fetchSystemSettings: async () => {
        const res = await apiClient.get('/settings/');
        return res.data;
    },

    updateSystemSettings: async (payload) => {
        const res = await apiClient.patch('/settings/', payload);
        return res.data;
    },

    rotatePasskey: async () => {
        const res = await apiClient.post('/settings/generate-passkey');
        return res.data;
    },

    // ── AI Telemetry 
    fetchTelemetry: async () => {
        const res = await apiClient.get('/support/telemetry');
        return res.data;
    },

    retrainTriageModel: async () => {
        const res = await apiClient.post('/support/retrain-model');
        return res.data;
    },

    // ── Omni Search 
    omniSearch: async (query) => {
        const res = await apiClient.get(`/admin/search?q=${encodeURIComponent(query)}`);
        return res.data;
    },

    fetchVerificationScoreCard: async (scanToken) => {
        const res = await apiClient.get(`/documents/verification/${scanToken}`);
        return res.data;
    },

    // ── Audit Intelligence 
    fetchAuditEvents: async ({ event_type, actor_email, skip = 0, limit = 50 } = {}) => {
        const params = new URLSearchParams({ skip, limit });
        if (event_type) params.append('event_type', event_type);
        if (actor_email) params.append('actor_email', actor_email);
        const res = await apiClient.get(`/audit/events?${params.toString()}`);
        return res.data;
    },

    fetchAuditSummary: async () => {
        const res = await apiClient.get('/audit/summary');
        return res.data;
    },
};