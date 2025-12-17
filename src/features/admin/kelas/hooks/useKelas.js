import { useState, useEffect, useCallback } from 'react';
import { KelasService } from '../../../../services/Admin/kelas/KelasService';
import toast from 'react-hot-toast';

export function useKelas() {
    const [selectedTahun, setSelectedTahun] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedTahunAjaranId, setSelectedTahunAjaranId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isTambahKelasModalOpen, setIsTambahKelasModalOpen] = useState(false);
    const [isEditKelasModalOpen, setIsEditKelasModalOpen] = useState(false);
    const [isDeleteKelasModalOpen, setIsDeleteKelasModalOpen] = useState(false);
    const [selectedKelasData, setSelectedKelasData] = useState(null);
    const [selectedKelasForDelete, setSelectedKelasForDelete] = useState(null);
    const [tahunAjaranOptions, setTahunAjaranOptions] = useState([]);
    const [availableSemesters, setAvailableSemesters] = useState([]);
    const [isLoadingTahunAjaran, setIsLoadingTahunAjaran] = useState(false);
    const [kelasData, setKelasData] = useState([]);
    const [pagination, setPagination] = useState({
        current_page: 1,
        total_pages: 0,
        total_data: 0,
        per_page: 10,
        has_next: false,
        has_prev: false
    });
    const [isLoadingKelas, setIsLoadingKelas] = useState(false);

    const loadTahunAjaranOptions = useCallback(async () => {
        setIsLoadingTahunAjaran(true);
        try {
            const response = await KelasService.getDropdownTahunAjaran();

            if (response.status === 'success') {
                setTahunAjaranOptions(response.data.tahunAjaranList);
                if (response.data.tahunAjaranAktif && !selectedTahun) {
                    setSelectedTahun(response.data.tahunAjaranAktif.tahun);
                    setSelectedSemester(response.data.tahunAjaranAktif.semester);
                    const semestersForYear = response.data.tahunAjaranList
                        .filter(item => item.tahun === response.data.tahunAjaranAktif.tahun)
                        .map(item => item.semester);
                    setAvailableSemesters(semestersForYear);
                }
            }
        } catch (error) {
            console.error('Error loading tahun ajaran options:', error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Gagal memuat data tahun ajaran');
            }
            setTahunAjaranOptions([]);
        } finally {
            setIsLoadingTahunAjaran(false);
        }
    }, [selectedTahun]);

    const loadKelasData = useCallback(async () => {
        if (!selectedTahun || !selectedSemester) {
            setKelasData([]);
            setPagination({
                current_page: 1,
                total_pages: 0,
                total_data: 0,
                per_page: 10,
                has_next: false,
                has_prev: false
            });
            return;
        }

        setIsLoadingKelas(true);
        try {
            const selectedTahunAjaran = tahunAjaranOptions.find(option =>
                option.tahun === selectedTahun && option.semester === selectedSemester
            );

            if (!selectedTahunAjaran) {
                console.error('Tahun ajaran tidak ditemukan');
                return;
            }

            const response = await KelasService.getDaftarKelas({
                tahun_ajaran_id: selectedTahunAjaran.id,
                page: currentPage,
                limit: itemsPerPage
            });

            if (response.status === 'success') {
                setKelasData(response.data.kelas);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error('Error loading kelas data:', error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Gagal memuat data kelas');
            }
            setKelasData([]);
            setPagination({
                current_page: 1,
                total_pages: 0,
                total_data: 0,
                per_page: 10,
                has_next: false,
                has_prev: false
            });
        } finally {
            setIsLoadingKelas(false);
        }
    }, [selectedTahun, selectedSemester, currentPage, itemsPerPage, tahunAjaranOptions]);
    useEffect(() => {
        loadTahunAjaranOptions();
    }, [loadTahunAjaranOptions]);
    useEffect(() => {
        loadKelasData();
    }, [loadKelasData]);
    const handleTahunChange = (tahun) => {
        setSelectedTahun(tahun);
        setCurrentPage(1);
        if (tahun) {
            const semestersForYear = tahunAjaranOptions
                .filter(item => item.tahun === tahun)
                .map(item => item.semester);
            setAvailableSemesters(semestersForYear);
            if (semestersForYear.length > 0) {
                setSelectedSemester(semestersForYear[0]);
                const selectedTahunAjaran = tahunAjaranOptions.find(option =>
                    option.tahun === tahun && option.semester === semestersForYear[0]
                );
                if (selectedTahunAjaran) {
                    setSelectedTahunAjaranId(selectedTahunAjaran.id);
                }
            }
        } else {
            setAvailableSemesters([]);
            setSelectedSemester('');
            setSelectedTahunAjaranId(null);
        }
    };

    const handleSemesterChange = (semester) => {
        setSelectedSemester(semester);
        setCurrentPage(1);
        if (selectedTahun && semester) {
            const selectedTahunAjaran = tahunAjaranOptions.find(option =>
                option.tahun === selectedTahun && option.semester === semester
            );
            if (selectedTahunAjaran) {
                setSelectedTahunAjaranId(selectedTahunAjaran.id);
            }
        }
    };
    const handleTambah = () => {
        setIsTambahKelasModalOpen(true);
    };
    const handleCloseTambahKelasModal = () => {
        setIsTambahKelasModalOpen(false);
    };
    const handleSaveKelas = (kelasData) => {
        loadKelasData();
        handleCloseTambahKelasModal();
    };

    const handleOpenEditKelasModal = (kelasData) => {
        setSelectedKelasData(kelasData.id);
        setIsEditKelasModalOpen(true);
    };

    const handleCloseEditKelasModal = () => {
        setIsEditKelasModalOpen(false);
        setSelectedKelasData(null);
    };
    const handleSaveEditKelas = (kelasData) => {
        loadKelasData();
        handleCloseEditKelasModal();
    };
    const handleDelete = (kelasData) => {
        setSelectedKelasForDelete(kelasData);
        setIsDeleteKelasModalOpen(true);
    };
    const handleCloseDeleteKelasModal = () => {
        setIsDeleteKelasModalOpen(false);
        setSelectedKelasForDelete(null);
    };
    const handleDeleteSuccess = () => {
        loadKelasData();
        handleCloseDeleteKelasModal();
    };
    const handleItemsPerPageChange = (value) => {
        setItemsPerPage(parseInt(value));
        setCurrentPage(1);
    };

    return {
        selectedTahun,
        selectedSemester,
        selectedTahunAjaranId,
        tahunAjaranOptions,
        availableSemesters,
        isLoadingTahunAjaran,
        kelasData,
        pagination,
        isLoadingKelas,
        isTambahKelasModalOpen,
        isEditKelasModalOpen,
        isDeleteKelasModalOpen,
        selectedKelasData,
        selectedKelasForDelete,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        handleTahunChange,
        handleSemesterChange,
        handleTambah,
        handleCloseTambahKelasModal,
        handleSaveKelas,
        handleOpenEditKelasModal,
        handleCloseEditKelasModal,
        handleSaveEditKelas,
        handleDelete,
        handleCloseDeleteKelasModal,
        handleDeleteSuccess,
        handleItemsPerPageChange,
        loadKelasData
    };
}
