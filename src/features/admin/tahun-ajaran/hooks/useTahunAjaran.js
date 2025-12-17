import { useState, useEffect } from "react";
import { TahunAjaranService } from "../../../../services/Admin/tahunajaran/TahunAjaranService";
import toast from "react-hot-toast";

export function useTahunAjaran() {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [tahunAjaranData, setTahunAjaranData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedTahunAjaran, setSelectedTahunAjaran] = useState(null);
    const [sortConfig] = useState({
        sort: 'tahun',
        order: 'DESC'
    });
    const loadTahunAjaran = async () => {
        setIsLoading(true);
        try {
            const response = await TahunAjaranService.getAll(sortConfig);
            if (response.status === 'success') {
                setTahunAjaranData(response.data);
            }
        } catch (error) {
            console.error('Error loading tahun ajaran:', error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Gagal memuat data tahun ajaran');
            }
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        loadTahunAjaran();
    }, []);
    const handleToggleStatus = async (id) => {
        try {
            const response = await TahunAjaranService.toggleStatus(id);
            if (response.status === 'success') {
                toast.success(response.message || 'Status tahun ajaran berhasil diubah');
                loadTahunAjaran();
            }
        } catch (error) {
            console.error('Error toggling status:', error);
            if (error.response?.data?.message) {
                const errorMessage = error.response.data.message;
                if (errorMessage.includes('Sudah ada tahun ajaran aktif')) {
                    toast.error(errorMessage);
                } else {
                    toast.error(errorMessage);
                }
            } else {
                toast.error('Gagal mengubah status tahun ajaran');
            }
        }
    };
    const handleDelete = (id) => {
        const tahunData = tahunAjaranData.find(item => item.id === id);
        if (tahunData) {
            setSelectedTahunAjaran(tahunData);
            setIsDeleteModalOpen(true);
        }
    };
    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedTahunAjaran(null);
    };
    const handleDeleteSuccess = () => {
        loadTahunAjaran();
    };
    const handleTambah = () => {
        setIsModalOpen(true);
    };
    const handleModalClose = () => {
        setIsModalOpen(false);
    };
    const handleModalSuccess = () => {
        loadTahunAjaran();
    };

    const totalPages = Math.ceil(tahunAjaranData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = tahunAjaranData.slice(startIndex, endIndex);

    return {
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        tahunAjaranData,
        isLoading,
        isModalOpen,
        isDeleteModalOpen,
        selectedTahunAjaran,
        currentData,
        totalPages,
        startIndex,
        handleToggleStatus,
        handleDelete,
        handleCloseDeleteModal,
        handleDeleteSuccess,
        handleTambah,
        handleModalClose,
        handleModalSuccess,
        loadTahunAjaran
    };
}