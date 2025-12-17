import { useState, useEffect, useCallback } from 'react'
import Modal from '../../../ui/Modal'
import Button from '../../../ui/Button'
import { FaTimes, FaSave, FaSpinner } from 'react-icons/fa'
import { KelasService } from '../../../../services/Admin/kelas/KelasService'
import toast from 'react-hot-toast'

export default function EditKelasModal({ isOpen, onClose, onSave, kelasId }) {

  const [formData, setFormData] = useState({
    nama_kelas: '',
    wali_kelas: '',
  })

  const [tahunAjaranId, setTahunAjaranId] = useState(null)

  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const [waliKelasOptions, setWaliKelasOptions] = useState([])
  const [isLoadingWaliKelas, setIsLoadingWaliKelas] = useState(false)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)

  const loadWaliKelasOptions = useCallback(async () => {
    setIsLoadingWaliKelas(true)
    try {
      const response = await KelasService.getDropdownWaliKelas(tahunAjaranId, kelasId)

      if (response.status === 'success') {
        setWaliKelasOptions(response.data)
      }
    } catch (error) {
      console.error('Error loading wali kelas options:', error)
      setWaliKelasOptions([])
    } finally {
      setIsLoadingWaliKelas(false)
    }
  }, [tahunAjaranId, kelasId])
  const loadDetailKelas = useCallback(async () => {
    if (!kelasId) return

    setIsLoadingDetail(true)
    try {
      const response = await KelasService.getDetailKelas(kelasId)

      if (response.status === 'success') {
        setFormData({
          nama_kelas: response.data.nama_kelas || '',
          wali_kelas: response.data.wali_kelas_id || '',
        })
        setTahunAjaranId(response.data.tahun_ajaran_id)
      }
    } catch (error) {
      console.error('Error loading detail kelas:', error)
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Gagal memuat detail kelas')
      }
    } finally {
      setIsLoadingDetail(false)
    }
  }, [kelasId])

  useEffect(() => {
    if (isOpen && kelasId) {
      setFormData({
        nama_kelas: '',
        wali_kelas: '',
      })
      setErrors({})
      setTahunAjaranId(null)
      loadDetailKelas()
    }
  }, [isOpen, kelasId, loadDetailKelas])

  useEffect(() => {
    if (isOpen && tahunAjaranId) {
      loadWaliKelasOptions()
    }
  }, [isOpen, tahunAjaranId, loadWaliKelasOptions])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.nama_kelas.trim()) {
      newErrors.nama_kelas = 'Nama kelas harus diisi'
    }
    if (!formData.wali_kelas) {
      newErrors.wali_kelas = 'Wali kelas harus dipilih'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Mohon perbaiki data yang tidak valid')
      return
    }

    if (!tahunAjaranId || !kelasId) {
      toast.error('Data kelas tidak valid')
      return
    }

    setIsLoading(true)

    try {
      const apiData = {
        nama_kelas: formData.nama_kelas,
        wali_kelas_id: parseInt(formData.wali_kelas),
        tahun_ajaran_id: tahunAjaranId,
      }

      const response = await KelasService.updateKelas(kelasId, apiData)

      if (response.status === 'success') {
        toast.success(response.message || 'Kelas berhasil diperbarui')

        onSave(response.data)

        onClose()
      } else {
        toast.error(response.message || 'Terjadi kesalahan saat menyimpan data')
      }
    } catch (error) {
      console.error('Error saving kelas:', error)

      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message

        if (errorMessage.includes('sudah ada')) {
          toast.error(errorMessage)
        } else if (errorMessage.includes('sudah menjadi wali kelas')) {
          toast.error(errorMessage)
        } else if (errorMessage.includes('tidak boleh kosong')) {
          toast.error(errorMessage)
        } else if (errorMessage.includes('harus berupa angka')) {
          toast.error(errorMessage)
        } else if (errorMessage.includes('wajib diisi')) {
          toast.error(errorMessage)
        } else if (errorMessage.includes('Semua field harus diisi')) {
          toast.error(errorMessage)
        } else if (errorMessage.includes('tidak ditemukan')) {
          toast.error(errorMessage)
        } else {
          toast.error(errorMessage)
        }
      } else {
        toast.error('Gagal memperbarui kelas')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }


  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Kelas" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Nama Kelas <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.nama_kelas}
            onChange={(e) => handleInputChange('nama_kelas', e.target.value)}
            placeholder={isLoadingDetail ? 'Memuat...' : 'Contoh: 6A, 7B, 8C'}
            className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm ${errors.nama_kelas ? 'border-red-300' : 'border-slate-300'
              }`}
            disabled={isLoading || isLoadingDetail}
          />
          {errors.nama_kelas && <p className="mt-1 text-sm text-red-600">{errors.nama_kelas}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Wali Kelas <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.wali_kelas}
            onChange={(e) => handleInputChange('wali_kelas', e.target.value)}
            className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white ${errors.wali_kelas ? 'border-red-300' : 'border-slate-300'
              }`}
            disabled={isLoading || isLoadingWaliKelas || isLoadingDetail}
          >
            <option value="">{isLoadingWaliKelas ? 'Memuat...' : 'Pilih Wali Kelas'}</option>
            {waliKelasOptions.length > 0
              ? waliKelasOptions.map((guru) => (
                <option key={guru.id} value={guru.id}>
                  {guru.nama_lengkap}
                </option>
              ))
              : !isLoadingWaliKelas && (
                <option value="" disabled>
                  Tidak ada guru tersedia
                </option>
              )}
          </select>
          {errors.wali_kelas && <p className="mt-1 text-sm text-red-600">{errors.wali_kelas}</p>}
        </div>

        <div className="flex gap-3 pt-4 border-t border-slate-200">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1"
          >
            <FaTimes className="w-4 h-4 mr-2" />
            Batal
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading} className="flex-1">
            {isLoading ? (
              <>
                <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <FaSave className="w-4 h-4 mr-2" />
                Simpan
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
