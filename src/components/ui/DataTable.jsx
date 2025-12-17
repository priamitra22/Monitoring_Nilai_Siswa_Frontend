export default function DataTable({ columns, data, className = '', forceScroll = false }) {
  const needsScroll = columns.length > 5 || forceScroll
  const responsiveWrapper = `
    overflow-x-auto
  `
  const responsivePadding = `
    ${needsScroll ? 'min-w-max' : ''}
  `
  const responsiveTable = `
    w-full text-sm table-auto
    ${needsScroll ? 'min-w-[800px]' : ''}
  `
  const responsiveHeader = `
    bg-gradient-to-r from-slate-50 to-slate-100
    ${needsScroll ? 'w-full' : ''}
  `
  const responsiveCell = (col) => `
    px-3 py-3 text-slate-700
    ${col.className || ((col.label || col.Header) === 'No' ? 'text-center' : 'text-left')}
    ${(col.label || col.Header) === 'Tahun Ajaran' ||
      (col.label || col.Header) === 'Tanggal Mulai' ||
      (col.label || col.Header) === 'Tanggal Selesai' ||
      (col.label || col.Header) === 'Nama Kelas' ||
      (col.label || col.Header) === 'Wali Kelas'
      ? 'whitespace-normal sm:whitespace-nowrap'
      : 'whitespace-nowrap'
    }
  `
  const responsiveHeaderCell = (col) => `
    px-3 py-3 font-semibold text-slate-800 border-b border-slate-200 whitespace-nowrap
    ${col.className || ((col.label || col.Header) === 'No' ? 'text-center' : 'text-left')}
  `
  const responsiveBody = `
    bg-white divide-y divide-slate-100
    ${needsScroll ? 'w-full' : ''}
  `
  const responsiveRow = `
    hover:bg-slate-50 transition-all duration-200
    ${needsScroll ? 'w-full' : ''}
  `
  const responsiveEmptyState = `
    text-center py-8 bg-white
    ${needsScroll ? 'w-full' : ''}
  `
  const responsiveEmptyText = `
    text-slate-500 text-sm
    ${needsScroll ? 'w-full' : ''}
  `
  const responsiveContainer = `
    bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden
    ${needsScroll ? 'w-full' : ''}
  `

  return (
    <div className={`${responsiveContainer} ${className}`}>
      <div className={responsiveWrapper}>
        <div className={responsivePadding}>
          <table className={responsiveTable}>
            <thead className={responsiveHeader}>
              <tr>
                {columns.map((col, i) => (
                  <th key={i} className={responsiveHeaderCell(col)}>
                    {col.label || col.Header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={responsiveBody}>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex} className={responsiveRow}>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className={responsiveCell(col)}>
                      {row[col.key || col.accessor]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {data.length === 0 && (
        <div className={responsiveEmptyState}>
          <p className={responsiveEmptyText}>Belum ada data yang tersedia untuk ditampilkan.</p>
        </div>
      )}
    </div>
  )
}
