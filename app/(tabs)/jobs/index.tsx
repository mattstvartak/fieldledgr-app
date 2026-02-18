import React, { useCallback, useState } from 'react';
import { StyleSheet, View, FlatList, RefreshControl } from 'react-native';
import { Text, SegmentedButtons, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { JobCard } from '@/components/jobs/JobCard';
import { JobCardSkeleton } from '@/components/ui/SkeletonLoader';
import { useJobs } from '@/hooks/useJobs';
import type { Job, JobStatus } from '@/types/job';

type FilterOption = 'today' | 'upcoming' | 'completed';

export default function JobsListScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [filter, setFilter] = useState<FilterOption>('today');

  const today = new Date().toISOString().split('T')[0];

  const statusFilter: JobStatus | undefined = filter === 'completed' ? 'completed' : undefined;
  const dateFilter = filter === 'today' ? today : undefined;

  const { data: jobs, isLoading, refetch, isRefetching } = useJobs({
    status: statusFilter,
    date: dateFilter,
  });

  // For 'upcoming', filter client-side to exclude today and completed
  const filteredJobs = React.useMemo(() => {
    if (!jobs) return [];
    if (filter === 'upcoming') {
      return jobs.filter((j) => j.scheduledDate > today && j.status !== 'completed');
    }
    return jobs;
  }, [jobs, filter, today]);

  const handleJobPress = useCallback(
    (job: Job) => {
      router.push(`/jobs/${job.id}`);
    },
    [router]
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.headerContainer}>
        <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onBackground }]}>
          My Jobs
        </Text>
        <SegmentedButtons
          value={filter}
          onValueChange={(val) => setFilter(val as FilterOption)}
          buttons={[
            { value: 'today', label: 'Today' },
            { value: 'upcoming', label: 'Upcoming' },
            { value: 'completed', label: 'Completed' },
          ]}
          style={styles.filter}
        />
      </View>

      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <JobCard job={item} onPress={handleJobPress} />}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        ListEmptyComponent={
          isLoading ? (
            <View>
              <JobCardSkeleton />
              <JobCardSkeleton />
              <JobCardSkeleton />
            </View>
          ) : (
            <View style={styles.empty}>
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                No {filter} jobs found.
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
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
  },
  title: {
    fontWeight: '700',
  },
  filter: {
    alignSelf: 'stretch',
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
