import { X, Download, FileText, Calendar, User, CheckCircle, Clock } from 'lucide-react'
import Modal from '../../../ui/Modal'
import Button from '../../../ui/Button'
export default function RiwayatVersiModal({ isOpen, onClose, siswa, versions, onDownload }) {
  if (!siswa) return null

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return '-'

    const sizes = ['B', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 B'

    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-4xl">
      <div className="pb-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Riwayat Versi Laporan</h2>
        <p className="text-sm text-gray-600 mt-1">
          <span className="font-medium">Siswa:</span> {siswa.nama} ({siswa.nisn})
        </p>
      </div>
      <div className="py-4">
        {versions && versions.length > 0 ? (
          <>
            <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
              <FileText className="w-4 h-4" />
              <span>Total {versions.length} versi laporan</span>
            </div>
            <div className="space-y-3">
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className={`p-4 border rounded-lg transition-all ${version.is_latest
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${version.is_latest
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-600 text-white'
                            }`}
                        >
                          <FileText className="w-4 h-4" />
                          Versi {version.version}
                        </span>
                        {version.is_latest && (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Terbaru
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4 text-emerald-500" />
                          <span>Tahun Ajaran:</span>
                          <span className="font-medium text-gray-900">{version.tahun_ajaran}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <span>Semester:</span>
                          <span className="font-medium text-gray-900">{version.semester}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <span>Kelas:</span>
                          <span className="font-medium text-gray-900">{version.nama_kelas}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <span>Ukuran File:</span>
                          <span className="font-medium text-gray-900">
                            {formatFileSize(version.file_size)}
                          </span>
                        </div>

                        <div className="col-span-2 flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4 text-orange-500" />
                          <span>Upload:</span>
                          <span className="font-medium text-gray-900">
                            {formatDate(version.upload_date)}
                          </span>
                        </div>

                        <div className="col-span-2 flex items-center gap-2 text-gray-600">
                          <User className="w-4 h-4 text-purple-500" />
                          <span>Oleh:</span>
                          <span className="font-medium text-gray-900">
                            {version.uploaded_by_name}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <Button
                        onClick={() => onDownload(version.id, siswa.nama)}
                        variant={version.is_latest ? 'success' : 'info'}
                        size="sm"
                        className="inline-flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak Ada Riwayat</h3>
            <p className="text-gray-500">Tidak ada riwayat versi untuk siswa ini</p>
          </div>
        )}
      </div>
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <Button onClick={onClose} variant="secondary">
          Tutup
        </Button>
      </div>
    </Modal>
  )
}
