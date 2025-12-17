import { useState, useEffect, useCallback, useRef } from "react";
import { OrtuService } from "../../../../services/Admin/ortu/OrtuService";
import toast from "react-hot-toast";

export function useOrtu() {
  const isLoadingRef = useRef(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [relasiFilter, setRelasiFilter] = useState("");
  const [sortBy, setSortBy] = useState("nik");
  const [sortOrder, setSortOrder] = useState("asc");
  const [ortuData, setOrtuData] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 0,
    total_data: 0,
    per_page: 10,
    has_next: false,
    has_prev: false,
  });
  const [statistics, setStatistics] = useState({
    total_ortu: 0,
    jumlah_ayah: 0,
    jumlah_ibu: 0,
    jumlah_wali: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStatistics, setIsLoadingStatistics] = useState(false);
  const loadStatistics = useCallback(async () => {
    setIsLoadingStatistics(true);
    try {
      const response = await OrtuService.getAll({
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

  const loadOrtuData = useCallback(async () => {
    if (isLoadingRef.current) {
      return;
    }

    isLoadingRef.current = true;
    setIsLoading(true);
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      search: searchQuery,
      relasi: relasiFilter,
      sort_by: sortBy,
      sort_order: sortOrder,
    };

    try {
      const response = await OrtuService.getAll(params);

      if (response.status === "success") {
        setOrtuData(response.data.ortu);
        setPagination(response.data.pagination);
      } else {
        toast.error(response.message || "Gagal mengambil data orangtua");
        setOrtuData([]);
        setPagination({
          current_page: 1,
          total_pages: 0,
          total_data: 0,
          per_page: 10,
          has_next: false,
          has_prev: false,
        });
        setStatistics({
          total_ortu: 0,
          jumlah_ayah: 0,
          jumlah_ibu: 0,
          jumlah_wali: 0,
        });
      }
    } catch (error) {
      console.error("Error loading ortu data:", error);

      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;

        if (errorMessage.includes("Halaman harus berupa angka positif")) {
          toast.error("Halaman harus berupa angka positif");
        } else if (errorMessage.includes("Limit harus berupa angka positif")) {
          toast.error("Limit harus berupa angka positif");
        } else if (errorMessage.includes("Terjadi kesalahan server")) {
          toast.error("Terjadi kesalahan server");
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error("Gagal mengambil data orangtua");
      }

      setOrtuData([]);
      setPagination({
        current_page: 1,
        total_pages: 0,
        total_data: 0,
        per_page: 10,
        has_next: false,
        has_prev: false,
      });
      setStatistics({
        total_ortu: 0,
        jumlah_ayah: 0,
        jumlah_ibu: 0,
        jumlah_wali: 0,
      });
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [currentPage, itemsPerPage, searchQuery, relasiFilter, sortBy, sortOrder]);
  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);
  useEffect(() => {
    loadOrtuData();
  }, [
    loadOrtuData,
    currentPage,
    itemsPerPage,
    searchQuery,
    relasiFilter,
    sortBy,
    sortOrder,
  ]);
  const handleSearch = (query) => {
    if (query !== searchQuery) {
      setSearchQuery(query);
      setCurrentPage(1);
    }
  };


  const handleRelasiFilter = (relasi) => {
    if (relasi !== relasiFilter) {
      setRelasiFilter(relasi);
      setCurrentPage(1);
    }
  };

  const handleClearFilter = () => {
    setSearchQuery("");
    setRelasiFilter("");
    setCurrentPage(1);
  };
  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    loadOrtuData();
    loadStatistics();
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const CONVERT_DATE_FORMAT = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  const formatOrtuData = (ortuData) => {
    return ortuData.map((ortu) => ({
      nama_lengkap: ortu.namaLengkap?.trim() || "",
      nik: ortu.nik?.trim() || "",
      kontak: ortu.kontak?.trim() || "",
      relasi: ortu.relasi || "",
      anak: ortu.anak || [],
    }));
  };

  const checkNikUniqueness = async (nikList) => {
    try {
      const response = await OrtuService.checkMultiple(nikList);

      if (response.status === "success") {
        const existingNik = response.data.existing_nik || [];
        return nikList.map((nik) => ({
          nik,
          exists: existingNik.includes(nik),
          existingData: existingNik.includes(nik) ? { nik } : null,
        }));
      }
      return nikList.map((nik) => ({
        nik,
        exists: false,
        existingData: null,
      }));
    } catch (error) {
      console.error("Error checking NIK uniqueness:", error);
      return nikList.map((nik) => ({
        nik,
        exists: false,
        existingData: null,
      }));
    }
  };
  const validateOrtuData = (ortuData) => {
    const errors = [];

    ortuData.forEach((ortu, index) => {
      const ortuErrors = [];
      if (!ortu.nama_lengkap || ortu.nama_lengkap.trim() === "") {
        ortuErrors.push("Nama lengkap harus diisi");
      }
      if (!ortu.nik || ortu.nik.trim() === "") {
        ortuErrors.push("NIK harus diisi");
      } else if (!/^\d{16}$/.test(ortu.nik.trim())) {
        ortuErrors.push("NIK harus 16 digit angka");
      }
      if (!ortu.kontak || ortu.kontak.trim() === "") {
        ortuErrors.push("Kontak harus diisi");
      }
      if (!ortu.relasi || !["Ayah", "Ibu", "Wali"].includes(ortu.relasi)) {
        ortuErrors.push("Relasi harus Ayah, Ibu, atau Wali");
      }

      if (ortuErrors.length > 0) {
        errors.push({
          index: index + 1,
          nama_lengkap: ortu.nama_lengkap || "Tidak ada nama",
          errors: ortuErrors,
        });
      }
    });

    return errors;
  };
  const validateOrtuDataWithUniqueness = async (ortuData) => {
    const formatErrors = validateOrtuData(ortuData);
    if (formatErrors.length > 0) {
      return { isValid: false, errors: formatErrors, uniquenessErrors: [] };
    }
    const nikList = ortuData
      .map((ortu) => ortu.nik.trim())
      .filter((nik) => nik);
    const uniquenessResults = await checkNikUniqueness(nikList);

    const uniquenessErrors = [];
    const duplicateNiks = [];

    uniquenessResults.forEach((result) => {
      if (result.exists) {
        const ortuIndex = ortuData.findIndex(
          (o) => o.nik.trim() === result.nik
        );
        if (ortuIndex !== -1) {
          uniquenessErrors.push({
            index: ortuIndex + 1,
            nama_lengkap: ortuData[ortuIndex].nama_lengkap || "Tidak ada nama",
            nik: result.nik,
            error: "NIK sudah ada di database",
          });
          duplicateNiks.push(result.nik);
        }
      }
    });

    const nikCounts = {};
    ortuData.forEach((ortu, index) => {
      const nik = ortu.nik.trim();
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
        indices.forEach((index) => {
          const ortuIndex = index - 1;
          uniquenessErrors.push({
            index,
            nama_lengkap: ortuData[ortuIndex].nama_lengkap || "Tidak ada nama",
            nik,
            error: "NIK duplikat dalam form",
          });
        });
      }
    });

    return {
      isValid: formatErrors.length === 0 && uniquenessErrors.length === 0,
      errors: formatErrors,
      uniquenessErrors,
      duplicateNiks,
    };
  };

  const handleBulkCreateOrtu = async (ortuData) => {
    const formattedData = formatOrtuData(ortuData);
    const validationResult = await validateOrtuDataWithUniqueness(
      formattedData
    );

    if (!validationResult.isValid) {
      console.error("❌ Validation failed:", validationResult);

      if (validationResult.errors.length > 0) {
        validationResult.errors.forEach((error) => {
          toast.error(`Form ${error.index}: ${error.errors.join(", ")}`);
        });
      }

      if (validationResult.uniquenessErrors.length > 0) {
        validationResult.uniquenessErrors.forEach((error) => {
          toast.error(
            `Form ${error.index} (${error.nama_lengkap}): ${error.error}`
          );
        });
      }

      return { success: false, error: "Validasi data gagal" };
    }

    try {
      const response = await OrtuService.bulkCreate(formattedData);
      if (response.status === "success") {
        toast.success(
          `Berhasil menambah ${response.data.inserted_count} orangtua`
        );
        loadOrtuData();
        loadStatistics();
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || "Gagal menambah orangtua");
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error("❌ Error bulk creating ortu:", error);

      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;
        if (errorMessage.includes("Validasi data gagal")) {
          toast.error("Validasi data gagal. Periksa kembali form yang diisi.");
        } else if (errorMessage.includes("Data duplikat ditemukan")) {
          toast.error(
            "Data duplikat ditemukan. Periksa kembali form yang diisi."
          );
        } else if (errorMessage.includes("Data sudah ada di database")) {
          toast.error(
            "Data sudah ada di database. Periksa kembali form yang diisi."
          );
        } else if (errorMessage.includes("Data orangtua harus berupa array")) {
          toast.error("Format data tidak valid.");
        } else if (errorMessage.includes("Maksimal 50 orangtua per request")) {
          toast.error("Maksimal 50 orangtua per request.");
        } else if (errorMessage.includes("Terjadi kesalahan server")) {
          toast.error("Terjadi kesalahan server.");
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error("Gagal menambah orangtua");
      }

      return {
        success: false,
        error: error.response?.data?.message || "Gagal menambah orangtua",
      };
    }
  };

  const handleUpdateOrtu = async (id, ortuData) => {
    const formattedData = {
      nama_lengkap: ortuData.nama_lengkap?.trim() || "",
      nik: ortuData.nik?.trim() || "",
      kontak: ortuData.kontak?.trim() || "",
      relasi: ortuData.relasi || "",
      anak: ortuData.anak || [],
    };
    try {
      const response = await OrtuService.update(id, formattedData);

      if (response.status === "success") {
        toast.success("Data orangtua berhasil diperbarui");
        loadOrtuData();
        loadStatistics();
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || "Gagal memperbarui data orangtua");
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error("❌ Error updating ortu:", error);

      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;
        if (errorMessage.includes("NIK sudah digunakan")) {
          toast.error("NIK sudah digunakan oleh orangtua lain");
        } else if (errorMessage.includes("Orangtua tidak ditemukan")) {
          toast.error("Orangtua tidak ditemukan");
        } else if (errorMessage.includes("Validasi data gagal")) {
          toast.error("Validasi data gagal. Periksa kembali form yang diisi.");
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error("Gagal memperbarui data orangtua");
      }

      return {
        success: false,
        error:
          error.response?.data?.message || "Gagal memperbarui data orangtua",
      };
    }
  };

  const handleDeleteOrtu = async (id) => {
    try {
      const response = await OrtuService.delete(id);

      if (response.status === "success") {
        toast.success("Data orangtua berhasil dihapus");
        loadOrtuData();
        loadStatistics();
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || "Gagal menghapus data orangtua");
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error("❌ Error deleting ortu:", error);

      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;

        if (errorMessage.includes("Orangtua tidak ditemukan")) {
          toast.error("Orangtua tidak ditemukan");
        } else if (errorMessage.includes("ID orangtua tidak valid")) {
          toast.error("ID orangtua tidak valid");
        } else if (errorMessage.includes("Terjadi kesalahan server")) {
          toast.error("Terjadi kesalahan server");
        } else if (errorMessage.includes("masih terhubung dengan data lain")) {
          toast.error(
            "Tidak dapat menghapus orangtua karena masih terhubung dengan data lain (siswa)"
          );
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error("Gagal menghapus data orangtua");
      }

      return {
        success: false,
        error: error.response?.data?.message || "Gagal menghapus data orangtua",
      };
    }
  };

  return {
    ortuData,
    pagination,
    statistics,
    isLoading,
    isLoadingStatistics,
    searchQuery,
    relasiFilter,
    sortBy,
    sortOrder,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    handleSearch,
    handleRelasiFilter,
    handleClearFilter,
    handleItemsPerPageChange,
    handleRefresh,
    handleSort,
    handleBulkCreateOrtu,
    loadOrtuData,
    handleUpdateOrtu,
    handleDeleteOrtu,
  };
}
