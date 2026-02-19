import React, { useEffect, useCallback, useMemo } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { asyncStoragePersister } from '@/lib/query-persister';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { lightTheme, darkTheme } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { useAppSettingsStore } from '@/stores/appSettingsStore';
import { OfflineBanner } from '@/components/offline/OfflineBanner';
import { TimerBanner } from '@/components/time-tracking/TimerBanner';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { useAblyNotifications } from '@/hooks/useAblyNotifications';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { Alert } from 'react-native';
import 'react-native-reanimated';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      retry: 2,
    },
  },
});

/**
 * Inner shell that lives inside PersistQueryClientProvider so hooks
 * like useLocationTracking (which calls useQuery via useBusiness) have
 * access to the QueryClient.
 */
function AppShell() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  const handleInAppNotification = useMemo(
    () => (data: { title?: string; body?: string }) => {
      if (data.title || data.body) {
        Alert.alert(data.title || 'Notification', data.body || '');
      }
    },
    [],
  );

  useLocationTracking();
  useAblyNotifications(handleInAppNotification);
  usePushNotifications();
  useOfflineSync();

  return (
    <>
      <OfflineBanner />
      {isAuthenticated && user?.onboardingComplete && <TimerBanner />}
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="estimates" />
        <Stack.Screen name="invoices" />
        <Stack.Screen name="products" />
        <Stack.Screen name="team" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="corrections" />
        <Stack.Screen name="billing" />
        <Stack.Screen name="payments" />
        <Stack.Screen name="reports" />
        <Stack.Screen name="+not-found" options={{ title: 'Not Found' }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const router = useRouter();
  const segments = useSegments();
  const loadStoredAuth = useAuthStore((s) => s.loadStoredAuth);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const loadSettings = useAppSettingsStore((s) => s.loadSettings);

  const [fontsLoaded, fontError] = useFonts({
    'DMSerifText-Regular': require('../assets/fonts/DMSerifText-Regular.ttf'),
  });

  useEffect(() => {
    loadStoredAuth();
    loadSettings();
  }, [loadStoredAuth, loadSettings]);

  const fontsReady = fontsLoaded || !!fontError;

  const onLayoutReady = useCallback(async () => {
    if (fontsReady && !isLoading) {
      await SplashScreen.hideAsync();
    }
  }, [fontsReady, isLoading]);

  useEffect(() => {
    onLayoutReady();
  }, [onLayoutReady]);

  const user = useAuthStore((s) => s.user);

  // Redirect based on auth state (3-way: auth, onboarding, tabs)
  useEffect(() => {
    if (isLoading || !fontsReady) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Authenticated — check onboarding status
      if (user && !user.onboardingComplete) {
        router.replace('/(onboarding)/business-basics');
      } else {
        router.replace('/(tabs)');
      }
    } else if (isAuthenticated && !inOnboardingGroup && user && !user.onboardingComplete) {
      // Authenticated but hasn't completed onboarding — force into wizard
      router.replace('/(onboarding)/business-basics');
    }
  }, [isAuthenticated, segments, isLoading, fontsReady, router, user]);

  if (isLoading || !fontsReady) {
    return null; // Splash screen is still visible
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister, maxAge: 1000 * 60 * 60 * 24 }}
    >
      <PaperProvider theme={theme}>
        <SafeAreaProvider>
          <AppShell />
        </SafeAreaProvider>
      </PaperProvider>
    </PersistQueryClientProvider>
  );
}
