'use client';

import { useEffect, useState } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { useChat } from '@/hooks/useChat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, LogOut, X, UserPlus } from 'lucide-react';
import { Conversation, User } from '@/types';
import api from '@/lib/axios';

export default function ChatSidebar() {
  const { conversations, selectedConversation, setSelectedConversation, onlineUsers } = useChatStore();
  const { user } = useAuthStore();
  const { fetchConversations, createConversation } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/users');
      setUsers(response.data.users.filter((u: User) => u.id !== user?.id));
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNewChat = () => {
    setShowNewChatModal(true);
    fetchUsers();
  };

  const handleStartConversation = async (selectedUserId: string) => {
    try {
      await createConversation([user?.id || '', selectedUserId]);
      setShowNewChatModal(false);
      await fetchConversations();
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const filteredConversations = (conversations || []).filter(conv => {
    const otherUser = conv.participants.find(p => p.user.id !== user?.id);
    return otherUser?.user.username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredUsers = (users || []).filter(u => 
    u.username.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleLogout = () => {
    window.location.href = '/login';
  };

  const getConversationName = (conversation: Conversation) => {
    const otherUser = conversation.participants.find(p => p.user.id !== user?.id);
    return otherUser?.user.username || 'Unknown';
  };

  const getLastMessage = (conversation: Conversation) => {
    if (conversation.messages.length === 0) return 'No messages yet';
    return conversation.messages[0].content;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="w-80 glass border-r border-white/10 flex flex-col h-full">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user?.profilePic || undefined} />
              <AvatarFallback className="bg-primary/20 text-primary">
                {user?.username ? getInitials(user.username) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{user?.username}</p>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-zinc-900/50 border-zinc-800"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => handleSelectConversation(conversation)}
              className={`w-full p-3 rounded-xl transition-all mb-2 ${
                selectedConversation?.id === conversation.id
                  ? 'bg-primary/20 border border-primary/30'
                  : 'hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar>
                    <AvatarFallback className="bg-zinc-800">
                      {getInitials(getConversationName(conversation))}
                    </AvatarFallback>
                  </Avatar>
                  {onlineUsers.has(
                    conversation.participants.find(p => p.user.id !== user?.id)?.user.id || ''
                  ) && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm">{getConversationName(conversation)}</p>
                    {conversation._count.messages > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {conversation._count.messages}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {getLastMessage(conversation)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleOpenNewChat}
          className="w-full py-2 px-4 bg-primary/20 hover:bg-primary/30 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span className="text-sm font-medium">New Chat</span>
        </button>
      </div>

      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Start a new conversation</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNewChatModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="pl-10 bg-zinc-900/50 border-zinc-800"
                />
              </div>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {loading ? (
                    <p className="text-center text-muted-foreground py-4">Loading users...</p>
                  ) : filteredUsers.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No users found</p>
                  ) : (
                    filteredUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => handleStartConversation(u.id)}
                        className="w-full p-3 rounded-xl hover:bg-white/5 transition-colors flex items-center gap-3"
                      >
                        <Avatar>
                          <AvatarImage src={u.profilePic || undefined} />
                          <AvatarFallback className="bg-zinc-800">
                            {getInitials(u.username)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-sm">{u.username}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                        {onlineUsers.has(u.id) && (
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
