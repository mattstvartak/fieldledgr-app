import React, { useCallback, useState } from 'react';
import { StyleSheet, View, FlatList, RefreshControl } from 'react-native';
import { Text, FAB, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { JobCard } from '@/components/jobs/JobCard';
import { JobCardSkeleton } from '@/components/ui/SkeletonLoader';
import { FilterPills } from '@/components/ui/FilterPills';
import { useJobs, useAllJobs } from '@/hooks/useJobs';
import { useAuthStore } from '@/stores/authStore';
import { isOwner as checkIsOwner } from '@/lib/roles';
import type { Job, JobStatus } from '@/types/job';

type TechFilterOption = 'today' | 'upcoming' | 'completed';
type OwnerFilterOption = 'active' | 'completed' | 'all';

const ownerFilterOptions = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'all', label: 'All' },
];

const techFilterOptions = [
  { value: 'today', label: 'Today' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
];

export default function JobsListScreen() {
  const theme = useTheme();
  const router = useRouter();
  const role = useAuthStore((s) => s.user?.role);
  const isOwner = checkIsOwner(role);
  const [techFilter, setTechFilter] = useState<TechFilterOption>('today');
  const [ownerFilter, setOwnerFilter] = useState<OwnerFilterOption>('active');

  const today = new Date().toISOString().split('T')[0];

  // Technician view
  const techStatusFilter: JobStatus | undefined = techFilter === 'completed' ? 'completed' : undefined;
  const techDateFilter = techFilter === 'today' ? today : undefined;
  const techQuery = useJobs(
    isOwner ? undefined : { status: techStatusFilter, date: techDateFilter },
  );

  // Owner view — "active" means everything except completed/canceled/paid
  const ownerQuery = useAllJobs(
    isOwner
      ? { status: ownerFilter === 'completed' ? 'completed' : undefined }
      : undefined,
  );

  const ownerJobs = React.useMemo(() => {
    if (!ownerQuery.data?.jobs) return [];
    if (ownerFilter === 'active') {
      return ownerQuery.data.jobs.filter(
        (j) => j.status !== 'completed' && j.status !== 'canceled' && j.status !== 'paid',
      );
    }
    return ownerQuery.data.jobs;
  }, [ownerQuery.data?.jobs, ownerFilter]);

  const techFilteredJobs = React.useMemo(() => {
    if (!techQuery.data) return [];
    if (techFilter === 'upcoming') {
      return techQuery.data.filter((j) => j.scheduledDate > today && j.status !== 'completed');
    }
    return techQuery.data;
  }, [techQuery.data, techFilter, today]);

  const jobs = isOwner ? ownerJobs : techFilteredJobs;
  const isLoading = isOwner ? ownerQuery.isLoading : techQuery.isLoading;
  const isRefetching = isOwner ? ownerQuery.isRefetching : techQuery.isRefetching;
  const refetch = isOwner ? ownerQuery.refetch : techQuery.refetch;

  const handleJobPress = useCallback(
    (job: Job) => {
      router.push(`/jobs/${job.id}`);
    },
    [router],
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.headerContainer}>
        <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onBackground }]}>
          {isOwner ? 'Jobs' : 'My Jobs'}
        </Text>
        {isOwner ? (
          <FilterPills
            options={ownerFilterOptions}
            selected={ownerFilter}
            onSelect={(val) => setOwnerFilter(val as OwnerFilterOption)}
          />
        ) : (
          <FilterPills
            options={techFilterOptions}
            selected={techFilter}
            onSelect={(val) => setTechFilter(val as TechFilterOption)}
          />
        )}
      </View>

      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <JobCard job={item} onPress={handleJobPress} />}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
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
                No jobs found.
              </Text>
            </View>
          )
        }
        contentContainerStyle={styles.list}
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary}
        onPress={() => router.push('/(tabs)/jobs/create' as never)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerContainer: { paddingTop: 16, paddingBottom: 8, gap: 4 },
  title: { fontWeight: '700', paddingHorizontal: 16 },
  list: { paddingBottom: 80 },
  empty: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
