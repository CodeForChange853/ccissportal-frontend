import apiClient from '../../../api/client';

export const facultyApi = {
    fetchLoad: async () => {
        const res = await apiClient.get('/faculty/load');
        return res.data;
    },
    fetchClassRoster: async (subjectCode) => {
        const res = await apiClient.get(`/faculty/class/${subjectCode}`);
        return res.data;
    },

    updateGrade: async (gradePayload) => {
        const res = await apiClient.put('/faculty/grades/update', gradePayload);
        return res.data;
    },

    syncGrades: async (updates) => {
        const res = await apiClient.post('/faculty/sync-grades', { updates });
        return res.data;
    },

    fetchTriageAlerts: async () => {
        const res = await apiClient.get('/faculty/triage-alerts');
        return res.data;
    },

    fetchConsultationSlots: async () => {
        const res = await apiClient.get('/faculty/consultations/slots');
        return res.data;
    },

    addConsultationSlot: async (slotData) => {
        const res = await apiClient.post('/faculty/consultations/slots', slotData);
        return res.data;
    },

    deleteConsultationSlot: async (slotId) => {
        const res = await apiClient.delete(`/faculty/consultations/slots/${slotId}`);
        return res.data;
    },

    updateConsultationSlot: async (slotId, slotData) => {
        const res = await apiClient.put(`/faculty/consultations/slots/${slotId}`, slotData);
        return res.data;
    },

    fetchConsultationRequests: async () => {
        const res = await apiClient.get('/faculty/consultations/requests');
        return res.data;
    },

    updateConsultationStatus: async (requestId, status) => {
        const res = await apiClient.put(`/faculty/consultations/requests/${requestId}/status`, { status });
        return res.data;
    },
};