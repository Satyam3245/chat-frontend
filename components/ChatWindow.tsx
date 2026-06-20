'use client';

import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { useSocket } from '@/hooks/useSocket';
import { useChat } from '@/hooks/useChat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, MoreVertical, MessageSquare } from 'lucide-react';
import { Message } from '@/types';
import { formatDistanceToNow } from 'date-fns';

export default function ChatWindow() {
  const { selectedConversation, messages, typingUsers, addMessage } = useChatStore();
  const { user } = useAuthStore();
  const { joinChat, sendMessage, startTyping, stopTyping } = useSocket();
  const { fetchMessages } = useChat();
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      joinChat(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedConversation || !user) return;

    const tempMessage: Message = {
      id: Date.now().toString(),
      senderId: user.id,
      conversationId: selectedConversation.id,
      content: inputMessage,
      createdAt: new Date().toISOString(),
      seen: false,
      sender: {
        id: user.id,
        username: user.username,
        profilePic: user.profilePic,
      },
    };

    addMessage(tempMessage);
    sendMessage(selectedConversation.id, user.id, inputMessage);
    setInputMessage('');
    stopTyping(selectedConversation.id, user.id);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
    
    if (!isTyping && selectedConversation && user) {
      setIsTyping(true);
      startTyping(selectedConversation.id, user.id);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping && selectedConversation && user) {
        setIsTyping(false);
        stopTyping(selectedConversation.id, user.id);
      }
    }, 1000);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getOtherUser = () => {
    if (!selectedConversation || !user) return null;
    return selectedConversation.participants.find(p => p.user.id !== user.id)?.user;
  };

  const otherUser = getOtherUser();

  if (!selectedConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
          <p className="text-muted-foreground">Choose a conversation from the sidebar to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950">
      <div className="p-4 border-b border-white/10 glass">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={otherUser?.profilePic || undefined} />
              <AvatarFallback className="bg-zinc-800">
                {otherUser ? getInitials(otherUser.username) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{otherUser?.username}</p>
              <p className="text-xs text-muted-foreground">
                {typingUsers.has(otherUser?.id || '') ? 'Typing...' : 'Online'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {(messages || []).map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex gap-3 max-w-[70%] ${
                  message.senderId === user?.id ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={message.sender.profilePic || undefined} />
                  <AvatarFallback className="bg-zinc-800 text-xs">
                    {getInitials(message.sender.username)}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`p-3 rounded-xl ${
                    message.senderId === user?.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-zinc-800 text-foreground'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs opacity-70">
                      {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                    </p>
                    {message.senderId === user?.id && message.seen && (
                      <span className="text-xs">✓✓</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-white/10 glass">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 bg-zinc-900/50 border-zinc-800"
          />
          <Button type="submit" size="icon" disabled={!inputMessage.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
