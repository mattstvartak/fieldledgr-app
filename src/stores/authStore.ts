import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { User } from '@/types/user';
import { config } from '@/constants/config';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  setAuth: (user: User, token: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  setAuth: async (user, token) => {
    await SecureStore.setItemAsync(config.tokenStorageKey, token);
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  clearAuth: async () => {
    await SecureStore.deleteItemAsync(config.tokenStorageKey);
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  loadStoredAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync(config.tokenStorageKey);
      if (token) {
        // Validate token by fetching current user from API
        try {
          const response = await fetch(
            new URL('/api/users/me', config.apiUrl).toString(),
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            },
          );

          if (response.ok) {
            const data = (await response.json()) as { user: User; token: string; exp: number };
            if (data.user) {
              set({ user: data.user, token: data.token || token, isAuthenticated: true, isLoading: false });
              if (data.token && data.token !== token) {
                await SecureStore.setItemAsync(config.tokenStorageKey, data.token);
              }
              return;
            }
          }

          // Token was invalid — clear it
          await SecureStore.deleteItemAsync(config.tokenStorageKey);
          set({ isLoading: false });
        } catch {
          // Network error — keep the token for offline use, the useAuth hook
          // will re-validate when connectivity returns
          set({ token, isLoading: false });
        }
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
