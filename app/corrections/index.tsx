import React from 'react';
import { StyleSheet, View, FlatList, RefreshControl, Alert } from 'react-native';
import { Text, Card, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';


import { LargeButton } from '@/components/ui/LargeButton';
import { usePendingCorrections, useApproveCorrection, useDenyCorrection } from '@/hooks/useCorrections';
import type { TimeCorrection } from '@/api/endpoints/corrections';

export default function CorrectionsScreen() {
  const theme = useTheme();
  const { data, isLoading, refetch, isRefetching } = usePendingCorrections();
  const approve = useApproveCorrection();
  const deny = useDenyCorrection();

  const handleApprove = (correction: TimeCorrection) => {
    Alert.alert('Approve correction?', correction.reason, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Approve', onPress: () => approve.mutateAsync({ id: correction.id }) },
    ]);
  };

  const handleDeny = (correction: TimeCorrection) => {
    Alert.alert('Deny correction?', correction.reason, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Deny', style: 'destructive', onPress: () => deny.mutateAsync({ id: correction.id }) },
    ]);
  };

  const getRequestedByName = (correction: TimeCorrection) => {
    if (typeof correction.requestedBy === 'object') {
      return `${correction.requestedBy.firstName} ${correction.requestedBy.lastName}`;
    }
    return `User #${correction.requestedBy}`;
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={data?.docs ?? []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Card style={styles.card} mode="elevated">
            <Card.Content style={styles.cardContent}>
              <Text variant="titleMedium" style={{ fontWeight: '600' }}>
                {getRequestedByName(item)}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {item.reason}
              </Text>
              {item.requestedClockIn && (
                <Text variant="bodySmall">
                  New clock-in: {new Date(item.requestedClockIn).toLocaleString()}
                </Text>
              )}
              {item.requestedClockOut && (
                <Text variant="bodySmall">
                  New clock-out: {new Date(item.requestedClockOut).toLocaleString()}
                </Text>
              )}
              <View style={styles.actions}>
                <LargeButton
                  label="Approve"
                  onPress={() => handleApprove(item)}
                  style={styles.actionButton}
                  contentStyle={styles.actionContent}
                />
                <LargeButton
                  label="Deny"
                  onPress={() => handleDeny(item)}
                  mode="outlined"
                  textColor={theme.colors.error}
                  style={styles.actionButton}
                  contentStyle={styles.actionContent}
                />
              </View>
            </Card.Content>
          </Card>
        )}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={
          isLoading ? null : (
            <View style={styles.empty}>
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                No pending corrections.
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
  safe: { flex: 1 },
  card: { marginHorizontal: 16, marginVertical: 4 },
  cardContent: { gap: 8 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  actionButton: { flex: 1 },
  actionContent: { minHeight: 40 },
  list: { paddingBottom: 24 },
  empty: { alignItems: 'center', paddingVertical: 48 },
});
