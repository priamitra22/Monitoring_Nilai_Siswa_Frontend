import { Search } from 'lucide-react'
import ContentWrapper from '../../../../components/ui/ContentWrapper'
import FilterDropdown from '../../../../components/ui/FilterDropdown'

export default function FilterSection({
  // Tahun Ajaran
  selectedTahunAjaran,
  onTahunAjaranChange,
  tahunAjaranOptions,

  // Kelas
  selectedKelas,
  onKelasChange,
  kelasOptions,
  isLoadingKelas,

  // Search
  searchQuery,
  onSearchChange,
}) {
  return (
    <ContentWrapper>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="space-y-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Filter Laporan Resmi</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {/* Tahun Ajaran (Read-only, always aktif) */}
            <div className="flex flex-col gap-2">
              <label className="text-xs sm:text-sm font-medium text-gray-700">Tahun Ajaran</label>
              <FilterDropdown
                value={selectedTahunAjaran}
                onChange={(e) => onTahunAjaranChange(e.target.value)}
                options={tahunAjaranOptions}
                showDefaultOption={false}
                placeholder="Memuat tahun ajaran..."
                disabled={true}
              />
            </div>

            {/* Kelas Dropdown (Cascading) */}
            <div className="flex flex-col gap-2">
              <label className="text-xs sm:text-sm font-medium text-gray-700">
                Kelas <span className="text-red-500">*</span>
              </label>
              <FilterDropdown
                value={selectedKelas}
                onChange={(e) => onKelasChange(e.target.value)}
                options={kelasOptions}
                showDefaultOption={false}
                disabled={!selectedTahunAjaran || isLoadingKelas}
                placeholder={
                  isLoadingKelas
                    ? 'Memuat...'
                    : !selectedTahunAjaran
                    ? 'Pilih tahun ajaran dulu'
                    : 'Pilih kelas'
                }
              />
            </div>

            {/* Search Box */}
            <div className="flex flex-col gap-2">
              <label className="text-xs sm:text-sm font-medium text-gray-700">
                Cari (NISN / Nama Siswa)
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Ketik NISN atau nama siswa..."
                  disabled={!selectedKelas}
                  className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ContentWrapper>
  )
}
