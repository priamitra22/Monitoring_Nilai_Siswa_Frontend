import { useEffect } from 'react'
import { useMasterData } from '../../../../hooks/useMasterData'

const FilterSection = ({ kelasFilter, onKelasChange }) => {
  const { kelasOptions, getAllKelas } = useMasterData()

  useEffect(() => {
    getAllKelas()
  }, [getAllKelas])

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
        <div className="flex-1 w-full sm:w-auto">
          <label className="block text-sm font-medium text-gray-700 mb-2">Kelas</label>
          <select
            value={kelasFilter}
            onChange={(e) => onKelasChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Pilih Kelas</option>
            {kelasOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

export default FilterSection
