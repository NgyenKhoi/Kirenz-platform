import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile } from '../types/auth.types';
import { authService } from '../services/auth.service';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (user: UserProfile) => void;
  logout: () => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      login: (user) => set({ user, isAuthenticated: true, error: null }),

      logout: () => {
        authService.logout();
        set({ user: null, isAuthenticated: false, error: null });
      },

      initializeAuth: async () => {
        const token = authService.getAccessToken();
        
        if (!token) {
          set({ user: null, isAuthenticated: false, isLoading: false });
          return;
        }

        set({ isLoading: true });

        try {
          const user = await authService.getCurrentUser();
          set({ user, isAuthenticated: true, isLoading: false, error: null });
        } catch (error) {
          authService.logout();
          set({ user: null, isAuthenticated: false, isLoading: false, error: null });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
