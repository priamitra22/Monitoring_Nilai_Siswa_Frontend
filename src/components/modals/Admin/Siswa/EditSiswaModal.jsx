import { useState, useEffect, useRef } from 'react'
import CustomModal from '../../../ui/CustomModal'
import Button from '../../../ui/Button'
import { FaUserEdit, FaSpinner, FaCheck, FaTimes } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { SiswaService } from '../../../../services/Admin/siswa/SiswaService'

export default function EditSiswaModal({ isOpen, onClose, onSave, siswaData }) {

  const [formData, setFormData] = useState({
    id: null,
    namaLengkap: '',
    nisn: '',
    nik: '',
    jenisKelamin: '',
    tempatLahir: '',
    tanggalLahir: '',
    originalNisn: '',
    originalNik: '',
  })

  const [isLoading, setIsLoading] = useState(false)

  const [validationState, setValidationState] = useState({})
  const [isValidating, setIsValidating] = useState({})

  const debounceTimers = useRef({})


  const formatDateForInput = (dateString) => {
    if (!dateString) return ''

    if (dateString.includes('T')) {
      const timeString = dateString.split('T')[1]
      if (timeString && timeString.includes('17:00:00')) {
        const date = new Date(dateString)
        date.setHours(date.getHours() + 7)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const result = `${year}-${month}-${day}`
        return result
      } else {
        const datePart = dateString.split('T')[0]
        return datePart
      }
    }
    if (dateString.includes('/')) {
      const [day, month, year] = dateString.split('/')
      const result = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      return result
    }

    if (dateString.includes('-') && dateString.length === 10) {
      return dateString
    }
    return ''
  }

  useEffect(() => {
    if (isOpen && siswaData) {
      setFormData({
        id: siswaData.id,
        namaLengkap: siswaData.nama_lengkap || '',
        nisn: siswaData.nisn || '',
        nik: siswaData.nik || '',
        jenisKelamin: siswaData.jenis_kelamin || '',
        tempatLahir: siswaData.tempat_lahir || '',
        tanggalLahir: formatDateForInput(siswaData.tanggal_lahir),
        originalNisn: siswaData.nisn || '',
        originalNik: siswaData.nik || '',
      })

      setValidationState({})
      setIsValidating({})

      Object.keys(debounceTimers.current).forEach((key) => {
        clearTimeout(debounceTimers.current[key])
      })
      debounceTimers.current = {}
    }
  }, [isOpen, siswaData])

  const checkUniquenessWithExclude = async (field, value) => {
    if (!value || !formData.id) return
    if ((field === 'nisn' && value.length !== 10) || (field === 'nik' && value.length !== 16)) {
      return
    }
    const isOriginal =
      (field === 'nisn' && value === formData.originalNisn) ||
      (field === 'nik' && value === formData.originalNik)

    if (isOriginal) {
      setValidationState((prev) => ({
        ...prev,
        [field]: {
          isUnique: true,
          message: `${field.toUpperCase()} tersedia (data asli)`,
        },
      }))
      return
    }

    setIsValidating((prev) => ({ ...prev, [field]: true }))

    try {
      const nisn = field === 'nisn' ? value : null
      const nik = field === 'nik' ? value : null
      const response = await SiswaService.checkWithExclude(nisn, nik, formData.id)

      if (response.status === 'success') {
        const exists = field === 'nisn' ? response.data.nisn_exists : response.data.nik_exists

        setValidationState((prev) => ({
          ...prev,
          [field]: {
            isUnique: !exists,
            message: exists
              ? `${field.toUpperCase()} sudah digunakan siswa lain`
              : `${field.toUpperCase()} tersedia`,
          },
        }))
      }
    } catch (error) {
      setValidationState((prev) => ({
        ...prev,
        [field]: {
          isUnique: null,
          message: 'Error validasi',
        },
      }))
    } finally {
      setIsValidating((prev) => ({ ...prev, [field]: false }))
    }
  }

  const debouncedCheck = (field, value) => {
    if (debounceTimers.current[field]) {
      clearTimeout(debounceTimers.current[field])
    }

    debounceTimers.current[field] = setTimeout(() => {
      checkUniquenessWithExclude(field, value)
    }, 500)
  }

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    setValidationState((prev) => {
      const newState = { ...prev }
      delete newState[field]
      return newState
    })

    if (field === 'nisn' || field === 'nik') {
      debouncedCheck(field, value)
    }
  }
  const validateForm = () => {
    const errors = []

    if (!formData.namaLengkap.trim()) {
      errors.push('Nama lengkap harus diisi')
    }

    if (!formData.nisn.trim()) {
      errors.push('NISN harus diisi')
    } else if (!/^\d{10}$/.test(formData.nisn)) {
      errors.push('NISN harus 10 digit angka')
    } else if (validationState.nisn && !validationState.nisn.isUnique) {
      errors.push('NISN sudah digunakan siswa lain')
    }

    if (!formData.nik.trim()) {
      errors.push('NIK harus diisi')
    } else if (!/^\d{16}$/.test(formData.nik)) {
      errors.push('NIK harus 16 digit angka')
    } else if (validationState.nik && !validationState.nik.isUnique) {
      errors.push('NIK sudah digunakan siswa lain')
    }

    if (!formData.jenisKelamin) {
      errors.push('Jenis kelamin harus dipilih')
    }

    if (!formData.tempatLahir.trim()) {
      errors.push('Tempat lahir harus diisi')
    }

    if (!formData.tanggalLahir) {
      errors.push('Tanggal lahir harus diisi')
    }

    return errors
  }
  const formatDateForAPI = (dateString) => {
    if (!dateString) return ''
    if (dateString.includes('/')) {
      return dateString
    }
    if (dateString.includes('-')) {
      const [year, month, day] = dateString.split('-')
      return `${day}/${month}/${year}`
    }

    return dateString
  }
  const handleSubmit = async () => {

    const errors = validateForm()

    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error))
      return
    }

    if (isValidating.nisn || isValidating.nik) {
      toast.error('Mohon tunggu validasi selesai')
      return
    }

    setIsLoading(true)
    try {
      const apiData = {
        nama_lengkap: formData.namaLengkap.trim(),
        nisn: formData.nisn,
        nik: formData.nik,
        jenis_kelamin: formData.jenisKelamin,
        tempat_lahir: formData.tempatLahir.trim(),
        tanggal_lahir: formatDateForAPI(formData.tanggalLahir),
      }
      const response = await SiswaService.update(formData.id, apiData)

      if (response.status === 'success') {
        toast.success('Data siswa berhasil diperbarui')
        onSave?.(response.data)
        onClose()
      } else {
        throw new Error(response.message || 'Gagal memperbarui data siswa')
      }
    } catch (error) {
      console.error('❌ Error updating siswa:', error)
      if (error.response) {
        const errorData = error.response.data

        if (errorData.data && errorData.data.errors && Array.isArray(errorData.data.errors)) {
          errorData.data.errors.forEach((err) => toast.error(err))
        } else if (errorData.message) {
          if (errorData.message.includes('NISN')) {
            toast.error('NISN sudah digunakan siswa lain')
          } else if (errorData.message.includes('NIK')) {
            toast.error('NIK sudah digunakan siswa lain')
          } else if (errorData.message.includes('tidak ditemukan')) {
            toast.error('Data siswa tidak ditemukan')
          } else {
            toast.error(errorData.message)
          }
        } else {
          toast.error('Gagal memperbarui data siswa')
        }
      } else if (error.message) {
        toast.error(error.message)
      } else {
        toast.error('Gagal memperbarui data siswa')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Siswa"
      description="Perbarui data siswa"
      icon={<FaUserEdit className="text-blue-600 text-xl" />}
      size="2xl"
      isLoading={isLoading}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap *</label>
            <input
              type="text"
              value={formData.namaLengkap}
              onChange={(e) => handleFormChange('namaLengkap', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nama lengkap"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">NISN *</label>
            <div className="relative">
              <input
                type="text"
                value={formData.nisn}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '')
                  handleFormChange('nisn', value)
                }}
                className={`w-full px-3 py-2 pr-10 text-sm border rounded focus:outline-none focus:ring-1 ${validationState.nisn
                    ? validationState.nisn.isUnique
                      ? 'border-green-500 focus:ring-green-500 focus:border-green-500'
                      : 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                placeholder="10 digit angka"
                maxLength={10}
              />
              {isValidating.nisn && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <FaSpinner className="animate-spin text-gray-400" />
                </div>
              )}
              {!isValidating.nisn && validationState.nisn && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {validationState.nisn.isUnique ? (
                    <FaCheck className="text-green-500" />
                  ) : (
                    <FaTimes className="text-red-500" />
                  )}
                </div>
              )}
            </div>
            {validationState.nisn && (
              <p
                className={`text-xs mt-1 ${validationState.nisn.isUnique ? 'text-green-600' : 'text-red-600'
                  }`}
              >
                {validationState.nisn.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">NIK *</label>
            <div className="relative">
              <input
                type="text"
                value={formData.nik}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '')
                  handleFormChange('nik', value)
                }}
                className={`w-full px-3 py-2 pr-10 text-sm border rounded focus:outline-none focus:ring-1 ${validationState.nik
                    ? validationState.nik.isUnique
                      ? 'border-green-500 focus:ring-green-500 focus:border-green-500'
                      : 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                placeholder="16 digit angka"
                maxLength={16}
              />
              {isValidating.nik && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <FaSpinner className="animate-spin text-gray-400" />
                </div>
              )}
              {!isValidating.nik && validationState.nik && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {validationState.nik.isUnique ? (
                    <FaCheck className="text-green-500" />
                  ) : (
                    <FaTimes className="text-red-500" />
                  )}
                </div>
              )}
            </div>
            {validationState.nik && (
              <p
                className={`text-xs mt-1 ${validationState.nik.isUnique ? 'text-green-600' : 'text-red-600'
                  }`}
              >
                {validationState.nik.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Kelamin *</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="jenisKelamin"
                  value="Laki-laki"
                  checked={formData.jenisKelamin === 'Laki-laki'}
                  onChange={(e) => handleFormChange('jenisKelamin', e.target.value)}
                  className="mr-2"
                />
                Laki-laki
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="jenisKelamin"
                  value="Perempuan"
                  checked={formData.jenisKelamin === 'Perempuan'}
                  onChange={(e) => handleFormChange('jenisKelamin', e.target.value)}
                  className="mr-2"
                />
                Perempuan
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tempat Lahir *</label>
            <input
              type="text"
              value={formData.tempatLahir}
              onChange={(e) => handleFormChange('tempatLahir', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Kota/Kabupaten"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Lahir *</label>
            <input
              type="date"
              value={formData.tanggalLahir}
              onChange={(e) => handleFormChange('tanggalLahir', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 mt-6 border-t border-gray-200">
        <Button variant="secondary" onClick={onClose} disabled={isLoading} className="flex-1">
          Batal
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isLoading}
          icon={isLoading ? <FaSpinner className="animate-spin" /> : <FaUserEdit />}
          className="flex-1"
        >
          {isLoading ? 'Memproses...' : 'Simpan Perubahan'}
        </Button>
      </div>
    </CustomModal>
  )
}
