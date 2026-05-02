// frontend/src/features/student/api/studentApi.js
// PHASE 4: Student feature domain API — all student-specific calls in one place.
// StudentDashboard was calling client.get(...) inline for 4 different endpoints.

import apiClient from '../../../api/client';

export const studentApi = {
    fetchProfile: () => apiClient.get('/student/profile').then(r => r.data),
    fetchGrades: () => apiClient.get('/student/my-grades').then(r => r.data),
    fetchSchedule: () => apiClient.get('/student/schedule').then(r => r.data),
    fetchEnrollmentStatus: () => apiClient.get('/student/enrollment-status').then(r => r.data),
    fetchAcademicStanding: () => apiClient.get('/dashboards/student/academic-standing').then(r => r.data),

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

    checkScanStatus: (scanToken) =>
        apiClient.get(`/documents/status/${scanToken}`).then(r => r.data),
};