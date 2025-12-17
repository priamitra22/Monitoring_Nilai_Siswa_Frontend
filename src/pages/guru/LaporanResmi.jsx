import { FileText } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import ContentWrapper from '../../components/ui/ContentWrapper'
import Pagination from '../../components/ui/Pagination'
import FilterSection from '../../features/guru/laporanResmi/components/FilterSection'
import RiwayatVersiModal from '../../components/modals/Guru/LaporanResmi/RiwayatVersiModal'
import { useLaporanResmi } from '../../features/guru/laporanResmi/hooks/useLaporanResmi'
import {
  columns,
  ActionButtons,
  EmptyState,
  formatDate,
  formatFileSize,
} from '../../features/guru/laporanResmi/config/laporanResmiTableConfig'

export default function LaporanResmi() {
  const {
    // Master Data
    tahunAjaranOptions,
    kelasOptions,

    // Filters
    selectedTahunAjaran,
    selectedKelas,
    searchQuery,

    // Table Data
    laporanData,
    pagination,

    // Loading States
    isLoading,
    isLoadingKelas,

    // Modal States
    isRiwayatModalOpen,
    selectedSiswa,
    versionHistory,

    // Handlers
    handleTahunAjaranChange,
    handleKelasChange,
    handleSearchChange,
    handleDownload,
    handleOpenRiwayat,
    handleCloseRiwayat,
    handlePageChange,
    handlePerPageChange,
  } = useLaporanResmi()

  return (
    <>
      <ContentWrapper>
        {/* Page Header */}
        <PageHeader
          icon={<FileText />}
          title="Laporan Resmi Siswa"
          description="Lihat dan unduh laporan resmi nilai siswa"
        />
      </ContentWrapper>

      {/* Filter Section */}
      <div className="mt-6 sm:mt-8">
        <FilterSection
          selectedTahunAjaran={selectedTahunAjaran}
          onTahunAjaranChange={handleTahunAjaranChange}
          tahunAjaranOptions={tahunAjaranOptions}
          selectedKelas={selectedKelas}
          onKelasChange={handleKelasChange}
          kelasOptions={kelasOptions}
          isLoadingKelas={isLoadingKelas}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
        />
      </div>

      {/* Table Section */}
      <div className="mt-6 sm:mt-8">
        <ContentWrapper>
          {/* Empty State - Belum pilih kelas */}
          {!selectedKelas && !isLoading && (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Pilih Kelas Terlebih Dahulu
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Silakan pilih <span className="font-semibold">Kelas</span> untuk menampilkan data
                laporan nilai resmi siswa
              </p>
            </div>
          )}

          {/* Data Table - Jika sudah pilih kelas */}
          {selectedKelas && (
            <div className="space-y-4 sm:space-y-6">
              {/* Loading State */}
              {isLoading && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Memuat data laporan...</p>
                </div>
              )}

              {/* Table Content */}
              {!isLoading && laporanData.length > 0 && (
                <>
                  {/* Table Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 bg-emerald-100 rounded-lg flex-shrink-0">
                        <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
                          Daftar Laporan Nilai Resmi
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs sm:text-sm text-gray-600 truncate">
                            Menampilkan {laporanData.length} dari {pagination.total_data} data
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Data Table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {columns.map((column) => (
                            <th
                              key={column.key}
                              scope="col"
                              className={`px-6 py-3 text-${column.align} text-xs font-medium text-gray-500 uppercase tracking-wider ${column.width}`}
                            >
                              {column.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {laporanData.map((row, index) => (
                          <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                            {/* No */}
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                              {(pagination.current_page - 1) * pagination.per_page + index + 1}
                            </td>

                            {/* NISN */}
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-mono text-gray-900">
                              {row.nisn}
                            </td>

                            {/* Nama Siswa */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {row.nama_siswa}
                            </td>

                            {/* Kelas */}
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                              {row.nama_kelas}
                            </td>

                            {/* Tahun Ajaran */}
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                              {row.tahun_ajaran}
                            </td>

                            {/* Semester */}
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                              {row.semester}
                            </td>

                            {/* Upload Date */}
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                              {formatDate(row.upload_date)}
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <ActionButtons
                                row={row}
                                onDownload={handleDownload}
                                onViewHistory={handleOpenRiwayat}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-end">
                    <div className="flex flex-col items-center gap-4 sm:flex-row">
                      {/* Per halaman */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                          Per halaman:
                        </span>
                        <select
                          value={pagination.per_page}
                          onChange={(e) => handlePerPageChange(Number(e.target.value))}
                          className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white min-w-0"
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                        </select>
                      </div>

                      {/* Pagination */}
                      {pagination.total_pages > 1 && (
                        <div className="flex justify-center sm:justify-end">
                          <Pagination
                            currentPage={pagination.current_page}
                            totalPages={pagination.total_pages}
                            onPageChange={handlePageChange}
                            className="scale-90 sm:scale-100"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Empty State */}
              {!isLoading && laporanData.length === 0 && (
                <EmptyState hasFilter={!!selectedKelas || !!searchQuery} />
              )}
            </div>
          )}
        </ContentWrapper>
      </div>

      {/* Riwayat Versi Modal */}
      <RiwayatVersiModal
        isOpen={isRiwayatModalOpen}
        onClose={handleCloseRiwayat}
        siswa={selectedSiswa}
        versions={versionHistory}
        onDownload={handleDownload}
      />
    </>
  )
}
