import React from 'react';
import { StyleSheet, View, FlatList, RefreshControl } from 'react-native';
import { Text, Card, useTheme, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { notificationsApi, type AppNotification } from '@/api/endpoints/notifications';
import { formatRelative } from '@/lib/formatting';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { touchTargets } from '@/constants/theme';

const NOTIFICATION_ICONS: Record<AppNotification['type'], string> = {
  job_assigned: 'clipboard-plus',
  schedule_change: 'calendar-alert',
  message: 'message-text',
  reminder: 'bell-ring',
  correction_approved: 'check-circle',
  correction_denied: 'close-circle',
};

export default function NotificationsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id) ?? 0;
  const numericUserId = typeof userId === 'string' ? Number(userId) : userId;

  const { data: notifications, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['notifications', numericUserId],
    queryFn: async () => {
      const result = await notificationsApi.getNotifications(numericUserId);
      return result.docs;
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await notificationsApi.markAsRead(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const handlePress = (notification: AppNotification) => {
    if (!notification.read) {
      markReadMutation.mutate(notification.id);
    }
    if (notification.job) {
      router.push(`/jobs/${notification.job}` as never);
    }
  };

  const renderNotification = ({ item }: { item: AppNotification }) => (
    <Card
      style={[
        styles.card,
        {
          backgroundColor: item.read ? theme.colors.surface : `${theme.colors.primary}08`,
        },
      ]}
      mode="outlined"
      onPress={() => handlePress(item)}
    >
      <Card.Content style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <MaterialIcons
            name={NOTIFICATION_ICONS[item.type] as keyof typeof MaterialIcons.glyphMap}
            size={24}
            color={item.read ? theme.colors.onSurfaceVariant : theme.colors.primary}
          />
        </View>
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            {!item.read && (
              <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} />
            )}
            <Text
              variant="titleSmall"
              style={{ fontWeight: item.read ? '400' : '700', color: theme.colors.onSurface, flex: 1 }}
            >
              {item.title}
            </Text>
          </View>
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurfaceVariant }}
            numberOfLines={2}
          >
            {item.body}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
            {formatRelative(item.createdAt)}
          </Text>
        </View>
        {item.job && (
          <IconButton
            icon="chevron-right"
            size={20}
            onPress={() => handlePress(item)}
            accessibilityLabel="View job"
            style={{ minWidth: touchTargets.minimum, minHeight: touchTargets.minimum }}
          />
        )}
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderNotification}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onBackground }]}>
              Notifications
            </Text>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingContainer}>
              <SkeletonLoader height={80} />
              <SkeletonLoader height={80} style={{ marginTop: 12 }} />
              <SkeletonLoader height={80} style={{ marginTop: 12 }} />
            </View>
          ) : (
            <View style={styles.empty}>
              <MaterialIcons name="bell-check-outline" size={48} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, marginTop: 12 }}>
                You&apos;re all caught up!
              </Text>
            </View>
          )
        }
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontWeight: '700',
  },
  list: {
    paddingBottom: 24,
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  loadingContainer: {
    padding: 16,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 64,
  },
});
