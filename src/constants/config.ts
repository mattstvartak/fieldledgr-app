import Constants from 'expo-constants';

const expoExtra = Constants.expoConfig?.extra ?? {};

function getDevApiUrl(): string {
  // Expo's hostUri gives us the dev machine's LAN IP (e.g. "192.168.1.50:8081")
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:3000`;
  }
  return 'http://localhost:3000';
}

export const config = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? (__DEV__ ? getDevApiUrl() : 'https://fieldledger.com'),
  isDev: __DEV__,
  tokenStorageKey: 'fieldledgr_auth_token',
  refreshTokenStorageKey: 'fieldledgr_refresh_token',
  offlineQueueStorageKey: 'fieldledgr_offline_queue',
  easProjectId: expoExtra.eas?.projectId as string | undefined,
  maxRetries: 3,
  syncIntervalMs: 30_000, // 30 seconds
} as const;
