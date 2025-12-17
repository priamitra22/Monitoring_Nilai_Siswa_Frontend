import axios from 'axios'
import { API_URL } from '../../api'

export const LaporanResmiService = {
  /**
   * GET /api/admin/laporan-resmi
   * Get all laporan resmi with pagination, search, filters, and sorting
   */
  getAll: async (params = {}) => {
    const {
      page = 1,
      limit = 10,
      search = '',
      tahun_ajaran_id = '',
      kelas_id = '',
      semester = '',
      sort_by = 'upload_date',
      sort_order = 'desc',
    } = params

    const queryParams = { page, limit, sort_by, sort_order }
    if (search) queryParams.search = search
    if (tahun_ajaran_id) queryParams.tahun_ajaran_id = tahun_ajaran_id
    if (kelas_id) queryParams.kelas_id = kelas_id
    if (semester) queryParams.semester = semester

    const res = await axios.get(`${API_URL}/admin/laporan-resmi`, {
      params: queryParams,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    })
    return res.data
  },

  /**
   * GET /api/admin/laporan-resmi/:id
   * Get laporan detail by ID
   */
  getById: async (id) => {
    const res = await axios.get(`${API_URL}/admin/laporan-resmi/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    })
    return res.data
  },

  /**
   * GET /api/admin/laporan-resmi/riwayat/:siswa_id
   * Get version history
   */
  getVersionHistory: async (siswaId) => {
    const res = await axios.get(`${API_URL}/admin/laporan-resmi/riwayat/${siswaId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    })
    return res.data
  },

  /**
   * POST /api/admin/laporan-resmi/upload
   * Upload new laporan resmi
   */
  upload: async (formData) => {
    const res = await axios.post(`${API_URL}/admin/laporan-resmi/upload`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'multipart/form-data',
      },
    })
    return res.data
  },

  /**
   * PUT /api/admin/laporan-resmi/:id
   * Update laporan (create new version)
   */
  update: async (id, formData) => {
    const res = await axios.put(`${API_URL}/admin/laporan-resmi/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'multipart/form-data',
      },
    })
    return res.data
  },

  /**
   * DELETE /api/admin/laporan-resmi/:id
   * Delete laporan
   */
  delete: async (id) => {
    const res = await axios.delete(`${API_URL}/admin/laporan-resmi/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    })
    return res.data
  },

  /**
   * GET /api/admin/laporan-resmi/download/:id
   * Download laporan PDF
   */
  download: async (id) => {
    const res = await axios.get(`${API_URL}/admin/laporan-resmi/download/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
      responseType: 'blob', // Important for file download
    })
    return res
  },

  /**
   * Helper: Download file with proper filename
   */
  downloadFile: async (id, filename) => {
    try {
      const response = await LaporanResmiService.download(id)

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename || 'laporan.pdf')
      document.body.appendChild(link)
      link.click()

      // Cleanup
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)

      return { status: 'success', message: 'File berhasil diunduh' }
    } catch (error) {
      console.error('Error downloading file:', error)
      return {
        status: 'error',
        message: error.response?.data?.message || 'Gagal mengunduh file',
      }
    }
  },
}
