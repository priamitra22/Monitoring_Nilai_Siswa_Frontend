import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ChatService } from '../../../../services/Guru/chat/ChatService';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client'; // [NEW]

export function useChat() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversationInfo, setConversationInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const loadConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await ChatService.getConversations(searchQuery);
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Gagal memuat daftar percakapan');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  const loadMessages = useCallback(async (conversationId) => {
    try {
      const response = await ChatService.getMessages(conversationId);
      setMessages(response.data.messages);
      setConversationInfo(response.data.conversation_info);

      setConversations(prevConvs =>
        prevConvs.map(c =>
          c.id === conversationId ? { ...c, unread_count: 0 } : c
        )
      );
    } catch (error) {
      console.error('Error loading messages:', error);
      if (error.response?.status === 404) {
        toast.error('Percakapan tidak ditemukan');
        setSelectedConversation(null);
        setMessages([]);
        setConversationInfo(null);
      } else if (error.response?.status === 403) {
        toast.error('Anda tidak memiliki akses ke percakapan ini');
        setSelectedConversation(null);
        setMessages([]);
        setConversationInfo(null);
      } else {
        toast.error('Gagal memuat pesan');
      }
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Socket.IO Integration
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    let url = apiUrl;
    try {
      const urlObj = new URL(apiUrl);
      url = urlObj.origin;
    } catch (e) {
      console.error('Invalid API URL', e);
    }

    // console.log('🔌 Initializing socket to:', url);
    const newSocket = io(url);

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onConnect = () => {
      // console.log('✅ Connected to socket:', socket.id);
      joinRooms();
    };

    const onReceiveMessage = (newMessage) => {
      // Update messages if conversation is open
      setSelectedConversation(current => {
        if (current?.id === newMessage.conversation_id) {
          setMessages(prev => {
            // Check if message already exists to avoid duplicates
            if (prev.some(m => m.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
        }
        return current;
      });

      // Update conversation list
      setConversations(prevConvs =>
        prevConvs.map(c => {
          if (c.id === newMessage.conversation_id) {
            const isMe = newMessage.sender_role === 'guru';
            return {
              ...c,
              last_message: newMessage.message,
              last_message_time: newMessage.created_at,
              unread_count: !isMe ? c.unread_count + 1 : c.unread_count
            };
          }
          return c;
        })
      );
    };

    socket.on('connect', onConnect);
    socket.on('receive_message', onReceiveMessage);

    return () => {
      socket.off('connect', onConnect);
      socket.off('receive_message', onReceiveMessage);
    };
  }, [socket]); // socket dependency only (but relies on closure for setConversations/setSelectedConversation, which is fine for setters)

  // Join rooms logic
  const joinRooms = useCallback(() => {
    if (socket && socket.connected && conversations.length > 0) {
      conversations.forEach(c => {
        socket.emit('join_room', `conversation_${c.id}`);
      });
    }
  }, [socket, conversations]);

  // Trigger join rooms
  useEffect(() => {
    joinRooms();
  }, [socket, conversations]);

  // Join selected room & reset unread
  useEffect(() => {
    if (selectedConversation && socket && socket.connected) {
      socket.emit('join_room', `conversation_${selectedConversation.id}`);

      setConversations(prev => prev.map(c =>
        c.id === selectedConversation.id ? { ...c, unread_count: 0 } : c
      ));
    }
  }, [selectedConversation?.id, socket]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation, loadMessages]);

  const handleSendMessage = useCallback(async (messageText) => {
    if (!messageText.trim() || !selectedConversation) return false;

    const trimmedMessage = messageText.trim();

    if (trimmedMessage.length > 1000) {
      toast.error('Pesan maksimal 1000 karakter');
      return false;
    }

    try {
      setIsSending(true);
      const response = await ChatService.sendMessage(selectedConversation.id, trimmedMessage);

      setMessages(prev => {
        if (prev.some(m => m.id === response.data.id)) return prev;
        return [...prev, response.data];
      });

      setConversations(prevConvs =>
        prevConvs.map(c =>
          c.id === selectedConversation.id
            ? {
              ...c,
              last_message: trimmedMessage,
              last_message_time: response.data.created_at
            }
            : c
        )
      );

      toast.success('Pesan terkirim');
      return true;
    } catch (error) {
      console.error('Error sending message:', error);

      if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Pesan tidak valid');
      } else if (error.response?.status === 403) {
        toast.error('Anda tidak memiliki akses ke percakapan ini');
      } else if (error.response?.status === 429) {
        toast.error('Terlalu banyak pesan. Tunggu 30 detik.');
      } else {
        toast.error('Gagal mengirim pesan');
      }

      return false;
    } finally {
      setIsSending(false);
    }
  }, [selectedConversation]);

  const handleSelectConversation = useCallback((conversation) => {
    setSelectedConversation(conversation);
  }, []);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const displayConversations = useMemo(() => {
    return [...conversations].sort((a, b) => {
      if (a.unread_count !== b.unread_count) {
        return b.unread_count - a.unread_count;
      }
      return new Date(b.last_message_time) - new Date(a.last_message_time);
    });
  }, [conversations]);

  const totalUnread = useMemo(() => {
    return conversations.reduce((sum, conv) => sum + conv.unread_count, 0);
  }, [conversations]);

  const addConversation = useCallback((newConversation) => {
    setConversations(prev => [newConversation, ...prev]);
  }, []);

  return {
    conversations: displayConversations,
    selectedConversation,
    messages,
    conversationInfo,
    searchQuery,
    isLoading,
    isSending,
    totalUnread,
    handleSelectConversation,
    handleSendMessage,
    handleSearch,
    loadConversations,
    addConversation,
  };
}

