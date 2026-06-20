export interface User {
  id: string;
  username: string;
  email: string;
  profilePic: string | null;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  conversationId: string;
  content: string;
  createdAt: string;
  seen: boolean;
  sender: {
    id: string;
    username: string;
    profilePic: string | null;
  };
}

export interface Conversation {
  id: string;
  createdAt: string;
  participants: Participant[];
  messages: Message[];
  _count: {
    messages: number;
  };
}

export interface Participant {
  id: string;
  userId: string;
  conversationId: string;
  joinedAt: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
