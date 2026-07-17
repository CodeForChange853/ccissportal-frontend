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

    provisionSecretary: async (data) => {
        const res = await apiClient.post('/authentication/provision-secretary', {
            email_address: data.email_address,
            plain_text_password: data.plain_text_password,
            first_name: data.first_name,
            last_name: data.last_name,
        });
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

    rerouteTicket: async (ticketId, department, note = null) => {
        const res = await apiClient.patch(`/support/${ticketId}/reroute`, {
            department,
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

    // SE-08 — AI Audit Narratives
    processNarratives: async () => {
        const res = await apiClient.post('/audit/process-narratives');
        return res.data;
    },

    acknowledgeNarrative: async (eventId) => {
        const res = await apiClient.post(`/audit/events/${eventId}/acknowledge-narrative`);
        return res.data;
    },

    // ── SE-03 Prerequisite Graph
    fetchPrereqGraph: async () => {
        const res = await apiClient.get('/enrollment/curriculum/prereq-graph');
        return res.data;
    },

    // ── SE-02 Faculty Matching
    fetchFacultyRecommendations: async (subjectId) => {
        const res = await apiClient.get(`/admin/faculty/match?subject_id=${subjectId}`);
        return res.data;
    },

    updateFacultySpecialization: async (accountId, tags) => {
        const res = await apiClient.patch(`/admin/faculty/${accountId}/specialization`, { specialization_tags: tags });
        return res.data;
    },

    // ── SE-01 Enrollment Analytics
    fetchEnrollmentForecast: async () => {
        const res = await apiClient.get('/analytics/admin/enrollment-forecast');
        return res.data;
    },

    runForecast: async () => {
        const res = await apiClient.post('/analytics/admin/run-forecast');
        return res.data;
    },

    fetchDemandAlerts: async () => {
        const res = await apiClient.get('/analytics/admin/demand-alerts');
        return res.data;
    },

    dismissDemandAlert: async (alertId) => {
        const res = await apiClient.post(`/analytics/admin/demand-alerts/${alertId}/dismiss`);
        return res.data;
    },

    applyAnalyticsTables: async () => {
        const res = await apiClient.post('/analytics/admin/apply-tables');
        return res.data;
    },

    // ── Announcements
    createAnnouncement: async (data) => {
        const res = await apiClient.post('/support/announcements', data);
        return res.data;
    },

    deleteAnnouncement: async (id) => {
        const res = await apiClient.delete(`/support/announcements/${id}`);
        return res.data;
    },

    // ── SE-04 At-Risk Intelligence
    fetchAtRiskStudents: async (minScore = 40) => {
        const res = await apiClient.get(`/admin/at-risk-students?min_score=${minScore}`);
        return res.data;
    },

    // ── Student Records (read-only roster)
    fetchStudentRecords: async ({ search, course, year_level, skip = 0, limit = 200 } = {}) => {
        const params = new URLSearchParams({ skip, limit });
        if (search)     params.append('search',     search);
        if (course)     params.append('course',     course);
        if (year_level) params.append('year_level', year_level);
        const res = await apiClient.get(`/enrollment/students?${params.toString()}`);
        return res.data;
    },

    // ── Programs — dynamic list of distinct course codes in the DB
    fetchPrograms: async () => {
        const res = await apiClient.get('/enrollment/courses');
        return res.data; // string[]
    },

    // ── INC Completion Posting Queue
    fetchINCPostingQueue: async () => {
        const res = await apiClient.get('/secretariat/completion/queue?state_filter=AWAITING_ADMIN_POSTING');
        return res.data;
    },

    advanceINCCompletion: async (requestId, payload) => {
        const res = await apiClient.patch(`/secretariat/completion/${requestId}/advance`, payload);
        return res.data;
    },
};