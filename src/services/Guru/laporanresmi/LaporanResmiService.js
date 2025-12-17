import axios from 'axios'
import { API_URL } from '../../api'

/**
 * Service untuk API Guru - Laporan Resmi (Read-Only)
 * Base URL: /api/guru/laporan-resmi
 */
export const LaporanResmiService = {
  /**
   * 1. Get daftar kelas yang diampu guru di tahun ajaran tertentu
   * GET /api/guru/laporan-resmi/kelas?tahun_ajaran_id=X
   */
  getKelas: async (tahunAjaranId) => {
    const res = await axios.get(`${API_URL}/guru/laporan-resmi/kelas`, {
      params: { tahun_ajaran_id: tahunAjaranId },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    })
    return res.data
  },

  /**
   * 2. Get list laporan resmi dengan pagination
   * GET /api/guru/laporan-resmi?kelas_id=X&page=1&limit=10&search=
   */
  getLaporanList: async (kelasId, page = 1, limit = 10, search = '') => {
    const res = await axios.get(`${API_URL}/guru/laporan-resmi`, {
      params: {
        kelas_id: kelasId,
        page,
        limit,
        search,
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    })
    return res.data
  },

  /**
   * 3. Download laporan PDF
   * GET /api/guru/laporan-resmi/download/:id
   */
  downloadLaporan: async (id) => {
    const res = await axios.get(`${API_URL}/guru/laporan-resmi/download/${id}`, {
      responseType: 'blob', // Important for file download
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    })

    // Extract filename from Content-Disposition header
    const contentDisposition = res.headers['content-disposition']
    let filename = `Laporan_${id}.pdf`

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i)
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1]
      }
    }

    // Create blob and trigger download
    const blob = new Blob([res.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    return { success: true, filename }
  },

  /**
   * 4. Get version history untuk siswa tertentu
   * GET /api/guru/laporan-resmi/riwayat/:siswa_id
   */
  getVersionHistory: async (siswaId) => {
    const res = await axios.get(`${API_URL}/guru/laporan-resmi/riwayat/${siswaId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    })
    return res.data
  },
}
