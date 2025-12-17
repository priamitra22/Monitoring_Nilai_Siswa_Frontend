import ContentWrapper from '../../components/ui/ContentWrapper'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import { FaFileDownload, FaUserGraduate } from 'react-icons/fa'
import { FaRegFilePdf } from 'react-icons/fa6'
import {
  useLaporanPerkembangan,
  FilterPerkembangan,
  PreviewLaporanPerkembangan,
  CatatanWaliKelas,
  NotWaliKelasCard,
} from '../../features/guru/laporan'

export default function LaporanGuru() {
  const {
    // Filter states
    selectedKelas,
    selectedSiswa,
    setSelectedSiswa,

    // Options
    kelasOptions,
    siswaOptions,

    // Data
    laporanData,
    periodeInfo,
    catatanWaliKelas,
    setCatatanWaliKelas,

    // Loading states
    isLoading,
    isLoadingKelas,
    isLoadingSiswa,

    // Error states
    isNotWaliKelas,
    errorMessage,

    // Actions
    canGenerateReport,
    handleDownloadPDF,
  } = useLaporanPerkembangan()

  return (
    <>
      <ContentWrapper>
        {/* Page Header */}
        <PageHeader
          icon={<FaFileDownload />}
          title="Laporan Nilai Siswa"
          description="Laporan lengkap perkembangan siswa"
        />
      </ContentWrapper>

      {/* Loading State - Initial Load */}
      {isLoadingKelas && (
        <div className="mt-6 sm:mt-8">
          <ContentWrapper>
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat data kelas...</p>
            </div>
          </ContentWrapper>
        </div>
      )}

      {/* Error State - Not Wali Kelas */}
      {!isLoadingKelas && isNotWaliKelas && (
        <div className="mt-6 sm:mt-8">
          <NotWaliKelasCard message={errorMessage} />
        </div>
      )}

      {/* Filter Section */}
      {!isLoadingKelas && !isNotWaliKelas && (
        <div className="mt-6 sm:mt-8">
          <FilterPerkembangan
            selectedKelas={selectedKelas}
            selectedSiswa={selectedSiswa}
            onSiswaChange={(e) => setSelectedSiswa(e.target.value)}
            kelasOptions={kelasOptions}
            siswaOptions={siswaOptions}
            periodeInfo={periodeInfo}
            isLoadingSiswa={isLoadingSiswa}
          />
        </div>
      )}

      {/* Loading State - Data Siswa */}
      {!isNotWaliKelas && isLoading && (
        <div className="mt-6 sm:mt-8">
          <ContentWrapper>
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Memuat data laporan...</p>
            </div>
          </ContentWrapper>
        </div>
      )}

      {/* Preview Laporan */}
      {!isNotWaliKelas && canGenerateReport && !isLoading && (
        <div className="space-y-6 sm:space-y-8 mt-6 sm:mt-8">
          <PreviewLaporanPerkembangan laporanData={laporanData} periodeInfo={periodeInfo} />

          {/* Catatan Wali Kelas */}
          <CatatanWaliKelas
            value={catatanWaliKelas}
            onChange={setCatatanWaliKelas}
            siswaName={laporanData?.siswa?.nama || ''}
          />

          {/* Action Button */}
          <ContentWrapper>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-start sm:items-center">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  Download Laporan
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Pastikan catatan wali kelas sudah diisi sebelum download PDF
                </p>
              </div>
              <Button
                variant="danger"
                icon={<FaRegFilePdf />}
                onClick={handleDownloadPDF}
                disabled={!catatanWaliKelas.trim()}
              >
                Download PDF
              </Button>
            </div>
          </ContentWrapper>
        </div>
      )}

      {/* Empty State */}
      {!isNotWaliKelas && !selectedSiswa && !isLoading && (
        <div className="mt-6 sm:mt-8">
          <ContentWrapper>
            <div className="text-center py-16">
              <FaUserGraduate className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pilih Siswa</h3>
              <p className="text-gray-600">
                Silakan pilih siswa terlebih dahulu untuk melihat laporan nilai
              </p>
            </div>
          </ContentWrapper>
        </div>
      )}
    </>
  )
}
