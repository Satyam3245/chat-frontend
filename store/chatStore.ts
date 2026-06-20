import { create } from 'zustand';
import { Conversation, Message } from '@/types';

interface ChatStore {
  selectedConversation: Conversation | null;
  conversations: Conversation[];
  messages: Message[];
  onlineUsers: Set<string>;
  typingUsers: Set<string>;
  setSelectedConversation: (conversation: Conversation | null) => void;
  setConversations: (conversations: Conversation[]) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setOnlineUsers: (users: Set<string>) => void;
  addOnlineUser: (userId: string) => void;
  removeOnlineUser: (userId: string) => void;
  addTypingUser: (userId: string) => void;
  removeTypingUser: (userId: string) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  selectedConversation: null,
  conversations: [],
  messages: [],
  onlineUsers: new Set(),
  typingUsers: new Set(),
  setSelectedConversation: (conversation) => set({ selectedConversation: conversation }),
  setConversations: (conversations) => set({ conversations }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  addOnlineUser: (userId) => set((state) => ({ onlineUsers: new Set([...state.onlineUsers, userId]) })),
  removeOnlineUser: (userId) => set((state) => {
    const newUsers = new Set(state.onlineUsers);
    newUsers.delete(userId);
    return { onlineUsers: newUsers };
  }),
  addTypingUser: (userId) => set((state) => ({ typingUsers: new Set([...state.typingUsers, userId]) })),
  removeTypingUser: (userId) => set((state) => {
    const newUsers = new Set(state.typingUsers);
    newUsers.delete(userId);
    return { typingUsers: newUsers };
  }),
}));
