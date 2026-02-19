import { apiClient } from '@/api/client';
import type { AuthResponse, LoginCredentials, SignupCredentials, User } from '@/types/user';

interface MeResponse {
  user: User | null;
  token: string;
  exp: number;
}

interface SignupResponse {
  doc: User;
  message: string;
}

export const authApi = {
  login: (credentials: LoginCredentials) =>
    apiClient.post<AuthResponse>('/api/users/login', credentials),

  signup: async (credentials: SignupCredentials): Promise<SignupResponse> => {
    // Create user as owner — Payload sends verification email automatically.
    // User must verify email before they can log in.
    return apiClient.post<SignupResponse>('/api/users', {
      ...credentials,
      role: 'owner',
    });
  },

  resendVerification: (email: string) =>
    apiClient.post('/api/users/verify', { email }),

  getMe: () => apiClient.get<MeResponse>('/api/users/me'),

  updateMe: (id: number, data: Partial<User>) =>
    apiClient.patch<{ doc: User }>(`/api/users/${id}`, data),

  refreshToken: () =>
    apiClient.post<{ refreshedToken: string; exp: number }>('/api/users/refresh-token'),
};
