import { create } from 'zustand';
import { api } from '@/lib/axios';
import { User } from '@/types/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (credentials: Record<string, any>) => Promise<void>;
  register: (userData: Record<string, any>) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true, // Start as true so we can show loading state on initial app load

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    set({ user: response.data.user });
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    set({ user: response.data.user });
  },

  logout: async () => {
    await api.post('/auth/logout');
    set({ user: null });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/auth/me');
      set({ user: response.data.user, isLoading: false });
    } catch (error) {
      set({ user: null, isLoading: false });
    }
  },
}));
