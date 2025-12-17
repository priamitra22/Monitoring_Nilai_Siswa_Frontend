import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { ChatService } from '../../../../services/Ortu/ChatService'
import toast from 'react-hot-toast'
import { io } from 'socket.io-client' // [NEW]

/**
 * Custom hook untuk mengelola chat dengan guru
 * Handle: conversations, messages, send, mark as read
 */
export function useChatGuru() {
  // State untuk conversations
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)

  // State untuk messages
  const [messages, setMessages] = useState([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)

  // State untuk send message
  const [messageInput, setMessageInput] = useState('')
  const [isSending, setIsSending] = useState(false)

  // State untuk search
  const [searchQuery, setSearchQuery] = useState('')

  // State untuk filter tahun ajaran & semester
  const [selectedTahunAjaranId, setSelectedTahunAjaranId] = useState(null) // null = tahun ajaran aktif
  const [selectedSemester, setSelectedSemester] = useState('all') // 'all', '1', '2'
  const [tahunAjaranList, setTahunAjaranList] = useState([])
  const [isLoadingTahunAjaran, setIsLoadingTahunAjaran] = useState(false)

  // Ref untuk auto scroll
  const messagesEndRef = useRef(null)

  // Load tahun ajaran list on mount
  useEffect(() => {
    loadTahunAjaranList()
  }, [])

  // Socket.IO integration
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false) // [NEW] Track connection status

  useEffect(() => {
    // Get base URL for socket (remove /api if present)
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    let url = apiUrl
    try {
      const urlObj = new URL(apiUrl)
      url = urlObj.origin
    } catch (e) {
      console.error('Invalid API URL', e)
    }

    // console.log('🔌 Initializing socket to:', url)
    const newSocket = io(url)

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!socket) return

    const onConnect = () => {
      // console.log('✅ Connected to socket:', socket.id)
      setIsConnected(true)
      // joinRooms will be triggered by useEffect dependency on isConnected
    }

    const onDisconnect = () => {
      setIsConnected(false)
    }

    const onReceiveMessage = (newMessage) => {
      // console.log('📩 Received message in Hook:', newMessage)

      // 1. Update messages if we are in the conversation
      setSelectedConversation((currentSelected) => {
        // console.log('🔄 Checking conversation match:', {
        //   currentId: currentSelected?.id,
        //   msgConvId: newMessage.conversation_id,
        //   match: currentSelected?.id == newMessage.conversation_id
        // })

        if (currentSelected?.id == newMessage.conversation_id) {
          setMessages((prev) => {
            // Check if message already exists to avoid duplicates
            if (prev.some(m => m.id === newMessage.id)) {
              // console.log('⚠️ Message already exists, skipping:', newMessage.id)
              return prev
            }
            return [...prev, newMessage]
          })
        }
        return currentSelected
      })
      // 2. Update conversations list
      setConversations((prevConvs) =>
        prevConvs.map((c) => {
          if (c.id === newMessage.conversation_id) {
            const isMe = newMessage.sender_role === 'ortu'
            return {
              ...c,
              last_message: newMessage.message,
              last_message_time: newMessage.created_at,
              unread_count: !isMe ? c.unread_count + 1 : c.unread_count
            }
          }
          return c
        })
      )
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect) // Handle disconnect
    socket.on('receive_message', onReceiveMessage)

    // Check if already connected (in case we missed the event)
    if (socket.connected) {
      // console.log('⚡ Socket already connected on mount')
      onConnect()
    }

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('receive_message', onReceiveMessage)
    }
  }, [socket])

  // Join rooms logic
  const joinRooms = useCallback(() => {
    if (socket && socket.connected && conversations.length > 0) {
      conversations.forEach(c => {
        socket.emit('join_room', `conversation_${c.id}`)
      })
    }
  }, [socket, conversations])

  // Trigger join rooms whenever socket/conversations/isConnected change
  useEffect(() => {
    // console.log(`🔄 JoinRooms Effect: Socket=${!!socket}, Connected=${isConnected}, Convs=${conversations.length}`)
    if (socket && isConnected && conversations.length > 0) {
      conversations.forEach(c => {
        // console.log(`🔌 Emitting join_room for: conversation_${c.id}`)
        socket.emit('join_room', `conversation_${c.id}`)
      })
    }
    // else {
    //   console.log('⚠️ Not joining rooms yet.')
    // }
  }, [socket, conversations, isConnected])

  // Also join room when selecting a conversation
  useEffect(() => {
    if (selectedConversation && socket && socket.connected) {
      socket.emit('join_room', `conversation_${selectedConversation.id}`)

      // Also, when selecting a conversation, we should set its unread_count to 0 in the list
      setConversations(prev => prev.map(c =>
        c.id === selectedConversation.id ? { ...c, unread_count: 0 } : c
      ))
    }
  }, [selectedConversation?.id, socket])



  // Load conversations on mount
  useEffect(() => {
    loadConversations()
  }, [])

  // Load tahun ajaran list from API
  const loadTahunAjaranList = useCallback(async () => {
    try {
      setIsLoadingTahunAjaran(true)
      console.log('🔄 Loading tahun ajaran list...')
      const response = await ChatService.getTahunAjaranList()
      console.log('📋 Tahun ajaran response:', response)

      if (response.status === 'success') {
        const tahunAjaranData = response.data || []
        console.log('✅ Tahun ajaran data:', tahunAjaranData)
        setTahunAjaranList(tahunAjaranData)

        // Set default to tahun ajaran aktif (jika ada)
        const activeTA = tahunAjaranData.find((ta) => ta.is_active)
        if (activeTA) {
          console.log('🎯 Setting default tahun ajaran aktif:', activeTA.id)
          setSelectedTahunAjaranId(activeTA.id)
        } else if (tahunAjaranData.length > 0) {
          // Jika tidak ada yang aktif, gunakan yang pertama
          console.log('⚠️ No active TA, using first:', tahunAjaranData[0].id)
          setSelectedTahunAjaranId(tahunAjaranData[0].id)
        } else {
          // Jika tidak ada data sama sekali, tetap null (akan filter tahun ajaran aktif)
          console.log('ℹ️ No tahun ajaran data, keeping null (will filter by active)')
          setSelectedTahunAjaranId(null)
        }
      }
    } catch (error) {
      console.error('❌ Error loading tahun ajaran list:', error)
      toast.error('Gagal memuat daftar tahun ajaran')
      setTahunAjaranList([])
    } finally {
      setIsLoadingTahunAjaran(false)
    }
  }, [])

  // Load conversations from API
  const loadConversations = useCallback(async () => {
    try {
      setIsLoadingConversations(true)
      const response = await ChatService.getConversations({
        search: searchQuery,
        tahun_ajaran_id: selectedTahunAjaranId,
        semester: selectedSemester,
      })

      if (response.status === 'success') {
        setConversations(response.data.conversations)

        // Don't auto-select first conversation
        // Let user manually click to open a conversation
      }
    } catch (error) {
      console.error('Error loading conversations:', error)

      if (error.response?.status === 401) {
        toast.error('Orang Tua ID tidak ditemukan dalam token')
      } else if (error.response?.status === 500) {
        toast.error('Terjadi kesalahan pada server')
      } else {
        toast.error('Gagal memuat daftar percakapan')
      }

      // Set empty conversations on error
      setConversations([])
    } finally {
      setIsLoadingConversations(false)
    }
  }, [searchQuery, selectedTahunAjaranId, selectedSemester])

  // Reload conversations when search query or filters change
  useEffect(() => {
    loadConversations()
  }, [searchQuery, selectedTahunAjaranId, selectedSemester, loadConversations])

  // Load messages from API
  const loadMessages = useCallback(async (conversationId) => {
    try {
      setIsLoadingMessages(true)
      const response = await ChatService.getMessages(conversationId)

      if (response.status === 'success') {
        // API auto marks guru messages as read and returns conversation info + unread_count
        setMessages(response.data.messages)

        // Update local conversations list unread count to match API (should be 0)
        if (typeof response.data.unread_count !== 'undefined') {
          setConversations((prevConvs) =>
            prevConvs.map((c) =>
              c.id === conversationId ? { ...c, unread_count: response.data.unread_count } : c
            )
          )
        }

        // Note: Don't update selectedConversation here to avoid triggering the useEffect again
        // The conversation info from API is already in the conversations list
      }
    } catch (error) {
      console.error('Error loading messages:', error)

      if (error.response?.status === 401) {
        toast.error('Siswa ID tidak ditemukan dalam token')
      } else if (error.response?.status === 404) {
        toast.error('Percakapan tidak ditemukan atau Anda tidak memiliki akses')
        // Clear selection and messages
        setSelectedConversation(null)
        setMessages([])
      } else if (error.response?.status === 500) {
        toast.error('Terjadi kesalahan pada server')
      } else {
        toast.error('Gagal memuat pesan')
      }
    } finally {
      setIsLoadingMessages(false)
    }
  }, [])

  // Load messages when conversation is selected
  // Use selectedConversation.id to prevent infinite loop when conversation object changes
  useEffect(() => {
    if (selectedConversation?.id) {
      loadMessages(selectedConversation.id)
    }
  }, [selectedConversation?.id, loadMessages])

  // Auto scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Handle send message
  const handleSendMessage = useCallback(
    async (e) => {
      if (e) e.preventDefault()

      const trimmedMessage = messageInput.trim()

      if (!trimmedMessage || !selectedConversation) return

      // Client-side validation
      if (trimmedMessage.length > 1000) {
        toast.error('Pesan maksimal 1000 karakter')
        return
      }

      try {
        setIsSending(true)
        const response = await ChatService.sendMessage(selectedConversation.id, trimmedMessage)

        if (response.status === 'success') {
          // Add new message to UI
          setMessages((prev) => {
            if (prev.some(m => m.id === response.data.id)) return prev
            return [...prev, response.data]
          })

          // Update conversation last message and timestamp from API response
          setConversations((prevConvs) =>
            prevConvs.map((c) =>
              c.id === selectedConversation.id
                ? {
                  ...c,
                  last_message: response.data.message,
                  last_message_time: response.data.created_at,
                }
                : c
            )
          )

          setMessageInput('')
          toast.success('Pesan terkirim')

          // Auto scroll to bottom after sending
          setTimeout(() => scrollToBottom(), 100)
        }
      } catch (error) {
        console.error('Error sending message:', error)

        // Handle specific error cases
        if (error.response?.status === 400) {
          toast.error(error.response?.data?.message || 'Pesan tidak valid')
        } else if (error.response?.status === 401) {
          toast.error('Siswa ID tidak ditemukan dalam token')
        } else if (error.response?.status === 404) {
          toast.error('Percakapan tidak ditemukan atau Anda tidak memiliki akses')
        } else if (error.response?.status === 429) {
          // Rate limit error with countdown
          toast.error(error.response?.data?.message || 'Terlalu cepat! Tunggu sebentar.')
        } else if (error.response?.status === 500) {
          toast.error('Terjadi kesalahan pada server')
        } else {
          toast.error('Gagal mengirim pesan')
        }
      } finally {
        setIsSending(false)
      }
    },
    [messageInput, selectedConversation]
  )

  // Handle conversation select
  const handleSelectConversation = useCallback((conversation) => {
    setSelectedConversation(conversation)
  }, [])

  // Handle search
  const handleSearch = useCallback((query) => {
    setSearchQuery(query)
  }, [])

  // Handle create new conversation
  const handleCreateConversation = useCallback(
    async (guruId, initialMessage = '') => {
      try {
        const requestData = {
          guru_id: guruId,
        }

        // Add initial message if provided and not empty
        const trimmedMessage = initialMessage.trim()
        if (trimmedMessage) {
          // Client-side validation
          if (trimmedMessage.length > 1000) {
            toast.error('Pesan awal maksimal 1000 karakter')
            return null
          }
          requestData.initial_message = trimmedMessage
        }

        const response = await ChatService.createConversation(requestData)

        if (response.status === 'success') {
          const { data } = response

          // Check if conversation is new or existing
          if (data.is_new === false) {
            // Existing conversation found
            toast.success('Anda sudah memiliki percakapan dengan guru ini')
          } else {
            // New conversation created
            if (trimmedMessage) {
              toast.success('Percakapan baru dibuat dan pesan terkirim!')
            } else {
              toast.success('Percakapan baru berhasil dibuat')
            }
          }

          // Reload conversations to get updated list
          await loadConversations()

          // Return conversation data so caller can navigate/select it
          return data
        }

        return null
      } catch (error) {
        console.error('Error creating conversation:', error)

        // Handle specific error responses
        if (error.response?.status === 400) {
          toast.error(error.response?.data?.message || 'Data tidak valid')
        } else if (error.response?.status === 401) {
          toast.error('Siswa ID tidak ditemukan dalam token')
        } else if (error.response?.status === 403) {
          toast.error(error.response?.data?.message || 'Guru ini tidak mengajar siswa Anda')
        } else if (error.response?.status === 404) {
          toast.error(error.response?.data?.message || 'Data tidak ditemukan')
        } else if (error.response?.status === 500) {
          toast.error('Terjadi kesalahan pada server')
        } else {
          toast.error('Gagal membuat percakapan baru')
        }

        return null
      }
    },
    [loadConversations]
  )

  // Backend already handles filtering and sorting, so just return conversations as is
  // No need client-side filtering anymore
  const displayConversations = useMemo(() => {
    return conversations
  }, [conversations])

  // Get total unread count
  const totalUnread = useMemo(() => {
    return conversations.reduce((sum, conv) => sum + conv.unread_count, 0)
  }, [conversations])

  return {
    // State
    conversations: displayConversations,
    selectedConversation,
    messages,
    messageInput,
    searchQuery,
    isLoadingConversations,
    isLoadingMessages,
    isSending,
    totalUnread,
    messagesEndRef,

    // Filter state
    selectedTahunAjaranId,
    selectedSemester,
    tahunAjaranList,
    isLoadingTahunAjaran,

    // Handlers
    handleSelectConversation,
    handleSendMessage,
    handleSearch,
    handleCreateConversation,
    setMessageInput,
    loadConversations,
    setSelectedTahunAjaranId,
    setSelectedSemester,
  }
}
