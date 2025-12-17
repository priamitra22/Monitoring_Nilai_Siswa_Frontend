import { useState, useEffect } from 'react'
import CustomModal from '../../../ui/CustomModal'
import Button from '../../../ui/Button'
import { FaEdit, FaSpinner } from 'react-icons/fa'
import toast from 'react-hot-toast'

export default function UpdateLaporanResmiModal({ isOpen, onClose, onUpdate, laporanData }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [keterangan, setKeterangan] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [fileError, setFileError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null)
      setKeterangan('')
      setFileError('')
    }
  }, [isOpen])

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

    if (!selectedFile) {
      toast.error('File laporan harus diupload')
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      if (keterangan) {
        formData.append('keterangan', keterangan)
      }

      const result = await onUpdate(laporanData.id, formData)

      if (result.success) {
        onClose()
      }
    } catch (error) {
      console.error('Error updating laporan:', error)
      toast.error('Gagal mengupdate laporan')
    } finally {
      setIsLoading(false)
    }
  }

  if (!laporanData) return null

  const nextVersion = laporanData.version + 1

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Laporan Nilai Resmi"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Informasi Laporan Saat Ini</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-slate-600">Siswa</p>
              <p className="font-medium text-slate-800">{laporanData.nama_siswa}</p>
            </div>
            <div>
              <p className="text-slate-600">NISN</p>
              <p className="font-medium text-slate-800">{laporanData.nisn}</p>
            </div>
            <div>
              <p className="text-slate-600">Kelas</p>
              <p className="font-medium text-slate-800">{laporanData.nama_kelas}</p>
            </div>
            <div>
              <p className="text-slate-600">Tahun Ajaran</p>
              <p className="font-medium text-slate-800">{laporanData.tahun_ajaran}</p>
            </div>
            <div>
              <p className="text-slate-600">Semester</p>
              <p className="font-medium text-slate-800">{laporanData.semester}</p>
            </div>
            <div>
              <p className="text-slate-600">Versi Saat Ini</p>
              <p className="font-medium text-slate-800">v{laporanData.version}</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-sm text-blue-800">
            📌 File baru akan disimpan sebagai <strong>versi {nextVersion}</strong>. File versi lama
            akan tetap tersimpan.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Upload File Baru (PDF) <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md hover:border-blue-400 transition-colors">
            <div className="space-y-1 text-center">
              <FaEdit className="mx-auto h-12 w-12 text-slate-400" />
              <div className="flex text-sm text-slate-600">
                <label
                  htmlFor="file-upload-update"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                >
                  <span>Upload file</span>
                  <input
                    id="file-upload-update"
                    name="file-upload-update"
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
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Keterangan (Opsional)
          </label>
          <textarea
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Catatan perubahan..."
          />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon={isLoading ? <FaSpinner className="animate-spin" /> : <FaEdit />}
            disabled={isLoading}
          >
            {isLoading ? 'Mengupdate...' : 'Update Laporan'}
          </Button>
        </div>
      </form>
    </CustomModal>
  )
}
