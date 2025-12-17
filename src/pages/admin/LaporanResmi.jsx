import { useState } from 'react'
import ContentWrapper from '../../components/ui/ContentWrapper'
import PageHeader from '../../components/ui/PageHeader'
import DataTable from '../../components/ui/DataTable'
import Pagination from '../../components/ui/Pagination'
import SearchBar from '../../components/ui/SearchBar'
import { FaFileAlt } from 'react-icons/fa'
import {
  useLaporanResmi,
  laporanResmiColumns,
  createTableData,
} from '../../features/admin/laporanResmi'
import FilterSection from '../../features/admin/laporanResmi/components/FilterSection'
import UploadLaporanResmiModal from '../../components/modals/Admin/LaporanResmi/UploadLaporanResmiModal'
import UpdateLaporanResmiModal from '../../components/modals/Admin/LaporanResmi/UpdateLaporanResmiModal'
import RiwayatVersiModal from '../../components/modals/Admin/LaporanResmi/RiwayatVersiModal'
import DetailLaporanResmiModal from '../../components/modals/Admin/LaporanResmi/DetailLaporanResmiModal'
import DeleteLaporanResmiModal from '../../components/modals/Admin/LaporanResmi/DeleteLaporanResmiModal'

export default function LaporanResmi() {
  // State untuk modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [isRiwayatModalOpen, setIsRiwayatModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedLaporan, setSelectedLaporan] = useState(null)

  // Menggunakan custom hook untuk semua business logic
  const {
    // Data state
    laporanData,
    pagination,
    statistics,
    isLoading,
    isLoadingStatistics,

    // Search dan filter state
    searchQuery,
    kelasFilter,

    // Sorting state
    sortBy,
    sortOrder,

    // Pagination state
    setCurrentPage,
    itemsPerPage,

    // Handlers
    handleSearch,
    handleKelasFilter,
    handleResetFilter,
    handleItemsPerPageChange,
    handleSort,
    handleRefresh,
    handleUpload,
    handleUpdate,
    handleDelete,
    handleDownload,
    getVersionHistory,
  } = useLaporanResmi()

  // Event handlers
  const handleDeleteClick = (laporan) => {
    setSelectedLaporan(laporan)
    setIsDeleteModalOpen(true)
  }

  const handleRiwayatClick = (laporan) => {
    setSelectedLaporan(laporan)
    setIsRiwayatModalOpen(true)
  }

  const handleDownloadClick = (laporan) => {
    handleDownload(laporan)
  }

  // Pagination handler
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

  // Create table data dengan handlers
  const tableData = createTableData(laporanData, pagination, {
    onDelete: handleDeleteClick,
    onRiwayat: handleRiwayatClick,
    onDownload: handleDownloadClick,
  })

  return (
    <>
      <ContentWrapper>
        {/* Page Header */}
        <PageHeader
          icon={<FaFileAlt />}
          title="Laporan Nilai Resmi"
          description="Kelola laporan nilai resmi siswa"
        />
      </ContentWrapper>

      {/* Filter Section */}
      <div className="mt-6 sm:mt-8">
        <FilterSection kelasFilter={kelasFilter} onKelasChange={handleKelasFilter} />
      </div>

      {/* Search Section */}
      <div className="mt-6 sm:mt-8">
        <div className="space-y-3 sm:space-y-4">
          <SearchBar
            search={searchQuery}
            setSearch={handleSearch}
            placeholder="Cari berdasarkan NISN atau nama siswa..."
            showFilter={false}
            showAddButton={true}
            addButtonText="Upload Laporan"
            onAddClick={() => setIsUploadModalOpen(true)}
          />
        </div>
      </div>

      {/* Data Table Section */}
      <div className="mt-6 sm:mt-8">
        <ContentWrapper>
          {/* Empty State - Belum pilih filter */}
          {!kelasFilter && !isLoading && (
            <div className="text-center py-16">
              <FaFileAlt className="text-6xl text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Pilih Kelas Terlebih Dahulu
              </h3>
              <p className="text-slate-600 max-w-md mx-auto">
                Silakan pilih <span className="font-semibold">Kelas</span> untuk menampilkan data
                laporan nilai resmi siswa
              </p>
            </div>
          )}

          {/* Data Table - Jika sudah pilih filter */}
          {kelasFilter && (
            <div className="space-y-4 sm:space-y-6">
              {/* Table Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-emerald-100 rounded-lg flex-shrink-0">
                    <FaFileAlt className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-800 truncate">
                      Daftar Laporan Nilai Resmi
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs sm:text-sm text-slate-600 truncate">
                        Menampilkan {laporanData.length} dari {pagination.total_data} data
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <DataTable
                columns={laporanResmiColumns}
                data={tableData}
                className="mt-6"
                isLoading={isLoading}
                emptyMessage="Tidak ada data laporan"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
              />

              {/* Pagination Controls */}
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-end">
                <div className="flex flex-col items-center gap-4 sm:flex-row">
                  {/* Per halaman */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm text-slate-600 whitespace-nowrap">
                      Per halaman:
                    </span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                      className="px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white min-w-0"
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
            </div>
          )}
        </ContentWrapper>
      </div>

      {/* Modals */}
      <UploadLaporanResmiModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />

      <UpdateLaporanResmiModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false)
          setSelectedLaporan(null)
        }}
        onUpdate={handleUpdate}
        laporanData={selectedLaporan}
      />

      <RiwayatVersiModal
        isOpen={isRiwayatModalOpen}
        onClose={() => {
          setIsRiwayatModalOpen(false)
          setSelectedLaporan(null)
        }}
        laporanData={selectedLaporan}
        getVersionHistory={getVersionHistory}
      />

      <DetailLaporanResmiModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedLaporan(null)
        }}
        laporanData={selectedLaporan}
      />

      <DeleteLaporanResmiModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedLaporan(null)
        }}
        onDelete={handleDelete}
        laporanData={selectedLaporan}
      />
    </>
  )
}
