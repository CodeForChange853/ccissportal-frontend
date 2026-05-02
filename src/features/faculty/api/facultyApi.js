// frontend/src/features/faculty/api/facultyApi.js
// PHASE 4: FSD compliance — Faculty now has its own API file.
// FacultyDashboard was calling client.get('/faculty/load') directly.
// All faculty-specific calls live here instead.

import apiClient from '../../../api/client';

export const facultyApi = {
    // Returns the logged-in professor's subject list
    fetchLoad: async () => {
        const res = await apiClient.get('/faculty/load');
        return res.data;
    },

    // Returns the student roster for a specific subject (used by Gradebook)
    fetchClassRoster: async (subjectCode) => {
        const res = await apiClient.get(`/faculty/class/${subjectCode}`);
        return res.data;
    },

    // Submit a single grade update
    updateGrade: async (gradePayload) => {
        const res = await apiClient.put('/faculty/grades/update', gradePayload);
        return res.data;
    },

    // Batch sync offline grade edits
    syncGrades: async (updates) => {
        const res = await apiClient.post('/faculty/sync-grades', { updates });
        return res.data;
    },
};