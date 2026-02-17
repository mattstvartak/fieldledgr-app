import React from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Text, Card, useTheme, Portal, Modal } from 'react-native-paper';
import MaterialIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LargeButton } from '@/components/ui/LargeButton';
import { useOfflineQueueStore, type QueuedAction } from '@/stores/offlineQueueStore';
import { formatRelative } from '@/lib/formatting';
import { touchTargets } from '@/constants/theme';

interface FailedSyncSheetProps {
  visible: boolean;
  onDismiss: () => void;
}

const ACTION_LABELS: Record<string, string> = {
  'clock-in': 'Clock In',
  'clock-out': 'Clock Out',
  'break-start': 'Start Break',
  'break-end': 'End Break',
  'status-update': 'Status Update',
  'add-note': 'Add Note',
  'add-photo': 'Add Photo',
};

export function FailedSyncSheet({ visible, onDismiss }: FailedSyncSheetProps) {
  const theme = useTheme();
  const failedItems = useOfflineQueueStore((s) => s.failedItems);
  const retryFailed = useOfflineQueueStore((s) => s.retryFailed);
  const discardFailed = useOfflineQueueStore((s) => s.discardFailed);

  const renderItem = ({ item }: { item: QueuedAction }) => (
    <Card style={styles.card} mode="outlined">
      <Card.Content style={styles.cardContent}>
        <View style={styles.info}>
          <MaterialIcons name="alert-circle" size={20} color={theme.colors.error} />
          <View style={{ flex: 1 }}>
            <Text variant="titleSmall" style={{ fontWeight: '600' }}>
              {ACTION_LABELS[item.type] ?? item.type}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Failed after {item.retryCount} retries — {formatRelative(item.timestamp)}
            </Text>
          </View>
        </View>
        <View style={styles.actions}>
          <LargeButton
            label="Retry"
            icon="refresh"
            onPress={() => retryFailed(item.id)}
            mode="outlined"
            compact
            style={styles.actionButton}
          />
          <LargeButton
            label="Discard"
            icon="delete"
            onPress={() => discardFailed(item.id)}
            mode="text"
            textColor={theme.colors.error}
            compact
            style={styles.actionButton}
          />
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.header}>
          <Text variant="titleLarge" style={{ fontWeight: '700' }}>
            Failed Sync Items
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            These actions could not be synced after multiple retries.
          </Text>
        </View>

        {failedItems.length === 0 ? (
          <View style={styles.empty}>
            <MaterialIcons name="check-circle" size={48} color={theme.colors.primary} />
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, marginTop: 12 }}>
              No failed items
            </Text>
          </View>
        ) : (
          <FlatList
            data={failedItems}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
          />
        )}

        <View style={styles.footer}>
          <LargeButton label="Close" onPress={onDismiss} mode="outlined" />
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 16,
    borderRadius: 16,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  header: {
    padding: 20,
    gap: 4,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  card: {
    marginVertical: 4,
    borderRadius: 10,
  },
  cardContent: {
    gap: 10,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    minHeight: touchTargets.minimum,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footer: {
    padding: 16,
  },
});
