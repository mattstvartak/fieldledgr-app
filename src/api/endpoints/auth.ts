import { apiClient } from '@/api/client';
import type { AuthResponse, LoginCredentials, User } from '@/types/user';

interface MeResponse {
  user: User | null;
  token: string;
  exp: number;
}

export const authApi = {
  login: (credentials: LoginCredentials) =>
    apiClient.post<AuthResponse>('/api/users/login', credentials),

  getMe: () => apiClient.get<MeResponse>('/api/users/me'),

  refreshToken: () =>
    apiClient.post<{ refreshedToken: string; exp: number }>('/api/users/refresh-token'),
};
