import { useState, useEffect } from 'react';
import { getAllLaporanResmi, downloadLaporanResmi } from '../../../../services/Ortu/laporanresmi/LaporanResmiService';
import { toast } from 'react-hot-toast';

/**
 * Custom hook for managing laporan resmi data and actions
 */
export const useLaporanResmi = () => {
    const [laporanList, setLaporanList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadingId, setDownloadingId] = useState(null);

    // Fetch all laporan resmi on mount
    useEffect(() => {
        fetchLaporanResmi();
    }, []);

    /**
     * Fetch all laporan resmi from API
     */
    const fetchLaporanResmi = async () => {
        setIsLoading(true);
        try {
            const response = await getAllLaporanResmi();

            if (response.status === 'success') {
                setLaporanList(response.data.laporan || []);
            } else {
                toast.error(response.message || 'Gagal mengambil data laporan');
                setLaporanList([]);
            }
        } catch (error) {
            console.error('Error fetching laporan resmi:', error);

            if (error.response?.status === 401) {
                toast.error('Sesi Anda telah berakhir. Silakan login kembali.');
            } else if (error.response?.status === 403) {
                toast.error('Anda tidak memiliki akses untuk melihat data ini.');
            } else {
                toast.error('Gagal mengambil data laporan resmi.');
            }

            setLaporanList([]);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Download laporan PDF by ID
     */
    const handleDownload = async (laporanId, namaFile) => {
        setIsDownloading(true);
        setDownloadingId(laporanId);

        try {
            const result = await downloadLaporanResmi(laporanId);

            if (result.success) {
                toast.success(`File ${result.filename} berhasil diunduh!`);
            }
        } catch (error) {
            console.error('Error downloading laporan:', error);

            if (error.response?.status === 401) {
                toast.error('Sesi Anda telah berakhir. Silakan login kembali.');
            } else if (error.response?.status === 403) {
                toast.error('Anda tidak memiliki akses untuk mengunduh laporan ini.');
            } else if (error.response?.status === 404) {
                toast.error('File laporan tidak ditemukan.');
            } else {
                toast.error('Gagal mengunduh laporan. Silakan coba lagi.');
            }
        } finally {
            setIsDownloading(false);
            setDownloadingId(null);
        }
    };

    /**
     * Refresh laporan list
     */
    const refreshLaporan = () => {
        fetchLaporanResmi();
    };

    return {
        laporanList,
        isLoading,
        isDownloading,
        downloadingId,
        handleDownload,
        refreshLaporan,
    };
};

export default useLaporanResmi;
