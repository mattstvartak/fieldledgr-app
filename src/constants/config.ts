import Constants from 'expo-constants';

const expoExtra = Constants.expoConfig?.extra ?? {};

export const config = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000',
  isDev: __DEV__,
  tokenStorageKey: 'fieldledgr_auth_token',
  refreshTokenStorageKey: 'fieldledgr_refresh_token',
  offlineQueueStorageKey: 'fieldledgr_offline_queue',
  easProjectId: expoExtra.eas?.projectId as string | undefined,
  maxRetries: 3,
  syncIntervalMs: 30_000, // 30 seconds
} as const;
