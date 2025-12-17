import { useState, useEffect, useCallback, useRef } from 'react'
import { LaporanResmiService } from '../../../../services/Admin/laporanResmi/LaporanResmiService'
import toast from 'react-hot-toast'

export function useLaporanResmi() {
  const isLoadingRef = useRef(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [kelasFilter, setKelasFilter] = useState('')
  const [sortBy, setSortBy] = useState('upload_date')
  const [sortOrder, setSortOrder] = useState('desc')
  const [laporanData, setLaporanData] = useState([])
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 0,
    total_data: 0,
    per_page: 10,
    has_next: false,
    has_prev: false,
  })
  const [statistics, setStatistics] = useState({
    total_laporan: 0,
    total_siswa_ada_laporan: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingStatistics, setIsLoadingStatistics] = useState(false)
  const loadStatistics = useCallback(async () => {
    setIsLoadingStatistics(true)
    try {
      const response = await LaporanResmiService.getAll({
        page: 1,
        limit: 1,
      })

      if (response.status === 'success') {
        setStatistics(response.data.statistics)
      }
    } catch (error) {
      console.error('Error loading statistics:', error)
    } finally {
      setIsLoadingStatistics(false)
    }
  }, [])
  const loadLaporanData = useCallback(async () => {
    if (!kelasFilter) {
      setLaporanData([])
      setPagination({
        current_page: 1,
        total_pages: 0,
        total_data: 0,
        per_page: itemsPerPage,
        has_next: false,
        has_prev: false,
      })
      setIsLoading(false)
      return
    }
    if (isLoadingRef.current) {
      return
    }

    isLoadingRef.current = true
    setIsLoading(true)

    const params = {
      page: currentPage,
      limit: itemsPerPage,
      search: searchQuery,
      kelas_id: kelasFilter,
      sort_by: sortBy,
      sort_order: sortOrder,
    }

    try {
      const response = await LaporanResmiService.getAll(params)

      if (response.status === 'success') {
        setLaporanData(response.data.laporan)
        setPagination(response.data.pagination)
        if (response.data.statistics) {
          setStatistics(response.data.statistics)
        }
      } else {
        toast.error(response.message || 'Gagal mengambil data laporan')
        setLaporanData([])
        setPagination({
          current_page: 1,
          total_pages: 0,
          total_data: 0,
          per_page: 10,
          has_next: false,
          has_prev: false,
        })
      }
    } catch (error) {
      console.error('Error loading laporan data:', error)
      toast.error('Gagal mengambil data laporan')
      setLaporanData([])
    } finally {
      setIsLoading(false)
      isLoadingRef.current = false
    }
  }, [currentPage, itemsPerPage, searchQuery, kelasFilter, sortBy, sortOrder])
  useEffect(() => {
    loadLaporanData()
  }, [loadLaporanData])
  useEffect(() => {
    loadStatistics()
  }, [loadStatistics])
  const handleSearch = useCallback((value) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }, [])

  const handleKelasFilter = useCallback((value) => {
    setKelasFilter(value)
    setCurrentPage(1)
  }, [])

  const handleResetFilter = useCallback(() => {
    setSearchQuery('')
    setKelasFilter('')
    setCurrentPage(1)
  }, [])

  const handleItemsPerPageChange = useCallback((value) => {
    setItemsPerPage(value)
    setCurrentPage(1)
  }, [])

  const handleSort = useCallback(
    (column) => {
      if (sortBy === column) {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
      } else {
        setSortBy(column)
        setSortOrder('asc')
      }
      setCurrentPage(1)
    },
    [sortBy, sortOrder]
  )
  const handleRefresh = useCallback(() => {
    loadLaporanData()
    loadStatistics()
  }, [loadLaporanData, loadStatistics])
  const handleUpload = useCallback(
    async (formData) => {
      try {
        const response = await LaporanResmiService.upload(formData)

        if (response.status === 'success') {
          toast.success(response.message)
          handleRefresh()
          return { success: true, data: response.data }
        } else {
          toast.error(response.message || 'Gagal mengupload laporan')
          return { success: false, error: response.message }
        }
      } catch (error) {
        console.error('Error uploading laporan:', error)
        const errorMsg = error.response?.data?.message || 'Gagal mengupload laporan'
        toast.error(errorMsg)
        return { success: false, error: errorMsg }
      }
    },
    [handleRefresh]
  )
  const handleUpdate = useCallback(
    async (id, formData) => {
      try {
        const response = await LaporanResmiService.update(id, formData)

        if (response.status === 'success') {
          toast.success(response.message)
          handleRefresh()
          return { success: true, data: response.data }
        } else {
          toast.error(response.message || 'Gagal mengupdate laporan')
          return { success: false, error: response.message }
        }
      } catch (error) {
        console.error('Error updating laporan:', error)
        const errorMsg = error.response?.data?.message || 'Gagal mengupdate laporan'
        toast.error(errorMsg)
        return { success: false, error: errorMsg }
      }
    },
    [handleRefresh]
  )
  const handleDelete = useCallback(
    async (id) => {
      try {
        const response = await LaporanResmiService.delete(id)

        if (response.status === 'success') {
          toast.success(response.message)
          handleRefresh()
          return { success: true }
        } else {
          toast.error(response.message || 'Gagal menghapus laporan')
          return { success: false, error: response.message }
        }
      } catch (error) {
        console.error('Error deleting laporan:', error)
        const errorMsg = error.response?.data?.message || 'Gagal menghapus laporan'
        toast.error(errorMsg)
        return { success: false, error: errorMsg }
      }
    },
    [handleRefresh]
  )
  const handleDownload = useCallback(async (laporan) => {
    try {
      const filename = `${laporan.nama_siswa.replace(/\s+/g, '_')}_v${laporan.version}.pdf`
      const result = await LaporanResmiService.downloadFile(laporan.id, filename)

      if (result.status === 'success') {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Error downloading laporan:', error)
      toast.error('Gagal mengunduh laporan')
    }
  }, [])
  const getVersionHistory = useCallback(async (siswaId) => {
    try {
      const response = await LaporanResmiService.getVersionHistory(siswaId)

      if (response.status === 'success') {
        return { success: true, data: response.data }
      } else {
        toast.error(response.message || 'Gagal mengambil riwayat versi')
        return { success: false, error: response.message }
      }
    } catch (error) {
      console.error('Error getting version history:', error)
      const errorMsg = error.response?.data?.message || 'Gagal mengambil riwayat versi'
      toast.error(errorMsg)
      return { success: false, error: errorMsg }
    }
  }, [])

  return {
    laporanData,
    pagination,
    statistics,
    isLoading,
    isLoadingStatistics,
    searchQuery,
    kelasFilter,
    sortBy,
    sortOrder,
    setCurrentPage,
    itemsPerPage,
    handleSearch,
    handleKelasFilter,
    handleResetFilter,
    handleItemsPerPageChange,
    handleSort,
    handleRefresh,
    handleUpload,
    handleUpdate,
    handleDelete,
    handleDownload,
    getVersionHistory,
  }
}
