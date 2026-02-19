import React, { useCallback, useState } from 'react';
import { StyleSheet, View, FlatList, RefreshControl } from 'react-native';
import { Text, Searchbar, FAB, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CustomerCard } from '@/components/customers/CustomerCard';
import { useCustomers } from '@/hooks/useCustomers';
import type { Customer } from '@/types/customer';

export default function CustomersListScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { data, isLoading, refetch, isRefetching } = useCustomers(search || undefined);

  const handlePress = useCallback(
    (customer: Customer) => {
      router.push(`/(tabs)/customers/${customer.id}` as never);
    },
    [router],
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search customers..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchbar}
        />
      </View>

      <FlatList
        data={data?.docs ?? []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <CustomerCard customer={item} onPress={handlePress} />}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={
          isLoading ? null : (
            <View style={styles.empty}>
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                {search ? 'No customers found.' : 'No customers yet. Add your first one!'}
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
        onPress={() => router.push('/(tabs)/customers/create' as never)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  searchContainer: { paddingHorizontal: 16, paddingVertical: 8 },
  searchbar: { elevation: 0 },
  list: { paddingBottom: 80 },
  empty: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
