import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useAuthStore } from '@/stores/authStore';
import { config } from '@/constants/config';

let currentToken: string | null = null;

export function setCurrentPushToken(token: string | null) {
  currentToken = token;
}

export function getCurrentPushToken(): string | null {
  return currentToken;
}

/**
 * Unregisters the current push token from the backend.
 * Called during logout to stop receiving push notifications.
 * Best-effort — failures are logged but don't block logout.
 */
export async function unregisterPushToken(): Promise<void> {
  try {
    // Try to get the current token if we don't have it cached
    let token = currentToken;
    if (!token) {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
      if (projectId) {
        const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
        token = tokenData.data;
      }
    }

    if (!token) return;

    const authToken = useAuthStore.getState().token;
    if (!authToken) return;

    await fetch(new URL('/api/unregister-push-token', config.apiUrl).toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ token }),
    });

    currentToken = null;
  } catch (err) {
    console.error('[push] Failed to unregister token:', err);
  }
}
