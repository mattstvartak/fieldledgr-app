import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { config } from '@/constants/config';
import { setCurrentPushToken } from '@/lib/push-token';

// Configure foreground notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function registerForPushNotificationsAsync(): Promise<string | null> {
  // Push notifications only work on physical devices
  if (!Device.isDevice) {
    console.log('[push] Must use physical device for push notifications');
    return null;
  }

  // Set up Android notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2A9D6E',
    });
  }

  // Check/request permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('[push] Permission not granted');
    return null;
  }

  // Get Expo push token
  const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
  if (!projectId) {
    console.error('[push] No EAS project ID found');
    return null;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
  return tokenData.data;
}

async function sendTokenToBackend(token: string): Promise<void> {
  try {
    const authToken = useAuthStore.getState().token;
    if (!authToken) return;

    await fetch(new URL('/api/register-push-token', config.apiUrl).toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        token,
        platform: Platform.OS === 'ios' ? 'ios' : 'android',
      }),
    });
  } catch (err) {
    console.error('[push] Failed to register token with backend:', err);
  }
}

export function usePushNotifications() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const tokenRef = useRef<string | null>(null);

  // Register for push notifications when authenticated
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    let isMounted = true;

    (async () => {
      const token = await registerForPushNotificationsAsync();
      if (!isMounted || !token) return;

      tokenRef.current = token;
      setCurrentPushToken(token);
      await sendTokenToBackend(token);
    })();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user?.id]);

  // Handle notification tap — navigate to relevant screen
  useEffect(() => {
    // Check if app was opened from a notification
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        handleNotificationTap(response, router);
      }
    });

    // Listen for notification taps while app is running
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      handleNotificationTap(response, router);
    });

    return () => subscription.remove();
  }, [router]);

  // Handle token refresh
  useEffect(() => {
    const subscription = Notifications.addPushTokenListener((newToken) => {
      const token = newToken.data;
      if (typeof token === 'string' && token !== tokenRef.current) {
        tokenRef.current = token;
        setCurrentPushToken(token);
        sendTokenToBackend(token);
      }
    });

    return () => subscription.remove();
  }, []);
}

function handleNotificationTap(
  response: Notifications.NotificationResponse,
  router: ReturnType<typeof useRouter>,
) {
  const data = response.notification.request.content.data as Record<string, unknown> | undefined;
  if (!data) return;

  const jobId = data.jobId as number | undefined;
  if (jobId) {
    router.push(`/(tabs)/jobs/${jobId}` as never);
  }
}
