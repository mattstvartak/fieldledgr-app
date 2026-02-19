import React, { useCallback, useState } from 'react';
import { StyleSheet, View, FlatList, RefreshControl } from 'react-native';
import { Text, FAB, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { EstimateCard } from '@/components/estimates/EstimateCard';
import { FilterPills } from '@/components/ui/FilterPills';
import { useEstimates } from '@/hooks/useEstimates';
import type { Estimate, EstimateStatus } from '@/types/estimate';

type FilterOption = 'all' | 'draft' | 'sent' | 'accepted';

const filterOptions = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'accepted', label: 'Accepted' },
];

export default function EstimatesListScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [filter, setFilter] = useState<FilterOption>('all');
  const statusFilter: EstimateStatus | undefined = filter === 'all' ? undefined : (filter as EstimateStatus);
  const { data, isLoading, refetch, isRefetching } = useEstimates(statusFilter);

  const handlePress = useCallback(
    (estimate: Estimate) => {
      router.push(`/estimates/${estimate.id}`);
    },
    [router],
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <FilterPills
        options={filterOptions}
        selected={filter}
        onSelect={(v) => setFilter(v as FilterOption)}
      />

      <FlatList
        data={data?.docs ?? []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <EstimateCard estimate={item} onPress={handlePress} />}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={
          isLoading ? null : (
            <View style={styles.empty}>
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                No estimates found.
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
        onPress={() => router.push('/estimates/create')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  list: { paddingBottom: 80 },
  empty: { alignItems: 'center', paddingVertical: 48 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
