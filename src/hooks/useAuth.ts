import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/api/endpoints/auth';
import { mockAuthResponse, mockUser } from '@/mocks/user';
import { useAppSettingsStore } from '@/stores/appSettingsStore';
import type { LoginCredentials } from '@/types/user';

export function useAuth() {
  const { user, token, isLoading, isAuthenticated, setAuth, clearAuth, loadStoredAuth } =
    useAuthStore();
  const useMockData = useAppSettingsStore((s) => s.useMockData);
  const queryClient = useQueryClient();

  // Fetch current user when we have a token but no user data
  const meQuery = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      if (useMockData) return mockUser;
      // Payload GET /api/users/me returns { user, token, exp, collection }
      const response = await authApi.getMe();
      if (response.user && response.token) {
        // Update token if a fresh one was returned
        await useAuthStore.getState().setAuth(response.user, response.token);
      }
      return response.user;
    },
    enabled: !!token && !user,
  });

  // When meQuery succeeds, populate user in store
  if (meQuery.data && !user) {
    useAuthStore.setState({ user: meQuery.data, isAuthenticated: true });
  }

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      if (useMockData) {
        // Simulate network delay
        await new Promise((r) => setTimeout(r, 800));
        return mockAuthResponse;
      }
      return authApi.login(credentials);
    },
    onSuccess: async (data) => {
      await setAuth(data.user, data.token);
    },
  });

  const logout = async () => {
    await clearAuth();
    queryClient.clear();
  };

  return {
    user,
    token,
    isLoading,
    isAuthenticated: isAuthenticated || !!user,
    login: loginMutation.mutateAsync,
    loginError: loginMutation.error,
    isLoggingIn: loginMutation.isPending,
    logout,
    loadStoredAuth,
  };
}
