import CustomModal from '../../../ui/CustomModal'
import Button from '../../../ui/Button'

export default function DetailLaporanResmiModal({ isOpen, onClose, laporanData }) {
  if (!laporanData) return null

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Laporan Nilai Resmi"
      maxWidth="2xl"
    >
      <div className="space-y-4">
        <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Informasi Siswa</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-slate-600">Nama Lengkap</p>
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
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Informasi Laporan</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-slate-600">Tahun Ajaran</p>
              <p className="font-medium text-slate-800">{laporanData.tahun_ajaran}</p>
            </div>
            <div>
              <p className="text-slate-600">Semester</p>
              <p className="font-medium text-slate-800">{laporanData.semester}</p>
            </div>
            <div>
              <p className="text-slate-600">Versi</p>
              <p className="font-medium text-slate-800">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                  v{laporanData.version}
                </span>
                {laporanData.is_latest && (
                  <span className="ml-2 text-xs text-green-600">● Versi Terbaru</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-slate-600">Tanggal Upload</p>
              <p className="font-medium text-slate-800">
                {new Date(laporanData.upload_date).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Informasi File</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-slate-600">Nama File Asli</p>
              <p className="font-medium text-slate-800">{laporanData.original_filename}</p>
            </div>
            <div>
              <p className="text-slate-600">Ukuran File</p>
              <p className="font-medium text-slate-800">
                {(laporanData.file_size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <div>
              <p className="text-slate-600">Diupload Oleh</p>
              <p className="font-medium text-slate-800">{laporanData.uploaded_by_name}</p>
            </div>
          </div>
        </div>
        {laporanData.keterangan && (
          <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Keterangan</h3>
            <p className="text-sm text-slate-700">{laporanData.keterangan}</p>
          </div>
        )}
        <div className="flex justify-end pt-4">
          <Button variant="secondary" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </CustomModal>
  )
}
