import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { asyncStoragePersister } from '@/lib/query-persister';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { lightTheme, darkTheme } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { useAppSettingsStore } from '@/stores/appSettingsStore';
import { OfflineBanner } from '@/components/offline/OfflineBanner';
import { TimerBanner } from '@/components/time-tracking/TimerBanner';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import 'react-native-reanimated';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      retry: 2,
    },
  },
});

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const loadStoredAuth = useAuthStore((s) => s.loadStoredAuth);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);
  const loadSettings = useAppSettingsStore((s) => s.loadSettings);

  useEffect(() => {
    loadStoredAuth();
    loadSettings();
  }, [loadStoredAuth, loadSettings]);

  useLocationTracking();

  if (isLoading) {
    return null; // Splash screen is still visible
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister, maxAge: 1000 * 60 * 60 * 24 }}
    >
      <PaperProvider theme={theme}>
        <SafeAreaProvider>
          <OfflineBanner />
          {(isAuthenticated || !!token) && <TimerBanner />}
          <Stack screenOptions={{ headerShown: false }}>
            {isAuthenticated || token ? (
              <Stack.Screen name="(tabs)" />
            ) : (
              <Stack.Screen name="(auth)" />
            )}
            <Stack.Screen name="+not-found" options={{ title: 'Not Found' }} />
          </Stack>
          <StatusBar style="auto" />
        </SafeAreaProvider>
      </PaperProvider>
    </PersistQueryClientProvider>
  );
}
