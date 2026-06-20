import { useState, useCallback } from 'react';
import api from '@/lib/axios';
import { useChatStore } from '@/store/chatStore';

export const useChat = () => {
  const { setConversations, setMessages } = useChatStore();
  const [loading, setLoading] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);

      const { data } = await api.get('/api/chat/user/conversations');

      setConversations(data.conversations || []);
      return data.conversations;
    } catch (error) {
      console.error('Fetch conversations failed:', error);
    } finally {
      setLoading(false);
    }
  }, [setConversations]);

  const fetchMessages = useCallback(
    async (conversationId: string) => {
      try {
        setLoading(true);

        const { data } = await api.get(
          `/api/chat/${conversationId}/messages`
        );

        setMessages(data.messages || []);
        return data.messages;
      } catch (error) {
        console.error('Fetch messages failed:', error);
      } finally {
        setLoading(false);
      }
    },
    [setMessages]
  );

  const createConversation = useCallback(
    async (participantIds: string[]) => {
      try {
        const { data } = await api.post('/api/chat/create', {
          participantIds,
        });

        if (data?.conversation) {
          //@ts-ignore
          setConversations((prev) => [data.conversation, ...prev]);
        }

        return data.conversation;
      } catch (error) {
        console.error('Create conversation failed:', error);
        throw error;
      }
    },
    [setConversations]
  );

  return {
    fetchConversations,
    fetchMessages,
    createConversation,
    loading,
  };
};