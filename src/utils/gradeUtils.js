// frontend/src/utils/gradeUtils.js
// Shared GWA computation used by AdminGrading and StudentDashboard.
// Single source of truth — both portals will now show the same GWA value.

/**
 * Computes GWA from a grades array.
 * @param {Array} grades - Array of grade objects with `final_grade` field.
 * @returns {number|null} GWA rounded to 2 decimal places, or null if no graded records.
 */
export const computeGWA = (grades = []) => {
    const graded = grades.filter(g => g.final_grade != null);
    if (!graded.length) return null;
    const sum = graded.reduce((acc, g) => acc + Number(g.final_grade), 0);
    return parseFloat((sum / graded.length).toFixed(2));
};

/**
 * Returns a label + color token for a given GWA value.
 * Uses the Philippine grading system (1.0 best, 5.0 failing).
 */
export const gwaLabel = (gwa) => {
    if (gwa === null) return { label: 'N/A', color: 'var(--text-muted)' };
    if (gwa <= 1.25) return { label: 'Summa Cum Laude', color: 'var(--color-success)' };
    if (gwa <= 1.50) return { label: 'Magna Cum Laude', color: 'var(--color-success)' };
    if (gwa <= 1.75) return { label: 'Cum Laude', color: 'var(--accent-light)' };
    if (gwa <= 3.00) return { label: 'Good Standing', color: 'var(--text-secondary)' };
    return { label: 'Needs Attention', color: 'var(--color-danger)' };
};