import { useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';
import type { AppStateStatus } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { getAblyClient } from '@/lib/ably';
import type * as Ably from 'ably';

interface NotificationData {
  type?: string;
  title?: string;
  body?: string;
  jobId?: number;
}

export function useAblyNotifications(onInAppNotification?: (data: NotificationData) => void) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const channelRef = useRef<Ably.RealtimeChannel | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const enterPresence = useCallback(() => {
    try {
      channelRef.current?.presence.enter();
    } catch (err) {
      console.error('[ably] Failed to enter presence:', err);
    }
  }, []);

  const leavePresence = useCallback(() => {
    try {
      channelRef.current?.presence.leave();
    } catch (err) {
      console.error('[ably] Failed to leave presence:', err);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    let client: ReturnType<typeof getAblyClient> | null = null;

    try {
      client = getAblyClient();
      client.connect();
      const channel = client.channels.get(`user:${user.id}`);
      channelRef.current = channel;

      // Subscribe to notification events
      channel.subscribe('notification', (message: Ably.Message) => {
        const data = message.data as NotificationData;

        // Invalidate relevant caches for instant UI updates
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['unread-count'] });

        // Invalidate job-related queries if it's a job event
        if (data?.jobId) {
          queryClient.invalidateQueries({ queryKey: ['jobs'] });
          queryClient.invalidateQueries({ queryKey: ['jobs', data.jobId] });
        }

        // Show in-app notification if callback provided
        if (onInAppNotification && data) {
          onInAppNotification(data);
        }
      });

      // Enter presence if app is currently active
      if (AppState.currentState === 'active') {
        channel.presence.enter();
      }
    } catch (err) {
      console.error('[ably] Failed to connect:', err);
    }

    // Listen for app state changes to manage presence
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (appStateRef.current !== 'active' && nextState === 'active') {
        // App came to foreground — enter presence
        enterPresence();
      } else if (appStateRef.current === 'active' && nextState !== 'active') {
        // App went to background — leave presence
        leavePresence();
      }
      appStateRef.current = nextState;
    });

    return () => {
      subscription.remove();
      try {
        channelRef.current?.presence.leave();
        channelRef.current?.unsubscribe();
        channelRef.current = null;
      } catch {
        // ignore cleanup errors
      }
    };
  }, [isAuthenticated, user?.id, queryClient, onInAppNotification, enterPresence, leavePresence]);
}
