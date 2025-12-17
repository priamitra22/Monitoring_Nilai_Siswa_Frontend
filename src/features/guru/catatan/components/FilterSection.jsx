import SearchBar from '../../../../components/ui/SearchBar'
import ContentWrapper from '../../../../components/ui/ContentWrapper'
import { kategoriFilters, jenisFilters } from '../config'

/**
 * FilterSection Component
 * Search bar with filters for Catatan
 */
export default function FilterSection({
  searchQuery,
  handleSearch,
  kategoriFilter,
  handleKategoriFilter,
  jenisFilter,
  handleJenisFilter,
  handleTambahCatatan,
}) {
  return (
    <ContentWrapper>
      <SearchBar
        search={searchQuery}
        setSearch={handleSearch}
        filter={kategoriFilter}
        setFilter={handleKategoriFilter}
        filters={kategoriFilters}
        secondFilter={jenisFilter}
        setSecondFilter={handleJenisFilter}
        secondFilters={jenisFilters}
        placeholder="Cari nama siswa atau isi catatan..."
        filterPlaceholder="Pilih Kategori"
        secondFilterPlaceholder="Pilih Jenis"
        showFilter={true}
        showSecondFilter={true}
        showAddButton={true}
        addButtonText="Tambah Catatan"
        onAddClick={handleTambahCatatan}
      />
    </ContentWrapper>
  )
}
