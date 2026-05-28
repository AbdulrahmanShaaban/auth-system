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

// helpers
const setTokenCookie = (token: string) => {
  document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
};

const clearTokenCookie = () => {
  document.cookie = 'token=; path=/; max-age=0';
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const { user, token } = response.data;
    if (token) setTokenCookie(token);       // ← احفظ الـ token في cookie
    set({ user });
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    const { user, token } = response.data;
    if (token) setTokenCookie(token);       // ← نفس الشيء هنا
    set({ user });
  },

  logout: async () => {
    await api.post('/auth/logout');
    clearTokenCookie();                     // ← امسح الـ cookie
    set({ user: null });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/auth/me');
      set({ user: response.data.user, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },
}));
