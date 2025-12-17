import { useState, useEffect, useCallback, useRef } from "react";
import { SiswaService } from "../../../../services/Admin/siswa/SiswaService";
import toast from "react-hot-toast";

export function useSiswa() {
  const isLoadingRef = useRef(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [jenisKelaminFilter, setJenisKelaminFilter] = useState("");
  const [sortBy, setSortBy] = useState("nisn");
  const [sortOrder, setSortOrder] = useState("asc");
  const [siswaData, setSiswaData] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 0,
    total_data: 0,
    per_page: 10,
    has_next: false,
    has_prev: false,
  });
  const [statistics, setStatistics] = useState({
    total_siswa: 0,
    jumlah_laki_laki: 0,
    jumlah_perempuan: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStatistics, setIsLoadingStatistics] = useState(false);
  const loadStatistics = useCallback(async () => {
    setIsLoadingStatistics(true);
    try {
      const response = await SiswaService.getAll({
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
  const loadSiswaData = useCallback(async () => {
    if (isLoadingRef.current) {
      return;
    }

    isLoadingRef.current = true;
    setIsLoading(true);
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      search: searchQuery,
      jenis_kelamin: jenisKelaminFilter,
      sort_by: sortBy,
      sort_order: sortOrder,
    };
    try {
      const response = await SiswaService.getAll(params);

      if (response.status === "success") {
        setSiswaData(response.data.siswa);
        setPagination(response.data.pagination);
      } else {
        toast.error(response.message || "Gagal mengambil data siswa");
        setSiswaData([]);
        setPagination({
          current_page: 1,
          total_pages: 0,
          total_data: 0,
          per_page: 10,
          has_next: false,
          has_prev: false,
        });
        setStatistics({
          total_siswa: 0,
          jumlah_laki_laki: 0,
          jumlah_perempuan: 0,
        });
      }
    } catch (error) {
      console.error("Error loading siswa data:", error);

      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;

        if (errorMessage.includes("Nomor halaman tidak valid")) {
          toast.error("Nomor halaman tidak valid");
        } else if (errorMessage.includes("Batas limit tidak valid")) {
          toast.error("Batas limit tidak valid");
        } else if (errorMessage.includes("Terjadi kesalahan server")) {
          toast.error("Terjadi kesalahan server");
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error("Gagal mengambil data siswa");
      }

      setSiswaData([]);
      setPagination({
        current_page: 1,
        total_pages: 0,
        total_data: 0,
        per_page: 10,
        has_next: false,
        has_prev: false,
      });
      setStatistics({
        total_siswa: 0,
        jumlah_laki_laki: 0,
        jumlah_perempuan: 0,
      });
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [currentPage, itemsPerPage, searchQuery, jenisKelaminFilter, sortBy, sortOrder]);
  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);
  useEffect(() => {
    loadSiswaData();
  }, [loadSiswaData, currentPage, itemsPerPage, searchQuery, jenisKelaminFilter, sortBy, sortOrder]);

  const handleSearch = (query) => {
    if (query !== searchQuery) {
      setSearchQuery(query);
      setCurrentPage(1);
    }
  };
  const handleJenisKelaminFilter = (jenisKelamin) => {
    let apiFilter = jenisKelamin;
    if (jenisKelamin === "Laki-laki") {
      apiFilter = "L";
    } else if (jenisKelamin === "Perempuan") {
      apiFilter = "P";
    }
    if (apiFilter !== jenisKelaminFilter) {
      setJenisKelaminFilter(apiFilter);
      setCurrentPage(1);
    }
  };
  const handleClearFilter = () => {
    setSearchQuery("");
    setJenisKelaminFilter("");
    setCurrentPage(1);
  };
  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };
  const handleRefresh = () => {
    loadSiswaData();
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
  const formatSiswaData = (siswaData) => {
    return siswaData.map(siswa => ({
      nama_lengkap: siswa.namaLengkap?.trim() || '',
      nisn: siswa.nisn?.trim() || '',
      nik: siswa.nik?.trim() || '',
      jenis_kelamin: siswa.jenisKelamin || '',
      tempat_lahir: siswa.tempatLahir?.trim() || '',
      tanggal_lahir: convertDateFormat(siswa.tanggalLahir)
    }));
  };
  const checkNikUniqueness = async (nikList) => {
    try {
      const response = await SiswaService.checkMultiple([], nikList);

      if (response.status === "success") {
        const existingNik = response.data.existing_nik || [];
        return nikList.map(nik => ({
          nik,
          exists: existingNik.includes(nik),
          existingData: existingNik.includes(nik) ? { nik } : null
        }));
      }
      return nikList.map(nik => ({
        nik,
        exists: false,
        existingData: null
      }));
    } catch (error) {
      console.error("Error checking NIK uniqueness:", error);
      return nikList.map(nik => ({
        nik,
        exists: false,
        existingData: null
      }));
    }
  };
  const validateSiswaData = (siswaData) => {
    const errors = [];

    siswaData.forEach((siswa, index) => {
      const studentErrors = [];
      if (!siswa.nama_lengkap || siswa.nama_lengkap.trim() === '') {
        studentErrors.push('Nama lengkap harus diisi');
      }
      if (!siswa.nisn || siswa.nisn.trim() === '') {
        studentErrors.push('NISN harus diisi');
      } else if (!/^\d{10}$/.test(siswa.nisn.trim())) {
        studentErrors.push('NISN harus 10 digit angka');
      }
      if (!siswa.nik || siswa.nik.trim() === '') {
        studentErrors.push('NIK harus diisi');
      } else if (!/^\d{16}$/.test(siswa.nik.trim())) {
        studentErrors.push('NIK harus 16 digit angka');
      }
      if (!siswa.jenis_kelamin || !['Laki-laki', 'Perempuan'].includes(siswa.jenis_kelamin)) {
        studentErrors.push('Jenis kelamin harus Laki-laki atau Perempuan');
      }
      if (!siswa.tempat_lahir || siswa.tempat_lahir.trim() === '') {
        studentErrors.push('Tempat lahir harus diisi');
      }
      if (!siswa.tanggal_lahir || siswa.tanggal_lahir.trim() === '') {
        studentErrors.push('Tanggal lahir harus diisi');
      } else {
        const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = siswa.tanggal_lahir.match(dateRegex);
        if (!match) {
          studentErrors.push('Format tanggal lahir harus dd/mm/yyyy');
        } else {
          const day = parseInt(match[1]);
          const month = parseInt(match[2]);
          const year = parseInt(match[3]);

          const date = new Date(year, month - 1, day);
          if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
            studentErrors.push('Tanggal lahir tidak valid');
          } else if (date > new Date()) {
            studentErrors.push('Tanggal lahir tidak boleh di masa depan');
          }
        }
      }

      if (studentErrors.length > 0) {
        errors.push({
          index: index + 1,
          nama_lengkap: siswa.nama_lengkap || 'Tidak ada nama',
          errors: studentErrors
        });
      }
    });

    return errors;
  };
  const validateSiswaDataWithUniqueness = async (siswaData) => {
    const formatErrors = validateSiswaData(siswaData);
    if (formatErrors.length > 0) {
      return { isValid: false, errors: formatErrors, uniquenessErrors: [] };
    }
    const nikList = siswaData.map(siswa => siswa.nik.trim()).filter(nik => nik);
    const uniquenessResults = await checkNikUniqueness(nikList);
    const uniquenessErrors = [];
    const duplicateNiks = [];
    uniquenessResults.forEach((result) => {
      if (result.exists) {
        const studentIndex = siswaData.findIndex(s => s.nik.trim() === result.nik);
        if (studentIndex !== -1) {
          uniquenessErrors.push({
            index: studentIndex + 1,
            nama_lengkap: siswaData[studentIndex].nama_lengkap || 'Tidak ada nama',
            nik: result.nik,
            error: 'NIK sudah ada di database'
          });
          duplicateNiks.push(result.nik);
        }
      }
    });
    const nikCounts = {};
    siswaData.forEach((siswa, index) => {
      const nik = siswa.nik.trim();
      if (nik) {
        if (nikCounts[nik]) {
          nikCounts[nik].push(index + 1);
        } else {
          nikCounts[nik] = [index + 1];
        }
      }
    });
    Object.entries(nikCounts).forEach(([nik, indices]) => {
      if (indices.length > 1) {
        indices.forEach(index => {
          const studentIndex = index - 1;
          uniquenessErrors.push({
            index,
            nama_lengkap: siswaData[studentIndex].nama_lengkap || 'Tidak ada nama',
            nik,
            error: 'NIK duplikat dalam form'
          });
        });
      }
    });
    return {
      isValid: formatErrors.length === 0 && uniquenessErrors.length === 0,
      errors: formatErrors,
      uniquenessErrors,
      duplicateNiks
    };
  };

  const handleBulkCreateSiswa = async (siswaData) => {
    const formattedData = formatSiswaData(siswaData);
    const validationResult = await validateSiswaDataWithUniqueness(formattedData);

    if (!validationResult.isValid) {
      console.error("❌ Validation failed:", validationResult);
      if (validationResult.errors.length > 0) {
        validationResult.errors.forEach(error => {
          toast.error(`Form ${error.index}: ${error.errors.join(', ')}`);
        });
      }
      if (validationResult.uniquenessErrors.length > 0) {
        validationResult.uniquenessErrors.forEach(error => {
          toast.error(`Form ${error.index} (${error.nama_lengkap}): ${error.error}`);
        });
      }

      return { success: false, error: "Validasi data gagal" };
    }
    try {
      const response = await SiswaService.bulkCreate(formattedData);
      if (response.status === "success") {
        toast.success(`Berhasil menambah ${response.data.inserted_count} siswa`);
        loadSiswaData();
        loadStatistics();
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error("❌ Error bulk creating siswa:", error);
      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;
        if (errorMessage.includes("Validasi data gagal")) {
          toast.error("Validasi data gagal. Periksa kembali form yang diisi.");
        } else if (errorMessage.includes("Data duplikat ditemukan")) {
          toast.error("Data duplikat ditemukan. Periksa kembali form yang diisi.");
        } else if (errorMessage.includes("Data sudah ada di database")) {
          toast.error("Data sudah ada di database. Periksa kembali form yang diisi.");
        } else if (errorMessage.includes("Data siswa harus berupa array")) {
          toast.error("Format data tidak valid.");
        } else if (errorMessage.includes("Maksimal 50 siswa per request")) {
          toast.error("Maksimal 50 siswa per request.");
        } else if (errorMessage.includes("Terjadi kesalahan server")) {
          toast.error("Terjadi kesalahan server.");
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error("Gagal menambah siswa");
      }

      return { success: false, error: error.response?.data?.message || "Gagal menambah siswa" };
    }
  };


  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});


  const debouncedNikValidation = useRef(null);
  const debouncedNisnValidation = useRef(null);


  const checkNikUnique = async (nik, showLoading = true) => {
    if (!nik || nik.trim() === '') {
      return { isUnique: true, message: '', isLoading: false };
    }

    if (!/^\d{16}$/.test(nik.trim())) {
      return { isUnique: false, message: 'NIK harus 16 digit angka', isLoading: false };
    }

    if (showLoading) {
      setIsValidating(true);
    }

    try {
      const response = await SiswaService.checkSingle(null, nik.trim());

      if (response.status === "success") {
        if (response.data.nik_exists) {
          return {
            isUnique: false,
            message: 'NIK sudah digunakan',
            isLoading: false
          };
        }

        return { isUnique: true, message: 'NIK tersedia', isLoading: false };
      }

      return { isUnique: true, message: 'NIK tersedia', isLoading: false };
    } catch (error) {
      console.error("Error checking NIK uniqueness:", error);
      return { isUnique: true, message: 'NIK tersedia', isLoading: false };
    } finally {
      if (showLoading) {
        setIsValidating(false);
      }
    }
  };

  const checkNisnUnique = async (nisn, showLoading = true) => {
    if (!nisn || nisn.trim() === '') {
      return { isUnique: true, message: '', isLoading: false };
    }

    if (!/^\d{10}$/.test(nisn.trim())) {
      return { isUnique: false, message: 'NISN harus 10 digit angka', isLoading: false };
    }

    if (showLoading) {
      setIsValidating(true);
    }

    try {
      const response = await SiswaService.checkSingle(nisn.trim(), null);

      if (response.status === "success") {
        if (response.data.nisn_exists) {
          return {
            isUnique: false,
            message: 'NISN sudah digunakan',
            isLoading: false
          };
        }

        return { isUnique: true, message: 'NISN tersedia', isLoading: false };
      }

      return { isUnique: true, message: 'NISN tersedia', isLoading: false };
    } catch (error) {
      console.error("Error checking NISN uniqueness:", error);
      return { isUnique: true, message: 'NISN tersedia', isLoading: false };
    } finally {
      if (showLoading) {
        setIsValidating(false);
      }
    }
  };

  const debouncedCheckNik = useCallback((nik, formId) => {
    if (debouncedNikValidation.current) {
      clearTimeout(debouncedNikValidation.current);
    }

    debouncedNikValidation.current = setTimeout(async () => {
      if (nik && nik.trim().length === 16) {
        const result = await checkNikUnique(nik, false);
        setValidationErrors(prev => ({
          ...prev,
          [`${formId}_nik`]: result
        }));
      }
    }, 500);
  }, []);

  const debouncedCheckNisn = useCallback((nisn, formId) => {
    if (debouncedNisnValidation.current) {
      clearTimeout(debouncedNisnValidation.current);
    }

    debouncedNisnValidation.current = setTimeout(async () => {
      if (nisn && nisn.trim().length === 10) {
        const result = await checkNisnUnique(nisn, false);
        setValidationErrors(prev => ({
          ...prev,
          [`${formId}_nisn`]: result
        }));
      }
    }, 500);
  }, []);

  const validateField = async (field, value, formId) => {
    if (field === 'nik' && value && value.trim().length === 16) {
      debouncedCheckNik(value, formId);
    } else if (field === 'nisn' && value && value.trim().length === 10) {
      debouncedCheckNisn(value, formId);
    }
  };

  const clearValidationError = (formId, field) => {
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`${formId}_${field}`];
      return newErrors;
    });
  };

  const getValidationError = (formId, field) => {
    return validationErrors[`${formId}_${field}`] || null;
  };

  const formatDateForAPI = (dateString) => {
    if (!dateString) return '';

    if (dateString.includes('/')) {
      return dateString;
    }

    if (dateString.includes('-')) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }

    return dateString;
  };


  const handleUpdateSiswa = async (id, siswaData) => {
    const formattedData = {
      nama_lengkap: siswaData.namaLengkap?.trim() || '',
      nisn: siswaData.nisn?.trim() || '',
      nik: siswaData.nik?.trim() || '',
      jenis_kelamin: siswaData.jenisKelamin || '',
      tempat_lahir: siswaData.tempatLahir?.trim() || '',
      tanggal_lahir: formatDateForAPI(siswaData.tanggalLahir)
    };
    try {
      const response = await SiswaService.update(id, formattedData);

      if (response.status === "success") {
        toast.success("Data siswa berhasil diperbarui");
        loadSiswaData();
        loadStatistics();
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || "Gagal memperbarui data siswa");
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error("❌ Error updating siswa:", error);
      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;
        if (errorMessage.includes("NISN sudah digunakan")) {
          toast.error("NISN sudah digunakan oleh siswa lain");
        } else if (errorMessage.includes("NIK sudah digunakan")) {
          toast.error("NIK sudah digunakan oleh siswa lain");
        } else if (errorMessage.includes("Siswa tidak ditemukan")) {
          toast.error("Siswa tidak ditemukan");
        } else if (errorMessage.includes("Validasi data gagal")) {
          toast.error("Validasi data gagal. Periksa kembali form yang diisi.");
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error("Gagal memperbarui data siswa");
      }

      return { success: false, error: error.response?.data?.message || "Gagal memperbarui data siswa" };
    }
  };
  const handleDeleteSiswa = async (id) => {
    try {
      const response = await SiswaService.delete(id);

      if (response.status === "success") {
        toast.success("Data siswa berhasil dihapus");
        loadSiswaData();
        loadStatistics();
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || "Gagal menghapus data siswa");
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error("❌ Error deleting siswa:", error);
      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;
        if (errorMessage.includes("Siswa tidak ditemukan")) {
          toast.error("Siswa tidak ditemukan");
        } else if (errorMessage.includes("masih terhubung dengan data lain")) {
          toast.error("Tidak dapat menghapus siswa karena masih terhubung dengan data lain (kelas/nilai)");
        } else if (errorMessage.includes("ID siswa tidak valid")) {
          toast.error("ID siswa tidak valid");
        } else if (errorMessage.includes("Terjadi kesalahan server")) {
          toast.error("Terjadi kesalahan server");
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error("Gagal menghapus data siswa");
      }

      return { success: false, error: error.response?.data?.message || "Gagal menghapus data siswa" };
    }
  };

  return {
    siswaData,
    pagination,
    statistics,
    isLoading,
    isLoadingStatistics,
    searchQuery,
    jenisKelaminFilter,
    sortBy,
    sortOrder,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    handleSearch,
    handleJenisKelaminFilter,
    handleClearFilter,
    handleItemsPerPageChange,
    handleRefresh,
    handleSort,
    handleBulkCreateSiswa,
    loadSiswaData,
    checkNikUnique,
    checkNisnUnique,
    validateSiswaDataWithUniqueness,
    validateField,
    clearValidationError,
    getValidationError,
    isValidating,
    validationErrors,
    handleUpdateSiswa,
    handleDeleteSiswa,
  };
}
