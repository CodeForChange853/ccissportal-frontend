import apiClient from '../api/client';

export async function downloadCSV(url, filename) {
    const res = await apiClient.get(url, { responseType: 'blob' });
    const href = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = href;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(href);
}
