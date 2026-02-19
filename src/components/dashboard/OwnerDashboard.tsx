import React from 'react';
import { StyleSheet, View, ScrollView, RefreshControl, Pressable } from 'react-native';
import { Text, Divider, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatCard } from '@/components/dashboard/StatCard';
import { JobCard } from '@/components/jobs/JobCard';
import { useAuthStore } from '@/stores/authStore';
import { useOwnerDashboard } from '@/hooks/useOwnerDashboard';
import { useAllJobs } from '@/hooks/useJobs';
import { formatDate } from '@/lib/formatting';
import type { Job } from '@/types/job';

export function OwnerDashboard() {
  const theme = useTheme();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: stats, isLoading, refetch, isRefetching } = useOwnerDashboard();
  const { data: recentJobsData, refetch: refetchJobs } = useAllJobs({ page: 1 });

  const recentJobs = (recentJobsData?.jobs ?? []).slice(0, 5);
  const today = new Date().toISOString();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const handleJobPress = (job: Job) => {
    router.push(`/jobs/${job.id}`);
  };

  const handleRefresh = () => {
    refetch();
    refetchJobs();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />}
      >
        <View style={styles.header}>
          <Text
            variant="headlineSmall"
            style={[styles.greeting, { color: theme.colors.onBackground }]}
          >
            {getGreeting()}, {user?.firstName ?? 'Owner'}
          </Text>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
            {formatDate(today)}
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            icon="briefcase-outline"
            label="Active Jobs"
            value={isLoading ? '...' : (stats?.activeJobs ?? 0)}
            onPress={() => router.push('/(tabs)/jobs')}
          />
          <StatCard
            icon="file-document-outline"
            label="Pending Estimates"
            value={isLoading ? '...' : (stats?.pendingEstimates ?? 0)}
            color="#1565C0"
            onPress={() => router.push('/estimates/')}
          />
          <StatCard
            icon="receipt"
            label="Unpaid Invoices"
            value={isLoading ? '...' : (stats?.unpaidInvoices ?? 0)}
            color="#E65100"
            onPress={() => router.push('/invoices/')}
          />
          <StatCard
            icon="cash"
            label="Monthly Revenue"
            value={isLoading ? '...' : formatCurrency(stats?.monthlyRevenue ?? 0)}
            color="#2E7D32"
          />
        </View>

        <Divider style={styles.divider} />

        <View style={styles.quickActions}>
          <Text
            variant="titleMedium"
            style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
          >
            Quick Actions
          </Text>
          <View style={styles.actionsRow}>
            <StatCard
              icon="plus-circle"
              label="New Job"
              value=""
              onPress={() => router.push('/(tabs)/jobs/create' as never)}
            />
            <StatCard
              icon="account-plus"
              label="New Customer"
              value=""
              onPress={() => router.push('/(tabs)/customers/create' as never)}
            />
          </View>
        </View>

        {recentJobs.length > 0 && (
          <>
            <Divider style={styles.divider} />

            <View style={styles.recentJobsSection}>
              <View style={styles.recentJobsHeader}>
                <Text
                  variant="titleMedium"
                  style={[styles.sectionTitle, { color: theme.colors.onBackground, marginBottom: 0 }]}
                >
                  Recent Jobs
                </Text>
                <Pressable onPress={() => router.push('/(tabs)/jobs')}>
                  <Text variant="labelLarge" style={{ color: theme.colors.primary }}>
                    View All
                  </Text>
                </Pressable>
              </View>

              <View style={styles.jobsList}>
                {recentJobs.map((job) => (
                  <JobCard key={job.id} job={job} onPress={handleJobPress} />
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
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
  scroll: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    gap: 4,
    marginBottom: 24,
  },
  greeting: {
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  divider: {
    marginVertical: 24,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  quickActions: {},
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  recentJobsSection: {},
  recentJobsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  jobsList: {
    marginHorizontal: -16,
  },
});
