import { useState, useEffect } from 'react'
import CustomModal from '../../../ui/CustomModal'
import Button from '../../../ui/Button'
import { FaDownload, FaSpinner } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { LaporanResmiService } from '../../../../services/Admin/laporanResmi/LaporanResmiService'

export default function RiwayatVersiModal({ isOpen, onClose, laporanData, getVersionHistory }) {
  const [versions, setVersions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [downloadingId, setDownloadingId] = useState(null)

  useEffect(() => {
    if (isOpen && laporanData) {
      loadVersionHistory()
    }
  }, [isOpen, laporanData])

  const loadVersionHistory = async () => {
    setIsLoading(true)
    try {
      const result = await getVersionHistory(laporanData.siswa_id)

      if (result.success) {
        setVersions(result.data.versions || [])
      }
    } catch (error) {
      console.error('Error loading version history:', error)
      toast.error('Gagal memuat riwayat versi')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async (version) => {
    setDownloadingId(version.id)
    try {
      const filename = `${laporanData.nama_siswa.replace(/\s+/g, '_')}_v${version.version}.pdf`
      const result = await LaporanResmiService.downloadFile(version.id, filename)

      if (result.status === 'success') {
        toast.success('File berhasil diunduh')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Error downloading:', error)
      toast.error('Gagal mengunduh file')
    } finally {
      setDownloadingId(null)
    }
  }

  if (!laporanData) return null

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} title="Riwayat Versi Laporan" maxWidth="4xl">
      <div className="space-y-4">
        <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Informasi Laporan</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
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
          </div>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <FaSpinner className="animate-spin text-3xl text-blue-600" />
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-8 text-slate-500">Tidak ada riwayat versi</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Versi
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Kelas
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    T.A / Semester
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Tanggal Upload
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Diupload Oleh
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Ukuran File
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {versions.map((version) => (
                  <tr key={version.id} className={version.is_latest ? 'bg-blue-50' : ''}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${version.is_latest
                              ? 'bg-green-100 text-green-800'
                              : 'bg-slate-100 text-slate-800'
                            }`}
                        >
                          v{version.version}
                        </span>
                        {version.is_latest ? (
                          <span className="text-xs text-green-600 font-medium">● Terbaru</span>
                        ) : (
                          <span className="text-xs text-slate-500 font-medium">Arsip</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">
                      {version.nama_kelas}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">
                      <div className="text-xs">
                        <div className="font-medium">{version.tahun_ajaran}</div>
                        <div className="text-slate-500">{version.semester}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">
                      {new Date(version.upload_date).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">
                      {version.uploaded_by_name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">
                      {(version.file_size / 1024 / 1024).toFixed(2)} MB
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <Button
                        variant="success"
                        size="sm"
                        icon={
                          downloadingId === version.id ? (
                            <FaSpinner className="animate-spin" />
                          ) : (
                            <FaDownload />
                          )
                        }
                        onClick={() => handleDownload(version)}
                        disabled={downloadingId === version.id}
                        className="text-xs"
                      >
                        {downloadingId === version.id ? 'Downloading...' : 'Download'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-sm text-blue-800">
            💡 Semua versi tetap tersimpan di sistem. Versi terbaru ditandai dengan badge hijau.
          </p>
        </div>
        <div className="flex justify-end pt-4">
          <Button variant="secondary" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </CustomModal>
  )
}
