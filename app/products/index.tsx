import React, { useState } from 'react';
import { StyleSheet, View, FlatList, RefreshControl } from 'react-native';
import { Text, Searchbar, FAB, Card, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useProducts } from '@/hooks/useProducts';
import type { Product } from '@/types/product';

export default function ProductsListScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { data, isLoading, refetch, isRefetching } = useProducts(search || undefined);

  const handlePress = (product: Product) => {
    router.push(`/products/${product.id}`);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <View style={styles.searchContainer}>
        <Searchbar placeholder="Search products..." value={search} onChangeText={setSearch} />
      </View>

      <FlatList
        data={data?.docs ?? []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Card style={styles.card} onPress={() => handlePress(item)} mode="elevated">
            <Card.Content>
              <Text variant="titleMedium" style={{ fontWeight: '600' }}>
                {item.name}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                ${item.unitPrice.toFixed(2)}
                {item.unit ? ` / ${item.unit}` : ''}
              </Text>
              {item.description && (
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }} numberOfLines={2}>
                  {item.description}
                </Text>
              )}
            </Card.Content>
          </Card>
        )}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={
          isLoading ? null : (
            <View style={styles.empty}>
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                No products found.
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
        onPress={() => router.push('/products/create' as never)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  searchContainer: { paddingHorizontal: 16, paddingVertical: 8 },
  card: { marginHorizontal: 16, marginVertical: 4 },
  list: { paddingBottom: 80 },
  empty: { alignItems: 'center', paddingVertical: 48 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
