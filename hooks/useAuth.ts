import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { User } from '@/types';

export const useAuth = () => {
  const { setUser, setToken, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get('/api/auth/me');
      setUser(response.data.user);
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password });
    setUser(response.data.user);
    setToken(response.data.token);
    return response.data;
  };

  const register = async (username: string, email: string, password: string) => {
    const response = await api.post('/api/auth/register', { username, email, password });
    setUser(response.data.user);
    setToken(response.data.token);
    return response.data;
  };

  const logoutUser = async () => {
    await api.post('/api/auth/logout');
    logout();
  };

  return { login, register, logout: logoutUser, loading };
};
