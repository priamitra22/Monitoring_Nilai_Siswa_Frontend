import { useState, useEffect, useCallback } from 'react'
import { TahunAjaranService } from '../services/Admin/tahunajaran/TahunAjaranService'
import { KelasService } from '../services/Admin/kelas/KelasService'
import { SiswaService } from '../services/Admin/siswa/SiswaService'

/**
 * Custom hook untuk fetch master data (Tahun Ajaran, Kelas, Siswa)
 * Digunakan untuk populate dropdown options di form
 */
export const useMasterData = () => {
  const [tahunAjaranOptions, setTahunAjaranOptions] = useState([])
  const [kelasOptions, setKelasOptions] = useState([])
  const [allTahunAjaranData, setAllTahunAjaranData] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch Tahun Ajaran options (unique tahun only)
  useEffect(() => {
    const fetchTahunAjaran = async () => {
      try {
        setIsLoading(true)
        const response = await TahunAjaranService.getAll()

        console.log('Tahun Ajaran Response:', response)

        // Check if response has data property
        const dataArray = response.data || response

        // Simpan semua data (tidak filter aktif, biar bisa pilih semua)
        setAllTahunAjaranData(dataArray)

        // Get unique tahun values (tidak filter aktif)
        const uniqueTahun = [...new Set(dataArray.map((ta) => ta.tahun || ta.tahun_ajaran))]

        const options = uniqueTahun
          .sort((a, b) => b.localeCompare(a)) // Sort descending (terbaru dulu)
          .map((tahun) => ({
            value: tahun,
            label: `T.A ${tahun}`,
          }))

        console.log('Tahun Ajaran Options:', options)
        setTahunAjaranOptions(options)
      } catch (error) {
        console.error('Error fetching tahun ajaran:', error)
        setTahunAjaranOptions([])
        setAllTahunAjaranData([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchTahunAjaran()
  }, [])

  // Function to fetch kelas by tahun ajaran
  const getKelasByTahunAjaran = useCallback(async (tahunAjaranId) => {
    try {
      const response = await KelasService.getDaftarKelas({
        tahun_ajaran_id: tahunAjaranId,
        page: 1,
        limit: 100,
      })

      console.log('Kelas Response:', response)

      // Check if response has data property
      const dataArray = response.data || response

      const options = (dataArray.kelas || dataArray || []).map((kelas) => ({
        value: kelas.id,
        label: kelas.nama_kelas || kelas.nama || 'N/A',
      }))

      console.log('Kelas Options:', options)
      setKelasOptions(options)
      return options
    } catch (error) {
      console.error('Error fetching kelas:', error)
      setKelasOptions([])
      return []
    }
  }, [])

  // Function to fetch all kelas (without tahun ajaran filter)
  const getAllKelas = useCallback(async () => {
    try {
      // Get active tahun ajaran first
      const aktiveTahunAjaran = allTahunAjaranData.find((ta) => ta.status === 'aktif')

      if (!aktiveTahunAjaran) {
        console.log('No active tahun ajaran found')
        setKelasOptions([])
        return []
      }

      const response = await KelasService.getDaftarKelas({
        tahun_ajaran_id: aktiveTahunAjaran.id, // Filter by active tahun ajaran
        page: 1,
        limit: 100,
      })

      console.log('All Kelas Response (Active TA):', response)

      // Check if response has data property
      const dataArray = response.data || response

      const options = (dataArray.kelas || dataArray || []).map((kelas) => ({
        value: kelas.id,
        label: kelas.nama_kelas || kelas.nama || 'N/A',
      }))

      console.log('All Kelas Options (Active TA):', options)
      setKelasOptions(options)
      return options
    } catch (error) {
      console.error('Error fetching all kelas:', error)
      setKelasOptions([])
      return []
    }
  }, [allTahunAjaranData])

  // Function to get semester options based on selected tahun
  const getSemesterByTahun = useCallback(
    (tahunValue) => {
      const filtered = allTahunAjaranData.filter(
        (ta) => (ta.tahun || ta.tahun_ajaran) === tahunValue
      )

      return filtered.map((ta) => ({
        value: ta.id,
        label: ta.semester,
        semester: ta.semester,
      }))
    },
    [allTahunAjaranData]
  )

  // Function to get siswa by kelas
  const getSiswaByKelas = async (kelasId) => {
    try {
      const response = await KelasService.getDaftarSiswaKelas(kelasId)
      return response.data || []
    } catch (error) {
      console.error('Error fetching siswa by kelas:', error)
      return []
    }
  }

  // Function to get active tahun ajaran (status === 'aktif')
  const getActiveTahunAjaran = useCallback(() => {
    const aktiveTahunAjaran = allTahunAjaranData.find((ta) => ta.status === 'aktif')
    if (aktiveTahunAjaran) {
      return {
        id: aktiveTahunAjaran.id,
        tahun: aktiveTahunAjaran.tahun || aktiveTahunAjaran.tahun_ajaran,
        semester: aktiveTahunAjaran.semester,
      }
    }
    return null
  }, [allTahunAjaranData])

  return {
    tahunAjaranOptions,
    kelasOptions,
    getKelasByTahunAjaran,
    getAllKelas,
    getSemesterByTahun,
    getSiswaByKelas,
    getActiveTahunAjaran,
    isLoading,
  }
}

export default useMasterData
