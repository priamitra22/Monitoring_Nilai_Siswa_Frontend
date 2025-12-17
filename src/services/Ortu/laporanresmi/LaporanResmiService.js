import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Get all laporan resmi for ortu's child
 * Returns all versions from all periods
 */
export const getAllLaporanResmi = async () => {
    try {
        const response = await axios.get(`${API_URL}/ortu/laporan-resmi`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching laporan resmi:', error);
        throw error;
    }
};

/**
 * Download laporan resmi PDF by ID
 * Returns blob for file download
 */
export const downloadLaporanResmi = async (laporanId) => {
    try {
        const response = await axios.get(
            `${API_URL}/ortu/laporan-resmi/download/${laporanId}`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                },
                responseType: 'blob',
            }
        );

        // Extract filename from Content-Disposition header
        const contentDisposition = response.headers['content-disposition'];
        let filename = `Laporan_${laporanId}.pdf`;

        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1].trim();
            }
        }

        // Create blob and trigger download
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return { success: true, filename };
    } catch (error) {
        console.error('Error downloading laporan resmi:', error);
        throw error;
    }
};

export default {
    getAllLaporanResmi,
    downloadLaporanResmi,
};
