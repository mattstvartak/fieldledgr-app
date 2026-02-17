import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import {
  registerForPushNotifications,
  addNotificationReceivedListener,
  addNotificationResponseListener,
} from '@/lib/notifications';
import { notificationsApi } from '@/api/endpoints/notifications';
import { useAuthStore } from '@/stores/authStore';
import { useAppSettingsStore } from '@/stores/appSettingsStore';

export function useNotifications() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id) ?? 0;
  const numericUserId = typeof userId === 'string' ? Number(userId) : userId;
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const useMockData = useAppSettingsStore((s) => s.useMockData);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);
  const receivedListener = useRef<Notifications.EventSubscription | null>(null);

  // Register for push notifications on mount
  useEffect(() => {
    if (!isAuthenticated) return;

    registerForPushNotifications().then((token) => {
      if (token) {
        // TODO: send push token to backend: POST /api/users/push-token { token }
        console.log('[Notifications] Push token:', token);
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
      if (useMockData) return 2; // mock: 2 unread
      const result = await notificationsApi.getUnreadCount();
      return result.count;
    },
    enabled: isAuthenticated || useMockData,
    refetchInterval: 30_000, // poll every 30s
  });

  return {
    unreadCount: unreadQuery.data ?? 0,
  };
}
