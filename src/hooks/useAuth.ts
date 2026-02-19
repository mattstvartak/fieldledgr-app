import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/api/endpoints/auth';
import type { LoginCredentials, SignupCredentials } from '@/types/user';
import { closeAblyClient } from '@/lib/ably';
import { unregisterPushToken } from '@/lib/push-token';

export function useAuth() {
  const { user, token, isLoading, isAuthenticated, setAuth, clearAuth, loadStoredAuth } =
    useAuthStore();
  const queryClient = useQueryClient();

  // Fetch current user when we have a token but no user data
  const meQuery = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const response = await authApi.getMe();
      if (response.user && response.token) {
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
      return authApi.login(credentials);
    },
    onSuccess: async (data) => {
      await setAuth(data.user, data.token);
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (credentials: SignupCredentials) => {
      return authApi.signup(credentials);
    },
    // No auto-login — Payload requires email verification first
  });

  const resendVerificationMutation = useMutation({
    mutationFn: async (email: string) => {
      return authApi.resendVerification(email);
    },
  });

  const logout = async () => {
    await unregisterPushToken();
    closeAblyClient();
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
    signup: signupMutation.mutateAsync,
    signupError: signupMutation.error,
    isSigningUp: signupMutation.isPending,
    signupSuccess: signupMutation.isSuccess,
    resendVerification: resendVerificationMutation.mutateAsync,
    isResendingVerification: resendVerificationMutation.isPending,
    logout,
    loadStoredAuth,
  };
}
