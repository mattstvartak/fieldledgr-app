import React, { useCallback } from 'react';
import { StyleSheet, View, FlatList, RefreshControl } from 'react-native';
import { Text, Divider, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { JobCard } from '@/components/jobs/JobCard';
import { ClockButton } from '@/components/time-tracking/ClockButton';
import { JobCardSkeleton } from '@/components/ui/SkeletonLoader';
import { useTodayJobs } from '@/hooks/useJobs';
import { useAuthStore } from '@/stores/authStore';
import { formatDate } from '@/lib/formatting';
import type { Job } from '@/types/job';

export function TechnicianDashboard() {
  const theme = useTheme();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: jobs, isLoading, refetch, isRefetching } = useTodayJobs();

  const handleJobPress = useCallback(
    (job: Job) => {
      router.push(`/jobs/${job.id}`);
    },
    [router],
  );

  const today = new Date().toISOString();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <JobCard job={item} onPress={handleJobPress} />}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text
              variant="headlineSmall"
              style={[styles.greeting, { color: theme.colors.onBackground }]}
            >
              {getGreeting()}, {user?.firstName ?? 'Team Member'}
            </Text>
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
              {formatDate(today)}
            </Text>

            <View style={styles.clockSection}>
              <ClockButton />
            </View>

            <Divider style={styles.divider} />

            <Text
              variant="titleMedium"
              style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
            >
              Today&apos;s Jobs
            </Text>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View>
              <JobCardSkeleton />
              <JobCardSkeleton />
            </View>
          ) : (
            <View style={styles.empty}>
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                No jobs scheduled for today.
              </Text>
            </View>
          )
        }
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 4,
  },
  greeting: {
    fontWeight: '700',
  },
  clockSection: {
    marginTop: 16,
    marginBottom: 8,
  },
  divider: {
    marginVertical: 12,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  list: {
    paddingBottom: 24,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
});
