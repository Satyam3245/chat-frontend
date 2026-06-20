import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { Message } from '@/types';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuthStore();
  const { selectedConversation, addMessage, addOnlineUser, removeOnlineUser, addTypingUser, removeTypingUser } = useChatStore();

  useEffect(() => {
    if (!user) return;

    const SOCKET_URL = 'https://chat-backend-3-jr4u.onrender.com';
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.on('receive_message', (message: Message) => {
      // Don't add message if it's from the current user (already added optimistically)
      if (message.senderId !== user?.id) {
        addMessage(message);
      }
    });

    socket.on('user_online', ({ userId }: { userId: string }) => {
      addOnlineUser(userId);
    });

    socket.on('user_offline', ({ userId }: { userId: string }) => {
      removeOnlineUser(userId);
    });

    socket.on('user_typing', ({ userId }: { userId: string }) => {
      addTypingUser(userId);
    });

    socket.on('user_stop_typing', ({ userId }: { userId: string }) => {
      removeTypingUser(userId);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const joinChat = (conversationId: string) => {
    if (socketRef.current && user) {
      socketRef.current.emit('join_chat', { userId: user.id, conversationId });
    }
  };

  const sendMessage = (conversationId: string, senderId: string, content: string) => {
    if (socketRef.current) {
      socketRef.current.emit('send_message', { conversationId, senderId, content });
    }
  };

  const startTyping = (conversationId: string, userId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('typing', { conversationId, userId });
    }
  };

  const stopTyping = (conversationId: string, userId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('stop_typing', { conversationId, userId });
    }
  };

  const markMessageSeen = (messageId: string, conversationId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('message_seen', { messageId, conversationId });
    }
  };

  return {
    joinChat,
    sendMessage,
    startTyping,
    stopTyping,
    markMessageSeen,
  };
};
