import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import {
  registerForPushNotifications,
  addNotificationReceivedListener,
  addNotificationResponseListener,
} from '@/lib/notifications';
import { Platform } from 'react-native';
import { notificationsApi } from '@/api/endpoints/notifications';
import { apiClient } from '@/api/client';
import { useAuthStore } from '@/stores/authStore';

export function useNotifications() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id) ?? 0;
  const numericUserId = typeof userId === 'string' ? Number(userId) : userId;
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);
  const receivedListener = useRef<Notifications.EventSubscription | null>(null);

  // Register for push notifications on mount
  useEffect(() => {
    if (!isAuthenticated) return;

    registerForPushNotifications().then((token) => {
      if (token) {
        const platform = Platform.OS === 'ios' ? 'ios' : 'android';
        apiClient
          .post('/api/users/push-token', { token, platform })
          .catch(() => {
            // Best-effort — silently swallow errors
          });
      }
    });

    // Handle notification received while app is foregrounded
    receivedListener.current = addNotificationReceivedListener(() => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    });

    // Handle user tapping on a notification
    responseListener.current = addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;
      if (data?.jobId) {
        router.push(`/jobs/${data.jobId}`);
      }
    });

    return () => {
      receivedListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [isAuthenticated, queryClient, router]);

  // Poll for unread count
  const unreadQuery = useQuery({
    queryKey: ['unread-count', numericUserId],
    queryFn: async () => {
      const result = await notificationsApi.getUnreadCount();
      return result.count;
    },
    enabled: isAuthenticated,
    refetchInterval: 30_000, // poll every 30s
  });

  return {
    unreadCount: unreadQuery.data ?? 0,
  };
}
