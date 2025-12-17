import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { LaporanResmiService } from '../../../../services/Guru/laporanResmi/LaporanResmiService'
import axios from 'axios'
import { API_URL } from '../../../../services/api'

/**
 * Custom Hook untuk Laporan Resmi (Read-Only)
 * Features:
 * - Fetch kelas options berdasarkan tahun ajaran
 * - Fetch list laporan dengan pagination & search
 * - Download laporan PDF
 * - View version history
 */
export const useLaporanResmi = () => {
  // ========================================
  // STATE MANAGEMENT
  // ========================================

  // Master Data
  const [tahunAjaranOptions, setTahunAjaranOptions] = useState([])
  const [kelasOptions, setKelasOptions] = useState([])

  // Filters
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState('')
  const [selectedKelas, setSelectedKelas] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Table Data
  const [laporanData, setLaporanData] = useState([])
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total_data: 0,
    total_pages: 1,
  })

  // Loading & Modal States
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingKelas, setIsLoadingKelas] = useState(false)
  const [isRiwayatModalOpen, setIsRiwayatModalOpen] = useState(false)
  const [selectedSiswa, setSelectedSiswa] = useState(null)
  const [versionHistory, setVersionHistory] = useState([])

  // ========================================
  // FETCH KELAS OPTIONS (Cascading berdasarkan tahun ajaran aktif)
  // ========================================

  const fetchKelas = useCallback(async () => {
    if (!selectedTahunAjaran) {
      setKelasOptions([])
      setSelectedKelas('')
      return
    }

    setIsLoadingKelas(true)
    try {
      const response = await LaporanResmiService.getKelas(selectedTahunAjaran)

      if (response.status === 'success') {
        // Transform data to { value, label } format
        const transformedData = (response.data || []).map((kelas) => ({
          value: kelas.id,
          label: kelas.nama_kelas,
        }))
        setKelasOptions(transformedData)

        // Auto-select first kelas if only one option
        if (response.data && response.data.length === 1) {
          setSelectedKelas(response.data[0].id)
        } else {
          setSelectedKelas('')
        }
      }
    } catch (error) {
      console.error('Error fetching kelas:', error)
      toast.error('Gagal memuat daftar kelas')
      setKelasOptions([])
    } finally {
      setIsLoadingKelas(false)
    }
  }, [selectedTahunAjaran])

  useEffect(() => {
    fetchKelas()
  }, [fetchKelas])

  // ========================================
  // FETCH LAPORAN LIST
  // ========================================

  const fetchLaporanList = useCallback(
    async (page = 1) => {
      if (!selectedKelas) {
        setLaporanData([])
        return
      }

      setIsLoading(true)
      try {
        const response = await LaporanResmiService.getLaporanList(
          selectedKelas,
          page,
          pagination.per_page,
          searchQuery
        )

        if (response.status === 'success') {
          setLaporanData(response.data.data || [])
          setPagination(
            response.data.pagination || {
              current_page: page,
              per_page: 10,
              total_data: 0,
              total_pages: 1,
            }
          )
        }
      } catch (error) {
        console.error('Error fetching laporan:', error)
        toast.error('Gagal memuat data laporan')
        setLaporanData([])
      } finally {
        setIsLoading(false)
      }
    },
    [selectedKelas, searchQuery, pagination.per_page]
  )

  // Auto-fetch when dependencies change
  useEffect(() => {
    if (selectedKelas) {
      fetchLaporanList(1) // Reset to page 1 when filter changes
    }
  }, [selectedKelas, searchQuery])

  // ========================================
  // DOWNLOAD LAPORAN PDF
  // ========================================

  const handleDownload = async (laporanId, namaSiswa) => {
    const loadingToast = toast.loading(`Mengunduh laporan ${namaSiswa}...`)

    try {
      const result = await LaporanResmiService.downloadLaporan(laporanId)

      if (result.success) {
        toast.success(`Laporan ${namaSiswa} berhasil diunduh`, {
          id: loadingToast,
        })
      }
    } catch (error) {
      console.error('Error downloading laporan:', error)

      if (error.response?.status === 404) {
        toast.error('File laporan tidak ditemukan', { id: loadingToast })
      } else if (error.response?.status === 403) {
        toast.error('Anda tidak memiliki akses untuk mengunduh laporan ini', {
          id: loadingToast,
        })
      } else {
        toast.error('Gagal mengunduh laporan', { id: loadingToast })
      }
    }
  }

  // ========================================
  // VERSION HISTORY MODAL
  // ========================================

  const handleOpenRiwayat = async (siswaId, namaSiswa, nisn) => {
    setSelectedSiswa({ id: siswaId, nama: namaSiswa, nisn: nisn })
    setIsRiwayatModalOpen(true)
    setVersionHistory([])

    try {
      const response = await LaporanResmiService.getVersionHistory(siswaId)

      if (response.status === 'success') {
        setVersionHistory(response.data.versions || [])
      }
    } catch (error) {
      console.error('Error fetching version history:', error)

      if (error.response?.status === 403) {
        toast.error('Anda tidak memiliki akses untuk melihat riwayat siswa ini')
      } else {
        toast.error('Gagal memuat riwayat versi')
      }

      setIsRiwayatModalOpen(false)
    }
  }

  const handleCloseRiwayat = () => {
    setIsRiwayatModalOpen(false)
    setSelectedSiswa(null)
    setVersionHistory([])
  }

  // ========================================
  // PAGINATION HANDLERS
  // ========================================

  const handlePageChange = (newPage) => {
    fetchLaporanList(newPage)
  }

  const handlePerPageChange = (newPerPage) => {
    setPagination((prev) => ({ ...prev, per_page: newPerPage }))
    fetchLaporanList(1) // Reset to page 1
  }

  // ========================================
  // FILTER HANDLERS
  // ========================================

  const handleTahunAjaranChange = (tahunAjaranId) => {
    setSelectedTahunAjaran(tahunAjaranId)
    setSelectedKelas('')
    setSearchQuery('')
    setLaporanData([])
  }

  const handleKelasChange = (kelasId) => {
    setSelectedKelas(kelasId)
    setSearchQuery('')
  }

  const handleSearchChange = (query) => {
    setSearchQuery(query)
  }

  // ========================================
  // INITIAL LOAD
  // ========================================

  // Fetch Tahun Ajaran Options
  useEffect(() => {
    const fetchTahunAjaran = async () => {
      try {
        const response = await axios.get(`${API_URL}/admin/tahun-ajaran/aktif`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        })

        if (response.data.status === 'success' && response.data.data) {
          const tahunAktif = response.data.data
          // Transform single active tahun ajaran
          const transformedData = [
            {
              value: tahunAktif.id,
              label: `${tahunAktif.tahun} - ${tahunAktif.semester}`,
            },
          ]
          console.log('Tahun Ajaran Aktif:', transformedData)
          setTahunAjaranOptions(transformedData)

          // Auto-select tahun ajaran aktif
          console.log('Auto-selecting tahun aktif:', tahunAktif.id)
          setSelectedTahunAjaran(tahunAktif.id)
        }
      } catch (error) {
        console.error('Error fetching tahun ajaran:', error)
        toast.error('Gagal memuat tahun ajaran aktif')
      }
    }

    fetchTahunAjaran()
  }, [])

  // ========================================
  // RETURN HOOK API
  // ========================================

  return {
    // Master Data
    tahunAjaranOptions,
    kelasOptions,

    // Filters
    selectedTahunAjaran,
    selectedKelas,
    searchQuery,

    // Table Data
    laporanData,
    pagination,

    // Loading States
    isLoading,
    isLoadingKelas,

    // Modal States
    isRiwayatModalOpen,
    selectedSiswa,
    versionHistory,

    // Handlers
    handleTahunAjaranChange,
    handleKelasChange,
    handleSearchChange,
    handleDownload,
    handleOpenRiwayat,
    handleCloseRiwayat,
    handlePageChange,
    handlePerPageChange,

    // Refresh
    refreshData: () => fetchLaporanList(pagination.current_page),
  }
}
