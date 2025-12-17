import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { KelasService } from '../../../../services/Admin/kelas/KelasService';
import toast from 'react-hot-toast';

export function useKelasDetail(kelasId, tahunAjaranId) {
    const navigate = useNavigate();
    const [kelasInfo, setKelasInfo] = useState(null);
    const [isLoadingKelasInfo, setIsLoadingKelasInfo] = useState(false);
    const [activeTab, setActiveTab] = useState('siswa');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [siswaData, setSiswaData] = useState([]);
    const [siswaPagination, setSiswaPagination] = useState(null);
    const [isLoadingSiswa, setIsLoadingSiswa] = useState(false);
    const [mapelData, setMapelData] = useState([]);
    const [mapelPagination, setMapelPagination] = useState(null);
    const [isLoadingMapel, setIsLoadingMapel] = useState(false);
    const [isTambahSiswaModalOpen, setIsTambahSiswaModalOpen] = useState(false);
    const [isNaikKelasModalOpen, setIsNaikKelasModalOpen] = useState(false);
    const [isTambahMapelModalOpen, setIsTambahMapelModalOpen] = useState(false);
    const [isEditMapelModalOpen, setIsEditMapelModalOpen] = useState(false);
    const [isDeleteMapelModalOpen, setIsDeleteMapelModalOpen] = useState(false);
    const [selectedMapelData, setSelectedMapelData] = useState(null);
    const [isDeleteSiswaModalOpen, setIsDeleteSiswaModalOpen] = useState(false);
    const [selectedSiswaData, setSelectedSiswaData] = useState(null);

    const loadKelasInfo = useCallback(async () => {
        if (!kelasId) return;

        setIsLoadingKelasInfo(true);
        try {
            const response = await KelasService.getInfoKelas(kelasId);

            if (response.status === 'success') {
                setKelasInfo(response.data);
            } else {
                toast.error(response.message || 'Gagal mengambil informasi kelas');
            }
        } catch (error) {
            console.error('Error loading kelas info:', error);

            if (error.response?.data?.message) {
                const errorMessage = error.response.data.message;

                if (errorMessage.includes('tidak ditemukan')) {
                    toast.error('Kelas tidak ditemukan');
                } else if (errorMessage.includes('harus berupa angka')) {
                    toast.error('ID kelas tidak valid');
                } else if (errorMessage.includes('Terjadi kesalahan server')) {
                    toast.error('Terjadi kesalahan server');
                } else {
                    toast.error(errorMessage);
                }
            } else {
                toast.error('Gagal mengambil informasi kelas');
            }
        } finally {
            setIsLoadingKelasInfo(false);
        }
    }, [kelasId]);

    const loadSiswaData = useCallback(async (page = 1, limit = 10) => {
        if (!kelasId) return;

        setIsLoadingSiswa(true);
        try {
            const response = await KelasService.getDaftarSiswaKelas(kelasId, tahunAjaranId, page, limit);

            if (response.status === 'success') {
                setSiswaData(response.data.data);
                setSiswaPagination({
                    total: response.data.total,
                    page: response.data.page,
                    limit: response.data.limit,
                    totalPages: response.data.totalPages
                });
            } else {
                toast.error(response.message || 'Gagal mengambil data siswa');
            }
        } catch (error) {
            console.error('Error loading siswa data:', error);

            if (error.response?.data?.message) {
                const errorMessage = error.response.data.message;

                if (errorMessage.includes('tidak ditemukan')) {
                    toast.error('Kelas tidak ditemukan');
                } else if (errorMessage.includes('harus berupa angka')) {
                    toast.error('ID kelas tidak valid');
                } else if (errorMessage.includes('Halaman harus lebih dari 0')) {
                    toast.error('Nomor halaman tidak valid');
                } else if (errorMessage.includes('Limit harus antara 1-100')) {
                    toast.error('Jumlah data per halaman tidak valid');
                } else if (errorMessage.includes('Terjadi kesalahan server')) {
                    toast.error('Terjadi kesalahan server');
                } else {
                    toast.error(errorMessage);
                }
            } else {
                toast.error('Gagal mengambil data siswa');
            }
        } finally {
            setIsLoadingSiswa(false);
        }
    }, [kelasId, tahunAjaranId]);

    const loadMapelData = useCallback(async (page = 1, limit = 10) => {
        if (!kelasId) return;

        setIsLoadingMapel(true);
        try {
            const response = await KelasService.getDaftarMataPelajaran(kelasId, {
                tahun_ajaran_id: tahunAjaranId,
                page,
                limit
            });

            if (response.status === 'success') {
                setMapelData(response.data.mata_pelajaran || []);
                setMapelPagination({
                    current_page: response.data.pagination.current_page,
                    per_page: response.data.pagination.per_page,
                    total: response.data.pagination.total,
                    total_pages: response.data.pagination.total_pages
                });
            } else {
                toast.error(response.message || 'Gagal mengambil data mata pelajaran');
            }
        } catch (error) {
            console.error('Error loading mapel data:', error);

            if (error.response?.data?.message) {
                const errorMessage = error.response.data.message;

                if (errorMessage.includes('tidak ditemukan')) {
                    toast.error('Kelas tidak ditemukan');
                } else if (errorMessage.includes('harus berupa angka')) {
                    toast.error('ID kelas tidak valid');
                } else {
                    toast.error(errorMessage);
                }
            } else if (error.message === 'Network Error') {
                toast.error('Tidak dapat terhubung ke server');
            } else {
                toast.error('Terjadi kesalahan saat mengambil data mata pelajaran');
            }
        } finally {
            setIsLoadingMapel(false);
        }
    }, [kelasId, tahunAjaranId]);

    useEffect(() => {
        loadKelasInfo();
    }, [loadKelasInfo]);

    useEffect(() => {
        if (activeTab === 'siswa') {
            loadSiswaData(currentPage, itemsPerPage);
        }
    }, [activeTab, loadSiswaData, currentPage, itemsPerPage]);
    const handleBack = () => {
        navigate('/admin/kelola-guru-kelas');
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCurrentPage(1);

        if (tab === 'mapel') {
            loadMapelData(1, itemsPerPage);
        }
    };

    const handleOpenTambahSiswaModal = () => {
        setIsTambahSiswaModalOpen(true);
    };

    const handleCloseTambahSiswaModal = () => {
        setIsTambahSiswaModalOpen(false);
    };

    const handleOpenNaikKelasModal = () => {
        setIsNaikKelasModalOpen(true);
    };

    const handleCloseNaikKelasModal = () => {
        setIsNaikKelasModalOpen(false);
    };

    const handleOpenTambahMapelModal = () => {
        setIsTambahMapelModalOpen(true);
    };

    const handleCloseTambahMapelModal = () => {
        setIsTambahMapelModalOpen(false);
    };

    const handleOpenEditMapelModal = (mapelData) => {
        setSelectedMapelData(mapelData);
        setIsEditMapelModalOpen(true);
    };

    const handleCloseEditMapelModal = () => {
        setIsEditMapelModalOpen(false);
        setSelectedMapelData(null);
    };

    const handleOpenDeleteMapelModal = (mapelData) => {
        setSelectedMapelData(mapelData);
        setIsDeleteMapelModalOpen(true);
    };

    const handleCloseDeleteMapelModal = () => {
        setIsDeleteMapelModalOpen(false);
        setSelectedMapelData(null);
    };

    const handleSaveMapel = (mapelData) => {
        loadMapelData(currentPage, itemsPerPage);
    };

    const handleDeleteMapel = (mapelId) => {
        loadMapelData(currentPage, itemsPerPage);
    };

    const handleOpenDeleteSiswaModal = (siswaData) => {
        setSelectedSiswaData(siswaData);
        setIsDeleteSiswaModalOpen(true);
    };

    const handleCloseDeleteSiswaModal = () => {
        setIsDeleteSiswaModalOpen(false);
        setSelectedSiswaData(null);
    };

    const handleSaveSiswa = (responseData) => {
        if (responseData && responseData.summary) {
            loadSiswaData(currentPage, itemsPerPage);
            loadKelasInfo();
        }
    };

    const handleSaveNaikKelas = (responseData) => {
        if (responseData && responseData.summary) {
            loadSiswaData(currentPage, itemsPerPage);
            loadKelasInfo();
        }
    };

    const handleHapusSiswa = async (siswaId) => {
        try {
            const response = await KelasService.hapusSiswaDariKelas(
                kelasId,
                siswaId,
                tahunAjaranId
            );

            if (response.status === 'success') {
                toast.success(response.message || 'Siswa berhasil dihapus dari kelas');

                loadSiswaData(currentPage, itemsPerPage);

                loadKelasInfo();
            } else {
                toast.error(response.message || 'Gagal menghapus siswa dari kelas');
            }
        } catch (error) {
            if (error.response?.data?.message) {
                const errorMessage = error.response.data.message;

                if (errorMessage.includes('tidak ditemukan')) {
                    toast.error('Siswa tidak ditemukan di kelas ini');
                } else if (errorMessage.includes('tidak ada di kelas')) {
                    toast.error('Siswa tidak ditemukan di kelas ini');
                } else {
                    toast.error(errorMessage);
                }
            } else {
                toast.error('Terjadi kesalahan saat menghapus siswa dari kelas');
            }
        }
    };

    return {
        kelasInfo,
        isLoadingKelasInfo,

        activeTab,
        setActiveTab,

        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        siswaData,
        siswaPagination,
        isLoadingSiswa,
        mapelData,
        mapelPagination,
        isLoadingMapel,
        isTambahSiswaModalOpen,
        isNaikKelasModalOpen,
        isTambahMapelModalOpen,
        isEditMapelModalOpen,
        isDeleteMapelModalOpen,
        selectedMapelData,
        isDeleteSiswaModalOpen,
        selectedSiswaData,
        handleBack,
        handleTabChange,
        handleOpenTambahSiswaModal,
        handleCloseTambahSiswaModal,
        handleOpenNaikKelasModal,
        handleCloseNaikKelasModal,
        handleOpenTambahMapelModal,
        handleCloseTambahMapelModal,
        handleOpenEditMapelModal,
        handleCloseEditMapelModal,
        handleOpenDeleteMapelModal,
        handleCloseDeleteMapelModal,
        handleSaveMapel,
        handleDeleteMapel,
        handleOpenDeleteSiswaModal,
        handleCloseDeleteSiswaModal,
        handleSaveSiswa,
        handleSaveNaikKelas,
        handleHapusSiswa,
        loadKelasInfo,
        loadSiswaData,
        loadMapelData
    };
}
