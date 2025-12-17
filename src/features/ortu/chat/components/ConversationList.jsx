import { FaCircle, FaPlus, FaSearch, FaComments, FaExclamationTriangle } from 'react-icons/fa'
import { formatTime } from '../config/utils'
import Button from '../../../../components/ui/Button'

/**
 * ConversationList Component
 * Display list of conversations with guru
 * NEW: Support filter by tahun ajaran & semester
 */
export default function ConversationList({
  conversations,
  selectedConversation,
  isLoading,
  searchQuery,
  onSelectConversation,
  onNewChatClick,
  onSearchChange,
  // Filter props
  tahunAjaranList = [],
  selectedTahunAjaranId,
  selectedSemester = 'all',
  onTahunAjaranChange,
  onSemesterChange,
}) {
  const hasNoResults = conversations.length === 0 && searchQuery.trim()
  const isEmpty = conversations.length === 0 && !searchQuery.trim()

  // Get selected tahun ajaran info
  const selectedTA = tahunAjaranList.find((ta) => ta.id === selectedTahunAjaranId)

  return (
    <div className="w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col">
      {/* New Chat Button & Filters */}
      <div className="p-3 md:p-4 border-b border-gray-200 space-y-3">
        <Button
          variant="primary"
          icon={<FaPlus />}
          onClick={onNewChatClick}
          className="w-full"
          size="sm"
        >
          Chat Baru
        </Button>

        {/* Filter: Tahun Ajaran */}
        <select
          value={selectedTahunAjaranId || ''}
          onChange={(e) => onTahunAjaranChange(e.target.value ? parseInt(e.target.value) : null)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          disabled={tahunAjaranList.length === 0}
        >
          <option value="">Tahun Ajaran Aktif</option>
          {tahunAjaranList.length === 0 ? (
            <option value="" disabled>Memuat tahun ajaran...</option>
          ) : (
            tahunAjaranList.map((ta) => (
              <option key={ta.id} value={ta.id}>
                {ta.tahun} - Semester {ta.semester}
                {ta.is_active ? ' (Aktif)' : ''}
              </option>
            ))
          )}
        </select>

        {/* Filter: Semester (only show if tahun ajaran selected) */}
        {selectedTahunAjaranId && selectedTA && (
          <select
            value={selectedSemester}
            onChange={(e) => onSemesterChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="all">Semua Semester</option>
            <option value="1">Semester 1 (Ganjil)</option>
            <option value="2">Semester 2 (Genap)</option>
          </select>
        )}

        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Cari guru..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-gray-500">Loading...</div>
        ) : isEmpty ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Tidak ada percakapan
          </div>
        ) : hasNoResults ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Tidak ada hasil
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => onSelectConversation(conv)}
              className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedConversation?.id === conv.id
                  ? 'bg-emerald-50 border-l-4 border-l-emerald-500'
                  : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-gray-900 truncate">{conv.guru_nama}</h4>
                    {conv.is_online === true && <FaCircle className="text-green-500 text-xs" />}
                    {/* Warning badge untuk guru yang tidak mengampu lagi */}
                    {conv.is_guru_still_mengampu === false && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        <FaExclamationTriangle className="text-xs" />
                        Tidak mengampu lagi
                      </span>
                    )}
                  </div>
                  {/* Info tahun ajaran & semester jika bukan tahun aktif */}
                  {conv.tahun_ajaran && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {conv.tahun_ajaran} - Semester {conv.semester}
                      {conv.kelas_nama && ` • ${conv.kelas_nama}`}
                    </p>
                  )}
                  <p
                    className={`text-sm mt-1 truncate ${
                      conv.unread_count > 0 ? 'font-semibold text-gray-900' : 'text-gray-600'
                    }`}
                  >
                    {conv.last_message}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 ml-2">
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {formatTime(conv.last_message_time)}
                  </span>
                  {conv.unread_count > 0 && (
                    <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
