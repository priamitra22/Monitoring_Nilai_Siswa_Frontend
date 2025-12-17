import { useState, useEffect, useRef } from 'react'
import CustomModal from '../../../ui/CustomModal'
import Button from '../../../ui/Button'
import { FaUpload, FaSpinner, FaSearch, FaUser } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { useMasterData } from '../../../../hooks/useMasterData'

export default function UploadLaporanResmiModal({ isOpen, onClose, onUpload }) {
  const [formData, setFormData] = useState({
    tahun: '',
    semester: '',
    tahun_ajaran_id: '',
    kelas_id: '',
    siswa_id: '',
  })

  const [selectedFile, setSelectedFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [siswaOptions, setSiswaOptions] = useState([])
  const [fileError, setFileError] = useState('')
  const [siswaSearchQuery, setSiswaSearchQuery] = useState('')
  const [showSiswaDropdown, setShowSiswaDropdown] = useState(false)
  const [selectedSiswa, setSelectedSiswa] = useState(null)
  const [filteredSiswaOptions, setFilteredSiswaOptions] = useState([])
  const dropdownRef = useRef(null)
  const { kelasOptions, getKelasByTahunAjaran, getSiswaByKelas, getActiveTahunAjaran } =
    useMasterData()
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSiswaDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen) {
      const activeTahunAjaran = getActiveTahunAjaran()

      if (activeTahunAjaran) {
        setFormData({
          tahun: activeTahunAjaran.tahun,
          semester: activeTahunAjaran.semester,
          tahun_ajaran_id: activeTahunAjaran.id,
          kelas_id: '',
          siswa_id: '',
        })
      } else {
        toast.error('Tidak ada tahun ajaran aktif')
        setFormData({
          tahun: '',
          semester: '',
          tahun_ajaran_id: '',
          kelas_id: '',
          siswa_id: '',
        })
      }

      setSelectedFile(null)
      setSiswaOptions([])
      setFileError('')
      setSiswaSearchQuery('')
      setShowSiswaDropdown(false)
      setSelectedSiswa(null)
      setFilteredSiswaOptions([])
    }
  }, [isOpen, getActiveTahunAjaran])

  useEffect(() => {
    if (formData.tahun_ajaran_id && isOpen) {
      getKelasByTahunAjaran(formData.tahun_ajaran_id)
    }
  }, [formData.tahun_ajaran_id, getKelasByTahunAjaran, isOpen])
  useEffect(() => {
    if (formData.kelas_id) {
      loadSiswa(formData.kelas_id)
    } else {
      setSiswaOptions([])
      setFilteredSiswaOptions([])
      setSiswaSearchQuery('')
      setSelectedSiswa(null)
      if (formData.siswa_id) {
        setFormData((prev) => ({ ...prev, siswa_id: '' }))
      }
    }
  }, [formData.kelas_id])

  const loadSiswa = async (kelasId) => {
    try {
      const siswaList = await getSiswaByKelas(kelasId)
      const dataArray = Array.isArray(siswaList) ? siswaList : siswaList?.data || []
      const options = dataArray.map((s) => ({
        value: s.id,
        label: `${s.nama_lengkap} (${s.nisn})`,
        nama: s.nama_lengkap,
        nisn: s.nisn,
      }))
      setSiswaOptions(options)
      setFilteredSiswaOptions(options)
    } catch (error) {
      console.error('Error loading siswa:', error)
      toast.error('Gagal memuat data siswa')
      setSiswaOptions([])
      setFilteredSiswaOptions([])
    }
  }
  useEffect(() => {
    if (!siswaSearchQuery) {
      setFilteredSiswaOptions(siswaOptions)
    } else {
      const filtered = siswaOptions.filter((siswa) =>
        siswa.label.toLowerCase().includes(siswaSearchQuery.toLowerCase())
      )
      setFilteredSiswaOptions(filtered)
    }
  }, [siswaSearchQuery, siswaOptions])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSiswaSelect = (siswa) => {
    setSelectedSiswa(siswa)
    setFormData((prev) => ({ ...prev, siswa_id: siswa.value }))
    setSiswaSearchQuery(siswa.label)
    setShowSiswaDropdown(false)
  }

  const handleSiswaSearchChange = (e) => {
    const value = e.target.value
    setSiswaSearchQuery(value)
    setShowSiswaDropdown(true)
    if (!value) {
      setSelectedSiswa(null)
      setFormData((prev) => ({ ...prev, siswa_id: '' }))
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setFileError('')

    if (!file) {
      setSelectedFile(null)
      return
    }
    if (file.type !== 'application/pdf') {
      setFileError('File harus berformat PDF')
      setSelectedFile(null)
      return
    }
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setFileError('Ukuran file maksimal 5MB')
      setSelectedFile(null)
      return
    }
    setSelectedFile(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.tahun_ajaran_id) {
      toast.error('Tidak ada tahun ajaran aktif')
      return
    }

    if (!formData.kelas_id) {
      toast.error('Kelas harus dipilih')
      return
    }

    if (!formData.siswa_id) {
      toast.error('Siswa harus dipilih')
      return
    }

    if (!selectedFile) {
      toast.error('File laporan harus diupload')
      console.error('No file selected!')
      return
    }

    setIsLoading(true)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('tahun_ajaran_id', formData.tahun_ajaran_id)
      uploadFormData.append('kelas_id', formData.kelas_id)
      uploadFormData.append('siswa_id', formData.siswa_id)
      uploadFormData.append('semester', formData.semester)
      uploadFormData.append('file', selectedFile)

      const result = await onUpload(uploadFormData)

      if (result.success) {
        onClose()
      }
    } catch (error) {
      console.error('Error uploading laporan:', error)
      toast.error('Gagal mengupload laporan')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Laporan Nilai Resmi"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tahun Ajaran <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.tahun || ''}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
            placeholder="Tahun ajaran akan terisi otomatis"
          />
          <p className="mt-1 text-xs text-gray-500">Mengikuti tahun ajaran aktif saat ini</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Semester <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.semester || ''}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
            placeholder="Semester akan terisi otomatis"
          />
          <p className="mt-1 text-xs text-gray-500">Mengikuti semester aktif saat ini</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kelas <span className="text-red-500">*</span>
          </label>
          <select
            name="kelas_id"
            value={formData.kelas_id}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Pilih Kelas</option>
            {kelasOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Siswa <span className="text-red-500">*</span>
          </label>
          <div className="relative" ref={dropdownRef}>
            <div className="relative">
              <input
                type="text"
                value={siswaSearchQuery}
                onChange={handleSiswaSearchChange}
                onFocus={() => setShowSiswaDropdown(true)}
                placeholder="Cari siswa..."
                disabled={!formData.kelas_id}
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            {showSiswaDropdown && formData.kelas_id && filteredSiswaOptions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredSiswaOptions.map((siswa) => (
                  <div
                    key={siswa.value}
                    onClick={() => handleSiswaSelect(siswa)}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center gap-2"
                  >
                    <FaUser className="text-gray-400 text-sm" />
                    <div>
                      <div className="font-medium text-gray-900">{siswa.nama}</div>
                      <div className="text-sm text-gray-500">NISN: {siswa.nisn}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {showSiswaDropdown &&
              formData.kelas_id &&
              siswaSearchQuery &&
              filteredSiswaOptions.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
                  Tidak ada siswa yang sesuai
                </div>
              )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            File Laporan (PDF) <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md hover:border-blue-400 transition-colors">
            <div className="space-y-1 text-center">
              <FaUpload className="mx-auto h-12 w-12 text-slate-400" />
              <div className="flex text-sm text-slate-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                >
                  <span>Upload file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                  />
                </label>
                <p className="pl-1">atau drag and drop</p>
              </div>
              <p className="text-xs text-slate-500">PDF maksimal 5MB</p>
              {selectedFile && (
                <p className="text-sm text-green-600 font-medium">
                  ✓ {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
              {fileError && <p className="text-sm text-red-600 font-medium">✗ {fileError}</p>}
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-sm text-blue-800">
            <strong>Info:</strong> Jika sudah ada laporan sebelumnya untuk siswa ini, file akan
            disimpan sebagai versi baru.
          </p>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon={isLoading ? <FaSpinner className="animate-spin" /> : <FaUpload />}
            disabled={isLoading}
          >
            {isLoading ? 'Mengupload...' : 'Upload Laporan'}
          </Button>
        </div>
      </form>
    </CustomModal>
  )
}
