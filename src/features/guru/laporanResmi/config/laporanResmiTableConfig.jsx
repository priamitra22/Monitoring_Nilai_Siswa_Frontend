import { Download, History } from 'lucide-react'
import Button from '../../../../components/ui/Button'

/**
 * Table Configuration for Laporan Resmi
 */

export const formatFileSize = (bytes) => {
  if (!bytes) return '-'

  const sizes = ['B', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 B'

  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
}

export const formatDate = (dateString) => {
  if (!dateString) return '-'

  const date = new Date(dateString)
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }

  return date.toLocaleDateString('id-ID', options)
}

export const columns = [
  {
    key: 'no',
    label: 'No',
    align: 'center',
    width: 'w-16',
  },
  {
    key: 'nisn',
    label: 'NISN',
    align: 'center',
    width: 'w-32',
  },
  {
    key: 'nama_siswa',
    label: 'Nama Siswa',
    align: 'left',
    width: 'w-48',
  },
  {
    key: 'kelas',
    label: 'Kelas',
    align: 'center',
    width: 'w-24',
  },
  {
    key: 'tahun_ajaran',
    label: 'Tahun Ajaran',
    align: 'center',
    width: 'w-32',
  },
  {
    key: 'semester',
    label: 'Semester',
    align: 'center',
    width: 'w-28',
  },
  {
    key: 'upload_date',
    label: 'Tanggal Upload',
    align: 'center',
    width: 'w-40',
  },
  {
    key: 'actions',
    label: 'Aksi',
    align: 'center',
    width: 'w-40',
  },
]

/**
 * Action Buttons Configuration
 */
export const ActionButtons = ({ row, onDownload, onViewHistory }) => {
  return (
    <div className="flex gap-1 justify-center">
      <Button
        variant="info"
        size="sm"
        icon={<History className="w-4 h-4" />}
        ariaLabel="Riwayat"
        className="text-xs px-2 py-1 min-w-fit"
        onClick={() => onViewHistory(row.siswa_id, row.nama_siswa, row.nisn)}
      >
        Riwayat
      </Button>
      <Button
        variant="success"
        size="sm"
        icon={<Download className="w-4 h-4" />}
        ariaLabel="Download"
        className="text-xs px-2 py-1 min-w-fit"
        onClick={() => onDownload(row.id, row.nama_siswa)}
      >
        Download
      </Button>
    </div>
  )
}

/**
 * Empty State Component
 */
export const EmptyState = ({ hasFilter }) => {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">
        {hasFilter ? 'Tidak Ada Data Ditemukan' : 'Belum Ada Laporan'}
      </h3>
      <p className="text-gray-500">
        {hasFilter
          ? 'Coba ubah filter atau kata kunci pencarian'
          : 'Pilih kelas untuk melihat laporan resmi siswa'}
      </p>
    </div>
  )
}
