import Button from '../../../../components/ui/Button'
import { FaHistory, FaDownload, FaTrash } from 'react-icons/fa'

export const laporanResmiColumns = [
  {
    key: 'no',
    label: 'No',
    sortable: false,
    className: 'w-12 sm:w-16 text-center',
  },
  {
    key: 'nisn',
    label: 'NISN',
    sortable: true,
    className: 'w-24 sm:w-32 text-center',
  },
  {
    key: 'nama_siswa',
    label: 'Nama Siswa',
    sortable: true,
    className: 'text-left',
  },
  {
    key: 'nama_kelas',
    label: 'Kelas',
    sortable: true,
    className: 'w-20 sm:w-24 text-center',
  },
  {
    key: 'tahun_ajaran',
    label: 'Tahun Ajaran',
    sortable: true,
    className: 'w-24 sm:w-32 text-center',
  },
  {
    key: 'semester',
    label: 'Semester',
    sortable: true,
    className: 'w-20 sm:w-24 text-center',
  },
  {
    key: 'version',
    label: 'Versi',
    sortable: true,
    className: 'w-16 sm:w-20 text-center',
  },
  {
    key: 'upload_date',
    label: 'Tanggal Upload',
    sortable: true,
    className: 'w-28 sm:w-36 text-center',
  },
  {
    key: 'actions',
    label: 'Aksi',
    sortable: false,
    className: 'w-40 sm:w-48 text-center',
  },
]

export const createTableData = (laporanData, pagination, handlers) => {
  const { onDelete, onRiwayat, onDownload } = handlers

  return laporanData.map((laporan, index) => ({
    id: laporan.id,
    no: (pagination.current_page - 1) * pagination.per_page + index + 1,
    nisn: laporan.nisn,
    nama_siswa: laporan.nama_siswa,
    nama_kelas: laporan.nama_kelas,
    tahun_ajaran: laporan.tahun_ajaran,
    semester: laporan.semester,
    version: (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
        v{laporan.version}
      </span>
    ),
    upload_date: laporan.upload_date
      ? new Date(laporan.upload_date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
      : '-',
    actions: (
      <div className="flex gap-1 justify-center">
        <Button
          variant="info"
          size="sm"
          icon={<FaHistory />}
          ariaLabel="Riwayat"
          className="text-xs px-2 py-1 min-w-fit"
          onClick={() => onRiwayat(laporan)}
        >
          Riwayat
        </Button>
        <Button
          variant="success"
          size="sm"
          icon={<FaDownload />}
          ariaLabel="Download"
          className="text-xs px-2 py-1 min-w-fit"
          onClick={() => onDownload(laporan)}
        >
          Download
        </Button>
        <Button
          variant="danger"
          size="sm"
          icon={<FaTrash />}
          ariaLabel="Hapus"
          className="text-xs px-2 py-1 min-w-fit"
          onClick={() => onDelete(laporan)}
        >
          Hapus
        </Button>
      </div>
    ),
  }))
}
