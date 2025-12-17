import { useState } from 'react'
import CustomModal from '../../../ui/CustomModal'
import Button from '../../../ui/Button'
import { FaTrash, FaSpinner, FaExclamationTriangle } from 'react-icons/fa'

export default function DeleteLaporanResmiModal({ isOpen, onClose, onDelete, laporanData }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const result = await onDelete(laporanData.id)

      if (result.success) {
        onClose()
      }
    } catch (error) {
      console.error('Error deleting laporan:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!laporanData) return null

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} title="Konfirmasi Hapus Laporan" maxWidth="lg">
      <div className="space-y-4">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 p-3">
            <FaExclamationTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-800 mb-2">
            Apakah Anda yakin ingin menghapus laporan ini?
          </p>
          <p className="text-sm text-slate-600">Tindakan ini tidak dapat dibatalkan.</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            Detail Laporan yang Akan Dihapus
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Siswa:</span>
              <span className="font-medium text-slate-800">{laporanData.nama_siswa}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">NISN:</span>
              <span className="font-medium text-slate-800">{laporanData.nisn}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Kelas:</span>
              <span className="font-medium text-slate-800">{laporanData.nama_kelas}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Tahun Ajaran:</span>
              <span className="font-medium text-slate-800">{laporanData.tahun_ajaran}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Semester:</span>
              <span className="font-medium text-slate-800">{laporanData.semester}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Versi:</span>
              <span className="font-medium text-slate-800">v{laporanData.version}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">File:</span>
              <span className="font-medium text-slate-800">{laporanData.original_filename}</span>
            </div>
          </div>
        </div>
        {laporanData.is_latest && laporanData.version > 1 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-800">
              Ini adalah versi terbaru. Jika dihapus, versi sebelumnya (v
              {laporanData.version - 1}) akan menjadi versi terbaru.
            </p>
          </div>
        )}

        {laporanData.version === 1 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">
              <strong>Peringatan:</strong> Ini adalah satu-satunya versi laporan untuk siswa ini.
              Jika dihapus, tidak akan ada laporan tersisa.
            </p>
          </div>
        )}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button
            variant="danger"
            icon={isLoading ? <FaSpinner className="animate-spin" /> : <FaTrash />}
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? 'Menghapus...' : 'Ya, Hapus Laporan'}
          </Button>
        </div>
      </div>
    </CustomModal>
  )
}
