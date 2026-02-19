import React, { useCallback, useState } from 'react';
import { StyleSheet, View, FlatList, RefreshControl } from 'react-native';
import { Text, SegmentedButtons, FAB, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { InvoiceCard } from '@/components/invoices/InvoiceCard';
import { useInvoices } from '@/hooks/useInvoices';
import type { Invoice, InvoiceStatus } from '@/types/invoice';

type FilterOption = 'all' | 'draft' | 'sent' | 'paid';

export default function InvoicesListScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [filter, setFilter] = useState<FilterOption>('all');
  const statusFilter: InvoiceStatus | undefined = filter === 'all' ? undefined : (filter as InvoiceStatus);
  const { data, isLoading, refetch, isRefetching } = useInvoices(statusFilter);

  const handlePress = useCallback(
    (invoice: Invoice) => {
      router.push(`/invoices/${invoice.id}`);
    },
    [router],
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={filter}
          onValueChange={(v) => setFilter(v as FilterOption)}
          buttons={[
            { value: 'all', label: 'All' },
            { value: 'draft', label: 'Draft' },
            { value: 'sent', label: 'Sent' },
            { value: 'paid', label: 'Paid' },
          ]}
        />
      </View>

      <FlatList
        data={data?.docs ?? []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <InvoiceCard invoice={item} onPress={handlePress} />}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={
          isLoading ? null : (
            <View style={styles.empty}>
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                No invoices found.
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
        onPress={() => router.push('/invoices/create')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  filterContainer: { paddingHorizontal: 16, paddingVertical: 8 },
  list: { paddingBottom: 80 },
  empty: { alignItems: 'center', paddingVertical: 48 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
