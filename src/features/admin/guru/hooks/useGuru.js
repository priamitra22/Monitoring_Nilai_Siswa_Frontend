import { useState, useEffect, useCallback, useRef } from "react";
import { GuruService } from "../../../../services/Admin/guru/GuruService";
import toast from "react-hot-toast";

export function useGuru() {
  const isLoadingRef = useRef(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [guruData, setGuruData] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 0,
    total_data: 0,
    per_page: 10,
    has_next: false,
    has_prev: false,
  });
  const [statistics, setStatistics] = useState({
    total_guru: 0,
    jumlah_aktif: 0,
    jumlah_tidak_aktif: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStatistics, setIsLoadingStatistics] = useState(false)
  const loadStatistics = useCallback(async () => {
    setIsLoadingStatistics(true);
    try {
      const response = await GuruService.getAll({
        page: 1,
        limit: 1,
      });

      if (response.status === "success") {
        setStatistics(response.data.statistics);
      }
    } catch (error) {
      console.error("Error loading statistics:", error);
    } finally {
      setIsLoadingStatistics(false);
    }
  }, []);
  const loadGuruData = useCallback(async () => {
    if (isLoadingRef.current) {
      return;
    }

    isLoadingRef.current = true;
    setIsLoading(true);
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      search: searchQuery,
      status: statusFilter,
      sort_by: sortBy,
      sort_order: sortOrder,
    };

    try {
      const response = await GuruService.getAll(params);

      if (response.status === "success") {
        setGuruData(response.data.guru);
        setPagination(response.data.pagination);
      } else {
        toast.error(response.message || "Gagal mengambil data guru");
        setGuruData([]);
        setPagination({
          current_page: 1,
          total_pages: 0,
          total_data: 0,
          per_page: 10,
          has_next: false,
          has_prev: false,
        });
        setStatistics({
          total_guru: 0,
          jumlah_laki_laki: 0,
          jumlah_perempuan: 0,
        });
      }
    } catch (error) {
      console.error("Error loading guru data:", error);

      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;

        if (errorMessage.includes("Nomor halaman tidak valid")) {
          toast.error("Nomor halaman tidak valid");
        } else if (errorMessage.includes("Batas limit tidak valid")) {
          toast.error("Batas limit tidak valid");
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error("Gagal mengambil data guru");
      }

      setGuruData([]);
      setPagination({
        current_page: 1,
        total_pages: 0,
        total_data: 0,
        per_page: 10,
        has_next: false,
        has_prev: false,
      });
      setStatistics({
        total_guru: 0,
        jumlah_laki_laki: 0,
        jumlah_perempuan: 0,
      });
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [currentPage, itemsPerPage, searchQuery, statusFilter, sortBy, sortOrder]);
  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);
  useEffect(() => {
    loadGuruData();
  }, [loadGuruData, currentPage, itemsPerPage, searchQuery, statusFilter, sortBy, sortOrder]);
  const handleSearch = (query) => {
    if (query !== searchQuery) {
      setSearchQuery(query);
      setCurrentPage(1);
    }
  };
  const handleStatusFilter = (status) => {
    if (status === statusFilter) return;

    setStatusFilter(status);
    setCurrentPage(1);
  };
  const handleClearFilter = () => {
    setSearchQuery("");
    setStatusFilter("");
    setCurrentPage(1);
  };
  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };
  const handleRefresh = () => {
    loadGuruData();
    loadStatistics();
  };
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };
  const convertDateFormat = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };
  const formatGuruData = (guruData) => {
    return guruData.map(guru => ({
      nama_lengkap: guru.namaLengkap?.trim() || '',
      nip: guru.nip?.trim() || '',
      nik: guru.nik?.trim() || '',
      jenis_kelamin: guru.jenisKelamin || '',
      tempat_lahir: guru.tempatLahir?.trim() || '',
      tanggal_lahir: guru.tanggalLahir ? convertDateFormat(guru.tanggalLahir) : '',
    }));
  };
  const handleBulkCreateGuru = async (guruData) => {
    try {
      const formattedData = formatGuruData(guruData);
      const response = await GuruService.bulkCreate(formattedData);

      if (response.status === "success") {
        toast.success(`Berhasil menambah ${response.data.inserted_count} guru`);
        loadGuruData();
        loadStatistics();
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || "Gagal menambah guru");
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error("Error creating guru:", error);

      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;

        if (errorMessage.includes("Validasi data gagal")) {
          toast.error("Validasi data gagal. Periksa kembali form yang diisi.");
        } else if (errorMessage.includes("Data duplikat ditemukan")) {
          toast.error("Data duplikat ditemukan. Periksa kembali form yang diisi.");
        } else if (errorMessage.includes("Data sudah ada")) {
          toast.error("Data sudah ada. Periksa kembali form yang diisi.");
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error("Gagal menambah guru");
      }

      return { success: false, error: error.response?.data?.message || "Gagal menambah guru" };
    }
  };
  const handleUpdateGuru = async (id, guruData) => {
    try {
      const response = await GuruService.update(id, guruData);

      if (response.status === "success") {
        toast.success("Data guru berhasil diperbarui");
        loadGuruData();
        loadStatistics();
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || "Gagal memperbarui data guru");
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error("Error updating guru:", error);

      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;

        if (errorMessage.includes("NIP sudah digunakan")) {
          toast.error("NIP sudah digunakan guru lain");
        } else if (errorMessage.includes("NIK sudah digunakan")) {
          toast.error("NIK sudah digunakan guru lain");
        } else if (errorMessage.includes("Guru tidak ditemukan")) {
          toast.error("Guru tidak ditemukan");
        } else if (errorMessage.includes("Validasi data gagal")) {
          toast.error("Validasi data gagal. Periksa kembali form yang diisi.");
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error("Gagal memperbarui data guru");
      }

      return { success: false, error: error.response?.data?.message || "Gagal memperbarui data guru" };
    }
  };
  const handleDeleteGuru = async (id) => {
    try {
      const response = await GuruService.delete(id);

      if (response.status === "success") {
        toast.success("Data guru berhasil dihapus");
        loadGuruData();
        loadStatistics();
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || "Gagal menghapus data guru");
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error("Error deleting guru:", error);

      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;

        if (errorMessage.includes("Guru tidak ditemukan")) {
          toast.error("Guru tidak ditemukan");
        } else if (errorMessage.includes("masih terhubung dengan mata pelajaran kelas")) {
          toast.error("Guru tidak dapat dihapus karena masih terhubung dengan mata pelajaran kelas");
        } else if (errorMessage.includes("ID guru tidak valid")) {
          toast.error("ID guru tidak valid");
        } else if (errorMessage.includes("Terjadi kesalahan server")) {
          toast.error("Terjadi kesalahan server");
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error("Gagal menghapus data guru");
      }

      return { success: false, error: error.response?.data?.message || "Gagal menghapus data guru" };
    }
  };

  return {
    guruData,
    pagination,
    statistics,
    isLoading,
    isLoadingStatistics,
    searchQuery,
    statusFilter,
    sortBy,
    sortOrder,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,

    handleSearch,
    handleStatusFilter,
    handleClearFilter,
    handleItemsPerPageChange,
    handleRefresh,
    handleSort,
    handleBulkCreateGuru,
    loadGuruData,

    handleUpdateGuru,
    handleDeleteGuru,
  };
}
