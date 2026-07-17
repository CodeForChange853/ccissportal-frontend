import axios from 'axios';
import client from './client';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Public endpoints — plain axios, no auth headers required
export const getGlobalHonors = () =>
    axios.get(`${BASE}/latin-honors/global`).then(r => r.data);

export const getDepartmentHonors = (course) =>
    axios.get(`${BASE}/latin-honors/department/${encodeURIComponent(course)}`).then(r => r.data);

export const getRunningHonors = () =>
    axios.get(`${BASE}/latin-honors/running`).then(r => r.data);

export const getDepartments = () =>
    axios.get(`${BASE}/latin-honors/departments`).then(r => r.data);

export const rateStudent = (studentId, sessionToken, rating) =>
    axios.post(`${BASE}/latin-honors/${studentId}/rate`, { session_token: sessionToken, rating })
        .then(r => r.data);

// Admin endpoints — uses authenticated client (Bearer token injected via interceptor)
export const getAdminHonorsList = () =>
    client.get('/latin-honors/admin/list').then(r => r.data);

export const saveDeanNote = (studentAccountId, message) =>
    client.post('/latin-honors/dean-note', { student_account_id: studentAccountId, message })
        .then(r => r.data);

export const deleteDeanNote = (studentId) =>
    client.delete(`/latin-honors/dean-note/${studentId}`).then(r => r.data);

export const generateAiNote = (payload) =>
    client.post('/latin-honors/generate-note', payload).then(r => r.data);
