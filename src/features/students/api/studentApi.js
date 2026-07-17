import apiClient from '../../../api/client';

export const studentApi = {
    fetchProfile: () => apiClient.get('/student/profile').then(r => r.data),
    fetchGrades: () => apiClient.get('/student/my-grades').then(r => r.data),
    fetchSchedule: () => apiClient.get('/student/schedule').then(r => r.data),
    fetchEnrollmentStatus: () => apiClient.get('/student/enrollment-status').then(r => r.data),
    fetchAcademicStanding: () => apiClient.get('/student/academic-standing').then(r => r.data),

    submitSupportTicket: (ticketData) => apiClient.post('/support/submit', ticketData).then(r => r.data),

    uploadCOR: (file) => {
        const fd = new FormData();
        fd.append('uploaded_file', file);
        return apiClient.post('/documents/scan/COR', fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }).then(r => r.data);
    },

    finalizeCOR: (scanToken) =>
        apiClient.post('/enrollment/submit', {
            target_year_level: 1,
            target_semester: 1,
            document_verification_token: scanToken,
        }).then(r => r.data),

    submitSmartEnrollment: async (payload) => {
        const response = await apiClient.post('/enrollment/submit', {
            target_year_level: payload.target_year_level,
            target_semester: payload.target_semester,
            document_verification_token: null,
            extracted_subjects: payload.extracted_subjects || null
        });
        return response.data;
    },

    checkScanStatus: (scanToken) =>
        apiClient.get(`/documents/status/${scanToken}`).then(r => r.data),
        
    fetchAvailableFaculty: () => apiClient.get('/student/consultations/faculty').then(r => r.data),
    fetchFacultyTimeChunks: (facultyId, date) => apiClient.get(`/student/consultations/faculty/${facultyId}/available-slots?target_date=${date}`).then(r => r.data),
    bookConsultation: (data) => apiClient.post('/student/consultations/requests', data).then(r => r.data),
    fetchMyConsultations: () => apiClient.get('/student/consultations/requests').then(r => r.data),

    // SE-04 — At-Risk Early Warning
    fetchAtRisk: () => apiClient.get('/student/at-risk').then(r => r.data),

    fetchMyOJTClearance: () => apiClient.get('/secretariat/ojt/my-status').then(r => r.data),
    fetchMyEquipmentClearance: () => apiClient.get('/secretariat/equipment/clearance/my-status').then(r => r.data),

    fetchNotifications: () => apiClient.get('/notifications/my').then(r => r.data),
    markNotificationRead: (id) => apiClient.post(`/notifications/mark-read/${id}`).then(r => r.data),
    markAllNotificationsRead: () => apiClient.post('/notifications/mark-all-read').then(r => r.data),
};