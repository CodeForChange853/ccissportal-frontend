
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


export const gwaLabel = (gwa) => {
    if (gwa === null) return { label: 'N/A', color: 'var(--text-muted)' };
    if (gwa <= 1.25) return { label: 'Summa Cum Laude', color: 'var(--color-success)' };
    if (gwa <= 1.50) return { label: 'Magna Cum Laude', color: 'var(--color-success)' };
    if (gwa <= 1.75) return { label: 'Cum Laude', color: 'var(--accent-light)' };
    if (gwa <= 3.00) return { label: 'Good Standing', color: 'var(--text-secondary)' };
    return { label: 'Needs Attention', color: 'var(--color-danger)' };
};