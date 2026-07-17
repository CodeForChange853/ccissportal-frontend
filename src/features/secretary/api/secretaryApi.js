import apiClient from '../../../api/client';

export const secretaryApi = {

    // ── F-13.1: OJT Clearance ────────────────────────────────────────────────
    fetchOJTSubmissions: async (status = null) => {
        const params = status ? `?status_filter=${status}` : '';
        const res = await apiClient.get(`/secretariat/ojt/all${params}`);
        return res.data;
    },

    reviewOJTSubmission: async (id, decision) => {
        const res = await apiClient.patch(`/secretariat/ojt/${id}/verify`, decision);
        return res.data;
    },

    getStudentOJTStatus: async (accountId) => {
        const res = await apiClient.get(`/secretariat/ojt/student/${accountId}/status`);
        return res.data;
    },

    // ── F-13.2: INC Grade Completion ─────────────────────────────────────────
    fetchCompletionRequests: async (state = null) => {
        const params = state ? `?state_filter=${state}` : '';
        const res = await apiClient.get(`/secretariat/completion/queue${params}`);
        return res.data;
    },

    fetchCompletionRequest: async (id) => {
        const res = await apiClient.get(`/secretariat/completion/${id}`);
        return res.data;
    },

    advanceCompletionRequest: async (id, payload) => {
        const res = await apiClient.patch(`/secretariat/completion/${id}/advance`, payload);
        return res.data;
    },

    // ── F-13.3: Subject Petitions ─────────────────────────────────────────────
    fetchPetitions: async (status = null, type = null) => {
        const params = new URLSearchParams();
        if (status) params.append('status_filter', status);
        if (type) params.append('petition_type', type);
        const qs = params.toString() ? `?${params}` : '';
        const res = await apiClient.get(`/secretariat/petitions${qs}`);
        return res.data;
    },

    fetchPetition: async (id) => {
        const res = await apiClient.get(`/secretariat/petitions/${id}`);
        return res.data;
    },

    secretaryActOnPetition: async (id, payload) => {
        const res = await apiClient.patch(`/secretariat/petitions/${id}/secretary-action`, payload);
        return res.data;
    },

    adminDecidePetition: async (id, payload) => {
        const res = await apiClient.patch(`/secretariat/petitions/${id}/admin-decision`, payload);
        return res.data;
    },

    // ── F-13.4: Subject Mapping Drafts ────────────────────────────────────────
    fetchMappingDrafts: async (status = null) => {
        const params = status ? `?status_filter=${status}` : '';
        const res = await apiClient.get(`/secretariat/mapping${params}`);
        return res.data;
    },

    fetchMappingDraft: async (id) => {
        const res = await apiClient.get(`/secretariat/mapping/${id}`);
        return res.data;
    },

    decideMappingDraft: async (id, payload) => {
        const res = await apiClient.patch(`/secretariat/mapping/${id}/decide`, payload);
        return res.data;
    },

    submitMappingForApproval: async (id) => {
        const res = await apiClient.patch(`/secretariat/mapping/${id}/submit`);
        return res.data;
    },

    deleteMappingDraft: async (id) => {
        const res = await apiClient.delete(`/secretariat/mapping/${id}`);
        return res.data;
    },

    // ── F-13.5: Equipment Inventory ───────────────────────────────────────────
    fetchEquipment: async (activeOnly = false) => {
        const params = activeOnly ? '?active_only=true' : '';
        const res = await apiClient.get(`/secretariat/equipment${params}`);
        return res.data;
    },

    addEquipment: async (payload) => {
        const res = await apiClient.post('/secretariat/equipment', payload);
        return res.data;
    },

    updateEquipment: async (id, payload) => {
        const res = await apiClient.patch(`/secretariat/equipment/${id}`, payload);
        return res.data;
    },

    fetchActiveCheckouts: async () => {
        const res = await apiClient.get('/secretariat/equipment/checkouts/active');
        return res.data;
    },

    checkoutEquipment: async (equipmentId, payload) => {
        const res = await apiClient.post(`/secretariat/equipment/${equipmentId}/checkout`, payload);
        return res.data;
    },

    returnEquipment: async (checkoutId, payload) => {
        const res = await apiClient.patch(`/secretariat/equipment/checkout/${checkoutId}/return`, payload);
        return res.data;
    },

    // ── F-13.6: Document Requests ─────────────────────────────────────────────
    fetchDocumentRequests: async (status = null) => {
        const params = status ? `?status_filter=${status}` : '';
        const res = await apiClient.get(`/secretariat/documents${params}`);
        return res.data;
    },

    fetchDocumentRequest: async (id) => {
        const res = await apiClient.get(`/secretariat/documents/${id}`);
        return res.data;
    },

    createExternalDocumentRequest: async (payload) => {
        const res = await apiClient.post('/secretariat/documents/external', payload);
        return res.data;
    },

    advanceDocumentStatus: async (id, payload) => {
        const res = await apiClient.patch(`/secretariat/documents/${id}/advance`, payload);
        return res.data;
    },

    // ── F-13.7: Student Organizations ────────────────────────────────────────
    fetchOrganizations: async (status = null) => {
        const params = status ? `?status_filter=${status}` : '';
        const res = await apiClient.get(`/secretariat/orgs${params}`);
        return res.data;
    },

    fetchOrganization: async (id) => {
        const res = await apiClient.get(`/secretariat/orgs/${id}`);
        return res.data;
    },

    processOrgRegistration: async (id, payload) => {
        const res = await apiClient.patch(`/secretariat/orgs/${id}/process`, payload);
        return res.data;
    },

    // ── F-13.7: Facilities ────────────────────────────────────────────────────
    fetchFacilities: async (bookableOnly = false) => {
        const params = bookableOnly ? '?bookable_only=true' : '';
        const res = await apiClient.get(`/secretariat/facilities${params}`);
        return res.data;
    },

    addFacility: async (payload) => {
        const res = await apiClient.post('/secretariat/facilities', payload);
        return res.data;
    },

    updateFacility: async (id, payload) => {
        const res = await apiClient.patch(`/secretariat/facilities/${id}`, payload);
        return res.data;
    },

    // ── F-13.7: Facility Bookings ─────────────────────────────────────────────
    fetchBookings: async (status = null, facilityId = null) => {
        const params = new URLSearchParams();
        if (status) params.append('status_filter', status);
        if (facilityId) params.append('facility_id', facilityId);
        const qs = params.toString() ? `?${params}` : '';
        const res = await apiClient.get(`/secretariat/bookings${qs}`);
        return res.data;
    },

    fetchBooking: async (id) => {
        const res = await apiClient.get(`/secretariat/bookings/${id}`);
        return res.data;
    },

    processBooking: async (id, payload) => {
        const res = await apiClient.patch(`/secretariat/bookings/${id}/process`, payload);
        return res.data;
    },

    // ── COR Release ───────────────────────────────────────────────────────────
    fetchCORQueue: async (status = null) => {
        const params = status ? `?cor_status=${status}` : '';
        const res = await apiClient.get(`/secretariat/cor${params}`);
        return res.data;
    },

    releaseCOR: async (requestId, payload = {}) => {
        const res = await apiClient.patch(`/secretariat/cor/${requestId}/release`, payload);
        return res.data;
    },

    // ── AI Document Verification Queue (HITL) ─────────────────────────────────

    /**
     * Fetches paginated NEEDS_REVIEW scan records.
     * The response header X-Total-Count contains the total queue size.
     * Returns { items: [...], total: number }
     */
    fetchVerificationQueue: async (skip = 0, limit = 30) => {
        const res = await apiClient.get(`/documents/verification-queue?skip=${skip}&limit=${limit}`);
        const total = parseInt(res.headers['x-total-count'] ?? '0', 10);
        return { items: res.data, total };
    },

    /**
     * Applies an admin/secretary correction to a NEEDS_REVIEW scan and marks
     * it as MANUALLY_VERIFIED.
     *
     * payload shape:
     *   {
     *     corrected_data: {
     *       full_name?:   string,
     *       student_id?:  string,
     *       total_units?: number,
     *       subjects?: [{ code, name, units }],
     *     },
     *     reviewer_notes?: string,
     *   }
     */
    correctScanData: async (scanToken, payload) => {
        const res = await apiClient.patch(`/documents/verification/${scanToken}/correct`, payload);
        return res.data;
    },

    /**
     * Fetches the full scan detail for a single token (used by the detail panel).
     * Returns the raw API response object including extracted_data, confidence_breakdown, etc.
     */
    fetchScanDetail: async (scanToken) => {
        const res = await apiClient.get(`/documents/verification/${scanToken}`);
        return res.data;
    },

    /**
     * Fetches the retained source document image as a Blob for display.
     * Returns an object URL string, or null if no image is available.
     * Caller is responsible for revoking the URL: URL.revokeObjectURL(url)
     */
    fetchReviewImageBlob: async (scanToken) => {
        try {
            const res = await apiClient.get(`/documents/verification/${scanToken}/image`, {
                responseType: 'blob',
            });
            return URL.createObjectURL(res.data);
        } catch {
            return null;
        }
    },
};
