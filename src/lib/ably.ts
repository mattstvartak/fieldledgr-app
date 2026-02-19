import * as Ably from 'ably';
import * as SecureStore from 'expo-secure-store';
import { config } from '@/constants/config';

let client: Ably.Realtime | null = null;

export function getAblyClient(): Ably.Realtime {
  if (client) return client;

  client = new Ably.Realtime({
    autoConnect: false,
    authCallback: async (_params, callback) => {
      try {
        const token = await SecureStore.getItemAsync(config.tokenStorageKey);
        if (!token) {
          callback('No auth token available', null);
          return;
        }
        const res = await fetch(new URL('/api/ably/auth', config.apiUrl).toString(), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          callback(`Auth failed: ${res.status}`, null);
          return;
        }
        const tokenRequest = await res.json();
        callback(null, tokenRequest);
      } catch (err) {
        callback(err instanceof Error ? err.message : 'Auth callback failed', null);
      }
    },
  });

  return client;
}

export function closeAblyClient() {
  if (client) {
    client.close();
    client = null;
  }
}
